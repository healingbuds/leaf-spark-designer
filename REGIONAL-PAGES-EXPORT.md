# Healing Buds .global Regional Landing Pages

**Copy-paste this entire file into Lovable.ai chat to build the regional landing system.**

---

## 🎯 What This Creates

A region selection portal for `healingbuds.global` that:
1. Displays cards for South Africa (Live), Portugal (Coming Soon), UK (Coming Soon)
2. Clicking "Live" regions redirects to their production domains
3. Clicking "Coming Soon" regions opens a signup modal to capture leads
4. Stores leads in a database table for future launch notifications

---

## 📦 Step 1: Create Database Table

First, run this SQL migration to create the leads table:

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

---

## 📦 Step 2: Install Dependencies

```bash
npm install framer-motion lucide-react zod sonner
```

---

## 📦 Step 3: Add Logo Asset

Copy this logo file to your project:
- **File**: `src/assets/hb-logo-white-full.png`
- This is the full "Healing Buds" wordmark logo (white, for dark backgrounds)

---

## 📦 Step 4: Create Components

### 4a. Create `src/components/RegionSignupModal.tsx`

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
import hbLogoWhite from '@/assets/hb-logo-white-full.png';

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
                <img 
                  src={hbLogoWhite} 
                  alt="Healing Buds" 
                  className="h-8 mx-auto mb-4"
                />
                <span className="text-5xl mb-3 block">{region.flag}</span>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {region.name} Launch
                </h2>
                <p className="text-sm text-gray-400">
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
                    <p className="text-gray-400 text-sm mb-6">
                      We'll send you an email as soon as Healing Buds launches in {region.name}.
                    </p>
                    <Button onClick={handleClose} variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
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
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-teal-500"
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
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-teal-500"
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
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-teal-500"
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
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white mt-2"
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

### 4b. Create `src/pages/GlobalLanding.tsx` (or `src/pages/Index.tsx`)

```tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RegionSignupModal } from '@/components/RegionSignupModal';
import hbLogoWhite from '@/assets/hb-logo-white-full.png';

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
        <p className="text-gray-400 text-sm mb-6 flex-grow">
          {region.description}
        </p>

        {/* Action Button */}
        <Button
          onClick={handleClick}
          className={`w-full group/btn ${
            isLive
              ? 'bg-teal-600 hover:bg-teal-700'
              : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white cursor-pointer'
          }`}
        >
          {isLive ? 'Enter' : 'Get Notified'}
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
        </Button>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/10 to-transparent" />
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
            src={hbLogoWhite}
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
              <Globe className="w-4 h-4 text-teal-400" />
              <span className="text-sm text-white/80">Global Network</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Select Your Region
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
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

## 📦 Step 5: Update App.tsx

Make the GlobalLanding page the main route:

```tsx
import { Toaster } from "@/components/ui/sonner";
import GlobalLanding from "./pages/GlobalLanding";

function App() {
  return (
    <>
      <Toaster />
      <GlobalLanding />
    </>
  );
}

export default App;
```

---

## 🎨 Design Tokens

Add these CSS variables to your `index.css` for consistent branding:

```css
:root {
  /* Healing Buds Brand Colors */
  --hb-teal: 166 54% 36%;
  --hb-dark-green: 160 26% 14%;
  --hb-accent: 166 70% 45%;
  
  /* Background */
  --background: var(--hb-dark-green);
  --foreground: 0 0% 98%;
  
  /* Primary */
  --primary: var(--hb-teal);
  --primary-foreground: 0 0% 98%;
}
```

---

## ✅ What You Get

1. **GlobalLanding page** - Region selection portal with animated cards
2. **RegionSignupModal** - Lead capture modal for Coming Soon regions
3. **Database table** - `launch_interest` for storing leads
4. **Brand consistency** - Uses the correct full Healing Buds logo

---

## 🔧 Customization

### Add New Regions
Edit the `regions` array in `GlobalLanding.tsx`:

```tsx
{
  code: 'DE',
  name: 'Germany',
  flag: '🇩🇪',
  status: 'coming-soon',
  statusLabel: 'Coming Soon',
  description: 'German medical cannabis services launching soon',
  url: 'https://healingbuds.de',
}
```

### Change Status to Live
Simply change `status: 'coming-soon'` to `status: 'live'` and the card will redirect instead of showing the signup modal.
