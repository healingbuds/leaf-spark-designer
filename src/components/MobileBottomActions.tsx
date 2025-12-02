import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import EligibilityDialog from "./EligibilityDialog";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";

const MobileBottomActions = () => {
  const [eligibilityDialogOpen, setEligibilityDialogOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  return (
    <>
      {/* Fixed Bottom Action Bar - Mobile and Tablet */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-background via-background to-background/95 backdrop-blur-xl border-t border-border/50 shadow-2xl"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-3">
            <button 
              onClick={() => setEligibilityDialogOpen(true)}
              className="flex-1 font-body font-semibold px-6 py-3.5 rounded-full transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl bg-gradient-to-r from-primary to-primary/90 text-white border border-primary/20 hover:from-primary/90 hover:to-primary"
            >
              Check Eligibility
            </button>
            {user ? (
              <button 
                onClick={handleLogout}
                className="flex-1 font-body font-semibold px-6 py-3.5 rounded-full transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl bg-foreground/90 text-background border border-foreground/20 hover:bg-foreground flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            ) : (
              <Link 
                to="/auth"
                className="flex-1 font-body font-semibold px-6 py-3.5 rounded-full transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl bg-foreground/90 text-background border border-foreground/20 hover:bg-foreground text-center"
              >
                Patient Login
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* Eligibility Dialog */}
      <EligibilityDialog open={eligibilityDialogOpen} onOpenChange={setEligibilityDialogOpen} />
    </>
  );
};

export default MobileBottomActions;
