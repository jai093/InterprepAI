
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfile } from "@/hooks/useProfile";
import { User, LogIn, Settings, Users } from "lucide-react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handlePracticeClick = () => {
    if (!user) {
      navigate("/auth");
    } else {
      navigate("/simulation");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-interprepai-900">Interprep<span className="text-interprepai-600">AI</span></span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="font-medium text-gray-600 hover:text-interprepai-700 transition-colors">
            Home
          </Link>
          {user && (
            <>
              <Link to="/dashboard" className="font-medium text-gray-600 hover:text-interprepai-700 transition-colors">
                Dashboard
              </Link>
              <Link to="/meetups" className="font-medium text-gray-600 hover:text-interprepai-700 transition-colors">
                Meetups
              </Link>
            </>
          )}
          <Button 
            onClick={handlePracticeClick}
            className="bg-interprepai-700 hover:bg-interprepai-800 transition-colors"
          >
            {user ? "Start Practice" : "Sign In to Practice"}
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/meetups")}>
                  <Users className="mr-2 h-4 w-4" />
                  Meetups
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="outline"
              onClick={() => navigate("/auth")}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 rounded-md text-gray-600 hover:text-interprepai-700 hover:bg-gray-100"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md p-4 animate-fade-in">
          <nav className="flex flex-col space-y-4 items-start">
            <Link to="/" className="font-medium text-gray-600 hover:text-interprepai-700 transition-colors">
              Home
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="font-medium text-gray-600 hover:text-interprepai-700 transition-colors">
                  Dashboard
                </Link>
                <Link to="/meetups" className="font-medium text-gray-600 hover:text-interprepai-700 transition-colors">
                  Meetups
                </Link>
                <Link to="/simulation" className="font-medium text-gray-600 hover:text-interprepai-700 transition-colors">
                  Practice
                </Link>
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Button 
                className="w-full bg-interprepai-700 hover:bg-interprepai-800 transition-colors"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
