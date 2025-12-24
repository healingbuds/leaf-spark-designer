import { motion } from 'framer-motion';
import { ShoppingCart, Eye, Leaf, Droplets, Lock, Sparkles, Database, Cloud, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useShop } from '@/context/ShopContext';
import { Product, DataSource } from '@/hooks/useProducts';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '@/lib/currency';
interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  showDataSource?: boolean;
}

const dataSourceConfig: Record<DataSource, { icon: typeof Database; label: string; color: string }> = {
  local: { icon: Database, label: 'Local DB', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' },
  api: { icon: Cloud, label: 'Dr Green API', color: 'bg-sky-500/20 text-sky-300 border-sky-400/30' },
  fallback: { icon: AlertCircle, label: 'Fallback', color: 'bg-amber-500/20 text-amber-300 border-amber-400/30' },
};

export function ProductCard({ product, onViewDetails, showDataSource = false }: ProductCardProps) {
  const { addToCart, isEligible, drGreenClient, countryCode } = useShop();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation('shop');

  const handleAddToCart = () => {
    if (!drGreenClient) {
      toast({
        title: t('eligibility.required'),
        description: t('eligibility.requiredDescription'),
        variant: "destructive",
      });
      navigate('/shop/register');
      return;
    }

    if (!isEligible) {
      toast({
        title: t('eligibility.pending'),
        description: t('eligibility.kycPending'),
        variant: "destructive",
      });
      return;
    }

    addToCart({
      strain_id: product.id,
      strain_name: product.name,
      quantity: 1,
      unit_price: product.retailPrice,
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const getCategoryStyles = (category: string) => {
    switch (category.toLowerCase()) {
      case 'sativa':
        return {
          badge: 'bg-amber-500/25 text-amber-300 border-amber-400/40 backdrop-blur-sm',
          glow: 'hover:shadow-amber-500/20',
        };
      case 'indica':
        return {
          badge: 'bg-violet-500/25 text-violet-300 border-violet-400/40 backdrop-blur-sm',
          glow: 'hover:shadow-violet-500/20',
        };
      case 'hybrid':
        return {
          badge: 'bg-emerald-500/25 text-emerald-300 border-emerald-400/40 backdrop-blur-sm',
          glow: 'hover:shadow-emerald-500/20',
        };
      case 'cbd':
        return {
          badge: 'bg-cyan-500/25 text-cyan-300 border-cyan-400/40 backdrop-blur-sm',
          glow: 'hover:shadow-cyan-500/20',
        };
      default:
        return {
          badge: 'bg-slate-500/25 text-slate-300 border-slate-400/40',
          glow: '',
        };
    }
  };

  const categoryStyles = getCategoryStyles(product.category);
  const sourceConfig = dataSourceConfig[product.dataSource || 'fallback'];
  const SourceIcon = sourceConfig.icon;

  const getButtonContent = () => {
    if (!product.availability) {
      return (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {t('outOfStock')}
        </>
      );
    }
    
    if (!drGreenClient) {
      return (
        <>
          <Lock className="mr-2 h-4 w-4" />
          Register to Buy
        </>
      );
    }
    
    if (!isEligible) {
      return (
        <>
          <Lock className="mr-2 h-4 w-4" />
          Verification Required
        </>
      );
    }
    
    return (
      <>
        <ShoppingCart className="mr-2 h-4 w-4" />
        {t('addToCart')}
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full"
    >
      <div className={`group relative h-full overflow-hidden rounded-2xl bg-gradient-to-b from-card/90 to-card/60 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 ${categoryStyles.glow}`}>
        {/* Gradient overlay for premium depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none" />
        
        {/* Image container - fixed aspect ratio with uniform sizing */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-slate-900/20 to-slate-900/50 flex items-center justify-center">
          {/* Ambient background glow for visual weight */}
          <div className="absolute inset-0 bg-gradient-radial from-primary/8 via-transparent to-transparent opacity-60" />
          <div className="absolute inset-[15%] rounded-full bg-gradient-radial from-white/10 via-white/3 to-transparent blur-2xl" />
          
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-[85%] h-[85%] min-w-[70%] min-h-[70%] max-w-[92%] max-h-[92%] object-contain transition-all duration-700 group-hover:scale-110 group-hover:rotate-1 sm:w-[88%] sm:h-[88%]"
            loading="lazy"
            style={{ 
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.55)) drop-shadow(0 8px 16px rgba(0,0,0,0.4)) drop-shadow(0 3px 6px rgba(0,0,0,0.3))',
            }}
          />
          
          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
          
          {/* Out of stock overlay */}
          {!product.availability && (
            <div className="absolute inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center">
              <Badge variant="destructive" className="text-sm px-4 py-1.5 font-medium">
                {t('outOfStock')}
              </Badge>
            </div>
          )}
          
          {/* Category badge - top left */}
          <Badge 
            className={`absolute top-4 left-4 px-3 py-1 text-xs font-semibold uppercase tracking-wider border ${categoryStyles.badge}`}
          >
            {product.category}
          </Badge>
          
          {/* Data source indicator - bottom right (debug) */}
          {showDataSource && (
            <div className={`absolute bottom-4 right-4 flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-medium ${sourceConfig.color}`}>
              <SourceIcon className="h-3 w-3" />
              <span>{sourceConfig.label}</span>
            </div>
          )}
          
          {/* Quick view button - top right */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/20"
            onClick={() => onViewDetails(product)}
          >
            <Eye className="h-4 w-4" />
          </motion.button>

          {/* THC highlight for high potency */}
          {product.thcContent >= 25 && (
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-400/30">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span className="text-xs font-medium text-amber-300">High Potency</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="relative p-5 space-y-4">
          {/* Title and price row */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-lg text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <div className="flex flex-col items-end shrink-0">
              <span className="text-xl font-bold text-primary">
                {formatPrice(product.retailPrice, countryCode)}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">per gram</span>
            </div>
          </div>

          {/* THC/CBD stats - improved styling */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/25">
              <Leaf className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-400">{product.thcContent.toFixed(1)}%</span>
              <span className="text-[10px] text-emerald-400/70 uppercase font-medium">THC</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/25">
              <Droplets className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-sm font-bold text-cyan-400">{product.cbdContent.toFixed(1)}%</span>
              <span className="text-[10px] text-cyan-400/70 uppercase font-medium">CBD</span>
            </div>
          </div>

          {/* Effects tags */}
          <div className="flex flex-wrap gap-1.5">
            {product.effects.slice(0, 3).map((effect) => (
              <span
                key={effect}
                className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-white/5 border border-white/10 text-muted-foreground"
              >
                {effect}
              </span>
            ))}
            {product.effects.length > 3 && (
              <span className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                +{product.effects.length - 3}
              </span>
            )}
          </div>

          {/* Add to cart button */}
          <Button
            className="w-full h-11 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            disabled={!product.availability}
            variant={!drGreenClient || !isEligible ? "secondary" : "default"}
            onClick={handleAddToCart}
          >
            {getButtonContent()}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
