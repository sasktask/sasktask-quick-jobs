import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shield, Star, X } from "lucide-react";
import { FileText, Calendar, DollarSign, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AnimatePresence, motion } from "framer-motion";

import { HireStepIndicator } from "./HireStepIndicator";
import { HireStepTaskDetails } from "./HireStepTaskDetails";
import { HireStepSchedule } from "./HireStepSchedule";
import { HireStepBudget } from "./HireStepBudget";
import { HireStepReview } from "./HireStepReview";
import { HireSuccessScreen } from "./HireSuccessScreen";

interface EnhancedHireWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasker: {
    id: string;
    full_name: string;
    avatar_url?: string;
    rating?: number;
    total_reviews?: number;
    hourly_rate?: number;
    skills?: string[];
    city?: string;
  };
}

const steps = [
  { label: "Details", icon: <FileText className="h-4 w-4" /> },
  { label: "Schedule", icon: <Calendar className="h-4 w-4" /> },
  { label: "Budget", icon: <DollarSign className="h-4 w-4" /> },
  { label: "Review", icon: <CheckCircle className="h-4 w-4" /> },
];

export const EnhancedHireWizard = ({ open, onOpenChange, tasker }: EnhancedHireWizardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form data
  const [taskDetails, setTaskDetails] = useState({
    title: "",
    category: tasker.skills?.[0] || "",
    description: "",
    location: "",
    isUrgent: false,
  });

  const [schedule, setSchedule] = useState({
    date: undefined as Date | undefined,
    timeSlot: "",
    flexibility: "flexible_1hr",
  });

  const [budget, setBudget] = useState({
    estimatedHours: 2,
    budget: tasker.hourly_rate ? tasker.hourly_rate * 2 : 50,
    paymentType: "fixed" as "hourly" | "fixed",
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to hire a tasker",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Create the task
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .insert({
          task_giver_id: user.id,
          title: taskDetails.title,
          category: taskDetails.category,
          description: taskDetails.description || `Task for ${tasker.full_name}`,
          scheduled_date: schedule.date?.toISOString(),
          pay_amount: budget.budget,
          location: taskDetails.location || "TBD",
          status: "open" as const,
          priority: taskDetails.isUrgent ? "high" as const : "medium" as const,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Create a booking directly with this tasker
      const { error: bookingError } = await supabase
        .from("bookings")
        .insert({
          task_id: task.id,
          task_doer_id: tasker.id,
          status: "pending",
          message: `Direct hire request: ${taskDetails.title}\n\nEstimated duration: ${budget.estimatedHours} hours\nScheduled: ${schedule.date ? schedule.date.toLocaleDateString() : 'TBD'} (${schedule.timeSlot})\nBudget: $${budget.budget}`,
        });

      if (bookingError) throw bookingError;

      // Notify the tasker
      await supabase
        .from("notifications")
        .insert({
          user_id: tasker.id,
          title: "New Hire Request! 🎉",
          message: `You've been directly invited to work on: ${taskDetails.title}`,
          type: "booking",
          link: `/bookings`,
        });

      // Log audit event
      await supabase
        .from("audit_trail_events")
        .insert({
          user_id: user.id,
          task_id: task.id,
          event_type: "task_created",
          event_category: "task",
          event_data: {
            type: "direct_hire",
            tasker_id: tasker.id,
            budget: budget.budget,
          },
        });

      setIsSuccess(true);
    } catch (error: any) {
      console.error("Error creating hire request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send hire request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewBookings = () => {
    onOpenChange(false);
    navigate("/bookings");
  };

  const handleMessageTasker = () => {
    onOpenChange(false);
    navigate(`/messages?contact=${tasker.id}`);
  };

  const handleClose = () => {
    // Reset state
    setCurrentStep(0);
    setIsSuccess(false);
    setTaskDetails({
      title: "",
      category: tasker.skills?.[0] || "",
      description: "",
      location: "",
      isUrgent: false,
    });
    setSchedule({
      date: undefined,
      timeSlot: "",
      flexibility: "flexible_1hr",
    });
    setBudget({
      estimatedHours: 2,
      budget: tasker.hourly_rate ? tasker.hourly_rate * 2 : 50,
      paymentType: "fixed",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage
                  src={tasker.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tasker.full_name}`}
                  alt={tasker.full_name}
                />
                <AvatarFallback>{tasker.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">{tasker.full_name}</span>
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {tasker.rating && (
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {tasker.rating.toFixed(1)}
                    </span>
                  )}
                  {tasker.hourly_rate && (
                    <Badge variant="secondary" className="text-xs">
                      ${tasker.hourly_rate}/hr
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-1.5 hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Step Indicator - only show if not success */}
          {!isSuccess && (
            <HireStepIndicator currentStep={currentStep} steps={steps} />
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <HireSuccessScreen
                tasker={tasker}
                taskTitle={taskDetails.title}
                onViewBookings={handleViewBookings}
                onMessageTasker={handleMessageTasker}
                onClose={handleClose}
              />
            ) : (
              <>
                {currentStep === 0 && (
                  <HireStepTaskDetails
                    data={taskDetails}
                    onChange={setTaskDetails}
                    onNext={handleNext}
                    taskerSkills={tasker.skills}
                  />
                )}
                {currentStep === 1 && (
                  <HireStepSchedule
                    data={schedule}
                    onChange={setSchedule}
                    onNext={handleNext}
                    onBack={handleBack}
                    isUrgent={taskDetails.isUrgent}
                  />
                )}
                {currentStep === 2 && (
                  <HireStepBudget
                    data={budget}
                    onChange={setBudget}
                    onNext={handleNext}
                    onBack={handleBack}
                    taskerHourlyRate={tasker.hourly_rate}
                  />
                )}
                {currentStep === 3 && (
                  <HireStepReview
                    taskDetails={taskDetails}
                    schedule={schedule}
                    budget={budget}
                    tasker={tasker}
                    onBack={handleBack}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                  />
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
