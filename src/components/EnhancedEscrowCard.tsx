import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Lock,
  Unlock,
  AlertCircle,
  TrendingUp,
  Banknote,
  CreditCard,
  Wallet,
  Sparkles,
  Timer,
  ArrowUpRight,
  FileText,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInHours, differenceInMinutes, format } from "date-fns";

interface Milestone {
  id: string;
  title: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'paid';
  dueDate?: string;
}

interface EnhancedEscrowCardProps {
  amount: number;
  status: "pending" | "held" | "released" | "refunded" | "disputed" | "auto_releasing";
  platformFee?: number;
  payoutAmount?: number;
  taxDeducted?: number;
  isTaskGiver: boolean;
  onRelease?: () => void;
  onDispute?: () => void;
  isLoading?: boolean;
  milestones?: Milestone[];
  autoReleaseAt?: string;
  depositAmount?: number;
  depositStatus?: "pending" | "paid" | "refunded";
}

export const EnhancedEscrowCard = ({
  amount,
  status,
  platformFee = 0,
  payoutAmount = 0,
  taxDeducted = 0,
  isTaskGiver,
  onRelease,
  onDispute,
  isLoading = false,
  milestones = [],
  autoReleaseAt,
  depositAmount = 0,
  depositStatus = "pending"
}: EnhancedEscrowCardProps) => {
  const [countdown, setCountdown] = useState<string>("");
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Auto-release countdown
  useEffect(() => {
    if (status === "auto_releasing" && autoReleaseAt) {
      const updateCountdown = () => {
        const now = new Date();
        const releaseTime = new Date(autoReleaseAt);
        const hoursLeft = differenceInHours(releaseTime, now);
        const minutesLeft = differenceInMinutes(releaseTime, now) % 60;
        
        if (hoursLeft > 0) {
          setCountdown(`${hoursLeft}h ${minutesLeft}m`);
        } else if (minutesLeft > 0) {
          setCountdown(`${minutesLeft}m`);
        } else {
          setCountdown("Releasing...");
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 60000);
      return () => clearInterval(interval);
    }
  }, [status, autoReleaseAt]);

  const statusConfig = {
    pending: {
      label: "Awaiting Payment",
      color: "text-yellow-600",
      bgColor: "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/20",
      borderColor: "border-yellow-200 dark:border-yellow-800/50",
      icon: Clock,
      progress: 20,
      description: "Payment is being processed"
    },
    held: {
      label: "Secured in Escrow",
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20",
      borderColor: "border-blue-200 dark:border-blue-800/50",
      icon: Lock,
      progress: 50,
      description: "Funds protected until task completion"
    },
    auto_releasing: {
      label: "Auto-Release Pending",
      color: "text-amber-600",
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20",
      borderColor: "border-amber-200 dark:border-amber-800/50",
      icon: Timer,
      progress: 75,
      description: `Releasing in ${countdown}`
    },
    released: {
      label: "Payment Released",
      color: "text-green-600",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20",
      borderColor: "border-green-200 dark:border-green-800/50",
      icon: Unlock,
      progress: 100,
      description: "Funds transferred successfully"
    },
    refunded: {
      label: "Refunded",
      color: "text-orange-600",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/20",
      borderColor: "border-orange-200 dark:border-orange-800/50",
      icon: ArrowRight,
      progress: 0,
      description: "Amount returned to task giver"
    },
    disputed: {
      label: "Under Review",
      color: "text-red-600",
      bgColor: "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/20",
      borderColor: "border-red-200 dark:border-red-800/50",
      icon: AlertCircle,
      progress: 50,
      description: "Dispute is being reviewed by our team"
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const completedMilestones = milestones.filter(m => m.status === 'completed' || m.status === 'paid').length;
  const milestoneProgress = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className={cn("border-2 overflow-hidden", config.borderColor, config.bgColor)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <motion.div
                animate={{ 
                  scale: status === "held" || status === "auto_releasing" ? [1, 1.1, 1] : 1 
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Shield className="h-5 w-5 text-primary" />
              </motion.div>
              Payment Protection
            </CardTitle>
            <Badge className={cn(config.bgColor, config.color, "border shadow-sm px-3 py-1")}>
              <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
              {config.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Main Amount Display */}
          <div className="text-center py-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-block"
            >
              <p className="text-sm text-muted-foreground mb-1">
                {isTaskGiver ? "Amount Secured" : "You'll Receive"}
              </p>
              <p className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                ${(isTaskGiver ? amount : payoutAmount).toFixed(2)}
              </p>
            </motion.div>
          </div>

          {/* Progress Timeline */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span className={status !== 'pending' ? 'text-green-600' : ''}>Paid</span>
              <span className={['held', 'auto_releasing', 'released'].includes(status) ? 'text-green-600' : ''}>Escrow</span>
              <span className={status === 'released' ? 'text-green-600' : ''}>Released</span>
            </div>
            <div className="relative">
              <Progress value={config.progress} className="h-2.5" />
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-primary border-2 border-white shadow-lg"
                style={{ left: `${config.progress}%`, marginLeft: '-8px' }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </div>

          {/* Auto-release countdown */}
          {status === "auto_releasing" && countdown && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center justify-center gap-2 p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800"
            >
              <Timer className="h-5 w-5 text-amber-600 animate-pulse" />
              <span className="font-medium text-amber-700 dark:text-amber-400">
                Auto-releasing in {countdown}
              </span>
            </motion.div>
          )}

          {/* Amount Breakdown */}
          <motion.div
            className="space-y-1"
            initial={false}
          >
            <Button
              variant="ghost"
              className="w-full justify-between hover:bg-transparent p-0 h-auto"
              onClick={() => setShowBreakdown(!showBreakdown)}
            >
              <span className="text-sm font-medium">Payment Breakdown</span>
              <motion.div
                animate={{ rotate: showBreakdown ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowUpRight className="h-4 w-4" />
              </motion.div>
            </Button>

            <AnimatePresence>
              {showBreakdown && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 p-4 rounded-xl bg-white/50 dark:bg-black/20 border"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      Task Amount
                    </span>
                    <span className="font-semibold">${amount.toFixed(2)}</span>
                  </div>
                  
                  {depositAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Deposit ({depositStatus})
                      </span>
                      <span className={depositStatus === 'paid' ? 'text-green-600' : ''}>
                        ${depositAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {platformFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Platform Fee (10%)
                      </span>
                      <span className="text-muted-foreground">-${platformFee.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {taxDeducted > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Tax Withheld
                      </span>
                      <span className="text-muted-foreground">-${taxDeducted.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-3 border-t">
                    <span className="font-semibold flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-primary" />
                      {isTaskGiver ? "Total Paid" : "Your Payout"}
                    </span>
                    <span className="font-bold text-lg text-primary">
                      ${(isTaskGiver ? amount : payoutAmount).toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Milestones */}
          {milestones.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Milestones
                </p>
                <Badge variant="outline">
                  {completedMilestones}/{milestones.length}
                </Badge>
              </div>
              <Progress value={milestoneProgress} className="h-1.5" />
              <div className="space-y-2">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      milestone.status === 'completed' || milestone.status === 'paid'
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200'
                        : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {milestone.status === 'completed' || milestone.status === 'paid' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      <span className="text-sm">{milestone.title}</span>
                    </div>
                    <span className="text-sm font-medium">${milestone.amount.toFixed(2)}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Security message */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          </div>

          {/* Actions */}
          {(status === "held" || status === "auto_releasing") && isTaskGiver && (
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={onRelease} 
                disabled={isLoading}
                className="flex-1 gap-2 h-12"
                size="lg"
              >
                <DollarSign className="h-5 w-5" />
                Release Payment
              </Button>
              <Button 
                variant="outline" 
                onClick={onDispute}
                disabled={isLoading}
                className="gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Report Issue
              </Button>
            </div>
          )}

          {status === "disputed" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
            >
              <p className="text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Our team is reviewing this dispute. You'll be notified of the resolution.
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};