# Healing Buds Regional Pages Export

A complete export of regional landing pages for replication in other Lovable projects.

## 📦 Files to Copy

```
src/
├── pages/
│   └── GlobalLanding.tsx         # Region selection portal
├── components/
│   ├── RegionalGate.tsx          # Regional routing logic
│   ├── RegionSignupModal.tsx     # "Coming Soon" signup modal
│   └── ComingSoonOverlay.tsx     # Full-page coming soon overlay
├── i18n/locales/en/
│   └── comingSoon.json           # English translations
└── i18n/locales/pt/
    └── comingSoon.json           # Portuguese translations
```

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install framer-motion lucide-react zod react-hook-form @hookform/resolvers react-i18next i18next sonner
```

### 2. Database Setup (Supabase)
Run this migration to create the `launch_interest` table:

```sql
CREATE TABLE public.launch_interest (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country_code TEXT NOT NULL,
  interested_region TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  source TEXT DEFAULT 'global_landing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.launch_interest ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for lead generation
CREATE POLICY "Allow anonymous inserts" 
ON public.launch_interest 
FOR INSERT 
WITH CHECK (true);

-- Unique constraint to prevent duplicate emails per region
CREATE UNIQUE INDEX launch_interest_email_region_idx 
ON public.launch_interest (email, interested_region);
```

### 3. Add i18n Translations

**src/i18n/locales/en/comingSoon.json:**
```json
{
  "title": "Coming Soon",
  "subtitle": {
    "PT": "Healing Buds Portugal",
    "GB": "Healing Buds UK"
  },
  "description": "We're preparing to launch in your region. Be the first to know when we go live.",
  "form": {
    "fullName": "Full Name",
    "fullNamePlaceholder": "Enter your full name",
    "email": "Email Address",
    "emailPlaceholder": "you@example.com",
    "phone": "Phone (optional)",
    "phonePlaceholder": {
      "PT": "+351 912 345 678",
      "GB": "+44 7911 123456"
    },
    "submit": "Notify Me When Live",
    "submitting": "Joining..."
  },
  "success": {
    "title": "You're on the list!",
    "message": "We'll email you as soon as we launch in your region.",
    "backToForm": "Register another email"
  },
  "error": {
    "duplicate": "This email is already registered for this region.",
    "generic": "Something went wrong. Please try again."
  },
  "privacy": "We respect your privacy. No spam, ever.",
  "footer": {
    "alreadyHaveAccess": "Already have access elsewhere?",
    "visitSouthAfrica": "Visit Healing Buds South Africa"
  }
}
```

**src/i18n/locales/pt/comingSoon.json:**
```json
{
  "title": "Em Breve",
  "subtitle": {
    "PT": "Healing Buds Portugal",
    "GB": "Healing Buds Reino Unido"
  },
  "description": "Estamos a preparar o lançamento na sua região. Seja o primeiro a saber quando estivermos disponíveis.",
  "form": {
    "fullName": "Nome Completo",
    "fullNamePlaceholder": "Introduza o seu nome",
    "email": "Email",
    "emailPlaceholder": "voce@exemplo.com",
    "phone": "Telefone (opcional)",
    "phonePlaceholder": {
      "PT": "+351 912 345 678",
      "GB": "+44 7911 123456"
    },
    "submit": "Notificar-me Quando Disponível",
    "submitting": "A registar..."
  },
  "success": {
    "title": "Está na lista!",
    "message": "Enviaremos um email assim que lançarmos na sua região.",
    "backToForm": "Registar outro email"
  },
  "error": {
    "duplicate": "Este email já está registado para esta região.",
    "generic": "Algo correu mal. Por favor tente novamente."
  },
  "privacy": "Respeitamos a sua privacidade. Sem spam, sempre.",
  "footer": {
    "alreadyHaveAccess": "Já tem acesso noutro local?",
    "visitSouthAfrica": "Visitar Healing Buds África do Sul"
  }
}
```

---

## 📄 Component Files

### 1. GlobalLanding.tsx (Region Selection Portal)

```tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RegionSignupModal } from '@/components/RegionSignupModal';

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

interface RegionCardProps {
  region: Region;
  index: number;
  onComingSoonClick: (region: Region) => void;
}

