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
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EscrowStatusCardProps {
  amount: number;
  status: "pending" | "held" | "released" | "refunded" | "disputed";
  platformFee?: number;
  payoutAmount?: number;
  isTaskGiver: boolean;
  onRelease?: () => void;
  onDispute?: () => void;
  isLoading?: boolean;
}

export const EscrowStatusCard = ({
  amount,
  status,
  platformFee = 0,
  payoutAmount = 0,
  isTaskGiver,
  onRelease,
  onDispute,
  isLoading = false
}: EscrowStatusCardProps) => {
  const statusConfig = {
    pending: {
      label: "Awaiting Payment",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
      icon: Clock,
      progress: 25
    },
    held: {
      label: "Secured in Escrow",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      icon: Lock,
      progress: 50
    },
    released: {
      label: "Payment Released",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      icon: Unlock,
      progress: 100
    },
    refunded: {
      label: "Refunded",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      icon: ArrowRight,
      progress: 0
    },
    disputed: {
      label: "Under Review",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      icon: AlertCircle,
      progress: 50
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("border-2", config.borderColor)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Payment Protection
            </CardTitle>
            <Badge className={cn(config.bgColor, config.color, "border-0")}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Payment</span>
              <span>Escrow</span>
              <span>Released</span>
            </div>
            <Progress value={config.progress} className="h-2" />
          </div>

          {/* Amount breakdown */}
          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Task Amount</span>
              <span className="font-semibold">${amount.toFixed(2)}</span>
            </div>
            {platformFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Fee</span>
                <span className="text-muted-foreground">-${platformFee.toFixed(2)}</span>
              </div>
            )}
            {payoutAmount > 0 && (
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">Payout Amount</span>
                <span className="font-bold text-primary">${payoutAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Security message */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              {status === "held" 
                ? "Funds are securely held until the task is completed and approved."
                : status === "released"
                ? "Payment has been successfully transferred to the tasker."
                : "Your payment is protected by our escrow system."}
            </p>
          </div>

          {/* Actions */}
          {status === "held" && isTaskGiver && (
            <div className="flex gap-2">
              <Button 
                onClick={onRelease} 
                disabled={isLoading}
                className="flex-1"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Release Payment
              </Button>
              <Button 
                variant="outline" 
                onClick={onDispute}
                disabled={isLoading}
              >
                Report Issue
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
