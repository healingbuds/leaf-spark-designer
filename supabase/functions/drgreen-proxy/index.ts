import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-debug-key',
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
  'update-order', 'update-client', 'delete-client', 'patch-client',
  'activate-client', 'deactivate-client', 'bulk-delete-clients'
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
const AUTH_ONLY_ACTIONS: string[] = ['get-user-me'];

// Admin debug mode: allows bypassing auth for specific actions when debug header is present
// Uses first 16 chars of DRGREEN_PRIVATE_KEY as the debug secret
const DEBUG_ACTIONS = ['create-client-legacy'];

function getDebugSecret(): string | null {
  const privateKey = Deno.env.get("DRGREEN_PRIVATE_KEY");
  if (!privateKey || privateKey.length < 16) return null;
  return privateKey.slice(0, 16);
}

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
 * Check if a string is valid Base64
 */
function isBase64(str: string): boolean {
  if (!str || str.length % 4 !== 0) return false;
  return /^[A-Za-z0-9+/]+=*$/.test(str);
}

/**
 * Decode Base64 string to Uint8Array
 */
function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Convert Uint8Array to Base64 string
 */
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Generate RSA/EC signature using asymmetric private key
 * Matches the Node.js pattern from Dr Green API docs:
 * 
 *   const privateKeyBuffer = Buffer.from(secretKey, 'base64');
 *   const privateKeyObject = crypto.createPrivateKey(privateKeyBuffer);
 *   const signature = crypto.sign(null, Buffer.from(payload), privateKeyObject);
 *   const signatureBase64 = signature.toString('base64');
 * 
 * @param data - The data to sign (payload string)
 * @param base64PrivateKey - The Base64-encoded private key (PEM or DER format)
 * @returns Base64-encoded signature
 */
async function generatePrivateKeySignature(
  data: string,
  base64PrivateKey: string
): Promise<string> {
  const encoder = new TextEncoder();

  // WordPress reference:
  //   $privateKeyPEM = base64_decode($key);
  //   $privateKey = openssl_pkey_get_private($privateKeyPEM);
  //   openssl_sign($payload, $signature, $privateKey, OPENSSL_ALGO_SHA256);
  //
  // In our backend function, DRGREEN_PRIVATE_KEY is expected to be a Base64-encoded
  // PEM file. The WebCrypto API can't import PEM directly, so we must:
  //  1) Base64-decode the secret → PEM text
  //  2) Strip PEM header/footer and whitespace
  //  3) Base64-decode the PEM body → DER bytes (PKCS#8)

  const secret = (base64PrivateKey || '').trim();

  // Step 1: Base64 decode the secret
  let decodedSecretBytes: Uint8Array;
  try {
    decodedSecretBytes = base64ToBytes(secret);
  } catch (e) {
    logError("Failed to decode private key from Base64", { error: String(e) });
    throw new Error("Invalid private key format - must be Base64-encoded");
  }

  // Step 2: Detect PEM and extract DER bytes
  let keyDerBytes: Uint8Array;
  const decodedAsText = new TextDecoder().decode(decodedSecretBytes);

  if (decodedAsText.includes('-----BEGIN')) {
    // Extract the PEM body (base64 DER)
    const pemBody = decodedAsText
      .replace(/-----BEGIN [A-Z0-9 ]+-----/g, '')
      .replace(/-----END [A-Z0-9 ]+-----/g, '')
      .replace(/[\r\n\s]/g, '')
      .trim();

    if (!pemBody || !isBase64(pemBody)) {
      logError('Private key PEM body is empty or not Base64', {
        pemDetected: true,
        decodedLength: decodedAsText.length,
      });
      throw new Error('Invalid private key PEM format');
    }

    keyDerBytes = base64ToBytes(pemBody);
    logDebug('Private key decoded from Base64 PEM', {
      derLength: keyDerBytes.length,
    });
  } else {
    // Secret might be Base64(DER) already
    keyDerBytes = decodedSecretBytes;
    logDebug('Private key decoded from Base64 DER', {
      derLength: keyDerBytes.length,
    });
  }

  // Step 3: Try to import as PKCS#8 (RSA first, then EC), else fallback to HMAC.
  let cryptoKey: CryptoKey;

  try {
    cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      keyDerBytes.buffer as ArrayBuffer,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );
    logDebug('Successfully imported RSA private key (PKCS#8)');
  } catch (rsaError) {
    logDebug('RSA import failed, trying EC', { error: String(rsaError) });

    // Try EC key (P-256)
    try {
      cryptoKey = await crypto.subtle.importKey(
        'pkcs8',
        keyDerBytes.buffer as ArrayBuffer,
        {
          name: 'ECDSA',
          namedCurve: 'P-256',
        },
        false,
        ['sign']
      );
      logDebug('Successfully imported EC private key (P-256)');
    } catch (ecError) {
      logDebug('EC P-256 import failed, trying P-384', { error: String(ecError) });

      // Try EC key (P-384)
      try {
        cryptoKey = await crypto.subtle.importKey(
          'pkcs8',
          keyDerBytes.buffer as ArrayBuffer,
          {
            name: 'ECDSA',
            namedCurve: 'P-384',
          },
          false,
          ['sign']
        );
        logDebug('Successfully imported EC private key (P-384)');
      } catch (ec384Error) {
        // Last resort: try raw HMAC (legacy fallback)
        logWarn('Private key import failed, falling back to HMAC', {
          rsaError: String(rsaError),
          ecError: String(ecError),
          ec384Error: String(ec384Error),
        });
        return generateHmacSignatureFallback(data, base64PrivateKey);
      }
    }
  }

  // Step 4: Sign the data
  const dataBytes = encoder.encode(data);

  let signatureBuffer: ArrayBuffer;
  if (cryptoKey.algorithm.name === 'ECDSA') {
    signatureBuffer = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      cryptoKey,
      dataBytes
    );
  } else {
    signatureBuffer = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, dataBytes);
  }

  // Step 5: Return Base64 signature
  return bytesToBase64(new Uint8Array(signatureBuffer));
}


