import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/components/ThemeProvider";
import ScrollToTop from "@/components/ScrollToTop";
import RouteProgress from "@/components/RouteProgress";
import CursorFollower from "@/components/CursorFollower";
import PageLoadingSkeleton from "@/components/PageLoadingSkeleton";
import ErrorBoundary from "@/components/ErrorBoundary";
import SkipLinks from "@/components/SkipLinks";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ProtectedNFTRoute } from "@/components/ProtectedNFTRoute";
import { ComplianceGuard } from "@/components/ComplianceGuard";

import { ShopProvider } from "@/context/ShopContext";
import { CursorProvider } from "@/context/CursorContext";
import { WalletProvider } from "@/providers/WalletProvider";
import { WalletContextProvider } from "@/context/WalletContext";
import { TenantProvider } from "@/context/TenantContext";


// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Eligibility = lazy(() => import("./pages/Eligibility"));
const Support = lazy(() => import("./pages/Support"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Conditions = lazy(() => import("./pages/Conditions"));
const Traceability = lazy(() => import("./pages/Traceability"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const NotFound = lazy(() => import("./pages/NotFound"));
const NotEligible = lazy(() => import("./pages/NotEligible"));
const Auth = lazy(() => import("./pages/Auth"));
const Shop = lazy(() => import("./pages/Shop"));
const ShopRegister = lazy(() => import("./pages/ShopRegister"));
const CultivarDetail = lazy(() => import("./pages/CultivarDetail"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Orders = lazy(() => import("./pages/Orders"));
const DashboardStatus = lazy(() => import("./pages/DashboardStatus"));
const PatientDashboard = lazy(() => import("./pages/PatientDashboard"));
const AdminPrescriptions = lazy(() => import("./pages/AdminPrescriptions"));
const AdminStrains = lazy(() => import("./pages/AdminStrains"));
const AdminStrainSync = lazy(() => import("./pages/AdminStrainSync"));
const AdminStrainKnowledge = lazy(() => import("./pages/AdminStrainKnowledge"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Research = lazy(() => import("./pages/Research"));
const TheWire = lazy(() => import("./pages/TheWire"));
const ArticleDetail = lazy(() => import("./pages/ArticleDetail"));


const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<PageLoadingSkeleton variant="hero" />}>
        <Routes location={location} key={location.pathname}>
          {/* Core Pages */}
          <Route path="/" element={<Index />} />
          <Route path="/eligibility" element={<Eligibility />} />
          <Route path="/support" element={<Support />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/conditions" element={<Conditions />} />
          <Route path="/traceability" element={<Traceability />} />
          <Route path="/not-eligible" element={<NotEligible />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/research" element={<Research />} />
          <Route path="/the-wire" element={<TheWire />} />
          <Route path="/the-wire/:slug" element={<ArticleDetail />} />
          
          {/* Patient Portal */}
          <Route path="/dashboard" element={<PatientDashboard />} />
          <Route path="/dashboard/status" element={<DashboardStatus />} />
          <Route path="/orders" element={
            <ComplianceGuard>
              <Orders />
            </ComplianceGuard>
          } />
          
          {/* Shop - Protected by ComplianceGuard */}
          <Route path="/shop" element={
            <ComplianceGuard>
              <Shop />
            </ComplianceGuard>
          } />
          <Route path="/shop/register" element={<ShopRegister />} />
          <Route path="/shop/cultivar/:cultivarId" element={
            <ComplianceGuard>
              <CultivarDetail />
            </ComplianceGuard>
          } />
          <Route path="/checkout" element={
            <ComplianceGuard>
              <Checkout />
            </ComplianceGuard>
          } />
          
          {/* Admin Routes - Protected by AdminLayout (which uses useUserRole) */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/prescriptions" element={<AdminPrescriptions />} />
          <Route path="/admin/strains" element={<AdminStrains />} />
          <Route path="/admin/strain-sync" element={<AdminStrainSync />} />
          <Route path="/admin/strain-knowledge" element={<AdminStrainKnowledge />} />
          
          
          {/* Legal */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => (
  <ErrorBoundary>
    <WalletProvider>
      <ThemeProvider defaultTheme="light" storageKey="healing-buds-theme">
        <CursorProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <WalletContextProvider>
                <ShopProvider>
                  <CursorFollower>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <TenantProvider>
                        <SkipLinks />
                        <ScrollToTop />
                        <RouteProgress />
                        <main id="main-content" tabIndex={-1}>
                          <AnimatedRoutes />
                        </main>
                      </TenantProvider>
                    </BrowserRouter>
                  </CursorFollower>
                </ShopProvider>
              </WalletContextProvider>
            </TooltipProvider>
          </QueryClientProvider>
        </CursorProvider>
      </ThemeProvider>
    </WalletProvider>
  </ErrorBoundary>
);

export default App;
