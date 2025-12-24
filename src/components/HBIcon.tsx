/**
 * HBIcon Component
 * 
 * Brand icon for Healing Buds - cannabis leaf with heart and medical cross.
 * Use this instead of generic Lucide icons for brand-specific contexts.
 * 
 * Variants:
 * - "green" (default): Full color brand green icon
 * - "white": White version for dark backgrounds
 */

import hbIconGreen from "@/assets/hb-icon-green.png";
import hbIconWhite from "@/assets/hb-icon.png";
import { cn } from "@/lib/utils";

interface HBIconProps {
  size?: number | "sm" | "md" | "lg" | "xl";
  className?: string;
  alt?: string;
  variant?: "green" | "white";
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

const HBIcon = ({ size = "md", className, alt = "Healing Buds", variant = "green" }: HBIconProps) => {
  const pixelSize = typeof size === "number" ? size : sizeMap[size];
  const iconSrc = variant === "white" ? hbIconWhite : hbIconGreen;
  
  return (
    <img
      src={iconSrc}
      alt={alt}
      width={pixelSize}
      height={pixelSize}
      className={cn("object-contain", className)}
      style={{ width: pixelSize, height: pixelSize }}
    />
  );
};

export default HBIcon;
