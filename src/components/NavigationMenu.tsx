/**
 * NavigationMenu Component - Pharmaceutical Grade
 * 
 * Clean, premium desktop navigation with subtle gold hover accents.
 */

import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { FileText, ClipboardCheck, ShoppingBag, HeadphonesIcon } from "lucide-react";

interface NavigationMenuProps {
  scrolled: boolean;
  onCloseAllDropdowns?: () => void;
  isDark?: boolean;
}

const NavigationMenu = ({ scrolled, isDark = true }: NavigationMenuProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isShopActive = location.pathname === '/shop' || location.pathname.startsWith('/shop/');

  const navItems = [
    { path: '/research', label: 'Research', icon: FileText },
    { path: '/eligibility', label: 'Eligibility', icon: ClipboardCheck },
    { path: '/shop', label: 'Products', icon: ShoppingBag, isShop: true },
    { path: '/support', label: 'Support', icon: HeadphonesIcon },
  ];

  return (
    <nav className="hidden xl:flex items-center justify-center gap-1">
      {navItems.map((item) => {
        const active = item.isShop ? isShopActive : isActive(item.path);
        const Icon = item.icon;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "relative px-5 py-2.5 rounded-lg font-medium transition-all duration-300",
              "text-sm flex items-center gap-2",
              "group",
              isDark
                ? active
                  ? "text-white bg-white/15 border-b-2 border-[#EAB308]"
                  : "text-white/85 hover:text-white hover:bg-white/10"
                : active
                  ? "text-teal-800 bg-teal-50 border-b-2 border-teal-600"
                  : "text-teal-700 hover:text-teal-900 hover:bg-teal-50"
            )}
          >
            <Icon className={cn(
              "w-4 h-4 transition-colors duration-300",
              isDark
                ? active ? "text-[#EAB308]" : "text-white/60 group-hover:text-[#EAB308]"
                : active ? "text-teal-600" : "text-teal-500 group-hover:text-teal-700"
            )} />
            {item.label}
            
            {/* Active indicator dot */}
            {active && (
              <span className={cn(
                "absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                isDark ? "bg-[#EAB308]" : "bg-teal-600"
              )} />
            )}
            
            {/* Hover underline */}
            <span className={cn(
              "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 transition-all duration-300",
              isDark ? "bg-[#EAB308]" : "bg-teal-600",
              active ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-3/4 group-hover:opacity-60"
            )} />
          </Link>
        );
      })}
    </nav>
  );
};

export default NavigationMenu;