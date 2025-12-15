import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DRGREEN_API_URL = "https://api.drgreennft.com/api/v1";

// Sign payload using the private key (simplified for now)
async function signPayload(payload: string, privateKey: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload + privateKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return base64Encode(hashBuffer);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("Signing error:", error);
    throw new Error(`Failed to sign payload: ${message}`);
  }
}

// Make authenticated request to Dr Green API
async function drGreenRequest(
  endpoint: string,
  method: string,
  body?: object
): Promise<Response> {
  const apiKey = Deno.env.get("DRGREEN_API_KEY");
  const privateKey = Deno.env.get("DRGREEN_PRIVATE_KEY");
  
  if (!apiKey || !privateKey) {
    throw new Error("Dr Green API credentials not configured");
  }
  
  const payload = body ? JSON.stringify(body) : "";
  const signature = await signPayload(payload, privateKey);
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-auth-apikey": apiKey,
    "x-auth-signature": signature,
  };
  
  const url = `${DRGREEN_API_URL}${endpoint}`;
  console.log(`Dr Green API request: ${method} ${url}`);
  
  const response = await fetch(url, {
    method,
    headers,
    body: payload || undefined,
  });
  
  return response;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    
    // Remove "drgreen-proxy" from path
    const apiPath = pathParts.slice(1).join("/");
    
    let body;
    if (req.method !== "GET" && req.method !== "HEAD") {
      try {
        body = await req.json();
      } catch {
        body = undefined;
      }
    }
    
    // Route handling
    const action = body?.action || apiPath;
    
    console.log(`Processing action: ${action}`, { method: req.method, body });
    
    let response: Response;
    
    switch (action) {
      // Client operations
      case "create-client": {
        response = await drGreenRequest("/clients", "POST", body.data);
        break;
      }
      
      case "get-client": {
        response = await drGreenRequest(`/clients/${body.clientId}`, "GET");
        break;
      }
      
      case "update-client": {
        response = await drGreenRequest(`/clients/${body.clientId}`, "PUT", body.data);
        break;
      }
      
      // Strain/Product operations
      case "get-strains": {
        const countryCode = body?.countryCode || "PRT";
        console.log(`Fetching strains for country: ${countryCode}`);
        response = await drGreenRequest(`/strains?countryCode=${countryCode}`, "GET");
        break;
      }
      
      case "get-all-strains": {
        // Fetch all strains without country filtering (global catalog)
        console.log("Fetching all strains (no country filter)");
        response = await drGreenRequest("/strains", "GET");
        break;
      }
      
      case "get-strain": {
        response = await drGreenRequest(`/strains/${body.strainId}`, "GET");
        break;
      }
      
      // Cart operations
      case "create-cart": {
        response = await drGreenRequest("/carts", "POST", body.data);
        break;
      }
      
      case "update-cart": {
        response = await drGreenRequest(`/carts/${body.cartId}`, "PUT", body.data);
        break;
      }
      
      case "get-cart": {
        response = await drGreenRequest(`/carts/${body.cartId}`, "GET");
        break;
      }
      
      // Order operations
      case "create-order": {
        response = await drGreenRequest("/orders", "POST", body.data);
        break;
      }
      
      case "get-order": {
        response = await drGreenRequest(`/orders/${body.orderId}`, "GET");
        break;
      }
      
      case "update-order": {
        response = await drGreenRequest(`/orders/${body.orderId}`, "PATCH", body.data);
        break;
      }
      
      case "get-orders": {
        response = await drGreenRequest(`/orders?clientId=${body.clientId}`, "GET");
        break;
      }
      
      // Payment operations
      case "create-payment": {
        response = await drGreenRequest("/payments", "POST", body.data);
        break;
      }
      
      case "get-payment": {
        response = await drGreenRequest(`/payments/${body.paymentId}`, "GET");
        break;
      }
      
      default:
        return new Response(
          JSON.stringify({ error: "Unknown action", action }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
    
    const data = await response.json();
    console.log(`Dr Green API response:`, { status: response.status, data });
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("Dr Green proxy error:", error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
