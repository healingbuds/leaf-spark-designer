import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Stethoscope,
  FileCheck,
  Clock,
  AlertCircle
} from 'lucide-react';
import Header from "@/layout/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import BackToTop from "@/components/BackToTop";
import SEOHead from "@/components/SEOHead";
import HBIcon from "@/components/HBIcon";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ClientOnboarding } from '@/components/shop/ClientOnboarding';
import { useShop } from '@/context/ShopContext';
import { cn } from '@/lib/utils';

const eligibilityConditions = [
  'Chronic pain conditions',
  'Anxiety disorders',
  'PTSD (Post-Traumatic Stress Disorder)',
  'Multiple sclerosis',
  'Epilepsy and seizure disorders',
  'Neuropathic pain',
  'Chemotherapy-induced nausea',
  'Insomnia and sleep disorders',
  'Inflammatory conditions',
  'Other qualifying conditions (assessed case-by-case)'
];

const processSteps = [
  {
    icon: FileCheck,
    title: 'Complete Assessment',
    description: 'Fill out our medical questionnaire with your health information and qualifying conditions.'
  },
  {
    icon: Shield,
    title: 'Identity Verification',
    description: 'Complete secure KYC verification to confirm your identity and age.'
  },
  {
    icon: Stethoscope,
    title: 'Medical Review',
    description: 'Our medical team reviews your application to ensure eligibility.'
  },
  {
    icon: CheckCircle2,
    title: 'Access Granted',
    description: 'Once approved, gain full access to browse and purchase medical cannabis products.'
  }
];

const Eligibility = () => {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { drGreenClient, isEligible } = useShop();
  const navigate = useNavigate();

  const handleStartAssessment = () => {
    if (!drGreenClient) {
      navigate('/auth?redirect=/eligibility');
      return;
    }
    setShowQuestionnaire(true);
  };

  return (
    <PageTransition>
      <SEOHead 
        title="Medical Cannabis Eligibility | Healing Buds"
        description="Check your eligibility for medical cannabis treatment. Complete our secure medical assessment to access pharmaceutical-grade cannabis products."
        canonical="/eligibility"
      />
      <div className="min-h-screen bg-background">
        <Header onMenuStateChange={setMenuOpen} />
        
        <main className="pt-24 pb-16">
          {/* Hero Section */}
          <section className="relative py-16 lg:py-24 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="max-w-3xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                    <HBIcon size="sm" />
                    Secure & Confidential
                  </span>
                  <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                    Medical Cannabis Eligibility
                  </h1>
                  <p className="font-body text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Medical cannabis is available for patients with qualifying conditions. 
                    Complete our secure assessment to determine your eligibility.
                  </p>
                  
                  {/* Status Display for Existing Users */}
                  {drGreenClient && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-8"
                    >
                      {isEligible ? (
                        <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                          <div className="text-left">
                            <p className="font-semibold text-green-600 dark:text-green-400">You're Verified</p>
                            <p className="text-sm text-muted-foreground">Full access to medical cannabis products</p>
                          </div>
                          <Button asChild className="ml-4">
                            <Link to="/shop">Browse Products</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-highlight/10 border border-highlight/30">
                          <div className="w-10 h-10 rounded-full bg-highlight/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-highlight" />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-highlight">Verification Pending</p>
                            <p className="text-sm text-muted-foreground">
                              {drGreenClient.is_kyc_verified 
                                ? 'Awaiting medical review approval' 
                                : 'Please complete KYC verification'}
                            </p>
                          </div>
                          {drGreenClient.kyc_link && !drGreenClient.is_kyc_verified && (
                            <Button asChild variant="outline" className="ml-4 border-highlight/40 text-highlight hover:bg-highlight/10">
                              <a href={drGreenClient.kyc_link} target="_blank" rel="noopener noreferrer">
                                Complete KYC
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  {!drGreenClient && !showQuestionnaire && (
                    <Button 
                      size="lg" 
                      onClick={handleStartAssessment}
                      className="text-lg px-8 py-6"
                    >
                      Start Medical Assessment
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  )}
                </motion.div>
              </div>
            </div>
          </section>

          {/* Medical Questionnaire */}
          {showQuestionnaire && !drGreenClient && (
            <section className="py-8">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <ClientOnboarding />
              </div>
            </section>
          )}

          {/* Qualifying Conditions */}
          {!showQuestionnaire && (
            <section className="py-16 bg-muted/30">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                  >
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                      Qualifying Conditions
                    </h2>
                    <p className="font-body text-muted-foreground max-w-2xl mx-auto">
                      Medical cannabis may be prescribed for various conditions. 
                      The following are commonly approved qualifying conditions:
                    </p>
                  </motion.div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {eligibilityConditions.map((condition, index) => (
                      <motion.div
                        key={condition}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50"
                      >
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="font-body text-foreground">{condition}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Process Steps */}
          {!showQuestionnaire && (
            <section className="py-16">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                  >
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                      How It Works
                    </h2>
                    <p className="font-body text-muted-foreground max-w-2xl mx-auto">
                      Our streamlined verification process ensures you can access medical cannabis safely and legally.
                    </p>
                  </motion.div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {processSteps.map((step, index) => (
                      <motion.div
                        key={step.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="h-full bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                          <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                              <step.icon className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-medium text-primary">Step {index + 1}</span>
                            </div>
                            <CardTitle className="text-lg">{step.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <CardDescription className="text-sm">
                              {step.description}
                            </CardDescription>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Compliance Notice */}
          <section className="py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto">
                <Card className="bg-highlight-soft/20 border-highlight/30">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-highlight/20 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-highlight" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Important Medical Notice</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Medical cannabis is a regulated medicine. Access is only available to patients with 
                          qualifying medical conditions who have completed our verification process. 
                          This product is not intended to diagnose, treat, cure, or prevent any disease 
                          without proper medical supervision. All prescriptions and eligibility are subject 
                          to review by our medical team and local regulatory requirements.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          {!showQuestionnaire && !drGreenClient && (
            <section className="py-16">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center">
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Ready to Get Started?
                  </h2>
                  <p className="font-body text-lg text-muted-foreground mb-8">
                    Complete our secure medical assessment in minutes.
                  </p>
                  <Button 
                    size="lg" 
                    onClick={handleStartAssessment}
                    className="text-lg px-8 py-6"
                  >
                    Start Medical Assessment
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            </section>
          )}
        </main>

        <Footer />
        <BackToTop />
      </div>
    </PageTransition>
  );
};

export default Eligibility;