const RegionCard = ({ region, index, onComingSoonClick }: RegionCardProps) => {
  const isLive = region.status === 'live';

  const handleClick = () => {
    if (isLive) {
      window.location.href = region.url;
    } else {
      onComingSoonClick(region);
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
          className={`w-full group/btn ${
            isLive
              ? 'bg-primary hover:bg-primary/90'
              : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white cursor-pointer'
          }`}
        >
          {isLive ? 'Enter' : 'Get Notified'}
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
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
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleComingSoonClick = (region: Region) => {
    setSelectedRegion(region);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRegion(null);
  };

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
              <RegionCard 
                key={region.code} 
                region={region} 
                index={index}
                onComingSoonClick={handleComingSoonClick}
              />
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

      {/* Region Signup Modal */}
      {selectedRegion && (
        <RegionSignupModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          region={selectedRegion}
        />
      )}
    </div>
  );
};

export default GlobalLanding;
```

---

### 2. RegionSignupModal.tsx

```tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, Phone, Loader2, CheckCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

interface RegionSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  region: {
    code: string;
    name: string;
    flag: string;
  };
}

const signupSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().trim().email('Please enter a valid email').max(255, 'Email is too long'),
  phone: z.string().trim().max(20, 'Phone number is too long').optional(),
});

type SignupFormData = z.infer<typeof signupSchema>;

