/**
 * TrustBadges Component
 * 
 * Branded trust indicators using the combined trust icons image.
 * Shows: EU GMP Certified, Lab Tested, Secure & Compliant, Discreet Delivery
 */

import trustIconsImage from "@/assets/trust-icons.png";
import { cn } from "@/lib/utils";

interface TrustBadgesProps {
  variant?: "horizontal" | "vertical" | "grid" | "image";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const TrustBadges = ({ 
  variant = "horizontal", 
  size = "md", 
  className 
}: TrustBadgesProps) => {
  const heightMap = {
    sm: "h-16 sm:h-20 md:h-24",
    md: "h-20 sm:h-28 md:h-32",
    lg: "h-28 sm:h-36 md:h-40",
  };
  
  return (
    <div className={cn(
      "flex justify-center px-4",
      className
    )}>
      <img
        src={trustIconsImage}
        alt="EU GMP Certified, Lab Tested, Secure & Compliant, Discreet Delivery"
        className={cn(
          "w-auto object-contain",
          heightMap[size]
        )}
        style={{ maxWidth: "min(100%, 700px)" }}
      />
    </div>
  );
};

export default TrustBadges;
