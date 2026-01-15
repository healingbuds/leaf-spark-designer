import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  message?: string;
  details?: Record<string, unknown>;
}

interface TestSuiteResult {
  suite: string;
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  results: TestResult[];
}

// Helper to call drgreen-proxy
async function callProxy(action: string, data?: Record<string, unknown>, authHeader?: string): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
  status?: number;
}> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': supabaseKey || '',
  };
  
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/drgreen-proxy`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action, ...data }),
    });
    
    const result = await response.json();
    return {
      success: response.ok && result.success !== false,
      data: result,
      status: response.status,
    };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      error: error.message,
    };
  }
}

// Test runner helper
async function runTest(
  name: string,
  testFn: () => Promise<{ success: boolean; message?: string; details?: Record<string, unknown> }>
): Promise<TestResult> {
  const start = Date.now();
  try {
    const result = await testFn();
    return {
      name,
      status: result.success ? 'pass' : 'fail',
      duration: Date.now() - start,
      message: result.message,
      details: result.details,
    };
  } catch (err) {
    const error = err as Error;
    return {
      name,
      status: 'fail',
      duration: Date.now() - start,
      message: `Exception: ${error.message}`,
      details: { stack: error.stack },
    };
  }
}

// ============================================
// TEST DEFINITIONS
// ============================================

// Test 1: Health Check
async function testHealthCheck(): Promise<{ success: boolean; message?: string; details?: Record<string, unknown> }> {
  const result = await callProxy('health-check');
  
  if (!result.success) {
    return {
      success: false,
      message: 'Health check failed',
      details: { error: result.error, data: result.data },
    };
  }
  
  const data = result.data as Record<string, unknown>;
  const hasRequiredFields = Boolean(data.status && data.timestamp);
  
  return {
    success: hasRequiredFields,
    message: hasRequiredFields ? 'Health check passed' : 'Missing required fields in response',
    details: { response: data },
  };
}

// Test 2: API Key Configuration
async function testApiKeyConfiguration(): Promise<{ success: boolean; message?: string; details?: Record<string, unknown> }> {
  const result = await callProxy('health-check');
  
  if (!result.success) {
    return {
      success: false,
      message: 'Health check failed',
      details: { error: result.error, data: result.data },
    };
  }
  
  const data = result.data as Record<string, unknown>;
  const credentials = data.credentialValidation as Record<string, unknown> | undefined;
  
  const hasApiKey = credentials?.apiKeyPresent === true;
  const hasPrivateKey = credentials?.privateKeyPresent === true;
  
  return {
    success: hasApiKey && hasPrivateKey,
    message: hasApiKey && hasPrivateKey 
      ? 'API keys configured correctly' 
      : `Missing keys: ${!hasApiKey ? 'API_KEY ' : ''}${!hasPrivateKey ? 'PRIVATE_KEY' : ''}`,
    details: { credentials },
  };
}

// Test 3: Signature Generation (via connectivity check)
async function testSignatureGeneration(): Promise<{ success: boolean; message?: string; details?: Record<string, unknown> }> {
  const result = await callProxy('health-check');
  
  if (!result.success) {
    return {
      success: false,
      message: 'Could not test signature generation',
      details: { error: result.error },
    };
  }
  
  const data = result.data as Record<string, unknown>;
  const apiConnectivity = data.apiConnectivity as Record<string, unknown> | undefined;
  
  // If API connectivity succeeded, signing is working
  const signingWorks = apiConnectivity?.success === true;
  
  return {
    success: signingWorks,
    message: signingWorks ? 'Signature generation verified via API connectivity' : 'API connectivity failed - signing may not be working',
    details: { apiConnectivity },
  };
}

// Test 4: Fetch Strains - verify from health check's API connectivity
async function testFetchStrains(): Promise<{ success: boolean; message?: string; details?: Record<string, unknown> }> {
  // Get strains via health check since it already does the signed request
  const result = await callProxy('health-check');
  
  if (!result.success) {
    return {
      success: false,
      message: 'Health check failed',
      details: { error: result.error, data: result.data },
    };
  }
  
  const data = result.data as Record<string, unknown>;
  const apiConnectivity = data.apiConnectivity as Record<string, unknown> | undefined;
  
  // Check if the strains endpoint was successfully called
  const strainsEndpointWorks = apiConnectivity?.success === true && 
                                apiConnectivity?.endpoint === 'GET /strains' &&
                                apiConnectivity?.status === 200;
  
  return {
    success: strainsEndpointWorks,
    message: strainsEndpointWorks ? 'Strains endpoint accessible' : 'Strains endpoint not working',
    details: { apiConnectivity },
  };
}

// Test 5: Verify strains are synced to local database
async function testLocalStrainDatabase(): Promise<{ success: boolean; message?: string; details?: Record<string, unknown> }> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/strains?select=id,name,sku&limit=5`, {
      headers: {
        'apikey': supabaseKey || '',
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });
    
    const strains = await response.json();
    const hasLocalStrains = Array.isArray(strains) && strains.length > 0;
    
    return {
      success: hasLocalStrains,
      message: hasLocalStrains ? `${strains.length} strains in local database` : 'No strains in local database - run sync',
      details: { 
        count: strains?.length || 0,
        sample: strains?.slice(0, 3),
      },
    };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      message: `Database query failed: ${error.message}`,
      details: {},
    };
  }
}

