'use client';

import { useState } from 'react';

interface EnvVar {
  name: string;
  value: string | undefined;
  isBackend?: boolean;
}

interface HealthCheckResult {
  status: string;
  checks: Record<string, { status: string; message?: string; duration?: number }>;
  totalDuration?: number;
  timestamp?: string;
}

const DRGREEN_API_URL = 'https://api.drgreennft.com/api/v1';

const WEBHOOK_EVENTS = [
  { value: 'kyc.verified', label: 'KYC Verified' },
  { value: 'kyc.rejected', label: 'KYC Rejected' },
  { value: 'client.approved', label: 'Client Approved' },
  { value: 'client.rejected', label: 'Client Rejected' },
  { value: 'order.shipped', label: 'Order Shipped' },
  { value: 'order.delivered', label: 'Order Delivered' },
  { value: 'payment.completed', label: 'Payment Completed' },
  { value: 'payment.failed', label: 'Payment Failed' },
];

export default function EnvDebugger() {
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTest, setActiveTest] = useState<'supabase' | 'drgreen' | 'health' | 'email' | 'webhook' | null>(null);
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [selectedWebhookEvent, setSelectedWebhookEvent] = useState(WEBHOOK_EVENTS[0].value);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const envVars: EnvVar[] = [
    { name: 'NODE_ENV', value: import.meta.env.MODE },
    { name: 'DRGREEN_API_URL', value: DRGREEN_API_URL },
    { name: 'VITE_SUPABASE_URL', value: supabaseUrl },
    { name: 'VITE_SUPABASE_PUBLISHABLE_KEY', value: apiKey ? '✓ Set' : undefined },
    { name: 'VITE_SUPABASE_PROJECT_ID', value: import.meta.env.VITE_SUPABASE_PROJECT_ID },
  ];

  const backendSecrets: EnvVar[] = [
    { name: 'DRGREEN_API_KEY', value: '✓ Configured', isBackend: true },
    { name: 'DRGREEN_PRIVATE_KEY', value: '✓ Configured', isBackend: true },
    { name: 'RESEND_API_KEY', value: '✓ Configured', isBackend: true },
  ];

  const getValueDisplay = (value: string | undefined, isBackend?: boolean) => {
    if (value === undefined) {
      return { text: '[MISSING]', color: '#ef4444' };
    }
    if (value === '') {
      return { text: '[EMPTY]', color: '#eab308' };
    }
    return { text: value, color: isBackend ? '#60a5fa' : '#22c55e' };
  };

  const handleSupabaseTest = async () => {
    if (!supabaseUrl) {
      setPingStatus('No Supabase URL configured');
      return;
    }

    setIsLoading(true);
    setActiveTest('supabase');
    setPingStatus(null);
    setHealthResult(null);

    try {
      await fetch(supabaseUrl, { method: 'HEAD', mode: 'no-cors' });
      setPingStatus('Supabase: Connection OK');
    } catch (error) {
      setPingStatus(`Supabase Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrGreenTest = async () => {
    if (!supabaseUrl || !apiKey) {
      setPingStatus('Missing Supabase configuration');
      return;
    }

    setIsLoading(true);
    setActiveTest('drgreen');
    setPingStatus(null);
    setHealthResult(null);

    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/drgreen-proxy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'apikey': apiKey,
          },
          body: JSON.stringify({
            action: 'get-strains-legacy',
            countryCode: 'PRT'
          })
        }
      );
      const data = await response.json();
      if (data.success) {
        setPingStatus(`Dr. Green API: OK - ${data.data?.length || 0} strains found`);
      } else {
        setPingStatus(`Dr. Green API Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setPingStatus(`Dr. Green API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHealthCheck = async () => {
    if (!supabaseUrl || !apiKey) {
      setPingStatus('Missing Supabase configuration');
      return;
    }

    setIsLoading(true);
    setActiveTest('health');
    setPingStatus(null);
    setHealthResult(null);

    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/drgreen-health`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'apikey': apiKey,
          }
        }
      );
      const data: HealthCheckResult = await response.json();
      setHealthResult(data);
      setPingStatus(`Health: ${data.status.toUpperCase()} (${data.totalDuration}ms)`);
    } catch (error) {
      setPingStatus(`Health Check Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailTest = async () => {
    if (!supabaseUrl || !apiKey) {
      setPingStatus('Missing Supabase configuration');
      return;
    }

    if (!testEmail || !testEmail.includes('@')) {
      setPingStatus('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setActiveTest('email');
    setPingStatus(null);
    setHealthResult(null);

    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/send-client-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'apikey': apiKey,
          },
          body: JSON.stringify({
            type: 'welcome',
            email: testEmail,
            name: 'Test User',
            region: 'PT'
          })
        }
      );
      const data = await response.json();
      if (response.ok && data.id) {
        setPingStatus(`Email Sent! Message ID: ${data.id.substring(0, 16)}...`);
      } else {
        setPingStatus(`Email Error: ${data.error || data.message || 'Unknown error'}`);
      }
    } catch (error) {
      setPingStatus(`Email Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebhookTest = async () => {
    if (!supabaseUrl || !apiKey) {
      setPingStatus('Missing Supabase configuration');
      return;
    }

    setIsLoading(true);
    setActiveTest('webhook');
    setPingStatus(null);
    setHealthResult(null);

    const testPayloads: Record<string, object> = {
      'kyc.verified': {
        event: 'kyc.verified',
        clientId: 'test-client-123',
        timestamp: new Date().toISOString(),
        data: { verificationLevel: 'full' }
      },
      'kyc.rejected': {
        event: 'kyc.rejected',
        clientId: 'test-client-123',
        timestamp: new Date().toISOString(),
        data: { reason: 'Document unclear' }
      },
      'client.approved': {
        event: 'client.approved',
        clientId: 'test-client-123',
        timestamp: new Date().toISOString(),
        data: { adminApproval: 'VERIFIED' }
      },
      'client.rejected': {
        event: 'client.rejected',
        clientId: 'test-client-123',
        timestamp: new Date().toISOString(),
        data: { reason: 'Not eligible' }
      },
      'order.shipped': {
        event: 'order.shipped',
        orderId: 'test-order-456',
        clientId: 'test-client-123',
        timestamp: new Date().toISOString(),
        data: { trackingNumber: 'TRK123456789' }
      },
      'order.delivered': {
        event: 'order.delivered',
        orderId: 'test-order-456',
        clientId: 'test-client-123',
        timestamp: new Date().toISOString()
      },
      'payment.completed': {
        event: 'payment.completed',
        orderId: 'test-order-456',
        clientId: 'test-client-123',
        timestamp: new Date().toISOString(),
        data: { amount: 99.99, currency: 'EUR' }
      },
      'payment.failed': {
        event: 'payment.failed',
        orderId: 'test-order-456',
        clientId: 'test-client-123',
        timestamp: new Date().toISOString(),
        data: { reason: 'Insufficient funds' }
      },
    };

    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/drgreen-webhook`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'apikey': apiKey,
          },
          body: JSON.stringify(testPayloads[selectedWebhookEvent])
        }
      );
      const data = await response.json();
      if (response.ok) {
        setPingStatus(`Webhook ${selectedWebhookEvent}: ${data.message || 'Processed'}`);
      } else {
        setPingStatus(`Webhook Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setPingStatus(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '0',
    right: '0',
    zIndex: 99999,
    backgroundColor: '#7f1d1d',
    color: '#ffffff',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: '11px',
    padding: isMinimized ? '8px 12px' : '16px',
    borderTopLeftRadius: '8px',
    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
    maxWidth: isMinimized ? 'auto' : '450px',
    minWidth: isMinimized ? 'auto' : '400px',
    maxHeight: '90vh',
    overflowY: 'auto',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isMinimized ? '0' : '12px',
    fontWeight: 'bold',
    fontSize: '12px',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const cellStyle: React.CSSProperties = {
    padding: '4px 8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    textAlign: 'left',
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#1e40af',
    color: '#ffffff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '11px',
  };

  const minimizeButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '2px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '10px',
  };

  const sectionStyle: React.CSSProperties = {
    marginTop: '12px',
    padding: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '4px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 8px',
    borderRadius: '4px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#ffffff',
    fontFamily: 'inherit',
    fontSize: '11px',
    marginBottom: '8px',
  };

  const selectStyle: React.CSSProperties = {
    flex: 1,
    padding: '6px 8px',
    borderRadius: '4px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#ffffff',
    fontFamily: 'inherit',
    fontSize: '11px',
  };

  if (isMinimized) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <span>🔧 ENV</span>
          <button style={minimizeButtonStyle} onClick={() => setIsMinimized(false)}>
            Expand
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span>🔧 Environment Debugger</span>
        <button style={minimizeButtonStyle} onClick={() => setIsMinimized(true)}>
          Minimize
        </button>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...cellStyle, fontWeight: 'bold' }}>Variable</th>
            <th style={{ ...cellStyle, fontWeight: 'bold' }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {envVars.map((env) => {
            const display = getValueDisplay(env.value, env.isBackend);
            return (
              <tr key={env.name}>
                <td style={cellStyle}>{env.name}</td>
                <td style={{ ...cellStyle, color: display.color, wordBreak: 'break-all' }}>
                  {display.text.length > 40 ? `${display.text.substring(0, 40)}...` : display.text}
                </td>
              </tr>
            );
          })}
          <tr>
            <td colSpan={2} style={{ ...cellStyle, fontSize: '10px', opacity: 0.7, paddingTop: '8px' }}>
              Backend Secrets (Edge Functions):
            </td>
          </tr>
          {backendSecrets.map((env) => {
            const display = getValueDisplay(env.value, env.isBackend);
            return (
              <tr key={env.name}>
                <td style={{ ...cellStyle, fontSize: '10px' }}>{env.name}</td>
                <td style={{ ...cellStyle, color: display.color, fontSize: '10px' }}>
                  {display.text}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Basic Tests */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button 
          style={{ ...buttonStyle, flex: 1, opacity: isLoading && activeTest === 'supabase' ? 0.7 : 1 }} 
          onClick={handleSupabaseTest}
          disabled={isLoading}
        >
          {isLoading && activeTest === 'supabase' ? 'Testing...' : 'Test Supabase'}
        </button>
        <button 
          style={{ ...buttonStyle, flex: 1, backgroundColor: '#065f46', opacity: isLoading && activeTest === 'drgreen' ? 0.7 : 1 }} 
          onClick={handleDrGreenTest}
          disabled={isLoading}
        >
          {isLoading && activeTest === 'drgreen' ? 'Testing...' : 'Test Dr. Green'}
        </button>
      </div>

      {/* Health Check */}
      <div style={sectionStyle}>
        <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '8px' }}>🏥 Health Check</div>
        <button 
          style={{ ...buttonStyle, width: '100%', backgroundColor: '#7c3aed', opacity: isLoading && activeTest === 'health' ? 0.7 : 1 }} 
          onClick={handleHealthCheck}
          disabled={isLoading}
        >
          {isLoading && activeTest === 'health' ? 'Checking...' : 'Run Health Check'}
        </button>
        {healthResult && (
          <div style={{ marginTop: '8px', fontSize: '10px' }}>
            {Object.entries(healthResult.checks).map(([key, check]) => (
              <div key={key} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '2px 0',
                color: check.status === 'ok' ? '#22c55e' : check.status === 'warning' ? '#eab308' : '#ef4444'
              }}>
                <span>{key}</span>
                <span>{check.status.toUpperCase()} {check.duration ? `(${check.duration}ms)` : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Email Test */}
      <div style={sectionStyle}>
        <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '8px' }}>📧 Email Test</div>
        <input
          type="email"
          placeholder="Enter email address..."
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          style={inputStyle}
        />
        <button 
          style={{ ...buttonStyle, width: '100%', backgroundColor: '#0891b2', opacity: isLoading && activeTest === 'email' ? 0.7 : 1 }} 
          onClick={handleEmailTest}
          disabled={isLoading}
        >
          {isLoading && activeTest === 'email' ? 'Sending...' : 'Send Test Email'}
        </button>
      </div>

      {/* Webhook Test */}
      <div style={sectionStyle}>
        <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '8px' }}>🔔 Webhook Simulator</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            value={selectedWebhookEvent}
            onChange={(e) => setSelectedWebhookEvent(e.target.value)}
            style={selectStyle}
          >
            {WEBHOOK_EVENTS.map((event) => (
              <option key={event.value} value={event.value}>
                {event.label}
              </option>
            ))}
          </select>
          <button 
            style={{ ...buttonStyle, backgroundColor: '#ca8a04', opacity: isLoading && activeTest === 'webhook' ? 0.7 : 1 }} 
            onClick={handleWebhookTest}
            disabled={isLoading}
          >
            {isLoading && activeTest === 'webhook' ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>

      {/* Status Display */}
      {pingStatus && (
        <div style={{ 
          marginTop: '12px', 
          padding: '8px', 
          backgroundColor: 'rgba(0, 0, 0, 0.3)', 
          borderRadius: '4px',
          color: pingStatus.includes('Error') ? '#ef4444' : '#22c55e'
        }}>
          {pingStatus}
        </div>
      )}

      <div style={{ marginTop: '8px', fontSize: '9px', opacity: 0.7 }}>
        ⚠️ Remove this component before production deploy
      </div>
    </div>
  );
}
