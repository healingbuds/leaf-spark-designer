import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import Header from "@/layout/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from "lucide-react";
import hbLogoWhite from "@/assets/hb-logo-white-new.png";
import { useTranslation } from "react-i18next";
import { useUserRole } from "@/hooks/useUserRole";
import { useShop } from "@/context/ShopContext";
import { getProductionPath } from "@/lib/urls";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation('auth');
  
  // Role and eligibility checks for smart redirect
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { isEligible, isLoading: clientLoading } = useShop();

  const loginSchema = z.object({
    email: z.string().trim().email({ message: t('validationErrors.invalidEmail') }),
    password: z.string().min(6, { message: t('validationErrors.passwordMin') }),
  });

  const signupSchema = z.object({
    email: z.string().trim().email({ message: t('validationErrors.invalidEmail') }),
    password: z.string().min(6, { message: t('validationErrors.passwordMin') }),
    confirmPassword: z.string(),
    fullName: z.string().trim().min(2, { message: t('validationErrors.fullNameMin') }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('validationErrors.passwordMatch'),
    path: ["confirmPassword"],
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Role-based redirect after login
  useEffect(() => {
    if (user && !roleLoading && !clientLoading) {
      // Priority 1: Admins go to admin portal
      if (isAdmin) {
        navigate("/admin", { replace: true });
        return;
      }
      
      // Priority 2: Verified patients go to patient dashboard
      if (isEligible) {
        navigate("/dashboard", { replace: true });
        return;
      }
      
      // Priority 3: Unverified patients go to status page
      navigate("/dashboard/status", { replace: true });
    }
  }, [user, isAdmin, roleLoading, isEligible, clientLoading, navigate]);

  const validateForm = () => {
    setErrors({});
    
    try {
      if (isLogin) {
        loginSchema.parse({ email, password });
      } else {
        signupSchema.parse({ email, password, confirmPassword, fullName });
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      let message = t('loginError');
      if (error.message.includes("Invalid login credentials")) {
        message = t('invalidCredentials');
      } else if (error.message.includes("Email not confirmed")) {
        message = t('emailNotConfirmed');
      }
      toast({
        title: t('loginFailed'),
        description: message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: t('welcomeBackToast'),
      description: t('loginSuccess'),
    });
    // Navigation handled by useEffect based on role/eligibility
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    // Use consistent production URL for email confirmation redirects
    const redirectUrl = getProductionPath('/');

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      setLoading(false);
      let message = t('signupError');
      if (error.message.includes("User already registered")) {
        message = t('emailRegistered');
      } else if (error.message.includes("Password should be")) {
        message = t('passwordRequirements');
      }
      toast({
        title: t('signupFailed'),
        description: message,
        variant: "destructive",
      });
      return;
    }

    // Send onboarding email (non-blocking - errors won't affect signup)
    try {
      await supabase.functions.invoke('send-onboarding-email', {
        body: {
          email: email.trim(),
          fullName: fullName.trim(),
        },
      });
      console.log('Onboarding email triggered successfully');
    } catch (emailError) {
      // Log but don't block registration
      console.error('Failed to send onboarding email:', emailError);
    }

    setLoading(false);

    toast({
      title: t('accountCreated'),
      description: t('accountCreatedDesc'),
    });
    setIsLogin(true);
    setPassword("");
    setConfirmPassword("");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const emailValidation = z.string().trim().email({ message: t('validationErrors.invalidEmail') });
    const result = emailValidation.safeParse(email);
    
    if (!result.success) {
      setErrors({ email: result.error.errors[0].message });
      return;
    }

    setLoading(true);

    // Use consistent production URL for password reset redirects
    const redirectUrl = getProductionPath('/auth');

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl,
    });

    setLoading(false);

    if (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setResetEmailSent(true);
    toast({
      title: t('checkEmail'),
      description: t('resetLinkSentToast'),
    });
  };

  // Show loading state while determining redirect destination
  if (user && (roleLoading || clientLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2e2a] via-[#2a3d3a] to-[#1a2e2a]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white/80">Preparing your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition variant="premium">
      <div className="min-h-screen bg-gradient-to-br from-[#1a2e2a] via-[#2a3d3a] to-[#1a2e2a]">
        <Header />
        
        <main className="min-h-[calc(100vh-200px)] flex items-center justify-center py-20 pt-36">
          <div className="container mx-auto px-4 max-w-md">
            <div className="bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
              {/* Header - darker gradient for better contrast */}
              <div className="bg-gradient-to-br from-primary via-secondary to-primary p-8 text-center">
                <div className="flex justify-center mb-4">
                  <img 
                    src={hbLogoWhite} 
                    alt="Healing Buds" 
                    className="h-16 min-w-[140px] w-auto object-contain"
                  />
                </div>
                <h1 className="font-display text-2xl font-bold text-white mb-2">
                  {isForgotPassword ? t('resetPassword') : isLogin ? t('welcomeBack') : t('createAccount')}
                </h1>
                <p className="text-white/80 text-sm">
                  {isForgotPassword 
                    ? t('resetDescription')
                    : isLogin 
                      ? t('loginDescription')
                      : t('signupDescription')}
                </p>
              </div>
              
              {/* Test Accounts Dropdown - for testing dispensary access */}
              {isLogin && (
                <div className="px-8 pt-6 pb-0">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer bg-highlight/10 border border-highlight/30 rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-highlight/20 transition-colors">
                      <span className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-highlight" />
                        Test Accounts (Demo Access)
                      </span>
                      <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="mt-3 space-y-2 bg-muted/50 rounded-lg p-4 border border-border max-h-80 overflow-y-auto">
                      <button 
                        type="button"
                        className="w-full p-3 bg-background rounded-md border border-border hover:border-primary/50 cursor-pointer transition-colors text-left"
                        onClick={() => {
                          setEmail("new@healingbuds.test");
                          setPassword("NewUser123!");
                        }}
                      >
                        <p className="font-semibold text-sm text-foreground">New User (No Registration)</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-mono bg-muted px-1.5 py-0.5 rounded">new@healingbuds.test</span> / <span className="font-mono bg-muted px-1.5 py-0.5 rounded">NewUser123!</span>
                        </p>
                        <p className="text-xs text-amber-500 mt-1">🆕 Needs to complete registration</p>
                      </button>
                      <button 
                        type="button"
                        className="w-full p-3 bg-background rounded-md border border-border hover:border-primary/50 cursor-pointer transition-colors text-left"
                        onClick={() => {
                          setEmail("pending@healingbuds.test");
                          setPassword("Pending123!");
                        }}
                      >
                        <p className="font-semibold text-sm text-foreground">KYC Pending</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-mono bg-muted px-1.5 py-0.5 rounded">pending@healingbuds.test</span> / <span className="font-mono bg-muted px-1.5 py-0.5 rounded">Pending123!</span>
                        </p>
                        <p className="text-xs text-highlight mt-1">⏳ Registered, awaiting KYC verification</p>
                      </button>
                      <button 
                        type="button"
                        className="w-full p-3 bg-background rounded-md border border-border hover:border-primary/50 cursor-pointer transition-colors text-left"
                        onClick={() => {
                          setEmail("kycdone@healingbuds.test");
                          setPassword("KycDone123!");
                        }}
                      >
                        <p className="font-semibold text-sm text-foreground">KYC Done (Awaiting Review)</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-mono bg-muted px-1.5 py-0.5 rounded">kycdone@healingbuds.test</span> / <span className="font-mono bg-muted px-1.5 py-0.5 rounded">KycDone123!</span>
                        </p>
                        <p className="text-xs text-blue-500 mt-1">📋 KYC complete, pending admin approval</p>
                      </button>
                      <button 
                        type="button"
                        className="w-full p-3 bg-background rounded-md border border-border hover:border-primary/50 cursor-pointer transition-colors text-left"
                        onClick={() => {
                          setEmail("patient@healingbuds.test");
                          setPassword("Patient123!");
                        }}
                      >
                        <p className="font-semibold text-sm text-foreground">Verified Patient</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-mono bg-muted px-1.5 py-0.5 rounded">patient@healingbuds.test</span> / <span className="font-mono bg-muted px-1.5 py-0.5 rounded">Patient123!</span>
                        </p>
                        <p className="text-xs text-primary mt-1">✓ Full Dispensary Access</p>
                      </button>
                      <button 
                        type="button"
                        className="w-full p-3 bg-background rounded-md border border-border hover:border-primary/50 cursor-pointer transition-colors text-left"
                        onClick={() => {
                          setEmail("rejected@healingbuds.test");
                          setPassword("Rejected123!");
                        }}
                      >
                        <p className="font-semibold text-sm text-foreground">Rejected User</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-mono bg-muted px-1.5 py-0.5 rounded">rejected@healingbuds.test</span> / <span className="font-mono bg-muted px-1.5 py-0.5 rounded">Rejected123!</span>
                        </p>
                        <p className="text-xs text-destructive mt-1">✗ Application declined</p>
                      </button>
                      <button 
                        type="button"
                        className="w-full p-3 bg-background rounded-md border border-border hover:border-primary/50 cursor-pointer transition-colors text-left"
                        onClick={() => {
                          setEmail("admin@healingbuds.test");
                          setPassword("Admin123!");
                        }}
                      >
                        <p className="font-semibold text-sm text-foreground">Admin Account</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-mono bg-muted px-1.5 py-0.5 rounded">admin@healingbuds.test</span> / <span className="font-mono bg-muted px-1.5 py-0.5 rounded">Admin123!</span>
                        </p>
                        <p className="text-xs text-secondary mt-1">🔑 Full Admin + Dispensary Access</p>
                      </button>
                      <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
                        Click to auto-fill credentials, then Sign In
                      </p>
                    </div>
                  </details>
                </div>
              )}

              {/* Forgot Password Form */}
              {isForgotPassword ? (
                <div className="p-8 space-y-5">
                  {resetEmailSent ? (
                    <div className="text-center space-y-4">
                      <div className="bg-primary/10 text-primary p-4 rounded-lg">
                        <Mail className="w-8 h-8 mx-auto mb-2" />
                        <p className="font-medium">{t('checkInbox')}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t('resetLinkSent', { email })}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setIsForgotPassword(false);
                          setResetEmailSent(false);
                          setEmail("");
                        }}
                      >
                        {t('backToSignIn')}
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="resetEmail" className="text-foreground">{t('email')}</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="resetEmail"
                            type="email"
                            placeholder={t('emailPlaceholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            disabled={loading}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-destructive text-xs">{errors.email}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        {t('sendResetLink')}
                        {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                      </Button>

                      <div className="text-center pt-4 border-t border-border">
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(false);
                            setErrors({});
                          }}
                          className="text-primary hover:underline text-sm font-medium"
                          disabled={loading}
                        >
                          {t('backToSignIn')}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                /* Login/Signup Form */
                <form onSubmit={isLogin ? handleLogin : handleSignup} className="p-8 space-y-5">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-foreground">{t('fullName')}</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder={t('fullNamePlaceholder')}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-destructive text-xs">{errors.fullName}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">{t('email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-destructive text-xs">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-foreground">{t('password')}</Label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setErrors({});
                            setPassword("");
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          {t('forgotPassword')}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                    {errors.password && (
                      <p className="text-destructive text-xs">{errors.password}</p>
                    )}
                  </div>

                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-foreground">{t('confirmPassword')}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-destructive text-xs">{errors.confirmPassword}</p>
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {isLogin ? t('signIn') : t('createAccount')}
                    {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>

                  <div className="text-center pt-4 border-t border-border">
                    <p className="text-muted-foreground text-sm">
                      {isLogin ? t('noAccount') : t('hasAccount')}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(!isLogin);
                          setErrors({});
                          setPassword("");
                          setConfirmPassword("");
                        }}
                        className="text-primary hover:underline ml-1 font-medium"
                        disabled={loading}
                      >
                        {isLogin ? t('signUp') : t('signIn')}
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Auth;
