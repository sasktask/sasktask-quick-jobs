import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Menu, ShieldCheck, Globe, Sun, Moon, User, Settings, LogOut, ChevronDown, Briefcase, MessageSquare, LayoutDashboard, ClipboardList, Search, Users, Trophy } from "lucide-react";
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#3eb5a4] via-[#4fa8d5] to-[#3eb5a4] bg-clip-text text-transparent">
              Sask
            </span>
            <div className="relative">
              <img src={logo} alt="SaskTask Logo" className="h-10 w-auto group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#3eb5a4] via-[#4fa8d5] to-[#3eb5a4] bg-clip-text text-transparent">
              Task
            </span>
          </Link>
          
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1">
              {/* Explore Dropdown - Always visible */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-1 font-medium">
                    Explore <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-card border-border z-[100]">
                  <DropdownMenuItem onClick={() => navigate("/browse")} className="cursor-pointer gap-2">
                    <Search className="h-4 w-4" />
                    {t('browseTasks')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/find-taskers")} className="cursor-pointer gap-2">
                    <Users className="h-4 w-4" />
                    {t('findTaskers')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/how-it-works")} className="cursor-pointer gap-2">
                    How It Works
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/leaderboard")} className="cursor-pointer gap-2">
                    <Trophy className="h-4 w-4" />
                    Leaderboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/contact")} className="cursor-pointer gap-2">
                    Contact
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {user && (
                <>
                  {/* Tasks Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-1 font-medium">
                        <Briefcase className="h-4 w-4" />
                        Tasks <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48 bg-card border-border z-[100]">
                      <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        {t('dashboard')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/post-task")} className="cursor-pointer gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Post Task
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/my-tasks")} className="cursor-pointer gap-2">
                        <Briefcase className="h-4 w-4" />
                        My Tasks
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/bookings")} className="cursor-pointer gap-2">
                        <ClipboardList className="h-4 w-4" />
                        My Bookings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Messages Link with Badge */}
                  <Button variant="ghost" className="gap-1 font-medium relative" onClick={() => navigate("/messages")}>
                    <MessageSquare className="h-4 w-4" />
                    Messages
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Badge>
                    )}
                  </Button>

                  {/* Admin Dropdown - Owner Only */}
                  {user?.id === OWNER_USER_ID && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="gap-1 font-medium text-destructive">
                          Admin <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48 bg-card border-border z-[100]">
                        <DropdownMenuItem onClick={() => navigate("/admin/dashboard")} className="cursor-pointer">
                          Admin Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/admin/blog")} className="cursor-pointer">
                          Manage Blog
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/admin/disputes")} className="cursor-pointer">
                          Disputes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/admin/fraud")} className="cursor-pointer">
                          Fraud Alerts
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/admin/verify-users")} className="cursor-pointer">
                          Verify Users
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* Verification Link for Task Doers */}
                  {userRole === "task_doer" && (
                    <Button variant="ghost" className="gap-1 font-medium" onClick={() => navigate("/verification")}>
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
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full">
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* Language Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Globe className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border z-[100] min-w-[140px]">
                  <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer">
                    🇺🇸 English {language === 'en' && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('fr')} className="cursor-pointer">
                    🇫🇷 Français {language === 'fr' && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('es')} className="cursor-pointer">
                    🇪🇸 Español {language === 'es' && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('de')} className="cursor-pointer">
                    🇩🇪 Deutsch {language === 'de' && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('zh')} className="cursor-pointer">
                    🇨🇳 中文 {language === 'zh' && "✓"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu or Auth Buttons */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-card border-border z-[100]">
                    <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer gap-2">
                      <User className="h-4 w-4" />
                      {t('profile')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/account")} className="cursor-pointer gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-2 text-destructive">
                      <LogOut className="h-4 w-4" />
                      {t('signOut')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Link to="/auth">
                    <Button variant="outline" size="sm" className="font-medium">
                      {t('signIn')}
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="default" size="sm" className="font-medium">
                      {t('getStarted')}
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-accent/10 rounded-lg transition-colors">
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