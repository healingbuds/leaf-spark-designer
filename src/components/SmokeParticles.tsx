import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

interface SmokeParticlesProps {
  isActive: boolean;
  particleCount?: number;
  color?: string;
}

export const SmokeParticles = ({ 
  isActive, 
  particleCount = 12,
  color = "hsl(var(--primary))"
}: SmokeParticlesProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (isActive) {
      const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200 - 50,
        size: Math.random() * 20 + 8,
        duration: Math.random() * 0.8 + 0.6,
        delay: Math.random() * 0.2,
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isActive, particleCount]);

  return (
    <AnimatePresence>
      {isActive && particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: particle.size,
            height: particle.size,
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            filter: "blur(4px)",
          }}
          initial={{ 
            x: 0, 
            y: 0, 
            opacity: 0.8, 
            scale: 0.5 
          }}
          animate={{ 
            x: particle.x, 
            y: particle.y, 
            opacity: 0, 
            scale: 2 
          }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: particle.duration, 
            delay: particle.delay,
            ease: "easeOut" 
          }}
        />
      ))}
    </AnimatePresence>
  );
};
