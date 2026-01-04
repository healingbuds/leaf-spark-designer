import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Log level configuration - defaults to INFO in production
const LOG_LEVEL = Deno.env.get('LOG_LEVEL') || 'INFO';
const LOG_LEVELS: Record<string, number> = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

function shouldLog(level: string): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[LOG_LEVEL];
}

// Sanitized logging - never log sensitive data in production
function logDebug(message: string, data?: Record<string, unknown>) {
  if (shouldLog('DEBUG')) {
    console.log(`[Debug] ${message}`, data ? sanitizeForLogging(data) : '');
  }
}

function logInfo(message: string, data?: Record<string, unknown>) {
  if (shouldLog('INFO')) {
    console.log(`[Info] ${message}`, data ? sanitizeForLogging(data) : '');
  }
}

function logWarn(message: string, data?: Record<string, unknown>) {
  if (shouldLog('WARN')) {
    console.warn(`[Warn] ${message}`, data ? sanitizeForLogging(data) : '');
  }
}

function logError(message: string, data?: Record<string, unknown>) {
  if (shouldLog('ERROR')) {
    console.error(`[Error] ${message}`, data ? sanitizeForLogging(data) : '');
  }
}

// Sanitize data for logging - redact sensitive fields
function sanitizeForLogging(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = [
    'email', 'phone', 'contactNumber', 'firstName', 'lastName', 
    'dob', 'dateOfBirth', 'address', 'signature', 'apikey', 'token',
    'medicalRecord', 'medicalHistory', 'password', 'secret', 'key',
    'shipping', 'kycLink', 'payload'
  ];
  
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveFields.some(f => lowerKey.includes(f.toLowerCase()));
    
    if (isSensitive) {
      if (typeof value === 'string') {
        sanitized[key] = value.length > 6 ? `${value.slice(0, 3)}***${value.slice(-3)}` : '***';
      } else {
        sanitized[key] = '[REDACTED]';
      }
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = '[Object]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Admin-only actions that require admin role
const ADMIN_ACTIONS = [
  'dashboard-summary', 'dashboard-analytics', 'sales-summary',
  'dapp-clients', 'dapp-client-details', 'dapp-verify-client',
  'dapp-orders', 'dapp-order-details', 'dapp-update-order',
  'dapp-carts', 'dapp-nfts', 'dapp-strains', 'dapp-clients-list',
  'update-order', 'update-client'
];

// Actions that require ownership verification (user must own the resource)
const OWNERSHIP_ACTIONS = [
  'get-client', 'get-cart-legacy', 'get-cart',
  'add-to-cart', 'remove-from-cart', 'empty-cart',
  'place-order', 'get-order', 'get-orders'
];

// Public actions that don't require authentication (minimal - only webhooks/health)
const PUBLIC_ACTIONS: string[] = [];

// Country-gated actions: open countries (ZA, TH) don't require auth, restricted (GB, PT) do
const COUNTRY_GATED_ACTIONS = [
  'get-strains', 'get-all-strains', 'get-strains-legacy', 'get-strain'
];

// Open countries where unauthenticated users can browse products
const OPEN_COUNTRIES = ['ZAF', 'THA'];

// Authenticated but no ownership check needed
const AUTH_ONLY_ACTIONS: string[] = [];

/**
 * Input validation schemas
 */
function validateClientId(clientId: unknown): boolean {
  return typeof clientId === 'string' && clientId.length > 0 && clientId.length <= 100;
}

function validateCountryCode(code: unknown): boolean {
  const validCodes = ['PT', 'PRT', 'GB', 'GBR', 'ZA', 'ZAF', 'TH', 'THA', 'US', 'USA'];
  return typeof code === 'string' && (validCodes.includes(code.toUpperCase()) || code.length === 0);
}

function validatePagination(page: unknown, take: unknown): boolean {
  const pageNum = Number(page);
  const takeNum = Number(take);
  return (!page || (pageNum >= 1 && pageNum <= 1000)) && 
         (!take || (takeNum >= 1 && takeNum <= 100));
}

function validateEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function validateStringLength(value: unknown, maxLength: number): boolean {
  return typeof value === 'string' && value.length <= maxLength;
}

/**
 * Verify user authentication and return user data
 */
async function verifyAuthentication(req: Request): Promise<{ user: any; supabaseClient: any } | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return null;
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error || !user) {
    return null;
  }

  return { user, supabaseClient };
}

