import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, CreditCard, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Header from '@/layout/Header';
import Footer from '@/components/Footer';
import { useShop } from '@/context/ShopContext';
import { EligibilityGate } from '@/components/shop/EligibilityGate';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { useDrGreenApi } from '@/hooks/useDrGreenApi';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { formatPrice, getCurrencyForCountry } from '@/lib/currency';

const Checkout = () => {
  const { cart, cartTotal, clearCart, drGreenClient, countryCode } = useShop();
  const navigate = useNavigate();
  const { t } = useTranslation('shop');
  const { toast } = useToast();
  const { createOrder, createPayment, getPayment } = useDrGreenApi();
  const { saveOrder } = useOrderTracking();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('');

  const handlePlaceOrder = async () => {
    if (!drGreenClient || cart.length === 0) return;

    setIsProcessing(true);
    setPaymentStatus('Creating order...');

    try {
      // Step 1: Create order via Dr Green API
      const orderItems = cart.map((item) => ({
        strainId: item.strain_id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
      }));

      const orderResult = await createOrder({
        clientId: drGreenClient.drgreen_client_id,
        items: orderItems,
      });

      if (orderResult.error || !orderResult.data) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      const createdOrderId = orderResult.data.orderId;
      setPaymentStatus('Initiating payment...');

      // Step 2: Create payment via Dr Green API
      const countryCode = drGreenClient.country_code || 'PT';
      const paymentResult = await createPayment({
        orderId: createdOrderId,
        amount: cartTotal,
        currency: getCurrencyForCountry(countryCode),
        clientId: drGreenClient.drgreen_client_id,
      });

      if (paymentResult.error || !paymentResult.data) {
        throw new Error(paymentResult.error || 'Failed to initiate payment');
      }

      const paymentId = paymentResult.data.paymentId;
      setPaymentStatus('Processing payment...');

      // Step 3: Poll for payment status (simplified - in production would use webhooks)
      let attempts = 0;
      const maxAttempts = 10;
      let finalStatus = 'PENDING';
      let finalPaymentStatus = 'PENDING';
      
      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        const statusResult = await getPayment(paymentId);
        
        if (statusResult.data?.status === 'PAID') {
          finalStatus = 'CONFIRMED';
          finalPaymentStatus = 'PAID';
          break;
        } else if (statusResult.data?.status === 'FAILED' || statusResult.data?.status === 'CANCELLED') {
          throw new Error('Payment was not successful');
        }
        
        attempts++;
      }

      // Save order locally for tracking
      await saveOrder({
        drgreen_order_id: createdOrderId,
        status: finalStatus,
        payment_status: finalPaymentStatus,
        total_amount: cartTotal,
        items: cart.map(item => ({
          strain_id: item.strain_id,
          strain_name: item.strain_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      });

      setOrderId(createdOrderId);
      setOrderComplete(true);
      clearCart();
      
      toast({
        title: finalPaymentStatus === 'PAID' ? 'Order Placed Successfully' : 'Order Submitted',
        description: `Your order ${createdOrderId} has been ${finalPaymentStatus === 'PAID' ? 'confirmed' : 'submitted for processing'}.`,
      });
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Order Failed',
        description: error instanceof Error ? error.message : 'There was an error processing your order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setPaymentStatus('');
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="pt-12 pb-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold text-foreground mb-4">
                    Order Confirmed!
                  </h1>
                  <p className="text-muted-foreground mb-2">
                    Thank you for your order. Your order ID is:
                  </p>
                  <p className="text-xl font-mono text-primary mb-8">
                    {orderId}
                  </p>
                  <p className="text-sm text-muted-foreground mb-8">
                    You will receive an email confirmation shortly with tracking information.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="outline" onClick={() => navigate('/shop')}>
                      Continue Shopping
                    </Button>
                    <Button onClick={() => navigate('/orders')}>
                      View Orders
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="pt-12 pb-8 text-center">
                <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Your Cart is Empty
                </h2>
                <p className="text-muted-foreground mb-8">
                  Add some products to your cart before checking out.
                </p>
                <Button onClick={() => navigate('/shop')}>
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
                Back to Shop
              </Button>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Order Summary */}
                <div className="lg:col-span-2">
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        Order Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              {item.strain_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × {formatPrice(item.unit_price, countryCode)}
                            </p>
                          </div>
                          <p className="font-semibold text-foreground">
                            {formatPrice(item.quantity * item.unit_price, countryCode)}
                          </p>
                        </div>
                      ))}

                      <Separator />

                      <div className="flex items-center justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">{formatPrice(cartTotal, countryCode)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment Section */}
                <div className="lg:col-span-1">
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Shipping info */}
                      <div className="p-4 rounded-lg bg-muted/30">
                        <p className="text-sm font-medium text-foreground mb-1">
                          Shipping to
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {drGreenClient?.country_code || 'PT'}
                        </p>
                      </div>

                      {/* Notice */}
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                          Payment will be processed securely through our payment provider.
                        </p>
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {paymentStatus || 'Processing...'}
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Place Order - {formatPrice(cartTotal, countryCode)}
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        By placing this order, you agree to our terms of service and confirm that you are a verified medical patient.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          </EligibilityGate>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
