import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  midX: number;
  midY: number;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
  blur: number;
}

interface Wisp {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
}

interface SmokeParticlesProps {
  isActive: boolean;
  particleCount?: number;
  color?: string;
}

export const SmokeParticles = ({ 
  isActive, 
  particleCount = 18,
  color = "hsl(var(--primary))"
}: SmokeParticlesProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [wisps, setWisps] = useState<Wisp[]>([]);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const wispIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wispIdRef = useRef(0);

  // Generate burst particles on activation
  useEffect(() => {
    if (isActive) {
      setIsFadingOut(false);
      const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
        const distance = Math.random() * 80 + 40;
        const swirl = (Math.random() - 0.5) * 60;
        
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 30,
          midX: Math.cos(angle + 0.5) * (distance * 0.5) + swirl,
          midY: Math.sin(angle + 0.5) * (distance * 0.5) - 15,
          size: Math.random() * 40 + 24,
          duration: Math.random() * 1.8 + 1.4,
          delay: Math.random() * 0.2,
          rotation: (Math.random() - 0.5) * 180,
          blur: Math.random() * 1.5 + 0.5,
        };
      });
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isActive, particleCount]);

  // Continuous wisps while active
  useEffect(() => {
    if (isActive) {
      // Generate initial wisps
      const initialWisps: Wisp[] = Array.from({ length: 4 }, () => createWisp());
      setWisps(initialWisps);

      // Continuously spawn new wisps
      wispIntervalRef.current = setInterval(() => {
        setWisps(prev => {
          // Remove old wisps (keep last 8)
          const trimmed = prev.slice(-8);
          return [...trimmed, createWisp()];
        });
      }, 400);
    } else {
      // Fade out - stop spawning but let existing wisps finish
      if (wispIntervalRef.current) {
        clearInterval(wispIntervalRef.current);
        wispIntervalRef.current = null;
      }
      setIsFadingOut(true);
      // Clear wisps after fade animation
      const fadeTimer = setTimeout(() => {
        setWisps([]);
        setIsFadingOut(false);
      }, 1500);
      return () => clearTimeout(fadeTimer);
    }

    return () => {
      if (wispIntervalRef.current) {
        clearInterval(wispIntervalRef.current);
      }
    };
  }, [isActive]);

  const createWisp = (): Wisp => {
    wispIdRef.current += 1;
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 40 + 20;
    return {
      id: wispIdRef.current,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 25,
      size: Math.random() * 30 + 18,
      duration: Math.random() * 2.0 + 1.8,
      delay: 0,
      rotation: (Math.random() - 0.5) * 120,
    };
  };

  return (
    <>
      {/* Continuous subtle wisps */}
      <AnimatePresence>
        {(isActive || isFadingOut) && wisps.map((wisp) => (
          <motion.div
            key={`wisp-${wisp.id}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: wisp.size,
              height: wisp.size,
              background: `radial-gradient(ellipse at 50% 50%, ${color}70 0%, ${color}40 35%, ${color}15 60%, transparent 80%)`,
              filter: "blur(1px)",
            }}
            initial={{ 
              x: 0, 
              y: 0, 
              opacity: 0, 
              scale: 0.6,
              rotate: 0,
            }}
            animate={{ 
              x: wisp.x,
              y: wisp.y,
              opacity: isFadingOut ? [0.5, 0] : [0, 0.6, 0.5, 0],
              scale: [0.6, 1.0, 1.4],
              rotate: wisp.rotation,
            }}
            exit={{ 
              opacity: 0,
              transition: { duration: 0.5 }
            }}
            transition={{ 
              duration: wisp.duration,
              ease: "easeOut",
              times: [0, 0.3, 0.7, 1],
            }}
          />
        ))}
      </AnimatePresence>

      {/* Burst particles on hover start */}
      <AnimatePresence>
        {isActive && particles.map((particle) => (
          <motion.div
            key={`particle-${particle.id}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: particle.size,
              height: particle.size,
              background: `radial-gradient(ellipse at 45% 45%, ${color}90 0%, ${color}60 25%, ${color}30 50%, transparent 75%)`,
              filter: `blur(${particle.blur}px)`,
            }}
            initial={{ 
              x: 0, 
              y: 0, 
              opacity: 0.85, 
              scale: 0.4,
              rotate: 0,
            }}
            animate={{ 
              x: [0, particle.midX, particle.x],
              y: [0, particle.midY, particle.y],
              opacity: [0.85, 0.7, 0], 
              scale: [0.4, 1.0, 1.6],
              rotate: particle.rotation,
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: particle.duration, 
              delay: particle.delay,
              ease: [0.25, 0.1, 0.25, 1],
              times: [0, 0.4, 1],
            }}
          />
        ))}
      </AnimatePresence>
    </>
  );
};
