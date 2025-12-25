import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type DataSource = 'local' | 'api' | 'fallback';

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

// Real Dr Green strain data with verified S3 images (fallback only)
const S3_BASE = 'https://prod-profiles-backend.s3.amazonaws.com/';

const mockProducts: Product[] = [
  {
    id: 'drg-caribbean-breeze',
    name: 'Caribbean Breeze',
    description: 'Tropical flavors of pineapple, mango, and citrus. Energizing, uplifting, and mentally clear. Great for daytime use, combats fatigue and stress.',
    thcContent: 22.0,
    cbdContent: 0.5,
    retailPrice: 14.00,
    availability: true,
    stock: 50,
    imageUrl: `${S3_BASE}7f12e541-6ffd-4bc1-aa22-8ad388afbe8c-caribbean-breeze-strain.png`,
    effects: ['Energizing', 'Uplifting', 'Clear-headed', 'Focus'],
    terpenes: ['Limonene', 'Pinene', 'Terpinolene'],
    category: 'Sativa',
    dataSource: 'fallback',
  },
  {
    id: 'drg-candy-pave',
    name: 'Candy Pave',
    description: 'Sweet candy, floral, creamy flavors with gas undertones. Uplifting euphoria leading to heavy relaxation. Ideal for nighttime and experienced users.',
    thcContent: 28.0,
    cbdContent: 0.3,
    retailPrice: 16.00,
    availability: true,
    stock: 35,
    imageUrl: `${S3_BASE}88b16c0b-fe9b-4585-9aa2-6c52601645fd-E85.png`,
    effects: ['Euphoric', 'Relaxing', 'Heavy', 'Sedating'],
    terpenes: ['Caryophyllene', 'Limonene', 'Myrcene'],
    category: 'Indica',
    dataSource: 'fallback',
  },
  {
    id: 'drg-nfs-12',
    name: 'NFS 12',
    description: 'Piney, earthy aroma with diesel and spice. Heavy head buzz with strong body sedation. Best for nighttime use and chronic pain relief.',
    thcContent: 30.0,
    cbdContent: 0.2,
    retailPrice: 18.00,
    availability: true,
    stock: 20,
    imageUrl: `${S3_BASE}2cd72ff7-bb9c-45c8-8e6e-7729def59248-nfsheeshjpg.png`,
    effects: ['Sedating', 'Pain Relief', 'Heavy Buzz', 'Relaxing'],
    terpenes: ['Myrcene', 'Caryophyllene', 'Linalool'],
    category: 'Indica',
    dataSource: 'fallback',
  },
  {
    id: 'drg-blockberry',
    name: 'BlockBerry',
    description: 'Berry, vanilla, and citrus aromas. Happy, clear-headed high with functional relaxation. Good for social settings or creative work.',
    thcContent: 20.0,
    cbdContent: 1.0,
    retailPrice: 14.00,
    availability: true,
    stock: 45,
    imageUrl: `${S3_BASE}ecf860f8-bcea-4f0b-b5fa-0c17fe49fa42-Blockberry.png`,
    effects: ['Happy', 'Clear-headed', 'Creative', 'Social'],
    terpenes: ['Myrcene', 'Pinene', 'Caryophyllene'],
    category: 'Hybrid',
    dataSource: 'fallback',
  },
  {
    id: 'drg-femme-fatale',
    name: 'Femme Fatale',
    description: 'Grape, tropical fruits, pear, and berry flavors. Smooth, calming experience. Great for light evening use without overwhelming sedation.',
    thcContent: 19.0,
    cbdContent: 2.0,
    retailPrice: 15.00,
    availability: true,
    stock: 30,
    imageUrl: `${S3_BASE}33eac80b-58c4-46d3-a82b-b70c875d333f-cakes%20n%20cream.png`,
    effects: ['Calming', 'Smooth', 'Relaxing', 'Evening'],
    terpenes: ['Linalool', 'Myrcene', 'Caryophyllene'],
    category: 'Indica',
    dataSource: 'fallback',
  },
  {
    id: 'drg-blue-zushi',
    name: 'Blue Zushi',
    description: 'Fruit, mint, and fuel terpene profile. Euphoric uplift transitioning to calm relaxation. Ideal for creative activities and stress relief.',
    thcContent: 25.0,
    cbdContent: 0.5,
    retailPrice: 17.00,
    availability: true,
    stock: 25,
    imageUrl: `${S3_BASE}39a46b1f-ae7b-4677-b5c8-11b301d34de1-Blue%20Zushi.png`,
    effects: ['Euphoric', 'Creative', 'Stress Relief', 'Calming'],
    terpenes: ['Limonene', 'Caryophyllene', 'Myrcene'],
    category: 'Hybrid',
    dataSource: 'fallback',
  },
  {
    id: 'drg-peanut-butter-breath',
    name: 'Peanut Butter Breath',
    description: 'Nutty, earthy flavors. Cerebral lift followed by full body relaxation. Excellent for appetite loss, stress, nausea, and insomnia.',
    thcContent: 24.0,
    cbdContent: 0.8,
    retailPrice: 16.00,
    availability: true,
    stock: 40,
    imageUrl: `${S3_BASE}56e1c80b-3670-4b76-a9bf-8bd1c9859966-Peanut-Butter-Breath-Main.png`,
    effects: ['Relaxing', 'Appetite', 'Sleep Aid', 'Calming'],
    terpenes: ['Caryophyllene', 'Limonene', 'Linalool'],
    category: 'Hybrid',
    dataSource: 'fallback',
  },
];

