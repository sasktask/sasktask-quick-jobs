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

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  userRole: string | null;
}

export const MobileMenu = ({ isOpen, onClose, user, userRole }: MobileMenuProps) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);
    
    if (data !== null) {
      setUnreadCount(data.length || 0);
    }
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
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col gap-4 mt-8">
          {/* Main Navigation */}
          <Button
            variant="ghost"
            className="justify-start text-base"
            onClick={() => handleNavigation("/browse")}
          >
            Browse Tasks
          </Button>
          
          <Button
            variant="ghost"
            className="justify-start text-base"
            onClick={() => handleNavigation("/find-taskers")}
          >
            Find Taskers
          </Button>
          
          <Button
            variant="ghost"
            className="justify-start text-base gap-2"
            onClick={() => handleNavigation("/become-tasker")}
          >
            <ShieldCheck className="h-4 w-4" />
            Become a Tasker
          </Button>

          <div className="border-t border-border my-2" />

          {user ? (
            <>
              <Button
                variant="ghost"
                className="justify-start text-base gap-2 relative"
                onClick={() => handleNavigation("/dashboard")}
              >
                <Bell className="h-4 w-4" />
                Notifications
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>

              <div className="border-t border-border my-2" />
              
              <Button
                variant="ghost"
                className="justify-start text-base"
                onClick={() => handleNavigation("/dashboard")}
              >
                Dashboard
              </Button>
              
              <Button
                variant="ghost"
                className="justify-start text-base"
                onClick={() => handleNavigation("/bookings")}
              >
                Bookings
              </Button>
              
              <Button
                variant="ghost"
                className="justify-start text-base"
                onClick={() => handleNavigation("/profile")}
              >
                Profile
              </Button>

              {userRole === "task_doer" && (
                <Button
                  variant="ghost"
                  className="justify-start text-base gap-2"
                  onClick={() => handleNavigation("/verification")}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Get Verified
                </Button>
              )}

              {userRole === "admin" && (
                <Button
                  variant="ghost"
                  className="justify-start text-base gap-2"
                  onClick={() => handleNavigation("/admin/verify-users")}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Verify Users
                </Button>
              )}

              <div className="border-t border-border my-2" />
              
              <Button
                variant="outline"
                className="justify-start text-base"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="lg"
                className="justify-center text-base font-semibold border-2"
                onClick={() => handleNavigation("/auth")}
              >
                Sign In
              </Button>
              
              <Button
                variant="hero"
                size="lg"
                className="justify-center text-base font-semibold"
                onClick={() => handleNavigation("/auth")}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};