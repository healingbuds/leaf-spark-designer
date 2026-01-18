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
    // Clear error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
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
        // Check for duplicate email
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
    // Reset state on close
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
