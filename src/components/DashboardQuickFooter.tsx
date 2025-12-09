import { Link } from "react-router-dom";
import { 
  MessageSquare, 
  Briefcase, 
  Search, 
  Plus, 
  Bell,
  User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardQuickFooterProps {
  userRole: string | null;
  unreadMessages: number;
  pendingBookings: number;
}

export const DashboardQuickFooter = ({ 
  userRole, 
  unreadMessages, 
  pendingBookings 
}: DashboardQuickFooterProps) => {
  const items = [
    {
      icon: userRole === "task_giver" ? Plus : Search,
      label: userRole === "task_giver" ? "Post" : "Browse",
      href: userRole === "task_giver" ? "/post-task" : "/browse",
      badge: 0
    },
    {
      icon: Briefcase,
      label: "Bookings",
      href: "/bookings",
      badge: pendingBookings
    },
    {
      icon: MessageSquare,
      label: "Messages",
      href: "/messages",
      badge: unreadMessages
    },
    {
      icon: Bell,
      label: "Alerts",
      href: "/dashboard#alerts",
      badge: 0
    },
    {
      icon: User,
      label: "Profile",
      href: "/profile",
      badge: 0
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg lg:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {items.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg hover:bg-muted transition-colors relative"
          >
            <div className="relative">
              <item.icon className="h-5 w-5 text-muted-foreground" />
              {item.badge > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-4 w-4 p-0 text-[10px] flex items-center justify-center"
                >
                  {item.badge > 9 ? "9+" : item.badge}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
