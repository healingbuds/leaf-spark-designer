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
import hbLogo from '@/assets/hb-logo-white-full.png';

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
          // Unique constraint violation
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
        
        {/* Grain texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

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

            {/* Footer - Access to operational region */}
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
