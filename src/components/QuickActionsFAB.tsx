import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  X, 
  Search, 
  MessageSquare, 
  Briefcase, 
  User,
  MapPin,
  Bell,
  HelpCircle,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionsFABProps {
  userRole?: string | null;
}

const taskGiverActions = [
  { icon: Plus, label: "Post Task", href: "/post-task", color: "bg-primary" },
  { icon: Search, label: "Find Taskers", href: "/find-taskers", color: "bg-blue-500" },
  { icon: Briefcase, label: "My Tasks", href: "/my-tasks", color: "bg-orange-500" },
  { icon: MessageSquare, label: "Messages", href: "/messages", color: "bg-green-500" },
];

const taskDoerActions = [
  { icon: Search, label: "Browse Tasks", href: "/browse", color: "bg-primary" },
  { icon: MapPin, label: "Map View", href: "/map", color: "bg-blue-500" },
  { icon: Briefcase, label: "Bookings", href: "/bookings", color: "bg-orange-500" },
  { icon: MessageSquare, label: "Messages", href: "/messages", color: "bg-green-500" },
];

export function QuickActionsFAB({ userRole }: QuickActionsFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const actions = userRole === "task_giver" ? taskGiverActions : taskDoerActions;

  return (
    <div className="fixed bottom-20 right-4 z-50 lg:bottom-6 lg:right-6">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Actions */}
            <div className="absolute bottom-16 right-0 flex flex-col-reverse gap-3">
              {actions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={action.href} onClick={() => setIsOpen(false)}>
                    <div className="flex items-center gap-3 group">
                      <span className="bg-background border border-border px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {action.label}
                      </span>
                      <Button
                        size="icon"
                        className={cn(
                          "h-12 w-12 rounded-full shadow-lg transition-transform hover:scale-110",
                          action.color,
                          "text-white"
                        )}
                      >
                        <action.icon className="h-5 w-5" />
                      </Button>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-14 w-14 rounded-full shadow-xl transition-all",
            isOpen 
              ? "bg-muted text-foreground rotate-45" 
              : "bg-primary text-primary-foreground"
          )}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
          </motion.div>
        </Button>
      </motion.div>
    </div>
  );
}
