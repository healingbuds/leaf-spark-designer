import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import PageHero from "@/components/PageHero";
import ScrollAnimation from "@/components/ScrollAnimation";
import BackToTop from "@/components/BackToTop";
import MobileBottomActions from "@/components/MobileBottomActions";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import cultivationImage from "@/assets/greenhouse-exterior-hq.jpg";
import greenhouseRows from "@/assets/greenhouse-exterior-path.jpg";
import productionImage from "@/assets/water-irrigation-system.jpg";
import indoorCultivation from "@/assets/indoor-grow-facility.jpg";
import productionFacility from "@/assets/greenhouse-interior-infrastructure.jpg";
import researchLab from "@/assets/cannabis-jars-production.jpg";
import cannabisLineart1 from "@/assets/cannabis-lineart-1.png";
import cannabisLineart2 from "@/assets/cannabis-lineart-2.png";
import { Badge } from "@/components/ui/badge";

const CultivatingProcessing = () => {
  const [activeTab, setActiveTab] = useState<"southafrica" | "uk" | "thailand" | "portugal">("southafrica");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleItem = (item: string) => {
    setExpandedItem(expandedItem === item ? null : item);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24 lg:pb-0">
        <Header onMenuStateChange={setMenuOpen} />
        <main className="pt-28 md:pt-32">
          {/* Hero Section using PageHero component */}
          <PageHero
            title="Cultivating & Processing"
            subtitle="Excellence in cultivation from South Africa to the world."
            image={cultivationImage}
            imageAlt="Cannabis cultivation facility"
            variant="split"
            showAnimatedGlow
            imageHeight="lg"
            parallaxIntensity="strong"
          />

          {/* Intro Section - Linear style */}
          <section className="py-20 md:py-32 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-2 gap-16 md:gap-20 lg:gap-24 items-start max-w-7xl mx-auto">
                <ScrollAnimation>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground leading-[1.2] tracking-tight">
                    From seed to patient, we oversee every step of the cannabis journey. <span className="text-muted-foreground/70 font-normal">Our commitment to excellence begins at the source and extends through every stage of cultivation and processing.</span>
                  </h2>
                </ScrollAnimation>
                <ScrollAnimation delay={0.2}>
                  <div className="space-y-6 text-muted-foreground/80">
                    <p className="text-base md:text-lg leading-relaxed">
                      Our South African operations include a fully functional store and dispensary, alongside partner manufacturing facilities. We also operate partner factories in Thailand. Portugal serves as our main production, processing, and shipping hub—with UK operations launching soon, followed by Portugal going fully live.
                    </p>
                    <p className="text-base md:text-lg leading-relaxed">
                      Our approach combines traditional horticultural expertise with modern precision agriculture. By maintaining rigorous quality protocols and investing in sustainable growing practices, we ensure that every batch meets international medical cannabis standards while delivering consistent therapeutic profiles.
                    </p>
                  </div>
                </ScrollAnimation>
              </div>
            </div>
          </section>

          {/* Why Partner With Us Section - Linear style */}
          <section className="py-20 md:py-32 relative overflow-hidden" style={{ backgroundColor: 'hsl(var(--section-color))' }}>
            {/* Subtle line art decorations */}
            <motion.img 
              src={cannabisLineart1} 
              alt="" 
              className="absolute -top-10 -left-10 w-48 md:w-64 h-auto opacity-[0.04] pointer-events-none"
              initial={{ opacity: 0, rotate: -10 }}
              whileInView={{ opacity: 0.04, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
            />
            <motion.img 
              src={cannabisLineart2} 
              alt="" 
              className="absolute -bottom-10 -right-10 w-48 md:w-64 h-auto opacity-[0.04] pointer-events-none rotate-180"
              initial={{ opacity: 0, rotate: 190 }}
              whileInView={{ opacity: 0.04, rotate: 180 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3 }}
            />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto">
                <ScrollAnimation>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-16 md:mb-20">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight">
                      Why choose us as your partner?
                    </h2>
                    <a 
                      href="/contact"
                      className="inline-flex items-center gap-2 text-white text-sm md:text-base border border-white/30 hover:bg-white/10 hover:border-white/50 px-6 md:px-7 py-2.5 md:py-3 rounded-lg transition-all duration-200 whitespace-nowrap font-medium backdrop-blur-sm"
                    >
                      Partner with us
                    </a>
                  </div>
                </ScrollAnimation>

                <div className="space-y-2">
                  {/* Expert cultivators */}
                  <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200">
                    <button 
                      onClick={() => toggleItem('cultivators')}
                      className="w-full flex items-center justify-between p-6 md:p-7 text-left transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
                        <h3 className="text-xl md:text-2xl font-medium text-white tracking-tight">Expert cultivators</h3>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedItem === 'cultivators' ? 45 : 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="flex-shrink-0"
                      >
                        <Plus className="w-5 h-5 md:w-6 md:h-6 text-white/70" />
                      </motion.div>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{ height: expandedItem === 'cultivators' ? 'auto' : 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 md:px-7 pb-6 md:pb-7">
                        <p className="text-white/70 text-base md:text-lg leading-relaxed">
                          Our multidisciplinary team brings together agricultural scientists, pharmaceutical specialists, and master growers with decades of combined experience. Operating state-licensed facilities across multiple jurisdictions, we've established ourselves as pioneers in regulated medical cannabis cultivation, setting benchmarks for quality and compliance.
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Global reach, seamless supply */}
                  <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200">
                    <button 
                      onClick={() => toggleItem('global')}
                      className="w-full flex items-center justify-between p-6 md:p-7 text-left transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
                        <h3 className="text-xl md:text-2xl font-medium text-white tracking-tight">Global reach, seamless supply</h3>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedItem === 'global' ? 45 : 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="flex-shrink-0"
                      >
                        <Plus className="w-5 h-5 md:w-6 md:h-6 text-white/70" />
                      </motion.div>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{ height: expandedItem === 'global' ? 'auto' : 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 md:px-7 pb-6 md:pb-7">
                        <p className="text-white/70 text-base md:text-lg leading-relaxed">
                          With operational facilities spanning three continents and strategic partnerships in emerging markets, we ensure uninterrupted supply chains and rapid market access. Our multi-jurisdiction approach enables us to meet diverse regulatory requirements while maintaining consistent product quality worldwide.
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Precision cultivation & innovation */}
                  <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200">
                    <button 
                      onClick={() => toggleItem('precision')}
                      className="w-full flex items-center justify-between p-6 md:p-7 text-left transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
                        <h3 className="text-xl md:text-2xl font-medium text-white tracking-tight">Precision cultivation & innovation</h3>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedItem === 'precision' ? 45 : 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="flex-shrink-0"
                      >
                        <Plus className="w-5 h-5 md:w-6 md:h-6 text-white/70" />
                      </motion.div>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{ height: expandedItem === 'precision' ? 'auto' : 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 md:px-7 pb-6 md:pb-7">
                        <p className="text-white/70 text-base md:text-lg leading-relaxed">
                          Our facilities utilize automated environmental controls, AI-powered growth monitoring, and precision irrigation systems. From clone selection to final cure, every variable is measured, tracked, and optimized to produce consistent cannabinoid profiles and terpene expressions across all production cycles.
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Sustainable & standards-driven */}
                  <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200">
                    <button 
                      onClick={() => toggleItem('sustainable')}
                      className="w-full flex items-center justify-between p-6 md:p-7 text-left transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
                        <h3 className="text-xl md:text-2xl font-medium text-white tracking-tight">Sustainable & standards-driven</h3>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedItem === 'sustainable' ? 45 : 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="flex-shrink-0"
                      >
                        <Plus className="w-5 h-5 md:w-6 md:h-6 text-white/70" />
                      </motion.div>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{ height: expandedItem === 'sustainable' ? 'auto' : 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 md:px-7 pb-6 md:pb-7">
                        <p className="text-white/70 text-base md:text-lg leading-relaxed">
                          Environmental stewardship drives our operations. We employ water reclamation systems, renewable energy sources, and organic pest management programs. All facilities maintain comprehensive certifications including Good Agricultural and Collection Practices (GACP) and operate under strict regulatory oversight.
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Where We Cultivate Section - Linear style */}
          <section className="py-20 md:py-32 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollAnimation>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground text-center mb-16 md:mb-20 tracking-tight">
                  Our global cultivation network
                </h2>
              </ScrollAnimation>

              {/* Tabs - Linear style */}
              <ScrollAnimation variant="fade" delay={0.1}>
                <div className="flex justify-center gap-1 mb-12 md:mb-16 flex-wrap">
                  <button
                    onClick={() => setActiveTab("southafrica")}
                    className={`px-6 md:px-8 py-2.5 font-medium transition-all duration-200 rounded-lg ${
                      activeTab === "southafrica"
                        ? "text-foreground bg-foreground/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    }`}
                  >
                    South Africa
                  </button>
                  <button
                    onClick={() => setActiveTab("uk")}
                    className={`px-6 md:px-8 py-2.5 font-medium transition-all duration-200 rounded-lg ${
                      activeTab === "uk"
                        ? "text-foreground bg-foreground/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    }`}
                  >
                    United Kingdom
                  </button>
                  <button
                    onClick={() => setActiveTab("thailand")}
                    className={`px-6 md:px-8 py-2.5 font-medium transition-all duration-200 rounded-lg ${
                      activeTab === "thailand"
                        ? "text-foreground bg-foreground/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    }`}
                  >
                    Thailand
                  </button>
                  <button
                    onClick={() => setActiveTab("portugal")}
                    className={`px-6 md:px-8 py-2.5 font-medium transition-all duration-200 rounded-lg ${
                      activeTab === "portugal"
                        ? "text-foreground bg-foreground/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    }`}
                  >
                    Portugal
                  </button>
                </div>
              </ScrollAnimation>

              {/* Tab Content */}
              <div className="max-w-6xl mx-auto">
                {activeTab === "southafrica" && (
                  <ScrollAnimation key="southafrica">
                    <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <h3 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">South Africa</h3>
                          <Badge className="bg-green-500/90 text-white border-0 hover:bg-green-500">Live</Badge>
                        </div>
                        <p className="text-muted-foreground/80 leading-relaxed mb-6 text-base md:text-lg">
                          Our flagship cultivation facility spans 50,000 square meters in the Western Cape, leveraging South Africa's ideal growing conditions. The facility features advanced greenhouse technology with automated climate control, delivering pharmaceutical-grade cannabis year-round.
                        </p>
                        <p className="text-muted-foreground/80 leading-relaxed text-base md:text-lg">
                          Operating under full SAHPRA licensing, our South African operations include integrated extraction and processing capabilities, enabling complete seed-to-product control.
                        </p>
                      </div>
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                        <img 
                          src={greenhouseRows}
                          alt="South African cultivation facility" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </ScrollAnimation>
                )}

                {activeTab === "uk" && (
                  <ScrollAnimation key="uk">
                    <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <h3 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">United Kingdom</h3>
                          <Badge className="bg-amber-500/90 text-white border-0 hover:bg-amber-500">Coming Soon</Badge>
                        </div>
                        <p className="text-muted-foreground/80 leading-relaxed mb-6 text-base md:text-lg">
                          Our UK facility is currently in development, designed to serve the growing European medical cannabis market. Located in a controlled environment, it will feature state-of-the-art indoor cultivation with full spectrum LED lighting and precision environmental controls.
                        </p>
                        <p className="text-muted-foreground/80 leading-relaxed text-base md:text-lg">
                          The facility is being built to EU-GMP standards with integrated quality control laboratories, ensuring compliance with the strictest pharmaceutical regulations.
                        </p>
                      </div>
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                        <img 
                          src={indoorCultivation}
                          alt="UK cultivation facility rendering" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </ScrollAnimation>
                )}

                {activeTab === "thailand" && (
                  <ScrollAnimation key="thailand">
                    <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <h3 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">Thailand</h3>
                          <Badge className="bg-blue-500/90 text-white border-0 hover:bg-blue-500">Factory Operations</Badge>
                        </div>
                        <p className="text-muted-foreground/80 leading-relaxed mb-6 text-base md:text-lg">
                          Our Thai operations focus on large-scale extraction and API production, leveraging Thailand's favorable regulatory environment for cannabis manufacturing. The facility specializes in isolate production and formulation development.
                        </p>
                        <p className="text-muted-foreground/80 leading-relaxed text-base md:text-lg">
                          Working closely with Thai health authorities, we're developing innovative delivery methods and formulations tailored for the Asian market while maintaining global export capabilities.
                        </p>
                      </div>
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                        <img 
                          src={productionFacility}
                          alt="Thailand production facility" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </ScrollAnimation>
                )}

                {activeTab === "portugal" && (
                  <ScrollAnimation key="portugal">
                    <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <h3 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">Portugal</h3>
                          <Badge className="bg-amber-500/90 text-white border-0 hover:bg-amber-500">Coming Soon</Badge>
                        </div>
                        <p className="text-muted-foreground/80 leading-relaxed mb-6 text-base md:text-lg">
                          Portugal serves as our main production, processing, and shipping hub for European distribution. The facility is designed for EU-GMP pharmaceutical manufacturing with direct access to European markets.
                        </p>
                        <p className="text-muted-foreground/80 leading-relaxed text-base md:text-lg">
                          Strategic location enables efficient logistics and supply chain management, supporting our commitment to accessible medical cannabis across the European Union.
                        </p>
                      </div>
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                        <img 
                          src={researchLab}
                          alt="Portugal processing facility" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </ScrollAnimation>
                )}
              </div>
            </div>
          </section>

          {/* Processing Excellence Section */}
          <section className="py-20 md:py-32 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto">
                <ScrollAnimation>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground text-center mb-16 md:mb-20 tracking-tight">
                    Processing excellence
                  </h2>
                </ScrollAnimation>

                <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                  <ScrollAnimation>
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                      <img 
                        src={productionImage}
                        alt="Cannabis processing facility" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </ScrollAnimation>
                  <ScrollAnimation delay={0.2}>
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-4 tracking-tight">Extraction & refinement</h3>
                        <p className="text-muted-foreground/80 leading-relaxed text-base md:text-lg">
                          Our GMP-certified extraction facilities employ supercritical CO2 and ethanol-based methods, producing full-spectrum, broad-spectrum, and isolate products with verified cannabinoid profiles.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-4 tracking-tight">Quality assurance</h3>
                        <p className="text-muted-foreground/80 leading-relaxed text-base md:text-lg">
                          Every batch undergoes rigorous third-party testing for potency, terpene content, residual solvents, pesticides, and microbial contamination. Full certificates of analysis accompany all products.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-4 tracking-tight">Formulation development</h3>
                        <p className="text-muted-foreground/80 leading-relaxed text-base md:text-lg">
                          Our R&D team develops innovative delivery methods including oils, capsules, topicals, and novel formulations, optimizing bioavailability and therapeutic efficacy.
                        </p>
                      </div>
                    </div>
                  </ScrollAnimation>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 md:py-32 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <ScrollAnimation>
                <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-6 tracking-tight">
                  Partner with a global leader
                </h2>
                <p className="text-base md:text-lg text-muted-foreground/80 max-w-3xl mx-auto mb-10">
                  Whether you're a distributor, healthcare provider, or research institution, we offer reliable supply partnerships backed by pharmaceutical-grade quality and regulatory expertise.
                </p>
                <a 
                  href="/contact"
                  className="inline-flex items-center gap-2 btn-primary px-8 py-3 text-base"
                >
                  Start a conversation →
                </a>
              </ScrollAnimation>
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

export default CultivatingProcessing;
