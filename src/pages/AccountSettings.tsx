import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/layout/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ProfileEditForm } from "@/components/dashboard/ProfileEditForm";
import { useShop } from "@/context/ShopContext";

interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

interface ClientData {
  id: string;
  drgreenClientId: string;
  email: string | null;
  fullName: string | null;
  countryCode: string;
  phone: string | null;
  shippingAddress: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  } | null;
  isKycVerified: boolean;
  adminApproval: string;
}

export default function AccountSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { drGreenClient, refreshClient } = useShop();
  
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth?redirect=/account/settings');
        return;
      }

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      setUserProfile({
        id: user.id,
        email: user.email || '',
        fullName: profile?.full_name || null,
        avatarUrl: profile?.avatar_url || null,
        createdAt: user.created_at,
      });

      // Get drgreen client data
      const { data: client } = await supabase
        .from('drgreen_clients')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (client) {
        // Parse shipping_address safely
        let shippingAddress = null;
        if (client.shipping_address) {
          if (typeof client.shipping_address === 'string') {
            try {
              shippingAddress = JSON.parse(client.shipping_address);
            } catch {
              shippingAddress = null;
            }
          } else {
            shippingAddress = client.shipping_address as ClientData['shippingAddress'];
          }
        }

        setClientData({
          id: client.id,
          drgreenClientId: client.drgreen_client_id,
          email: client.email,
          fullName: client.full_name,
          countryCode: client.country_code,
          phone: (client as any).phone || null,
          shippingAddress,
          isKycVerified: client.is_kyc_verified || false,
          adminApproval: client.admin_approval || 'PENDING',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load account data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (data: { fullName: string }) => {
    if (!userProfile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: data.fullName })
        .eq('id', userProfile.id);

      if (error) throw error;

      setUserProfile(prev => prev ? { ...prev, fullName: data.fullName } : null);
      setEditingSection(null);
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleSaveContact = async (data: { phone: string; countryCode: string }) => {
    if (!clientData) return;

    try {
      const { error } = await supabase
        .from('drgreen_clients')
        .update({ 
          phone: data.phone,
          country_code: data.countryCode,
        })
        .eq('id', clientData.id);

      if (error) throw error;

      setClientData(prev => prev ? { 
        ...prev, 
        phone: data.phone, 
        countryCode: data.countryCode 
      } : null);
      setEditingSection(null);
      await refreshClient();
      toast({
        title: "Contact Updated",
        description: "Your contact details have been saved.",
      });
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "Error",
        description: "Failed to update contact details",
        variant: "destructive",
      });
    }
  };

  const handleSaveAddress = async (data: ClientData['shippingAddress']) => {
    if (!clientData) return;

    try {
      const { error } = await supabase
        .from('drgreen_clients')
        .update({ 
          shipping_address: data as any,
        })
        .eq('id', clientData.id);

      if (error) throw error;

      setClientData(prev => prev ? { ...prev, shippingAddress: data } : null);
      setEditingSection(null);
      await refreshClient();
      toast({
        title: "Address Updated",
        description: "Your shipping address has been saved.",
      });
    } catch (error) {
      console.error('Error updating address:', error);
      toast({
        title: "Error",
        description: "Failed to update shipping address",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <>
        <SEOHead title="Account Settings | Healing Buds" />
        <Header />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container max-w-4xl flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!userProfile) {
    return (
      <>
        <SEOHead title="Account Settings | Healing Buds" />
        <Header />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container max-w-4xl py-12">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">Please sign in to view your account settings.</p>
                <Button onClick={() => navigate('/auth?redirect=/account/settings')}>
                  Sign In
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title="Account Settings | Healing Buds" 
        description="Manage your account settings, profile information, and contact details."
      />
      <Header />
      
      <main className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container max-w-4xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </motion.div>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your profile, contact details, and shipping information
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* Profile Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Profile Information</CardTitle>
                      <CardDescription>Your basic account details</CardDescription>
                    </div>
                  </div>
                  {editingSection !== 'profile' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingSection('profile')}
                    >
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {editingSection === 'profile' ? (
                    <ProfileEditForm
                      section="profile"
                      initialData={{ fullName: userProfile.fullName || '' }}
                      onSave={handleSaveProfile}
                      onCancel={() => setEditingSection(null)}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-muted-foreground">Full Name</span>
                        <span className="font-medium">{userProfile.fullName || 'Not set'}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <span className="font-medium">{userProfile.email}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-muted-foreground">Member Since</span>
                        <span className="font-medium">
                          {new Date(userProfile.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Details Section */}
            {clientData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Contact Details</CardTitle>
                        <CardDescription>Your phone number and country</CardDescription>
                      </div>
                    </div>
                    {editingSection !== 'contact' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingSection('contact')}
                      >
                        Edit
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {editingSection === 'contact' ? (
                      <ProfileEditForm
                        section="contact"
                        initialData={{ 
                          phone: clientData.phone || '',
                          countryCode: clientData.countryCode,
                        }}
                        onSave={handleSaveContact}
                        onCancel={() => setEditingSection(null)}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-muted-foreground">Phone Number</span>
                          <span className="font-medium">{clientData.phone || 'Not set'}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-muted-foreground">Country</span>
                          <span className="font-medium">{clientData.countryCode}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Shipping Address Section */}
            {clientData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Shipping Address</CardTitle>
                        <CardDescription>Where your orders will be delivered</CardDescription>
                      </div>
                    </div>
                    {editingSection !== 'address' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingSection('address')}
                      >
                        Edit
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {editingSection === 'address' ? (
                      <ProfileEditForm
                        section="address"
                        initialData={clientData.shippingAddress || {}}
                        onSave={handleSaveAddress}
                        onCancel={() => setEditingSection(null)}
                      />
                    ) : (
                      <div className="space-y-4">
                        {clientData.shippingAddress?.address1 ? (
                          <>
                            <div className="flex items-center justify-between py-2">
                              <span className="text-sm text-muted-foreground">Address</span>
                              <span className="font-medium text-right">
                                {clientData.shippingAddress.address1}
                                {clientData.shippingAddress.address2 && (
                                  <>, {clientData.shippingAddress.address2}</>
                                )}
                              </span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between py-2">
                              <span className="text-sm text-muted-foreground">City</span>
                              <span className="font-medium">{clientData.shippingAddress.city}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between py-2">
                              <span className="text-sm text-muted-foreground">State/Region</span>
                              <span className="font-medium">{clientData.shippingAddress.state}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between py-2">
                              <span className="text-sm text-muted-foreground">Postal Code</span>
                              <span className="font-medium">{clientData.shippingAddress.postalCode}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between py-2">
                              <span className="text-sm text-muted-foreground">Country</span>
                              <span className="font-medium">{clientData.shippingAddress.country}</span>
                            </div>
                          </>
                        ) : (
                          <p className="text-muted-foreground py-4 text-center">
                            No shipping address set. Click Edit to add one.
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Verification Status Section */}
            {clientData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Verification Status</CardTitle>
                        <CardDescription>Your medical verification status</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-muted-foreground">KYC Verification</span>
                        <Badge variant={clientData.isKycVerified ? "default" : "secondary"}>
                          {clientData.isKycVerified ? (
                            <><CheckCircle2 className="h-3 w-3 mr-1" /> Verified</>
                          ) : (
                            <><AlertCircle className="h-3 w-3 mr-1" /> Pending</>
                          )}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-muted-foreground">Admin Approval</span>
                        <Badge 
                          variant={
                            clientData.adminApproval === 'VERIFIED' ? 'default' : 
                            clientData.adminApproval === 'REJECTED' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {clientData.adminApproval}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-muted-foreground">Client ID</span>
                        <span className="font-mono text-sm">{clientData.drgreenClientId.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* No Client Data */}
            {!clientData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">
                      You haven't completed the patient registration yet.
                    </p>
                    <Button onClick={() => navigate('/shop/register')}>
                      Complete Registration
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
