import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ScrollAnimation from "@/components/ScrollAnimation";
import BackToTop from "@/components/BackToTop";
import BlockchainTraceability from "@/components/BlockchainTraceability";
import StatisticsSection from "@/components/StatisticsSection";
import { Target, Heart, Globe, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import greenhouseImage from "@/assets/greenhouse-exterior-hq.jpg";

const AboutUs = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
      <main className="pt-28 md:pt-32">
        {/* Hero Section - Linear style */}
        <section className="bg-background py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollAnimation>
              <div className="max-w-5xl">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]">
                  About Healing Buds
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-3xl font-light">
                  Leading the way in pharmaceutical-grade cannabis production
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Hero Image */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20">
          <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-xl border border-border/30">
            <img 
              src={greenhouseImage} 
              alt="Cannabis greenhouse facility" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent" />
          </div>
        </section>

        {/* Our Story - Linear style */}
        <section className="py-20 md:py-32 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollAnimation>
              <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-8 tracking-tight">
                Our Story
              </h2>
              <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed mb-6">
                Healing Buds was founded with a clear mission: to consistently deliver superior products and services while driving the global acceptance of medical cannabis. Launching from South Africa, we've expanded our cultivation and processing operations across the United Kingdom and Thailand, with exciting developments underway in Portugal. Our facilities produce EU GMP-certified medical cannabis that meets the strictest pharmaceutical-grade quality standards.
              </p>
              <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed mb-6">
                From plant to patient, every step of cultivation, extraction, and production receives our meticulous care and attention – no detail is too small. This unwavering commitment to quality is why our products are trusted by healthcare professionals across multiple continents.
              </p>
              <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed">
                As we grow our international footprint, we aspire to leave no patient behind. Thanks to a growing body of evidence from our research partnerships, we're breaking down stigma, pushing for regulatory progress, and widening safer access to medical cannabis through our commitment to excellence and essential scientific research.
              </p>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Statistics Section */}
        <StatisticsSection />

        {/* Our Values - Linear style */}
        <section className="py-20 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground text-center mb-16 md:mb-20 tracking-tight">
              Our Values
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <Target className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3 tracking-tight">Excellence</h3>
                <p className="text-muted-foreground/80 text-sm leading-relaxed">
                  We maintain pharmaceutical-grade standards across all operations, from cultivation in our South African facilities to distribution worldwide.
                </p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <Heart className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3 tracking-tight">Patient-Focused</h3>
                <p className="text-muted-foreground/80 text-sm leading-relaxed">
                  Patient well-being drives every decision we make, ensuring safe access to medical cannabis across all our markets.
                </p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <Globe className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3 tracking-tight">Global Reach</h3>
                <p className="text-muted-foreground/80 text-sm leading-relaxed">
                  Operating across South Africa, UK, Thailand, and expanding to Portugal, we ensure quality cannabis medicine reaches patients worldwide.
                </p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <Shield className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3 tracking-tight">Integrity</h3>
                <p className="text-muted-foreground/80 text-sm leading-relaxed">
                  We operate with complete transparency and adherence to the highest regulatory standards in every jurisdiction.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Facilities - Linear style */}
        <section className="py-20 md:py-32" style={{ backgroundColor: 'hsl(var(--section-color))' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-8 tracking-tight">
                Our Global Facilities
              </h2>
              <p className="text-base md:text-lg text-white/80 leading-relaxed mb-16">
                Operating across multiple continents with thousands of square meters of cultivation space, we select, grow, harvest, and process a comprehensive portfolio of pharmaceutical-grade cannabis products. Our facilities combine traditional horticultural expertise with cutting-edge technology and rigorous quality control protocols.
              </p>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-7 border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200">
                  <h3 className="text-xl md:text-2xl font-medium text-white mb-4 tracking-tight">South Africa</h3>
                  <p className="text-white/70 leading-relaxed text-sm md:text-base">
                    Our flagship South African facility serves as the cornerstone of our operations, featuring advanced greenhouse technology optimized for the region's favorable climate and regulatory framework.
                  </p>
                </div>
                <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-7 border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200">
                  <h3 className="text-xl md:text-2xl font-medium text-white mb-4 tracking-tight">United Kingdom</h3>
                  <p className="text-white/70 leading-relaxed text-sm md:text-base">
                    Our UK facility serves the European medical market with GMP-certified production capabilities, combining precision agriculture with pharmaceutical-grade standards.
                  </p>
                </div>
                <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-7 border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200">
                  <h3 className="text-xl md:text-2xl font-medium text-white mb-4 tracking-tight">Thailand</h3>
                  <p className="text-white/70 leading-relaxed text-sm md:text-base">
                    Leveraging Thailand's rich tradition of cannabis cultivation knowledge, our facility combines local expertise with modern cultivation methodologies for the Asian market.
                  </p>
                </div>
                <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-7 border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200">
                  <h3 className="text-xl md:text-2xl font-medium text-white mb-4 tracking-tight">Portugal (Expanding)</h3>
                  <p className="text-white/70 leading-relaxed text-sm md:text-base">
                    Our upcoming Portuguese facility will strategically position us in Southern Europe, combining traditional European cultivation methods with our proven quality protocols.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blockchain Traceability Timeline */}
        <BlockchainTraceability />

        {/* CTA - Linear style */}
        <section className="py-20 md:py-32 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6 tracking-tight">
              Join us in shaping the future of medical cannabis
            </h2>
            <p className="text-base md:text-lg text-muted-foreground/80 max-w-3xl mx-auto mb-10">
              Whether you're a patient, healthcare provider, or potential partner across our South African, UK, Thai, or Portuguese markets, we'd love to hear from you.
            </p>
            <Link to="/contact">
              <button className="btn-primary px-7 py-3">
                Get in touch →
              </button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
      </div>
    </PageTransition>
  );
};

export default AboutUs;
