
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isHR: boolean;
  checkUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  isHR: false,
  checkUserRole: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHR, setIsHR] = useState(false);

  // Function to check if user is HR
  const checkUserRole = async () => {
    if (!user?.id) {
      setIsHR(false);
      return;
    }

    try {
      const { data: recruiterData } = await supabase
        .from("recruiters")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      
      setIsHR(!!recruiterData);
    } catch (error) {
      console.error("Error checking user role:", error);
      setIsHR(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
        
        // Check user role when session changes
        if (currentSession?.user) {
          setTimeout(() => checkUserRole(), 100);
        } else {
          setIsHR(false);
        }
      }
    );

    // Check current session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
      
      if (currentSession?.user) {
        setTimeout(() => checkUserRole(), 100);
      }
    });

    return () => subscription.unsubscribe();
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{ session, user, isLoading, isHR, checkUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
