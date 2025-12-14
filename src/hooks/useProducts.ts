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

// Mock data for development/demo - used when API unavailable
const mockProducts: Product[] = [
  {
    id: 'demo-1',
    name: 'Purple Haze',
    description: 'A classic sativa-dominant strain known for its uplifting and creative effects. Perfect for daytime use. Helps with mood enhancement and mental clarity.',
    thcContent: 18.5,
    cbdContent: 0.5,
    retailPrice: 12.50,
    availability: true,
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=400&q=80',
    effects: ['Euphoric', 'Creative', 'Uplifting', 'Focus'],
    terpenes: ['Myrcene', 'Limonene', 'Caryophyllene'],
    category: 'Sativa',
  },
  {
    id: 'demo-2',
    name: 'OG Kush',
    description: 'A legendary indica-dominant hybrid with potent stress-relieving properties. Ideal for evening relaxation and unwinding after a long day.',
    thcContent: 22.0,
    cbdContent: 1.0,
    retailPrice: 14.00,
    availability: true,
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1616363088386-31c4f2d7f0b1?w=400&q=80',
    effects: ['Relaxing', 'Euphoric', 'Sleepy', 'Pain Relief'],
    terpenes: ['Limonene', 'Myrcene', 'Linalool'],
    category: 'Indica',
  },
  {
    id: 'demo-3',
    name: 'Blue Dream',
    description: 'A balanced hybrid offering gentle cerebral invigoration paired with full-body relaxation. Great for managing pain while staying functional.',
    thcContent: 19.0,
    cbdContent: 2.0,
    retailPrice: 13.00,
    availability: true,
    stock: 42,
    imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&q=80',
    effects: ['Balanced', 'Happy', 'Relaxed', 'Creative'],
    terpenes: ['Myrcene', 'Pinene', 'Caryophyllene'],
    category: 'Hybrid',
  },
  {
    id: 'demo-4',
    name: "Charlotte's Web",
    description: 'A high-CBD strain specifically developed for therapeutic use. Minimal psychoactive effects, ideal for those seeking relief without intoxication.',
    thcContent: 0.3,
    cbdContent: 17.0,
    retailPrice: 11.00,
    availability: true,
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&q=80',
    effects: ['Calm', 'Focused', 'Pain Relief', 'Anti-Anxiety'],
    terpenes: ['Myrcene', 'Caryophyllene', 'Pinene'],
    category: 'CBD',
  },
  {
    id: 'demo-5',
    name: 'Sour Diesel',
    description: 'An invigorating sativa with fast-acting energizing and mood-lifting effects. Popular for combating fatigue and depression.',
    thcContent: 20.0,
    cbdContent: 0.2,
    retailPrice: 13.50,
    availability: false,
    stock: 0,
    imageUrl: 'https://images.unsplash.com/photo-1563209259-2819dbb22d93?w=400&q=80',
    effects: ['Energetic', 'Happy', 'Creative', 'Focused'],
    terpenes: ['Caryophyllene', 'Limonene', 'Myrcene'],
    category: 'Sativa',
  },
  {
    id: 'demo-6',
    name: 'Granddaddy Purple',
    description: 'A famous indica known for its potent relaxation and sleep-inducing properties. Excellent for insomnia and chronic pain.',
    thcContent: 23.0,
    cbdContent: 0.5,
    retailPrice: 15.00,
    availability: true,
    stock: 28,
    imageUrl: 'https://images.unsplash.com/photo-1589483232748-515c025575bc?w=400&q=80',
    effects: ['Sleepy', 'Relaxed', 'Happy', 'Pain Relief'],
    terpenes: ['Myrcene', 'Pinene', 'Caryophyllene'],
    category: 'Indica',
  },
  {
    id: 'demo-7',
    name: 'ACDC',
    description: 'A CBD-dominant phenotype known for its therapeutic effects with minimal psychoactivity. Excellent for anxiety and inflammation.',
    thcContent: 1.0,
    cbdContent: 20.0,
    retailPrice: 12.00,
    availability: true,
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&q=80',
    effects: ['Calm', 'Clear-Headed', 'Anti-Inflammatory', 'Focused'],
    terpenes: ['Myrcene', 'Pinene', 'Caryophyllene'],
    category: 'CBD',
  },
  {
    id: 'demo-8',
    name: 'Northern Lights',
    description: 'One of the most famous indica strains, renowned for its resinous buds and ability to provide deep relaxation and pain relief.',
    thcContent: 21.0,
    cbdContent: 0.8,
    retailPrice: 14.50,
    availability: true,
    stock: 32,
    imageUrl: 'https://images.unsplash.com/photo-1585555489619-88a47e09f9e3?w=400&q=80',
    effects: ['Relaxed', 'Euphoric', 'Sleepy', 'Pain Relief'],
    terpenes: ['Myrcene', 'Caryophyllene', 'Limonene'],
    category: 'Indica',
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
      // Try to fetch from Dr Green API via edge function
      const { data, error: fnError } = await supabase.functions.invoke('drgreen-proxy', {
        body: {
          action: 'get-strains',
          countryCode: alpha3Code,
        },
      });

      if (fnError) {
        console.warn('Dr Green API unavailable, using mock data:', fnError);
        setProducts(mockProducts);
      } else if (data?.success && data?.data?.strains?.length > 0) {
        // Transform API response to our Product interface
        // API returns: { success, statusCode, data: { strains: [...] } }
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
        // Use mock data if no strains returned from API
        console.log('No strains from API, using mock data');
        setProducts(mockProducts);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      // Fallback to mock data
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