// Test 6: Client Creation Payload Validation (Mock)
async function testClientPayloadValidation(): Promise<{ success: boolean; message?: string; details?: Record<string, unknown> }> {
  // Test with intentionally invalid payload to verify validation
  const invalidPayload = {
    firstName: '', // Empty - should fail
    lastName: 'Test',
    email: 'invalid-email', // Invalid format
  };
  
  const result = await callProxy('Create-Client-Legacy', invalidPayload);
  
  // We expect this to fail with validation error, not server error
  const data = result.data as Record<string, unknown>;
  const hasValidationError = Boolean(data?.error || data?.message || !result.success);
  
  return {
    success: hasValidationError,
    message: hasValidationError ? 'Payload validation working correctly' : 'Validation may not be catching invalid data',
    details: { 
      expectedFailure: true,
      response: data,
    },
  };
}

// Test 7: Check local client records
async function testLocalClientDatabase(): Promise<{ success: boolean; message?: string; details?: Record<string, unknown> }> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/drgreen_clients?select=id,drgreen_client_id,is_kyc_verified,admin_approval&limit=5`, {
      headers: {
        'apikey': supabaseKey || '',
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });
    
    const clients = await response.json();
    const tableExists = response.ok;
    
    return {
      success: tableExists,
      message: tableExists 
        ? `Client table accessible, ${clients?.length || 0} records` 
        : 'Client table not accessible',
      details: { 
        count: clients?.length || 0,
        sample: clients?.slice(0, 2),
      },
    };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      message: `Database query failed: ${error.message}`,
      details: {},
    };
  }
}

// Test 8: Error Response Format
async function testErrorResponseFormat(): Promise<{ success: boolean; message?: string; details?: Record<string, unknown> }> {
  // Call with invalid action to test error handling
  const result = await callProxy('Invalid-Action-That-Does-Not-Exist');
  
  const data = result.data as Record<string, unknown>;
  
  // Should return structured error
  const hasErrorStructure = Boolean(data?.error || data?.message || data?.errorCode);
  
  return {
    success: hasErrorStructure,
    message: hasErrorStructure ? 'Error responses are properly structured' : 'Error response format may need improvement',
    details: { response: data },
  };
}

// Test 9: CORS Headers
async function testCorsHeaders(): Promise<{ success: boolean; message?: string; details?: Record<string, unknown> }> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/drgreen-proxy`, {
      method: 'OPTIONS',
      headers: {
        'apikey': supabaseKey || '',
        'Origin': 'https://example.com',
      },
    });
    
    const corsHeader = response.headers.get('Access-Control-Allow-Origin');
    const allowHeaders = response.headers.get('Access-Control-Allow-Headers');
    
    const hasCors = corsHeader === '*' || (corsHeader?.includes('example.com') ?? false);
    
    return {
      success: hasCors,
      message: hasCors ? 'CORS headers configured correctly' : 'CORS headers may be misconfigured',
      details: { 
        'Access-Control-Allow-Origin': corsHeader,
        'Access-Control-Allow-Headers': allowHeaders,
      },
    };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      message: `CORS test failed: ${error.message}`,
      details: {},
    };
  }
}

// Test 10: Response Time Performance
async function testResponseTime(): Promise<{ success: boolean; message?: string; details?: Record<string, unknown> }> {
  const start = Date.now();
  await callProxy('health-check');
  const duration = Date.now() - start;
  
  const isAcceptable = duration < 5000; // Under 5 seconds
  const isFast = duration < 1000; // Under 1 second
  
  return {
    success: isAcceptable,
    message: isFast ? `Fast response: ${duration}ms` : isAcceptable ? `Acceptable response: ${duration}ms` : `Slow response: ${duration}ms`,
    details: { 
      durationMs: duration,
      threshold: '5000ms',
      rating: isFast ? 'fast' : isAcceptable ? 'acceptable' : 'slow',
    },
  };
}

// ============================================
// MAIN HANDLER
// ============================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const suiteStart = Date.now();
  const results: TestResult[] = [];
  
  console.log('[TEST SUITE] Starting Dr. Green API Proxy Tests');

  // Run all tests
  const tests = [
    { name: '1. Health Check', fn: testHealthCheck },
    { name: '2. API Key Configuration', fn: testApiKeyConfiguration },
    { name: '3. Signature Generation', fn: testSignatureGeneration },
    { name: '4. Strains API Endpoint', fn: testFetchStrains },
    { name: '5. Local Strain Database', fn: testLocalStrainDatabase },
    { name: '6. Client Payload Validation', fn: testClientPayloadValidation },
    { name: '7. Local Client Database', fn: testLocalClientDatabase },
    { name: '8. Error Response Format', fn: testErrorResponseFormat },
    { name: '9. CORS Headers', fn: testCorsHeaders },
    { name: '10. Response Time', fn: testResponseTime },
  ];

  for (const test of tests) {
    console.log(`[TEST] Running: ${test.name}`);
    const result = await runTest(test.name, test.fn);
    results.push(result);
    console.log(`[TEST] ${test.name}: ${result.status} (${result.duration}ms)`);
  }

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;

  const suiteResult: TestSuiteResult = {
    suite: 'Dr. Green API Proxy',
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passed,
    failed,
    skipped,
    duration: Date.now() - suiteStart,
    results,
  };

  console.log(`[TEST SUITE] Complete: ${passed}/${results.length} passed, ${failed} failed`);

  return new Response(JSON.stringify(suiteResult, null, 2), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
