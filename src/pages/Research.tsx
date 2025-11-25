import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ScrollAnimation from "@/components/ScrollAnimation";
import { Microscope, FileText, Award, Users } from "lucide-react";
import { Link } from "react-router-dom";
import researchLabImage from "@/assets/research-lab-hq.jpg";

const Research = () => {
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
                  Research & Development
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-3xl font-light">
                  Advancing cannabis science through rigorous research and clinical trials
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Hero Image */}
        <section className="container mx-auto px-3 sm:px-4 lg:px-6 pb-16 md:pb-20">
          <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-xl border border-border/30">
            <img 
              src={researchLabImage} 
              alt="Research laboratory with cannabis testing" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent" />
          </div>
        </section>

        {/* Main Content - Linear style */}
        <section className="py-20 md:py-32 bg-background">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6">
            <ScrollAnimation>
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6 tracking-tight">
                  Essential Research
                </h2>
                <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed mb-6">
                  We partner with leading institutions Imperial College London and University of Pennsylvania, to deepen the clinical understanding of cannabis-based medicine. Scientific research isn't just what we do – it's everything we stand for.
                </p>
                <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed mb-16">
                  Our research division conducts rigorous clinical trials to advance the scientific understanding of cannabinoids and their medical applications, contributing to a growing body of evidence that breaks down stigma and pushes for progress.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-16">
                <div className="card-linear p-7 hover-lift">
                  <Microscope className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">Clinical Trials</h3>
                  <p className="text-muted-foreground/80 leading-relaxed text-sm">
                    We conduct rigorous clinical trials examining the efficacy and safety of cannabis-based medicines for various medical conditions.
                  </p>
                </div>
                <div className="card-linear p-7 hover-lift">
                  <FileText className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">Publications</h3>
                  <p className="text-muted-foreground/80 leading-relaxed text-sm">
                    Our research team publishes findings in peer-reviewed journals, contributing to the global understanding of cannabis medicine.
                  </p>
                </div>
                <div className="card-linear p-7 hover-lift">
                  <Award className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">Recognition</h3>
                  <p className="text-muted-foreground/80 leading-relaxed text-sm">
                    Our work has been recognized with multiple awards for contributions to cannabis science and medical innovation.
                  </p>
                </div>
                <div className="card-linear p-7 hover-lift">
                  <Users className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">Collaboration</h3>
                  <p className="text-muted-foreground/80 leading-relaxed text-sm">
                    We partner with leading universities and research institutions worldwide to accelerate cannabis research.
                  </p>
                </div>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Research Areas - Linear style */}
        <section className="py-20 md:py-32" style={{ backgroundColor: 'hsl(var(--section-color))' }}>
          <div className="container mx-auto px-3 sm:px-4 lg:px-6">
            <h2 className="text-4xl md:text-5xl font-semibold text-white text-center mb-16 md:mb-20 tracking-tight">
              Our Research Focus Areas
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-7 border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200">
                <h3 className="text-xl md:text-2xl font-medium text-white mb-4 tracking-tight">Pain Management</h3>
                <p className="text-white/70 leading-relaxed text-sm md:text-base">
                  Investigating the efficacy of cannabinoids in treating chronic pain conditions and developing evidence-based treatment protocols.
                </p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-7 border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200">
                <h3 className="text-xl md:text-2xl font-medium text-white mb-4 tracking-tight">Neurological Disorders</h3>
                <p className="text-white/70 leading-relaxed text-sm md:text-base">
                  Studying the potential of cannabis in treating epilepsy, multiple sclerosis, and other neurological conditions.
                </p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-7 border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200">
                <h3 className="text-xl md:text-2xl font-medium text-white mb-4 tracking-tight">Mental Health</h3>
                <p className="text-white/70 leading-relaxed text-sm md:text-base">
                  Researching the role of cannabinoids in anxiety, PTSD, and other mental health applications.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA - Linear style */}
        <section className="py-20 md:py-32 bg-background">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6 tracking-tight">
              Interested in our research?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground/80 max-w-3xl mx-auto mb-10">
              Learn more about our ongoing studies and how we're advancing cannabis science.
            </p>
            <Link to="/contact">
              <button className="btn-primary px-7 py-3">
                Contact our research team →
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

export default Research;
