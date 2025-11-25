import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ScrollAnimation from "@/components/ScrollAnimation";
import BackToTop from "@/components/BackToTop";
import { Users, Heart, FileText } from "lucide-react";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import medicalProducts from "@/assets/medical-products-hq.jpg";
import clinicConsultation from "@/assets/clinic-consultation.jpg";
import clinicSouthAfrica from "@/assets/clinic-south-africa.jpg";
import clinicUK from "@/assets/clinic-uk.jpg";
import clinicThailand from "@/assets/clinic-thailand.jpg";
import clinicPortugal from "@/assets/clinic-portugal.jpg";
import clinicDoctorPatient from "@/assets/clinic-doctor-patient.jpg";

const MedicalClinics = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24">
          {/* Hero Section with Parallax */}
          <section ref={heroRef} className="relative h-[500px] overflow-hidden">
            <motion.img 
              src={medicalProducts}
              alt="Medical cannabis clinic" 
              className="absolute inset-0 w-full h-full object-cover"
              style={{ y, opacity }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
              <ScrollAnimation>
                <h1 className="text-5xl md:text-6xl font-semibold text-foreground mb-4">
                  Medical Cannabis Clinics
                </h1>
                <p className="text-xl text-muted-foreground/80 max-w-2xl">
                  Led by doctors trained in cannabis medicine across South Africa, UK, Thailand, and Portugal
                </p>
              </ScrollAnimation>
            </div>
          </section>

          {/* We Bring People Together Section */}
          <section className="py-20 md:py-32 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                <ScrollAnimation>
                  <img 
                    src={clinicConsultation} 
                    alt="Medical cannabis clinic consultation"
                    className="w-full h-[400px] object-cover rounded-2xl shadow-lg"
                  />
                </ScrollAnimation>
                <ScrollAnimation delay={0.2}>
                  <h2 className="text-4xl font-semibold text-foreground leading-tight mb-6">
                    We bring people together
                  </h2>
                  <p className="text-lg text-muted-foreground/80 leading-relaxed mb-4">
                    Because access to quality medical cannabis care requires specialized clinical expertise, our network of clinics across South Africa, the UK, Thailand, and Portugal connect patients with experienced cannabis-trained physicians.
                  </p>
                  <p className="text-lg text-muted-foreground/80 leading-relaxed">
                    It's not just about cannabis—it's about helping people find the life-changing relief they deserve through personalized, evidence-based care.
                  </p>
                </ScrollAnimation>
              </div>
            </div>
          </section>

          {/* Our Services Section */}
          <section className="py-20 md:py-32" style={{ backgroundColor: 'hsl(var(--section-color))' }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollAnimation>
                <div className="flex justify-between items-center mb-12 max-w-6xl mx-auto">
                  <h2 className="text-4xl font-semibold text-white">Our Services</h2>
                  <button className="btn-linear text-white border border-white/30 hover:bg-white/10 px-6 py-2">
                    Learn more →
                  </button>
                </div>
              </ScrollAnimation>

              <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                <ScrollAnimation delay={0.1}>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover-lift group">
                    <div className="w-16 h-16 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-110">
                      <Users className="w-8 h-8 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">Expert consultations</h3>
                    <p className="text-white/90 leading-relaxed">
                      Clinics led by medical doctors trained as cannabis specialists, providing evidence-based guidance for your treatment.
                    </p>
                  </div>
                </ScrollAnimation>

                <ScrollAnimation delay={0.2}>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover-lift group">
                    <div className="w-16 h-16 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-110">
                      <FileText className="w-8 h-8 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">Personalized treatment plans</h3>
                    <p className="text-white/90 leading-relaxed">
                      Physician consultations begin with a comprehensive review of your medical history to create tailored cannabis treatment plans.
                    </p>
                  </div>
                </ScrollAnimation>

                <ScrollAnimation delay={0.3}>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover-lift group">
                    <div className="w-16 h-16 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-110">
                      <Heart className="w-8 h-8 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">Ongoing patient support</h3>
                    <p className="text-white/90 leading-relaxed">
                      Continuous follow-up care throughout your cannabis treatment journey with expert clinical support.
                    </p>
                  </div>
                </ScrollAnimation>
              </div>
            </div>
          </section>

          {/* Regional Clinics Section */}
          <section className="py-20 md:py-32 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto space-y-20">
                {/* South Africa */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <ScrollAnimation>
                    <img 
                      src={clinicSouthAfrica} 
                      alt="Medical cannabis clinic in South Africa"
                      className="w-full h-[400px] object-cover rounded-2xl shadow-lg"
                    />
                  </ScrollAnimation>
                  <ScrollAnimation delay={0.2}>
                    <h2 className="text-4xl font-semibold text-foreground mb-6">In South Africa</h2>
                    <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                      Our South African clinics provide access to medical cannabis treatment through a network of trained specialists. Working within local regulations, we support patients seeking alternative therapies for chronic conditions.
                    </p>
                    <p className="text-lg text-muted-foreground/80 leading-relaxed mb-8">
                      Comprehensive consultations and ongoing support ensure patients receive appropriate care tailored to their needs.
                    </p>
                  </ScrollAnimation>
                </div>

                {/* United Kingdom */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <ScrollAnimation>
                    <h2 className="text-4xl font-semibold text-foreground mb-6">In the United Kingdom</h2>
                    <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                      Since 2018, medical cannabis has been available in the UK through specialist prescribers. Our UK clinics are led by GMC-registered doctors with extensive training in cannabis therapeutics.
                    </p>
                    <p className="text-lg text-muted-foreground/80 leading-relaxed mb-8">
                      We offer consultant-led assessments and access schemes to ensure affordable treatment for eligible patients across England, Scotland, Wales, and Northern Ireland.
                    </p>
                  </ScrollAnimation>
                  <ScrollAnimation delay={0.2}>
                    <img 
                      src={clinicUK} 
                      alt="Medical cannabis clinic network in the United Kingdom"
                      className="w-full h-[400px] object-cover rounded-2xl shadow-lg"
                    />
                  </ScrollAnimation>
                </div>

                {/* Thailand */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <ScrollAnimation>
                    <img 
                      src={clinicThailand} 
                      alt="Medical cannabis clinics in Thailand"
                      className="w-full h-[400px] object-cover rounded-2xl shadow-lg"
                    />
                  </ScrollAnimation>
                  <ScrollAnimation delay={0.2}>
                    <h2 className="text-4xl font-semibold text-foreground mb-6">In Thailand</h2>
                    <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                      Thailand's progressive cannabis regulations enable our clinics to provide medical cannabis consultations and prescriptions through licensed healthcare facilities.
                    </p>
                    <p className="text-lg text-muted-foreground/80 leading-relaxed mb-8">
                      Our Thai medical teams combine traditional medicine knowledge with modern cannabis therapeutics to serve local and international patients.
                    </p>
                  </ScrollAnimation>
                </div>

                {/* Portugal */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <ScrollAnimation>
                    <h2 className="text-4xl font-semibold text-foreground mb-6">In Portugal</h2>
                    <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                      Portugal's medical cannabis framework allows our clinics to prescribe cannabis-based medicines for qualified patients. Our Portuguese operations expand access across Southern Europe.
                    </p>
                    <p className="text-lg text-muted-foreground/80 leading-relaxed mb-8">
                      Expert consultations in Portuguese and English ensure comprehensive care for residents and medical tourists seeking cannabis treatment.
                    </p>
                  </ScrollAnimation>
                  <ScrollAnimation delay={0.2}>
                    <img 
                      src={clinicPortugal} 
                      alt="Medical cannabis clinic facilities in Portugal"
                      className="w-full h-[400px] object-cover rounded-2xl shadow-lg"
                    />
                  </ScrollAnimation>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonial Section */}
          <section className="py-20 md:py-32 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <ScrollAnimation>
                  <blockquote className="text-3xl font-semibold text-foreground mb-8 text-center">
                    "I love the idea of contributing to the growing evidence which no doubt will help many others in the future."
                  </blockquote>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-full" />
                    <div>
                      <p className="font-semibold text-foreground">Laura Drummond</p>
                      <p className="text-muted-foreground/80">Patient, UK</p>
                    </div>
                  </div>
                </ScrollAnimation>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 md:py-32 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <ScrollAnimation>
                    <img 
                      src={clinicDoctorPatient} 
                      alt="Doctor consulting with patient about medical cannabis"
                      className="w-full h-[300px] object-cover rounded-2xl shadow-lg"
                    />
                  </ScrollAnimation>
                  <ScrollAnimation delay={0.2}>
                    <h2 className="text-3xl font-semibold text-foreground mb-6">
                      Learn more about our medical cannabis clinics
                    </h2>
                    <p className="text-muted-foreground/80 mb-8">
                      Explore our network of clinics across South Africa, the UK, Thailand, and Portugal. Find expert cannabis care near you.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button className="btn-primary px-6 py-2.5">
                        Contact us →
                      </button>
                      <button className="btn-outline px-6 py-2.5">
                        Find a clinic →
                      </button>
                    </div>
                  </ScrollAnimation>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
        <BackToTop />
      </div>
    </PageTransition>
  );
};

export default MedicalClinics;
