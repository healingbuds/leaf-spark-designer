import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AboutHero from "@/components/AboutHero";
import ValueProps from "@/components/ValueProps";
import Cultivation from "@/components/Cultivation";
import News from "@/components/News";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import BackToTop from "@/components/BackToTop";
import MobileBottomActions from "@/components/MobileBottomActions";
import { useState, useEffect } from "react";

const Index = () => {
  const [scrollFade, setScrollFade] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Calculate fade opacity based on scroll position
      // Starts fading at 100px, reaches full opacity at 300px
      const fadeValue = Math.min(scrollY / 300, 1);
      setScrollFade(fadeValue);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20 lg:pb-0">
        <Header />
        {/* Dynamic scroll-based fade overlay from hero bottom */}
        <div 
          className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/30 via-background/15 to-transparent z-30 pointer-events-none transition-opacity duration-500 ease-out"
          style={{ opacity: scrollFade * 0.4 }}
        />
        <main>
          <Hero />
          <AboutHero />
          <ValueProps />
          <Cultivation />
          <News />
        </main>
        <Footer />
        <BackToTop />
        <MobileBottomActions />
      </div>
    </PageTransition>
  );
};

export default Index;
