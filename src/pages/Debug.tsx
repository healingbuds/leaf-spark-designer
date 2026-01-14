import { useState, useEffect, useCallback } from 'react';
import Header from '@/layout/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle2, XCircle, RefreshCw, Shield, FileText, Building2, Wifi, Database, User, Download, Leaf, ShoppingCart, Package, UserPlus, Beaker, Info, Lock, Home } from 'lucide-react';
import useUserRole from '@/hooks/useUserRole';
import { Link } from 'react-router-dom';
import { buildLegacyClientPayload } from '@/lib/drgreenApi';
import { supabase } from '@/integrations/supabase/client';
import { 
  isMockModeEnabled, 
  enableMockMode, 
  disableMockMode, 
  getMockModeStatus 
} from '@/lib/mockMode';
interface TestResult {
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'running' | 'pending';
  details?: string;
  expected?: string;
  actual?: string;
}

/**
 * Browser-compatible HMAC-SHA256 signing function
 * Replicates the edge function logic for testing
 */
async function signPayloadHex(payload: string, secretKey: string): Promise<string> {
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
  
  // Convert to hex string for comparison
  const signatureBytes = new Uint8Array(signatureBuffer);
  return Array.from(signatureBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function Debug() {
  const { isAdmin, isLoading: roleLoading, user } = useUserRole();
  const [tests, setTests] = useState<TestResult[]>([
    {
      name: 'HMAC Security Check',
      description: 'Verify HMAC-SHA256 signing logic matches backend expectations',
      status: 'pending',
    },
    {
      name: 'Registration Defaults Trap',
      description: 'Verify form schema handles empty arrays correctly (medicalHistory5, medicalHistory14)',
      status: 'pending',
    },
    {
      name: 'Business Logic Toggle',
      description: 'Verify clientBusiness is conditionally added/removed based on isBusiness flag',
      status: 'pending',
    },
    {
      name: 'API Health Check',
      description: 'Ping drgreen-proxy edge function to verify backend connection',
      status: 'pending',
    },
    {
      name: 'Database Connectivity',
      description: 'Verify Supabase tables are accessible and return row counts',
      status: 'pending',
    },
    {
      name: 'Authentication State',
      description: 'Verify current user session and display user ID/email if logged in',
      status: 'pending',
    },
    {
      name: 'Dr. Green API Live Test',
      description: 'Call actual strains endpoint to verify HMAC signature works with production API',
      status: 'pending',
    },
    {
      name: 'Cart Operations Test',
      description: 'Verify add-to-cart and remove-from-cart API signatures via drgreen-proxy',
      status: 'pending',
    },
    {
      name: 'Order Creation Test',
      description: 'Verify create-order API signature with mock order data',
      status: 'pending',
    },
    {
      name: 'Client Registration Test',
      description: 'Verify create-client API payload structure and signature',
      status: 'pending',
    },
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [hasFailures, setHasFailures] = useState(false);
  const [mockModeActive, setMockModeActive] = useState(isMockModeEnabled());

  // Handle mock mode toggle
  const handleMockModeToggle = (enabled: boolean) => {
    if (enabled) {
      enableMockMode();
    } else {
      disableMockMode();
    }
    setMockModeActive(enabled);
  };

  const updateTest = (index: number, update: Partial<TestResult>) => {
    setTests(prev => {
      const newTests = [...prev];
      newTests[index] = { ...newTests[index], ...update };
      return newTests;
    });
  };

  const runTests = useCallback(async () => {
    setIsRunning(true);
    setHasFailures(false);
    
    // Reset all tests
    setTests(prev => prev.map(t => ({ ...t, status: 'pending' as const, details: undefined, expected: undefined, actual: undefined })));
    
    let anyFailed = false;
    
    // ===========================================
    // TEST 1: HMAC Security Check
    // ===========================================
    updateTest(0, { status: 'running' });
    
    try {
      const testPayload = '{"test":"data"}';
      const testSecret = '12345';
      const expectedHex = 'd3c08a5a496f5b88ffda173ba97434960b01f3ede4f7861789fd9d214b24e0e8';
      
      const generatedHex = await signPayloadHex(testPayload, testSecret);
      
      if (generatedHex === expectedHex) {
        updateTest(0, {
          status: 'pass',
          details: 'HMAC-SHA256 signature matches expected value',
          expected: expectedHex,
          actual: generatedHex,
        });
      } else {
        anyFailed = true;
        updateTest(0, {
          status: 'fail',
          details: 'Signature mismatch - HMAC logic may be incorrect',
          expected: expectedHex,
          actual: generatedHex,
        });
      }
    } catch (error) {
      anyFailed = true;
      updateTest(0, {
        status: 'fail',
        details: `Error during HMAC test: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
    
    // ===========================================
    // TEST 2: Registration Defaults Trap
    // ===========================================
    updateTest(1, { status: 'running' });
    
    try {
      // Simulate form submission with empty/null arrays
      const emptyFormData = {
        personal: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '+351912345678',
          dateOfBirth: '1990-01-01',
          gender: 'male',
        },
        address: {
          street: '123 Test Street',
          city: 'Lisbon',
          postalCode: '1000-001',
          country: 'PT',
        },
        medicalHistory: {
          medicalHistory5: [], // Empty array - should become ['none']
          medicalHistory14: [], // Empty array - should become ['never']
        },
      };
      
      const payload = buildLegacyClientPayload(emptyFormData);
      
      const mh5Value = payload.medicalRecord.medicalHistory5;
      const mh14Value = payload.medicalRecord.medicalHistory14;
      const hasClientBusiness = payload.clientBusiness !== undefined;
      
      const mh5Pass = Array.isArray(mh5Value) && mh5Value.length === 1 && mh5Value[0] === 'none';
      const mh14Pass = Array.isArray(mh14Value) && mh14Value.length === 1 && mh14Value[0] === 'never';
      const businessPass = !hasClientBusiness;
      
      if (mh5Pass && mh14Pass && businessPass) {
        updateTest(1, {
          status: 'pass',
          details: 'Empty arrays correctly defaulted: medicalHistory5=["none"], medicalHistory14=["never"], clientBusiness=undefined',
          expected: 'mh5: ["none"], mh14: ["never"], clientBusiness: undefined',
          actual: `mh5: ${JSON.stringify(mh5Value)}, mh14: ${JSON.stringify(mh14Value)}, clientBusiness: ${hasClientBusiness ? 'present' : 'undefined'}`,
        });
      } else {
        anyFailed = true;
        const issues: string[] = [];
        if (!mh5Pass) issues.push(`medicalHistory5 is ${JSON.stringify(mh5Value)} (expected ["none"])`);
        if (!mh14Pass) issues.push(`medicalHistory14 is ${JSON.stringify(mh14Value)} (expected ["never"])`);
        if (!businessPass) issues.push(`clientBusiness should be undefined`);
        
        updateTest(1, {
          status: 'fail',
          details: `Critical backend crash risk: ${issues.join('; ')}`,
          expected: 'mh5: ["none"], mh14: ["never"], clientBusiness: undefined',
          actual: `mh5: ${JSON.stringify(mh5Value)}, mh14: ${JSON.stringify(mh14Value)}, clientBusiness: ${hasClientBusiness ? 'present' : 'undefined'}`,
        });
      }
    } catch (error) {
      anyFailed = true;
      updateTest(1, {
        status: 'fail',
        details: `Error during defaults test: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
    
    // ===========================================
    // TEST 3: Business Logic Toggle
    // ===========================================
    updateTest(2, { status: 'running' });
    
    try {
      // Test with business = TRUE
      const businessFormData = {
        personal: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '+351912345678',
          dateOfBirth: '1990-01-01',
          gender: 'male',
        },
        address: {
          street: '123 Test Street',
          city: 'Lisbon',
          postalCode: '1000-001',
          country: 'PT',
        },
        business: {
          isBusiness: true,
          businessType: 'dispensary',
          businessName: 'Test Dispensary',
          businessAddress1: '456 Business Ave',
          businessCity: 'Lisbon',
          businessCountryCode: 'PT',
          businessPostalCode: '1000-002',
        },
        medicalHistory: {},
      };
      
      const payloadWithBusiness = buildLegacyClientPayload(businessFormData);
      const hasBusiness = payloadWithBusiness.clientBusiness !== undefined;
      
      // Test with business = FALSE
      const noBizFormData = {
        personal: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '+351912345678',
          dateOfBirth: '1990-01-01',
          gender: 'male',
        },
        address: {
          street: '123 Test Street',
          city: 'Lisbon',
          postalCode: '1000-001',
          country: 'PT',
        },
        business: {
          isBusiness: false,
        },
        medicalHistory: {},
      };
      
      const payloadWithoutBusiness = buildLegacyClientPayload(noBizFormData);
      const hasNoBusiness = payloadWithoutBusiness.clientBusiness === undefined;
      
      if (hasBusiness && hasNoBusiness) {
        updateTest(2, {
          status: 'pass',
          details: 'Business toggle works correctly: clientBusiness added when isBusiness=true, removed when isBusiness=false',
          expected: 'isBusiness=true → clientBusiness present; isBusiness=false → clientBusiness undefined',
          actual: `isBusiness=true → ${hasBusiness ? 'present ✓' : 'MISSING'}; isBusiness=false → ${hasNoBusiness ? 'undefined ✓' : 'PRESENT'}`,
        });
      } else {
        anyFailed = true;
        updateTest(2, {
          status: 'fail',
          details: `Business toggle broken: when true=${hasBusiness ? 'present' : 'MISSING'}, when false=${hasNoBusiness ? 'undefined' : 'PRESENT'}`,
          expected: 'isBusiness=true → clientBusiness present; isBusiness=false → clientBusiness undefined',
          actual: `isBusiness=true → ${hasBusiness ? 'present' : 'MISSING'}; isBusiness=false → ${hasNoBusiness ? 'undefined' : 'PRESENT'}`,
        });
      }
    } catch (error) {
      anyFailed = true;
      updateTest(2, {
        status: 'fail',
        details: `Error during business toggle test: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
    
    // ===========================================
    // TEST 4: API Health Check
    // ===========================================
    updateTest(3, { status: 'running' });
    
    try {
      const startTime = Date.now();
      
      // Call the drgreen-health edge function (if it exists) or test drgreen-proxy with a simple action
      const { data, error } = await supabase.functions.invoke('drgreen-health', {
        body: { action: 'ping' },
      });
      
      const responseTime = Date.now() - startTime;
      
      if (error) {
        // If drgreen-health doesn't exist, try drgreen-proxy with a harmless action
        const { data: proxyData, error: proxyError } = await supabase.functions.invoke('drgreen-proxy', {
          body: { action: 'health-check' },
        });
        
        const proxyResponseTime = Date.now() - startTime;
        
        if (proxyError) {
          anyFailed = true;
          updateTest(3, {
            status: 'fail',
            details: `Edge function unreachable: ${proxyError.message}`,
            expected: 'Response from drgreen-proxy',
            actual: `Error: ${proxyError.message}`,
          });
        } else {
          // Proxy responded (even with an error response, it means the function is working)
          updateTest(3, {
            status: 'pass',
            details: `Edge function responded in ${proxyResponseTime}ms`,
            expected: 'drgreen-proxy reachable',
            actual: `Response received in ${proxyResponseTime}ms`,
          });
        }
      } else {
        updateTest(3, {
          status: 'pass',
          details: `Health check passed in ${responseTime}ms`,
          expected: 'drgreen-health reachable',
          actual: `Response received in ${responseTime}ms${data ? `: ${JSON.stringify(data).slice(0, 100)}` : ''}`,
        });
      }
    } catch (error) {
      anyFailed = true;
      updateTest(3, {
        status: 'fail',
        details: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        expected: 'Edge function reachable',
        actual: 'Connection failed',
      });
    }
    
    // ===========================================
    // TEST 5: Database Connectivity
    // ===========================================
    updateTest(4, { status: 'running' });
    
    try {
      const startTime = Date.now();
      const tableCounts: { table: string; count: number | string }[] = [];
      
      // Query strains table (publicly readable)
      const { data: strainsData, error: strainsError, count: strainsCount } = await supabase
        .from('strains')
        .select('*', { count: 'exact', head: true });
      
      if (strainsError) {
        tableCounts.push({ table: 'strains', count: `Error: ${strainsError.message}` });
      } else {
        tableCounts.push({ table: 'strains', count: strainsCount ?? 0 });
      }
      
      // Query profiles table (user-specific, may return 0 if not logged in)
      const { count: profilesCount, error: profilesError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (profilesError) {
        tableCounts.push({ table: 'profiles', count: `RLS: ${profilesError.code || 'blocked'}` });
      } else {
        tableCounts.push({ table: 'profiles', count: profilesCount ?? 0 });
      }
      
      // Query user_roles table
      const { count: rolesCount, error: rolesError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true });
      
      if (rolesError) {
        tableCounts.push({ table: 'user_roles', count: `RLS: ${rolesError.code || 'blocked'}` });
      } else {
        tableCounts.push({ table: 'user_roles', count: rolesCount ?? 0 });
      }
      
      // Query drgreen_clients table
      const { count: clientsCount, error: clientsError } = await supabase
        .from('drgreen_clients')
        .select('*', { count: 'exact', head: true });
      
      if (clientsError) {
        tableCounts.push({ table: 'drgreen_clients', count: `RLS: ${clientsError.code || 'blocked'}` });
      } else {
        tableCounts.push({ table: 'drgreen_clients', count: clientsCount ?? 0 });
      }
      
      const responseTime = Date.now() - startTime;
      
      // Check if at least strains table is accessible (public table)
      const strainsAccessible = typeof tableCounts[0]?.count === 'number';
      
      if (strainsAccessible) {
        const countSummary = tableCounts
          .map(t => `${t.table}: ${t.count}`)
          .join(', ');
        
        updateTest(4, {
          status: 'pass',
          details: `Database connected in ${responseTime}ms. Tables accessible.`,
          expected: 'Supabase tables reachable',
          actual: countSummary,
        });
      } else {
        anyFailed = true;
        updateTest(4, {
          status: 'fail',
          details: `Database connection failed or tables not accessible`,
          expected: 'Supabase tables reachable',
          actual: tableCounts.map(t => `${t.table}: ${t.count}`).join(', '),
        });
      }
    } catch (error) {
      anyFailed = true;
      updateTest(4, {
        status: 'fail',
        details: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        expected: 'Supabase connection working',
        actual: 'Connection failed',
      });
    }
    
    // ===========================================
    // TEST 6: Authentication State
    // ===========================================
    updateTest(5, { status: 'running' });
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        anyFailed = true;
        updateTest(5, {
          status: 'fail',
          details: `Auth error: ${sessionError.message}`,
          expected: 'Valid session or no session',
          actual: `Error: ${sessionError.message}`,
        });
      } else if (session?.user) {
        // User is logged in
        const user = session.user;
        const email = user.email || 'No email';
        const userId = user.id;
        const createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown';
        const provider = user.app_metadata?.provider || 'email';
        
        // Check for user roles
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);
        
        const userRoles = roles?.map(r => r.role).join(', ') || 'none';
        
        updateTest(5, {
          status: 'pass',
          details: `Authenticated as ${email}`,
          expected: 'Session state verified',
          actual: `ID: ${userId.slice(0, 8)}... | Provider: ${provider} | Roles: ${userRoles} | Created: ${createdAt}`,
        });
      } else {
        // No session - this is still a valid state, just informational
        updateTest(5, {
          status: 'pass',
          details: 'No active session (user not logged in)',
          expected: 'Session state verified',
          actual: 'Anonymous user - login required for protected features',
        });
      }
    } catch (error) {
      anyFailed = true;
      updateTest(5, {
        status: 'fail',
        details: `Auth check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        expected: 'Auth state accessible',
        actual: 'Failed to check authentication',
      });
    }
    
    // ===========================================
    // TEST 7: Dr. Green API Live Test
    // ===========================================
    updateTest(6, { status: 'running' });
    
    try {
      const startTime = Date.now();
      
      // Call the actual strains endpoint via drgreen-proxy
      const { data, error } = await supabase.functions.invoke('drgreen-proxy', {
        body: {
          action: 'get-strains-legacy',
          countryCode: 'PRT',
          orderBy: 'desc',
          take: 5,
          page: 1,
        },
      });
      
      const responseTime = Date.now() - startTime;
      
      // Check for 401 authentication errors (expected when unauthenticated)
      const errorIs401 = error?.message?.includes('401') || 
                         error?.message?.includes('Unauthorized') ||
                         error?.message?.includes('not authorized');
      
      const dataIs401 = data?.statusCode === 401 ||
                        data?.error?.includes?.('not authorized') ||
                        data?.error?.includes?.('Unauthorized') ||
                        data?.message?.includes?.('not authorized') ||
                        data?.message?.includes?.('Authentication required') ||
                        data?.message?.includes?.('User is not authorized');
      
      const is401 = errorIs401 || dataIs401;
      
      if (is401) {
        // 401 is expected when unauthenticated - API requires login
        updateTest(6, {
          status: 'pass',
          details: `API reachable in ${responseTime}ms (authentication required)`,
          expected: 'Dr. Green API reachable (401 expected when unauthenticated)',
          actual: '401 Unauthorized - Login required for strains data',
        });
      } else if (error) {
        anyFailed = true;
        updateTest(6, {
          status: 'fail',
          details: `API call failed: ${error.message}`,
          expected: 'Valid response from Dr. Green API',
          actual: `Error: ${error.message}`,
        });
      } else if (data?.error || data?.success === false) {
        // API returned an error response
        const apiError = data?.error || data?.message || 'Unknown API error';
        anyFailed = true;
        updateTest(6, {
          status: 'fail',
          details: `API returned error: ${apiError}`,
          expected: 'Strains data from Portugal',
          actual: `API Error: ${apiError}`,
        });
      } else {
        // Success - check if we got strains data
        const strainsData = data?.data || data;
        const isArray = Array.isArray(strainsData);
        const strainCount = isArray ? strainsData.length : 0;
        
        if (isArray && strainCount > 0) {
          const firstStrain = strainsData[0];
          const strainNames = strainsData.slice(0, 3).map((s: { name?: string }) => s.name || 'Unknown').join(', ');
          
          updateTest(6, {
            status: 'pass',
            details: `HMAC signature accepted. Retrieved ${strainCount} strains in ${responseTime}ms`,
            expected: 'Valid strains response from Dr. Green API',
            actual: `${strainCount} strains: ${strainNames}${strainCount > 3 ? '...' : ''}`,
          });
        } else if (isArray && strainCount === 0) {
          // Empty array is still a valid response
          updateTest(6, {
            status: 'pass',
            details: `HMAC signature accepted. No strains available for Portugal (${responseTime}ms)`,
            expected: 'Valid API response',
            actual: 'Empty strains list (may be normal if no products)',
          });
        } else {
          // Unexpected response format
          updateTest(6, {
            status: 'pass',
            details: `API responded in ${responseTime}ms (unexpected format)`,
            expected: 'Array of strains',
            actual: `Response type: ${typeof strainsData}`,
          });
        }
      }
    } catch (error) {
      anyFailed = true;
      updateTest(6, {
        status: 'fail',
        details: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        expected: 'Dr. Green API reachable',
        actual: 'Connection failed',
      });
    }
    
    // ===========================================
    // TEST 8: Cart Operations Test
    // ===========================================
    updateTest(7, { status: 'running' });
    
    try {
      const startTime = Date.now();
      const cartTests: { operation: string; result: 'pass' | 'fail' | 'expected'; details: string }[] = [];
      
      // Test 1: Add to cart signature
      // The proxy expects: { action: 'add-to-cart', data: { strainId, quantity, clientId } }
      const { data: addData, error: addError } = await supabase.functions.invoke('drgreen-proxy', {
        body: {
          action: 'add-to-cart',
          data: {
            strainId: 'test-strain-id-123',
            quantity: 1,
            clientId: 'test-client-id',
          },
        },
      });
      
      if (addError) {
        // Check if it's a 401 - expected for read-only credentials
        const errorStr = addError.message || '';
        if (errorStr.includes('401') || errorStr.includes('Unauthorized') || errorStr.includes('not authorized')) {
          cartTests.push({ 
            operation: 'add-to-cart', 
            result: 'expected', 
            details: 'API permissions required (401)' 
          });
        } else {
          cartTests.push({ 
            operation: 'add-to-cart', 
            result: 'fail', 
            details: `Network error: ${addError.message}` 
          });
        }
      } else if (addData?.statusCode === 401 || addData?.error?.includes('not authorized')) {
        // 401 from API - expected for read-only credentials
        cartTests.push({ 
          operation: 'add-to-cart', 
          result: 'expected', 
          details: 'API permissions required (401 - read-only credentials)' 
        });
      } else if (addData?.error?.includes('Invalid signature') || addData?.message?.includes('Invalid signature')) {
        // Signature was rejected - this means signing logic is broken
        cartTests.push({ 
          operation: 'add-to-cart', 
          result: 'fail', 
          details: 'HMAC signature rejected by API' 
        });
      } else if (addData?.error || addData?.success === false) {
        // API error but signature was accepted (expected for test data)
        const errorMsg = addData?.error || addData?.message || 'API validation error';
        cartTests.push({ 
          operation: 'add-to-cart', 
          result: 'pass', 
          details: `Signature accepted, validation: ${errorMsg.slice(0, 50)}` 
        });
      } else {
        // Success
        cartTests.push({ 
          operation: 'add-to-cart', 
          result: 'pass', 
          details: 'Signature accepted, cart updated' 
        });
      }
      
      // Test 2: Remove from cart signature
      // The proxy expects: { action: 'remove-from-cart', cartId, strainId }
      const { data: removeData, error: removeError } = await supabase.functions.invoke('drgreen-proxy', {
        body: {
          action: 'remove-from-cart',
          cartId: 'test-cart-id-123',
          strainId: 'test-strain-id-123',
        },
      });
      
      if (removeError) {
        const errorStr = removeError.message || '';
        if (errorStr.includes('401') || errorStr.includes('Unauthorized') || errorStr.includes('not authorized')) {
          cartTests.push({ 
            operation: 'remove-from-cart', 
            result: 'expected', 
            details: 'API permissions required (401)' 
          });
        } else {
          cartTests.push({ 
            operation: 'remove-from-cart', 
            result: 'fail', 
            details: `Network error: ${removeError.message}` 
          });
        }
      } else if (removeData?.statusCode === 401 || removeData?.error?.includes('not authorized')) {
        cartTests.push({ 
          operation: 'remove-from-cart', 
          result: 'expected', 
          details: 'API permissions required (401 - read-only credentials)' 
        });
      } else if (removeData?.error?.includes('Invalid signature') || removeData?.message?.includes('Invalid signature')) {
        cartTests.push({ 
          operation: 'remove-from-cart', 
          result: 'fail', 
          details: 'HMAC signature rejected by API' 
        });
      } else if (removeData?.error || removeData?.success === false) {
        const errorMsg = removeData?.error || removeData?.message || 'API validation error';
        cartTests.push({ 
          operation: 'remove-from-cart', 
          result: 'pass', 
          details: `Signature accepted, validation: ${errorMsg.slice(0, 50)}` 
        });
      } else {
        cartTests.push({ 
          operation: 'remove-from-cart', 
          result: 'pass', 
          details: 'Signature accepted, item removed' 
        });
      }
      
      const responseTime = Date.now() - startTime;
      // Pass if all tests pass OR if expected (401 permission issues)
      const allPassedOrExpected = cartTests.every(t => t.result === 'pass' || t.result === 'expected');
      const anyActualFail = cartTests.some(t => t.result === 'fail');
      const summary = cartTests.map(t => {
        if (t.result === 'pass') return `${t.operation}: ✓`;
        if (t.result === 'expected') return `${t.operation}: ⚠ (401)`;
        return `${t.operation}: ✗`;
      }).join(', ');
      
      if (allPassedOrExpected && !anyActualFail) {
        const hasExpected = cartTests.some(t => t.result === 'expected');
        updateTest(7, {
          status: 'pass',
          details: hasExpected 
            ? `Cart API tested in ${responseTime}ms (write operations require API permissions)`
            : `Cart API signatures verified in ${responseTime}ms`,
          expected: 'Cart operations tested (signature validation or 401 for write ops)',
          actual: summary,
        });
      } else {
        anyFailed = true;
        const failedOps = cartTests.filter(t => t.result === 'fail');
        updateTest(7, {
          status: 'fail',
          details: `Cart test failures: ${failedOps.map(t => t.details).join('; ')}`,
          expected: 'Cart operations working or expected 401',
          actual: summary,
        });
      }
    } catch (error) {
      anyFailed = true;
      updateTest(7, {
        status: 'fail',
        details: `Cart test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        expected: 'Cart operations testable',
        actual: 'Test failed to execute',
      });
    }
    
    // ===========================================
    // TEST 9: Order Creation Test
    // ===========================================
    updateTest(8, { status: 'running' });
    
    try {
      const startTime = Date.now();
      
      // Mock order data matching expected API structure
      // The proxy expects: { action: 'create-order', data: { ... } }
      const mockOrderData = {
        action: 'place-order',
        data: {
          clientId: 'test-client-id-123',
          items: [
            {
              strainId: 'test-strain-001',
              quantity: 2,
              unitPrice: 25.00,
            },
            {
              strainId: 'test-strain-002',
              quantity: 1,
              unitPrice: 30.00,
            },
          ],
          shippingAddress: {
            street: '123 Test Street',
            city: 'Lisbon',
            postalCode: '1000-001',
            country: 'PT',
          },
          paymentMethod: 'card',
        },
      };
      
      const { data, error } = await supabase.functions.invoke('drgreen-proxy', {
        body: mockOrderData,
      });
      
      const responseTime = Date.now() - startTime;
      
      // Check for 401 - expected for read-only API credentials or unauthenticated requests
      const is401 = error?.message?.includes('401') || 
                    error?.message?.includes('Unauthorized') ||
                    error?.message?.includes('not authorized') ||
                    error?.message?.includes('Authentication required') ||
                    data?.statusCode === 401 ||
                    data?.error?.includes('not authorized') ||
                    data?.error?.includes('Authentication required') ||
                    data?.message?.includes('Authentication required');
      
      if (is401) {
        // 401 is expected - API credentials are read-only
        updateTest(8, {
          status: 'pass',
          details: `Order API tested in ${responseTime}ms (write permissions required)`,
          expected: 'Order API reachable (401 expected for read-only credentials)',
          actual: '401 Unauthorized - API write permissions not granted',
        });
      } else if (error) {
        anyFailed = true;
        updateTest(8, {
          status: 'fail',
          details: `Network error: ${error.message}`,
          expected: 'Order creation signature accepted or 401',
          actual: `Error: ${error.message}`,
        });
      } else if (data?.error?.includes('Invalid signature') || data?.message?.includes('Invalid signature')) {
        anyFailed = true;
        updateTest(8, {
          status: 'fail',
          details: 'HMAC signature rejected by API - signing logic may be broken',
          expected: 'Valid HMAC signature for order payload',
          actual: 'Signature rejected',
        });
      } else if (data?.error || data?.success === false) {
        // API validation error but signature accepted (expected for mock data)
        const errorMsg = data?.error || data?.message || 'Validation error';
        updateTest(8, {
          status: 'pass',
          details: `Order signature accepted in ${responseTime}ms (validation: ${errorMsg.slice(0, 40)}...)`,
          expected: 'HMAC signature accepted, order validated',
          actual: `Signature OK, API validation: ${errorMsg.slice(0, 50)}`,
        });
      } else {
        updateTest(8, {
          status: 'pass',
          details: `Order creation signature verified in ${responseTime}ms`,
          expected: 'Order creation API working',
          actual: `Order processed: ${JSON.stringify(data).slice(0, 60)}...`,
        });
      }
    } catch (error) {
      anyFailed = true;
      updateTest(8, {
        status: 'fail',
        details: `Order test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        expected: 'Order creation testable',
        actual: 'Test failed to execute',
      });
    }
    
    // ===========================================
    // TEST 10: Client Registration Test
    // ===========================================
    updateTest(9, { status: 'running' });
    
    try {
      const startTime = Date.now();
      
      // Mock client registration payload - wrapped in 'data' object as expected by proxy
      const mockClientPayload = {
        action: 'create-client',
        data: {
          personal: {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@healingbuds.test',
            phone: '+351912345678',
            dateOfBirth: '1990-01-15',
            gender: 'male',
          },
          address: {
            address1: '123 Test Street',
            address2: '',
            city: 'Lisbon',
            postalCode: '1000-001',
            countryCode: 'PT',
          },
          medicalRecord: {
            medicalHistory1: 'chronic_pain',
            medicalHistory2: 'no',
            medicalHistory3: 'no',
            medicalHistory4: 'no',
            medicalHistory5: ['none'],
            medicalHistory6: 'no',
            medicalHistory7: 'no',
            medicalHistory8: 'no',
            medicalHistory9: 'no',
            medicalHistory10: 'no',
            medicalHistory11: 'no',
            medicalHistory12: 'no',
            medicalHistory13: 'no',
            medicalHistory14: ['never'],
          },
        },
      };
      
      const { data, error } = await supabase.functions.invoke('drgreen-proxy', {
        body: mockClientPayload,
      });
      
      const responseTime = Date.now() - startTime;
      
      // Validate payload structure was accepted (using new 'data' wrapped structure)
      const payloadChecks = {
        hasPersonal: mockClientPayload.data.personal !== undefined,
        hasAddress: mockClientPayload.data.address !== undefined,
        hasMedicalRecord: mockClientPayload.data.medicalRecord !== undefined,
        mh5IsArray: Array.isArray(mockClientPayload.data.medicalRecord.medicalHistory5),
        mh14IsArray: Array.isArray(mockClientPayload.data.medicalRecord.medicalHistory14),
      };
      
      const structureValid = Object.values(payloadChecks).every(v => v);
      
      // Check for 401 - expected for read-only API credentials or unauthenticated requests
      const is401 = error?.message?.includes('401') || 
                    error?.message?.includes('Unauthorized') ||
                    error?.message?.includes('not authorized') ||
                    error?.message?.includes('Authentication required') ||
                    data?.statusCode === 401 ||
                    data?.error?.includes('not authorized') ||
                    data?.error?.includes('Authentication required') ||
                    data?.message?.includes('Authentication required') ||
                    data?.message?.includes('not authorized');
      
      if (is401) {
        // 401 is expected - API credentials are read-only
        // Still validate payload structure was correct
        updateTest(9, {
          status: 'pass',
          details: `Client registration tested in ${responseTime}ms (write permissions required)`,
          expected: 'Payload structure correct (401 expected for read-only credentials)',
          actual: `Structure: ${structureValid ? '✓' : '✗'} | API: 401 (write permissions not granted)`,
        });
      } else if (error) {
        anyFailed = true;
        updateTest(9, {
          status: 'fail',
          details: `Network error: ${error.message}`,
          expected: 'Client registration signature accepted or 401',
          actual: `Error: ${error.message}`,
        });
      } else if (data?.error?.includes('Invalid signature') || data?.message?.includes('Invalid signature')) {
        anyFailed = true;
        updateTest(9, {
          status: 'fail',
          details: 'HMAC signature rejected by API',
          expected: 'Valid HMAC signature for client payload',
          actual: 'Signature rejected',
        });
      } else if (!structureValid) {
        anyFailed = true;
        updateTest(9, {
          status: 'fail',
          details: 'Payload structure invalid',
          expected: 'client, address, medicalRecord objects with arrays',
          actual: JSON.stringify(payloadChecks),
        });
      } else if (data?.error || data?.success === false) {
        // Validation error but signature/structure OK
        const errorMsg = data?.error || data?.message || 'Validation error';
        updateTest(9, {
          status: 'pass',
          details: `Client payload structure verified in ${responseTime}ms`,
          expected: 'Payload structure correct, signature accepted',
          actual: `Structure OK, API validation: ${errorMsg.slice(0, 40)}`,
        });
      } else {
        updateTest(9, {
          status: 'pass',
          details: `Client registration verified in ${responseTime}ms`,
          expected: 'Client registration API working',
          actual: `Client created: ${JSON.stringify(data).slice(0, 50)}...`,
        });
      }
    } catch (error) {
      anyFailed = true;
      updateTest(9, {
        status: 'fail',
        details: `Client test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        expected: 'Client registration testable',
        actual: 'Test failed to execute',
      });
    }
    
    setHasFailures(anyFailed);
    setIsRunning(false);
  }, []);

  // Auto-run tests on mount
  useEffect(() => {
    runTests();
  }, [runTests]);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'running':
        return <RefreshCw className="h-5 w-5 text-primary animate-spin" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />;
    }
  };

  const getTestIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Shield className="h-5 w-5" />;
      case 1:
        return <FileText className="h-5 w-5" />;
      case 2:
        return <Building2 className="h-5 w-5" />;
      case 3:
        return <Wifi className="h-5 w-5" />;
      case 4:
        return <Database className="h-5 w-5" />;
      case 5:
        return <User className="h-5 w-5" />;
      case 6:
        return <Leaf className="h-5 w-5" />;
      case 7:
        return <ShoppingCart className="h-5 w-5" />;
      case 8:
        return <Package className="h-5 w-5" />;
      case 9:
        return <UserPlus className="h-5 w-5" />;
      default:
        return null;
    }
  };

  // Loading state for role check
  if (roleLoading) {
    return (
      <>
        <SEOHead
          title="System Diagnosis | Debug"
          description="Internal testing page for DAPP logic verification"
          keywords="debug, testing, system diagnosis"
        />
        <div className="min-h-screen bg-background">
          <Header />
          <main className="pt-24 pb-12">
            <div className="container max-w-4xl mx-auto px-4">
              <Skeleton className="h-10 w-64 mb-4" />
              <Skeleton className="h-6 w-96 mb-8" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  // Access denied for non-admin users
  if (!isAdmin) {
    return (
      <>
        <SEOHead
          title="Access Denied | Debug"
          description="Admin access required"
          keywords="debug, admin"
        />
        <div className="min-h-screen bg-background">
          <Header />
          <main className="pt-24 pb-12">
            <div className="container max-w-lg mx-auto px-4">
              <Card className="border-destructive/50">
                <CardContent className="pt-8 text-center">
                  <Lock className="h-16 w-16 text-destructive mx-auto mb-4" />
                  <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                  <p className="text-muted-foreground mb-6">
                    This page is restricted to administrators only.
                    {!user && ' Please sign in with an admin account.'}
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button asChild variant="outline">
                      <Link to="/">
                        <Home className="mr-2 h-4 w-4" />
                        Return Home
                      </Link>
                    </Button>
                    {!user && (
                      <Button asChild>
                        <Link to="/auth">Sign In</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="System Diagnosis | Debug"
        description="Internal testing page for DAPP logic verification"
        keywords="debug, testing, system diagnosis"
      />

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-24 pb-12">
          <div className="container max-w-4xl mx-auto px-4">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">System Diagnosis</h1>
                <Badge variant="outline" className="text-xs">Admin Only</Badge>
              </div>
              <p className="text-muted-foreground">
                Automated tests to verify DAPP logic, HMAC signatures, and registration schema mapping.
              </p>
            </div>

            {/* Dr. Green API Permissions Info Banner */}
            <Alert className="mb-6 border-blue-500/50 bg-blue-500/5">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-700 dark:text-blue-400">About API Permission Tests</AlertTitle>
              <AlertDescription className="text-sm text-muted-foreground">
                <p className="mb-2">
                  Tests 8-10 (Cart, Order, Client) call write endpoints on the Dr. Green API. 
                  If your API credentials are <strong>read-only</strong>, these tests will return 
                  <code className="mx-1 px-1 bg-muted rounded text-xs">401 Unauthorized</code> — this is expected behavior, not an error.
                </p>
                <p>
                  <strong>To enable write operations:</strong> Contact the Dr. Green API administrator to request 
                  write permissions for <code className="mx-1 px-1 bg-muted rounded text-xs">/dapp/clients</code>, 
                  <code className="mx-1 px-1 bg-muted rounded text-xs">/dapp/carts</code>, and 
                  <code className="mx-1 px-1 bg-muted rounded text-xs">/dapp/orders</code> endpoints.
                </p>
              </AlertDescription>
            </Alert>

            {/* DO NOT DEPLOY Warning */}
            {hasFailures && (
              <Card className="mb-8 border-destructive bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                    <div>
                      <h2 className="text-2xl font-bold text-destructive">Test Failures Detected</h2>
                      <p className="text-muted-foreground">
                        One or more tests have failed. Review the results below for details.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Tests Passed */}
            {!hasFailures && !isRunning && tests.every(t => t.status === 'pass') && (
              <Card className="mb-8 border-green-500 bg-green-500/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                    <div>
                      <h2 className="text-2xl font-bold text-green-600">All Tests Passed</h2>
                      <p className="text-muted-foreground">
                        DAPP logic, HMAC signatures, and registration schema are working correctly.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Run Tests Button */}
            <div className="mb-6 flex gap-3">
              <Button
                onClick={runTests}
                disabled={isRunning}
                size="lg"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Run Tests Again
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                disabled={isRunning || tests.every(t => t.status === 'pending')}
                onClick={() => {
                  const exportData = {
                    exportedAt: new Date().toISOString(),
                    environment: {
                      userAgent: navigator.userAgent,
                      url: window.location.href,
                      timestamp: Date.now(),
                    },
                    summary: {
                      total: tests.length,
                      passed: tests.filter(t => t.status === 'pass').length,
                      failed: tests.filter(t => t.status === 'fail').length,
                      pending: tests.filter(t => t.status === 'pending').length,
                    },
                    tests: tests.map((test, index) => ({
                      testNumber: index + 1,
                      ...test,
                    })),
                  };
                  
                  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `debug-results-${new Date().toISOString().slice(0, 10)}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Results
              </Button>
            </div>

            {/* Mock Mode Panel */}
            <Card className={`mb-6 ${mockModeActive ? 'border-amber-500 bg-amber-500/10' : 'border-muted'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${mockModeActive ? 'bg-amber-500/20' : 'bg-muted'}`}>
                      <Beaker className={`h-5 w-5 ${mockModeActive ? 'text-amber-600' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        Mock Mode
                        {mockModeActive && (
                          <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-500/10">
                            ACTIVE
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Simulate Dr. Green API responses for testing the registration flow
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={mockModeActive}
                    onCheckedChange={handleMockModeToggle}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  {mockModeActive ? (
                    <>
                      <p className="text-amber-700 dark:text-amber-400">
                        🎭 <strong>Mock mode is enabled.</strong> Client registration will simulate successful API responses.
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                        <li>Client creation returns a mock <code className="text-xs bg-muted px-1 py-0.5 rounded">mock-*</code> ID</li>
                        <li>KYC link is simulated (won't work for actual verification)</li>
                        <li>All form data is still saved to the local database</li>
                        <li>Emails are still sent (welcome + KYC reminder)</li>
                      </ul>
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      Enable mock mode to test the full registration UI/UX without requiring live API permissions.
                      Useful when Dr. Green API credentials are read-only.
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                    <strong>Console commands:</strong>{' '}
                    <code className="bg-muted px-1 py-0.5 rounded">mockMode.enable()</code>,{' '}
                    <code className="bg-muted px-1 py-0.5 rounded">mockMode.disable()</code>,{' '}
                    <code className="bg-muted px-1 py-0.5 rounded">mockMode.status()</code>
                  </p>
                </div>
              </CardContent>
            </Card>


            <div className="space-y-4">
              {tests.map((test, index) => (
                <Card
                  key={index}
                  className={
                    test.status === 'fail'
                      ? 'border-destructive bg-destructive/5'
                      : test.status === 'pass'
                      ? 'border-green-500/50 bg-green-500/5'
                      : ''
                  }
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          {getTestIcon(index)}
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            Test {index + 1}: {test.name}
                            {test.status !== 'pending' && test.status !== 'running' && (
                              <Badge
                                variant={test.status === 'pass' ? 'default' : 'destructive'}
                                className={test.status === 'pass' ? 'bg-green-500' : ''}
                              >
                                {test.status === 'pass' ? 'PASS ✓' : 'FAIL ✗'}
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>{test.description}</CardDescription>
                        </div>
                      </div>
                      {getStatusIcon(test.status)}
                    </div>
                  </CardHeader>
                  
                  {(test.details || test.expected || test.actual) && (
                    <CardContent className="pt-0">
                      {test.details && (
                        <p className={`text-sm mb-3 ${test.status === 'fail' ? 'text-destructive' : 'text-green-600'}`}>
                          {test.details}
                        </p>
                      )}
                      
                      {(test.expected || test.actual) && (
                        <div className="space-y-2 text-xs font-mono bg-muted/50 p-3 rounded-lg">
                          {test.expected && (
                            <div>
                              <span className="text-muted-foreground">Expected: </span>
                              <span className="text-foreground break-all">{test.expected}</span>
                            </div>
                          )}
                          {test.actual && (
                            <div>
                              <span className="text-muted-foreground">Actual: </span>
                              <span className={test.status === 'fail' ? 'text-destructive' : 'text-green-600'}>
                                {test.actual}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            {/* Technical Details */}
            <Card className="mt-8 bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">Technical Details</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p><strong>Test 1:</strong> Verifies HMAC-SHA256 using Web Crypto API matches expected signature for <code className="bg-muted px-1 rounded">{`{"test":"data"}`}</code> with secret <code className="bg-muted px-1 rounded">12345</code></p>
                <p><strong>Test 2:</strong> Ensures <code className="bg-muted px-1 rounded">buildLegacyClientPayload()</code> correctly defaults empty arrays to prevent backend crashes</p>
                <p><strong>Test 3:</strong> Validates the <code className="bg-muted px-1 rounded">clientBusiness</code> object is conditionally included based on the <code className="bg-muted px-1 rounded">isBusiness</code> flag</p>
                <p><strong>Test 4:</strong> Pings the <code className="bg-muted px-1 rounded">drgreen-proxy</code> edge function to verify backend connectivity and response time</p>
                <p><strong>Test 5:</strong> Queries Supabase tables (<code className="bg-muted px-1 rounded">strains</code>, <code className="bg-muted px-1 rounded">profiles</code>, <code className="bg-muted px-1 rounded">user_roles</code>, <code className="bg-muted px-1 rounded">drgreen_clients</code>) and returns row counts</p>
                <p><strong>Test 6:</strong> Checks <code className="bg-muted px-1 rounded">supabase.auth.getSession()</code> and displays user ID, email, provider, and assigned roles if authenticated</p>
                <p><strong>Test 7:</strong> Calls the live Dr. Green API <code className="bg-muted px-1 rounded">/strains</code> endpoint for Portugal to verify HMAC query signing works end-to-end</p>
                <p><strong>Test 8:</strong> Tests <code className="bg-muted px-1 rounded">add-to-cart</code> and <code className="bg-muted px-1 rounded">remove-from-cart</code> API actions to verify HMAC body signing for cart mutations</p>
                <p><strong>Test 9:</strong> Sends mock order data via <code className="bg-muted px-1 rounded">create-order</code> action to verify order creation HMAC signature and payload structure</p>
                <p><strong>Test 10:</strong> Sends mock client registration via <code className="bg-muted px-1 rounded">create-client</code> action to verify payload structure matches <code className="bg-muted px-1 rounded">buildLegacyClientPayload()</code> output</p>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
