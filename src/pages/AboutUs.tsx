import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ScrollAnimation from "@/components/ScrollAnimation";
import BackToTop from "@/components/BackToTop";
import StatisticsSection from "@/components/StatisticsSection";
import { Target, Heart, Globe, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import greenhouseImage from "@/assets/greenhouse-exterior-hq.jpg";

const AboutUs = () => {
  const { t } = useTranslation('aboutUs');

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
              src={greenhouseImage} 
              alt="Cannabis greenhouse facility" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent" />
          </div>
        </section>

        {/* Our Story - Linear style */}
        <section className="py-20 md:py-32 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollAnimation>
              <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-8 tracking-tight">
                {t('story.title')}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed mb-6">
                {t('story.paragraph1')}
              </p>
              <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed mb-6">
                {t('story.paragraph2')}
              </p>
              <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed">
                {t('story.paragraph3')}
              </p>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Statistics Section */}
        <StatisticsSection />

        {/* Our Values - Linear style */}
        <section className="py-20 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground text-center mb-16 md:mb-20 tracking-tight">
              {t('values.title')}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <Target className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3 tracking-tight">{t('values.excellence.title')}</h3>
                <p className="text-muted-foreground/80 text-sm leading-relaxed">
                  {t('values.excellence.description')}
                </p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <Heart className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3 tracking-tight">{t('values.patientFocused.title')}</h3>
                <p className="text-muted-foreground/80 text-sm leading-relaxed">
                  {t('values.patientFocused.description')}
                </p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <Globe className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3 tracking-tight">{t('values.globalReach.title')}</h3>
                <p className="text-muted-foreground/80 text-sm leading-relaxed">
                  {t('values.globalReach.description')}
                </p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <Shield className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3 tracking-tight">{t('values.integrity.title')}</h3>
                <p className="text-muted-foreground/80 text-sm leading-relaxed">
                  {t('values.integrity.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Facilities - Linear style */}
        <section className="py-20 md:py-32" style={{ backgroundColor: 'hsl(var(--section-color))' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-8 tracking-tight">
                {t('facilities.title')}
              </h2>
              <p className="text-base md:text-lg text-white/80 leading-relaxed mb-16">
                {t('facilities.description')}
              </p>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-7 border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200">
                  <h3 className="text-xl md:text-2xl font-medium text-white mb-4 tracking-tight">{t('facilities.southAfrica.title')}</h3>
                  <p className="text-white/70 leading-relaxed text-sm md:text-base">
                    {t('facilities.southAfrica.description')}
                  </p>
                </div>
                <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-7 border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200">
                  <h3 className="text-xl md:text-2xl font-medium text-white mb-4 tracking-tight">{t('facilities.uk.title')}</h3>
                  <p className="text-white/70 leading-relaxed text-sm md:text-base">
                    {t('facilities.uk.description')}
                  </p>
                </div>
                <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-7 border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200">
                  <h3 className="text-xl md:text-2xl font-medium text-white mb-4 tracking-tight">{t('facilities.thailand.title')}</h3>
                  <p className="text-white/70 leading-relaxed text-sm md:text-base">
                    {t('facilities.thailand.description')}
                  </p>
                </div>
                <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-7 border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200">
                  <h3 className="text-xl md:text-2xl font-medium text-white mb-4 tracking-tight">{t('facilities.portugal.title')}</h3>
                  <p className="text-white/70 leading-relaxed text-sm md:text-base">
                    {t('facilities.portugal.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA - Linear style */}
        <section className="py-20 md:py-32 bg-background">
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

export default AboutUs;
