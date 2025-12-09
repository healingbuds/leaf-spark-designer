import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/components/ThemeProvider";
import ScrollToTop from "@/components/ScrollToTop";
import RouteProgress from "@/components/RouteProgress";
import Index from "./pages/Index";
import WhatWeDo from "./pages/WhatWeDo";
import TheWire from "./pages/TheWire";
import NewsArticle from "./pages/NewsArticle";

import CultivatingProcessing from "./pages/CultivatingProcessing";
import ManufactureDistribution from "./pages/ManufactureDistribution";
import Conditions from "./pages/Conditions";
import ConditionRouter from "./pages/conditions/ConditionRouter";
import MedicalClinics from "./pages/MedicalClinics";
import OnlinePharmacy from "./pages/OnlinePharmacy";
import Research from "./pages/Research";
import AboutUs from "./pages/AboutUs";
import BlockchainTechnology from "./pages/BlockchainTechnology";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
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
    </AnimatePresence>
  );
};

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="healing-buds-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <RouteProgress />
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
