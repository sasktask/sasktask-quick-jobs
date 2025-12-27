import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Loader2 } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [stats, setStats] = useState({
    unreadMessages: 0,
    pendingBookings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Fetch user roles
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      
      const roles = rolesData?.map(r => r.role) || [];
      setUserRoles(roles);
      const adminRole = roles.find(r => r === 'admin');
      const taskDoerRole = roles.find(r => r === 'task_doer');
      const taskGiverRole = roles.find(r => r === 'task_giver');
      setUserRole(adminRole || taskDoerRole || taskGiverRole || null);

      // Fetch verification status
      const { data: verificationData } = await supabase
        .from("verifications")
        .select("verification_status")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      setIsVerified(verificationData?.verification_status === "verified");

      // Fetch stats
      const [messagesResult, bookingsResult] = await Promise.all([
        supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("receiver_id", session.user.id)
          .is("read_at", null),
        supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("task_doer_id", session.user.id)
          .eq("status", "pending")
      ]);

      setStats({
        unreadMessages: messagesResult.count || 0,
        pendingBookings: bookingsResult.count || 0,
      });
    } catch (error) {
      console.error("Error loading layout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex pt-16">
        {/* Sidebar - Hidden on mobile */}
        <DashboardSidebar
          userRole={userRole}
          userRoles={userRoles}
          unreadMessages={stats.unreadMessages}
          pendingBookings={stats.pendingBookings}
          isVerified={isVerified}
          userId={user?.id}
          className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)]"
        />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
