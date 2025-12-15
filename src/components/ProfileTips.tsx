import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Camera,
  FileText,
  Star,
  MessageSquare,
  Clock,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Tip {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
}

const tips: Tip[] = [
  {
    id: "photo",
    title: "Add a Professional Photo",
    description: "Profiles with clear, professional photos receive 10x more responses. Use a well-lit headshot showing your face clearly.",
    icon: Camera,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  {
    id: "bio",
    title: "Write a Compelling Bio",
    description: "Highlight your experience, skills, and what makes you unique. Be specific about the types of tasks you excel at.",
    icon: FileText,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  },
  {
    id: "response",
    title: "Respond Quickly",
    description: "Fast responses lead to more bookings. Enable notifications and try to respond within an hour for best results.",
    icon: Clock,
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
  {
    id: "reviews",
    title: "Collect Great Reviews",
    description: "After completing tasks, politely ask satisfied clients to leave a review. Reviews boost your visibility significantly.",
    icon: Star,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10"
  },
  {
    id: "communication",
    title: "Communicate Clearly",
    description: "Set clear expectations about timing, pricing, and deliverables. Good communication prevents disputes and leads to better reviews.",
    icon: MessageSquare,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10"
  },
  {
    id: "verification",
    title: "Get Verified",
    description: "Complete identity verification and background checks to build trust. Verified taskers earn 3x more on average.",
    icon: Shield,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10"
  }
];

interface ProfileTipsProps {
  className?: string;
  onDismiss?: () => void;
}

export function ProfileTips({ className, onDismiss }: ProfileTipsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const currentTip = tips[currentIndex];
  const Icon = currentTip.icon;

  const nextTip = () => {
    setCurrentIndex((prev) => (prev + 1) % tips.length);
  };

  const prevTip = () => {
    setCurrentIndex((prev) => (prev - 1 + tips.length) % tips.length);
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <Card className={cn("border-border overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-sm">Pro Tips</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentTip.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                currentTip.bgColor
              )}>
                <Icon className={cn("h-5 w-5", currentTip.color)} />
              </div>
              <div>
                <h4 className="font-medium text-sm">{currentTip.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {currentTip.description}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-1">
            {tips.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === currentIndex
                    ? "w-4 bg-primary"
                    : "w-1.5 bg-muted hover:bg-muted-foreground/50"
                )}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={prevTip}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={nextTip}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
