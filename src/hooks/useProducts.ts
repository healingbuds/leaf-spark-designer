import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Import local strain images - new branded jar images
import strainJar1 from '@/assets/strain-jar-1.png';
import strainJar2 from '@/assets/strain-jar-2.png';
import strainJar3 from '@/assets/strain-jar-3.png';
import strainJar4 from '@/assets/strain-jar-4.png';
import strainJar5 from '@/assets/strain-jar-5.png';
import strainJar6 from '@/assets/strain-jar-6.png';
import strainJar7 from '@/assets/strain-jar-7.png';

export type DataSource = 'api' | 'none';

export interface Product {
  id: string;
  name: string;
  description: string;
  thcContent: number;
  cbdContent: number;
  retailPrice: number;
  availability: boolean;
  stock: number;
  imageUrl: string;
  effects: string[];
  terpenes: string[];
  category: string;
  dataSource: DataSource;
}

// S3 base URL for strain images
const S3_BASE = 'https://prod-profiles-backend.s3.amazonaws.com/';

// Strain name to branded jar image mapping
const STRAIN_IMAGE_MAP: Record<string, string> = {
  'BlockBerry': strainJar1,
  'Blockberry': strainJar1,
  'Blue Zushi': strainJar2,
  'Candy Pave': strainJar3,
  'Caribbean Breeze': strainJar4,
  'Femme Fatale': strainJar5,
  'NFS 12': strainJar6,
  'Peanut Butter Breath': strainJar7,
};

// All branded jar images for fallback
const BRANDED_JAR_IMAGES = [strainJar1, strainJar2, strainJar3, strainJar4, strainJar5, strainJar6, strainJar7];

// Get branded jar image for a strain - first by name, then by index fallback
const getBrandedImage = (name: string, index: number): string => {
  // Try exact match first
  if (STRAIN_IMAGE_MAP[name]) {
    return STRAIN_IMAGE_MAP[name];
  }
  // Try case-insensitive match
  const lowerName = name.toLowerCase();
  for (const [key, value] of Object.entries(STRAIN_IMAGE_MAP)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }
  // Fallback to index-based cycling
  return BRANDED_JAR_IMAGES[index % BRANDED_JAR_IMAGES.length];
};

// Map Alpha-2 to Alpha-3 country codes for Dr Green API
const countryCodeMap: Record<string, string> = {
  PT: 'PRT',
  ZA: 'ZAF',
  TH: 'THA',
  GB: 'GBR',
};

// Supported countries for product display
const SUPPORTED_COUNTRIES = ['PT', 'GB', 'ZA', 'TH'];

