import React from "react";
import hbLogoSquare from "@/assets/hb-logo-square.png";
import heroVideoBg from "@/assets/hero-video-bg.jpg";
import { ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const containerRef = React.useRef<HTMLElement>(null);
  const { t } = useTranslation('home');
  const [videoEnded, setVideoEnded] = React.useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const logoY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const logoScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Video autoplay failed:", error);
        // If video can't autoplay, show the static image
        setVideoEnded(true);
      });
    }
  }, []);

  const handleVideoEnded = () => {
    setVideoEnded(true);
  };

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-screen flex items-center overflow-hidden pt-28 sm:pt-36 md:pt-44 bg-background"
    >
      {/* Video Background with Parallax */}
      <motion.div 
        style={{ y: videoY }}
        className="absolute left-2 right-2 top-24 sm:top-28 md:top-32 bottom-4 rounded-2xl sm:rounded-3xl overflow-hidden z-0 shadow-2xl"
      >
        {/* Static image that shows after video ends or as fallback */}
        <motion.img
          src={heroVideoBg}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: videoEnded ? 1 : 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Video that plays first then fades out */}
        <motion.video 
          ref={videoRef}
          autoPlay 
          muted 
          playsInline
          onEnded={handleVideoEnded}
          initial={{ opacity: 1 }}
          animate={{ opacity: videoEnded ? 0 : 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </motion.video>
        
        {/* Enhanced gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1F2A25]/60 to-[#13303D]/55" />
      </motion.div>
      
      <motion.div 
        style={{ y: contentY, opacity }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 sm:py-24 md:py-32"
      >
        <div className="max-w-5xl text-left relative">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            className="font-pharma text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-white mb-6 sm:mb-8 leading-[1.1] tracking-tight drop-shadow-lg"
          >
            {t('hero.welcome')}{" "}
            <span className="block mt-3">{t('hero.healingBuds')}</span>
          </motion.h1>
          
          {/* Transparent logo overlay with parallax */}
          <motion.img 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.15, scale: 1 }}
            style={{ y: logoY, scale: logoScale }}
            transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
            src={hbLogoSquare} 
            alt="" 
            className="hidden md:block absolute right-0 md:right-8 lg:right-20 top-1/2 -translate-y-1/2 w-[280px] md:w-[340px] lg:w-[420px] h-auto pointer-events-none origin-center"
          />
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
            className="font-body text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-2xl font-light leading-relaxed drop-shadow-md"
          >
            {t('hero.tagline')}
          </motion.p>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1, ease: [0.25, 0.4, 0.25, 1] }}
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/80 hover:text-white transition-all duration-300 animate-bounce cursor-pointer"
        aria-label="Scroll to content"
      >
        <ChevronDown className="w-8 h-8" />
      </motion.button>
    </section>
  );
};

export default Hero;