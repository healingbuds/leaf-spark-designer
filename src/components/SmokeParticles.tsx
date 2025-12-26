import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";

interface Particle {
  id: number;
  xPath: number[];
  yPath: number[];
  size: number;
  duration: number;
  delay: number;
  rotation: number;
  rotationEnd: number;
  blur: number;
  swirlIntensity: number;
}

interface Wisp {
  id: number;
  xPath: number[];
  yPath: number[];
  size: number;
  duration: number;
  delay: number;
  rotation: number;
  rotationEnd: number;
  swirlIntensity: number;
}

type WindDirection = 'none' | 'left' | 'right' | 'up' | 'up-left' | 'up-right';

interface SmokeParticlesProps {
  isActive: boolean;
  particleCount?: number;
  spawnRate?: number;
  density?: 'light' | 'medium' | 'heavy';
  color?: string;
  opacity?: 'soft' | 'medium' | 'visible';
  interactive?: boolean;
  wind?: WindDirection;
  windStrength?: 'gentle' | 'moderate' | 'strong';
}

const densityConfig = {
  light: { particleMultiplier: 0.6, maxWisps: 5, spawnRate: 600 },
  medium: { particleMultiplier: 1, maxWisps: 8, spawnRate: 400 },
  heavy: { particleMultiplier: 1.5, maxWisps: 12, spawnRate: 250 },
};

const opacityConfig = {
  soft: { wispOpacity: [0, 0.35, 0.28, 0], burstOpacity: [0.5, 0.4, 0.3, 0.15, 0] },
  medium: { wispOpacity: [0, 0.55, 0.45, 0], burstOpacity: [0.7, 0.6, 0.45, 0.22, 0] },
  visible: { wispOpacity: [0, 0.75, 0.6, 0], burstOpacity: [0.9, 0.8, 0.6, 0.35, 0] },
};

const windStrengthConfig = {
  gentle: 0.4,
  moderate: 0.7,
  strong: 1.0,
};

const getWindVector = (direction: WindDirection): { x: number; y: number } => {
  switch (direction) {
    case 'left': return { x: -1, y: 0 };
    case 'right': return { x: 1, y: 0 };
    case 'up': return { x: 0, y: -1 };
    case 'up-left': return { x: -0.7, y: -0.7 };
    case 'up-right': return { x: 0.7, y: -0.7 };
    default: return { x: 0, y: 0 };
  }
};

