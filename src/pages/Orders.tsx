import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, Clock, CheckCircle2, XCircle, Truck, Loader2, RefreshCw, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { EligibilityGate } from '@/components/shop/EligibilityGate';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { useShop } from '@/context/ShopContext';

const getStatusIcon = (status: string) => {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
    case 'DELIVERED':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'PENDING':
    case 'PROCESSING':
      return <Clock className="h-4 w-4" />;
    case 'SHIPPED':
      return <Truck className="h-4 w-4" />;
    case 'CANCELLED':
    case 'FAILED':
      return <XCircle className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
    case 'DELIVERED':
    case 'PAID':
      return 'default';
    case 'PENDING':
    case 'PROCESSING':
      return 'secondary';
    case 'CANCELLED':
    case 'FAILED':
      return 'destructive';
    default:
      return 'outline';
  }
};

const Orders = () => {
  const navigate = useNavigate();
  const { orders, isLoading, reorder } = useOrderTracking();
  const { setIsCartOpen, isEligible } = useShop();

  const handleReorder = async (order: typeof orders[0]) => {
    await reorder(order);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <EligibilityGate>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              {/* Back button */}
              <Button
                variant="ghost"
                className="mb-6"
                onClick={() => navigate('/shop')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dispensary
              </Button>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order History
                    <Badge variant="outline" className="ml-2 text-xs">
                      Live Updates
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No Orders Yet
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        You haven't placed any orders yet. Browse our dispensary to find your medicine.
                      </p>
                      <Button onClick={() => navigate('/shop')}>
                        Browse Dispensary
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order, index) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex flex-col gap-4">
                            {/* Order header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-sm text-primary">
                                    #{order.drgreen_order_id.slice(0, 8)}...
                                  </span>
                                  <Badge variant={getStatusVariant(order.status)}>
                                    {getStatusIcon(order.status)}
                                    <span className="ml-1">{order.status}</span>
                                  </Badge>
                                  <Badge
                                    variant={getStatusVariant(order.payment_status)}
                                    className="text-xs"
                                  >
                                    {order.payment_status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.created_at).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <p className="font-semibold text-foreground text-lg">
                                  €{order.total_amount.toFixed(2)}
                                </p>
                              </div>
                            </div>

                            {/* Order items */}
                            {order.items && order.items.length > 0 && (
                              <div className="bg-background/50 rounded-md p-3">
                                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Items</p>
                                <div className="space-y-1">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                      <span className="text-foreground">{item.strain_name}</span>
                                      <span className="text-muted-foreground">
                                        {item.quantity}g × €{item.unit_price.toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Reorder button */}
                            {isEligible && order.items && order.items.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto self-end"
                                onClick={() => handleReorder(order)}
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reorder
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </EligibilityGate>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
