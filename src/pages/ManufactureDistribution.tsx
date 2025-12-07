import { useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ScrollAnimation from "@/components/ScrollAnimation";
import BackToTop from "@/components/BackToTop";
import MobileBottomActions from "@/components/MobileBottomActions";
import International from "@/components/International";
import { motion, useScroll, useTransform } from "framer-motion";
import productionFacility from "@/assets/production-facility-hq.jpg";
import { Factory, Globe, Award, Package } from "lucide-react";

const ManufactureDistribution = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24 lg:pb-0">
        <Header onMenuStateChange={setMenuOpen} />
        <main className="pt-24">
          {/* Hero Section with Parallax */}
          <section ref={heroRef} className="relative h-[500px] overflow-hidden">
            <motion.img 
              src={productionFacility}
              alt="Manufacturing facility" 
              className="absolute inset-0 w-full h-full object-cover"
              style={{ y, opacity }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
              <ScrollAnimation>
                <h1 className="text-5xl md:text-6xl font-semibold text-foreground mb-4">
                  Manufacture & Distribution
                </h1>
                <p className="text-xl text-muted-foreground/80 max-w-2xl">
                  Every stage from cultivation through extraction to final production is meticulously managed with unwavering attention to detail. Our EU GMP-certified products meet the highest international standards, earning trust across borders.
                </p>
              </ScrollAnimation>
            </div>
          </section>

          {/* Intro Section */}
          <section className="py-20 md:py-32 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                <ScrollAnimation>
                  <h2 className="text-4xl font-semibold text-foreground leading-tight mb-6">
                    Production & Processing Excellence
                  </h2>
                  <p className="text-lg text-muted-foreground/80 leading-relaxed">
                    With our production partner Dr Green's state-of-the-art global facilities spanning more than 30,000 square metres dedicated to pharmaceutical-grade cannabis production alongside fully EU GMP approved facilities, this allows us to consistently break barriers delivering excellence.
                  </p>
                </ScrollAnimation>
                <ScrollAnimation delay={0.2}>
                  <p className="text-lg text-muted-foreground/80 leading-relaxed mb-4">
                    Our state-of-the-art facilities across Canada and Portugal span more than 30,000 square metres dedicated to pharmaceutical-grade cannabis production. From seed selection through harvesting and processing, we maintain rigorous oversight at every production stage.
                  </p>
                  <p className="text-lg text-muted-foreground/80 leading-relaxed">
                    Each batch undergoes comprehensive testing, precise trimming, controlled drying and curing, and careful packaging to ensure consistent quality that meets stringent third-party standards.
                  </p>
                </ScrollAnimation>
              </div>
            </div>
          </section>

          {/* Manufacturing Excellence Section */}
          <section className="py-20 md:py-32 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto">
                <ScrollAnimation>
                  <h2 className="text-4xl font-semibold text-foreground mb-12">Manufacturing Excellence</h2>
                </ScrollAnimation>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <ScrollAnimation delay={0.1}>
                    <div className="card-linear p-7 hover-lift group">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-110">
                        <Factory className="w-8 h-8 text-white" strokeWidth={2} />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">EU GMP Certified</h3>
                      <p className="text-muted-foreground/80 leading-relaxed">
                        Dr Green's EU GMP certified products meet the highest international standards
                      </p>
                    </div>
                  </ScrollAnimation>

                  <ScrollAnimation delay={0.2}>
                    <div className="card-linear p-7 hover-lift group">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-110">
                        <Globe className="w-8 h-8 text-white" strokeWidth={2} />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">Global Reach</h3>
                      <p className="text-muted-foreground/80 leading-relaxed">
                        Distribution network across South Africa, UK, Thailand, and Portugal (coming soon)
                      </p>
                    </div>
                  </ScrollAnimation>

                  <ScrollAnimation delay={0.3}>
                    <div className="card-linear p-7 hover-lift group">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-110">
                        <Award className="w-8 h-8 text-white" strokeWidth={2} />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">Quality Assured</h3>
                      <p className="text-muted-foreground/80 leading-relaxed">
                        Rigorous testing and quality control at every production stage
                      </p>
                    </div>
                  </ScrollAnimation>

                  <ScrollAnimation delay={0.4}>
                    <div className="card-linear p-7 hover-lift group">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-110">
                        <Package className="w-8 h-8 text-white" strokeWidth={2} />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">Diverse Products</h3>
                      <p className="text-muted-foreground/80 leading-relaxed">
                        Comprehensive range of formats from flower to extracts
                      </p>
                    </div>
                  </ScrollAnimation>
                </div>
              </div>
            </div>
          </section>

          {/* Why Partner Section */}
          <section className="py-16 md:py-24 mb-8" style={{ backgroundColor: 'hsl(var(--section-color))' }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollAnimation>
                <div className="max-w-4xl mx-auto text-center">
                  <h2 className="text-4xl font-semibold text-white mb-8">
                    Why partner with us?
                  </h2>
                  <button className="btn-linear text-white border border-white/30 hover:bg-white/10 px-8 py-3">
                    Get in touch →
                  </button>
                </div>
              </ScrollAnimation>
            </div>
          </section>

          {/* International Presence Section */}
          <International />

          {/* Extraction Section */}
          <section className="py-20 md:py-32 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto">
                <ScrollAnimation>
                  <h2 className="text-4xl font-semibold text-foreground mb-6">Advanced Extraction</h2>
                  <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                    Our cannabis extraction facilities manufacture pharmaceutical-grade CO2 extracts and distillates in diverse formats. Using state-of-the-art supercritical CO2 extraction technology, we produce consistent, high-purity cannabinoid products that meet GMP standards.
                  </p>
                  <p className="text-lg text-muted-foreground/80 leading-relaxed mb-8">
                    From full-spectrum extracts to isolated cannabinoids, our extraction capabilities span the complete range of medicinal cannabis products.
                  </p>
                </ScrollAnimation>

                <ScrollAnimation delay={0.2}>
                  <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="card-linear p-6 hover-lift">
                      <h3 className="text-lg font-semibold text-foreground mb-2">Cannabinoid Profiles</h3>
                      <p className="text-muted-foreground/80 text-sm">Multiple strains and ratios available</p>
                    </div>
                    <div className="card-linear p-6 hover-lift">
                      <h3 className="text-lg font-semibold text-foreground mb-2">Product Formats</h3>
                      <p className="text-muted-foreground/80 text-sm">Oils, capsules, and medicinal preparations</p>
                    </div>
                    <div className="card-linear p-6 hover-lift">
                      <h3 className="text-lg font-semibold text-foreground mb-2">Quality Standards</h3>
                      <p className="text-muted-foreground/80 text-sm">GMP certified extraction processes</p>
                    </div>
                  </div>
                </ScrollAnimation>

                <ScrollAnimation>
                  <p className="text-lg text-muted-foreground/80 leading-relaxed">
                    Our extraction facilities in South Africa, the UK, Thailand, and Portugal serve local and international markets, with products distributed across Europe, Asia, Africa, and beyond. Each facility adheres to the strictest pharmaceutical manufacturing standards.
                  </p>
                </ScrollAnimation>
              </div>
            </div>
          </section>

          {/* Distribution Section */}
          <section className="py-20 md:py-32 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto">
                <ScrollAnimation>
                  <h2 className="text-4xl font-semibold text-foreground mb-6">
                    Distribution & Wholesale
                  </h2>
                  <p className="text-lg text-muted-foreground/80 leading-relaxed">
                    We support healthcare providers, pharmacies, and clinics with reliable supply chains that help patients access medical cannabis seamlessly. Our specialized distribution partners ensure secure shipment and comprehensive digital health guidance throughout South Africa, the United Kingdom, and Thailand. Portugal distribution coming soon.
                  </p>
                </ScrollAnimation>
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

export default ManufactureDistribution;