export const RegionSignupModal = ({ isOpen, onClose, region }: RegionSignupModalProps) => {
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (field: keyof SignupFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignupFormData, string>> = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as keyof SignupFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('launch_interest').insert({
        full_name: result.data.fullName,
        email: result.data.email,
        phone: result.data.phone || null,
        country_code: region.code,
        interested_region: region.name,
        source: 'global_landing',
        language: region.code === 'PT' ? 'pt' : 'en',
      });

      if (error) {
        if (error.code === '23505') {
          toast.info('You\'re already on our list!', {
            description: `We'll notify you when ${region.name} launches.`,
          });
          setIsSuccess(true);
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
        toast.success('You\'re on the list!', {
          description: `We'll notify you when we launch in ${region.name}.`,
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Something went wrong', {
        description: 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ fullName: '', email: '', phone: '' });
    setErrors({});
    setIsSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#1A2E2A] shadow-2xl">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>

              {/* Header */}
              <div className="px-6 pt-8 pb-4 text-center border-b border-white/10">
                <span className="text-5xl mb-3 block">{region.flag}</span>
                <h2 className="font-pharma text-2xl text-white mb-1">
                  {region.name} Launch
                </h2>
                <p className="text-sm text-muted-foreground">
                  Be the first to know when we go live
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-xl text-white mb-2">You're on the list!</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      We'll send you an email as soon as Healing Buds launches in {region.name}.
                    </p>
                    <Button onClick={handleClose} variant="glass" className="w-full">
                      Close
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-white/80 text-sm">
                        Full Name *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Enter your name"
                          value={formData.fullName}
                          onChange={handleChange('fullName')}
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary"
                          required
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-xs text-red-400">{errors.fullName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/80 text-sm">
                        Email Address *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={handleChange('email')}
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary"
                          required
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-red-400">{errors.email}</p>
                      )}
                    </div>

                    {/* Phone (Optional) */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white/80 text-sm">
                        Phone Number <span className="text-white/40">(optional)</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+44 123 456 7890"
                          value={formData.phone}
                          onChange={handleChange('phone')}
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-xs text-red-400">{errors.phone}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary hover:bg-primary/90 text-white mt-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4 mr-2" />
                          Notify Me When Live
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-white/40 mt-4">
                      We respect your privacy. No spam, ever.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RegionSignupModal;
```

---

### 3. ComingSoonOverlay.tsx

```tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ExternalLink, CheckCircle2, Loader2, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import hbLogo from '@/assets/hb-logo-white.png';

interface ComingSoonOverlayProps {
  countryCode: 'PT' | 'GB';
  language: 'en' | 'pt';
  children: React.ReactNode;
}

const formSchema = z.object({
  fullName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export const ComingSoonOverlay = ({ countryCode, language, children }: ComingSoonOverlayProps) => {
  const { t } = useTranslation('comingSoon');
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('launch_interest')
        .insert({
          full_name: data.fullName.trim(),
          email: data.email.toLowerCase().trim(),
          phone: data.phone?.trim() || null,
          interested_region: countryCode,
          country_code: countryCode,
          language: language,
          source: 'coming_soon_page',
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: t('error.duplicate'),
            variant: 'destructive',
          });
        } else {
          throw error;
        }
      } else {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting interest:', error);
      toast({
        title: t('error.generic'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterAnother = () => {
    setIsSubmitted(false);
    reset();
  };

  const phonePlaceholder = t(`form.phonePlaceholder.${countryCode}`, { defaultValue: '+44 7911 123456' });
  const subtitle = t(`subtitle.${countryCode}`, { defaultValue: t('subtitle.GB') });

  return (
    <div className="relative">
      {/* Blurred background content */}
      <div className="blur-lg pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>

      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
      >
        {/* Backdrop with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-primary/20" />
        
        {/* Decorative elements */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-accent/10 blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative z-10 w-full max-w-md mx-auto my-8"
        >
          <div className="glass-card rounded-2xl p-8 shadow-2xl border border-border/50 bg-card/80 backdrop-blur-xl">
            {/* Logo */}
            <motion.div 
              className="flex justify-center mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <img 
                src={hbLogo} 
                alt="Healing Buds" 
                className="h-12 w-auto brightness-0 dark:brightness-100 invert dark:invert-0"
              />
            </motion.div>

            {/* Title */}
            <motion.div 
              className="text-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Leaf className="w-4 h-4" />
                <span>{t('title')}</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {subtitle}
              </h1>
              <p className="text-muted-foreground text-sm">
                {t('description')}
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      {t('form.fullName')}
                    </Label>
                    <Input
                      id="fullName"
                      placeholder={t('form.fullNamePlaceholder')}
                      {...register('fullName')}
                      className="bg-background/50 border-border/50 focus:border-primary"
                    />
                    {errors.fullName && (
                      <p className="text-xs text-destructive">{errors.fullName.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      {t('form.email')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('form.emailPlaceholder')}
                      {...register('email')}
                      className="bg-background/50 border-border/50 focus:border-primary"
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Phone (optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      {t('form.phone')}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={phonePlaceholder}
                      {...register('phone')}
                      className="bg-background/50 border-border/50 focus:border-primary"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('form.submitting')}
                      </>
                    ) : (
                      t('form.submit')
                    )}
                  </Button>

                  {/* Privacy note */}
                  <p className="text-xs text-muted-foreground text-center">
                    {t('privacy')}
                  </p>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    {t('success.title')}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4">
                    {t('success.message')}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRegisterAnother}
                    className="text-primary hover:text-primary/80"
                  >
                    {t('success.backToForm')}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center mb-3">
                {t('footer.alreadyHaveAccess')}
              </p>
              <a
                href="https://healingbuds.co.za"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {t('footer.visitSouthAfrica')}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ComingSoonOverlay;
```

---

### 4. RegionalGate.tsx

```tsx
import { ReactNode, useMemo, useState, useEffect } from 'react';
import { ComingSoonOverlay } from './ComingSoonOverlay';
import GlobalLanding from '@/pages/GlobalLanding';

interface RegionalGateProps {
  children: ReactNode;
}

type RegionStatus = 'operational' | 'coming_soon' | 'redirect';

interface RegionConfig {
  status: RegionStatus;
  language: 'en' | 'pt';
}

const REGION_CONFIG: Record<string, RegionConfig> = {
  ZA: { status: 'operational', language: 'en' },
  PT: { status: 'coming_soon', language: 'pt' },
  GB: { status: 'coming_soon', language: 'en' },
  GLOBAL: { status: 'redirect', language: 'en' },
};

// Detect country from domain or simulation parameter
const getCountryFromDomain = (): string => {
  if (typeof window === 'undefined') return 'ZA';
  
  // DEV ONLY: Check for simulation query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const simulatedRegion = urlParams.get('simulate_region');
  
  if (simulatedRegion && ['ZA', 'PT', 'GB', 'GLOBAL'].includes(simulatedRegion.toUpperCase())) {
    console.log(`[RegionalGate] Simulating region: ${simulatedRegion.toUpperCase()}`);
    return simulatedRegion.toUpperCase();
  }
  
  const hostname = window.location.hostname;
  
  // Development/staging domains → operational (South Africa)
  if (
    hostname.includes('lovable.app') || 
    hostname.includes('lovable.dev') ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1'
  ) {
    return 'ZA';
  }
  
  // Check specific country TLDs
  if (hostname.endsWith('.pt') || hostname.includes('healingbuds.pt')) return 'PT';
  if (hostname.endsWith('.co.uk') || hostname.includes('healingbuds.co.uk')) return 'GB';
  if (hostname.endsWith('.co.za') || hostname.includes('healingbuds.co.za')) return 'ZA';
  if (hostname.endsWith('.global') || hostname.includes('healingbuds.global')) return 'GLOBAL';
  
  // Default to South Africa for unknown domains
  return 'ZA';
};

export const RegionalGate = ({ children }: RegionalGateProps) => {
  const [simulatedRegion, setSimulatedRegion] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setSimulatedRegion(urlParams.get('simulate_region')?.toUpperCase() || null);
  }, []);

  const regionInfo = useMemo(() => {
    const countryCode = getCountryFromDomain();
    const config = REGION_CONFIG[countryCode] || REGION_CONFIG.ZA;
    return { countryCode, ...config };
  }, []);

  // Simulation indicator badge (dev only)
  const SimulationBadge = simulatedRegion ? (
    <div className="fixed bottom-4 left-4 z-[200] bg-yellow-500 text-black px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
      <span>🔬</span>
      <span>Simulating: {simulatedRegion}</span>
    </div>
  ) : null;

  // Operational regions: render children normally
  if (regionInfo.status === 'operational') {
    return (
      <>
        {children}
        {SimulationBadge}
      </>
    );
  }

  // Redirect regions (GLOBAL): show the Global Landing page
  if (regionInfo.status === 'redirect') {
    return (
      <>
        <GlobalLanding />
        {SimulationBadge}
      </>
    );
  }

  // Coming soon regions: show overlay with blurred background
  if (regionInfo.status === 'coming_soon') {
    return (
      <>
        <ComingSoonOverlay
          countryCode={regionInfo.countryCode as 'PT' | 'GB'}
          language={regionInfo.language}
        >
          {children}
        </ComingSoonOverlay>
        {SimulationBadge}
      </>
    );
  }

  // Fallback: render children
  return (
    <>
      {children}
      {SimulationBadge}
    </>
  );
};

export default RegionalGate;
```

---

## 🎨 Required Design Tokens

Add these to your `index.css` or `theme.css`:

```css
:root {
  --primary: 175 42% 35%;
  --primary-foreground: 0 0% 98%;
  --muted-foreground: 165 12% 42%;
  --background: 150 12% 97%;
  --foreground: 172 32% 20%;
  --card: 155 10% 99%;
  --border: 165 18% 86%;
  --destructive: 15 65% 55%;
}

.dark {
  --primary: 168 38% 45%;
  --background: 180 8% 7%;
  --foreground: 150 8% 95%;
  --card: 175 6% 11%;
  --muted-foreground: 165 10% 60%;
  --border: 170 8% 20%;
}
```

---

## 🔧 Integration in App.tsx

```tsx
import { RegionalGate } from '@/components/RegionalGate';

function App() {
  return (
    <RegionalGate>
      {/* Your app content */}
    </RegionalGate>
  );
}
```

---

## 🧪 Testing

Use query parameter `?simulate_region=XX` to test different regions:
- `?simulate_region=ZA` - South Africa (operational)
- `?simulate_region=PT` - Portugal (coming soon)
- `?simulate_region=GB` - UK (coming soon)
- `?simulate_region=GLOBAL` - Global portal

---

## 📝 Customization

1. **Update regions array** in `GlobalLanding.tsx` to add/remove regions
2. **Update REGION_CONFIG** in `RegionalGate.tsx` to change region statuses
3. **Update domain detection** in `getCountryFromDomain()` for your domains
4. **Update translations** in i18n files for additional languages

---

© Healing Buds Design System