/**
 * Check if user has admin role
 */
async function isAdmin(supabaseClient: any, userId: string): Promise<boolean> {
  const { data } = await supabaseClient
    .rpc('has_role', { _user_id: userId, _role: 'admin' });
  return !!data;
}

/**
 * Verify user owns the client resource
 */
async function verifyClientOwnership(
  supabaseClient: any, 
  userId: string, 
  clientId: string
): Promise<boolean> {
  const { data, error } = await supabaseClient
    .from('drgreen_clients')
    .select('user_id')
    .eq('drgreen_client_id', clientId)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return data.user_id === userId;
}

// Use production API
const DRGREEN_API_URL = "https://api.drgreennft.com/api/v1";

// API timeout in milliseconds (20 seconds)
const API_TIMEOUT_MS = 20000;

/**
 * Sign payload using HMAC-SHA256 (matching WordPress legacy)
 * Uses native Web Crypto API
 * This is used for POST requests and singular GET requests (Method A)
 */
async function signPayload(payload: string, secretKey: string): Promise<string> {
  const encoder = new TextEncoder();
  
  // Import the secret key for HMAC
  const keyData = encoder.encode(secretKey);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  // Sign the payload
  const payloadData = encoder.encode(payload);
  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, payloadData);
  
  // Convert ArrayBuffer to base64 string
  const signatureBytes = new Uint8Array(signatureBuffer);
  let binary = '';
  for (let i = 0; i < signatureBytes.byteLength; i++) {
    binary += String.fromCharCode(signatureBytes[i]);
  }
  return btoa(binary);
}

/**
 * Sign query string using HMAC-SHA256 (matching WordPress legacy)
 * This is used for GET list endpoints (Method B)
 */
async function signQueryString(queryString: string, secretKey: string): Promise<string> {
  return signPayload(queryString, secretKey);
}

/**
 * Make authenticated request to Dr Green API with body signing (Method A)
 * Used for: POST, DELETE, and singular GET endpoints
 */
async function drGreenRequestBody(
  endpoint: string,
  method: string,
  body?: object
): Promise<Response> {
  const apiKey = Deno.env.get("DRGREEN_API_KEY");
  const secretKey = Deno.env.get("DRGREEN_PRIVATE_KEY");
  
  if (!apiKey || !secretKey) {
    throw new Error("Dr Green API credentials not configured");
  }
  
  const payload = body ? JSON.stringify(body) : "";
  const signature = await signPayload(payload, secretKey);
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-auth-apikey": apiKey,
    "x-auth-signature": signature,
  };
  
  const url = `${DRGREEN_API_URL}${endpoint}`;
  logInfo(`API request: ${method} ${endpoint}`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: method !== "GET" && method !== "HEAD" ? payload : undefined,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('API request timed out. Please try again.');
    }
    throw error;
  }
}

/**
 * Make authenticated request to Dr Green API with query string signing (Method B)
 * Used for: GET list endpoints (strains list, carts list, etc.)
 */
async function drGreenRequestQuery(
  endpoint: string,
  queryParams: Record<string, string | number>
): Promise<Response> {
  const apiKey = Deno.env.get("DRGREEN_API_KEY");
  const secretKey = Deno.env.get("DRGREEN_PRIVATE_KEY");
  
  if (!apiKey || !secretKey) {
    throw new Error("Dr Green API credentials not configured");
  }
  
  // Build query string exactly like WordPress: http_build_query
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(queryParams)) {
    params.append(key, String(value));
  }
  const queryString = params.toString();
  
  // Sign the query string (not the body)
  const signature = await signQueryString(queryString, secretKey);
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-auth-apikey": apiKey,
    "x-auth-signature": signature,
  };
  
  const url = `${DRGREEN_API_URL}${endpoint}?${queryString}`;
  logInfo(`API request: GET ${endpoint}`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('API request timed out. Please try again.');
    }
    throw error;
  }
}

/**
 * Legacy request handler for backwards compatibility
 * Uses body signing for all requests
 */
