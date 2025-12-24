import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Shield, 
  Award, 
  Truck,
  CheckCircle2,
  Stethoscope,
  FlaskConical
} from "lucide-react";
import Header from "@/layout/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import BackToTop from "@/components/BackToTop";
import MobileBottomActions from "@/components/MobileBottomActions";
import SEOHead from "@/components/SEOHead";
import HBIcon from "@/components/HBIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useShop } from "@/context/ShopContext";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/shop/ProductCard";

const trustIndicators = [
  { icon: Award, label: "EU GMP Certified" },
  { icon: FlaskConical, label: "Lab Tested" },
  { icon: Shield, label: "Secure & Compliant" },
  { icon: Truck, label: "Discreet Delivery" }
];

const eligibilitySteps = [
  { step: 1, title: "Complete Assessment", description: "Fill out our secure medical questionnaire" },
  { step: 2, title: "Verify Identity", description: "Quick KYC verification process" },
  { step: 3, title: "Get Approved", description: "Medical team reviews your application" }
];

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { drGreenClient, isEligible, countryCode } = useShop();
  const { products, isLoading: productsLoading } = useProducts(countryCode);

  // Get featured products (first 4 available products)
  const featuredProducts = products?.slice(0, 4) || [];

  return (
    <PageTransition>
      <SEOHead 
        title="Healing Buds | Medical Cannabis Dispensary"
        description="Access pharmaceutical-grade medical cannabis products. Complete our secure medical assessment to check your eligibility for treatment."
        canonical="/"
      />
      <div className="min-h-screen bg-background pb-20 lg:pb-0">
        <Header onMenuStateChange={setMenuOpen} />
        
        <main>
          {/* Hero Section - Store First */}
          <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 lg:py-24">
              <div className="max-w-4xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
                    <HBIcon size="sm" />
                    Medical Cannabis Dispensary
                  </span>
                  
                  <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                    Pharmaceutical-Grade
                    <span className="block text-primary">Medical Cannabis</span>
                  </h1>
                  
                  <p className="font-body text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                    Access quality-controlled, lab-tested medical cannabis products. 
                    Complete our secure medical assessment to check your eligibility.
                  </p>

                  {/* Primary CTAs */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <Button 
                      size="lg" 
                      className="text-lg px-8 py-6"
                      onClick={() => navigate('/eligibility')}
                    >
                      Check Eligibility
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    
                    {isEligible ? (
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="text-lg px-8 py-6"
                        onClick={() => navigate('/shop')}
                      >
                        Browse Products
                      </Button>
                    ) : (
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="text-lg px-8 py-6"
                        onClick={() => navigate(drGreenClient ? '/eligibility' : '/auth')}
                      >
                        {drGreenClient ? 'Start Assessment' : 'Sign In'}
                      </Button>
                    )}
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                    {trustIndicators.map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-center gap-2 text-muted-foreground"
                      >
                        <item.icon className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Eligibility Status Banner (for logged in users) */}
          {drGreenClient && !isEligible && (
            <section className="py-6 bg-amber-500/10 border-y border-amber-500/20">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
                  <Stethoscope className="w-6 h-6 text-amber-500" />
                  <p className="text-foreground">
                    <span className="font-semibold">Verification in progress</span>
                    <span className="text-muted-foreground ml-2">
                      {drGreenClient.is_kyc_verified 
                        ? 'Awaiting medical review approval' 
                        : 'Please complete identity verification to continue'}
                    </span>
                  </p>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/eligibility">View Status</Link>
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* Quick Eligibility Process */}
          <section className="py-16 lg:py-24 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-5xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-12"
                >
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Get Started in 3 Simple Steps
                  </h2>
                  <p className="font-body text-muted-foreground max-w-2xl mx-auto">
                    Our streamlined verification process ensures safe and legal access to medical cannabis.
                  </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                  {eligibilitySteps.map((item, index) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="h-full bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                        <CardContent className="p-6 text-center">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <span className="text-xl font-bold text-primary">{item.step}</span>
                          </div>
                          <h3 className="font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center mt-10">
                  <Button 
                    size="lg"
                    onClick={() => navigate('/eligibility')}
                  >
                    Start Your Assessment
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Products (only for eligible users) */}
          {isEligible && featuredProducts.length > 0 && (
            <section className="py-16 lg:py-24">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-between mb-10"
                  >
                    <div>
                      <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                        Featured Products
                      </h2>
                      <p className="font-body text-muted-foreground">
                        Pharmaceutical-grade medical cannabis
                      </p>
                    </div>
                    <Button asChild variant="outline">
                      <Link to="/shop">
                        View All
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </motion.div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ProductCard product={product} onViewDetails={() => navigate(`/shop/cultivar/${product.id}`)} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Medical Compliance Banner */}
          <section className="py-12 bg-primary/5 border-y border-primary/10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      Regulated Medical Products
                    </h3>
                    <p className="text-muted-foreground">
                      All products are EU GMP certified with full seed-to-sale traceability. 
                      Access is limited to verified patients with qualifying medical conditions.
                    </p>
                  </div>
                  <Button asChild variant="outline" className="flex-shrink-0">
                    <Link to="/support">Learn More</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="py-16 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <HBIcon size="xl" className="mx-auto mb-6" />
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Ready to Get Started?
                  </h2>
                  <p className="font-body text-lg text-muted-foreground mb-8">
                    Check your eligibility for medical cannabis treatment today.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
                      className="text-lg px-8 py-6"
                      onClick={() => navigate('/eligibility')}
                    >
                      Start Medical Assessment
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="text-lg px-8 py-6"
                      onClick={() => navigate('/support')}
                    >
                      Have Questions?
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
        <BackToTop />
        <MobileBottomActions menuOpen={menuOpen} />
      </div>
    </PageTransition>
  );
};

export default Index;
