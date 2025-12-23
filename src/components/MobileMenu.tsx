import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { 
  ShieldCheck, 
  Search, 
  Users, 
  LayoutDashboard, 
  ClipboardList, 
  Briefcase, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  HelpCircle,
  Mail,
  Utensils
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { OWNER_USER_ID } from "@/lib/constants";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "./ui/badge";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  userRole: string | null;
}

export const MobileMenu = ({ isOpen, onClose, user, userRole }: MobileMenuProps) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      
      const channel = supabase
        .channel('mobile-notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => fetchUnreadCount()
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;
    
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);
    
    setUnreadCount(count || 0);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onClose();
    navigate("/");
  };

  const handleNavigation = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[300px] sm:w-[350px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">{t('menu')}</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col gap-1 mt-6">
          {/* Explore Section */}
          <Collapsible open={exploreOpen} onOpenChange={setExploreOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between text-base font-medium">
                Explore
                <ChevronDown className={`h-4 w-4 transition-transform ${exploreOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 flex flex-col gap-1">
              <Button variant="ghost" className="justify-start gap-3 text-sm" onClick={() => handleNavigation("/browse")}>
                <Search className="h-4 w-4" />
                {t('browseTasks')}
              </Button>
              <Button variant="ghost" className="justify-start gap-3 text-sm" onClick={() => handleNavigation("/find-taskers")}>
                <Users className="h-4 w-4" />
                {t('findTaskers')}
              </Button>
              <Button variant="ghost" className="justify-start gap-3 text-sm" onClick={() => handleNavigation("/how-it-works")}>
                <HelpCircle className="h-4 w-4" />
                How It Works
              </Button>
              <Button variant="ghost" className="justify-start gap-3 text-sm" onClick={() => handleNavigation("/contact")}>
                <Mail className="h-4 w-4" />
                Contact
              </Button>
              <Button variant="ghost" className="justify-start gap-3 text-sm" onClick={() => handleNavigation("/tiffin")}>
                <Utensils className="h-4 w-4" />
                Tiffin Services
              </Button>
            </CollapsibleContent>
          </Collapsible>

          {user && (
            <>
              {/* Tasks Section */}
              <Collapsible open={tasksOpen} onOpenChange={setTasksOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between text-base font-medium">
                    <span className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Tasks
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${tasksOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 flex flex-col gap-1">
                  <Button variant="ghost" className="justify-start gap-3 text-sm" onClick={() => handleNavigation("/dashboard")}>
                    <LayoutDashboard className="h-4 w-4" />
                    {t('dashboard')}
                  </Button>
                  <Button variant="ghost" className="justify-start gap-3 text-sm" onClick={() => handleNavigation("/post-task")}>
                    <ClipboardList className="h-4 w-4" />
                    Post Task
                  </Button>
                  <Button variant="ghost" className="justify-start gap-3 text-sm" onClick={() => handleNavigation("/my-tasks")}>
                    <Briefcase className="h-4 w-4" />
                    My Tasks
                  </Button>
                  <Button variant="ghost" className="justify-start gap-3 text-sm" onClick={() => handleNavigation("/bookings")}>
                    <ClipboardList className="h-4 w-4" />
                    My Bookings
                  </Button>
                </CollapsibleContent>
              </Collapsible>

              {/* Messages - Direct Link */}
              <Button 
                variant="ghost" 
                className="w-full justify-start text-base font-medium gap-2 relative"
                onClick={() => handleNavigation("/messages")}
              >
                <MessageSquare className="h-4 w-4" />
                Messages
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1 flex items-center justify-center text-xs">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>

              {/* Task Doer Verification */}
              {userRole === "task_doer" && (
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-base font-medium gap-2"
                  onClick={() => handleNavigation("/verification")}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {t('getVerified')}
                </Button>
              )}

              {/* Admin Section - Owner Only */}
              {user?.id === OWNER_USER_ID && (
                <Collapsible open={adminOpen} onOpenChange={setAdminOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between text-base font-medium text-destructive">
                      Admin
                      <ChevronDown className={`h-4 w-4 transition-transform ${adminOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 flex flex-col gap-1">
                    <Button variant="ghost" className="justify-start text-sm" onClick={() => handleNavigation("/admin/dashboard")}>
                      Admin Dashboard
                    </Button>
                    <Button variant="ghost" className="justify-start text-sm" onClick={() => handleNavigation("/admin/blog")}>
                      Manage Blog
                    </Button>
                    <Button variant="ghost" className="justify-start text-sm" onClick={() => handleNavigation("/admin/disputes")}>
                      Disputes
                    </Button>
                    <Button variant="ghost" className="justify-start text-sm" onClick={() => handleNavigation("/admin/fraud")}>
                      Fraud Alerts
                    </Button>
                    <Button variant="ghost" className="justify-start text-sm" onClick={() => handleNavigation("/admin/verify-users")}>
                      Verify Users
                    </Button>
                  </CollapsibleContent>
                </Collapsible>
              )}

              <div className="border-t border-border my-3" />

              {/* Account Section */}
              <Button 
                variant="ghost" 
                className="w-full justify-start text-base gap-2"
                onClick={() => handleNavigation("/profile")}
              >
                <User className="h-4 w-4" />
                {t('profile')}
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-base gap-2"
                onClick={() => handleNavigation("/account")}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>

              <div className="border-t border-border my-3" />
              
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                {t('signOut')}
              </Button>
            </>
          )}

          {!user && (
            <div className="flex flex-col gap-3 mt-4">
              <Button
                variant="outline"
                size="lg"
                className="w-full font-semibold"
                onClick={() => handleNavigation("/auth")}
              >
                {t('signIn')}
              </Button>
              
              <Button
                size="lg"
                className="w-full font-semibold"
                onClick={() => handleNavigation("/auth")}
              >
                {t('getStarted')}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};