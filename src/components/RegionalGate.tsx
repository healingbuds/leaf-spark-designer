import { ReactNode, useMemo } from 'react';
import { ComingSoonOverlay } from './ComingSoonOverlay';

interface RegionalGateProps {
  children: ReactNode;
}

type RegionStatus = 'operational' | 'coming_soon' | 'redirect';

interface RegionConfig {
  status: RegionStatus;
  language: 'en' | 'pt';
}

const REGION_CONFIG: Record<string, RegionConfig> = {
  ZA: { status: 'operational', language: 'en' },
  PT: { status: 'coming_soon', language: 'pt' },
  GB: { status: 'coming_soon', language: 'en' },
  GLOBAL: { status: 'redirect', language: 'en' },
};

// Detect country from domain - synchronous for no flash
const getCountryFromDomain = (): string => {
  if (typeof window === 'undefined') return 'ZA';
  
  const hostname = window.location.hostname;
  
  // Development/staging domains → operational (South Africa)
  if (
    hostname.includes('lovable.app') || 
    hostname.includes('lovable.dev') ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1'
  ) {
    return 'ZA';
  }
  
  // Check specific country TLDs
  if (hostname.endsWith('.pt') || hostname.includes('healingbuds.pt')) return 'PT';
  if (hostname.endsWith('.co.uk') || hostname.includes('healingbuds.co.uk')) return 'GB';
  if (hostname.endsWith('.co.za') || hostname.includes('healingbuds.co.za')) return 'ZA';
  if (hostname.endsWith('.global') || hostname.includes('healingbuds.global')) return 'GLOBAL';
  
  // Default to South Africa for unknown domains
  return 'ZA';
};

export const RegionalGate = ({ children }: RegionalGateProps) => {
  const regionInfo = useMemo(() => {
    const countryCode = getCountryFromDomain();
    const config = REGION_CONFIG[countryCode] || REGION_CONFIG.ZA;
    return { countryCode, ...config };
  }, []);

  // Operational regions: render children normally
  if (regionInfo.status === 'operational') {
    return <>{children}</>;
  }

  // Redirect regions: could show a redirect notice or handle externally
  // For now, we'll treat it like operational to let user-managed redirect handle it
  if (regionInfo.status === 'redirect') {
    return <>{children}</>;
  }

  // Coming soon regions: show overlay with blurred background
  if (regionInfo.status === 'coming_soon') {
    return (
      <ComingSoonOverlay
        countryCode={regionInfo.countryCode as 'PT' | 'GB'}
        language={regionInfo.language}
      >
        {children}
      </ComingSoonOverlay>
    );
  }

  // Fallback: render children
  return <>{children}</>;
};

export default RegionalGate;
