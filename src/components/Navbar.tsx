import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, ShieldCheck, Globe, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/sasktask-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { MobileMenu } from "./MobileMenu";

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    if (session?.user) {
      await fetchUserRole(session.user.id);
    }
  };

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    
    // Check for admin role first, then task_doer, then task_giver
    if (data) {
      const adminRole = data.find(r => r.role === 'admin');
      const taskDoerRole = data.find(r => r.role === 'task_doer');
      const taskGiverRole = data.find(r => r.role === 'task_giver');
      
      setUserRole(adminRole?.role || taskDoerRole?.role || taskGiverRole?.role || null);
    } else {
      setUserRole(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex flex-col items-center gap-1 group">
            <div className="flex items-center gap-2">
              <span className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#3eb5a4] via-[#4fa8d5] to-[#3eb5a4] bg-clip-text text-transparent group-hover:scale-105 transition-all duration-300">
                Sask
              </span>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-md group-hover:blur-lg transition-all"></div>
                <img 
                  src={logo} 
                  alt="SaskTask Logo" 
                  className="h-12 w-auto relative z-10 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#3eb5a4] via-[#4fa8d5] to-[#3eb5a4] bg-clip-text text-transparent group-hover:scale-105 transition-all duration-300">
                Task
              </span>
            </div>
            <span className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
              Your Task Partner
            </span>
          </Link>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center space-x-6">
              {/* Main Navigation */}
              <Link to="/browse" className="text-foreground hover:text-primary transition-colors font-medium">
                {t('browseTasks')}
              </Link>
              
              <Link to="/find-taskers" className="text-foreground hover:text-primary transition-colors font-medium">
                {t('findTaskers')}
              </Link>
              
              <Link to="/become-tasker" className="text-foreground hover:text-primary transition-colors font-medium flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                {t('becomeTasker')}
              </Link>
              
              <Link to="/blog" className="text-foreground hover:text-primary transition-colors font-medium">
                Blog
              </Link>
              
              <Link to="/contact" className="text-foreground hover:text-primary transition-colors font-medium">
                Contact
              </Link>
              
              {user ? (
                <>
                  <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors font-medium">
                    {t('dashboard')}
                  </Link>
                  <Link to="/bookings" className="text-foreground hover:text-primary transition-colors font-medium">
                    {t('bookings')}
                  </Link>
                  <Link to="/profile" className="text-foreground hover:text-primary transition-colors font-medium">
                    {t('profile')}
                  </Link>
                  {userRole === "admin" && (
                    <Link to="/admin/blog" className="text-foreground hover:text-primary transition-colors font-medium">
                      Manage Blog
                    </Link>
                  )}
                  {userRole === "task_doer" && (
                    <Link to="/verification" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      {t('getVerified')}
                    </Link>
                  )}
                  <Button variant="outline" size="default" onClick={handleSignOut}>
                    {t('signOut')}
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="outline" size="lg" className="font-semibold border-2">
                      {t('signIn')}
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="hero" size="lg" className="font-semibold">{t('getStarted')}</Button>
                  </Link>
                </>
              )}
            </div>

            {user && <NotificationsDropdown />}
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full hover:bg-primary/10"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-primary" />
              ) : (
                <Moon className="h-5 w-5 text-primary" />
              )}
            </Button>

            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                  <Globe className="h-5 w-5 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border z-50 min-w-[150px]">
                <DropdownMenuItem 
                  onClick={() => setLanguage('en')}
                  className="cursor-pointer hover:bg-accent/10"
                >
                  🇺🇸 English {language === 'en' && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('es')}
                  className="cursor-pointer hover:bg-accent/10"
                >
                  🇪🇸 Español {language === 'es' && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('fr')}
                  className="cursor-pointer hover:bg-accent/10"
                >
                  🇫🇷 Français {language === 'fr' && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('de')}
                  className="cursor-pointer hover:bg-accent/10"
                >
                  🇩🇪 Deutsch {language === 'de' && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('hi')}
                  className="cursor-pointer hover:bg-accent/10"
                >
                  🇮🇳 हिंदी {language === 'hi' && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('zh')}
                  className="cursor-pointer hover:bg-accent/10"
                >
                  🇨🇳 中文 {language === 'zh' && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('ru')}
                  className="cursor-pointer hover:bg-accent/10"
                >
                  🇷🇺 Русский {language === 'ru' && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('ar')}
                  className="cursor-pointer hover:bg-accent/10"
                >
                  🇸🇦 العربية {language === 'ar' && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('pt')}
                  className="cursor-pointer hover:bg-accent/10"
                >
                  🇵🇹 Português {language === 'pt' && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('id')}
                  className="cursor-pointer hover:bg-accent/10"
                >
                  🇮🇩 Indonesia {language === 'id' && "✓"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="md:hidden p-2 hover:bg-accent/10 rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6 text-primary" />
            </button>
          </div>
        </div>
      </div>

      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        userRole={userRole}
      />
    </nav>
  );
};
