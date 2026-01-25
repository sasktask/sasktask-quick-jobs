import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TaskCalendar, QuickScheduleDialog } from "@/components/calendar";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const CalendarPage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuickSchedule, setShowQuickSchedule] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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

      setUserId(session.user.id);

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      setUserRole(roleData?.role || null);
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (userRole === "task_giver") {
      setShowQuickSchedule(true);
    }
  };

  const handleTaskCreated = () => {
    // Refresh the calendar
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <SEOHead
        title="Task Calendar | SaskTask"
        description="View and manage your scheduled tasks with our interactive calendar"
      />
      
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Task Calendar</h1>
            <p className="text-muted-foreground">
              {userRole === "task_giver" 
                ? "Schedule and manage your posted tasks" 
                : "View your upcoming work schedule"}
            </p>
          </div>
          
          {userRole === "task_giver" && (
            <Button onClick={() => setShowQuickSchedule(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Quick Schedule
            </Button>
          )}
        </div>

        {userId && (
          <TaskCalendar
            userId={userId}
            userRole={userRole}
            onDateSelect={handleDateSelect}
            className="min-h-[600px]"
          />
        )}

        {/* Quick Schedule Dialog */}
        {userId && userRole === "task_giver" && (
          <QuickScheduleDialog
            open={showQuickSchedule}
            onOpenChange={setShowQuickSchedule}
            initialDate={selectedDate || new Date()}
            userId={userId}
            onTaskCreated={handleTaskCreated}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default CalendarPage;
