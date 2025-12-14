import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
};

// Verify webhook signature from Dr Green API
async function verifyWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload + secret);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Compare signatures (timing-safe comparison would be better in production)
    return hashHex === signature || btoa(String.fromCharCode(...new Uint8Array(hashBuffer))) === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

interface WebhookPayload {
  event: string;
  orderId: string;
  status?: string;
  paymentStatus?: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const rawPayload = await req.text();
    const signature = req.headers.get('x-webhook-signature') || '';
    const privateKey = Deno.env.get("DRGREEN_PRIVATE_KEY");

    // Verify webhook signature if provided
    if (privateKey && signature) {
      const isValid = await verifyWebhookSignature(rawPayload, signature, privateKey);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const payload: WebhookPayload = JSON.parse(rawPayload);
    console.log('Received webhook:', payload);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different webhook events
    switch (payload.event) {
      case 'order.status_updated':
      case 'order.updated': {
        // Update local order status
        const updates: Record<string, string> = {};
        if (payload.status) updates.status = payload.status;
        if (payload.paymentStatus) updates.payment_status = payload.paymentStatus;

        if (Object.keys(updates).length > 0) {
          const { error } = await supabase
            .from('drgreen_orders')
            .update(updates)
            .eq('drgreen_order_id', payload.orderId);

          if (error) {
            console.error('Error updating order:', error);
          } else {
            console.log(`Order ${payload.orderId} updated:`, updates);
          }
        }
        break;
      }

      case 'order.shipped': {
        const { error } = await supabase
          .from('drgreen_orders')
          .update({ status: 'SHIPPED' })
          .eq('drgreen_order_id', payload.orderId);

        if (error) {
          console.error('Error updating order to shipped:', error);
        } else {
          console.log(`Order ${payload.orderId} marked as shipped`);
        }
        break;
      }

      case 'order.delivered': {
        const { error } = await supabase
          .from('drgreen_orders')
          .update({ status: 'DELIVERED' })
          .eq('drgreen_order_id', payload.orderId);

        if (error) {
          console.error('Error updating order to delivered:', error);
        } else {
          console.log(`Order ${payload.orderId} marked as delivered`);
        }
        break;
      }

      case 'order.cancelled': {
        const { error } = await supabase
          .from('drgreen_orders')
          .update({ status: 'CANCELLED' })
          .eq('drgreen_order_id', payload.orderId);

        if (error) {
          console.error('Error updating order to cancelled:', error);
        } else {
          console.log(`Order ${payload.orderId} cancelled`);
        }
        break;
      }

      case 'payment.completed': {
        const { error } = await supabase
          .from('drgreen_orders')
          .update({ payment_status: 'PAID' })
          .eq('drgreen_order_id', payload.orderId);

        if (error) {
          console.error('Error updating payment status:', error);
        } else {
          console.log(`Payment for order ${payload.orderId} completed`);
        }
        break;
      }

      case 'payment.failed': {
        const { error } = await supabase
          .from('drgreen_orders')
          .update({ payment_status: 'FAILED' })
          .eq('drgreen_order_id', payload.orderId);

        if (error) {
          console.error('Error updating payment status to failed:', error);
        } else {
          console.log(`Payment for order ${payload.orderId} failed`);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${payload.event}`);
    }

    return new Response(
      JSON.stringify({ success: true, event: payload.event }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
