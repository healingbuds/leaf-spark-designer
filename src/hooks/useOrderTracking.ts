import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useShop } from '@/context/ShopContext';

interface OrderItem {
  strain_id: string;
  strain_name: string;
  quantity: number;
  unit_price: number;
}

interface LocalOrder {
  id: string;
  user_id: string;
  drgreen_order_id: string;
  status: string;
  payment_status: string;
  total_amount: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export function useOrderTracking() {
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { addToCart } = useShop();

  const fetchOrders = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('drgreen_orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders((data || []).map(order => ({
        ...order,
        items: (order.items as unknown as OrderItem[]) || []
      })));
    }
    setIsLoading(false);
  }, []);

  // Set up realtime subscription for order updates
  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('order-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'drgreen_orders'
        },
        (payload) => {
          const updatedOrder = payload.new as LocalOrder;
          const oldOrder = payload.old as LocalOrder;
          
          // Show notification if status changed
          if (oldOrder.status !== updatedOrder.status) {
            toast({
              title: 'Order Status Updated',
              description: `Order #${updatedOrder.drgreen_order_id.slice(0, 8)}... is now ${updatedOrder.status}`,
            });
          }
          
          if (oldOrder.payment_status !== updatedOrder.payment_status) {
            toast({
              title: 'Payment Status Updated',
              description: `Payment for order #${updatedOrder.drgreen_order_id.slice(0, 8)}... is ${updatedOrder.payment_status}`,
            });
          }

          // Update local state
          setOrders(prev => 
            prev.map(order => 
              order.id === updatedOrder.id 
                ? { ...updatedOrder, items: (updatedOrder.items as unknown as OrderItem[]) || [] }
                : order
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'drgreen_orders'
        },
        (payload) => {
          const newOrder = payload.new as LocalOrder;
          setOrders(prev => [{ ...newOrder, items: (newOrder.items as unknown as OrderItem[]) || [] }, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, toast]);

  // Reorder - add all items from a previous order to cart
  const reorder = async (order: LocalOrder) => {
    if (!order.items || order.items.length === 0) {
      toast({
        title: 'Cannot reorder',
        description: 'No items found in this order.',
        variant: 'destructive',
      });
      return;
    }

    try {
      for (const item of order.items) {
        await addToCart({
          strain_id: item.strain_id,
          strain_name: item.strain_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
        });
      }

      toast({
        title: 'Items added to cart',
        description: `${order.items.length} item(s) from your previous order have been added to your cart.`,
      });
    } catch (error) {
      console.error('Error reordering:', error);
      toast({
        title: 'Reorder failed',
        description: 'Failed to add items to cart. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Save order locally (called after checkout)
  const saveOrder = async (orderData: {
    drgreen_order_id: string;
    status: string;
    payment_status: string;
    total_amount: number;
    items: OrderItem[];
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('drgreen_orders')
      .insert([{
        user_id: user.id,
        drgreen_order_id: orderData.drgreen_order_id,
        status: orderData.status,
        payment_status: orderData.payment_status,
        total_amount: orderData.total_amount,
        items: JSON.parse(JSON.stringify(orderData.items)),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving order:', error);
      return null;
    }

    return data;
  };

  // Update order status (for webhook or polling)
  const updateOrderStatus = async (
    orderId: string, 
    updates: { status?: string; payment_status?: string }
  ) => {
    const { error } = await supabase
      .from('drgreen_orders')
      .update(updates)
      .eq('drgreen_order_id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
    }
  };

  return {
    orders,
    isLoading,
    reorder,
    saveOrder,
    updateOrderStatus,
    refreshOrders: fetchOrders,
  };
}
