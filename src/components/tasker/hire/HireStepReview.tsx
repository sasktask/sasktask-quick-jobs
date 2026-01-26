import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, Loader2, CheckCircle, Shield, Star,
  Calendar, Clock, DollarSign, MapPin, FileText,
  Send, Lock
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface TaskDetailsData {
  title: string;
  category: string;
  description: string;
  location: string;
  isUrgent: boolean;
}

interface ScheduleData {
  date: Date | undefined;
  timeSlot: string;
  flexibility: string;
}

interface BudgetData {
  estimatedHours: number;
  budget: number;
  paymentType: "hourly" | "fixed";
}

interface HireStepReviewProps {
  taskDetails: TaskDetailsData;
  schedule: ScheduleData;
  budget: BudgetData;
  tasker: {
    id: string;
    full_name: string;
    avatar_url?: string;
    rating?: number;
    total_reviews?: number;
    city?: string;
  };
  onBack: () => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

const timeSlotLabels: Record<string, string> = {
  morning: "Morning (8 AM - 12 PM)",
  afternoon: "Afternoon (12 PM - 5 PM)",
  evening: "Evening (5 PM - 9 PM)",
};

export const HireStepReview = ({ 
  taskDetails, 
  schedule, 
  budget, 
  tasker,
  onBack,
  onSubmit,
  isSubmitting
}: HireStepReviewProps) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToEscrow, setAgreedToEscrow] = useState(false);

  const platformFee = budget.budget * 0.15;
  const taskerEarnings = budget.budget - platformFee;
  const canSubmit = agreedToTerms && agreedToEscrow && !isSubmitting;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold">Review Your Hire Request</h3>
        <p className="text-muted-foreground text-sm">
          Please review all details before sending
        </p>
      </div>

      {/* Tasker Card */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4 border border-primary/20">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage
              src={tasker.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tasker.full_name}`}
              alt={tasker.full_name}
            />
            <AvatarFallback>{tasker.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-lg">{tasker.full_name}</h4>
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {tasker.rating && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {tasker.rating.toFixed(1)} ({tasker.total_reviews || 0})
                </span>
              )}
              {tasker.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {tasker.city}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Details Summary */}
      <div className="space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Task Details
        </h4>
        <div className="bg-muted/30 rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{taskDetails.title}</p>
              <Badge variant="secondary" className="mt-1">{taskDetails.category}</Badge>
              {taskDetails.isUrgent && (
                <Badge variant="destructive" className="ml-2 mt-1">⚡ Urgent</Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {taskDetails.description}
          </p>
          {taskDetails.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{taskDetails.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Summary */}
      <div className="space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Schedule
        </h4>
        <div className="bg-muted/30 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Date</p>
              <p className="font-medium">
                {schedule.date ? format(schedule.date, "EEEE, MMM d, yyyy") : "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Time</p>
              <p className="font-medium">
                {timeSlotLabels[schedule.timeSlot] || schedule.timeSlot}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Summary */}
      <div className="space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          Payment
        </h4>
        <div className="bg-muted/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Estimated Duration</span>
            </div>
            <span className="font-medium">{budget.estimatedHours} hour{budget.estimatedHours > 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Payment Type</span>
            <Badge variant="outline">{budget.paymentType === "fixed" ? "Fixed Price" : "Hourly"}</Badge>
          </div>
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Your Budget</span>
              <span>${budget.budget.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee (15%)</span>
              <span className="text-muted-foreground">-${platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t border-border">
              <span>Tasker Receives</span>
              <span className="text-primary">${taskerEarnings.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agreement Checkboxes */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-start gap-3">
          <Checkbox
            id="escrow"
            checked={agreedToEscrow}
            onCheckedChange={(checked) => setAgreedToEscrow(checked === true)}
          />
          <label htmlFor="escrow" className="text-sm cursor-pointer">
            <span className="font-medium">I understand the escrow process</span>
            <p className="text-muted-foreground mt-0.5">
              Payment will be held securely until the task is completed and I confirm satisfaction
            </p>
          </label>
        </div>
        
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
          />
          <label htmlFor="terms" className="text-sm cursor-pointer">
            <span className="font-medium">I agree to the Terms of Service</span>
            <p className="text-muted-foreground mt-0.5">
              Including the cancellation policy and liability waiver
            </p>
          </label>
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm">
        <Lock className="h-4 w-4 text-green-600" />
        <span className="text-green-700">
          Your payment is protected by our secure escrow system
        </span>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          onClick={onBack} 
          disabled={isSubmitting}
          className="flex-1 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={!canSubmit}
          className="flex-1 gap-2"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Hire Request
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};
