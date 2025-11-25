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
  { id: "causes", title: "What Causes Complex Regional Pain Syndrome?" },
  { id: "symptoms", title: "Complex Regional Pain Syndrome Symptoms" },
  { id: "stages", title: "The 3 Stages of CRPS" },
  { id: "treatment", title: "Complex Regional Pain Syndrome Treatment" },
  { id: "medical-cannabis", title: "Medical Cannabis for CRPS" },
  { id: "faq", title: "Frequently Asked Questions" },
];

const ComplexRegionalPainSyndrome = () => {
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
                    Complex Regional Pain Syndrome and Medical Cannabis
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 max-w-3xl font-light">
                    Complex Regional Pain Syndrome (CRPS) is persistent, chronic pain, usually triggered by an injury. It can result in a burning, throbbing sensation that can flare up with the slightest touch or change in temperature. Your skin may feel hypersensitive, along with swelling and changes in appearance. CRPS can be debilitating, preventing you from carrying out everyday activities. If conventional treatments haven't helped to manage the pain and inflammation, medical cannabis may be appropriate for you and your CRPS.
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
                <span className="text-foreground">Complex Regional Pain Syndrome</span>
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
                  {/* What Causes CRPS */}
                  <ScrollAnimation>
                    <div id="causes">
                      <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 tracking-tight">
                        What Causes Complex Regional Pain Syndrome?
                      </h2>
                      <div className="grid md:grid-cols-2 gap-8 items-start mb-6">
                        <div className="space-y-4">
                          <p className="text-lg text-muted-foreground/80 leading-relaxed">
                            Complex regional pain syndrome can be caused by incidents that have led to injuries, such as fractures, sprains or nerve damage. Most minor injuries are at a greater risk of developing complex regional pain syndrome.
                          </p>
                          <p className="text-lg text-muted-foreground/80 leading-relaxed">
                            However, it's not yet fully understood why CRPS occurs. Immobilization following the injury is also associated with an increased risk of CRPS occurring.
                          </p>
                        </div>
                        <div className="rounded-xl overflow-hidden">
                          <img 
                            src={medicalProductsImage} 
                            alt="Medical consultation for CRPS" 
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
                        Complex Regional Pain Syndrome Symptoms
                      </h2>
                      <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                        There are several common signs and symptoms of CRPS, and some people suffering from CRPS may also have trouble with their mobility due to the pain:
                      </p>
                      <ul className="space-y-3">
                        {[
                          "Burning pain",
                          "Skin sensitivity",
                          "Little swelling",
                          "Changes in temperature to the affected area",
                          "Abnormal sweating and nail growth in the affected area",
                          "Stiff joints",
                          "Changes to skin colour",
                          "Unusual weakness"
                        ].map((symptom, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span className="text-lg text-muted-foreground/80">{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </ScrollAnimation>

                  {/* Stages */}
                  <ScrollAnimation>
                    <div id="stages">
                      <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 tracking-tight">
                        What are the 3 stages of Complex Regional Pain Syndrome?
                      </h2>
                      <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                        There are three different clinical stages of complex regional pain syndrome:
                      </p>
                      <div className="space-y-4">
                        {[
                          { stage: "Stage 1", duration: "acute, which typically lasts 1-3 months.", desc: "" },
                          { stage: "Stage 2", duration: "subacute, which usually lasts between 3-6 months.", desc: "" },
                          { stage: "Stage 3", duration: "chronic, permanent changes to the affected area.", desc: "" }
                        ].map((stage, index) => (
                          <div key={index} className="bg-muted/30 rounded-xl p-6 border border-border/30">
                            <h3 className="text-xl font-semibold text-foreground mb-2">{stage.stage}: {stage.duration}</h3>
                            {stage.desc && <p className="text-muted-foreground/80">{stage.desc}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollAnimation>

                  {/* Treatment */}
                  <ScrollAnimation>
                    <div id="treatment">
                      <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 tracking-tight">
                        Complex Regional Pain Syndrome Treatment
                      </h2>
                      <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                        Complex regional pain syndrome is split into four main areas:
                      </p>
                      <div className="grid sm:grid-cols-2 gap-6">
                        {[
                          { title: "Education and self-management", desc: "Advice and support on how to manage the condition" },
                          { title: "Physical rehabilitation", desc: "Improve physical functioning and help prevent the risk of long-term issues" },
                          { title: "Pain relief medication", desc: "Help reduce the pain" },
                          { title: "Psychological support", desc: "Help cope with the emotional affect of living with the condition" }
                        ].map((treatment, index) => (
                          <div key={index} className="bg-background rounded-xl p-6 border border-border/30">
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
                        Medical Cannabis for Complex Regional Pain Syndrome (CRPS)
                      </h2>
                      <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                        For those struggling to find relief from their complex regional pain syndrome, medical cannabis may be a new avenue to explore. Whilst clinical evidence remains limited on the effects of medical cannabis for CRPS, there is an encouraging research from the UK Medical Cannabis Registry which monitors the progress of patients in pain (amongst other conditions).
                      </p>
                      <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                        When first-line treatments and your inflammation and to find out more about medical cannabis, click here to discover more about recent research. Alternatively, complete an eligibility assessment now. Once complete, one of our clinicians will review your application and advise whether you are eligible for progression to an appointment.
                      </p>
                      <Link to="/contact">
                        <button className="btn-primary px-8 py-3">
                          Get in Touch →
                        </button>
                      </Link>
                    </div>
                  </ScrollAnimation>

                  {/* FAQ */}
                  <ScrollAnimation>
                    <div id="faq">
                      <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-8 tracking-tight">
                        Frequently Asked Questions about Complex Regional Pain Syndrome
                      </h2>
                      <div className="space-y-4">
                        {[
                          {
                            id: "q1",
                            question: "Can CRPS be cured?",
                            answer: "While there is no cure for CRPS, many patients experience improvement with appropriate treatment. Early intervention and a comprehensive treatment approach can help manage symptoms and improve quality of life."
                          },
                          {
                            id: "q2",
                            question: "What triggers CRPS?",
                            answer: "CRPS is typically triggered by an injury, surgery, or trauma to a limb. However, the exact mechanism is not fully understood, and in some cases, no clear trigger can be identified."
                          },
                          {
                            id: "q3",
                            question: "How fast does CRPS progress?",
                            answer: "The progression of CRPS varies significantly between individuals. Some patients may experience rapid progression through the stages, while others may have a more gradual course. Early treatment is important to prevent progression."
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
                    Get in touch with our specialist team to discuss whether medical cannabis could be right for your CRPS.
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

export default ComplexRegionalPainSyndrome;
