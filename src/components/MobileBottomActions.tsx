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
      {/* Fixed Bottom Action Bar - Mobile Only */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-background via-background to-background/95 backdrop-blur-xl border-t border-border/50 shadow-2xl"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-3">
            <button 
              onClick={() => setEligibilityDialogOpen(true)}
              className="flex-1 font-body font-semibold px-6 py-3.5 rounded-full transition-all duration-300 active:scale-95 shadow-lg hover:shadow-2xl backdrop-blur-2xl bg-gradient-to-br from-white/30 via-white/20 to-white/10 dark:from-white/20 dark:via-white/10 dark:to-white/5 border border-white/40 hover:border-white/60 text-white hover:bg-white/30"
            >
              Check Eligibility
            </button>
            {user ? (
              <button 
                onClick={handleLogout}
                className="flex-1 font-body font-semibold px-6 py-3.5 rounded-full transition-all duration-300 active:scale-95 shadow-lg hover:shadow-2xl backdrop-blur-2xl bg-gradient-to-br from-white/20 via-white/15 to-white/10 dark:from-white/15 dark:via-white/10 dark:to-white/5 border border-white/30 hover:border-white/50 text-white hover:bg-white/25 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            ) : (
              <Link 
                to="/auth"
                className="flex-1 font-body font-semibold px-6 py-3.5 rounded-full transition-all duration-300 active:scale-95 shadow-lg hover:shadow-2xl backdrop-blur-2xl bg-gradient-to-br from-white/20 via-white/15 to-white/10 dark:from-white/15 dark:via-white/10 dark:to-white/5 border border-white/30 hover:border-white/50 text-white hover:bg-white/25 text-center"
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
