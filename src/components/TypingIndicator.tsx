import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  userName?: string;
  userAvatar?: string;
  variant?: 'default' | 'minimal' | 'bubble';
  className?: string;
}

export const TypingIndicator = ({ 
  userName, 
  userAvatar,
  variant = 'default',
  className 
}: TypingIndicatorProps) => {
  if (variant === 'minimal') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn("flex items-center gap-1", className)}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    );
  }

  if (variant === 'bubble') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.9 }}
        className={cn("flex items-start gap-2", className)}
      >
        {userAvatar !== undefined && (
          <Avatar className="h-8 w-8 ring-2 ring-primary/20">
            <AvatarImage src={userAvatar} />
            <AvatarFallback className="bg-primary/10 text-xs">
              {userName?.[0]?.toUpperCase() || <User className="h-3 w-3" />}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="bg-muted/60 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 bg-primary/50 rounded-full"
                animate={{
                  y: [0, -6, 0],
                  backgroundColor: [
                    "hsl(var(--primary) / 0.3)",
                    "hsl(var(--primary) / 0.8)",
                    "hsl(var(--primary) / 0.3)",
                  ],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.12,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 bg-muted/40 backdrop-blur-sm rounded-full w-fit",
        className
      )}
    >
      {userAvatar !== undefined && (
        <Avatar className="h-6 w-6 ring-2 ring-background">
          <AvatarImage src={userAvatar} />
          <AvatarFallback className="bg-primary/10 text-[10px]">
            {userName?.[0]?.toUpperCase() || <User className="h-2.5 w-2.5" />}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary/60 rounded-full"
              animate={{
                y: [0, -4, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {userName ? `${userName} is typing` : "typing"}
        </span>
      </div>
    </motion.div>
  );
};

// Export a simpler dots-only version
export const TypingDots = ({ className }: { className?: string }) => (
  <div className={cn("flex gap-1 p-2", className)}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-2 h-2 bg-muted-foreground/50 rounded-full"
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.1,
        }}
      />
    ))}
  </div>
);

export default TypingIndicator;
