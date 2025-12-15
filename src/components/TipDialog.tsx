import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Heart, 
  Star, 
  DollarSign, 
  Sparkles,
  Check,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskTitle: string;
  taskerName: string;
  taskerAvatar?: string;
  taskAmount: number;
  bookingId: string;
  paymentId?: string;
  onTipComplete?: (tipAmount: number) => void;
}

const tipPercentages = [
  { value: 10, label: "10%", emoji: "😊" },
  { value: 15, label: "15%", emoji: "🙂" },
  { value: 20, label: "20%", emoji: "😄" },
  { value: 25, label: "25%", emoji: "🤩" },
];

const quickTipAmounts = [
  { value: 5, label: "$5" },
  { value: 10, label: "$10" },
  { value: 15, label: "$15" },
  { value: 20, label: "$20" },
];

export function TipDialog({
  open,
  onOpenChange,
  taskTitle,
  taskerName,
  taskerAvatar,
  taskAmount,
  bookingId,
  paymentId,
  onTipComplete
}: TipDialogProps) {
  const { toast } = useToast();
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(15);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [tipMode, setTipMode] = useState<"percentage" | "amount">("percentage");
  const [isProcessing, setIsProcessing] = useState(false);
  const [tipSent, setTipSent] = useState(false);

  const calculateTip = () => {
    if (tipMode === "percentage" && selectedPercentage) {
      return (taskAmount * selectedPercentage) / 100;
    }
    if (tipMode === "amount" && selectedAmount) {
      return selectedAmount;
    }
    if (customAmount) {
      return parseFloat(customAmount) || 0;
    }
    return 0;
  };

  const tipAmount = calculateTip();

  const handlePercentageSelect = (value: number) => {
    setSelectedPercentage(value);
    setSelectedAmount(null);
    setCustomAmount("");
    setTipMode("percentage");
  };

  const handleAmountSelect = (value: number) => {
    setSelectedAmount(value);
    setSelectedPercentage(null);
    setCustomAmount("");
    setTipMode("amount");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedPercentage(null);
    setSelectedAmount(null);
    setTipMode("amount");
  };

  const handleSendTip = async () => {
    if (tipAmount <= 0) {
      toast({
        title: "Please select a tip amount",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // For now, we'll record the tip in a notification/toast
      // In a full implementation, this would call a Stripe edge function
      // to process the tip payment
      
      // Create a notification for the tasker
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Get booking details
      const { data: booking } = await supabase
        .from("bookings")
        .select("task_doer_id")
        .eq("id", bookingId)
        .single();

      if (booking) {
        // Create notification for the tasker
        await supabase.from("notifications").insert({
          user_id: booking.task_doer_id,
          type: "tip_received",
          title: "You received a tip! 🎉",
          message: `You received a $${tipAmount.toFixed(2)} tip for "${taskTitle}"`,
          link: `/bookings`
        });
      }

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setTipSent(true);
      
      toast({
        title: "Tip sent! 💝",
        description: `$${tipAmount.toFixed(2)} tip sent to ${taskerName}`,
      });

      setTimeout(() => {
        onTipComplete?.(tipAmount);
        onOpenChange(false);
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Error sending tip",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkipTip = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {tipSent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="mx-auto h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mb-4"
              >
                <Check className="h-10 w-10 text-green-500" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Tip Sent!</h3>
              <p className="text-muted-foreground">
                ${tipAmount.toFixed(2)} is on its way to {taskerName}
              </p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 flex justify-center gap-2"
              >
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Thank you for your generosity!</span>
                <Sparkles className="h-5 w-5 text-yellow-500" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  Add a Tip
                </DialogTitle>
                <DialogDescription>
                  Show appreciation for great work
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Tasker Info */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <Avatar className="h-14 w-14 border-2 border-primary/20">
                    <AvatarImage src={taskerAvatar} />
                    <AvatarFallback>{taskerName?.charAt(0) || "T"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{taskerName}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{taskTitle}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-xs text-muted-foreground">Great job!</span>
                    </div>
                  </div>
                </div>

                {/* Percentage Tips */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Tip by percentage</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {tipPercentages.map((tip) => {
                      const amount = (taskAmount * tip.value) / 100;
                      const isSelected = tipMode === "percentage" && selectedPercentage === tip.value;
                      return (
                        <motion.button
                          key={tip.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handlePercentageSelect(tip.value)}
                          className={cn(
                            "relative p-3 rounded-xl border-2 transition-all text-center",
                            isSelected
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="tipSelection"
                              className="absolute inset-0 bg-primary/10 rounded-xl"
                              initial={false}
                            />
                          )}
                          <div className="relative">
                            <span className="text-2xl">{tip.emoji}</span>
                            <p className="font-bold text-sm mt-1">{tip.label}</p>
                            <p className="text-xs text-muted-foreground">${amount.toFixed(0)}</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <Separator className="flex-1" />
                </div>

                {/* Quick Amount Tips */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Quick amounts</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {quickTipAmounts.map((tip) => {
                      const isSelected = tipMode === "amount" && selectedAmount === tip.value;
                      return (
                        <Button
                          key={tip.value}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAmountSelect(tip.value)}
                          className={cn(
                            "h-10",
                            isSelected && "ring-2 ring-primary ring-offset-2"
                          )}
                        >
                          {tip.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Amount */}
                <div className="space-y-2">
                  <Label htmlFor="customTip" className="text-sm font-medium">
                    Custom amount
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="customTip"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                {/* Total */}
                {tipAmount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-lg border border-primary/20"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Tip amount</span>
                      <span className="text-2xl font-bold text-primary">
                        ${tipAmount.toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={handleSkipTip}
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    Maybe Later
                  </Button>
                  <Button
                    onClick={handleSendTip}
                    disabled={tipAmount <= 0 || isProcessing}
                    className="flex-1 gap-2 bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Heart className="h-4 w-4" />
                        Send Tip
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
