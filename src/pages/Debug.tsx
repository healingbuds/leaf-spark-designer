import { useState, useEffect, useCallback } from 'react';
import Header from '@/layout/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, XCircle, RefreshCw, Shield, FileText, Building2 } from 'lucide-react';
import { buildLegacyClientPayload } from '@/lib/drgreenApi';

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
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [hasFailures, setHasFailures] = useState(false);

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
      const expectedHex = '9294727a363851c9d6c572c67b2d5d861d856b39016e7898517528c0353c0751';
      
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
      default:
        return null;
    }
  };

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
              <h1 className="text-3xl font-bold mb-2">System Diagnosis</h1>
              <p className="text-muted-foreground">
                Automated tests to verify DAPP logic, HMAC signatures, and registration schema mapping.
              </p>
            </div>

            {/* DO NOT DEPLOY Warning */}
            {hasFailures && (
              <Card className="mb-8 border-destructive bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                    <div>
                      <h2 className="text-2xl font-bold text-destructive">DO NOT DEPLOY</h2>
                      <p className="text-muted-foreground">
                        One or more critical tests have failed. Fix all issues before deploying to production.
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
            <div className="mb-6">
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
            </div>

            {/* Test Results */}
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
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
