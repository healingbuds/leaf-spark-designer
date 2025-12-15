import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
}

// Real Dr Green strain data with verified S3 images
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

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Convert to Alpha-3 for API
    const alpha3Code = countryCodeMap[countryCode] || 'PRT';

    try {
      // First try country-specific strains
      console.log(`Fetching strains for country: ${alpha3Code}`);
      let { data, error: fnError } = await supabase.functions.invoke('drgreen-proxy', {
        body: {
          action: 'get-strains',
          countryCode: alpha3Code,
        },
      });

      // If country-specific returns empty, try global catalog
      if (!fnError && (!data?.data?.strains?.length)) {
        console.log('No country-specific strains, trying global catalog...');
        const fallbackResult = await supabase.functions.invoke('drgreen-proxy', {
          body: { action: 'get-all-strains' },
        });
        if (!fallbackResult.error) {
          data = fallbackResult.data;
        }
      }

      if (fnError) {
        console.warn('Dr Green API unavailable, using fallback data:', fnError);
        setProducts(mockProducts);
      } else if (data?.success && data?.data?.strains?.length > 0) {
        // Transform API response to our Product interface
        const transformedProducts: Product[] = data.data.strains.map((strain: any) => ({
          id: strain.id || strain._id,
          name: strain.name,
          description: strain.description || '',
          thcContent: strain.thcContent || strain.thc || 0,
          cbdContent: strain.cbdContent || strain.cbd || 0,
          retailPrice: strain.retailPrice || strain.price || 0,
          availability: strain.availability ?? strain.inStock ?? true,
          stock: strain.stock || strain.quantity || 0,
          imageUrl: strain.imageUrl || strain.image || '/placeholder.svg',
          effects: strain.effects || [],
          terpenes: strain.terpenes || [],
          category: strain.category || strain.type || 'Hybrid',
        }));
        setProducts(transformedProducts);
      } else {
        // Use fallback data if no strains returned from API
        console.log('No strains from API, using fallback data');
        setProducts(mockProducts);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts(mockProducts);
    } finally {
      setIsLoading(false);
    }
  }, [countryCode]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    refetch: fetchProducts,
  };
}
