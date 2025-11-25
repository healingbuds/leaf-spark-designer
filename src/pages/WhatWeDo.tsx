import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ScrollAnimation from "@/components/ScrollAnimation";
import { Leaf, Users, FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";
import indoorCultivationImage from "@/assets/hero-greenhouse-hq.jpg";

const WhatWeDo = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
      <main className="pt-28 md:pt-32">
        {/* Hero Section - Linear style */}
        <section className="bg-background py-16 md:py-20">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6">
            <ScrollAnimation>
              <div className="max-w-5xl">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]">
                  What We Do
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-3xl font-light">
                  Shaping the future of cannabis through cultivation, research, and innovation
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Hero Image */}
        <section className="container mx-auto px-3 sm:px-4 lg:px-6 pb-16 md:pb-20">
          <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-xl border border-border/30">
            <img 
              src={indoorCultivationImage} 
              alt="Cannabis cultivation facility" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent" />
          </div>
        </section>

        {/* Main Content - Linear style */}
        <section className="py-20 md:py-32 bg-background">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6">
            <ScrollAnimation>
              <div className="max-w-4xl mx-auto mb-20">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6 tracking-tight">
                  Healing Buds: Leading the World in Cannabis
                </h2>
                <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed">
                  Consistently delivering superior products and services and driving the global acceptance of cannabis. At Healing Buds, we're at the forefront of cannabis innovation, from cultivation to patient care.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Services Overview - Linear style */}
        <section className="py-20 md:py-32 bg-muted/30">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground text-center mb-16 md:mb-20 tracking-tight">
                Our Services
              </h2>
            </ScrollAnimation>
            <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {/* Cultivating & Processing */}
              <ScrollAnimation delay={0.1}>
                <div className="card-linear p-7 hover-lift">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-5">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">Cultivating & Processing</h3>
                <p className="text-muted-foreground/80 leading-relaxed text-sm">
                  At our extensive facilities in Canada and Portugal, covering over 30,000 m², we select, grow, harvest and process a broad portfolio of pharmaceutical-grade cannabis products. With careful control over every aspect of production, we test, trim, dry, cure and package high-grade medical cannabis that passes third-party testing, batch after batch.
                </p>
                </div>
              </ScrollAnimation>

              {/* Manufacture & Distribution */}
              <ScrollAnimation delay={0.2}>
                <div className="card-linear p-7 hover-lift">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-5">
                  <FlaskConical className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">Manufacture & Distribution</h3>
                <p className="text-muted-foreground/80 leading-relaxed text-sm">
                  With an evergreen global supply chain and deep regulatory understanding, our EU Good Manufacturing Practices (GMP) certified medical products reach patients by supplying to clinics and pharmacies worldwide. Established distribution to over 15 countries across Europe, Australia and New Zealand.
                </p>
                </div>
              </ScrollAnimation>

              {/* Medical Cannabis Clinics */}
              <ScrollAnimation delay={0.3}>
                <div className="card-linear p-7 hover-lift">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-5">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">Medical Cannabis Clinics</h3>
                <p className="text-muted-foreground/80 leading-relaxed text-sm">
                  We're leading in a new era of patient access, bridging the gap between healthcare professionals and those who may benefit from medical cannabis. Our clinics provide expert consultations and personalized treatment plans.
                </p>
                </div>
              </ScrollAnimation>

              {/* Online Pharmacy */}
              <ScrollAnimation delay={0.4}>
                <div className="card-linear p-7 hover-lift">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-5">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">Online Medical Cannabis Pharmacy</h3>
                <p className="text-muted-foreground/80 leading-relaxed text-sm">
                  We provide a seamless pathway from prescription to secure direct delivery of EU GMP-certified medical cannabis, through our registered pharmacy and specialist clinic network.
                </p>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </section>

        {/* Core Values Section - Linear style */}
        <section className="py-20 md:py-32" style={{ backgroundColor: 'hsl(var(--section-color))' }}>
          <div className="container mx-auto px-3 sm:px-4 lg:px-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white text-center mb-16 md:mb-20 tracking-tight">
              We cultivate beyond cannabis
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-7 border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-5">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-medium text-white mb-4 text-center tracking-tight">Better Standards</h3>
                <p className="text-white/70 leading-relaxed text-center text-sm md:text-base">
                  From plant to patient, every step of cultivation, extraction and production receives our care and attention – no detail is too small. That's why our products are EU GMP-certified and trusted worldwide.
                </p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-7 border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-5">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-medium text-white mb-4 text-center tracking-tight">Patient Access</h3>
                <p className="text-white/70 leading-relaxed text-center text-sm md:text-base">
                  As we grow, we aspire to leave no patient behind. Thanks to a growing body of evidence, we're breaking down stigma, pushing for progress, and widening safer access to medical cannabis.
                </p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-7 border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-5">
                  <FlaskConical className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-medium text-white mb-4 text-center tracking-tight">Essential Research</h3>
                <p className="text-white/70 leading-relaxed text-center text-sm md:text-base">
                  We partner with leading institutions Imperial College London and University of Pennsylvania, to deepen the clinical understanding of cannabis-based medicine. Scientific research isn't just what we do – it's everything we stand for.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Linear style */}
        <section className="py-20 md:py-32 bg-muted/30">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6 tracking-tight">
              Why partner with us?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground/80 max-w-3xl mx-auto mb-10">
              We bring together expert cultivators, world-class researchers, and a commitment to quality that sets us apart in the cannabis industry.
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
      </div>
    </PageTransition>
  );
};

export default WhatWeDo;
