import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ScrollAnimation from "@/components/ScrollAnimation";
import BackToTop from "@/components/BackToTop";
import { Leaf, Users, FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";
import indoorCultivationImage from "@/assets/hero-greenhouse-hq.jpg";

const WhatWeDo = () => {
  const { t } = useTranslation('whatWeDo');

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
                  {t('hero.title')}
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-3xl font-light">
                  {t('hero.subtitle')}
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Hero Image */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20">
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
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollAnimation>
              <div className="max-w-4xl mx-auto mb-20">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6 tracking-tight">
                  {t('intro.title')}
                </h2>
                <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed">
                  {t('intro.description')}
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Services Overview - Linear style */}
        <section className="py-20 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground text-center mb-16 md:mb-20 tracking-tight">
                {t('services.title')}
              </h2>
            </ScrollAnimation>
            <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {/* Cultivating & Processing */}
              <ScrollAnimation delay={0.1}>
                <div className="card-linear p-7 hover-lift">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-5">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">{t('services.cultivating.title')}</h3>
                <p className="text-muted-foreground/80 leading-relaxed text-sm">
                  {t('services.cultivating.description')}
                </p>
                </div>
              </ScrollAnimation>

              {/* Manufacture & Distribution */}
              <ScrollAnimation delay={0.2}>
                <div className="card-linear p-7 hover-lift">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-5">
                  <FlaskConical className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">{t('services.manufacture.title')}</h3>
                <p className="text-muted-foreground/80 leading-relaxed text-sm">
                  {t('services.manufacture.description')}
                </p>
                </div>
              </ScrollAnimation>

              {/* Medical Cannabis Clinics */}
              <ScrollAnimation delay={0.3}>
                <div className="card-linear p-7 hover-lift">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-5">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">{t('services.clinics.title')}</h3>
                <p className="text-muted-foreground/80 leading-relaxed text-sm">
                  {t('services.clinics.description')}
                </p>
                </div>
              </ScrollAnimation>

              {/* Online Pharmacy */}
              <ScrollAnimation delay={0.4}>
                <div className="card-linear p-7 hover-lift">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-5">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">{t('services.pharmacy.title')}</h3>
                <p className="text-muted-foreground/80 leading-relaxed text-sm">
                  {t('services.pharmacy.description')}
                </p>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </section>

        {/* Core Values Section - Linear style */}
        <section className="py-20 md:py-32" style={{ backgroundColor: 'hsl(var(--section-color))' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white text-center mb-16 md:mb-20 tracking-tight">
              {t('values.title')}
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-7 border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-5">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-medium text-white mb-4 text-center tracking-tight">{t('values.betterStandards.title')}</h3>
                <p className="text-white/70 leading-relaxed text-center text-sm md:text-base">
                  {t('values.betterStandards.description')}
                </p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-7 border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-5">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-medium text-white mb-4 text-center tracking-tight">{t('values.patientAccess.title')}</h3>
                <p className="text-white/70 leading-relaxed text-center text-sm md:text-base">
                  {t('values.patientAccess.description')}
                </p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-7 border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-5">
                  <FlaskConical className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-medium text-white mb-4 text-center tracking-tight">{t('values.essentialResearch.title')}</h3>
                <p className="text-white/70 leading-relaxed text-center text-sm md:text-base">
                  {t('values.essentialResearch.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Linear style */}
        <section className="py-20 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6 tracking-tight">
              {t('cta.title')}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground/80 max-w-3xl mx-auto mb-10">
              {t('cta.description')}
            </p>
            <Link to="/contact">
              <button className="btn-primary px-7 py-3">
                {t('cta.button')} →
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

export default WhatWeDo;