export const SmokeParticles = ({ 
  isActive, 
  particleCount = 18,
  spawnRate,
  density = 'medium',
  color = "hsl(var(--primary))",
  opacity = 'medium',
  interactive = true,
  wind = 'none',
  windStrength = 'moderate',
}: SmokeParticlesProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [wisps, setWisps] = useState<Wisp[]>([]);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const wispIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wispIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Mouse interaction
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) * 0.15;
    const offsetY = (e.clientY - centerY) * 0.08;
    mouseX.set(offsetX);
    mouseY.set(offsetY);
  }, [interactive, mouseX, mouseY]);

  useEffect(() => {
    if (interactive && isActive) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [interactive, isActive, handleMouseMove]);

  const config = densityConfig[density];
  const opacitySettings = opacityConfig[opacity];
  const effectiveSpawnRate = spawnRate ?? config.spawnRate;
  const effectiveParticleCount = Math.round(particleCount * config.particleMultiplier);
  
  // Wind calculations
  const windVector = getWindVector(wind);
  const windMultiplier = windStrengthConfig[windStrength];
  const windDriftX = windVector.x * 60 * windMultiplier;
  const windDriftY = windVector.y * 40 * windMultiplier;

  // Generate burst particles on activation
  useEffect(() => {
    if (isActive) {
      setIsFadingOut(false);
      const newParticles: Particle[] = Array.from({ length: effectiveParticleCount }, (_, i) => {
        const baseX = (Math.random() - 0.5) * 35;
        const riseHeight = -(Math.random() * 100 + 70);
        
        // Create wavy turbulence path with 5 keyframes + wind drift
        const turbulence1 = (Math.random() - 0.5) * 30;
        const turbulence2 = (Math.random() - 0.5) * 40;
        const turbulence3 = (Math.random() - 0.5) * 25;
        
        return {
          id: i,
          xPath: [
            0, 
            baseX + turbulence1 + windDriftX * 0.2, 
            baseX - turbulence2 + windDriftX * 0.45, 
            baseX + turbulence3 + windDriftX * 0.7, 
            baseX + (Math.random() - 0.5) * 45 + windDriftX
          ],
          yPath: [
            0, 
            riseHeight * 0.25 + windDriftY * 0.2, 
            riseHeight * 0.5 + windDriftY * 0.45, 
            riseHeight * 0.75 + windDriftY * 0.7, 
            riseHeight + windDriftY
          ],
          size: Math.random() * 32 + 21,
          duration: Math.random() * 2.5 + 2,
          delay: Math.random() * 0.35,
          rotation: (Math.random() - 0.5) * 60,
          rotationEnd: (Math.random() - 0.5) * 180 + (Math.random() > 0.5 ? 120 : -120) + (windVector.x * 30 * windMultiplier),
          blur: Math.random() * 2 + 0.5,
          swirlIntensity: Math.random() * 0.4 + 0.3,
        };
      });
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isActive, effectiveParticleCount, windDriftX, windDriftY, windVector.x, windMultiplier]);

  const createWisp = useCallback((): Wisp => {
    wispIdRef.current += 1;
    const baseX = (Math.random() - 0.5) * 25;
    const riseHeight = -(Math.random() * 80 + 40);
    
    const sway1 = (Math.random() - 0.5) * 22;
    const sway2 = (Math.random() - 0.5) * 28;
    
    return {
      id: wispIdRef.current,
      xPath: [
        0, 
        baseX + sway1 + windDriftX * 0.3, 
        baseX - sway2 + windDriftX * 0.65, 
        baseX + sway1 * 0.5 + windDriftX
      ],
      yPath: [
        0, 
        riseHeight * 0.35 + windDriftY * 0.3, 
        riseHeight * 0.7 + windDriftY * 0.65, 
        riseHeight + windDriftY
      ],
      size: Math.random() * 25 + 16,
      duration: Math.random() * 2.6 + 2.4,
      delay: 0,
      rotation: (Math.random() - 0.5) * 40,
      rotationEnd: (Math.random() - 0.5) * 160 + (Math.random() > 0.5 ? 100 : -100) + (windVector.x * 25 * windMultiplier),
      swirlIntensity: Math.random() * 0.3 + 0.2,
    };
  }, [windDriftX, windDriftY, windVector.x, windMultiplier]);

  // Continuous wisps while active
  useEffect(() => {
    if (isActive) {
      const initialWisps: Wisp[] = Array.from({ length: Math.ceil(config.maxWisps / 2) }, () => createWisp());
      setWisps(initialWisps);

      wispIntervalRef.current = setInterval(() => {
        setWisps(prev => {
          const trimmed = prev.slice(-config.maxWisps);
          return [...trimmed, createWisp()];
        });
      }, effectiveSpawnRate);
    } else {
      if (wispIntervalRef.current) {
        clearInterval(wispIntervalRef.current);
        wispIntervalRef.current = null;
      }
      setIsFadingOut(true);
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
  }, [isActive, effectiveSpawnRate, config.maxWisps, createWisp]);

  // Wispy swirl SVG shape matching reference images
  const SwirlShape = ({ size, intensity, id }: { size: number; intensity: number; id: number }) => (
    <svg 
      width={size} 
      height={size * 2.5} 
      viewBox="0 0 60 150" 
      style={{ overflow: 'visible' }}
    >
      <defs>
        <radialGradient id={`smokeGradient-${id}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.65)" />
          <stop offset="15%" stopColor="rgba(230,245,240,0.55)" />
          <stop offset="35%" stopColor="rgba(180,210,200,0.4)" />
          <stop offset="55%" stopColor="rgba(140,180,170,0.28)" />
          <stop offset="75%" stopColor="rgba(100,160,150,0.15)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id={`smokeBlur-${id}`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
        </filter>
      </defs>
      {/* Main rising wisp body - organic swirl shape */}
      <path
        d={`M 30 140 
            Q ${25 - intensity * 8} 120, ${28 + intensity * 5} 100
            Q ${35 + intensity * 12} 85, ${25 - intensity * 6} 70
            Q ${18 - intensity * 10} 55, ${32 + intensity * 8} 40
            Q ${42 + intensity * 15} 25, ${28 - intensity * 5} 15
            Q ${22 - intensity * 8} 8, ${35 + intensity * 10} 0
            Q ${42 + intensity * 6} -5, ${38} 5
            Q ${30 - intensity * 5} 18, ${38 + intensity * 8} 35
            Q ${48 + intensity * 10} 48, ${35 - intensity * 5} 62
            Q ${28 - intensity * 8} 78, ${38 + intensity * 6} 95
            Q ${45 + intensity * 5} 115, ${35} 130
            Q ${32} 138, 30 140`}
        fill={`url(#smokeGradient-${id})`}
        filter={`url(#smokeBlur-${id})`}
      />
      {/* Secondary tendril */}
      <path
        d={`M 35 130
            Q ${42 + intensity * 6} 115, ${48 + intensity * 8} 100
            Q ${52 + intensity * 10} 82, ${45 - intensity * 3} 68
            Q ${40 - intensity * 5} 55, ${48 + intensity * 6} 42
            Q ${50 + intensity * 4} 50, ${44} 62
            Q ${38 - intensity * 4} 78, ${45 + intensity * 5} 95
            Q ${48} 112, 40 125
            Z`}
        fill={`url(#smokeGradient-${id})`}
        filter={`url(#smokeBlur-${id})`}
        opacity="0.5"
      />
    </svg>
  );

  return (
    <motion.div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        x: interactive ? springX : 0,
        y: interactive ? springY : 0,
      }}
    >
      {/* Subtle shadow layer beneath smoke */}
      <AnimatePresence>
        {(isActive || isFadingOut) && wisps.slice(0, 3).map((wisp) => (
          <motion.div
            key={`shadow-${wisp.id}`}
            className="absolute pointer-events-none"
            style={{
              width: wisp.size * 0.8,
              height: wisp.size * 0.3,
              left: '50%',
              top: '50%',
              marginLeft: -(wisp.size * 0.4),
              background: `radial-gradient(ellipse at 50% 50%, 
                rgba(0,0,0,0.06) 0%, 
                rgba(0,0,0,0.03) 40%,
                transparent 70%)`,
              filter: "blur(4px)",
              borderRadius: "50%",
            }}
            initial={{ 
              x: 0, 
              y: 8, 
              opacity: 0, 
              scale: 0.5,
            }}
            animate={{ 
              x: wisp.xPath.map(x => x * 0.3),
              y: 8,
              opacity: isFadingOut ? [0.25, 0] : [0, 0.28, 0.22, 0],
              scale: [0.5, 0.8, 1, 1.2],
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: wisp.duration * 0.8,
              ease: [0.4, 0, 0.2, 1],
              times: [0, 0.3, 0.65, 1],
            }}
          />
        ))}
      </AnimatePresence>

      {/* Continuous subtle wisps */}
      <AnimatePresence>
        {(isActive || isFadingOut) && wisps.map((wisp) => (
          <motion.div
            key={`wisp-${wisp.id}`}
            className="absolute pointer-events-none"
            style={{
              width: wisp.size,
              height: wisp.size,
              left: '50%',
              top: '50%',
              marginLeft: -(wisp.size / 2),
              marginTop: -(wisp.size / 2),
            }}
            initial={{ 
              x: 0, 
              y: 0, 
              opacity: 0, 
              scale: 0.5,
              rotate: wisp.rotation,
            }}
            animate={{ 
              x: wisp.xPath,
              y: wisp.yPath,
              opacity: isFadingOut ? [opacitySettings.wispOpacity[1] * 0.7, 0] : opacitySettings.wispOpacity,
              scale: [0.5, 0.9, 1.2, 1.5],
              rotate: wisp.rotationEnd,
            }}
            exit={{ 
              opacity: 0,
              transition: { duration: 0.5 }
            }}
            transition={{ 
              duration: wisp.duration,
              ease: [0.4, 0, 0.15, 1],
              times: [0, 0.3, 0.65, 1],
            }}
          >
            <SwirlShape size={wisp.size} intensity={wisp.swirlIntensity} id={wisp.id} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Burst particles on hover start */}
      <AnimatePresence>
        {isActive && particles.map((particle) => (
          <motion.div
            key={`particle-${particle.id}`}
            className="absolute pointer-events-none"
            style={{
              width: particle.size,
              height: particle.size,
              left: '50%',
              top: '50%',
              marginLeft: -(particle.size / 2),
              marginTop: -(particle.size / 2),
              filter: `blur(${particle.blur}px)`,
            }}
            initial={{ 
              x: 0, 
              y: 0, 
              opacity: opacitySettings.burstOpacity[0], 
              scale: 0.35,
              rotate: particle.rotation,
            }}
            animate={{ 
              x: particle.xPath,
              y: particle.yPath,
              opacity: opacitySettings.burstOpacity, 
              scale: [0.35, 0.7, 1.0, 1.4, 1.8],
              rotate: particle.rotationEnd,
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: particle.duration, 
              delay: particle.delay,
              ease: [0.4, 0, 0.1, 1],
              times: [0, 0.2, 0.45, 0.7, 1],
            }}
          >
            <SwirlShape size={particle.size} intensity={particle.swirlIntensity} id={particle.id} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};