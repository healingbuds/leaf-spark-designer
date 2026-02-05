import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Leaf, X, Cloud, AlertCircle, Bug, Radio } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ProductCard } from './ProductCard';
import { StrainQuickView } from './StrainQuickView';
import { Product, useProducts, DataSource } from '@/hooks/useProducts';
import { useShop } from '@/context/ShopContext';
import { useStockUpdates, StockUpdate } from '@/hooks/useStockUpdates';
import { useToast } from '@/hooks/use-toast';

const categories = ['All', 'Sativa', 'Indica', 'Hybrid', 'CBD'];

const dataSourceInfo: Record<DataSource, { icon: typeof Cloud; label: string; color: string }> = {
  api: { icon: Cloud, label: 'Dr Green API', color: 'text-sky-400' },
  none: { icon: AlertCircle, label: 'No Data', color: 'text-amber-400' },
};

export function ProductGrid() {
  const { countryCode } = useShop();
  const { products, isLoading, error, dataSource, refetch } = useProducts(countryCode);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [lastStockUpdate, setLastStockUpdate] = useState<string | null>(null);

  // Handle real-time stock updates
  const handleStockChange = useCallback((update: StockUpdate) => {
    setLastStockUpdate(new Date().toLocaleTimeString());
    setRealtimeConnected(true);
    
    // Refetch products to get updated stock levels
    refetch();
    
    // Show toast notification for stock changes
    toast({
      title: 'Stock Updated',
      description: `Inventory changed for strain ${update.strainId.slice(0, 8)}...`,
      duration: 3000,
    });
  }, [refetch, toast]);

  // Subscribe to real-time stock updates
  useStockUpdates({
    countryCode,
    onStockChange: handleStockChange,
    enabled: !isLoading,
  });

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      const matchesAvailability = !showAvailableOnly || product.availability;
      return matchesSearch && matchesCategory && matchesAvailability;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.retailPrice - b.retailPrice;
        case 'price-desc':
          return b.retailPrice - a.retailPrice;
        case 'thc':
          return b.thcContent - a.thcContent;
        case 'cbd':
          return b.cbdContent - a.cbdContent;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('name');
    setShowAvailableOnly(false);
  };

  const hasActiveFilters =
    searchQuery || selectedCategory !== 'All' || sortBy !== 'name' || showAvailableOnly;

  const SourceIcon = dataSourceInfo[dataSource].icon;

  return (
    <div className="space-y-6">
      {/* Search and filters bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search strains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50 backdrop-blur-sm"
          />
        </div>

        {/* Sort */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background/50 backdrop-blur-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="thc">Highest THC</SelectItem>
            <SelectItem value="cbd">Highest CBD</SelectItem>
          </SelectContent>
        </Select>

        {/* Mobile filter sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="sm:hidden">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[50vh]">
            <SheetHeader>
              <SheetTitle>Filter Products</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available-mobile"
                  checked={showAvailableOnly}
                  onChange={(e) => setShowAvailableOnly(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="available-mobile" className="text-sm">
                  Show available only
                </label>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Category filter buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 mr-2">
          <Leaf className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Strain Type:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={`
                rounded-full px-4 py-2 text-sm font-medium transition-all duration-200
                ${selectedCategory === category 
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105' 
                  : 'bg-background/50 hover:bg-primary/10 hover:border-primary/50 border-border/50'
                }
              `}
            >
              {category}
            </Button>
          ))}
        </div>
        <div className="hidden sm:flex items-center gap-2 ml-auto">
          <input
            type="checkbox"
            id="available-desktop"
            checked={showAvailableOnly}
            onChange={(e) => setShowAvailableOnly(e.target.checked)}
            className="rounded accent-primary"
          />
          <label htmlFor="available-desktop" className="text-sm text-muted-foreground">
            Available only
          </label>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {/* Results count and data source indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Showing {filteredProducts.length} of {products.length} products
        </p>
        
        {/* Data source and debug controls */}
        <div className="flex items-center gap-3">
          {/* Data source badge */}
          <div className={`flex items-center gap-1.5 text-xs ${dataSourceInfo[dataSource].color}`}>
            <SourceIcon className="h-3.5 w-3.5" />
            <span className="font-medium">{dataSourceInfo[dataSource].label}</span>
          </div>
          
          {/* Realtime indicator */}
          <div className={`flex items-center gap-1.5 text-xs ${realtimeConnected ? 'text-emerald-400' : 'text-muted-foreground'}`}>
            <Radio className={`h-3.5 w-3.5 ${realtimeConnected ? 'animate-pulse' : ''}`} />
            <span className="font-medium">
              {realtimeConnected ? 'Live' : 'Connecting...'}
            </span>
            {lastStockUpdate && showDebug && (
              <span className="text-muted-foreground ml-1">({lastStockUpdate})</span>
            )}
          </div>
          
          {/* Debug toggle */}
          <Button
            variant={showDebug ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="h-8 text-xs"
          >
            <Bug className="mr-1.5 h-3 w-3" />
            Debug
          </Button>
        </div>
      </div>

      {/* Product grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-4 animate-pulse">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-muted/80 via-muted/50 to-muted/80 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" 
                  style={{ animation: 'shimmer 2s infinite' }} />
              </div>
              <div className="space-y-3 p-1">
                <div className="flex justify-between">
                  <div className="h-5 bg-muted/60 rounded-lg w-2/3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" />
                  </div>
                  <div className="h-5 bg-primary/20 rounded-lg w-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 bg-muted/40 rounded-lg w-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" />
                  </div>
                  <div className="h-8 bg-muted/40 rounded-lg w-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" />
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className="h-6 bg-muted/30 rounded-full w-16" />
                  <div className="h-6 bg-muted/30 rounded-full w-14" />
                  <div className="h-6 bg-muted/30 rounded-full w-12" />
                </div>
                <div className="h-11 bg-muted/50 rounded-xl w-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 && error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <AlertCircle className="mx-auto h-12 w-12 text-destructive/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Unable to Load Products</h3>
          <p className="text-muted-foreground mb-4">
            {error}
          </p>
          <Button variant="outline" onClick={refetch}>
            Try Again
          </Button>
        </motion.div>
      ) : products.length === 0 && !error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Leaf className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Products Available</h3>
          <p className="text-muted-foreground mb-4">
            There are currently no products available in your region.
          </p>
        </motion.div>
      ) : filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Leaf className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Products Found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filter criteria.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={setSelectedProduct}
                showDataSource={showDebug}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Quick view modal */}
      <StrainQuickView
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