/**
 * Fallback HMAC-SHA256 signature for legacy compatibility
 * Used when private key import fails (may be a shared secret instead)
 */
async function generateHmacSignatureFallback(
  data: string,
  secretKey: string
): Promise<string> {
  const encoder = new TextEncoder();
  
  // Try to decode as Base64 first
  let keyBytes: Uint8Array;
  if (isBase64(secretKey)) {
    try {
      keyBytes = base64ToBytes(secretKey);
      logDebug("HMAC fallback: Using Base64-decoded key", { keyLength: keyBytes.length });
    } catch {
      keyBytes = encoder.encode(secretKey);
      logDebug("HMAC fallback: Using raw key bytes");
    }
  } else {
    keyBytes = encoder.encode(secretKey);
    logDebug("HMAC fallback: Using raw key bytes", { keyLength: keyBytes.length });
  }
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const dataBytes = encoder.encode(data);
  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, dataBytes);
  
  return bytesToBase64(new Uint8Array(signatureBuffer));
}

/**
 * Sign payload using private key (as per Dr Green API documentation)
 * This is used for POST requests and singular GET requests
 * 
 * Falls back to HMAC if private key import fails
 */
async function signPayload(payload: string, secretKey: string): Promise<string> {
  const signature = await generatePrivateKeySignature(payload, secretKey);
  
  logDebug("Signature generated", {
    signatureLength: signature.length,
    payloadLength: payload.length,
  });
  
  return signature;
}

/**
 * Sign query string using private key (as per Dr Green API documentation)
 * This is used for GET list endpoints
 */
async function signQueryString(queryString: string, secretKey: string): Promise<string> {
  return generatePrivateKeySignature(queryString, secretKey);
}

/**
 * Generate signature with specific mode (for diagnostics)
 * Mode is now ignored - always uses private key signing
 */
async function signPayloadWithMode(payload: string, secretKey: string, _useDecoded: boolean): Promise<string> {
  return generatePrivateKeySignature(payload, secretKey);
}

/**
 * Make authenticated request to Dr Green API with body signing (Method A)
 * Used for: POST, DELETE, and singular GET endpoints
 */
