import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ScrollAnimation from "@/components/ScrollAnimation";
import BackToTop from "@/components/BackToTop";
import MobileBottomActions from "@/components/MobileBottomActions";
import BlockchainTraceability from "@/components/BlockchainTraceability";
import SEOHead from "@/components/SEOHead";

const BlockchainTechnology = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <PageTransition>
      <SEOHead 
        title="Blockchain Technology | Healing Buds Global"
        description="Pioneering transparency and traceability in medical cannabis through cutting-edge blockchain solutions. Seed-to-patient traceability with EU GMP certification."
        canonical="/blockchain-technology"
        keywords="blockchain cannabis, seed to patient traceability, EU GMP, cannabis tracking, anti-counterfeiting, medical cannabis blockchain"
      />
      <div className="min-h-screen bg-background pb-24 lg:pb-0">
        <Header onMenuStateChange={setMenuOpen} />
        <main className="pt-28 md:pt-32">
          {/* Hero Section */}
          <section className="bg-background py-16 md:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollAnimation>
                <div className="max-w-5xl">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]">
                    Blockchain Technology
                  </h1>
                  <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-3xl font-light">
                    Pioneering transparency and traceability in medical cannabis through cutting-edge blockchain solutions
                  </p>
                </div>
              </ScrollAnimation>
            </div>
          </section>

          {/* Introduction Section */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollAnimation>
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-8 tracking-tight">
                    Why Blockchain?
                  </h2>
                  <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed mb-6">
                    At Healing Buds, we believe that transparency is the foundation of trust. By integrating blockchain technology into our entire supply chain, we provide patients, healthcare providers, and regulatory bodies with an immutable record of every step in the production process.
                  </p>
                  <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed">
                    Our blockchain infrastructure ensures that every cannabis product can be traced from seed to patient, eliminating counterfeits and guaranteeing the authenticity and quality of our EU GMP-certified medical cannabis products.
                  </p>
                </div>
              </ScrollAnimation>
            </div>
          </section>

          {/* Blockchain Traceability Timeline */}
          <BlockchainTraceability />

          {/* Benefits Section */}
          <section className="py-20 md:py-32 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollAnimation>
                <h2 className="text-3xl md:text-4xl font-semibold text-foreground text-center mb-16 tracking-tight">
                  Benefits of Our Blockchain System
                </h2>
              </ScrollAnimation>
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <ScrollAnimation delay={0.1}>
                  <div className="bg-background rounded-xl p-8 border border-border/30 hover:border-primary/30 transition-all duration-300">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Complete Transparency</h3>
                    <p className="text-muted-foreground/80 text-sm leading-relaxed">
                      Every stage of cultivation, processing, and distribution is recorded on an immutable ledger, providing full visibility into product origins.
                    </p>
                  </div>
                </ScrollAnimation>
                <ScrollAnimation delay={0.2}>
                  <div className="bg-background rounded-xl p-8 border border-border/30 hover:border-primary/30 transition-all duration-300">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Anti-Counterfeiting</h3>
                    <p className="text-muted-foreground/80 text-sm leading-relaxed">
                      Unique genome sequencing and blockchain verification make it impossible to counterfeit our products, protecting patient safety.
                    </p>
                  </div>
                </ScrollAnimation>
                <ScrollAnimation delay={0.3}>
                  <div className="bg-background rounded-xl p-8 border border-border/30 hover:border-primary/30 transition-all duration-300">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Regulatory Compliance</h3>
                    <p className="text-muted-foreground/80 text-sm leading-relaxed">
                      Automatic documentation and audit trails ensure compliance with international pharmaceutical standards and regulatory requirements.
                    </p>
                  </div>
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

export default BlockchainTechnology;
