import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Clock,
  Shield,
  AlertTriangle,
  MessageSquare,
  Loader2,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HireRequest {
  id: string;
  task_id: string;
  hire_amount: number;
  message: string;
  created_at: string;
  tasker_decision: string;
  task: {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    scheduled_date: string;
    priority: string;
    task_giver: {
      id: string;
      full_name: string;
      avatar_url: string;
      rating: number;
      total_reviews: number;
    };
  };
}

interface IncomingHireRequestCardProps {
  request: HireRequest;
  onDecisionMade: () => void;
}

const declineReasons = [
  "Not available on the requested date",
  "Location is too far",
  "Budget doesn't match my rates",
  "Already booked for this time",
  "Task requirements unclear",
  "Other (please specify)"
];

export const IncomingHireRequestCard = ({ request, onDecisionMade }: IncomingHireRequestCardProps) => {
  const { toast } = useToast();
  const [isAccepting, setIsAccepting] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const { data, error } = await supabase.functions.invoke('handle-tasker-decision', {
        body: {
          booking_id: request.id,
          decision: 'accepted'
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast({
        title: "🎉 Hire Request Accepted!",
        description: `You've accepted the job "${request.task.title}". $${request.hire_amount.toFixed(2)} is secured in escrow.`,
      });

      onDecisionMade();
    } catch (error: any) {
      console.error("Accept error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept request",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    const finalReason = selectedReason === "Other (please specify)" 
      ? declineReason 
      : selectedReason;

    if (!finalReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for declining",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('handle-tasker-decision', {
        body: {
          booking_id: request.id,
          decision: 'declined',
          decline_reason: finalReason
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast({
        title: "Request Declined",
        description: "The task giver has been notified and refunded.",
      });

      setShowDeclineDialog(false);
      onDecisionMade();
    } catch (error: any) {
      console.error("Decline error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to decline request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage 
                      src={request.task.task_giver.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.task.task_giver.full_name}`} 
                    />
                    <AvatarFallback>{request.task.task_giver.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-medium">{request.task.task_giver.full_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>⭐ {request.task.task_giver.rating?.toFixed(1) || 'New'}</span>
                    <span>•</span>
                    <span>{request.task.task_giver.total_reviews || 0} reviews</span>
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                New Request
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Task Title & Category */}
            <div>
              <CardTitle className="text-lg mb-1">{request.task.title}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {request.task.category}
              </Badge>
            </div>

            {/* Hire Amount - Prominent Display */}
            <motion.div 
              className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-green-500 rounded-full p-2">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Hire Amount (Secured in Escrow)</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${request.hire_amount?.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600 bg-green-500/10 px-2 py-1 rounded-full">
                  <Shield className="h-3 w-3" />
                  <span>Protected</span>
                </div>
              </div>
            </motion.div>

            {/* Task Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {request.task.scheduled_date 
                    ? format(new Date(request.task.scheduled_date), 'MMM d, yyyy')
                    : 'Flexible'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{request.task.location || 'TBD'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{format(new Date(request.created_at), 'MMM d, h:mm a')}</span>
              </div>
              {request.task.priority === 'high' && (
                <div className="flex items-center gap-2 text-orange-500">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Urgent</span>
                </div>
              )}
            </div>

            {/* Message from Task Giver */}
            {request.message && (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>Message from Task Giver</span>
                </div>
                <p className="text-sm">{request.message}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setShowDeclineDialog(true)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Decline
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                onClick={handleAccept}
                disabled={isAccepting}
              >
                {isAccepting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Accept Job
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Decline Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Decline Hire Request
            </DialogTitle>
            <DialogDescription>
              Please let the task giver know why you're declining. This helps them understand and find another tasker.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Quick Reason Buttons */}
            <div className="flex flex-wrap gap-2">
              {declineReasons.map((reason) => (
                <Button
                  key={reason}
                  variant={selectedReason === reason ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedReason(reason)}
                  className="text-xs"
                >
                  {reason}
                </Button>
              ))}
            </div>

            {/* Custom Reason */}
            {selectedReason === "Other (please specify)" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <Textarea
                  placeholder="Please provide your reason..."
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </motion.div>
            )}

            {/* Refund Notice */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-sm">
              <Sparkles className="h-4 w-4 text-blue-500 mt-0.5" />
              <p className="text-muted-foreground">
                The task giver will receive a full refund of <span className="font-semibold text-foreground">${request.hire_amount?.toFixed(2)}</span> to their wallet.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeclineDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDecline}
              disabled={isSubmitting || !selectedReason}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Confirm Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