async function drGreenRequest(
  endpoint: string,
  method: string,
  body?: object
): Promise<Response> {
  return drGreenRequestBody(endpoint, method, body);
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
    
    logInfo(`Processing action: ${action}`, { method: req.method });

    // ==========================================
    // AUTHENTICATION & AUTHORIZATION CHECK
    // ==========================================
    
    // Check if action is public (no auth required)
    const isPublicAction = PUBLIC_ACTIONS.includes(action);
    
    // Check if action is country-gated (open countries don't require auth)
    const isCountryGatedAction = COUNTRY_GATED_ACTIONS.includes(action);
    
    // Check if action only requires authentication (no ownership check)
    const isAuthOnlyAction = AUTH_ONLY_ACTIONS.includes(action);
    
    // Handle country-gated actions (strains)
    // IMPORTANT: For open countries (ZAF, THA), skip ALL auth checks completely.
    // Even if client sends an invalid/expired JWT, we ignore it for open country browsing.
    if (isCountryGatedAction) {
      const countryCode = (body?.countryCode || '').toString().toUpperCase().trim();
      
      // Validate country code input
      if (countryCode && !validateCountryCode(countryCode)) {
        return new Response(
          JSON.stringify({ error: 'Invalid country code' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const isOpenCountry = countryCode && OPEN_COUNTRIES.includes(countryCode);
      
      if (isOpenCountry) {
        // Open countries (ZAF, THA) bypass auth entirely - no JWT validation at all
        logInfo(`Public access granted to ${action} for open country: ${countryCode}`);
        // Continue to route processing without any authentication check
      } else {
        // Restricted countries (GBR, PRT) or missing country require valid auth
        const authResult = await verifyAuthentication(req);
        
        if (!authResult) {
          logWarn(`Auth required for ${action}`);
          return new Response(
            JSON.stringify({ 
              error: 'Authentication required. Please sign in to view products in your region.',
              code: 401
            }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        logInfo(`Authenticated user accessing ${action}`);
      }
    } else if (!isPublicAction) {
      // Non-country-gated, non-public actions require authentication
      const authResult = await verifyAuthentication(req);
      
      if (!authResult) {
        logWarn(`Unauthenticated request to ${action}`);
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { user, supabaseClient } = authResult;

      // Check admin role for admin-only endpoints
      if (ADMIN_ACTIONS.includes(action)) {
        const hasAdminRole = await isAdmin(supabaseClient, user.id);
        
        if (!hasAdminRole) {
          logWarn(`Non-admin attempted to access ${action}`);
          return new Response(
            JSON.stringify({ error: 'Admin access required' }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        logInfo(`Admin accessed ${action}`);
      }

      // Verify resource ownership for client-specific operations
      if (OWNERSHIP_ACTIONS.includes(action)) {
        const clientId = body?.clientId || body?.data?.clientId;
        
        if (clientId) {
          // Validate clientId input
          if (!validateClientId(clientId)) {
            return new Response(
              JSON.stringify({ error: 'Invalid client ID format' }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          // Check ownership or admin status
          const ownsResource = await verifyClientOwnership(supabaseClient, user.id, clientId);
          
          if (!ownsResource) {
            const hasAdminRole = await isAdmin(supabaseClient, user.id);
            
            if (!hasAdminRole) {
              logWarn(`User attempted unauthorized access`);
              return new Response(
                JSON.stringify({ error: 'Access denied' }),
                { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
          }
        }
      }

      // Special case: create-client-legacy and create-client don't require ownership 
      // (new client creation) but do require authentication
      if (action === 'create-client-legacy' || action === 'create-client') {
        logInfo(`User creating new client`);
      }
    }

    // ==========================================
    // ROUTE PROCESSING
    // ==========================================
    
    let response: Response;
    
    switch (action) {
      // ==========================================
      // LEGACY WORDPRESS-COMPATIBLE ENDPOINTS
      // ==========================================
      
      // Create client with legacy payload format (Method A - Body Sign)
      case "create-client-legacy": {
        const payload = body?.payload;
        if (!payload) throw new Error("Payload is required for client creation");
        
        // Validate required fields
        if (!validateEmail(payload.email)) {
          throw new Error("Invalid email format");
        }
        if (!validateStringLength(payload.firstName, 100) || !validateStringLength(payload.lastName, 100)) {
          throw new Error("Name fields exceed maximum length");
        }
        
        // Enhanced logging for debugging API credential issues
        logInfo("Creating client with legacy payload", {
          hasApiKey: !!Deno.env.get("DRGREEN_API_KEY"),
          hasPrivateKey: !!Deno.env.get("DRGREEN_PRIVATE_KEY"),
          email: payload.email?.slice(0, 5) + '***',
          countryCode: payload.countryCode,
        });
        
        response = await drGreenRequestBody("/clients", "POST", payload);
        
        // Log response details for debugging
        const clonedResp = response.clone();
        const respBody = await clonedResp.text();
        logInfo("Client creation API response", {
          status: response.status,
          statusText: response.statusText,
          bodyPreview: respBody.slice(0, 300),
        });
        
        if (!response.ok) {
          logError("Client creation failed", {
            status: response.status,
            body: respBody.slice(0, 500),
          });
        }
        
        break;
      }
      
      // Get strains list with query signing (Method B - Query Sign)
      case "get-strains-legacy": {
        const { countryCode, orderBy, take, page } = body || {};
        
        // Validate pagination
        if (!validatePagination(page, take)) {
          throw new Error("Invalid pagination parameters");
        }
        
        const queryParams: Record<string, string | number> = {
          orderBy: orderBy || 'desc',
          take: take || 10,
          page: page || 1,
        };
        if (countryCode) queryParams.countryCode = countryCode;
        
        response = await drGreenRequestQuery("/strains", queryParams);
        break;
      }
      
      // Get cart with query signing (Method B - Query Sign)
      case "get-cart-legacy": {
        const { clientId, orderBy, take, page } = body || {};
        if (!clientId) throw new Error("clientId is required");
        
        // Validate inputs
        if (!validateClientId(clientId)) {
          throw new Error("Invalid client ID format");
        }
        if (!validatePagination(page, take)) {
          throw new Error("Invalid pagination parameters");
        }
        
        const queryParams: Record<string, string | number> = {
          orderBy: orderBy || 'desc',
          take: take || 10,
          page: page || 1,
          clientId: clientId,
        };
        
        response = await drGreenRequestQuery("/carts", queryParams);
        break;
      }
      
      // Add to cart (Method A - Body Sign)
      case "add-to-cart": {
        const cartData = body?.data;
        if (!cartData) throw new Error("Cart data is required");
        
        response = await drGreenRequestBody("/carts", "POST", cartData);
        break;
      }
      
      // Remove from cart (Method A - Body Sign for signature, query for strainId)
      case "remove-from-cart": {
        const { cartId, strainId } = body || {};
        if (!cartId || !strainId) throw new Error("cartId and strainId are required");
        
        // Validate inputs
        if (!validateStringLength(cartId, 100) || !validateStringLength(strainId, 100)) {
          throw new Error("Invalid ID format");
        }
        
        // WordPress signs {"cartId": basketId} but passes strainId as query param
        const signPayloadData = { cartId };
        const signature = await signPayload(JSON.stringify(signPayloadData), Deno.env.get("DRGREEN_PRIVATE_KEY")!);
        
        const apiKey = Deno.env.get("DRGREEN_API_KEY")!;
        const apiUrl = `${DRGREEN_API_URL}/carts/${cartId}?strainId=${strainId}`;
        
        logInfo(`Removing item from cart`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
        
        response = await fetch(apiUrl, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "x-auth-apikey": apiKey,
            "x-auth-signature": signature,
          },
          body: JSON.stringify(signPayloadData),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        break;
      }
      
      // Empty cart (Method A - Body Sign)
      case "empty-cart": {
        const { cartId } = body || {};
        if (!cartId) throw new Error("cartId is required");
        
        response = await drGreenRequestBody(`/carts/${cartId}`, "DELETE", { cartId });
        break;
      }
      
      // Place order (Method A - Body Sign)
      case "place-order": {
        const orderData = body?.data;
        if (!orderData) throw new Error("Order data is required");
        
        response = await drGreenRequestBody("/orders", "POST", orderData);
        break;
      }
      
      // ==========================================
      // DAPP ADMIN ENDPOINTS
      // ==========================================
      
      case "dashboard-summary": {
        response = await drGreenRequest("/dapp/dashboard/summary", "GET");
        break;
      }
      
      case "dashboard-analytics": {
        const { startDate, endDate, filterBy, orderBy } = body || {};
        let queryParams = `?orderBy=${orderBy || 'asc'}`;
        if (startDate) queryParams += `&startDate=${startDate}`;
        if (endDate) queryParams += `&endDate=${endDate}`;
        if (filterBy) queryParams += `&filterBy=${filterBy}`;
        response = await drGreenRequest(`/dapp/dashboard/analytics${queryParams}`, "GET");
        break;
      }
      
      case "sales-summary": {
        response = await drGreenRequest("/dapp/sales/summary", "GET");
        break;
      }
      
      case "dapp-clients": {
        const { page, take, orderBy, search, searchBy, status, kyc, adminApproval } = body || {};
        
        if (!validatePagination(page, take)) {
          throw new Error("Invalid pagination parameters");
        }
        
        let queryParams = `?orderBy=${orderBy || 'desc'}&take=${take || 10}&page=${page || 1}`;
        if (search) queryParams += `&search=${encodeURIComponent(String(search).slice(0, 100))}`;
        if (searchBy) queryParams += `&searchBy=${searchBy}`;
        if (status) queryParams += `&status=${status}`;
        if (kyc) queryParams += `&kyc=${kyc}`;
        if (adminApproval) queryParams += `&adminApproval=${adminApproval}`;
        response = await drGreenRequest(`/dapp/clients${queryParams}`, "GET");
        break;
      }
      
      case "dapp-client-details": {
        const { clientId } = body || {};
        if (!clientId) throw new Error("clientId is required");
        if (!validateClientId(clientId)) throw new Error("Invalid client ID format");
        response = await drGreenRequest(`/dapp/clients/${clientId}`, "GET");
        break;
      }
      
      case "dapp-verify-client": {
        const { clientId, action: verifyAction } = body || {};
        if (!clientId || !verifyAction) throw new Error("clientId and action are required");
        if (!validateClientId(clientId)) throw new Error("Invalid client ID format");
        response = await drGreenRequest(`/dapp/clients/${clientId}/${verifyAction}`, "PATCH");
        break;
      }
      
      case "dapp-orders": {
        const { page, take, orderBy, search, searchBy, adminApproval, clientIds } = body || {};
        
        if (!validatePagination(page, take)) {
          throw new Error("Invalid pagination parameters");
        }
        
        let queryParams = `?orderBy=${orderBy || 'desc'}&take=${take || 10}&page=${page || 1}`;
        if (search) queryParams += `&search=${encodeURIComponent(String(search).slice(0, 100))}`;
        if (searchBy) queryParams += `&searchBy=${searchBy}`;
        if (adminApproval) queryParams += `&adminApproval=${adminApproval}`;
        if (clientIds) queryParams += `&clientIds=${JSON.stringify(clientIds)}`;
        response = await drGreenRequest(`/dapp/orders${queryParams}`, "GET");
        break;
      }
      
      case "dapp-order-details": {
        const { orderId } = body || {};
        if (!orderId) throw new Error("orderId is required");
        if (!validateStringLength(orderId, 100)) throw new Error("Invalid order ID format");
        response = await drGreenRequest(`/dapp/orders/${orderId}`, "GET");
        break;
      }
      
      case "dapp-update-order": {
        const { orderId, orderStatus, paymentStatus } = body || {};
        if (!orderId) throw new Error("orderId is required");
        if (!validateStringLength(orderId, 100)) throw new Error("Invalid order ID format");
        response = await drGreenRequest(`/dapp/orders/${orderId}`, "PATCH", { orderStatus, paymentStatus });
        break;
      }
      
      case "dapp-carts": {
        const { page, take, orderBy, search, searchBy } = body || {};
        
        if (!validatePagination(page, take)) {
          throw new Error("Invalid pagination parameters");
        }
        
        let queryParams = `?orderBy=${orderBy || 'desc'}&take=${take || 10}&page=${page || 1}`;
        if (search) queryParams += `&search=${encodeURIComponent(String(search).slice(0, 100))}`;
        if (searchBy) queryParams += `&searchBy=${searchBy}`;
        response = await drGreenRequest(`/dapp/carts${queryParams}`, "GET");
        break;
      }
      
      case "dapp-nfts": {
        response = await drGreenRequest("/dapp/users/nfts", "GET");
        break;
      }
      
      case "dapp-strains": {
        const { countryCode, orderBy, search, searchBy } = body || {};
        
        if (countryCode && !validateCountryCode(countryCode)) {
          throw new Error("Invalid country code");
        }
        
        let queryParams = `?orderBy=${orderBy || 'desc'}`;
        if (countryCode) queryParams += `&countryCode=${countryCode}`;
        if (search) queryParams += `&search=${encodeURIComponent(String(search).slice(0, 100))}`;
        if (searchBy) queryParams += `&searchBy=${searchBy}`;
        response = await drGreenRequest(`/dapp/strains${queryParams}`, "GET");
        break;
      }
      
      case "dapp-clients-list": {
        const { orderBy, status, kyc } = body || {};
        let queryParams = `?orderBy=${orderBy || 'desc'}`;
        if (status) queryParams += `&status=${status}`;
        if (kyc) queryParams += `&kyc=${kyc}`;
        response = await drGreenRequest(`/dapp/clients/list${queryParams}`, "GET");
        break;
      }
      
      // ==========================================
      // EXISTING CLIENT/SHOP ENDPOINTS (BACKWARDS COMPAT)
      // ==========================================
      
      case "create-client": {
        const { personal, address, medicalRecord } = body.data || {};
        
        // Validate email
        if (personal?.email && !validateEmail(personal.email)) {
          throw new Error("Invalid email format");
        }
        
        // Build schema-compliant payload for KYC API
        const kycPayload = {
          transaction_metadata: {
            source: "Healingbuds_Web_Store",
            timestamp: new Date().toISOString(),
            flow_type: "Onboarding_KYC_v1"
          },
          user_identity: {
            first_name: String(personal?.firstName || "").slice(0, 100),
            last_name: String(personal?.lastName || "").slice(0, 100),
            dob: personal?.dateOfBirth || "",
            email: String(personal?.email || "").toLowerCase().slice(0, 255),
            phone_number: String(personal?.phone || "").slice(0, 20)
          },
          eligibility_results: {
            age_verified: true,
            region_eligible: true,
            postal_code: String(address?.postalCode || "").slice(0, 20),
            country_code: String(address?.country || "PT").slice(0, 3),
            declared_medical_patient: medicalRecord?.doctorApproval || false
          },
          shipping_address: {
            street: String(address?.street || "").slice(0, 200),
            city: String(address?.city || "").slice(0, 100),
            postal_code: String(address?.postalCode || "").slice(0, 20),
            country: String(address?.country || "PT").slice(0, 3)
          },
          medical_record: {
            conditions: String(medicalRecord?.conditions || "").slice(0, 2000),
            current_medications: String(medicalRecord?.currentMedications || "").slice(0, 1000),
            allergies: String(medicalRecord?.allergies || "").slice(0, 500),
            previous_cannabis_use: medicalRecord?.previousCannabisUse || false
          },
          kyc_requirements: {
            document_type: "Government_ID",
            id_country: String(address?.country || "PT").slice(0, 3),
            selfie_required: true,
            liveness_check: "active"
          }
        };
        
        logInfo("Creating client with KYC payload");
        response = await drGreenRequest("/dapp/clients", "POST", kycPayload);
        break;
      }
      
      case "request-kyc-link": {
        const { clientId, personal, address } = body.data || {};
        
        if (!clientId) {
          throw new Error("clientId is required for KYC link request");
        }
        if (!validateClientId(clientId)) {
          throw new Error("Invalid client ID format");
        }
        
        const kycLinkPayload = {
          transaction_metadata: {
            source: "Healingbuds_Web_Store",
            timestamp: new Date().toISOString(),
            flow_type: "KYC_Link_Retry_v1"
          },
          client_id: clientId,
          user_identity: {
            first_name: String(personal?.firstName || "").slice(0, 100),
            last_name: String(personal?.lastName || "").slice(0, 100),
            email: String(personal?.email || "").toLowerCase().slice(0, 255)
          },
          kyc_requirements: {
            document_type: "Government_ID",
            id_country: String(address?.country || "PT").slice(0, 3),
            selfie_required: true,
            liveness_check: "active"
          }
        };
        
        logInfo("Requesting KYC link");
        response = await drGreenRequest(`/dapp/clients/${clientId}/kyc-link`, "POST", kycLinkPayload);
        break;
      }
      
      case "get-client": {
        if (!validateClientId(body.clientId)) {
          throw new Error("Invalid client ID format");
        }
        // Method A - Body Sign: signs {"clientId": "..."}
        const signBody = { clientId: body.clientId };
        response = await drGreenRequestBody(`/clients/${body.clientId}`, "GET", signBody);
        break;
      }
      
      case "update-client": {
        if (!validateClientId(body.clientId)) {
          throw new Error("Invalid client ID format");
        }
        response = await drGreenRequest(`/dapp/clients/${body.clientId}`, "PUT", body.data);
        break;
      }
      
      case "get-strains": {
        const countryCode = body?.countryCode || "PRT";
        if (!validateCountryCode(countryCode)) {
          throw new Error("Invalid country code");
        }
        logInfo(`Fetching strains for country: ${countryCode}`);
        response = await drGreenRequest(`/dapp/strains?countryCode=${countryCode}`, "GET");
        break;
      }
      
      case "get-all-strains": {
        logInfo("Fetching all strains");
        response = await drGreenRequest("/dapp/strains", "GET");
        break;
      }
      
      case "get-strain": {
        if (!validateStringLength(body.strainId, 100)) {
          throw new Error("Invalid strain ID format");
        }
        // Method A - Body Sign: signs {"strainId": "..."}
        const signBody = { strainId: body.strainId };
        response = await drGreenRequestBody(`/strains/${body.strainId}`, "GET", signBody);
        break;
      }
      
      case "create-cart": {
        response = await drGreenRequest("/dapp/carts", "POST", body.data);
        break;
      }
      
      case "update-cart": {
        if (!validateStringLength(body.cartId, 100)) {
          throw new Error("Invalid cart ID format");
        }
        response = await drGreenRequest(`/dapp/carts/${body.cartId}`, "PUT", body.data);
        break;
      }
      
      case "get-cart": {
        if (!validateStringLength(body.cartId, 100)) {
          throw new Error("Invalid cart ID format");
        }
        response = await drGreenRequest(`/dapp/carts/${body.cartId}`, "GET");
        break;
      }
      
      case "create-order": {
        response = await drGreenRequest("/dapp/orders", "POST", body.data);
        break;
      }
      
      case "get-order": {
        if (!validateStringLength(body.orderId, 100)) {
          throw new Error("Invalid order ID format");
        }
        // Method A - Body Sign: signs {"orderId": "..."}
        const signBody = { orderId: body.orderId };
        response = await drGreenRequestBody(`/orders/${body.orderId}`, "GET", signBody);
        break;
      }
      
      case "update-order": {
        if (!validateStringLength(body.orderId, 100)) {
          throw new Error("Invalid order ID format");
        }
        response = await drGreenRequest(`/dapp/orders/${body.orderId}`, "PATCH", body.data);
        break;
      }
      
      case "get-orders": {
        if (!validateClientId(body.clientId)) {
          throw new Error("Invalid client ID format");
        }
        // Method A - Body Sign: signs {"clientId": "..."}
        const signBody = { clientId: body.clientId };
        response = await drGreenRequestBody(`/client/${body.clientId}/orders`, "GET", signBody);
        break;
      }
      
      case "create-payment": {
        response = await drGreenRequest("/dapp/payments", "POST", body.data);
        break;
      }
      
      case "get-payment": {
        if (!validateStringLength(body.paymentId, 100)) {
          throw new Error("Invalid payment ID format");
        }
        response = await drGreenRequest(`/dapp/payments/${body.paymentId}`, "GET");
        break;
      }
      
      default:
        return new Response(
          JSON.stringify({ error: "Unknown action", action }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
    
    const data = await response.json();
    logInfo(`Response status: ${response.status}`);
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logError("Proxy error", { message });
    
    // Determine appropriate status code
    let statusCode = 500;
    if (message.includes('timed out')) {
      statusCode = 504; // Gateway Timeout
    } else if (message.includes('required') || message.includes('Invalid')) {
      statusCode = 400; // Bad Request
    } else if (message.includes('Unprocessable') || message.includes('422')) {
      statusCode = 422; // Unprocessable Entity (e.g., blurry ID)
    }
    
    return new Response(
      JSON.stringify({ 
        error: message,
        errorCode: statusCode === 422 ? 'DOCUMENT_QUALITY' : statusCode === 504 ? 'TIMEOUT' : 'SERVER_ERROR',
        retryable: statusCode !== 400,
        success: false
      }),
      { status: statusCode, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
