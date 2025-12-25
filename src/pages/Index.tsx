import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  ArrowRight, 
  Shield,
  Stethoscope,
  Play,
  ChevronDown
} from "lucide-react";
import Header from "@/layout/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import BackToTop from "@/components/BackToTop";
import MobileBottomActions from "@/components/MobileBottomActions";
import SEOHead from "@/components/SEOHead";
import HBIcon from "@/components/HBIcon";
import TrustMotifs, { CertifiedMotif, LabTestedMotif, SecureShieldMotif, DeliveryMotif } from "@/components/TrustMotifs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useShop } from "@/context/ShopContext";
import heroVideo from "/hero-video.mp4";
import hbLogoTeal from "@/assets/hb-logo-teal.png";

const eligibilitySteps = [
  { step: 1, title: "Complete Assessment", description: "Fill out our secure medical questionnaire" },
  { step: 2, title: "Verify Identity", description: "Quick KYC verification process" },
  { step: 3, title: "Get Approved", description: "Medical team reviews your application" }
];

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { drGreenClient, isEligible } = useShop();
  const heroRef = useRef<HTMLElement>(null);
  
  // Parallax scroll effect for video
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.4, 0.8]);
  
  const scrollToContent = () => {
    const nextSection = heroRef.current?.nextElementSibling;
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
          {/* Video Hero Section */}
          <section ref={heroRef} className="relative min-h-[85vh] flex items-center justify-center overflow-hidden mt-28 sm:mt-32 md:mt-36">
            {/* Video Background with Parallax */}
            <motion.div 
              className="absolute inset-0 z-0"
              style={{ y: videoY, scale: videoScale }}
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={heroVideo} type="video/mp4" />
              </video>
              {/* Gradient overlay with scroll-based opacity */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"
                style={{ opacity: overlayOpacity }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-transparent to-secondary/20" />
            </motion.div>
            
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 lg:py-32 pt-32">
              <div className="max-w-4xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-8 border border-white/20">
                    <HBIcon size="sm" />
                    Seed to Sale Traceability
                  </span>
                  
                  <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                    Pharmaceutical-Grade
                    <span className="block text-highlight">Medical Cannabis</span>
                  </h1>
                  
                  <p className="font-body text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto drop-shadow">
                    From cultivation to delivery, every product is tracked and verified. 
                    Access quality-controlled, lab-tested medical cannabis with complete transparency.
                  </p>

                  {/* Primary CTAs */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <Button 
                      size="lg" 
                      className="text-lg px-8 py-6 bg-highlight hover:bg-highlight/90 text-highlight-foreground shadow-lg"
                      onClick={() => navigate('/eligibility')}
                    >
                      Check Eligibility
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    
                    {isEligible ? (
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                        onClick={() => navigate('/shop')}
                      >
                        Browse Products
                      </Button>
                    ) : (
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                        onClick={() => navigate(drGreenClient ? '/eligibility' : '/auth')}
                      >
                        {drGreenClient ? 'Continue Assessment' : 'Sign In'}
                      </Button>
                    )}
                  </div>

                  {/* Trust Motifs */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap justify-center gap-6 md:gap-10"
                  >
                    {[
                      { Icon: CertifiedMotif, label: "EU GMP Certified" },
                      { Icon: LabTestedMotif, label: "Lab Tested" },
                      { Icon: SecureShieldMotif, label: "Secure & Compliant" },
                      { Icon: DeliveryMotif, label: "Discreet Delivery" },
                    ].map(({ Icon, label }) => (
                      <div key={label} className="flex items-center gap-2 text-white/80">
                        <Icon size={28} className="text-highlight" />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                    ))}
                  </motion.div>
                </motion.div>
              </div>
            </div>
            
            {/* Scroll Indicator Arrow */}
            <motion.button
              onClick={scrollToContent}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors cursor-pointer group"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              aria-label="Scroll to content"
            >
              <span className="text-xs font-medium tracking-widest uppercase opacity-60 group-hover:opacity-100 transition-opacity">
                Scroll
              </span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <ChevronDown className="w-6 h-6" />
              </motion.div>
            </motion.button>
          </section>

          {/* Eligibility Status Banner (for logged in users) */}
          {drGreenClient && !isEligible && (
            <section className="py-6 bg-highlight/10 border-y border-highlight/30">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
                  <div className="w-10 h-10 rounded-full bg-highlight/20 flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="w-5 h-5 text-highlight" />
                  </div>
                  <p className="text-foreground">
                    <span className="font-semibold text-highlight">Verification in progress</span>
                    <span className="text-muted-foreground ml-2">
                      {drGreenClient.is_kyc_verified 
                        ? 'Awaiting medical review approval' 
                        : 'Please complete identity verification to continue'}
                    </span>
                  </p>
                  <Button asChild size="sm" variant="outline" className="border-highlight/40 text-highlight hover:bg-highlight/10">
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
                      <Card className="h-full bg-card/50 border-border/50 hover:border-highlight/40 transition-colors group">
                        <CardContent className="p-6 text-center">
                          <div className="w-12 h-12 rounded-full bg-highlight/10 group-hover:bg-highlight/20 flex items-center justify-center mx-auto mb-4 transition-colors">
                            <span className="text-xl font-bold text-highlight">{item.step}</span>
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


          {/* Medical Compliance Banner */}
          <section className="py-12 bg-primary/5 border-y border-primary/10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-5xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* EU GMP Standards */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                        EU GMP Certified Production
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        All products are manufactured in state-of-the-art pharmaceutical facilities 
                        under strict EU Good Manufacturing Practice standards with rigorous third-party lab testing.
                      </p>
                    </div>
                  </div>
                  
                  {/* Traceability */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                        Complete Seed-to-Sale Traceability
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Every product features QR code verification for blockchain-backed traceability. 
                        Child-resistant, UV-protected, tamper-evident packaging meets pharmaceutical standards.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center mt-8">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/support">Learn More About Our Standards</Link>
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
                  <motion.img 
                    src={hbLogoTeal} 
                    alt="Healing Buds" 
                    className="mx-auto mb-6 h-24 w-auto object-contain drop-shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                    animate={{ 
                      filter: [
                        "drop-shadow(0 0 15px hsl(var(--primary)/0.3))",
                        "drop-shadow(0 0 25px hsl(var(--primary)/0.5))",
                        "drop-shadow(0 0 15px hsl(var(--primary)/0.3))"
                      ]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  />
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
