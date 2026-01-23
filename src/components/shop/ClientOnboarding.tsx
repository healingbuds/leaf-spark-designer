import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { buildLegacyClientPayload } from '@/lib/drgreenApi';
import { 
  isMockModeEnabled, 
  createMockClientResponse, 
  simulateApiDelay,
  getMockModeStatus 
} from '@/lib/mockMode';
import {
  User,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Mail,
  Clock,
  Camera,
  FileWarning,
  Heart,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useShop } from '@/context/ShopContext';
import { useKycJourneyLog } from '@/hooks/useKycJourneyLog';
import { useIsMobile } from '@/hooks/use-mobile';
import { TappableYesNo } from './TappableYesNo';
import { ConditionChips } from './ConditionChips';

// ==================== HELPERS ====================

const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const validPostalZones: Record<string, { pattern: RegExp; description: string }> = {
  PT: { pattern: /^\d{4}(-\d{3})?$/, description: 'Portuguese postal codes (e.g., 1000-001)' },
  ZA: { pattern: /^(0[1-9]\d{2}|1[0-8]\d{2}|19[0-5]\d|[2-9]\d{3})$/, description: 'South African postal codes (0100-9999)' },
  TH: { pattern: /^10[0-9]{3}$/, description: 'Bangkok area postal codes only (10XXX)' },
  GB: { pattern: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, description: 'UK postal codes' },
};

const legalAgeByCountry: Record<string, number> = {
  PT: 18, GB: 18, ZA: 18, TH: 20, US: 21,
};

const getMinimumAge = (countryCode: string): number => legalAgeByCountry[countryCode] || 21;

// ==================== SCHEMAS ====================

const step1Schema = z.object({
  // Personal
  firstName: z.string().min(2, 'First name required').max(50),
  lastName: z.string().min(2, 'Last name required').max(50),
  email: z.string().email('Invalid email').max(255),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(20),
  dateOfBirth: z.string().min(1, 'Date of birth required'),
  gender: z.string().min(1, 'Please select gender'),
  // Address
  country: z.string().min(2, 'Country required'),
  street: z.string().min(5, 'Street address required').max(200),
  city: z.string().min(2, 'City required').max(100),
  postalCode: z.string().min(4, 'Postal code required'),
});

const step2Schema = z.object({
  heartProblems: z.enum(['yes', 'no'], { required_error: 'Please answer this question' }),
  psychosisHistory: z.enum(['yes', 'no'], { required_error: 'Please answer this question' }),
  cannabisReaction: z.enum(['yes', 'no'], { required_error: 'Please answer this question' }),
});

const step3Schema = z.object({
  conditions: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  medicalHistory13: z.string().default('never'),
  medicalHistory14: z.array(z.string()).default(['never']),
  otherMedicalCondition: z.string().max(500).optional(),
  otherMedicalTreatments: z.string().max(500).optional(),
  prescriptionsSupplements: z.string().max(1000).optional(),
});

