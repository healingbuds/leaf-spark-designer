import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

// Validation schemas for each step
const step1Schema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be less than 50 characters'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  phone: z.string().trim().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number must be less than 15 digits'),
  dateOfBirth: z.date().refine((date) => {
    const age = new Date().getFullYear() - date.getFullYear();
    return age >= 18;
  }, 'You must be at least 18 years old'),
});

const step2Schema = z.object({
  conditions: z.array(z.string()).min(1, 'Please select at least one condition'),
  otherCondition: z.string().max(200, 'Description must be less than 200 characters').optional(),
  symptoms: z.string().trim().min(10, 'Please provide details about your symptoms').max(500, 'Description must be less than 500 characters'),
});

const step3Schema = z.object({
  previousCannabisUse: z.enum(['yes', 'no']),
  currentMedications: z.string().max(500, 'Description must be less than 500 characters').optional(),
  allergies: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

const step4Schema = z.object({
  consent: z.boolean().refine((val) => val === true, 'You must provide consent to continue'),
  privacyAcknowledgment: z.boolean().refine((val) => val === true, 'You must acknowledge the privacy policy'),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type Step4Data = z.infer<typeof step4Schema>;

interface EligibilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const medicalConditions = [
  'Chronic Pain',
  'Anxiety',
  'Depression',
  'PTSD',
  'Insomnia',
  'Cancer-related symptoms',
  'Epilepsy/Seizures',
  'Multiple Sclerosis',
  'Other (please specify)',
];

const EligibilityDialog = ({ open, onOpenChange }: EligibilityDialogProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Step1Data & Step2Data & Step3Data & Step4Data>>({});
  const [isEligible, setIsEligible] = useState<boolean | null>(null);

  // Step 1 form
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: formData as Step1Data,
  });

  // Step 2 form
  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: formData as Step2Data,
  });

  // Step 3 form
  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: formData as Step3Data,
  });

  // Step 4 form
  const step4Form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: formData as Step4Data,
  });

  const handleStep1Submit = (data: Step1Data) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(2);
  };

  const handleStep2Submit = (data: Step2Data) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(3);
  };

  const handleStep3Submit = (data: Step3Data) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(4);
  };

  const handleStep4Submit = (data: Step4Data) => {
    const finalData = { ...formData, ...data };
    
    // Determine eligibility (basic logic - can be enhanced)
    const eligible = finalData.dateOfBirth && 
                     (new Date().getFullYear() - finalData.dateOfBirth.getFullYear()) >= 18 &&
                     finalData.conditions && 
                     finalData.conditions.length > 0 &&
                     finalData.consent === true;
    
    setIsEligible(eligible);
    setCurrentStep(5);

    toast({
      title: eligible ? "Application Submitted" : "More Information Needed",
      description: eligible 
        ? "Thank you for your application. Our team will review and contact you shortly."
        : "Based on the information provided, we need additional verification. Our team will contact you.",
    });
  };

  const handleBack = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({});
    setIsEligible(null);
    step1Form.reset();
    step2Form.reset();
    step3Form.reset();
    step4Form.reset();
    onOpenChange(false);
  };

  const renderProgressBar = () => (
    <div className="flex items-center justify-between mb-6 sm:mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center flex-1">
          <div
            className={cn(
              "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-pharma font-semibold transition-all duration-200",
              currentStep >= step
                ? "bg-pharma-green text-white"
                : "bg-pharma-grey-light text-pharma-grey"
            )}
          >
            {step}
          </div>
          {step < 4 && (
            <div
              className={cn(
                "flex-1 h-1 mx-1 sm:mx-2 rounded transition-all duration-200",
                currentStep > step ? "bg-pharma-green" : "bg-pharma-grey-light"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-pharma text-2xl text-pharma-charcoal">
            Medical Cannabis Eligibility Assessment
          </DialogTitle>
          <DialogDescription className="font-body text-pharma-grey">
            Please complete all steps to determine your eligibility for medical cannabis treatment.
          </DialogDescription>
        </DialogHeader>

        {currentStep <= 4 && renderProgressBar()}

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-pharma text-lg font-semibold text-pharma-charcoal">Personal Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="font-body">First Name *</Label>
                  <Input
                    id="firstName"
                    {...step1Form.register('firstName')}
                    className="font-body"
                  />
                  {step1Form.formState.errors.firstName && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="font-body">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...step1Form.register('lastName')}
                    className="font-body"
                  />
                  {step1Form.formState.errors.lastName && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-body">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...step1Form.register('email')}
                  className="font-body"
                />
                {step1Form.formState.errors.email && (
                  <p className="text-sm text-destructive">{step1Form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="font-body">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...step1Form.register('phone')}
                  className="font-body"
                />
                {step1Form.formState.errors.phone && (
                  <p className="text-sm text-destructive">{step1Form.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-body">Date of Birth *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-body",
                        !step1Form.watch('dateOfBirth') && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {step1Form.watch('dateOfBirth') ? (
                        format(step1Form.watch('dateOfBirth'), "PPP")
                      ) : (
                        <span>Select your date of birth</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={step1Form.watch('dateOfBirth')}
                      onSelect={(date) => step1Form.setValue('dateOfBirth', date as Date)}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      captionLayout="dropdown-buttons"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
                {step1Form.formState.errors.dateOfBirth && (
                  <p className="text-sm text-destructive">{step1Form.formState.errors.dateOfBirth.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="font-pharma font-semibold">
                Next Step
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Medical Information */}
        {currentStep === 2 && (
          <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-pharma text-lg font-semibold text-pharma-charcoal">Medical Information</h3>
              
              <div className="space-y-3">
                <Label className="font-body">Medical Conditions (Select all that apply) *</Label>
                {medicalConditions.map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition}
                      onCheckedChange={(checked) => {
                        const currentConditions = step2Form.getValues('conditions') || [];
                        if (checked) {
                          step2Form.setValue('conditions', [...currentConditions, condition]);
                        } else {
                          step2Form.setValue(
                            'conditions',
                            currentConditions.filter((c) => c !== condition)
                          );
                        }
                      }}
                    />
                    <Label htmlFor={condition} className="font-body font-normal cursor-pointer">
                      {condition}
                    </Label>
                  </div>
                ))}
                {step2Form.formState.errors.conditions && (
                  <p className="text-sm text-destructive">{step2Form.formState.errors.conditions.message}</p>
                )}
              </div>

              {step2Form.watch('conditions')?.includes('Other (please specify)') && (
                <div className="space-y-2">
                  <Label htmlFor="otherCondition" className="font-body">Please specify other condition</Label>
                  <Input
                    id="otherCondition"
                    {...step2Form.register('otherCondition')}
                    className="font-body"
                  />
                  {step2Form.formState.errors.otherCondition && (
                    <p className="text-sm text-destructive">{step2Form.formState.errors.otherCondition.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="symptoms" className="font-body">Describe Your Symptoms *</Label>
                <Textarea
                  id="symptoms"
                  {...step2Form.register('symptoms')}
                  placeholder="Please describe your symptoms and how they affect your daily life..."
                  className="font-body min-h-32"
                />
                {step2Form.formState.errors.symptoms && (
                  <p className="text-sm text-destructive">{step2Form.formState.errors.symptoms.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleBack} className="font-pharma">
                Back
              </Button>
              <Button type="submit" className="font-pharma font-semibold">
                Next Step
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Medical History */}
        {currentStep === 3 && (
          <form onSubmit={step3Form.handleSubmit(handleStep3Submit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-pharma text-lg font-semibold text-pharma-charcoal">Medical History</h3>
              
              <div className="space-y-3">
                <Label className="font-body">Have you used medical cannabis before? *</Label>
                <RadioGroup
                  onValueChange={(value) => step3Form.setValue('previousCannabisUse', value as 'yes' | 'no')}
                  defaultValue={step3Form.watch('previousCannabisUse')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="cannabis-yes" />
                    <Label htmlFor="cannabis-yes" className="font-body font-normal cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="cannabis-no" />
                    <Label htmlFor="cannabis-no" className="font-body font-normal cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
                {step3Form.formState.errors.previousCannabisUse && (
                  <p className="text-sm text-destructive">{step3Form.formState.errors.previousCannabisUse.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentMedications" className="font-body">Current Medications</Label>
                <Textarea
                  id="currentMedications"
                  {...step3Form.register('currentMedications')}
                  placeholder="List any medications you are currently taking..."
                  className="font-body min-h-24"
                />
                {step3Form.formState.errors.currentMedications && (
                  <p className="text-sm text-destructive">{step3Form.formState.errors.currentMedications.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies" className="font-body">Allergies</Label>
                <Textarea
                  id="allergies"
                  {...step3Form.register('allergies')}
                  placeholder="List any known allergies..."
                  className="font-body min-h-24"
                />
                {step3Form.formState.errors.allergies && (
                  <p className="text-sm text-destructive">{step3Form.formState.errors.allergies.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleBack} className="font-pharma">
                Back
              </Button>
              <Button type="submit" className="font-pharma font-semibold">
                Next Step
              </Button>
            </div>
          </form>
        )}

        {/* Step 4: Consent & Acknowledgment */}
        {currentStep === 4 && (
          <form onSubmit={step4Form.handleSubmit(handleStep4Submit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-pharma text-lg font-semibold text-pharma-charcoal">Consent & Acknowledgment</h3>
              
              <div className="space-y-4 bg-pharma-grey-light/20 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent"
                    onCheckedChange={(checked) => step4Form.setValue('consent', checked as boolean)}
                  />
                  <Label htmlFor="consent" className="font-body text-sm font-normal cursor-pointer leading-relaxed">
                    I consent to the collection and processing of my personal health information for the purpose of assessing my eligibility for medical cannabis treatment. I understand that this information will be reviewed by qualified healthcare professionals.
                  </Label>
                </div>
                {step4Form.formState.errors.consent && (
                  <p className="text-sm text-destructive ml-7">{step4Form.formState.errors.consent.message}</p>
                )}

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="privacy"
                    onCheckedChange={(checked) => step4Form.setValue('privacyAcknowledgment', checked as boolean)}
                  />
                  <Label htmlFor="privacy" className="font-body text-sm font-normal cursor-pointer leading-relaxed">
                    I acknowledge that I have read and understood the privacy policy and understand how my data will be stored and used in accordance with applicable healthcare regulations.
                  </Label>
                </div>
                {step4Form.formState.errors.privacyAcknowledgment && (
                  <p className="text-sm text-destructive ml-7">{step4Form.formState.errors.privacyAcknowledgment.message}</p>
                )}
              </div>

              <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                <p className="font-body text-sm text-pharma-charcoal leading-relaxed">
                  <strong>Note:</strong> This assessment does not constitute medical advice or guarantee approval for medical cannabis treatment. A qualified healthcare professional will review your application and may contact you for additional information or consultation.
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleBack} className="font-pharma">
                Back
              </Button>
              <Button type="submit" className="font-pharma font-semibold">
                Submit Application
              </Button>
            </div>
          </form>
        )}

        {/* Step 5: Result */}
        {currentStep === 5 && (
          <div className="space-y-6 py-8">
            <div className="flex flex-col items-center text-center space-y-4">
              {isEligible ? (
                <>
                  <CheckCircle2 className="w-20 h-20 text-pharma-green" />
                  <h3 className="font-pharma text-2xl font-bold text-pharma-charcoal">
                    Application Submitted Successfully
                  </h3>
                  <p className="font-body text-pharma-grey max-w-md">
                    Thank you for completing the eligibility assessment. Based on the information provided, you may be eligible for medical cannabis treatment. Our healthcare team will review your application and contact you within 2-3 business days.
                  </p>
                  <div className="bg-pharma-green/10 border border-pharma-green/20 p-4 rounded-lg mt-4">
                    <p className="font-body text-sm text-pharma-charcoal">
                      We've sent a confirmation email to <strong>{formData.email}</strong>. Please check your inbox for next steps.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-20 h-20 text-primary" />
                  <h3 className="font-pharma text-2xl font-bold text-pharma-charcoal">
                    Additional Information Required
                  </h3>
                  <p className="font-body text-pharma-grey max-w-md">
                    Thank you for your application. Based on the information provided, we need to gather some additional details to properly assess your eligibility. Our team will contact you shortly to discuss your options.
                  </p>
                  <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg mt-4">
                    <p className="font-body text-sm text-pharma-charcoal">
                      We've sent a confirmation email to <strong>{formData.email}</strong>. A healthcare professional will reach out within 2-3 business days.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-center pt-4">
              <Button onClick={handleClose} className="font-pharma font-semibold px-8">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EligibilityDialog;