// Map Alpha-2 to Alpha-3 country codes for Dr Green API
const countryCodeMap: Record<string, string> = {
  PT: 'PRT',
  ZA: 'ZAF',
  TH: 'THA',
  GB: 'GBR',
};

export function useProducts(countryCode: string = 'PT') {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<DataSource>('fallback');

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const alpha3Code = countryCodeMap[countryCode] || 'PRT';
    
    try {
      // STEP 1: Try Dr Green API first (primary source)
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
        const transformedProducts: Product[] = data.data.strains.map((strain: any) => {
          // Build full image URL - API returns just filename, prepend S3 base
          let imageUrl = '/placeholder.svg';
          if (strain.imageUrl) {
            imageUrl = strain.imageUrl.startsWith('http') 
              ? strain.imageUrl 
              : `${S3_BASE}${strain.imageUrl}`;
          } else if (strain.image) {
            imageUrl = strain.image.startsWith('http')
              ? strain.image
              : `${S3_BASE}${strain.image}`;
          }

          // Parse effects from string or array
          let effects: string[] = [];
          if (Array.isArray(strain.effects)) {
            effects = strain.effects;
          } else if (Array.isArray(strain.feelings)) {
            effects = strain.feelings;
          } else if (typeof strain.feelings === 'string') {
            effects = strain.feelings.split(',').map((s: string) => s.trim());
          }

          // Parse terpenes/flavors
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

          // Check availability from strainLocations
          const location = strain.strainLocations?.[0];
          const isAvailable = location?.isAvailable ?? strain.availability ?? strain.isAvailable ?? true;
          const stock = location?.stockQuantity ?? strain.stock ?? strain.stockQuantity ?? 100;

          // Get price - try multiple possible fields
          const retailPrice = 
            parseFloat(strain.retailPrice) || 
            parseFloat(strain.pricePerGram) || 
            parseFloat(strain.price) || 
            parseFloat(location?.retailPrice) ||
            0;

          // Get THC/CBD - try multiple field names
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
      
      // Log API error if any
      if (fnError) {
        console.warn('Dr Green API error:', fnError);
      } else if (!data?.success) {
        console.warn('Dr Green API returned unsuccessful response:', data);
      } else {
        console.warn('Dr Green API returned no strains');
      }

      // STEP 2: Fallback to local database
      console.log('Falling back to local database...');
      const { data: localStrains, error: dbError } = await supabase
        .from('strains')
        .select('*')
        .eq('is_archived', false)
        .order('name');

      if (!dbError && localStrains && localStrains.length > 0) {
        console.log(`Found ${localStrains.length} strains in local database`);
        const transformedProducts: Product[] = localStrains.map((strain) => ({
          id: strain.id,
          name: strain.name,
          description: strain.description || '',
          thcContent: strain.thc_content || 0,
          cbdContent: strain.cbd_content || 0,
          retailPrice: strain.retail_price || 0,
          availability: strain.availability,
          stock: strain.stock || 0,
          imageUrl: strain.image_url || '/placeholder.svg',
          effects: strain.feelings || [],
          terpenes: strain.flavors || [],
          category: strain.type || 'Hybrid',
          dataSource: 'local' as DataSource,
        }));
        setProducts(transformedProducts);
        setDataSource('local');
        setIsLoading(false);
        return;
      }

      // STEP 3: Use fallback mock data
      console.log('No data from API or local DB, using fallback data');
      setProducts(mockProducts);
      setDataSource('fallback');
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts(mockProducts);
      setDataSource('fallback');
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
