import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ScrollAnimation from "@/components/ScrollAnimation";
import BackToTop from "@/components/BackToTop";
import MobileBottomActions from "@/components/MobileBottomActions";
import { Users, Heart, FileText } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import medicalProducts from "@/assets/medical-products-hq.jpg";
import clinicConsultation from "@/assets/clinic-consultation.jpg";
import clinicSouthAfrica from "@/assets/clinic-south-africa.jpg";
import clinicUK from "@/assets/clinic-uk.jpg";
import clinicThailand from "@/assets/clinic-thailand.jpg";
import clinicPortugal from "@/assets/clinic-portugal.jpg";
import clinicDoctorPatient from "@/assets/clinic-doctor-patient.jpg";

type RegionStatus = 'live' | 'coming-soon' | 'factory-ops';

const getStatusBadge = (status: RegionStatus) => {
  switch (status) {
    case 'live':
      return <Badge className="bg-green-500/90 text-white border-0 hover:bg-green-500">Live</Badge>;
    case 'coming-soon':
      return <Badge className="bg-amber-500/90 text-white border-0 hover:bg-amber-500">Coming Soon</Badge>;
    case 'factory-ops':
      return <Badge className="bg-blue-500/90 text-white border-0 hover:bg-blue-500">Factory Operations</Badge>;
  }
};

const MedicalClinics = () => {
  const { t } = useTranslation('clinics');
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
              src={medicalProducts}
              alt="Medical cannabis clinic" 
              className="absolute inset-0 w-full h-full object-cover"
              style={{ y, opacity }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
              <ScrollAnimation>
                <h1 className="text-5xl md:text-6xl font-semibold text-foreground mb-4">
                  {t('hero.title')}
                </h1>
                <p className="text-xl text-muted-foreground/80 max-w-2xl">
                  {t('hero.subtitle')}
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
                    {t('together.title')}
                  </h2>
                  <p className="text-lg text-muted-foreground/80 leading-relaxed mb-4">
                    {t('together.paragraph1')}
                  </p>
                  <p className="text-lg text-muted-foreground/80 leading-relaxed">
                    {t('together.paragraph2')}
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
                  <h2 className="text-4xl font-semibold text-white">{t('services.title')}</h2>
                  <button className="btn-linear text-white border border-white/30 hover:bg-white/10 px-6 py-2">
                    {t('services.learnMore')} →
                  </button>
                </div>
              </ScrollAnimation>

              <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                <ScrollAnimation delay={0.1}>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover-lift group h-full flex flex-col">
                    <div className="w-16 h-16 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-110">
                      <Users className="w-8 h-8 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">{t('services.consultations.title')}</h3>
                    <p className="text-white/90 leading-relaxed flex-grow">
                      {t('services.consultations.description')}
                    </p>
                  </div>
                </ScrollAnimation>

                <ScrollAnimation delay={0.2}>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover-lift group h-full flex flex-col">
                    <div className="w-16 h-16 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-110">
                      <FileText className="w-8 h-8 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">{t('services.treatment.title')}</h3>
                    <p className="text-white/90 leading-relaxed flex-grow">
                      {t('services.treatment.description')}
                    </p>
                  </div>
                </ScrollAnimation>

                <ScrollAnimation delay={0.3}>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover-lift group h-full flex flex-col">
                    <div className="w-16 h-16 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-110">
                      <Heart className="w-8 h-8 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">{t('services.support.title')}</h3>
                    <p className="text-white/90 leading-relaxed flex-grow">
                      {t('services.support.description')}
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
                    <div className="flex items-center gap-3 mb-6">
                      <h2 className="text-4xl font-semibold text-foreground">{t('regions.southAfrica.title')}</h2>
                      {getStatusBadge('live')}
                    </div>
                    <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                      {t('regions.southAfrica.paragraph1')}
                    </p>
                    <p className="text-lg text-muted-foreground/80 leading-relaxed mb-8">
                      {t('regions.southAfrica.paragraph2')}
                    </p>
                  </ScrollAnimation>
                </div>

                {/* United Kingdom */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <ScrollAnimation>
                    <div className="flex items-center gap-3 mb-6">
                      <h2 className="text-4xl font-semibold text-foreground">{t('regions.uk.title')}</h2>
                      {getStatusBadge('coming-soon')}
                    </div>
                    <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                      {t('regions.uk.paragraph1')}
                    </p>
                    <p className="text-lg text-muted-foreground/80 leading-relaxed mb-8">
                      {t('regions.uk.paragraph2')}
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
                    <div className="flex items-center gap-3 mb-6">
                      <h2 className="text-4xl font-semibold text-foreground">{t('regions.thailand.title')}</h2>
                      {getStatusBadge('factory-ops')}
                    </div>
                    <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                      {t('regions.thailand.paragraph1')}
                    </p>
                    <p className="text-lg text-muted-foreground/80 leading-relaxed mb-8">
                      {t('regions.thailand.paragraph2')}
                    </p>
                  </ScrollAnimation>
                </div>

                {/* Portugal */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <ScrollAnimation>
                    <div className="flex items-center gap-3 mb-6">
                      <h2 className="text-4xl font-semibold text-foreground">{t('regions.portugal.title')}</h2>
                      {getStatusBadge('coming-soon')}
                    </div>
                    <p className="text-lg text-muted-foreground/80 leading-relaxed mb-6">
                      {t('regions.portugal.paragraph1')}
                    </p>
                    <p className="text-lg text-muted-foreground/80 leading-relaxed mb-8">
                      {t('regions.portugal.paragraph2')}
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
                    "{t('testimonial.quote')}"
                  </blockquote>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-full" />
                    <div>
                      <p className="font-semibold text-foreground">{t('testimonial.name')}</p>
                      <p className="text-muted-foreground/80">{t('testimonial.role')}</p>
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
                      {t('cta.title')}
                    </h2>
                    <p className="text-muted-foreground/80 mb-8">
                      {t('cta.description')}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button className="btn-primary px-6 py-2.5">
                        {t('cta.contactButton')} →
                      </button>
                      <button className="btn-outline px-6 py-2.5">
                        {t('cta.eligibilityButton')} →
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
        <MobileBottomActions menuOpen={menuOpen} />
      </div>
    </PageTransition>
  );
};

export default MedicalClinics;
