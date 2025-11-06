import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ShieldCheck, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "./ui/badge";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  userRole: string | null;
}

export const MobileMenu = ({ isOpen, onClose, user, userRole }: MobileMenuProps) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      
      // Set up real-time subscription for notification updates
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
    
    const { data, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: false })
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
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>{t('menu')}</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col gap-4 mt-8">
          {/* Main Navigation */}
          <Button
            variant="ghost"
            className="justify-start text-base"
            onClick={() => handleNavigation("/browse")}
          >
            {t('browseTasks')}
          </Button>
          
          <Button
            variant="ghost"
            className="justify-start text-base"
            onClick={() => handleNavigation("/find-taskers")}
          >
            {t('findTaskers')}
          </Button>
          
          <Button
            variant="ghost"
            className="justify-start text-base gap-2"
            onClick={() => handleNavigation("/become-tasker")}
          >
            <ShieldCheck className="h-4 w-4" />
            {t('becomeTasker')}
          </Button>
          
          <Button
            variant="ghost"
            className="justify-start text-base"
            onClick={() => handleNavigation("/blog")}
          >
            Blog
          </Button>
          
          <Button
            variant="ghost"
            className="justify-start text-base"
            onClick={() => handleNavigation("/contact")}
          >
            Contact
          </Button>

          {user && (
            <>
              <div className="border-t border-border my-2" />

              <Button
                variant="ghost"
                className="justify-start text-base"
                onClick={() => handleNavigation("/dashboard")}
              >
                {t('dashboard')}
              </Button>
              
              <Button
                variant="ghost"
                className="justify-start text-base"
                onClick={() => handleNavigation("/bookings")}
              >
                {t('bookings')}
              </Button>
              
              <Button
                variant="ghost"
                className="justify-start text-base"
                onClick={() => handleNavigation("/profile")}
              >
                {t('profile')}
              </Button>
              
              <Button
                variant="ghost"
                className="justify-start text-base"
                onClick={() => handleNavigation("/account")}
              >
                Settings
              </Button>

              {userRole === "task_doer" && (
                <Button
                  variant="ghost"
                  className="justify-start text-base gap-2"
                  onClick={() => handleNavigation("/verification")}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {t('getVerified')}
                </Button>
              )}

              {userRole === "admin" && (
                <>
                  <Button
                    variant="ghost"
                    className="justify-start text-base gap-2"
                    onClick={() => handleNavigation("/admin/verify-users")}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Verify Users
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-base"
                    onClick={() => handleNavigation("/admin/blog")}
                  >
                    Manage Blog
                  </Button>
                </>
              )}

              <div className="border-t border-border my-2" />
              
              <Button
                variant="outline"
                className="justify-start text-base"
                onClick={handleSignOut}
              >
                {t('signOut')}
              </Button>
            </>
          )}

          {!user && (
            <>
              <Button
                variant="outline"
                size="lg"
                className="justify-center text-base font-semibold border-2"
                onClick={() => handleNavigation("/auth")}
              >
                {t('signIn')}
              </Button>
              
              <Button
                variant="hero"
                size="lg"
                className="justify-center text-base font-semibold"
                onClick={() => handleNavigation("/auth")}
              >
                {t('getStarted')}
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};