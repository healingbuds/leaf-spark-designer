import { motion } from 'framer-motion';
import { ShoppingCart, Info, Leaf, Droplets, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useShop } from '@/context/ShopContext';
import { Product } from '@/hooks/useProducts';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const { addToCart, isEligible, drGreenClient } = useShop();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation('shop');

  const handleAddToCart = () => {
    // Check if user has started registration
    if (!drGreenClient) {
      toast({
        title: t('eligibility.required'),
        description: t('eligibility.requiredDescription'),
        variant: "destructive",
      });
      navigate('/shop/register');
      return;
    }

    // Check eligibility
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

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'sativa':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'indica':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'hybrid':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'cbd':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

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
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Availability badge */}
          {!product.availability && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <Badge variant="destructive" className="text-sm">
                {t('outOfStock')}
              </Badge>
            </div>
          )}
          
          {/* Category badge */}
          <Badge 
            className={`absolute top-3 left-3 ${getCategoryColor(product.category)}`}
          >
            {product.category}
          </Badge>
          
          {/* Quick view button */}
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onViewDetails(product)}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Title and price */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground line-clamp-1">
              {product.name}
            </h3>
            <span className="text-lg font-bold text-primary whitespace-nowrap">
              €{product.retailPrice.toFixed(2)}
            </span>
          </div>

          {/* THC/CBD info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Leaf className="h-3.5 w-3.5 text-primary" />
              <span>THC {product.thcContent}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5 text-blue-400" />
              <span>CBD {product.cbdContent}%</span>
            </div>
          </div>

          {/* Effects */}
          <div className="flex flex-wrap gap-1.5">
            {product.effects.slice(0, 3).map((effect) => (
              <Badge
                key={effect}
                variant="outline"
                className="text-xs bg-background/50"
              >
                {effect}
              </Badge>
            ))}
          </div>

          {/* Add to cart button */}
          <Button
            className="w-full mt-2"
            disabled={!product.availability}
            variant={!drGreenClient || !isEligible ? "secondary" : "default"}
            onClick={handleAddToCart}
          >
            {getButtonContent()}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
