
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Providers } from "@/providers";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import InterviewSimulation from "./pages/InterviewSimulation";
import NotFound from "./pages/NotFound";
import Meetups from "./components/Meetups";
import { useAuth } from "@/contexts/AuthContext";

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      {children}
    </div>
  );
};

const App = () => (
  <Providers>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/simulation" 
        element={
          <ProtectedRoute>
            <InterviewSimulation />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/meetups"
        element={
          <ProtectedRoute>
            <Meetups />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Providers>
);

export default App;
