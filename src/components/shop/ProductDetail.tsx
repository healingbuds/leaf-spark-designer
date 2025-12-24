import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Leaf, Droplets, Minus, Plus, ShoppingCart, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useShop } from '@/context/ShopContext';
import { Product } from '@/hooks/useProducts';
import { formatPrice } from '@/lib/currency';

interface ProductDetailProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductDetail({ product, onClose }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, countryCode } = useShop();

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      strain_id: product.id,
      strain_name: product.name,
      quantity,
      unit_price: product.retailPrice,
    });
    onClose();
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
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

  return (
    <Dialog open={!!product} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card/95 backdrop-blur-xl border-border/50">
        <AnimatePresence>
          {product && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="grid md:grid-cols-2"
            >
              {/* Image */}
              <div className="relative aspect-square bg-muted/30">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <Badge
                  className={`absolute top-4 left-4 ${getCategoryColor(product.category)}`}
                >
                  {product.category}
                </Badge>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    {product.name}
                  </h2>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="md:hidden"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-2xl font-bold text-primary mb-4">
                  {formatPrice(product.retailPrice, countryCode)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    / gram
                  </span>
                </p>

                <p className="text-muted-foreground text-sm mb-4">
                  {product.description}
                </p>

                <Separator className="my-4" />

                {/* Cannabinoid content */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10">
                    <Leaf className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">THC</p>
                      <p className="font-semibold text-foreground">
                        {product.thcContent}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10">
                    <Droplets className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-xs text-muted-foreground">CBD</p>
                      <p className="font-semibold text-foreground">
                        {product.cbdContent}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Effects */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Wind className="h-4 w-4" />
                    Effects
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.effects.map((effect) => (
                      <Badge key={effect} variant="secondary">
                        {effect}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Terpenes */}
                <div className="mb-6">
                  <p className="text-sm font-medium mb-2">Terpene Profile</p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.terpenes.map((terpene) => (
                      <Badge
                        key={terpene}
                        variant="outline"
                        className="bg-background/50"
                      >
                        {terpene}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-auto space-y-3">
                  {/* Quantity selector */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Quantity (g):</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-semibold">
                        {quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          setQuantity(Math.min(product.stock, quantity + 1))
                        }
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Stock info */}
                  <p className="text-xs text-muted-foreground">
                    {product.stock} grams in stock
                  </p>

                  {/* Total and add to cart */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      Total: {formatPrice(product.retailPrice * quantity, countryCode)}
                    </span>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!product.availability}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {product.availability ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
