import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ScrollAnimation from "@/components/ScrollAnimation";
import BackToTop from "@/components/BackToTop";
import { Mail, Phone, MapPin } from "lucide-react";
import greenhouseImage from "@/assets/greenhouse-rows.png";

const Contact = () => {
  const { t } = useTranslation('contact');

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
          <ScrollAnimation variant="scale" duration={0.8}>
            <div className="relative h-[300px] md:h-[400px] overflow-hidden rounded-xl border border-border/30">
              <img 
                src={greenhouseImage} 
                alt="Healing Buds facilities" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent" />
            </div>
          </ScrollAnimation>
        </section>

        {/* Contact Information - Linear style */}
        <section className="py-20 md:py-32 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
              {/* Contact Details */}
              <ScrollAnimation>
                <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-8 tracking-tight">
                  {t('connect.title')}
                </h2>
                <p className="text-base md:text-lg text-muted-foreground/80 mb-12 leading-relaxed">
                  {t('connect.subtitle')}
                </p>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">{t('connect.email')}</h3>
                      <p className="text-muted-foreground/80 text-sm">info@healingbuds.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">{t('connect.phone')}</h3>
                      <p className="text-muted-foreground/80 text-sm">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">{t('connect.location')}</h3>
                    <p className="text-muted-foreground/80 text-sm mb-1">Avenida D. João II, 98 A</p>
                    <p className="text-muted-foreground/80 text-sm mb-1">1990-100 Lisboa, Portugal</p>
                  </div>
                  </div>
                </div>
                </div>
              </ScrollAnimation>

              {/* Contact Form */}
              <ScrollAnimation delay={0.2}>
                <div className="card-linear p-8">
                <h3 className="text-2xl font-semibold text-foreground mb-6 tracking-tight">
                  {t('form.title')}
                </h3>
                <form className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      {t('form.name')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-2.5 rounded-lg bg-background border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                      placeholder={t('form.namePlaceholder')}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      {t('form.email')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-2.5 rounded-lg bg-background border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                      placeholder={t('form.emailPlaceholder')}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                      {t('form.subject')}
                    </label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full px-4 py-2.5 rounded-lg bg-background border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                      placeholder={t('form.subjectPlaceholder')}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      {t('form.message')}
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full px-4 py-2.5 rounded-lg bg-background border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-all duration-200"
                      placeholder={t('form.messagePlaceholder')}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full btn-primary"
                  >
                    {t('form.submit')}
                  </button>
                </form>
                </div>
              </ScrollAnimation>
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

export default Contact;