async function drGreenRequestBody(
  endpoint: string,
  method: string,
  body?: object,
  enableDetailedLogging = false
): Promise<Response> {
  const apiKey = Deno.env.get("DRGREEN_API_KEY");
  const secretKey = Deno.env.get("DRGREEN_PRIVATE_KEY");
  
  // Enhanced credential diagnostics when enabled
  if (enableDetailedLogging) {
    console.log("[API-DEBUG] ========== BODY REQUEST PREPARATION ==========");
    console.log("[API-DEBUG] Endpoint:", endpoint);
    console.log("[API-DEBUG] Method:", method);
    console.log("[API-DEBUG] API Key present:", !!apiKey);
    console.log("[API-DEBUG] API Key length:", apiKey?.length || 0);
    console.log("[API-DEBUG] API Key prefix:", apiKey ? apiKey.slice(0, 8) + "..." : "N/A");
    console.log("[API-DEBUG] API Key is Base64:", apiKey ? /^[A-Za-z0-9+/=]+$/.test(apiKey) : false);
    console.log("[API-DEBUG] Private Key present:", !!secretKey);
    console.log("[API-DEBUG] Private Key length:", secretKey?.length || 0);
  }
  
  if (!apiKey || !secretKey) {
    throw new Error("Dr Green API credentials not configured");
  }
  
  const payload = body ? JSON.stringify(body) : "";
  const signature = await signPayload(payload, secretKey);
  
  if (enableDetailedLogging) {
    console.log("[API-DEBUG] Payload length:", payload.length);
    console.log("[API-DEBUG] Payload preview:", payload.slice(0, 150));
    console.log("[API-DEBUG] Signature length:", signature.length);
    console.log("[API-DEBUG] Signature prefix:", signature.slice(0, 16) + "...");
  }
  
  // API key is already Base64 encoded - send as-is
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-auth-apikey": apiKey,
    "x-auth-signature": signature,
  };
  
  if (enableDetailedLogging) {
    console.log("[API-DEBUG] Headers:", {
      "Content-Type": headers["Content-Type"],
      "x-auth-apikey": `${headers["x-auth-apikey"]?.slice(0, 12)}... (len: ${headers["x-auth-apikey"]?.length})`,
      "x-auth-signature": `${headers["x-auth-signature"]?.slice(0, 12)}... (len: ${headers["x-auth-signature"]?.length})`
    });
  }
  
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
    
    // Enhanced 401 error analysis when enabled
    if (response.status === 401 && enableDetailedLogging) {
      const clonedResp = response.clone();
      const errorBody = await clonedResp.text();
      console.log("[API-DEBUG] ========== 401 UNAUTHORIZED ANALYSIS ==========");
      console.log("[API-DEBUG] Response status:", response.status);
      console.log("[API-DEBUG] Response headers:", JSON.stringify(Object.fromEntries(response.headers.entries())));
      console.log("[API-DEBUG] Error body:", errorBody);
      console.log("[API-DEBUG] Possible causes:");
      console.log("[API-DEBUG]   1. API key not properly Base64 encoded");
      console.log("[API-DEBUG]   2. Private key incorrect or mismatched");
      console.log("[API-DEBUG]   3. Account lacks permission for this endpoint");
      console.log("[API-DEBUG]   4. Wrong environment (sandbox vs production)");
      console.log("[API-DEBUG]   5. IP not whitelisted");
    }
    
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
  queryParams: Record<string, string | number>,
  enableDetailedLogging = false
): Promise<Response> {
  const apiKey = Deno.env.get("DRGREEN_API_KEY");
  const secretKey = Deno.env.get("DRGREEN_PRIVATE_KEY");
  
  if (enableDetailedLogging) {
    console.log("[API-DEBUG] ========== QUERY REQUEST PREPARATION ==========");
    console.log("[API-DEBUG] Endpoint:", endpoint);
    console.log("[API-DEBUG] Query params:", JSON.stringify(queryParams));
  }
  
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
  
  if (enableDetailedLogging) {
    console.log("[API-DEBUG] Query string:", queryString);
    console.log("[API-DEBUG] Signature length:", signature.length);
    console.log("[API-DEBUG] Signature prefix:", signature.slice(0, 16) + "...");
  }
  
  // API key is already Base64 encoded - send as-is
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
    
    if (response.status === 401 && enableDetailedLogging) {
      console.log("[API-DEBUG] ========== QUERY 401 ANALYSIS ==========");
      console.log("[API-DEBUG] Status:", response.status);
      const errorBody = await response.clone().text();
      console.log("[API-DEBUG] Error body:", errorBody);
    }
    
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
  // ENTRY POINT LOGGING - Debug deployment and request routing
  console.log("[drgreen-proxy] ========== REQUEST RECEIVED ==========");
  console.log("[drgreen-proxy] Method:", req.method);
  console.log("[drgreen-proxy] URL:", req.url);
  console.log("[drgreen-proxy] Timestamp:", new Date().toISOString());
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("[drgreen-proxy] CORS preflight - returning 200");
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
        console.log("[drgreen-proxy] Request body action:", body?.action);
      } catch {
        body = undefined;
        console.log("[drgreen-proxy] No JSON body");
      }
    }
    
    // Route handling
    const action = body?.action || apiPath;
    console.log("[drgreen-proxy] Resolved action:", action);
    
    // Health check endpoint - verify deployment and secrets with enhanced validation
    if (action === 'health-check') {
      const apiKey = Deno.env.get("DRGREEN_API_KEY");
      const privateKey = Deno.env.get("DRGREEN_PRIVATE_KEY");
      const hasSupabaseUrl = !!Deno.env.get("SUPABASE_URL");
      const hasAnonKey = !!Deno.env.get("SUPABASE_ANON_KEY");
      
      // Enhanced credential validation
      const isApiKeyBase64 = apiKey ? /^[A-Za-z0-9+/=]+$/.test(apiKey) : false;
      let decodedApiKeyLength = 0;
      if (isApiKeyBase64 && apiKey) {
        try {
          decodedApiKeyLength = atob(apiKey).length;
        } catch {
          // Not valid base64
        }
      }
      
      console.log("[drgreen-proxy] Health check:", { 
        hasApiKey: !!apiKey, 
        hasPrivateKey: !!privateKey, 
        hasSupabaseUrl, 
        hasAnonKey,
        isApiKeyBase64,
        decodedApiKeyLength
      });
      
      const healthResult: Record<string, unknown> = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        secrets: {
          DRGREEN_API_KEY: apiKey ? 'configured' : 'MISSING',
          DRGREEN_PRIVATE_KEY: privateKey ? 'configured' : 'MISSING',
          SUPABASE_URL: hasSupabaseUrl ? 'configured' : 'MISSING',
          SUPABASE_ANON_KEY: hasAnonKey ? 'configured' : 'MISSING',
        },
        credentialValidation: {
          apiKeyPresent: !!apiKey,
          apiKeyLength: apiKey?.length || 0,
          apiKeyIsBase64: isApiKeyBase64,
          apiKeyDecodedLength: decodedApiKeyLength,
          apiKeyPrefix: apiKey ? apiKey.slice(0, 8) + '...' : 'N/A',
          privateKeyPresent: !!privateKey,
          privateKeyLength: privateKey?.length || 0,
          privateKeyPrefix: privateKey ? privateKey.slice(0, 4) + '...' : 'N/A',
        },
        allSecretsConfigured: !!apiKey && !!privateKey && hasSupabaseUrl && hasAnonKey,
        apiBaseUrl: DRGREEN_API_URL,
      };
      
      // Quick API connectivity test with /strains if credentials available
      if (apiKey && privateKey) {
        try {
          const testResponse = await drGreenRequestQuery("/strains", { take: 1 });
          healthResult.apiConnectivity = {
            endpoint: "GET /strains",
            status: testResponse.status,
            success: testResponse.ok,
          };
        } catch (e) {
          healthResult.apiConnectivity = {
            endpoint: "GET /strains",
            error: e instanceof Error ? e.message : 'Unknown error',
            success: false,
          };
        }
      }
      
      return new Response(JSON.stringify(healthResult, null, 2), { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // API Diagnostics endpoint - comprehensive endpoint testing
    if (action === 'api-diagnostics') {
      const apiKey = Deno.env.get("DRGREEN_API_KEY");
      const privateKey = Deno.env.get("DRGREEN_PRIVATE_KEY");
      
      console.log("[API-DIAGNOSTICS] Starting comprehensive diagnostics...");
      
      const diagnostics: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        environment: {
          apiKeyPresent: !!apiKey,
          apiKeyLength: apiKey?.length || 0,
          apiKeyFormat: apiKey ? (/^[A-Za-z0-9+/=]+$/.test(apiKey) ? 'base64' : 'not-base64') : 'missing',
          apiKeyPrefix: apiKey ? apiKey.slice(0, 8) + '...' : 'N/A',
          privateKeyPresent: !!privateKey,
          privateKeyLength: privateKey?.length || 0,
          privateKeyPrefix: privateKey ? privateKey.slice(0, 4) + '...' : 'N/A',
          apiBaseUrl: DRGREEN_API_URL,
        },
        signatureTests: {},
        endpointTests: [] as Record<string, unknown>[],
      };
      
      if (apiKey && privateKey) {
        // Test signature generation with both modes
        const testPayload = JSON.stringify({ test: "diagnostic" });
        const testQueryString = "orderBy=desc&take=1&page=1";
        
        // Key analysis
        const privateKeyIsBase64 = isBase64(privateKey);
        let decodedKeyInfo = null;
        if (privateKeyIsBase64) {
          try {
            const decoded = base64ToBytes(privateKey);
            const decodedStr = new TextDecoder().decode(decoded);
            decodedKeyInfo = {
              decodedLength: decoded.length,
              startsWithBegin: decodedStr.startsWith("-----BEGIN"),
              preview: decodedStr.slice(0, 20) + "...",
            };
          } catch (e) {
            decodedKeyInfo = { error: "Failed to decode" };
          }
        }
        
        diagnostics.keyAnalysis = {
          privateKeyLength: privateKey.length,
          privateKeyIsBase64,
          decodedKeyInfo,
          signingMethod: "Private Key (RSA/EC) - per Dr Green API docs",
        };
        
        // Test signature generation with private key
        try {
          const signature = await signPayload(testPayload, privateKey);
          
          diagnostics.signatureTests = {
            privateKeySignature: {
              outputLength: signature.length,
              outputPrefix: signature.slice(0, 16) + '...',
              // RSA signatures are typically 256+ bytes (342+ base64 chars)
              // EC signatures are typically 64 bytes (88 base64 chars)
              // HMAC fallback is 32 bytes (44 base64 chars)
              likelyType: signature.length > 100 ? "RSA/EC (asymmetric)" : "HMAC (fallback)",
            },
          };
        } catch (e) {
          diagnostics.signatureTests = { error: e instanceof Error ? e.message : 'Unknown error' };
        }
        
        // Test GET /strains 
        console.log("[API-DIAGNOSTICS] Testing GET /strains...");
        try {
          const strainsResp = await drGreenRequestQuery("/strains", { take: 1 }, true);
          const strainsBody = await strainsResp.clone().text();
          (diagnostics.endpointTests as Record<string, unknown>[]).push({
            endpoint: "GET /strains",
            method: "Private Key Signing",
            status: strainsResp.status,
            success: strainsResp.ok,
            responsePreview: strainsBody.slice(0, 200),
          });
        } catch (e) {
          (diagnostics.endpointTests as Record<string, unknown>[]).push({
            endpoint: "GET /strains",
            method: "Private Key Signing",
            error: e instanceof Error ? e.message : 'Unknown error',
            success: false,
          });
        }
        
        // Test POST /dapp/clients 
        console.log("[API-DIAGNOSTICS] Testing POST /dapp/clients...");
        const testClientPayload = {
          transaction_metadata: { 
            source: "Healingbuds_Diagnostic_Test",
            timestamp: new Date().toISOString(),
          },
        };
        
        try {
          const clientResp = await drGreenRequestBody("/dapp/clients", "POST", testClientPayload, true);
          const clientBody = await clientResp.clone().text();
          (diagnostics.endpointTests as Record<string, unknown>[]).push({
            endpoint: "POST /dapp/clients",
            method: "Private Key Signing (per API docs)",
            status: clientResp.status,
            success: clientResp.ok,
            responsePreview: clientBody.slice(0, 300),
          });
        } catch (e) {
          (diagnostics.endpointTests as Record<string, unknown>[]).push({
            endpoint: "POST /dapp/clients",
            method: "Private Key Signing (per API docs)",
            error: e instanceof Error ? e.message : 'Unknown error',
            success: false,
          });
        }
        
        // Determine success based on tests
        const strainsTest = (diagnostics.endpointTests as Record<string, unknown>[]).find(
          t => t.endpoint === "GET /strains"
        );
        const clientTest = (diagnostics.endpointTests as Record<string, unknown>[]).find(
          t => t.endpoint === "POST /dapp/clients"
        );
        
        diagnostics.selectedMode = "Private Key (RSA/EC)";
        
        // Summary and recommendations
        diagnostics.summary = {
          readEndpointsWork: strainsTest?.success === true,
          writeEndpointWorks: clientTest?.success === true,
          signingMethod: "Private Key (RSA/EC) per API docs",
          selectedSigningMode: diagnostics.selectedMode,
          likelyIssue: 
            clientTest?.success 
              ? "SUCCESS: Private key signing works! Client creation is operational."
              : clientTest?.status === 401
              ? "SIGNATURE_INVALID: 401 Unauthorized - signature verification failed. Check private key format."
              : clientTest?.status === 403
              ? "PERMISSION_DENIED: 403 Forbidden - API credentials lack write permissions."
              : clientTest?.status === 422
              ? "PAYLOAD_VALIDATION: 422 - Auth works but payload structure needs adjustment."
              : "UNKNOWN_ERROR: Unexpected status code.",
          clientTestStatus: clientTest?.status,
          strainsTestStatus: strainsTest?.status,
          recommendations: [] as string[],
        };
        
        if (!clientTest?.success) {
          if (clientTest?.status === 401) {
            (diagnostics.summary as Record<string, unknown>).recommendations = [
              "Verify DRGREEN_PRIVATE_KEY is a valid Base64-encoded PEM/DER private key",
              "The key should be RSA or EC PKCS#8 format",
              "Check if the private key matches the public key registered with Dr. Green",
            ];
          } else if (clientTest?.status === 403) {
            (diagnostics.summary as Record<string, unknown>).recommendations = [
              "Contact Dr. Green NFT API administrator",
              "Verify your account has permission for POST /dapp/clients",
              "Check if IP whitelisting is required",
            ];
          } else if (clientTest?.status === 422) {
            (diagnostics.summary as Record<string, unknown>).recommendations = [
              "Auth is working! Payload validation failed.",
              "Check the response body for specific field errors.",
              "Update the payload structure to match API requirements.",
            ];
          }
        }
      } else {
        diagnostics.summary = {
          error: "Missing credentials",
          recommendations: ["Configure DRGREEN_API_KEY and DRGREEN_PRIVATE_KEY secrets"],
        };
      }
      
      console.log("[API-DIAGNOSTICS] Complete:", JSON.stringify(diagnostics.summary));
      
      return new Response(JSON.stringify(diagnostics, null, 2), { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
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
      // Check for admin debug mode bypass
      const debugHeader = req.headers.get('x-admin-debug-key');
      const debugSecret = getDebugSecret();
      const isDebugMode = debugHeader && debugSecret && debugHeader === debugSecret && DEBUG_ACTIONS.includes(action);
      
      if (isDebugMode) {
        logInfo(`[ADMIN DEBUG MODE] Bypassing auth for ${action}`, { 
          action, 
          debugHeaderPresent: true,
          timestamp: new Date().toISOString() 
        });
        // Skip authentication and proceed to route processing
      } else {
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
      } // end else (not debug mode)
    }

    // ==========================================
    // ROUTE PROCESSING
    // ==========================================
    
    let response: Response;
    
    switch (action) {
      // ==========================================
      // LEGACY WORDPRESS-COMPATIBLE ENDPOINTS
      // ==========================================
      
      // Create client with legacy payload format - exact Dr. Green API schema
      // Per API docs: POST /dapp/clients with exact field structure
      case "create-client-legacy": {
        const legacyPayload = body?.payload;
        if (!legacyPayload) throw new Error("Payload is required for client creation");
        
        // Validate required fields
        if (!validateEmail(legacyPayload.email)) {
          throw new Error("Invalid email format");
        }
        if (!validateStringLength(legacyPayload.firstName, 100) || !validateStringLength(legacyPayload.lastName, 100)) {
          throw new Error("Name fields exceed maximum length");
        }
        
        // Extract nested objects from legacy payload
        const shipping = legacyPayload.shipping || {};
        const medicalRecord = legacyPayload.medicalRecord || {};
        
        // Build EXACT payload structure per Dr. Green API documentation
        // Required fields only - omit optional fields if empty/undefined
        const dappPayload: Record<string, unknown> = {
          // Required personal fields
          firstName: String(legacyPayload.firstName || "").trim(),
          lastName: String(legacyPayload.lastName || "").trim(),
          email: String(legacyPayload.email || "").toLowerCase().trim(),
          phoneCode: String(legacyPayload.phoneCode || "+351"),
          phoneCountryCode: String(legacyPayload.phoneCountryCode || "PT").toUpperCase(),
          contactNumber: String(legacyPayload.contactNumber || ""),
          
          // Required shipping object (with required fields)
          shipping: {
            address1: String(shipping.address1 || "").trim(),
            city: String(shipping.city || "").trim(),
            state: String(shipping.state || shipping.city || "").trim(),
            country: String(shipping.country || "Portugal").trim(),
            countryCode: String(shipping.countryCode || "PRT").toUpperCase(),
            postalCode: String(shipping.postalCode || "").trim(),
          } as Record<string, string>,
          
          // Required medicalRecord object
          medicalRecord: {
            dob: String(medicalRecord.dob || ""),
            gender: String(medicalRecord.gender || "prefer_not_to_say"),
            // Required boolean flags (medicalHistory 0-4, 8-10, 12)
            medicalHistory0: medicalRecord.medicalHistory0 === true,
            medicalHistory1: medicalRecord.medicalHistory1 === true,
            medicalHistory2: medicalRecord.medicalHistory2 === true,
            medicalHistory3: medicalRecord.medicalHistory3 === true,
            medicalHistory4: medicalRecord.medicalHistory4 === true,
            medicalHistory8: medicalRecord.medicalHistory8 === true,
            medicalHistory9: medicalRecord.medicalHistory9 === true,
            medicalHistory10: medicalRecord.medicalHistory10 === true,
            medicalHistory12: medicalRecord.medicalHistory12 === true,
            // Required array fields
            medicalHistory5: Array.isArray(medicalRecord.medicalHistory5) && medicalRecord.medicalHistory5.length > 0
              ? medicalRecord.medicalHistory5
              : ["none"],
            medicalHistory14: Array.isArray(medicalRecord.medicalHistory14) && medicalRecord.medicalHistory14.length > 0
              ? medicalRecord.medicalHistory14
              : ["never"],
            // Required string fields
            medicalHistory13: String(medicalRecord.medicalHistory13 || "never").toLowerCase(),
          } as Record<string, unknown>,
        };
        
        // Add optional shipping fields only if present (per API note: omit empty optional fields)
        if (shipping.address2 && String(shipping.address2).trim()) {
          (dappPayload.shipping as Record<string, string>).address2 = String(shipping.address2).trim();
        }
        if (shipping.landmark && String(shipping.landmark).trim()) {
          (dappPayload.shipping as Record<string, string>).landmark = String(shipping.landmark).trim();
        }
        
        // Add optional medicalRecord fields only if present
        const mr = dappPayload.medicalRecord as Record<string, unknown>;
        
        // medicalConditions array (optional)
        if (Array.isArray(medicalRecord.medicalConditions) && medicalRecord.medicalConditions.length > 0) {
          mr.medicalConditions = medicalRecord.medicalConditions;
        }
        // otherMedicalCondition string (optional)
        if (medicalRecord.otherMedicalCondition && String(medicalRecord.otherMedicalCondition).trim()) {
          mr.otherMedicalCondition = String(medicalRecord.otherMedicalCondition).trim();
        }
        // medicinesTreatments array (optional)
        if (Array.isArray(medicalRecord.medicinesTreatments) && medicalRecord.medicinesTreatments.length > 0) {
          mr.medicinesTreatments = medicalRecord.medicinesTreatments;
        }
        // otherMedicalTreatments string (optional)
        if (medicalRecord.otherMedicalTreatments && String(medicalRecord.otherMedicalTreatments).trim()) {
          mr.otherMedicalTreatments = String(medicalRecord.otherMedicalTreatments).trim();
        }
        // medicalHistory6 boolean (optional)
        if (medicalRecord.medicalHistory6 !== undefined) {
          mr.medicalHistory6 = medicalRecord.medicalHistory6 === true;
        }
        // medicalHistory7 array (optional)
        if (Array.isArray(medicalRecord.medicalHistory7) && medicalRecord.medicalHistory7.length > 0) {
          mr.medicalHistory7 = medicalRecord.medicalHistory7;
          // medicalHistory7Relation is only included if medicalHistory7 exists and doesn't contain "none"
          const hasNone = medicalRecord.medicalHistory7.some((v: string) => 
            String(v).toLowerCase() === 'none'
          );
          if (!hasNone && medicalRecord.medicalHistory7Relation) {
            mr.medicalHistory7Relation = String(medicalRecord.medicalHistory7Relation);
          }
        }
        // medicalHistory11 string (optional - alcohol units)
        if (medicalRecord.medicalHistory11 && String(medicalRecord.medicalHistory11) !== '0') {
          mr.medicalHistory11 = String(medicalRecord.medicalHistory11);
        }
        // medicalHistory15 string (optional - cannabis amount)
        if (medicalRecord.medicalHistory15 && String(medicalRecord.medicalHistory15).trim()) {
          mr.medicalHistory15 = String(medicalRecord.medicalHistory15).trim();
        }
        // medicalHistory16 boolean (optional - cannabis reaction)
        if (medicalRecord.medicalHistory16 !== undefined) {
          mr.medicalHistory16 = medicalRecord.medicalHistory16 === true;
        }
        // prescriptionsSupplements string (optional)
        if (medicalRecord.prescriptionsSupplements && String(medicalRecord.prescriptionsSupplements).trim()) {
          mr.prescriptionsSupplements = String(medicalRecord.prescriptionsSupplements).trim();
        }
        
        // Add clientBusiness only if provided (entire object is optional)
        if (legacyPayload.clientBusiness && legacyPayload.clientBusiness.name) {
          const cb = legacyPayload.clientBusiness;
          const clientBusiness: Record<string, string> = {};
          
          // Add only non-empty business fields
          if (cb.businessType) clientBusiness.businessType = String(cb.businessType);
          if (cb.name) clientBusiness.name = String(cb.name);
          if (cb.address1) clientBusiness.address1 = String(cb.address1);
          if (cb.address2) clientBusiness.address2 = String(cb.address2);
          if (cb.landmark) clientBusiness.landmark = String(cb.landmark);
          if (cb.city) clientBusiness.city = String(cb.city);
          if (cb.state) clientBusiness.state = String(cb.state);
          if (cb.country) clientBusiness.country = String(cb.country);
          if (cb.countryCode) clientBusiness.countryCode = String(cb.countryCode);
          if (cb.postalCode) clientBusiness.postalCode = String(cb.postalCode);
          
          if (Object.keys(clientBusiness).length > 0) {
            dappPayload.clientBusiness = clientBusiness;
          }
        }
        
        // Enhanced logging for debugging
        console.log("[create-client-legacy] ========== CLIENT CREATION START ==========");
        console.log("[create-client-legacy] Timestamp:", new Date().toISOString());
        console.log("[create-client-legacy] API credentials check:", {
          hasApiKey: !!Deno.env.get("DRGREEN_API_KEY"),
          hasPrivateKey: !!Deno.env.get("DRGREEN_PRIVATE_KEY"),
          apiKeyLength: Deno.env.get("DRGREEN_API_KEY")?.length || 0,
          privateKeyLength: Deno.env.get("DRGREEN_PRIVATE_KEY")?.length || 0,
        });
        console.log("[create-client-legacy] Payload structure keys:", Object.keys(dappPayload));
        console.log("[create-client-legacy] Shipping keys:", Object.keys(dappPayload.shipping as object));
        console.log("[create-client-legacy] MedicalRecord keys:", Object.keys(dappPayload.medicalRecord as object));
        console.log("[create-client-legacy] Has clientBusiness:", !!dappPayload.clientBusiness);
        console.log("[create-client-legacy] Payload (sanitized):", JSON.stringify({
          ...dappPayload,
          email: (dappPayload.email as string)?.slice(0, 5) + '***',
          contactNumber: '***',
        }, null, 2).slice(0, 1500));
        
        logInfo("Creating client with exact API payload structure", {
          hasApiKey: !!Deno.env.get("DRGREEN_API_KEY"),
          hasPrivateKey: !!Deno.env.get("DRGREEN_PRIVATE_KEY"),
          countryCode: (dappPayload.shipping as Record<string, string>).countryCode,
          hasClientBusiness: !!dappPayload.clientBusiness,
        });
        
        // Call API with detailed logging enabled
        response = await drGreenRequestBody("/dapp/clients", "POST", dappPayload, true);
        
        // Log response details for debugging
        const clonedResp = response.clone();
        const respBody = await clonedResp.text();
        
        console.log("[create-client-legacy] ========== API RESPONSE ==========");
        console.log("[create-client-legacy] Status:", response.status);
        console.log("[create-client-legacy] StatusText:", response.statusText);
        console.log("[create-client-legacy] Headers:", JSON.stringify(Object.fromEntries(response.headers.entries())));
        console.log("[create-client-legacy] Body:", respBody.slice(0, 500));
        
        logInfo("Client creation API response", {
          status: response.status,
          statusText: response.statusText,
          bodyPreview: respBody.slice(0, 300),
        });
        
        if (!response.ok) {
          console.log("[create-client-legacy] ========== ERROR ANALYSIS ==========");
          console.log("[create-client-legacy] Error status:", response.status);
          console.log("[create-client-legacy] Full error body:", respBody);
          
          if (response.status === 401) {
            console.log("[create-client-legacy] DIAGNOSIS: Authentication failed - signature mismatch or invalid API key");
          } else if (response.status === 422) {
            console.log("[create-client-legacy] DIAGNOSIS: Validation error - payload structure mismatch");
            console.log("[create-client-legacy] Check: field names, required fields, option values");
          } else if (response.status === 403) {
            console.log("[create-client-legacy] DIAGNOSIS: Permission denied - account lacks access");
          }
          
          logError("Client creation failed", {
            status: response.status,
            body: respBody.slice(0, 500),
          });
        } else {
          console.log("[create-client-legacy] SUCCESS: Client created successfully");
          
          // Parse and normalize the response for frontend consumption
          try {
            const rawData = JSON.parse(respBody);
            
            console.log("[create-client-legacy] Raw response keys:", Object.keys(rawData));
            
            // Extract clientId and kycLink from various possible response structures
            const normalizedResponse = {
              success: true,
              clientId: rawData.client?.id || rawData.data?.id || rawData.clientId || rawData.client_id || rawData.id,
              kycLink: rawData.client?.kycLink || rawData.client?.kyc_link || rawData.data?.kycLink || rawData.data?.kyc_link || rawData.kycLink || rawData.kyc_link,
              isKYCVerified: rawData.client?.isKYCVerified || rawData.client?.is_kyc_verified || rawData.data?.isKYCVerified || rawData.isKYCVerified || rawData.is_kyc_verified || false,
              adminApproval: rawData.client?.adminApproval || rawData.client?.admin_approval || rawData.data?.adminApproval || rawData.adminApproval || rawData.admin_approval || null,
              raw: rawData,
            };
            
            console.log("[create-client-legacy] Extracted clientId:", normalizedResponse.clientId || 'NOT FOUND');
            console.log("[create-client-legacy] Extracted kycLink:", normalizedResponse.kycLink ? 'PRESENT' : 'NOT FOUND');
            
            logInfo("Client creation normalized response", {
              hasClientId: !!normalizedResponse.clientId,
              hasKycLink: !!normalizedResponse.kycLink,
            });
            
            // Return normalized response directly
            return new Response(JSON.stringify(normalizedResponse), {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          } catch (parseError) {
            console.log("[create-client-legacy] Failed to parse response:", parseError);
            // Fall through to default response handling
          }
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
      
      // Add to cart (Method A - Body Sign) - uses /dapp/carts endpoint
      case "add-to-cart": {
        const cartData = body?.data;
        if (!cartData) throw new Error("Cart data is required");
        
        logInfo("API request: POST /dapp/carts");
        response = await drGreenRequestBody("/dapp/carts", "POST", cartData);
        break;
      }
      
      // Remove from cart (Method A - Body Sign for signature, query for strainId) - uses /dapp/carts endpoint
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
        const apiUrl = `${DRGREEN_API_URL}/dapp/carts/${cartId}?strainId=${strainId}`;
        
        logInfo(`Removing item from cart via /dapp/carts endpoint`);
        
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
      
      // Empty cart (Method A - Body Sign) - uses /dapp/carts endpoint
      case "empty-cart": {
        const { cartId } = body || {};
        if (!cartId) throw new Error("cartId is required");
        
        logInfo("API request: DELETE /dapp/carts/:cartId");
        response = await drGreenRequestBody(`/dapp/carts/${cartId}`, "DELETE", { cartId });
        break;
      }
      
      // Place order (Method A - Body Sign) - uses /dapp/orders endpoint
      case "place-order": {
        const orderData = body?.data;
        if (!orderData) throw new Error("Order data is required");
        
        logInfo("API request: POST /dapp/orders");
        response = await drGreenRequestBody("/dapp/orders", "POST", orderData);
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
      
      // ==========================================
      // NEW ENDPOINTS FROM POSTMAN COLLECTION
      // ==========================================
      
      case "get-user-me": {
        // GET /user/me - Get current authenticated user details
        response = await drGreenRequestBody("/user/me", "GET", {});
        break;
      }
      
      case "delete-client": {
        // DELETE /dapp/clients/:clientId - Delete a client
        if (!validateClientId(body.clientId)) {
          throw new Error("Invalid client ID format");
        }
        response = await drGreenRequest(`/dapp/clients/${body.clientId}`, "DELETE");
        break;
      }
      
      case "patch-client": {
        // PATCH /dapp/clients/:clientId - Partial update client details
        if (!validateClientId(body.clientId)) {
          throw new Error("Invalid client ID format");
        }
        response = await drGreenRequest(`/dapp/clients/${body.clientId}`, "PATCH", body.data);
        break;
      }
      
      case "activate-client": {
        // PATCH /dapp/clients/:clientId/activate - Activate a client
        if (!validateClientId(body.clientId)) {
          throw new Error("Invalid client ID format");
        }
        response = await drGreenRequest(`/dapp/clients/${body.clientId}/activate`, "PATCH", {});
        break;
      }
      
      case "deactivate-client": {
        // PATCH /dapp/clients/:clientId/deactivate - Deactivate a client
        if (!validateClientId(body.clientId)) {
          throw new Error("Invalid client ID format");
        }
        response = await drGreenRequest(`/dapp/clients/${body.clientId}/deactivate`, "PATCH", {});
        break;
      }
      
      case "bulk-delete-clients": {
        // Bulk delete clients - requires array of clientIds
        if (!Array.isArray(body.clientIds) || body.clientIds.length === 0) {
          throw new Error("Invalid clientIds - must be non-empty array");
        }
        if (body.clientIds.length > 50) {
          throw new Error("Cannot delete more than 50 clients at once");
        }
        response = await drGreenRequest("/dapp/clients/bulk-delete", "POST", { clientIds: body.clientIds });
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
