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

import { ShopProvider } from "@/context/ShopContext";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const WhatWeDo = lazy(() => import("./pages/WhatWeDo"));
const TheWire = lazy(() => import("./pages/TheWire"));
const NewsArticle = lazy(() => import("./pages/NewsArticle"));
const CultivatingProcessing = lazy(() => import("./pages/CultivatingProcessing"));
const ManufactureDistribution = lazy(() => import("./pages/ManufactureDistribution"));
const Conditions = lazy(() => import("./pages/Conditions"));
const ConditionRouter = lazy(() => import("./pages/conditions/ConditionRouter"));
const MedicalClinics = lazy(() => import("./pages/MedicalClinics"));
const OnlinePharmacy = lazy(() => import("./pages/OnlinePharmacy"));
const Research = lazy(() => import("./pages/Research"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const BlockchainTechnology = lazy(() => import("./pages/BlockchainTechnology"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Shop = lazy(() => import("./pages/Shop"));
const ShopRegister = lazy(() => import("./pages/ShopRegister"));
const Checkout = lazy(() => import("./pages/Checkout"));

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<PageLoadingSkeleton variant="hero" />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/register" element={<ShopRegister />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/what-we-do" element={<WhatWeDo />} />
          <Route path="/cultivating-processing" element={<CultivatingProcessing />} />
          <Route path="/manufacture-distribution" element={<ManufactureDistribution />} />
          <Route path="/conditions" element={<Conditions />} />
          <Route path="/conditions/:conditionId" element={<ConditionRouter />} />
          <Route path="/medical-clinics" element={<MedicalClinics />} />
          <Route path="/online-pharmacy" element={<OnlinePharmacy />} />
          <Route path="/research" element={<Research />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/blockchain-technology" element={<BlockchainTechnology />} />
          <Route path="/the-wire" element={<TheWire />} />
          <Route path="/the-wire/:articleId" element={<NewsArticle />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="healing-buds-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ShopProvider>
          <CursorFollower>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <RouteProgress />
              <AnimatedRoutes />
            </BrowserRouter>
          </CursorFollower>
        </ShopProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
