import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CheckCircle, MessageSquare, Calendar, ArrowRight, 
  PartyPopper, Bell
} from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface HireSuccessScreenProps {
  tasker: {
    full_name: string;
    avatar_url?: string;
  };
  taskTitle: string;
  onViewBookings: () => void;
  onMessageTasker: () => void;
  onClose: () => void;
}

export const HireSuccessScreen = ({
  tasker,
  taskTitle,
  onViewBookings,
  onMessageTasker,
  onClose
}: HireSuccessScreenProps) => {
  useEffect(() => {
    // Trigger confetti animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-6 space-y-6"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="relative mx-auto w-24 h-24"
      >
        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
        <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
      </motion.div>

      {/* Success Message */}
      <div className="space-y-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2"
        >
          <PartyPopper className="h-6 w-6 text-yellow-500" />
          <h3 className="text-2xl font-bold">Hire Request Sent!</h3>
          <PartyPopper className="h-6 w-6 text-yellow-500 transform scale-x-[-1]" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground"
        >
          Your task offer has been sent successfully
        </motion.p>
      </div>

      {/* Tasker Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-muted/50 rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center justify-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage
              src={tasker.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tasker.full_name}`}
              alt={tasker.full_name}
            />
            <AvatarFallback>{tasker.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className="font-bold text-lg">{tasker.full_name}</p>
            <p className="text-sm text-muted-foreground">
              Will be notified of your request
            </p>
          </div>
        </div>

        <div className="bg-background/50 rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Task</p>
          <p className="font-medium">{taskTitle}</p>
        </div>
      </motion.div>

      {/* What's Next */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3"
      >
        <h4 className="font-semibold flex items-center justify-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          What happens next?
        </h4>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>1. {tasker.full_name} will receive your offer</p>
          <p>2. They'll review and respond within 24 hours</p>
          <p>3. Once accepted, you can coordinate details via chat</p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-3 pt-4"
      >
        <Button onClick={onMessageTasker} className="w-full gap-2" size="lg">
          <MessageSquare className="h-4 w-4" />
          Message {tasker.full_name.split(' ')[0]}
        </Button>
        
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onViewBookings} className="gap-2">
            <Calendar className="h-4 w-4" />
            View Bookings
          </Button>
          <Button variant="ghost" onClick={onClose} className="gap-2">
            Continue Browsing
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
