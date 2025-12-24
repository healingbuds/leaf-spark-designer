import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'moderator' | 'user';
  fallbackPath?: string;
}

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'unauthorized';

export const ProtectedRoute = ({ 
  children, 
  requiredRole = 'admin',
  fallbackPath = '/auth'
}: ProtectedRouteProps) => {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        // First check if user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          if (isMounted) setStatus('unauthenticated');
          return;
        }

        // Then check role using the secure has_role function
        const { data: hasRole, error: roleError } = await supabase
          .rpc('has_role', { 
            _user_id: session.user.id, 
            _role: requiredRole 
          });

        if (roleError) {
          console.error('Role check error:', roleError);
          if (isMounted) setStatus('unauthorized');
          return;
        }

        if (isMounted) {
          setStatus(hasRole ? 'authenticated' : 'unauthorized');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (isMounted) setStatus('unauthenticated');
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        if (isMounted) setStatus('unauthenticated');
      } else if (event === 'SIGNED_IN') {
        checkAuth();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [requiredRole]);

  // Loading state with skeleton UI
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header skeleton */}
        <div className="h-16 border-b border-border bg-card">
          <div className="container mx-auto px-4 h-full flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <div className="flex gap-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="container mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
          
          <Skeleton className="h-64 rounded-lg" />
        </div>
        
        {/* Loading indicator */}
        <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2 shadow-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Verifying access...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated - redirect to login
  if (status === 'unauthenticated') {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Unauthorized - show access denied
  if (status === 'unauthorized') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Access Denied
            </h1>
            <p className="text-muted-foreground">
              You don't have permission to access this page. This area requires {requiredRole} privileges.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
            >
              Go Back
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              variant="default"
            >
              Return Home
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>Protected by role-based access control</span>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;
