import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, Globe, Building2, Award } from 'lucide-react';
import ScrollAnimation from './ScrollAnimation';

interface Statistic {
  label: string;
  value: number;
  suffix: string;
  icon: React.ReactNode;
  color: string;
}

const StatisticsSection = () => {
  const statistics: Statistic[] = [
    {
      label: 'Years of Operation',
      value: 8,
      suffix: '+',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'from-primary to-primary-dark'
    },
    {
      label: 'Countries Served',
      value: 4,
      suffix: '',
      icon: <Globe className="w-8 h-8" />,
      color: 'from-secondary to-accent'
    },
    {
      label: 'Production Capacity',
      value: 7500,
      suffix: ' kg/year',
      icon: <Building2 className="w-8 h-8" />,
      color: 'from-accent to-primary'
    },
    {
      label: 'Certifications',
      value: 12,
      suffix: '+',
      icon: <Award className="w-8 h-8" />,
      color: 'from-primary-dark to-secondary'
    }
  ];

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-muted/30 via-background to-muted/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollAnimation>
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4 tracking-tight">
              Our Impact in Numbers
            </h2>
            <p className="text-base md:text-lg text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
              Building a global network of pharmaceutical-grade cannabis production and distribution
            </p>
          </div>
        </ScrollAnimation>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {statistics.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface StatCardProps {
  stat: Statistic;
  index: number;
}

const StatCard = ({ stat, index }: StatCardProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = stat.value / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= stat.value) {
        setCount(stat.value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isInView, stat.value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative"
    >
      <div className="relative h-full p-8 rounded-2xl border border-border/30 bg-card backdrop-blur-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
        
        {/* Icon container */}
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500`}>
          <div className="text-white">
            {stat.icon}
          </div>
        </div>

        {/* Counter */}
        <div className="relative z-10">
          <div className="text-4xl md:text-5xl font-bold text-foreground mb-2 tracking-tight">
            {count.toLocaleString()}
            <span className="text-primary">{stat.suffix}</span>
          </div>
          <div className="text-sm text-muted-foreground/80 font-medium tracking-wide">
            {stat.label}
          </div>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </div>
      </div>
    </motion.div>
  );
};

export default StatisticsSection;
