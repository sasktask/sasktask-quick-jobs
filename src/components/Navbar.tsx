import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Menu, ShieldCheck, Globe, Sun, Moon, User, Settings, LogOut, ChevronDown, Briefcase, MessageSquare, LayoutDashboard, ClipboardList, Search, Users, Trophy, Utensils, Sparkles, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/sasktask-logo.png";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUnreadMessageCount } from "@/hooks/useUnreadMessageCount";
import { NotificationCenter } from "./NotificationCenter";
import { MobileMenu } from "./MobileMenu";
import { OWNER_USER_ID } from "@/lib/constants";

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const unreadCount = useUnreadMessageCount(user?.id);
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

    // Scroll effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    if (session?.user) {
      await fetchUserRole(session.user.id);
    }
  };

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 group">
            <span className="text-xl lg:text-2xl font-display font-bold text-gradient-hero">
              Sask
            </span>
            <div className="relative">
              <img 
                src={logo} 
                alt="SaskTask Logo" 
                className="h-8 lg:h-10 w-auto transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" 
              />
              <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <span className="text-xl lg:text-2xl font-display font-bold text-gradient-hero">
              Task
            </span>
          </Link>
          
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1">
              {/* Explore Dropdown - Always visible */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-1.5 font-semibold text-foreground/80 hover:text-foreground hover:bg-primary/10 transition-all duration-300">
                    Explore <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-card/95 backdrop-blur-xl border-border/50 shadow-xl rounded-xl p-2 z-[100]">
                  <DropdownMenuItem onClick={() => navigate("/browse")} className="cursor-pointer gap-3 rounded-lg hover:bg-primary/10 transition-colors py-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Search className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">{t('browseTasks')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/find-taskers")} className="cursor-pointer gap-3 rounded-lg hover:bg-primary/10 transition-colors py-2.5">
                    <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-secondary" />
                    </div>
                    <span className="font-medium">{t('findTaskers')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem onClick={() => navigate("/tiffin")} className="cursor-pointer gap-3 rounded-lg hover:bg-primary/10 transition-colors py-2.5">
                    <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Utensils className="h-4 w-4 text-accent" />
                    </div>
                    <span className="font-medium">Tiffin Services</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/how-it-works")} className="cursor-pointer gap-3 rounded-lg hover:bg-primary/10 transition-colors py-2.5">
                    <div className="h-8 w-8 rounded-lg bg-tertiary/10 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-tertiary" />
                    </div>
                    <span className="font-medium">How It Works</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/leaderboard")} className="cursor-pointer gap-3 rounded-lg hover:bg-primary/10 transition-colors py-2.5">
                    <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-warning" />
                    </div>
                    <span className="font-medium">Leaderboard</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {user && (
                <>
                  {/* Tasks Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-1.5 font-semibold text-foreground/80 hover:text-foreground hover:bg-primary/10 transition-all duration-300">
                        <Briefcase className="h-4 w-4" />
                        Tasks <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 bg-card/95 backdrop-blur-xl border-border/50 shadow-xl rounded-xl p-2 z-[100]">
                      <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer gap-3 rounded-lg hover:bg-primary/10 transition-colors py-2.5">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <LayoutDashboard className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{t('dashboard')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/post-task")} className="cursor-pointer gap-3 rounded-lg hover:bg-primary/10 transition-colors py-2.5">
                        <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                          <ClipboardList className="h-4 w-4 text-success" />
                        </div>
                        <span className="font-medium">Post Task</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/my-tasks")} className="cursor-pointer gap-3 rounded-lg hover:bg-primary/10 transition-colors py-2.5">
                        <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <Briefcase className="h-4 w-4 text-secondary" />
                        </div>
                        <span className="font-medium">My Tasks</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/bookings")} className="cursor-pointer gap-3 rounded-lg hover:bg-primary/10 transition-colors py-2.5">
                        <div className="h-8 w-8 rounded-lg bg-tertiary/10 flex items-center justify-center">
                          <ClipboardList className="h-4 w-4 text-tertiary" />
                        </div>
                        <span className="font-medium">My Bookings</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Messages Link with Badge */}
                  <Button 
                    variant="ghost" 
                    className="gap-1.5 font-semibold relative text-foreground/80 hover:text-foreground hover:bg-primary/10 transition-all duration-300" 
                    onClick={() => navigate("/messages")}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Messages
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-accent to-destructive border-0 animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Badge>
                    )}
                  </Button>

                  {/* Admin Dropdown - Owner Only */}
                  {user?.id === OWNER_USER_ID && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="gap-1.5 font-semibold text-destructive hover:bg-destructive/10 transition-all duration-300">
                          Admin <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48 bg-card/95 backdrop-blur-xl border-border/50 shadow-xl rounded-xl p-2 z-[100]">
                        <DropdownMenuItem onClick={() => navigate("/admin/dashboard")} className="cursor-pointer rounded-lg hover:bg-destructive/10 transition-colors">
                          Admin Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/admin/blog")} className="cursor-pointer rounded-lg hover:bg-destructive/10 transition-colors">
                          Manage Blog
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/admin/disputes")} className="cursor-pointer rounded-lg hover:bg-destructive/10 transition-colors">
                          Disputes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/admin/fraud")} className="cursor-pointer rounded-lg hover:bg-destructive/10 transition-colors">
                          Fraud Alerts
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/admin/verify-users")} className="cursor-pointer rounded-lg hover:bg-destructive/10 transition-colors">
                          Verify Users
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* Verification Link for Task Doers */}
                  {userRole === "task_doer" && (
                    <Button 
                      variant="ghost" 
                      className="gap-1.5 font-semibold text-success hover:bg-success/10 transition-all duration-300" 
                      onClick={() => navigate("/verification")}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      {t('getVerified')}
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Right side icons */}
            <div className="flex items-center gap-1">
              {user && <NotificationCenter userId={user.id} />}
              
              {/* Theme Toggle */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
                className="rounded-full hover:bg-primary/10 transition-all duration-300"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-warning" />
                ) : (
                  <Moon className="h-5 w-5 text-tertiary" />
                )}
              </Button>

              {/* Language Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 transition-all duration-300">
                    <Globe className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border-border/50 shadow-xl rounded-xl p-2 z-[100] min-w-[160px]">
                  <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer rounded-lg hover:bg-primary/10 transition-colors gap-2">
                    <span>🇺🇸</span> English {language === 'en' && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('fr')} className="cursor-pointer rounded-lg hover:bg-primary/10 transition-colors gap-2">
                    <span>🇫🇷</span> Français {language === 'fr' && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('es')} className="cursor-pointer rounded-lg hover:bg-primary/10 transition-colors gap-2">
                    <span>🇪🇸</span> Español {language === 'es' && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('de')} className="cursor-pointer rounded-lg hover:bg-primary/10 transition-colors gap-2">
                    <span>🇩🇪</span> Deutsch {language === 'de' && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('zh')} className="cursor-pointer rounded-lg hover:bg-primary/10 transition-colors gap-2">
                    <span>🇨🇳</span> 中文 {language === 'zh' && "✓"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu or Auth Buttons */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 transition-all duration-300"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-border/50 shadow-xl rounded-xl p-2 z-[100]">
                    <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer gap-3 rounded-lg hover:bg-primary/10 transition-colors py-2.5">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{t('profile')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/account")} className="cursor-pointer gap-3 rounded-lg hover:bg-primary/10 transition-colors py-2.5">
                      <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <Settings className="h-4 w-4 text-secondary" />
                      </div>
                      <span className="font-medium">Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-3 rounded-lg hover:bg-destructive/10 transition-colors py-2.5 text-destructive">
                      <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                        <LogOut className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{t('signOut')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Link to="/auth">
                    <Button variant="ghost" size="sm" className="font-semibold hover:bg-primary/10 transition-all duration-300">
                      {t('signIn')}
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button 
                      size="sm" 
                      className="font-semibold bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] hover:bg-right transition-all duration-500 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                    >
                      {t('getStarted')}
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)} 
                className="lg:hidden p-2 hover:bg-primary/10 rounded-xl transition-all duration-300"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} user={user} userRole={userRole} />
    </nav>
  );
};