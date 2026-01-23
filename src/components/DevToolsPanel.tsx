import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, ShieldCheck, ShieldX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useShop } from '@/context/ShopContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function DevToolsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { drGreenClient, isEligible, refreshClient, isSyncing } = useShop();
  const { toast } = useToast();

  // Only show in development or for debugging
  const isDev = import.meta.env.DEV || window.location.hostname.includes('lovable');

  if (!isDev) return null;

  const toggleVerification = async () => {
    if (!drGreenClient) {
      toast({
        title: "No client record",
        description: "You need to complete registration first.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const newKycStatus = !drGreenClient.is_kyc_verified;
      const newApproval = newKycStatus ? 'VERIFIED' : 'PENDING';

      const { error } = await supabase
        .from('drgreen_clients')
        .update({
          is_kyc_verified: newKycStatus,
          admin_approval: newApproval,
          updated_at: new Date().toISOString(),
        })
        .eq('id', drGreenClient.id);

      if (error) throw error;

      await refreshClient();

      toast({
        title: newKycStatus ? "Verification Enabled" : "Verification Disabled",
        description: newKycStatus 
          ? "You can now access the full shop experience." 
          : "Cart and checkout are now restricted.",
      });
    } catch (err) {
      console.error('DevTools toggle error:', err);
      toast({
        title: "Update Failed",
        description: "Could not update verification status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 260, damping: 20 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-muted/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-lg"
        aria-label="Toggle DevTools"
        title="DevTools Panel"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-40 right-6 z-50 w-72 rounded-xl bg-card border border-border shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-muted/50 border-b border-border">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">DevTools</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                  DEV
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Verification Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="verification-toggle" className="text-sm font-medium">
                    Verification Status
                  </Label>
                  <Switch
                    id="verification-toggle"
                    checked={isEligible}
                    onCheckedChange={toggleVerification}
                    disabled={isUpdating || !drGreenClient}
                  />
                </div>
                
                {/* Status display */}
                <div className={`flex items-center gap-2 p-2.5 rounded-lg text-xs ${
                  isEligible 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  {isEligible ? (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Cart & Checkout Enabled</span>
                    </>
                  ) : (
                    <>
                      <ShieldX className="h-3.5 w-3.5" />
                      <span>Cart & Checkout Restricted</span>
                    </>
                  )}
                </div>
              </div>

              {/* Client Info */}
              {drGreenClient && (
                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                  <div className="flex justify-between">
                    <span>Client ID:</span>
                    <span className="font-mono truncate max-w-[140px]" title={drGreenClient.drgreen_client_id}>
                      {drGreenClient.drgreen_client_id.slice(0, 12)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>KYC:</span>
                    <span>{drGreenClient.is_kyc_verified ? '✓ Verified' : '✗ Pending'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approval:</span>
                    <span>{drGreenClient.admin_approval}</span>
                  </div>
                </div>
              )}

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={refreshClient}
                disabled={isSyncing}
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                Refresh Client Data
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
