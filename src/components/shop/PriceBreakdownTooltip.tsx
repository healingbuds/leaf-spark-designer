import { ReactNode } from 'react';
import { Info, FlaskConical, Shield, Link2, Truck, Leaf } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';

interface PriceBreakdownTooltipProps {
  children: ReactNode;
  showIcon?: boolean;
}

const breakdownItems = [
  { 
    key: 'product', 
    icon: Leaf, 
    percentage: '~60%',
    color: 'text-emerald-500 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  { 
    key: 'testing', 
    icon: FlaskConical, 
    percentage: '~15%',
    color: 'text-cyan-500 dark:text-cyan-400',
    bgColor: 'bg-cyan-500/10',
  },
  { 
    key: 'compliance', 
    icon: Shield, 
    percentage: '~12%',
    color: 'text-violet-500 dark:text-violet-400',
    bgColor: 'bg-violet-500/10',
  },
  { 
    key: 'traceability', 
    icon: Link2, 
    percentage: '~8%',
    color: 'text-amber-500 dark:text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  { 
    key: 'logistics', 
    icon: Truck, 
    percentage: '~5%',
    color: 'text-sky-500 dark:text-sky-400',
    bgColor: 'bg-sky-500/10',
  },
];

export function PriceBreakdownTooltip({ children, showIcon = true }: PriceBreakdownTooltipProps) {
  const { t } = useTranslation('shop');

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1.5 cursor-help">
            {children}
            {showIcon && (
              <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-primary transition-colors flex-shrink-0" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          align="start"
          className="w-72 p-0 bg-popover border-border shadow-xl"
          sideOffset={8}
        >
          <div className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm text-foreground">
                {t('priceBreakdown.title', "What's Included")}
              </span>
            </div>

            {/* Breakdown items */}
            <div className="space-y-2">
              {breakdownItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${item.bgColor}`}>
                      <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                    </div>
                    <span className="text-xs text-foreground flex-1">
                      {t(`priceBreakdown.${item.key}`, item.key)}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {item.percentage}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Footer note */}
            <div className="pt-2 border-t border-border">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {t('priceBreakdown.note', 'All products meet EU-GMP pharmaceutical standards')}
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