export function useProducts(countryCode: string = 'PT') {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<DataSource>('none');

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Validate country code
    if (!SUPPORTED_COUNTRIES.includes(countryCode)) {
      console.warn(`Unsupported country code: ${countryCode}`);
      setProducts([]);
      setDataSource('none');
      setError('Products are not available in your region');
      setIsLoading(false);
      return;
    }

    const alpha3Code = countryCodeMap[countryCode] || 'PRT';
    
    try {
      // First try to fetch from Dr Green API
      console.log(`Fetching strains from Dr Green API for country: ${alpha3Code}`);
      
      const { data, error: fnError } = await supabase.functions.invoke('drgreen-proxy', {
        body: {
          action: 'get-strains-legacy',
          countryCode: alpha3Code,
          orderBy: 'desc',
          take: 100,
          page: 1,
        },
      });

      if (!fnError && data?.success && data?.data?.strains?.length > 0) {
        console.log(`Received ${data.data.strains.length} strains from Dr Green API`);
        
        // Transform API response to our Product interface
        const transformedProducts: Product[] = data.data.strains.map((strain: any, index: number) => {
          // Use branded jar image based on strain name, fallback to index
          const imageUrl = getBrandedImage(strain.name, index);

          let effects: string[] = [];
          if (Array.isArray(strain.effects)) {
            effects = strain.effects;
          } else if (Array.isArray(strain.feelings)) {
            effects = strain.feelings;
          } else if (typeof strain.feelings === 'string') {
            effects = strain.feelings.split(',').map((s: string) => s.trim());
          }

          let terpenes: string[] = [];
          if (Array.isArray(strain.flavour)) {
            terpenes = strain.flavour;
          } else if (typeof strain.flavour === 'string') {
            terpenes = strain.flavour.split(',').map((s: string) => s.trim());
          } else if (Array.isArray(strain.terpenes)) {
            terpenes = strain.terpenes;
          } else if (Array.isArray(strain.flavors)) {
            terpenes = strain.flavors;
          }

          const location = strain.strainLocations?.[0];
          const isAvailable = location?.isAvailable ?? strain.availability ?? strain.isAvailable ?? true;
          const stock = location?.stockQuantity ?? strain.stock ?? strain.stockQuantity ?? 100;

          const retailPrice = 
            parseFloat(strain.retailPrice) || 
            parseFloat(strain.pricePerGram) || 
            parseFloat(strain.price) || 
            parseFloat(location?.retailPrice) ||
            0;

          const thcContent = 
            parseFloat(strain.thc) || 
            parseFloat(strain.thcContent) || 
            parseFloat(strain.THC) ||
            0;
          const cbdContent = 
            parseFloat(strain.cbd) || 
            parseFloat(strain.cbdContent) || 
            parseFloat(strain.CBD) ||
            0;

          return {
            id: strain.id || strain._id,
            name: strain.name,
            description: strain.description || '',
            thcContent,
            cbdContent,
            retailPrice,
            availability: isAvailable,
            stock: stock,
            imageUrl,
            effects,
            terpenes,
            category: strain.category || strain.type || 'Hybrid',
            dataSource: 'api' as DataSource,
          };
        });
        
        setProducts(transformedProducts);
        setDataSource('api');
        setIsLoading(false);
        return;
      }
      
      // Log API error/warning
      if (fnError) {
        console.warn('Dr Green API error, falling back to local DB:', fnError);
      } else if (!data?.success) {
        console.warn('Dr Green API returned unsuccessful, falling back to local DB:', data);
      } else {
        console.warn('Dr Green API returned no strains, falling back to local DB');
      }

      // Fallback: Fetch from local strains table
      console.log('Fetching strains from local database...');
      const { data: localStrains, error: dbError } = await supabase
        .from('strains')
        .select('*')
        .eq('is_archived', false)
        .order('name', { ascending: true })
        .limit(100);

      if (dbError) {
        console.error('Local DB error:', dbError);
        throw new Error('Failed to fetch products');
      }

      if (localStrains && localStrains.length > 0) {
        console.log(`Loaded ${localStrains.length} strains from local database`);
        
        const transformedProducts: Product[] = localStrains.map((strain, index) => {
          // Use branded jar image based on strain name, fallback to index
          const imageUrl = getBrandedImage(strain.name, index);

          return {
            id: strain.id,
            name: strain.name,
            description: strain.description || '',
            thcContent: strain.thc_content || 0,
            cbdContent: strain.cbd_content || 0,
            retailPrice: strain.retail_price || 0,
            availability: strain.availability ?? true,
            stock: strain.stock || 0,
            imageUrl,
            effects: strain.feelings || [],
            terpenes: strain.flavors || [],
            category: strain.type || 'Hybrid',
            dataSource: 'api' as DataSource, // Mark as API since it came from synced data
          };
        });

        setProducts(transformedProducts);
        setDataSource('api');
        setError(null);
      } else {
        setProducts([]);
        setDataSource('none');
        setError('No products available');
      }
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
      setDataSource('none');
      setError('Failed to connect to the product service');
    } finally {
      setIsLoading(false);
    }
  }, [countryCode]);

  // Trigger sync from Dr Green API to local DB
  const syncFromApi = useCallback(async () => {
    console.log('Triggering strain sync from Dr Green API...');
    try {
      const alpha3Code = countryCodeMap[countryCode] || 'PRT';
      const { data, error } = await supabase.functions.invoke('sync-strains', {
        body: {
          countryCode: alpha3Code,
          take: 100,
          page: 1,
        },
      });
      if (error) {
        console.error('Sync error:', error);
        return { success: false, error: error.message };
      }
      console.log('Sync result:', data);
      // Refetch products after sync
      await fetchProducts();
      return data;
    } catch (err) {
      console.error('Sync exception:', err);
      return { success: false, error: 'Sync failed' };
    }
  }, [fetchProducts, countryCode]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    dataSource,
    refetch: fetchProducts,
    syncFromApi,
  };
}
