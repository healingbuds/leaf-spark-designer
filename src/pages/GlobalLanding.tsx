import { motion } from 'framer-motion';
import { ArrowRight, Globe, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Region {
  code: string;
  name: string;
  flag: string;
  status: 'live' | 'coming-soon';
  statusLabel: string;
  description: string;
  url: string;
}

const regions: Region[] = [
  {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    status: 'live',
    statusLabel: 'Operational',
    description: 'Full access to medical cannabis products and services',
    url: 'https://healingbuds.co.za',
  },
  {
    code: 'PT',
    name: 'Portugal',
    flag: '🇵🇹',
    status: 'coming-soon',
    statusLabel: 'Coming Soon',
    description: 'Launching soon with EU-compliant medical cannabis',
    url: 'https://healingbuds.pt',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    status: 'coming-soon',
    statusLabel: 'Coming Soon',
    description: 'UK-licensed medical cannabis clinic coming soon',
    url: 'https://healingbuds.co.uk',
  },
];

const RegionCard = ({ region, index }: { region: Region; index: number }) => {
  const isLive = region.status === 'live';

  const handleClick = () => {
    if (isLive) {
      window.location.href = region.url;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 h-full flex flex-col">
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle className="w-3 h-3" />
              {region.statusLabel}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Clock className="w-3 h-3" />
              {region.statusLabel}
            </span>
          )}
        </div>

        {/* Flag & Name */}
        <div className="mb-4">
          <span className="text-5xl mb-3 block">{region.flag}</span>
          <h3 className="font-semibold text-xl text-white">{region.name}</h3>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-6 flex-grow">
          {region.description}
        </p>

        {/* Action Button */}
        <Button
          onClick={handleClick}
          disabled={!isLive}
          className={`w-full group/btn ${
            isLive
              ? 'bg-primary hover:bg-primary/90'
              : 'bg-white/10 text-white/50 cursor-not-allowed'
          }`}
        >
          {isLive ? 'Enter' : 'Coming Soon'}
          {isLive && (
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
          )}
        </Button>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent" />
        </div>
      </div>
    </motion.div>
  );
};

const GlobalLanding = () => {
  return (
    <div className="min-h-screen bg-[#1A2E2A] flex flex-col">
      {/* Header */}
      <header className="py-6 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center"
        >
          <img
            src="/email-assets/hb-logo-white.png"
            alt="Healing Buds"
            className="h-10 md:h-12"
          />
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="max-w-5xl w-full">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-sm text-white/80">Global Network</span>
            </div>
            <h1 className="font-pharma text-4xl md:text-5xl lg:text-6xl text-white mb-4">
              Select Your Region
            </h1>
            <p className="font-jakarta text-lg text-muted-foreground max-w-2xl mx-auto">
              Access medical cannabis services tailored to your location's regulations and requirements
            </p>
          </motion.div>

          {/* Region Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {regions.map((region, index) => (
              <RegionCard key={region.code} region={region} index={index} />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-sm text-white/40"
        >
          © {new Date().getFullYear()} Healing Buds. All rights reserved.
        </motion.p>
      </footer>
    </div>
  );
};

export default GlobalLanding;
