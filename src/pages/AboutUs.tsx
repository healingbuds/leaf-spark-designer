import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import PageHero from "@/components/PageHero";
import ScrollAnimation from "@/components/ScrollAnimation";
import BackToTop from "@/components/BackToTop";
import MobileBottomActions from "@/components/MobileBottomActions";
import AnimatedStatistics from "@/components/AnimatedStatistics";
import { Target, Heart, Globe, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import researchLabImage from "@/assets/research-lab-hq.jpg";
import { useState } from "react";
import { motion } from "framer-motion";

const AboutUs = () => {
  const { t } = useTranslation('aboutUs');
  const [menuOpen, setMenuOpen] = useState(false);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const valueCardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.6 }
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24 lg:pb-0">
        <Header onMenuStateChange={setMenuOpen} />
        <main className="pt-28 md:pt-32 relative z-0">
          {/* Hero Section using PageHero component */}
          <PageHero
            title={t('hero.title')}
            subtitle={t('hero.subtitle')}
            image={researchLabImage}
            imageAlt="Healing Buds research laboratory"
            variant="split"
            showGlassmorphismCard
            glassmorphismText="Excellence in cultivation • Patient-centered care • Global standards"
            showGrainTexture
            showCornerAccent
            imageHeight="lg"
            parallaxIntensity="subtle"
          />

          {/* Our Story with reveal animation */}
          <section className="py-20 md:py-32 bg-background overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollAnimation>
                <motion.div 
                  className="max-w-4xl mx-auto"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={staggerContainer}
                >
                  <motion.h2 
                    className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-8 tracking-tight"
                    variants={fadeInUp}
                  >
                    {t('story.title')}
                  </motion.h2>
                  <motion.p 
                    className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6"
                    variants={fadeInUp}
                  >
                    {t('story.paragraph1')}
                  </motion.p>
                  <motion.p 
                    className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6"
                    variants={fadeInUp}
                  >
                    {t('story.paragraph2')}
                  </motion.p>
                  <motion.p 
                    className="text-base md:text-lg text-muted-foreground leading-relaxed"
                    variants={fadeInUp}
                  >
                    {t('story.paragraph3')}
                  </motion.p>
                </motion.div>
              </ScrollAnimation>
            </div>
          </section>

          {/* Animated Statistics Section */}
          <AnimatedStatistics />

          {/* Our Values with staggered cards */}
          <section className="py-20 md:py-32 bg-muted/30 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.h2 
                className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground text-center mb-16 md:mb-20 tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                {t('values.title')}
              </motion.h2>
              <motion.div 
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={staggerContainer}
              >
                {[
                  { icon: Target, title: t('values.excellence.title'), desc: t('values.excellence.description') },
                  { icon: Heart, title: t('values.patientFocused.title'), desc: t('values.patientFocused.description') },
                  { icon: Globe, title: t('values.globalReach.title'), desc: t('values.globalReach.description') },
                  { icon: Shield, title: t('values.integrity.title'), desc: t('values.integrity.description') }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="text-center group cursor-default"
                    variants={valueCardVariants}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  >
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <item.icon className="w-8 h-8 text-white" strokeWidth={2} />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 tracking-tight">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Our Facilities with premium visual treatment */}
          <section className="py-20 md:py-32 relative overflow-hidden" style={{ backgroundColor: 'hsl(var(--section-color))' }}>
            {/* Animated background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div 
                className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-full blur-3xl"
                animate={{ 
                  x: [0, 30, 0],
                  y: [0, -20, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute -bottom-32 -right-32 w-80 h-80 bg-gradient-to-tl from-secondary/20 to-primary/10 rounded-full blur-3xl"
                animate={{ 
                  x: [0, -25, 0],
                  y: [0, 25, 0],
                  scale: [1, 1.15, 1]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              />
              <motion.div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/5 to-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
              />
            </div>
            
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px'
            }} />
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <motion.div 
                className="max-w-5xl mx-auto text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {/* Enhanced title with gradient */}
                <motion.div className="mb-4" variants={fadeInUp}>
                  <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white/80 border border-white/10">
                    Global Network
                  </span>
                </motion.div>
                <motion.h2 
                  className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-8 tracking-tight bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent"
                  variants={fadeInUp}
                >
                  {t('facilities.title')}
                </motion.h2>
                <motion.p 
                  className="text-base md:text-lg text-white/70 leading-relaxed mb-16 max-w-3xl mx-auto"
                  variants={fadeInUp}
                >
                  {t('facilities.description')}
                </motion.p>
                
                {/* Premium facility cards */}
                <motion.div 
                  className="grid md:grid-cols-2 gap-6 text-left"
                  variants={staggerContainer}
                >
                  {[
                    { title: t('facilities.southAfrica.title'), desc: t('facilities.southAfrica.description'), flag: '🇿🇦' },
                    { title: t('facilities.uk.title'), desc: t('facilities.uk.description'), flag: '🇬🇧' },
                    { title: t('facilities.thailand.title'), desc: t('facilities.thailand.description'), flag: '🇹🇭' },
                    { title: t('facilities.portugal.title'), desc: t('facilities.portugal.description'), flag: '🇵🇹' }
                  ].map((facility, index) => (
                    <motion.div 
                      key={index}
                      className="relative group"
                      variants={valueCardVariants}
                    >
                      {/* Gradient border effect */}
                      <div className="absolute -inset-[1px] bg-gradient-to-br from-primary/40 via-white/20 to-secondary/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[1px]" />
                      
                      {/* Card content */}
                      <div className="relative bg-white/[0.05] backdrop-blur-md rounded-2xl p-8 border border-white/10 transition-all duration-500 group-hover:bg-white/[0.08] group-hover:border-white/20 h-full">
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="relative z-10">
                          {/* Flag and location indicator */}
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">{facility.flag}</span>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/30 to-transparent" />
                          </div>
                          
                          <h3 className="text-xl md:text-2xl font-medium text-white mb-4 tracking-tight group-hover:text-white transition-colors">
                            {facility.title}
                          </h3>
                          <p className="text-white/60 leading-relaxed text-sm md:text-base group-hover:text-white/75 transition-colors">
                            {facility.desc}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                
                {/* Connecting line decoration */}
                <motion.div 
                  className="mt-12 flex justify-center"
                  variants={fadeInUp}
                >
                  <div className="flex items-center gap-2 text-white/40 text-sm">
                    <div className="w-12 h-px bg-gradient-to-r from-transparent to-white/30" />
                    <span>Connecting patients worldwide</span>
                    <div className="w-12 h-px bg-gradient-to-l from-transparent to-white/30" />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* CTA with animated button */}
          <section className="py-20 md:py-32 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.h2 
                  className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6 tracking-tight"
                  variants={fadeInUp}
                >
                  {t('cta.title')}
                </motion.h2>
                <motion.p 
                  className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-10"
                  variants={fadeInUp}
                >
                  {t('cta.description')}
                </motion.p>
                <motion.div variants={fadeInUp}>
                  <Link to="/contact">
                    <motion.button 
                      className="btn-primary px-7 py-3 relative overflow-hidden group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <span className="relative z-10">{t('cta.button')} →</span>
                      <motion.div 
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.5 }}
                      />
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>
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

export default AboutUs;
