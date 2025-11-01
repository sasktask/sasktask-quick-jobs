import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/sasktask-logo.png";
interface NavbarProps {
  onMenuClick?: () => void;
}
export const Navbar = ({
  onMenuClick
}: NavbarProps) => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    checkUser();
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  const checkUser = async () => {
    const {
      data: {
        session
      }
    } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    if (session?.user) {
      await fetchUserRole(session.user.id);
    }
  };
  const fetchUserRole = async (userId: string) => {
    const {
      data
    } = await supabase.from("user_roles").select("role").eq("user_id", userId).single();
    setUserRole(data?.role || null);
  };
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  return <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold bg-gradient-to-br from-blue-600 via-purple-600 to-teal-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(139,92,246,0.3)] tracking-tight">
                  SaskTask
                </h1>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-lg group-hover:blur-xl transition-all"></div>
                  <img src={logo} alt="SaskTask Logo" className="h-16 w-auto relative z-10 group-hover:scale-105 transition-transform duration-300 brightness-110" />
                </div>
              </div>
              <span className="text-[10px] font-light text-foreground/90 tracking-[0.2em] uppercase drop-shadow-sm">
                Your Task Partner
              </span>
            </div>
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center space-x-6">
              {/* Main Navigation */}
              <Link to="/browse" className="text-foreground hover:text-primary transition-colors font-medium">
                Browse Tasks
              </Link>
              
              <Link to="/find-taskers" className="text-foreground hover:text-primary transition-colors font-medium">
                Find Taskers
              </Link>
              
              <Link to="/become-tasker" className="text-foreground hover:text-primary transition-colors font-medium flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Become a Tasker
              </Link>
              
              {user ? <>
                  {userRole === "task_doer" && <Link to="/verification" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Get Verified
                    </Link>}
                  <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors font-medium">
                    Dashboard
                  </Link>
                  <Link to="/profile" className="text-foreground hover:text-primary transition-colors font-medium">
                    Profile
                  </Link>
                  <Button variant="outline" size="default" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </> : <>
                  <Link to="/auth">
                    <Button variant="outline" size="lg" className="font-semibold border-2">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="hero" size="lg" className="font-semibold">Get Started</Button>
                  </Link>
                </>}
            </div>

            <button onClick={onMenuClick} className="md:hidden">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>;
};