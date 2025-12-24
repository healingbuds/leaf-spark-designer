/**
 * TrustMotifs Component
 * 
 * Clean, minimal medical cannabis UI icons with consistent style.
 * Each icon clearly represents a different function:
 * - EU GMP Certified (badge with checkmark)
 * - Lab Tested (flask)
 * - Secure & Compliant (shield)
 * - Discreet Delivery (package)
 * 
 * Flat design, no gradients, rounded shapes, consistent stroke weight.
 */

import { cn } from "@/lib/utils";

interface MotifProps {
  className?: string;
  size?: number;
}

// EU GMP Certified - Award/Certificate badge
export const CertifiedMotif = ({ className, size = 48 }: MotifProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Badge circle */}
    <circle 
      cx="24" 
      cy="20" 
      r="14" 
      stroke="currentColor"
      strokeWidth="2"
      fill="currentColor"
      fillOpacity="0.1"
    />
    {/* Ribbon tails */}
    <path 
      d="M16 30l-4 14 8-4 8 4-4-14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="currentColor"
      fillOpacity="0.05"
    />
    {/* Checkmark */}
    <path 
      d="M18 20l4 4 8-8"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Lab Tested - Erlenmeyer flask
export const LabTestedMotif = ({ className, size = 48 }: MotifProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Flask body */}
    <path 
      d="M18 8h12v10l8 18c1 2.5-.5 6-4 6H14c-3.5 0-5-3.5-4-6l8-18V8z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="currentColor"
      fillOpacity="0.1"
    />
    {/* Flask top */}
    <path 
      d="M16 8h16"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Liquid level */}
    <path 
      d="M14 32h20"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.6"
    />
    {/* Bubbles */}
    <circle cx="20" cy="36" r="2" fill="currentColor" fillOpacity="0.3" />
    <circle cx="28" cy="34" r="1.5" fill="currentColor" fillOpacity="0.3" />
    <circle cx="24" cy="38" r="1" fill="currentColor" fillOpacity="0.3" />
  </svg>
);

// Secure & Compliant - Shield with check
export const SecureShieldMotif = ({ className, size = 48 }: MotifProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Shield outline */}
    <path 
      d="M24 6L8 12v10c0 10 6.5 18 16 22 9.5-4 16-12 16-22V12L24 6z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="currentColor"
      fillOpacity="0.1"
    />
    {/* Checkmark */}
    <path 
      d="M16 24l6 6 10-12"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Discreet Delivery - Package/Box
export const DeliveryMotif = ({ className, size = 48 }: MotifProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Box body */}
    <path 
      d="M6 16l18-10 18 10v20l-18 8-18-8V16z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      fill="currentColor"
      fillOpacity="0.1"
    />
    {/* Center line */}
    <path 
      d="M24 6v38"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Top fold */}
    <path 
      d="M6 16l18 10 18-10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Small leaf accent */}
    <path 
      d="M28 20c0 3-2 5-4 6 0-2 1-5 4-6z"
      fill="currentColor"
      fillOpacity="0.3"
    />
  </svg>
);

// Combined trust motifs display component
interface TrustMotifsProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
};

const TrustMotifs = ({ className, size = "md", showLabels = true }: TrustMotifsProps) => {
  const iconSize = sizeMap[size];
  
  const motifs = [
    { Component: CertifiedMotif, label: "EU GMP Certified" },
    { Component: LabTestedMotif, label: "Lab Tested" },
    { Component: SecureShieldMotif, label: "Secure & Compliant" },
    { Component: DeliveryMotif, label: "Discreet Delivery" },
  ];

  return (
    <div className={cn("flex flex-wrap justify-center gap-8 md:gap-12", className)}>
      {motifs.map(({ Component, label }) => (
        <div key={label} className="flex flex-col items-center gap-2">
          <Component 
            size={iconSize} 
            className="text-primary" 
          />
          {showLabels && (
            <span className="text-xs md:text-sm font-medium text-muted-foreground text-center">
              {label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default TrustMotifs;
