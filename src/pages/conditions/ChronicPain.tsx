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
  { id: "causes", title: "What Causes Chronic Pain?" },
  { id: "symptoms", title: "Chronic Pain Symptoms" },
  { id: "treatment", title: "Chronic Pain Treatment" },
  { id: "medical-cannabis", title: "Medical Cannabis for Chronic Pain" },
  { id: "faq", title: "Frequently Asked Questions" },
];

const ChronicPain = () => {
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
                    Chronic Pain and Medical Cannabis
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 max-w-3xl font-light">
                    Chronic pain affects millions of people worldwide, significantly impacting quality of life and daily functioning. Medical cannabis has emerged as a potential treatment option for those who haven't found relief with conventional therapies.
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
                <span className="text-foreground">Chronic Pain</span>
              </div>
            </div>
          </section>

          {/* Main Content with Sidebar */}
          <section className="py-20 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-4 gap-12 max-w-7xl mx-auto">
                {/* Sidebar - Table of Contents */}
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
                  {/* What Causes Chronic Pain */}
                  <ScrollAnimation>
                    <div id="causes">
                      <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 tracking-tight">
                        What Causes Chronic Pain?
                      </h2>
                      <div className="grid md:grid-cols-2 gap-8 items-start mb-6">
                        <div className="space-y-4">
                          <p className="text-lg text-muted-foreground/80 leading-relaxed">
                            Chronic pain can result from various underlying conditions and injuries. Unlike acute pain, which serves as a warning signal, chronic pain persists for months or even years after the initial injury has healed.
                          </p>
                          <p className="text-lg text-muted-foreground/80 leading-relaxed">
                            Common causes include nerve damage, inflammation, musculoskeletal problems, and conditions such as arthritis, fibromyalgia, or neuropathy.
                          </p>
                        </div>
                        <div className="rounded-xl overflow-hidden">
                          <img 
                            src={medicalProductsImage} 
                            alt="Chronic pain medical consultation" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </ScrollAnimation>

                  {/* Symptoms */}
                  <ScrollAnimation>
                    <div id="symptoms">
                      <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 tracking-tight">
                        Chronic Pain Symptoms
                      </h2>
                      <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                        Chronic pain manifests differently for each individual, but common symptoms include:
                      </p>
                      <ul className="space-y-3">
                        {[
                          "Persistent aching or burning sensations",
                          "Sharp, shooting, or stabbing pain",
                          "Stiffness and reduced mobility",
                          "Fatigue and sleep disturbances",
                          "Mood changes and depression",
                          "Difficulty performing daily activities"
                        ].map((symptom, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span className="text-lg text-muted-foreground/80">{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </ScrollAnimation>

                  {/* Treatment */}
                  <ScrollAnimation>
                    <div id="treatment">
                      <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 tracking-tight">
                        Chronic Pain Treatment
                      </h2>
                      <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                        Managing chronic pain typically requires a multidisciplinary approach:
                      </p>
                      <div className="grid sm:grid-cols-2 gap-6">
                        {[
                          { title: "Medication", desc: "Pain relievers, anti-inflammatories, and nerve pain medications" },
                          { title: "Physical Therapy", desc: "Exercise and manual therapy to improve function and reduce pain" },
                          { title: "Psychological Support", desc: "Cognitive behavioral therapy and stress management techniques" },
                          { title: "Alternative Therapies", desc: "Acupuncture, massage, and complementary approaches" }
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
                        Medical Cannabis for Chronic Pain
                      </h2>
                      <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                        For individuals struggling with chronic pain who haven't found adequate relief through conventional treatments, medical cannabis may offer an alternative option. Research suggests that cannabinoids may help modulate pain signals and reduce inflammation.
                      </p>
                      <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                        At Healing Buds, our experienced medical team evaluates each patient's unique condition and medical history to determine if medical cannabis is appropriate. We provide ongoing support throughout the treatment journey.
                      </p>
                      <Link to="/contact">
                        <button className="btn-primary px-8 py-3">
                          Contact Our Team →
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
                            question: "How effective is medical cannabis for chronic pain?",
                            answer: "Research indicates that medical cannabis may provide relief for various types of chronic pain, though individual responses vary. Studies have shown promising results, particularly for neuropathic pain and conditions where traditional treatments have been insufficient."
                          },
                          {
                            id: "q2",
                            question: "What are the potential side effects?",
                            answer: "Common side effects may include drowsiness, dry mouth, dizziness, and changes in appetite. Our medical team will discuss all potential side effects and monitor your treatment to minimize any adverse reactions."
                          },
                          {
                            id: "q3",
                            question: "How quickly can I expect relief?",
                            answer: "The timeline for experiencing relief varies depending on the individual, the type of product used, and the method of administration. Some patients report improvement within days, while others may need several weeks to find the optimal dosage and formulation."
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
                    Interested in Medical Cannabis Treatment?
                  </h2>
                  <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                    Get in touch with our specialist team to discuss whether medical cannabis could be right for your chronic pain.
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

export default ChronicPain;