const step4Schema = z.object({
  doctorApproval: z.boolean().refine(val => val === true, 'Healthcare consultation required'),
  consent: z.boolean().refine(val => val, 'Consent required'),
  isBusiness: z.boolean().default(false),
  businessType: z.string().optional(),
  businessName: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type Step4Data = z.infer<typeof step4Schema>;

// ==================== CONSTANTS ====================

const steps = [
  { id: 'identity', title: 'Your Details', icon: User },
  { id: 'safety', title: 'Safety Check', icon: ShieldCheck },
  { id: 'medical', title: 'Medical Profile', icon: Heart },
  { id: 'consent', title: 'Complete', icon: CheckCircle2 },
];

const countries = [
  { code: 'PT', name: 'Portugal' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'TH', name: 'Thailand' },
  { code: 'GB', name: 'United Kingdom' },
];

const businessTypes = [
  { value: 'dispensary', label: 'Dispensary' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'other', label: 'Other' },
];

// Top 8 most common conditions for quick selection
const topConditions = [
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'chronic_and_long_term_pain', label: 'Chronic Pain' },
  { value: 'depression', label: 'Depression' },
  { value: 'sleep_disorders', label: 'Sleep Issues' },
  { value: 'back_and_neck_pain', label: 'Back Pain' },
  { value: 'arthritis', label: 'Arthritis' },
  { value: 'migraine', label: 'Migraine' },
  { value: 'post_traumatic_stress_disorder', label: 'PTSD' },
];

const allConditions = [
  ...topConditions,
  { value: 'adhd', label: 'ADHD' },
  { value: 'fibromyalgia', label: 'Fibromyalgia' },
  { value: 'epilepsy', label: 'Epilepsy' },
  { value: 'multiple_sclerosis_pain_and_muscle_spasm', label: 'Multiple Sclerosis' },
  { value: 'nerve_pain', label: 'Nerve Pain' },
  { value: 'endometriosis', label: 'Endometriosis' },
  { value: 'irritable_bowel_syndrome', label: 'IBS' },
  { value: 'parkinsons_disease', label: "Parkinson's" },
  { value: 'bipolar', label: 'Bipolar' },
  { value: 'ocd', label: 'OCD' },
  { value: 'chronic_fatigue_syndrome', label: 'Chronic Fatigue' },
  { value: 'sciatica', label: 'Sciatica' },
  { value: 'tourette_syndrome', label: 'Tourette Syndrome' },
  { value: 'other_medical_condition', label: 'Other' },
];

const topMedications = [
  { value: 'gabapentin', label: 'Gabapentin' },
  { value: 'amitriptyline', label: 'Amitriptyline' },
  { value: 'codeine', label: 'Codeine' },
  { value: 'tramadol', label: 'Tramadol' },
  { value: 'diazepam', label: 'Diazepam' },
  { value: 'sertraline', label: 'Sertraline' },
];

const allMedications = [
  ...topMedications,
  { value: 'fluoxetine', label: 'Fluoxetine' },
  { value: 'mirtazapine', label: 'Mirtazapine' },
  { value: 'morphine', label: 'Morphine' },
  { value: 'oxycodone', label: 'Oxycodone' },
  { value: 'naproxen', label: 'Naproxen' },
  { value: 'diclofenac', label: 'Diclofenac' },
  { value: 'venlafaxine', label: 'Venlafaxine' },
  { value: 'lorazepam', label: 'Lorazepam' },
  { value: 'zolpidem', label: 'Zolpidem' },
  { value: 'zopiclone', label: 'Zopiclone' },
  { value: 'melatonin', label: 'Melatonin' },
  { value: 'other_prescribed_medicines_treatments', label: 'Other' },
];

const cannabisUsageOptions = [
  { value: 'never', label: 'Never used' },
  { value: '1_2_times_per_week', label: '1-2 times/week' },
  { value: 'every_other_day', label: 'Every other day' },
  { value: 'everyday', label: 'Daily' },
];

const cannabisMethodOptions = [
  { value: 'never', label: 'Never' },
  { value: 'vaporizing', label: 'Vaporizing' },
  { value: 'ingestion', label: 'Oils/Edibles' },
  { value: 'smoking_joints', label: 'Smoking' },
  { value: 'topical', label: 'Topical' },
];

// ==================== COMPONENT ====================

export function ClientOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [kycLinkReceived, setKycLinkReceived] = useState<boolean | null>(null);
  const [storedClientId, setStoredClientId] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [kycProgress, setKycProgress] = useState(0);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    step1?: Step1Data;
    step2?: Step2Data;
    step3?: Step3Data;
    step4?: Step4Data;
  }>({});
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { refreshClient } = useShop();
  const { logEvent } = useKycJourneyLog();
  const isMobile = useIsMobile();
  
  // Refs for focus management
  const firstInputRef = useRef<HTMLInputElement>(null);
  const firstYesNoRef = useRef<HTMLDivElement>(null);
  const firstChipsRef = useRef<HTMLDivElement>(null);
  const firstCheckboxRef = useRef<HTMLButtonElement>(null);

  // Check existing registration
  useEffect(() => {
    const checkExisting = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existingClient } = await supabase
        .from('drgreen_clients')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingClient) {
        navigate('/patient-dashboard');
        return;
      }
    };
    checkExisting();
    logEvent('registration.started', 'pending', { step: 0 });
  }, [navigate, logEvent]);

  // Forms - must be defined before effects that use them
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: formData.step1 || {
      firstName: '', lastName: '', email: '', phone: '',
      dateOfBirth: '', gender: '',
      country: 'PT', street: '', city: '', postalCode: '',
    },
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: formData.step2 || {},
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: formData.step3 || {
      conditions: [], medications: [],
      medicalHistory13: 'never', medicalHistory14: ['never'],
    },
  });

  const step4Form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: formData.step4 || {
      doctorApproval: false, consent: false, isBusiness: false,
    },
  });

  const selectedCountry = step1Form.watch('country') || 'PT';
  const minimumAge = getMinimumAge(selectedCountry);

  // ==================== HANDLERS ====================

  const handleStep1Submit = (data: Step1Data) => {
    // Age validation
    const age = calculateAge(data.dateOfBirth);
    if (age < minimumAge) {
      navigate('/not-eligible', { state: { reason: 'age', minimumAge } });
      return;
    }
    // Postal validation
    const zone = validPostalZones[data.country];
    if (zone && !zone.pattern.test(data.postalCode.trim())) {
      navigate('/not-eligible', { state: { reason: 'postal', country: data.country } });
      return;
    }
    setFormData(prev => ({ ...prev, step1: data }));
    logEvent('registration.step_completed', 'pending', { step: 0 });
    setCurrentStep(1);
  };

  const handleStep2Submit = useCallback((data: Step2Data) => {
    setFormData(prev => ({ ...prev, step2: data }));
    logEvent('registration.step_completed', 'pending', { step: 1 });
    setCurrentStep(2);
  }, [logEvent]);

  // Auto-focus on step transitions (desktop only - mobile-first approach)
  useEffect(() => {
    // Skip on mobile to prevent keyboard popup
    if (isMobile) return;
    
    const timer = setTimeout(() => {
      switch (currentStep) {
        case 0:
          firstInputRef.current?.focus();
          break;
        case 1:
          // Focus first TappableYesNo
          const firstRadio = firstYesNoRef.current?.querySelector<HTMLButtonElement>('button[role="radio"]');
          firstRadio?.focus();
          break;
        case 2:
          // Focus first chip in conditions
          const firstChip = document.querySelector<HTMLButtonElement>('[role="listbox"] button[role="option"]');
          firstChip?.focus();
          break;
        case 3:
          // Focus first checkbox
          firstCheckboxRef.current?.focus();
          break;
      }
    }, 300); // After framer-motion animation completes

    return () => clearTimeout(timer);
  }, [currentStep, isMobile]);

  // Auto-advance on Step 2 when all questions are answered
  const step2Values = step2Form.watch();
  const step2HandleSubmit = step2Form.handleSubmit;
  
  useEffect(() => {
    // Only auto-advance if all 3 questions are answered and we're on step 2
    if (currentStep !== 1) return;
    
    const { heartProblems, psychosisHistory, cannabisReaction } = step2Values;
    if (heartProblems && psychosisHistory && cannabisReaction) {
      // All answered - submit after a brief delay for user feedback
      const timer = setTimeout(() => {
        step2HandleSubmit(handleStep2Submit)();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [step2Values, currentStep, step2HandleSubmit, handleStep2Submit]);

  const handleStep3Submit = (data: Step3Data) => {
    setFormData(prev => ({ ...prev, step3: data }));
    logEvent('registration.step_completed', 'pending', { step: 2 });
    setCurrentStep(3);
  };

  const handleStep4Submit = async (data: Step4Data) => {
    setFormData(prev => ({ ...prev, step4: data }));
    logEvent('registration.submitted', 'pending', { countryCode: formData.step1?.country });
    setIsSubmitting(true);
    setDocumentError(null);
    setKycStatus('verifying');
    setKycProgress(0);

    const progressInterval = setInterval(() => {
      setKycProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        clearInterval(progressInterval);
        setKycStatus('idle');
        toast({ title: 'Please sign in', variant: 'destructive' });
        return;
      }

      // Build legacy payload from combined form data
      const legacyPayload = buildLegacyClientPayload({
        personal: {
          firstName: formData.step1!.firstName,
          lastName: formData.step1!.lastName,
          email: formData.step1!.email,
          phone: formData.step1!.phone,
          dateOfBirth: formData.step1!.dateOfBirth,
          gender: formData.step1!.gender,
        },
        address: {
          street: formData.step1!.street,
          city: formData.step1!.city,
          postalCode: formData.step1!.postalCode,
          country: formData.step1!.country,
        },
        business: data.isBusiness ? {
          isBusiness: true,
          businessType: data.businessType,
          businessName: data.businessName,
        } : undefined,
        medicalHistory: {
          heartProblems: formData.step2!.heartProblems,
          psychosisHistory: formData.step2!.psychosisHistory,
          cannabisReaction: formData.step2!.cannabisReaction,
          conditions: formData.step3!.conditions,
          medications: formData.step3!.medications,
          medicalHistory13: formData.step3!.medicalHistory13,
          medicalHistory14: formData.step3!.medicalHistory14,
          otherMedicalCondition: formData.step3!.otherMedicalCondition,
          otherMedicalTreatments: formData.step3!.otherMedicalTreatments,
          prescriptionsSupplements: formData.step3!.prescriptionsSupplements,
        },
      });

      console.log('[Registration] Payload:', JSON.stringify(legacyPayload, null, 2));

      let clientId = `local-${Date.now()}`;
      let kycLink = null;
      let apiSuccess = false;

      const mockStatus = getMockModeStatus();
      if (mockStatus.enabled) {
        console.log('[Registration] Mock mode enabled');
      }

      try {
        if (isMockModeEnabled()) {
          await simulateApiDelay(800, 1500);
          const mockResponse = createMockClientResponse({
            email: formData.step1?.email || '',
            firstName: formData.step1?.firstName || '',
            lastName: formData.step1?.lastName || '',
            countryCode: formData.step1?.country || 'PT',
          });
          clientId = mockResponse.clientId;
          kycLink = mockResponse.kycLink;
          apiSuccess = true;
          toast({ title: '🎭 Mock Mode', description: 'Registration simulated.' });
        } else {
          const { data: result, error } = await supabase.functions.invoke('drgreen-proxy', {
            body: { action: 'create-client-legacy', payload: legacyPayload },
          });

          console.log('[Registration] API Response:', result);

          if (error?.context?.status === 422) {
            clearInterval(progressInterval);
            setKycStatus('error');
            setDocumentError('document_quality');
            setIsSubmitting(false);
            return;
          }

          if (!error && result?.clientId) {
            clientId = result.clientId;
            kycLink = result.kycLink || null;
            apiSuccess = true;
          } else if (error || result?.error) {
            // API call failed - show error but continue with local save
            const errorMsg = error?.message || result?.message || result?.error || 'Registration issue';
            console.error('[Registration] API error:', errorMsg);
            toast({ 
              title: 'Registration saved locally', 
              description: 'Our team will contact you to complete verification.',
            });
          }
        }
      } catch (apiError: any) {
        console.error('[Registration] API Error:', apiError);
        if (apiError?.status === 422) {
          clearInterval(progressInterval);
          setKycStatus('error');
          setDocumentError('document_quality');
          setIsSubmitting(false);
          return;
        }
        toast({ title: 'Saved locally', description: 'Our team will contact you.' });
      }

      clearInterval(progressInterval);
      setKycProgress(100);

      // Save to database
      await supabase.from('drgreen_clients').upsert({
        user_id: user.id,
        drgreen_client_id: clientId,
        country_code: formData.step1?.country || 'PT',
        is_kyc_verified: false,
        admin_approval: 'PENDING',
        kyc_link: kycLink,
        email: formData.step1?.email || null,
        full_name: `${formData.step1?.firstName} ${formData.step1?.lastName}`.trim(),
      }, { onConflict: 'user_id' });

      await refreshClient();
      setStoredClientId(clientId);
      setKycLinkReceived(!!kycLink);
      setKycStatus('success');
      setCurrentStep(4);

      // Send emails
      try {
        await supabase.functions.invoke('send-client-email', {
          body: {
            type: 'welcome',
            email: formData.step1?.email,
            name: `${formData.step1?.firstName} ${formData.step1?.lastName}`,
            region: formData.step1?.country || 'global',
            clientId,
          },
        });
      } catch (e) {
        console.warn('[Registration] Email failed:', e);
      }

      toast({
        title: apiSuccess ? 'Registration complete! ✓' : 'Registration saved',
        description: apiSuccess 
          ? 'Check your email for verification instructions.' 
          : 'Our team will contact you shortly.',
      });
    } catch (error) {
      clearInterval(progressInterval);
      setKycStatus('idle');
      console.error('Registration error:', error);
      toast({ title: 'Error', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const retrySubmission = () => {
    setDocumentError(null);
    setKycStatus('idle');
    if (formData.step4) handleStep4Submit(formData.step4);
  };

  const retryKycLink = async () => {
    setIsRetrying(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: result, error } = await supabase.functions.invoke('drgreen-proxy', {
        body: {
          action: 'request-kyc-link',
          data: { clientId: storedClientId },
        },
      });

      if (!error && result?.kycLink) {
        await supabase.from('drgreen_clients')
          .update({ kyc_link: result.kycLink })
          .eq('user_id', user.id);
        setKycLinkReceived(true);
        toast({ title: 'Verification link sent!', description: 'Check your email.' });
      } else {
        toast({ title: 'Still processing', description: 'Contact support if needed.' });
      }
    } catch {
      toast({ title: 'Still processing', description: 'Contact support if needed.' });
    } finally {
      setIsRetrying(false);
    }
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // ==================== RENDER ====================

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between mb-3">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                idx < currentStep ? 'bg-primary text-primary-foreground' :
                idx === currentStep ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                'bg-muted text-muted-foreground'
              }`}>
                {idx < currentStep ? <CheckCircle2 className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
              </div>
              <span className={`text-xs mt-2 text-center hidden sm:block ${
                idx <= currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
        <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-1.5" />
      </div>

      <AnimatePresence mode="wait">
        {/* ==================== STEP 1: Identity + Address ==================== */}
        {currentStep === 0 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5 text-primary" />
                  Your Details
                </CardTitle>
                <p className="text-sm text-muted-foreground">We need some basic information to get started</p>
              </CardHeader>
              <CardContent>
                <Form {...step1Form}>
                  <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-5">
                    {/* Name row */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={step1Form.control} name="firstName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input 
                              ref={firstInputRef} 
                              placeholder="John" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={step1Form.control} name="lastName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    {/* Contact row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={step1Form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={step1Form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl><Input placeholder="+351 912 345 678" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    {/* DOB + Gender row */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={step1Form.control} name="dateOfBirth" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              max={new Date(new Date().setFullYear(new Date().getFullYear() - minimumAge)).toISOString().split('T')[0]}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={step1Form.control} name="gender" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    {/* Divider */}
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> Shipping Address
                        </span>
                      </div>
                    </div>

                    {/* Country */}
                    <FormField control={step1Form.control} name="country" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {countries.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Street */}
                    <FormField control={step1Form.control} name="street" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl><Input placeholder="123 Main Street, Apt 4" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* City + Postal */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={step1Form.control} name="city" render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl><Input placeholder="Lisbon" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={step1Form.control} name="postalCode" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl><Input placeholder="1000-001" {...field} /></FormControl>
                          <FormMessage />
                          {validPostalZones[selectedCountry] && (
                            <p className="text-xs text-muted-foreground">{validPostalZones[selectedCountry].description}</p>
                          )}
                        </FormItem>
                      )} />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      You must be at least {minimumAge} years old in {countries.find(c => c.code === selectedCountry)?.name}
                    </p>

                    <Button type="submit" className="w-full" size="lg">
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ==================== STEP 2: Safety Screening ==================== */}
        {currentStep === 1 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Safety Screening
                </CardTitle>
                <p className="text-sm text-muted-foreground">Three quick questions for your safety</p>
              </CardHeader>
              <CardContent>
                <Form {...step2Form}>
                  <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-4">
                    <FormField control={step2Form.control} name="heartProblems" render={({ field }) => (
                      <FormItem>
                        <TappableYesNo
                          ref={firstYesNoRef}
                          question="Do you have a history of heart problems?"
                          description="Including palpitations, heart attack, stroke, angina, or pacemaker"
                          value={field.value}
                          onChange={field.onChange}
                          variant="warning"
                          required
                          showYesWarning
                        />
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={step2Form.control} name="psychosisHistory" render={({ field }) => (
                      <FormItem>
                        <TappableYesNo
                          question="Do you have a history of psychosis or schizophrenia?"
                          description="Including family history of these conditions"
                          value={field.value}
                          onChange={field.onChange}
                          variant="warning"
                          required
                          showYesWarning
                        />
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={step2Form.control} name="cannabisReaction" render={({ field }) => (
                      <FormItem>
                        <TappableYesNo
                          question="Have you ever had an adverse reaction to cannabis?"
                          description="Severe anxiety, paranoia, allergic reactions, or other negative responses"
                          value={field.value}
                          onChange={field.onChange}
                          variant="warning"
                          required
                          showYesWarning
                        />
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Keyboard hint for desktop users */}
                    {!isMobile && (
                      <p className="text-xs text-muted-foreground text-center">
                        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">←</kbd>
                        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono ml-1">→</kbd>
                        <span className="ml-2">to select • Auto-advances when complete</span>
                      </p>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="outline" onClick={goBack} className="flex-1 min-h-[44px]">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      <Button type="submit" className="flex-1 min-h-[44px]" size="lg">
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ==================== STEP 3: Medical Profile ==================== */}
        {currentStep === 2 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Heart className="h-5 w-5 text-primary" />
                  Medical Profile
                </CardTitle>
                <p className="text-sm text-muted-foreground">Tell us about your health so we can help you better</p>
              </CardHeader>
              <CardContent>
                <Form {...step3Form}>
                  <form onSubmit={step3Form.handleSubmit(handleStep3Submit)} className="space-y-6">
                    {/* Conditions */}
                    <FormField control={step3Form.control} name="conditions" render={({ field }) => (
                      <FormItem>
                        <ConditionChips
                          title="Medical Conditions"
                          description="Select conditions you've been diagnosed with"
                          options={allConditions}
                          selectedValues={field.value || []}
                          onChange={field.onChange}
                          maxVisible={8}
                        />
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Other condition text */}
                    {step3Form.watch('conditions')?.includes('other_medical_condition') && (
                      <FormField control={step3Form.control} name="otherMedicalCondition" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Please describe your condition</FormLabel>
                          <FormControl><Input placeholder="Enter condition..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}

                    {/* Medications - Collapsible */}
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" type="button" className="w-full justify-between p-4 h-auto border border-border/50 rounded-xl hover:bg-muted/30">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Current Medications</span>
                            {(step3Form.watch('medications')?.length || 0) > 0 && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {step3Form.watch('medications')?.length} selected
                              </span>
                            )}
                          </div>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-4">
                        <FormField control={step3Form.control} name="medications" render={({ field }) => (
                          <FormItem>
                            <ConditionChips
                              options={allMedications}
                              selectedValues={field.value || []}
                              onChange={field.onChange}
                              maxVisible={6}
                            />
                            <FormMessage />
                          </FormItem>
                        )} />
                        {step3Form.watch('medications')?.includes('other_prescribed_medicines_treatments') && (
                          <FormField control={step3Form.control} name="otherMedicalTreatments" render={({ field }) => (
                            <FormItem className="mt-3">
                              <FormLabel>Other medications</FormLabel>
                              <FormControl><Input placeholder="Enter medications..." {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Cannabis history */}
                    <div className="space-y-4 p-4 bg-muted/20 rounded-xl border border-border/50">
                      <h4 className="font-semibold">Cannabis History</h4>
                      
                      <FormField control={step3Form.control} name="medicalHistory13" render={({ field }) => (
                        <FormItem>
                          <FormLabel>How often do you use cannabis?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {cannabisUsageOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={step3Form.control} name="medicalHistory14" render={({ field }) => (
                        <FormItem>
                          <FormLabel>How have you used cannabis?</FormLabel>
                          <div className="flex flex-wrap gap-2">
                            {cannabisMethodOptions.map(method => {
                              const isSelected = field.value?.includes(method.value);
                              return (
                                <button
                                  key={method.value}
                                  type="button"
                                  onClick={() => {
                                    const current = field.value || [];
                                    if (method.value === 'never') {
                                      field.onChange(['never']);
                                    } else if (isSelected) {
                                      const newVal = current.filter(v => v !== method.value);
                                      field.onChange(newVal.length ? newVal : ['never']);
                                    } else {
                                      field.onChange([...current.filter(v => v !== 'never'), method.value]);
                                    }
                                  }}
                                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                                    isSelected
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-muted/50 hover:bg-muted border border-border/50'
                                  }`}
                                >
                                  {method.label}
                                </button>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    {/* Additional notes - Collapsible */}
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" type="button" className="w-full justify-between p-4 h-auto border border-border/50 rounded-xl hover:bg-muted/30">
                          <span className="font-semibold">Additional Notes (Optional)</span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-4">
                        <FormField control={step3Form.control} name="prescriptionsSupplements" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current prescriptions & supplements</FormLabel>
                            <FormControl>
                              <Textarea placeholder="List any prescriptions, supplements, or CBD products..." className="min-h-[80px]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </CollapsibleContent>
                    </Collapsible>

                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="outline" onClick={goBack} className="flex-1">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      <Button type="submit" className="flex-1" size="lg">
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ==================== STEP 4: Consent & Submit ==================== */}
        {currentStep === 3 && kycStatus === 'idle' && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Almost Done!
                </CardTitle>
                <p className="text-sm text-muted-foreground">Confirm your consent to complete registration</p>
              </CardHeader>
              <CardContent>
                <Form {...step4Form}>
                  <form onSubmit={step4Form.handleSubmit(handleStep4Submit)} className="space-y-5">
                    <FormField control={step4Form.control} name="doctorApproval" render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0 p-4 rounded-xl border-2 border-primary/20 bg-primary/5">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-medium cursor-pointer">
                            I have discussed medical cannabis with my healthcare provider
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">Required for patient safety</p>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={step4Form.control} name="consent" render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0 p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-normal cursor-pointer">
                            I consent to the processing of my medical information
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">In accordance with GDPR and medical data protection regulations</p>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Business toggle */}
                    <Collapsible>
                      <FormField control={step4Form.control} name="isBusiness" render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0 p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel className="font-normal cursor-pointer flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              I am registering as a business
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">Dispensary, clinic, or pharmacy</p>
                          </div>
                        </FormItem>
                      )} />
                      
                      {step4Form.watch('isBusiness') && (
                        <CollapsibleContent className="pt-4 space-y-4">
                          <FormField control={step4Form.control} name="businessType" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  {businessTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={step4Form.control} name="businessName" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Name</FormLabel>
                              <FormControl><Input placeholder="Your Company Ltd" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </CollapsibleContent>
                      )}
                    </Collapsible>

                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="outline" onClick={goBack} className="flex-1" disabled={isSubmitting}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      <Button type="submit" className="flex-1" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                        ) : (
                          <>Complete Registration <CheckCircle2 className="ml-2 h-4 w-4" /></>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ==================== VERIFYING STATE ==================== */}
        {currentStep === 3 && kycStatus === 'verifying' && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <Card className="max-w-md w-full mx-4 bg-card/95 border-border/50">
              <CardContent className="pt-8 pb-8 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6"
                >
                  <ShieldCheck className="h-10 w-10 text-primary" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Verifying Your Details</h2>
                <p className="text-muted-foreground mb-6">This usually takes a few moments...</p>
                <Progress value={kycProgress} className="h-2" />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ==================== DOCUMENT ERROR STATE ==================== */}
        {currentStep === 3 && documentError === 'document_quality' && (
          <motion.div
            key="document-error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-destructive/30">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                  <FileWarning className="h-10 w-10 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-destructive">Document Issue</h2>
                <p className="text-muted-foreground mb-6">We couldn't process your submission.</p>
                <div className="bg-muted/30 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Camera className="h-4 w-4" /> Tips for success:
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Ensure ID photo is clear and not blurry</li>
                    <li>• Use good lighting — avoid glare or shadows</li>
                    <li>• All corners of the document should be visible</li>
                  </ul>
                </div>
                <Button onClick={retrySubmission} className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ==================== COMPLETE STATE ==================== */}
        {currentStep === 4 && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 text-center">
              <CardContent className="pt-8 pb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Registration Complete!</h2>
                
                {kycLinkReceived ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <Mail className="h-5 w-5" />
                      <p className="text-muted-foreground">Check your email for verification instructions.</p>
                    </div>
                    <Button onClick={() => navigate('/patient-dashboard')}>Go to Dashboard</Button>
                  </div>
                ) : storedClientId?.startsWith('local-') ? (
                  // Local ID - team will contact manually
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-amber-600" />
                        <span className="font-medium text-amber-700 dark:text-amber-400">Registration saved</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your registration was saved locally. Our team will contact you within 24-48 hours to complete your verification.
                      </p>
                    </div>
                    <Button onClick={() => navigate('/patient-dashboard')}>Go to Dashboard</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-amber-600" />
                        <span className="font-medium text-amber-700 dark:text-amber-400">Verification pending</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Your registration was saved. We're preparing your verification link.
                      </p>
                      <Button variant="outline" onClick={retryKycLink} disabled={isRetrying} className="w-full">
                        {isRetrying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        Request Verification Link
                      </Button>
                    </div>
                    <Button onClick={() => navigate('/patient-dashboard')}>Go to Dashboard</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
