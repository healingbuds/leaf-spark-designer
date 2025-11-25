import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ScrollAnimation from "@/components/ScrollAnimation";
import BackToTop from "@/components/BackToTop";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import medicalProductsImage from "@/assets/medical-products-hq.jpg";

const tableOfContents = [
  { id: "causes", title: "What Causes Anxiety?" },
  { id: "symptoms", title: "Anxiety Symptoms" },
  { id: "types", title: "Types of Anxiety Disorders" },
  { id: "treatment", title: "Anxiety Treatment" },
  { id: "medical-cannabis", title: "Medical Cannabis for Anxiety" },
  { id: "faq", title: "Frequently Asked Questions" },
];

const Anxiety = () => {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24">
          {/* Hero Section */}
          <section 
            className="relative py-32 overflow-hidden" 
            style={{ backgroundColor: 'hsl(var(--section-color))' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <ScrollAnimation>
                <div className="max-w-4xl">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
                    Anxiety and Medical Cannabis
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 max-w-3xl font-light">
                    Anxiety disorders affect millions of people globally, causing persistent worry and fear that interfere with daily activities. For those who haven't found relief with traditional treatments, medical cannabis may offer an alternative approach.
                  </p>
                </div>
              </ScrollAnimation>
            </div>
          </section>

          {/* Breadcrumbs */}
          <section className="py-6 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                <ChevronRight className="w-4 h-4" />
                <Link to="/conditions" className="hover:text-primary transition-colors">Eligible Conditions</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground">Anxiety</span>
              </div>
            </div>
          </section>

          {/* Main Content with Sidebar */}
          <section className="py-20 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-4 gap-12 max-w-7xl mx-auto">
                {/* Sidebar */}
                <aside className="lg:col-span-1">
                  <div className="sticky top-32">
                    <ScrollAnimation variant="fadeLeft">
                      <div className="bg-muted/30 rounded-xl p-6 border border-border/30">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Table of Contents</h3>
                        <nav className="space-y-2">
                          {tableOfContents.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => scrollToSection(item.id)}
                              className="block w-full text-left text-sm text-muted-foreground hover:text-primary transition-colors py-2 px-3 rounded-lg hover:bg-background"
                            >
                              {item.title}
                            </button>
                          ))}
                        </nav>
                      </div>
                    </ScrollAnimation>
                  </div>
                </aside>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-16">
                  {/* What Causes */}
                  <ScrollAnimation>
                    <div id="causes">
                      <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 tracking-tight">
                        What Causes Anxiety?
                      </h2>
                      <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                        Anxiety disorders can develop from a complex set of risk factors, including genetics, brain chemistry, personality, and life events. Understanding the underlying causes is essential for effective treatment.
                      </p>
                      <div className="grid md:grid-cols-2 gap-6">
                        {[
                          { title: "Genetic Factors", desc: "Family history and inherited traits can increase susceptibility" },
                          { title: "Brain Chemistry", desc: "Imbalances in neurotransmitters may contribute to anxiety" },
                          { title: "Environmental Stress", desc: "Traumatic experiences or prolonged stress can trigger anxiety" },
                          { title: "Medical Conditions", desc: "Certain health issues can cause or worsen anxiety symptoms" }
                        ].map((cause, index) => (
                          <div key={index} className="bg-muted/30 rounded-xl p-6 border border-border/30">
                            <h3 className="text-xl font-semibold text-foreground mb-2">{cause.title}</h3>
                            <p className="text-muted-foreground/80">{cause.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollAnimation>

                  {/* Symptoms */}
                  <ScrollAnimation>
                    <div id="symptoms">
                      <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 tracking-tight">
                        Anxiety Symptoms
                      </h2>
                      <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                        Anxiety manifests through both physical and psychological symptoms:
                      </p>
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-4">Physical Symptoms</h3>
                          <ul className="space-y-3">
                            {[
                              "Rapid heartbeat",
                              "Sweating and trembling",
                              "Shortness of breath",
                              "Muscle tension",
                              "Fatigue",
                              "Sleep disturbances"
                            ].map((symptom, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                <span className="text-muted-foreground/80">{symptom}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-4">Psychological Symptoms</h3>
                          <ul className="space-y-3">
                            {[
                              "Persistent worry",
                              "Restlessness",
                              "Difficulty concentrating",
                              "Irritability",
                              "Sense of impending doom",
                              "Avoidance behaviors"
                            ].map((symptom, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                <span className="text-muted-foreground/80">{symptom}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </ScrollAnimation>

                  {/* Types */}
                  <ScrollAnimation>
                    <div id="types">
                      <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 tracking-tight">
                        Types of Anxiety Disorders
                      </h2>
                      <div className="space-y-4">
                        {[
                          { type: "Generalized Anxiety Disorder (GAD)", desc: "Persistent excessive worry about various aspects of daily life" },
                          { type: "Social Anxiety Disorder", desc: "Intense fear of social situations and being judged by others" },
                          { type: "Panic Disorder", desc: "Recurrent unexpected panic attacks and fear of future episodes" },
                          { type: "Specific Phobias", desc: "Excessive fear of specific objects or situations" },
                          { type: "Separation Anxiety", desc: "Excessive fear of being separated from attachment figures" }
                        ].map((type, index) => (
                          <div key={index} className="bg-background rounded-xl p-6 border border-border/30">
                            <h3 className="text-xl font-semibold text-foreground mb-2">{type.type}</h3>
                            <p className="text-muted-foreground/80">{type.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollAnimation>

                  {/* Treatment */}
                  <ScrollAnimation>
                    <div id="treatment">
                      <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 tracking-tight">
                        Anxiety Treatment
                      </h2>
                      <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                        Effective anxiety treatment typically involves a combination of approaches:
                      </p>
                      <div className="grid sm:grid-cols-2 gap-6">
                        {[
                          { title: "Psychotherapy", desc: "Cognitive behavioral therapy (CBT) and exposure therapy" },
                          { title: "Medications", desc: "Antidepressants, anti-anxiety medications, and beta-blockers" },
                          { title: "Lifestyle Changes", desc: "Exercise, stress management, and sleep hygiene" },
                          { title: "Support Groups", desc: "Connecting with others experiencing similar challenges" }
                        ].map((treatment, index) => (
                          <div key={index} className="bg-muted/30 rounded-xl p-6 border border-border/30">
                            <h3 className="text-xl font-semibold text-foreground mb-2">{treatment.title}</h3>
                            <p className="text-muted-foreground/80">{treatment.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollAnimation>

                  {/* Medical Cannabis */}
                  <ScrollAnimation>
                    <div id="medical-cannabis" className="bg-muted/20 rounded-2xl p-8 border border-border/30">
                      <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 tracking-tight">
                        Medical Cannabis for Anxiety
                      </h2>
                      <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                        For patients with anxiety who have not found adequate relief with conventional treatments, medical cannabis may represent an alternative therapeutic option. Research suggests that certain cannabinoids may help regulate the body's stress response system.
                      </p>
                      <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                        At Healing Buds, our medical professionals conduct comprehensive evaluations to determine whether medical cannabis is appropriate for your specific anxiety condition. We provide personalized treatment plans and ongoing support.
                      </p>
                      <Link to="/contact">
                        <button className="btn-primary px-8 py-3">
                          Schedule a Consultation →
                        </button>
                      </Link>
                    </div>
                  </ScrollAnimation>

                  {/* FAQ */}
                  <ScrollAnimation>
                    <div id="faq">
                      <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-8 tracking-tight">
                        Frequently Asked Questions
                      </h2>
                      <div className="space-y-4">
                        {[
                          {
                            id: "q1",
                            question: "Can medical cannabis help with anxiety?",
                            answer: "Some studies suggest that certain cannabinoids may help manage anxiety symptoms, though responses vary by individual. The endocannabinoid system plays a role in regulating stress and emotional responses, which is why medical cannabis is being explored as a potential treatment option."
                          },
                          {
                            id: "q2",
                            question: "Will medical cannabis make my anxiety worse?",
                            answer: "Response to medical cannabis varies by individual, and dosing is critical. Our medical team carefully monitors your treatment to find the optimal dosage and formulation for your specific needs, minimizing the risk of adverse effects."
                          },
                          {
                            id: "q3",
                            question: "How long does treatment take to work?",
                            answer: "The timeline varies depending on the individual, the specific product, and the administration method. Some patients notice improvements within days, while others may require several weeks to find their optimal treatment regimen."
                          }
                        ].map((faq) => (
                          <div key={faq.id} className="bg-background rounded-xl border border-border/30 overflow-hidden">
                            <button
                              onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                              className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/30 transition-colors"
                            >
                              <h3 className="text-lg font-semibold text-foreground pr-4">{faq.question}</h3>
                              <motion.div
                                animate={{ rotate: expandedFaq === faq.id ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              </motion.div>
                            </button>
                            <motion.div
                              initial={false}
                              animate={{ height: expandedFaq === faq.id ? 'auto' : 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-6">
                                <p className="text-muted-foreground/80 leading-relaxed">{faq.answer}</p>
                              </div>
                            </motion.div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollAnimation>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 md:py-32" style={{ backgroundColor: 'hsl(var(--section-color))' }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollAnimation>
                <div className="max-w-4xl mx-auto text-center">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-6 tracking-tight">
                    Ready to Explore Your Treatment Options?
                  </h2>
                  <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                    Contact our specialist team to learn more about medical cannabis for anxiety treatment.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link to="/contact">
                      <button className="btn-linear text-white border border-white/30 hover:bg-white/10 px-8 py-3 text-lg">
                        Contact Us →
                      </button>
                    </Link>
                    <Link to="/conditions">
                      <button className="btn-linear text-white border border-white/30 hover:bg-white/10 px-8 py-3 text-lg">
                        View All Eligible Conditions
                      </button>
                    </Link>
                  </div>
                </div>
              </ScrollAnimation>
            </div>
          </section>
        </main>
        <Footer />
        <BackToTop />
      </div>
    </PageTransition>
  );
};

export default Anxiety;
