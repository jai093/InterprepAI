import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isHr, setIsHr] = useState(false); // New: HR toggle
  const [company, setCompany] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, isHR: userIsHR, checkUserRole } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !isLoading) {
      if (userIsHR) {
        navigate("/hr");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, userIsHR, navigate, isLoading]);
  
  // Check for verification token in the URL
  useEffect(() => {
    // Extract the token from the URL if present
    const params = new URLSearchParams(location.hash.substring(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const type = params.get('type');
    
    // If this is a verification callback with tokens
    if (accessToken && type === 'recovery') {
      handlePasswordReset(accessToken);
    } else if (accessToken && refreshToken) {
      // Handle successful email verification
      handleSuccessfulAuth(accessToken, refreshToken);
    }
  }, [location]);

  const handlePasswordReset = async (token) => {
    toast({
      title: "Password Reset",
      description: "Please enter a new password",
    });
  };

  const handleSuccessfulAuth = async (accessToken, refreshToken) => {
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (error) throw error;
      
      toast({
        title: "Authentication successful!",
        description: "You are now signed in.",
      });
      
      // Check user role and redirect appropriately
      await checkUserRole();
      const { data: recruiterData } = await supabase
        .from("recruiters")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();
      
      if (recruiterData) {
        navigate('/hr');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Error setting session:", error);
      toast({
        title: "Authentication error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: window.location.origin + '/auth',
          },
        });
        if (error) throw error;
        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account.",
        });

        // If user signed up as HR, create recruiter profile
        if (isHr && data?.user) {
          try {
            const newRecruiter = {
              id: data.user.id,
              name: fullName,
              email: email,
              company: company || null,
            };
            
            const { error: recruiterError } = await supabase
              .from("recruiters")
              .insert([newRecruiter]);
              
            if (recruiterError) {
              console.error("Recruiter creation error:", recruiterError);
              toast({
                title: "HR profile error",
                description: recruiterError.message,
                variant: "destructive",
              });
            } else {
              toast({
                title: "HR account created!",
                description: "Your HR dashboard will be ready after verifying your email.",
              });
            }
          } catch (error) {
            console.error("Error creating HR profile:", error);
            toast({
              title: "HR profile error", 
              description: "Failed to create HR profile. Please contact support.",
              variant: "destructive",
            });
          }
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Check if user is HR after login and redirect appropriately
        try {
          await checkUserRole();
          const { data: recruiterData } = await supabase
            .from("recruiters")
            .select("id")
            .eq("id", data?.user.id)
            .maybeSingle();

          if (recruiterData) {
            toast({
              title: "Welcome back!",
              description: "Redirecting to HR dashboard...",
            });
            navigate("/hr");
          } else {
            toast({
              title: "Welcome back!",
              description: "Redirecting to your dashboard...",
            });
            navigate("/dashboard");
          }
        } catch (error) {
          console.error("Error checking user role:", error);
          // Default to regular dashboard if role check fails
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {isSignUp ? "Create an account" : "Sign in"}
            </CardTitle>
            <CardDescription>
              {isSignUp
                ? "Enter your details to create your account"
                : "Enter your credentials to access your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
              </div>
              {isSignUp && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      id="isHr"
                      type="checkbox"
                      checked={isHr}
                      onChange={() => setIsHr((v) => !v)}
                      className="accent-interprepai-700 h-4 w-4"
                    />
                    <Label htmlFor="isHr" className="text-sm">
                      Sign up as HR (Recruiter)
                    </Label>
                  </div>
                  {isHr && (
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="company">Company Name (optional)</Label>
                      <Input
                        id="company"
                        placeholder="Acme Corp"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        autoComplete="organization"
                      />
                    </div>
                  )}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-interprepai-700 hover:bg-interprepai-800"
                disabled={isLoading}
              >
                {isLoading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-gray-600 hover:text-interprepai-700"
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
