import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    if (isActive) {
      const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => {
        // Create swirling paths with mid-points for curved motion
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
        const distance = Math.random() * 120 + 60;
        const swirl = (Math.random() - 0.5) * 80;
        
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 40,
          midX: Math.cos(angle + 0.5) * (distance * 0.5) + swirl,
          midY: Math.sin(angle + 0.5) * (distance * 0.5) - 20,
          size: Math.random() * 28 + 12,
          duration: Math.random() * 1.2 + 1.0,
          delay: Math.random() * 0.3,
          rotation: (Math.random() - 0.5) * 360,
          blur: Math.random() * 6 + 4,
        };
      });
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
            background: `radial-gradient(ellipse at 30% 30%, ${color} 0%, ${color}66 30%, transparent 70%)`,
            filter: `blur(${particle.blur}px)`,
          }}
          initial={{ 
            x: 0, 
            y: 0, 
            opacity: 0.7, 
            scale: 0.3,
            rotate: 0,
          }}
          animate={{ 
            x: [0, particle.midX, particle.x],
            y: [0, particle.midY, particle.y],
            opacity: [0.7, 0.5, 0], 
            scale: [0.3, 1.5, 2.5],
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
  );
};
