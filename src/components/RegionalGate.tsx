import { ReactNode, useMemo, useState, useEffect } from 'react';
import { ComingSoonOverlay } from './ComingSoonOverlay';
import GlobalLanding from '@/pages/GlobalLanding';

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

// Detect country from domain or simulation parameter - synchronous for no flash
const getCountryFromDomain = (): string => {
  if (typeof window === 'undefined') return 'ZA';
  
  // DEV ONLY: Check for simulation query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const simulatedRegion = urlParams.get('simulate_region');
  
  if (simulatedRegion && ['ZA', 'PT', 'GB', 'GLOBAL'].includes(simulatedRegion.toUpperCase())) {
    console.log(`[RegionalGate] Simulating region: ${simulatedRegion.toUpperCase()}`);
    return simulatedRegion.toUpperCase();
  }
  
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
  const [simulatedRegion, setSimulatedRegion] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setSimulatedRegion(urlParams.get('simulate_region')?.toUpperCase() || null);
  }, []);

  const regionInfo = useMemo(() => {
    const countryCode = getCountryFromDomain();
    const config = REGION_CONFIG[countryCode] || REGION_CONFIG.ZA;
    return { countryCode, ...config };
  }, []);

  // Simulation indicator badge (dev only)
  const SimulationBadge = simulatedRegion ? (
    <div className="fixed bottom-4 right-4 z-[200] bg-yellow-500 text-black px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
      <span>🔬</span>
      <span>Simulating: {simulatedRegion}</span>
    </div>
  ) : null;

  // Operational regions: render children normally
  if (regionInfo.status === 'operational') {
    return (
      <>
        {children}
        {SimulationBadge}
      </>
    );
  }

  // Redirect regions (GLOBAL): show the Global Landing page with region cards
  if (regionInfo.status === 'redirect') {
    return (
      <>
        <GlobalLanding />
        {SimulationBadge}
      </>
    );
  }

  // Coming soon regions: show overlay with blurred background
  if (regionInfo.status === 'coming_soon') {
    return (
      <>
        <ComingSoonOverlay
          countryCode={regionInfo.countryCode as 'PT' | 'GB'}
          language={regionInfo.language}
        >
          {children}
        </ComingSoonOverlay>
        {SimulationBadge}
      </>
    );
  }

  // Fallback: render children
  return (
    <>
      {children}
      {SimulationBadge}
    </>
  );
};

export default RegionalGate;
