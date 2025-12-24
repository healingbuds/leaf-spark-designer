/**
 * Medical Cannabis Icon Pack
 * 
 * Clean, minimal UI icons for medical cannabis dispensary.
 * All icons use consistent stroke weight and rounded shapes.
 * Brand green color via currentColor for flexibility.
 */

import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  size?: number;
}

// Stethoscope with leaf - Medical consultation
export const MedicalConsultIcon = ({ className, size = 24 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("text-primary", className)}
  >
    <path d="M4.8 2.3A.3.3 0 1 0 5 2.9a2 2 0 0 1 .3 1.1v2a2 2 0 0 1-2 2v5a6 6 0 0 0 12 0v-1.5" />
    <path d="M8 2.3A.3.3 0 1 1 8 2.9a2 2 0 0 0-.3 1.1v2a2 2 0 0 0 2 2" />
    <circle cx="18" cy="14" r="2.5" />
    {/* Small leaf accent */}
    <path d="M18 11c-1 0-2-1-2-2 1 0 2 1 2 2z" fill="currentColor" fillOpacity="0.3" />
  </svg>
);

// Shield with medical cross - Compliance/Security
export const ComplianceShieldIcon = ({ className, size = 24 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("text-primary", className)}
  >
    <path d="M12 2l8 4v6c0 5.5-3.4 10-8 11-4.6-1-8-5.5-8-11V6l8-4z" />
    {/* Medical cross */}
    <path d="M12 8v6M9 11h6" strokeWidth="2" />
  </svg>
);

// Certificate/Badge - GMP Certification
export const CertifiedBadgeIcon = ({ className, size = 24 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("text-primary", className)}
  >
    <circle cx="12" cy="9" r="6" />
    <path d="M9 15l-3 7 6-3 6 3-3-7" />
    {/* Checkmark */}
    <path d="M9.5 9l1.5 1.5 3-3" strokeWidth="2" />
  </svg>
);

// Flask with bubbles - Lab Testing
export const LabTestedIcon = ({ className, size = 24 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("text-primary", className)}
  >
    <path d="M9 3h6v6l4 8c.5 1-.2 3-1.5 3h-11C5.2 20 4.5 18 5 17l4-8V3z" />
    <path d="M8 3h8" strokeWidth="2" />
    {/* Test bubbles */}
    <circle cx="10" cy="15" r="1" fill="currentColor" fillOpacity="0.4" />
    <circle cx="14" cy="13" r="0.75" fill="currentColor" fillOpacity="0.4" />
  </svg>
);

// Package with leaf - Discreet Delivery
export const DiscreetDeliveryIcon = ({ className, size = 24 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("text-primary", className)}
  >
    {/* Package box */}
    <path d="M21 8v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8" />
    <path d="M3 8l9-5 9 5-9 5-9-5z" />
    <path d="M12 8v13" />
    {/* Small leaf on package */}
    <path d="M15 12c0 1.5-1 2.5-2 3 0-1 .5-2.5 2-3z" fill="currentColor" fillOpacity="0.3" />
  </svg>
);

// Leaf with DNA helix - Seed to Sale Traceability
export const TraceabilityIcon = ({ className, size = 24 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("text-primary", className)}
  >
    {/* Simple leaf outline */}
    <path d="M12 4c-4 2-6 6-6 10v1c0 2 2 5 6 5s6-3 6-5v-1c0-4-2-8-6-10z" />
    <path d="M12 4v16" />
    {/* Trace lines */}
    <path d="M8 10c2 0 4 1 4 3" strokeWidth="1" opacity="0.6" />
    <path d="M16 14c-2 0-4 1-4 3" strokeWidth="1" opacity="0.6" />
  </svg>
);

// Clipboard with checkmarks - Prescription Management
export const PrescriptionIcon = ({ className, size = 24 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("text-primary", className)}
  >
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M9 7h6" />
    <path d="M9 11h6" />
    <path d="M9 15l1.5 1.5 3-3" strokeWidth="2" />
  </svg>
);

// Heart with pulse - Patient Care
export const PatientCareIcon = ({ className, size = 24 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("text-primary", className)}
  >
    <path d="M19.5 12.5c2.5-3 2.5-6 0-8.5-2.5-2.5-6-2.5-7.5 0-1.5-2.5-5-2.5-7.5 0-2.5 2.5-2.5 5.5 0 8.5L12 20l7.5-7.5z" />
    {/* Pulse line */}
    <path d="M8 12h2l1-2 2 4 1-2h2" strokeWidth="1.5" />
  </svg>
);

// Lock with checkmark - Secure & Private
export const SecurePrivateIcon = ({ className, size = 24 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("text-primary", className)}
  >
    <rect x="5" y="10" width="14" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    {/* Checkmark */}
    <path d="M9.5 15l1.5 1.5 3-3" strokeWidth="2" />
  </svg>
);

// Clock with leaf - Fresh & Timely
export const FreshTimedIcon = ({ className, size = 24 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("text-primary", className)}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 6v6l4 2" />
    {/* Small leaf */}
    <path d="M17 5c0 2-1 3-2 3.5C15 7 16 5.5 17 5z" fill="currentColor" fillOpacity="0.4" />
  </svg>
);

// Globe with medical cross - International Standards
export const GlobalStandardsIcon = ({ className, size = 24 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("text-primary", className)}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3c-4 4-4 14 0 18" />
    <path d="M12 3c4 4 4 14 0 18" />
    <path d="M3 12h18" />
    {/* Small cross */}
    <path d="M12 9v6M9.5 12h5" strokeWidth="1.5" />
  </svg>
);

// User with shield - Patient Protection
export const PatientProtectionIcon = ({ className, size = 24 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("text-primary", className)}
  >
    <circle cx="9" cy="7" r="4" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4" />
    {/* Small shield */}
    <path d="M17 11l4 2v3c0 2.5-1.7 4.5-4 5-2.3-.5-4-2.5-4-5v-3l4-2z" />
    <path d="M15.5 16l1 1 2-2" strokeWidth="1.5" />
  </svg>
);
