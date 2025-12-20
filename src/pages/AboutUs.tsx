import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ScrollAnimation from "@/components/ScrollAnimation";
import BackToTop from "@/components/BackToTop";
import MobileBottomActions from "@/components/MobileBottomActions";
import AnimatedStatistics from "@/components/AnimatedStatistics";
import { Target, Heart, Globe, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import researchLabImage from "@/assets/research-lab-hq.jpg";
import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const AboutUs = () => {
  const { t } = useTranslation('aboutUs');
  const [menuOpen, setMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  
  // Parallax effect for hero image
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"]
  });
  
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1.05, 1]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 0.3]);

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
          {/* Hero Section with animated text */}
          <section className="bg-background py-16 md:py-20 relative z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                className="max-w-5xl"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.h1 
                  className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]"
                  variants={fadeInUp}
                >
                  {t('hero.title')}
                </motion.h1>
                <motion.p 
                  className="text-xl md:text-2xl text-muted-foreground max-w-3xl font-light"
                  variants={fadeInUp}
                >
                  {t('hero.subtitle')}
                </motion.p>
              </motion.div>
            </div>
          </section>

          {/* Hero Image with edge fade vignette and parallax */}
          <section 
            ref={heroRef}
            className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20 relative z-10"
          >
            <motion.div 
              ref={imageRef}
              className="relative h-[350px] md:h-[450px] lg:h-[550px] overflow-hidden rounded-2xl shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            >
              {/* Animated image with parallax */}
              <motion.div 
                className="absolute inset-0"
                style={{ y: imageY, scale: imageScale }}
              >
                <img 
                  src={researchLabImage} 
                  alt="Healing Buds research laboratory" 
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </motion.div>
              
              {/* Animated vignette edge fade effect */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Top edge fade */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background via-background/50 to-transparent" />
                {/* Bottom edge fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/60 to-transparent" />
                {/* Left edge fade */}
                <div className="absolute top-0 bottom-0 left-0 w-16 md:w-24 bg-gradient-to-r from-background/80 to-transparent" />
                {/* Right edge fade */}
                <div className="absolute top-0 bottom-0 right-0 w-16 md:w-24 bg-gradient-to-l from-background/80 to-transparent" />
                {/* Corner gradients for smooth blend */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-background/60 to-transparent" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-background/60 to-transparent" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-background/60 to-transparent" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-background/60 to-transparent" />
              </div>
              
              {/* Scroll-based overlay */}
              <motion.div 
                className="absolute inset-0 bg-primary/20"
                style={{ opacity: overlayOpacity }}
              />
              
              {/* Subtle animated grain texture */}
              <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />
              
              {/* Glassmorphism ethos card */}
              <motion.div 
                className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-auto md:max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="backdrop-blur-xl bg-white/10 dark:bg-black/20 rounded-xl p-4 md:p-5 border border-white/20 dark:border-white/10 shadow-lg">
                  <p className="text-white text-sm md:text-base font-medium tracking-wide">
                    Excellence in cultivation • Patient-centered care • Global standards
                  </p>
                </div>
              </motion.div>
              
              {/* Animated corner accent */}
              <motion.div 
                className="absolute top-4 right-4 w-12 h-12 md:w-16 md:h-16"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1, ease: "backOut" }}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
                </div>
              </motion.div>
            </motion.div>
          </section>

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

          {/* Our Facilities with hover effects */}
          <section className="py-20 md:py-32 relative overflow-hidden" style={{ backgroundColor: 'hsl(var(--section-color))' }}>
            {/* Subtle animated background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
            </div>
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <motion.div 
                className="max-w-4xl mx-auto text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.h2 
                  className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-8 tracking-tight"
                  variants={fadeInUp}
                >
                  {t('facilities.title')}
                </motion.h2>
                <motion.p 
                  className="text-base md:text-lg text-white/80 leading-relaxed mb-16"
                  variants={fadeInUp}
                >
                  {t('facilities.description')}
                </motion.p>
                <motion.div 
                  className="grid md:grid-cols-2 gap-6 text-left"
                  variants={staggerContainer}
                >
                  {[
                    { title: t('facilities.southAfrica.title'), desc: t('facilities.southAfrica.description') },
                    { title: t('facilities.uk.title'), desc: t('facilities.uk.description') },
                    { title: t('facilities.thailand.title'), desc: t('facilities.thailand.description') },
                    { title: t('facilities.portugal.title'), desc: t('facilities.portugal.description') }
                  ].map((facility, index) => (
                    <motion.div 
                      key={index}
                      className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-7 border border-white/10 transition-all duration-300 hover:bg-white/[0.08] hover:border-white/25 hover:shadow-xl group"
                      variants={valueCardVariants}
                      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    >
                      <h3 className="text-xl md:text-2xl font-medium text-white mb-4 tracking-tight group-hover:text-white/90 transition-colors">
                        {facility.title}
                      </h3>
                      <p className="text-white/70 leading-relaxed text-sm md:text-base group-hover:text-white/80 transition-colors">
                        {facility.desc}
                      </p>
                    </motion.div>
                  ))}
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