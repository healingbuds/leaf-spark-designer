import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { updateCachedRates } from '@/lib/currency';

interface CartItem {
  id: string;
  strain_id: string;
  strain_name: string;
  quantity: number;
  unit_price: number; // Always in EUR from Dr Green API
}

interface DrGreenClient {
  id: string;
  user_id: string;
  drgreen_client_id: string;
  country_code: string;
  is_kyc_verified: boolean;
  admin_approval: string;
  kyc_link: string | null;
}

interface ExchangeRatesData {
  ZAR: number;
  EUR: number;
  GBP: number;
  USD: number;
  THB: number;
}

interface ShopContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  cartTotalConverted: number; // In user's currency
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (strainId: string) => Promise<void>;
  updateQuantity: (strainId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  drGreenClient: DrGreenClient | null;
  isEligible: boolean;
  isLoading: boolean;
  refreshClient: () => Promise<void>;
  syncVerificationFromDrGreen: () => Promise<boolean>;
  isSyncing: boolean;
  countryCode: string;
  setCountryCode: (code: string) => void;
  // Exchange rates
  exchangeRates: ExchangeRatesData | null;
  convertFromEUR: (amount: number, toCountry?: string) => number;
  /** @deprecated Use convertFromEUR instead - API returns EUR prices */
  convertFromZAR: (amount: number, toCountry?: string) => number;
  ratesLastUpdated: Date | null;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

// Currency mapping
const COUNTRY_TO_CURRENCY: Record<string, keyof ExchangeRatesData> = {
  PT: 'EUR',
  ZA: 'ZAR',
  GB: 'GBP',
  TH: 'THB',
  US: 'USD',
};

// Get country code from domain (URL-first strategy)
function getCountryFromDomain(): string {
  const hostname = window.location.hostname.toLowerCase();
  
  // Lovable preview URLs and .co.za domains → South Africa
  if (hostname.includes('lovable.app') || hostname.includes('lovableproject.com') || hostname.endsWith('.co.za')) {
    return 'ZA';
  }
  // Portugal domains
  if (hostname.endsWith('.pt') || hostname.includes('healingbuds.pt')) {
    return 'PT';
  }
  // UK domains
  if (hostname.endsWith('.co.uk') || hostname.includes('healingbuds.co.uk')) {
    return 'GB';
  }
  // Thailand domains
  if (hostname.endsWith('.co.th') || hostname.endsWith('.th')) {
    return 'TH';
  }
  // Global domains → South Africa (operational region)
  if (hostname.endsWith('.global') || hostname.includes('healingbuds.global')) {
    return 'ZA';
  }
  // Global/fallback to South Africa
  return 'ZA';
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const { rates, lastUpdated, convertPrice } = useExchangeRates();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [drGreenClient, setDrGreenClient] = useState<DrGreenClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  // Country is determined by URL domain, not geolocation
  const [countryCode, setCountryCode] = useState<string>(() => getCountryFromDomain());
  const { toast } = useToast();

  // Update cached rates when they change
  useEffect(() => {
    if (rates) {
      updateCachedRates(rates);
    }
  }, [rates]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  
  // Convert cart total to user's currency (API returns prices in EUR)
  const convertFromEUR = useCallback((amount: number, toCountry?: string): number => {
    const targetCountry = toCountry || countryCode;
    return convertPrice(amount, 'EUR', targetCountry);
  }, [convertPrice, countryCode]);

  // Keep legacy function for backwards compatibility
  const convertFromZAR = useCallback((amount: number, toCountry?: string): number => {
    const targetCountry = toCountry || countryCode;
    return convertPrice(amount, 'EUR', targetCountry); // Actually converts from EUR now
  }, [convertPrice, countryCode]);

  const cartTotalConverted = convertFromEUR(cartTotal);
  
  const isEligible = drGreenClient?.is_kyc_verified === true && drGreenClient?.admin_approval === 'VERIFIED';

  const fetchCart = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCart([]);
      return;
    }

    const { data, error } = await supabase
      .from('drgreen_cart')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching cart:', error);
      return;
    }

    setCart(data || []);
  }, []);

  const fetchClient = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setDrGreenClient(null);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('drgreen_clients')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching client:', error);
    }

    setDrGreenClient(data);
    // NOTE: Country is determined by URL domain, NOT client record
    // Client's stored country_code is for their registration, not for browsing
    setIsLoading(false);
  }, []);

  const refreshClient = useCallback(async () => {
    await fetchClient();
  }, [fetchClient]);

  // Sync verification status from Dr Green API
  const syncVerificationFromDrGreen = useCallback(async (): Promise<boolean> => {
    if (!drGreenClient?.drgreen_client_id) return false;
    
    // Skip sync for local-only clients (API registration failed)
    if (drGreenClient.drgreen_client_id.startsWith('local-')) {
      console.log('[ShopContext] Skipping sync for local-only client - re-registration required');
      return false;
    }
    
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('drgreen-proxy', {
        body: {
          action: 'get-client',
          clientId: drGreenClient.drgreen_client_id,
        },
      });

      // Handle errors gracefully - don't propagate to UI
      if (error) {
        const errorMessage = error.message || '';
        // Handle 401 specifically - client may not exist in Dr Green API
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
          console.warn('[ShopContext] Client not found in Dr Green API (401) - using local data only');
          return false;
        }
        console.warn('[ShopContext] Error syncing from Dr Green:', error.message);
        return false;
      }

      // Also check for 401 in the response data itself
      if (data?.error && (data.statusCode === 401 || data.message?.includes('Unauthorized'))) {
        console.warn('[ShopContext] Dr Green API returned 401 - client may not exist');
        return false;
      }

      if (data?.success && data?.data) {
        const clientData = data.data;
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Update local database with fresh status
          const { error: updateError } = await supabase
            .from('drgreen_clients')
            .update({
              is_kyc_verified: clientData.isKYCVerified ?? clientData.is_kyc_verified ?? false,
              admin_approval: clientData.adminApproval ?? clientData.admin_approval ?? 'PENDING',
              kyc_link: clientData.kycLink ?? clientData.kyc_link ?? null,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);

          if (updateError) {
            console.error('[ShopContext] Error updating client status:', updateError);
            return false;
          }

          // Refresh local state
          await fetchClient();
          return true;
        }
      }
      return false;
    } catch (err) {
      // Gracefully handle - log warning instead of error to avoid alarming console output
      console.warn('[ShopContext] Sync verification warning:', err);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [drGreenClient?.drgreen_client_id, fetchClient]);

  useEffect(() => {
    fetchCart();
    fetchClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchCart();
      fetchClient();
    });

    return () => subscription.unsubscribe();
  }, [fetchCart, fetchClient]);

  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('drgreen_cart')
      .upsert({
        user_id: user.id,
        strain_id: item.strain_id,
        strain_name: item.strain_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }, {
        onConflict: 'user_id,strain_id',
      });

    if (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
      return;
    }

    await fetchCart();
    toast({
      title: "Added to cart",
      description: `${item.strain_name} added to your cart.`,
    });
  };

  const removeFromCart = async (strainId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('drgreen_cart')
      .delete()
      .eq('user_id', user.id)
      .eq('strain_id', strainId);

    if (error) {
      console.error('Error removing from cart:', error);
      return;
    }

    await fetchCart();
  };

  const updateQuantity = async (strainId: string, quantity: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (quantity <= 0) {
      await removeFromCart(strainId);
      return;
    }

    const { error } = await supabase
      .from('drgreen_cart')
      .update({ quantity })
      .eq('user_id', user.id)
      .eq('strain_id', strainId);

    if (error) {
      console.error('Error updating quantity:', error);
      return;
    }

    await fetchCart();
  };

  const clearCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('drgreen_cart')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing cart:', error);
      return;
    }

    setCart([]);
  };

  return (
    <ShopContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        cartTotalConverted,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        drGreenClient,
        isEligible,
        isLoading,
        refreshClient,
        syncVerificationFromDrGreen,
        isSyncing,
        countryCode,
        setCountryCode,
        exchangeRates: rates,
        convertFromEUR,
        convertFromZAR, // deprecated, but kept for compatibility
        ratesLastUpdated: lastUpdated,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
