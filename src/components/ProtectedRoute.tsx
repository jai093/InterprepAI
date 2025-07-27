import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireHR?: boolean;
  requireCandidate?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireHR = false, 
  requireCandidate = false 
}: ProtectedRouteProps) => {
  const { user, isHR, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated - redirect to auth
    if (!user) {
      navigate("/auth");
      return;
    }

    // HR route but user is not HR
    if (requireHR && !isHR) {
      toast({
        title: "Access Denied",
        description: "Only HR users can access this page.",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    // Candidate route but user is HR
    if (requireCandidate && isHR) {
      toast({
        title: "Access Denied", 
        description: "HR users should use the HR dashboard.",
        variant: "destructive",
      });
      navigate("/hr");
      return;
    }
  }, [user, isHR, isLoading, requireHR, requireCandidate, navigate]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-interprepai-600"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  // Don't render if role requirements not met
  if (requireHR && !isHR) {
    return null;
  }

  if (requireCandidate && isHR) {
    return null;
  }

  return <>{children}</>;
};