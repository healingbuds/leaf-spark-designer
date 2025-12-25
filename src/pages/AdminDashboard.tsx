import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/lib/currency";
import { motion } from "framer-motion";
import { 
  FileText, 
  Leaf, 
  Users, 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  TrendingUp,
  Package,
  Settings,
  Shield,
  Mail,
  User,
  ToggleLeft,
  ToggleRight,
  Loader2,
  DollarSign,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/layout/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useDrGreenApi } from "@/hooks/useDrGreenApi";

interface DashboardStats {
  pendingPrescriptions: number;
  approvedPrescriptions: number;
  rejectedPrescriptions: number;
  totalStrains: number;
  availableStrains: number;
  archivedStrains: number;
  totalOrders: number;
  pendingOrders: number;
  totalClients: number;
  verifiedClients: number;
  // Dr Green Dapp live stats
  dappTotalClients?: number;
  dappTotalOrders?: number;
  dappTotalSales?: number;
  dappPendingClients?: number;
}

interface AdminUser {
  email: string;
  fullName: string | null;
  createdAt: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getDashboardSummary, getSalesSummary } = useDrGreenApi();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [demoKycEnabled, setDemoKycEnabled] = useState(false);
  const [togglingKyc, setTogglingKyc] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');

      if (!roles || roles.length === 0) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Get admin user details
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      setAdminUser({
        email: user.email || '',
        fullName: profile?.full_name || null,
        createdAt: user.created_at,
      });

      // Check current KYC demo status
      const { data: clientData } = await supabase
        .from('drgreen_clients')
        .select('is_kyc_verified, admin_approval')
        .eq('user_id', user.id)
        .maybeSingle();

      if (clientData) {
        setDemoKycEnabled(clientData.is_kyc_verified && clientData.admin_approval === 'VERIFIED');
      }

      setIsAdmin(true);
      await fetchStats();
    } catch (error) {
      console.error('Error checking admin status:', error);
      setLoading(false);
    }
  };

  const fetchStats = async (showRefreshToast = false) => {
    if (showRefreshToast) setRefreshing(true);
    
    try {
      // Fetch prescription stats from Supabase
      const { data: prescriptions } = await supabase
        .from('prescription_documents')
        .select('status');

      const pendingPrescriptions = prescriptions?.filter(p => p.status === 'pending').length || 0;
      const approvedPrescriptions = prescriptions?.filter(p => p.status === 'approved').length || 0;
      const rejectedPrescriptions = prescriptions?.filter(p => p.status === 'rejected').length || 0;

      // Fetch strain stats from Supabase
      const { data: strains } = await supabase
        .from('strains')
        .select('availability, is_archived');

      const totalStrains = strains?.length || 0;
      const availableStrains = strains?.filter(s => s.availability && !s.is_archived).length || 0;
      const archivedStrains = strains?.filter(s => s.is_archived).length || 0;

      // Fetch order stats from Supabase
      const { data: orders } = await supabase
        .from('drgreen_orders')
        .select('status');

      const totalOrders = orders?.length || 0;
      const pendingOrders = orders?.filter(o => o.status === 'PENDING').length || 0;

      // Fetch client stats from Supabase
      const { data: clients } = await supabase
        .from('drgreen_clients')
        .select('is_kyc_verified, admin_approval');

      const totalClients = clients?.length || 0;
      const verifiedClients = clients?.filter(c => c.is_kyc_verified && c.admin_approval === 'VERIFIED').length || 0;

      // Fetch LIVE stats from Dr Green Dapp API
      let dappTotalClients = 0;
      let dappTotalOrders = 0;
      let dappTotalSales = 0;
      let dappPendingClients = 0;

      try {
        const { data: dappSummary, error: dappError } = await getDashboardSummary();
        if (!dappError && dappSummary) {
          dappTotalClients = dappSummary.totalClients || 0;
          dappTotalOrders = dappSummary.totalOrders || 0;
          dappPendingClients = dappSummary.pendingClients || 0;
        }
        
        const { data: salesSummary, error: salesError } = await getSalesSummary();
        if (!salesError && salesSummary) {
          dappTotalSales = salesSummary.totalSales || 0;
        }
      } catch (dappErr) {
        console.log('Dr Green Dapp API stats not available:', dappErr);
      }

      setStats({
        pendingPrescriptions,
        approvedPrescriptions,
        rejectedPrescriptions,
        totalStrains,
        availableStrains,
        archivedStrains,
        totalOrders,
        pendingOrders,
        totalClients,
        verifiedClients,
        dappTotalClients,
        dappTotalOrders,
        dappTotalSales,
        dappPendingClients,
      });

      if (showRefreshToast) {
        toast({
          title: "Data Refreshed",
          description: "Dashboard statistics updated from live API.",
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleDemoKyc = async () => {
    setTogglingKyc(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newStatus = !demoKycEnabled;

      // Check if user has a drgreen_clients record
      const { data: existingClient } = await supabase
        .from('drgreen_clients')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingClient) {
        // Update existing record
        const { error } = await supabase
          .from('drgreen_clients')
          .update({
            is_kyc_verified: newStatus,
            admin_approval: newStatus ? 'VERIFIED' : 'PENDING',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new record for demo
        const { error } = await supabase
          .from('drgreen_clients')
          .insert({
            user_id: user.id,
            drgreen_client_id: `demo-${user.id}`,
            country_code: 'PT',
            is_kyc_verified: newStatus,
            admin_approval: newStatus ? 'VERIFIED' : 'PENDING',
          });

        if (error) throw error;
      }

      setDemoKycEnabled(newStatus);
      toast({
        title: newStatus ? "Demo KYC Enabled" : "Demo KYC Disabled",
        description: newStatus 
          ? "You can now access all shop features without KYC verification." 
          : "KYC verification is now required for shop access.",
      });
    } catch (error) {
      console.error('Error toggling demo KYC:', error);
      toast({
        title: "Error",
        description: "Failed to update KYC status.",
        variant: "destructive",
      });
    } finally {
      setTogglingKyc(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <Skeleton className="h-10 w-64 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <XCircle className="w-16 h-16 text-destructive mx-auto" />
              <h1 className="text-3xl font-bold text-foreground">Access Denied</h1>
              <p className="text-muted-foreground">
                You do not have administrator privileges to access this page.
              </p>
              <Button onClick={() => navigate('/')}>
                Return Home
              </Button>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statCards = [
    // Dr Green Dapp Live Stats (from API)
    {
      title: "Dapp Clients (Live)",
      value: stats?.dappTotalClients || 0,
      icon: Users,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      live: true
    },
    {
      title: "Dapp Orders (Live)",
      value: stats?.dappTotalOrders || 0,
      icon: ShoppingCart,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      live: true
    },
    {
      title: "Total Sales (Live)",
      value: formatPrice(stats?.dappTotalSales || 0, 'ZA'),
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      live: true
    },
    {
      title: "Pending Approvals (Live)",
      value: stats?.dappPendingClients || 0,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      live: true
    },
    // Local Supabase Stats
    {
      title: "Pending Prescriptions",
      value: stats?.pendingPrescriptions || 0,
      icon: FileText,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      link: "/admin/prescriptions"
    },
    {
      title: "Approved Prescriptions",
      value: stats?.approvedPrescriptions || 0,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      link: "/admin/prescriptions"
    },
    {
      title: "Total Strains",
      value: stats?.totalStrains || 0,
      icon: Leaf,
      color: "text-primary",
      bgColor: "bg-primary/10",
      link: "/admin/strains"
    },
    {
      title: "Available Strains",
      value: stats?.availableStrains || 0,
      icon: Package,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      link: "/admin/strains"
    },
  ];

  const adminTools = [
    {
      title: "Prescription Management",
      description: "Review and approve patient prescription documents",
      icon: FileText,
      link: "/admin/prescriptions",
      badge: stats?.pendingPrescriptions ? `${stats.pendingPrescriptions} pending` : null
    },
    {
      title: "Strain Management",
      description: "Manage cannabis strain catalog and inventory",
      icon: Leaf,
      link: "/admin/strains",
      badge: stats?.archivedStrains ? `${stats.archivedStrains} archived` : null
    },
    {
      title: "Strain Sync Dashboard",
      description: "View country availability and trigger API syncs",
      icon: RefreshCw,
      link: "/admin/strain-sync",
      badge: null
    },
    {
      title: "Strain Knowledge Base",
      description: "AI-powered strain data from dispensary sources",
      icon: Package,
      link: "/admin/strain-knowledge",
      badge: null
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                  Live data from Dr Green Dapp API • Connected to production
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchStats(true)}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>

            {/* Admin Account Info & Demo Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              {/* Admin Account Info */}
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Admin Account</CardTitle>
                      <CardDescription>Your administrator credentials</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{adminUser?.email}</p>
                    </div>
                  </div>
                  {adminUser?.fullName && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="font-medium text-foreground">{adminUser.fullName}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Account Created</p>
                      <p className="font-medium text-foreground">
                        {adminUser?.createdAt ? new Date(adminUser.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Demo Settings */}
              <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Settings className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Demo Settings</CardTitle>
                      <CardDescription>Toggle KYC bypass for testing</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {demoKycEnabled ? (
                          <ToggleRight className="w-5 h-5 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div>
                          <Label htmlFor="demo-kyc" className="font-medium cursor-pointer">
                            Bypass KYC Verification
                          </Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Enable to access shop without completing KYC
                          </p>
                        </div>
                      </div>
                      {togglingKyc ? (
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      ) : (
                        <Switch
                          id="demo-kyc"
                          checked={demoKycEnabled}
                          onCheckedChange={handleToggleDemoKyc}
                        />
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <p className="font-medium text-foreground mb-1">⚠️ Demo Mode Only</p>
                    <p>This setting bypasses KYC for your admin account only. Use for testing the full shop experience without completing actual verification.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${stat.link ? 'hover:border-primary/50' : ''} ${stat.live ? 'border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-transparent' : ''}`}
                    onClick={() => stat.link && navigate(stat.link)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                            {stat.live && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded animate-pulse">
                                LIVE
                              </span>
                            )}
                          </div>
                          <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-full ${stat.bgColor}`}>
                          <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Admin Tools */}
            <h2 className="text-2xl font-semibold text-foreground mb-6">Admin Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adminTools.map((tool, index) => (
                <motion.div
                  key={tool.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all hover:border-primary/50 group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-primary/10">
                            <tool.icon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{tool.title}</CardTitle>
                            <CardDescription className="mt-1">{tool.description}</CardDescription>
                          </div>
                        </div>
                        {tool.badge && (
                          <span className="px-3 py-1 text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => navigate(tool.link)}
                        className="w-full group-hover:bg-primary"
                        variant="outline"
                      >
                        Open Tool
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
