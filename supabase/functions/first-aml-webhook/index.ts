import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature, x-first-aml-signature',
};

/**
 * First AML Webhook Handler
 * 
 * Receives verification status updates from First AML and updates drgreen_clients accordingly.
 * 
 * Expected payload structure (based on First AML webhook format):
 * {
 *   "event": "verification.completed" | "verification.failed" | "verification.pending",
 *   "caseId": "string",
 *   "clientEmail": "string",
 *   "clientId": "string", // Dr Green client ID
 *   "status": "VERIFIED" | "REJECTED" | "PENDING" | "IN_PROGRESS",
 *   "timestamp": "ISO8601 string",
 *   "details": {
 *     "verificationLevel": "string",
 *     "riskScore": number,
 *     "notes": "string"
 *   }
 * }
 */

interface FirstAmlWebhookPayload {
  event: string;
  caseId?: string;
  clientEmail?: string;
  clientId?: string;
  status: string;
  timestamp?: string;
  details?: {
    verificationLevel?: string;
    riskScore?: number;
    notes?: string;
  };
  // Alternative field names used by some First AML versions
  case_id?: string;
  client_email?: string;
  client_id?: string;
  verification_status?: string;
}

// Map First AML status to our internal status
function mapStatus(status: string): { isKycVerified: boolean; adminApproval: string } {
  const normalizedStatus = status?.toUpperCase() || '';
  
  switch (normalizedStatus) {
    case 'VERIFIED':
    case 'APPROVED':
    case 'COMPLETED':
    case 'PASSED':
      return { isKycVerified: true, adminApproval: 'VERIFIED' };
    
    case 'REJECTED':
    case 'FAILED':
    case 'DECLINED':
      return { isKycVerified: false, adminApproval: 'REJECTED' };
    
    case 'PENDING':
    case 'IN_PROGRESS':
    case 'PROCESSING':
    case 'AWAITING':
      return { isKycVerified: false, adminApproval: 'PENDING' };
    
    default:
      console.log(`[first-aml-webhook] Unknown status: ${status}, treating as PENDING`);
      return { isKycVerified: false, adminApproval: 'PENDING' };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[first-aml-webhook] ========== WEBHOOK RECEIVED ==========");
  console.log("[first-aml-webhook] Timestamp:", new Date().toISOString());
  console.log("[first-aml-webhook] Method:", req.method);
  
  // Log headers for debugging (redact sensitive ones)
  const headers = Object.fromEntries(req.headers.entries());
  console.log("[first-aml-webhook] Headers:", JSON.stringify({
    'content-type': headers['content-type'],
    'x-webhook-signature': headers['x-webhook-signature'] ? '[PRESENT]' : '[MISSING]',
    'x-first-aml-signature': headers['x-first-aml-signature'] ? '[PRESENT]' : '[MISSING]',
    'user-agent': headers['user-agent'],
  }));

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      console.log("[first-aml-webhook] Rejected: Method not allowed");
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the webhook payload
    const rawBody = await req.text();
    console.log("[first-aml-webhook] Raw body length:", rawBody.length);
    console.log("[first-aml-webhook] Raw body preview:", rawBody.slice(0, 500));

    let payload: FirstAmlWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      console.error("[first-aml-webhook] Failed to parse JSON:", e);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("[first-aml-webhook] Parsed payload:", JSON.stringify({
      event: payload.event,
      status: payload.status || payload.verification_status,
      caseId: payload.caseId || payload.case_id,
      clientEmail: payload.clientEmail ? '[REDACTED]' : undefined,
      clientId: payload.clientId || payload.client_id,
    }));

    // Normalize field names (handle snake_case vs camelCase)
    const normalizedPayload = {
      event: payload.event,
      caseId: payload.caseId || payload.case_id,
      clientEmail: payload.clientEmail || payload.client_email,
      clientId: payload.clientId || payload.client_id,
      status: payload.status || payload.verification_status || 'PENDING',
      timestamp: payload.timestamp || new Date().toISOString(),
      details: payload.details,
    };

    // Validate we have at least one identifier
    if (!normalizedPayload.clientEmail && !normalizedPayload.clientId) {
      console.error("[first-aml-webhook] No client identifier provided");
      return new Response(
        JSON.stringify({ error: 'Missing client identifier (clientEmail or clientId)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the client record
    let query = supabase.from('drgreen_clients').select('*');
    
    if (normalizedPayload.clientId) {
      // Try matching by drgreen_client_id first
      query = query.eq('drgreen_client_id', normalizedPayload.clientId);
    } else if (normalizedPayload.clientEmail) {
      // Fall back to email matching
      query = query.eq('email', normalizedPayload.clientEmail.toLowerCase());
    }

    const { data: clients, error: fetchError } = await query;

    if (fetchError) {
      console.error("[first-aml-webhook] Database query error:", fetchError);
      return new Response(
        JSON.stringify({ error: 'Database query failed', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!clients || clients.length === 0) {
      console.warn("[first-aml-webhook] No matching client found");
      console.log("[first-aml-webhook] Searched by:", {
        clientId: normalizedPayload.clientId || 'N/A',
        email: normalizedPayload.clientEmail ? '[REDACTED]' : 'N/A',
      });
      
      // Return 200 to acknowledge receipt even if client not found
      // This prevents First AML from retrying indefinitely
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Client not found, webhook acknowledged',
          searchedBy: normalizedPayload.clientId ? 'clientId' : 'email'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const client = clients[0];
    console.log("[first-aml-webhook] Found client:", {
      id: client.id,
      drgreen_client_id: client.drgreen_client_id,
      current_kyc_status: client.is_kyc_verified,
      current_admin_approval: client.admin_approval,
    });

    // Map the status
    const { isKycVerified, adminApproval } = mapStatus(normalizedPayload.status);
    
    console.log("[first-aml-webhook] Status mapping:", {
      incomingStatus: normalizedPayload.status,
      mappedKycVerified: isKycVerified,
      mappedAdminApproval: adminApproval,
    });

    // Update the client record
    const { data: updatedClient, error: updateError } = await supabase
      .from('drgreen_clients')
      .update({
        is_kyc_verified: isKycVerified,
        admin_approval: adminApproval,
        updated_at: new Date().toISOString(),
      })
      .eq('id', client.id)
      .select()
      .single();

    if (updateError) {
      console.error("[first-aml-webhook] Failed to update client:", updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update client', details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("[first-aml-webhook] Client updated successfully:", {
      id: updatedClient.id,
      is_kyc_verified: updatedClient.is_kyc_verified,
      admin_approval: updatedClient.admin_approval,
    });

    // Log the event to kyc_journey_logs
    const { error: logError } = await supabase
      .from('kyc_journey_logs')
      .insert({
        user_id: client.user_id,
        client_id: client.drgreen_client_id,
        event_type: normalizedPayload.event || `status_update_${adminApproval.toLowerCase()}`,
        event_source: 'first_aml_webhook',
        event_data: {
          caseId: normalizedPayload.caseId,
          previousStatus: {
            is_kyc_verified: client.is_kyc_verified,
            admin_approval: client.admin_approval,
          },
          newStatus: {
            is_kyc_verified: isKycVerified,
            admin_approval: adminApproval,
          },
          rawStatus: normalizedPayload.status,
          details: normalizedPayload.details,
          timestamp: normalizedPayload.timestamp,
        },
      });

    if (logError) {
      // Log the error but don't fail the webhook
      console.warn("[first-aml-webhook] Failed to log journey event:", logError);
    } else {
      console.log("[first-aml-webhook] Journey event logged successfully");
    }

    console.log("[first-aml-webhook] ========== WEBHOOK COMPLETE ==========");

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Client verification status updated',
        clientId: client.drgreen_client_id,
        isKycVerified,
        adminApproval,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("[first-aml-webhook] Unhandled error:", error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
