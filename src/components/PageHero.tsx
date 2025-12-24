import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

type HeroVariant = 'split' | 'overlay';
type ImageHeight = 'sm' | 'md' | 'lg' | 'xl';
type ParallaxIntensity = 'subtle' | 'medium' | 'strong';

interface PageHeroProps {
  // Required
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  
  // Layout variants
  variant?: HeroVariant;
  
  // Optional features
  showGlassmorphismCard?: boolean;
  glassmorphismText?: string;
  showAnimatedGlow?: boolean;
  showGrainTexture?: boolean;
  showCornerAccent?: boolean;
  
  // Size customization
  imageHeight?: ImageHeight;
  
  // Parallax intensity
  parallaxIntensity?: ParallaxIntensity;
  
  // Children for custom overlay content
  children?: React.ReactNode;
}

const heightClasses: Record<ImageHeight, string> = {
  sm: 'h-[350px] md:h-[400px]',
  md: 'h-[400px] md:h-[500px]',
  lg: 'h-[400px] md:h-[500px] lg:h-[600px]',
  xl: 'h-[450px] md:h-[550px] lg:h-[650px]'
};

const parallaxValues: Record<ParallaxIntensity, { yRange: [string, string]; scaleRange: [number, number] }> = {
  subtle: { yRange: ['0%', '15%'], scaleRange: [1.05, 1] },
  medium: { yRange: ['0%', '30%'], scaleRange: [1, 1.1] },
  strong: { yRange: ['0%', '50%'], scaleRange: [1, 1.15] }
};

const PageHero = ({
  title,
  subtitle,
  image,
  imageAlt,
  variant = 'split',
  showGlassmorphismCard = false,
  glassmorphismText,
  showAnimatedGlow = false,
  showGrainTexture = false,
  showCornerAccent = false,
  imageHeight = 'md',
  parallaxIntensity = 'medium',
  children
}: PageHeroProps) => {
  const heroRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: variant === 'overlay' ? ["start start", "end start"] : ["start end", "end start"]
  });
  
  const { yRange, scaleRange } = parallaxValues[parallaxIntensity];
  const imageY = useTransform(scrollYProgress, [0, 1], yRange);
  const imageScale = useTransform(scrollYProgress, [0, 1], scaleRange);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 0.3]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  // Animation variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  if (variant === 'overlay') {
    return (
      <section ref={heroRef} className={`relative ${heightClasses[imageHeight]} overflow-hidden`}>
        <motion.img 
          src={image}
          alt={imageAlt}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ y: imageY, opacity }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background z-[1]" />
        
        {/* Animated edge fade vignette */}
        <motion.div 
          className="absolute inset-0 pointer-events-none z-[2]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          style={{
            background: `radial-gradient(ellipse 120% 80% at 50% 50%, transparent 40%, hsl(var(--background) / 0.3) 70%, hsl(var(--background) / 0.7) 100%)`
          }}
        />
        
        {/* Animated glow on edges */}
        {showAnimatedGlow && (
          <motion.div 
            className="absolute inset-0 pointer-events-none z-[2]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              boxShadow: 'inset 0 0 80px 30px hsl(var(--background) / 0.5)'
            }}
          />
        )}
        
        {/* Content */}
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center z-[3]">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-semibold text-foreground mb-4"
              variants={fadeInUp}
            >
              {title}
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground/80 max-w-2xl"
              variants={fadeInUp}
            >
              {subtitle}
            </motion.p>
          </motion.div>
          {children}
        </div>
      </section>
    );
  }

  // Split variant (default)
  return (
    <>
      {/* Hero Text Section */}
      <section className="bg-background py-16 md:py-20">
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
              {title}
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl font-light"
              variants={fadeInUp}
            >
              {subtitle}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Hero Image Section */}
      <section 
        ref={heroRef}
        className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20"
      >
        <motion.div 
          className={`relative ${heightClasses[imageHeight]} overflow-hidden rounded-2xl shadow-2xl`}
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
              src={image} 
              alt={imageAlt}
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
          
          {/* Animated glow on edges */}
          {showAnimatedGlow && (
            <motion.div 
              className="absolute inset-0 pointer-events-none z-10 rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                boxShadow: 'inset 0 0 60px 20px hsl(var(--background) / 0.4)'
              }}
            />
          )}
          
          {/* Scroll-based overlay */}
          <motion.div 
            className="absolute inset-0 bg-primary/20"
            style={{ opacity: overlayOpacity }}
          />
          
          {/* Subtle animated grain texture */}
          {showGrainTexture && (
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />
          )}
          
          {/* Glassmorphism card - improved light mode visibility */}
          {showGlassmorphismCard && glassmorphismText && (
            <motion.div 
              className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-auto md:max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="backdrop-blur-xl bg-gradient-to-br from-black/60 via-black/50 to-black/40 dark:from-black/40 dark:via-black/30 dark:to-black/20 rounded-xl p-4 md:p-5 border border-white/20 shadow-lg">
                <p className="text-white text-sm md:text-base font-medium tracking-wide drop-shadow-md">
                  {glassmorphismText}
                </p>
              </div>
            </motion.div>
          )}
          
          {/* Animated corner accent - sage-teal medical palette */}
          {showCornerAccent && (
            <motion.div 
              className="absolute top-4 right-4 w-12 h-12 md:w-16 md:h-16"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1, ease: "backOut" }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/40 to-teal-600/30 backdrop-blur-sm border border-primary/30 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
            </motion.div>
          )}
          
          {/* Custom children content */}
          {children}
        </motion.div>
      </section>
    </>
  );
};

export default PageHero;
