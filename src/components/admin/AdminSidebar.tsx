import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CreditCard,
  AlertTriangle,
  Shield,
  FileText,
  Settings,
  MessageSquare,
  BarChart3,
  Flag,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  {
    title: "Overview",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Tasks",
    href: "/admin/tasks",
    icon: Briefcase,
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    title: "Disputes",
    href: "/admin/disputes",
    icon: Flag,
  },
  {
    title: "Fraud Alerts",
    href: "/admin/fraud",
    icon: AlertTriangle,
  },
  {
    title: "Verifications",
    href: "/admin/verify-users",
    icon: Shield,
  },
  {
    title: "Blog",
    href: "/admin/blog",
    icon: FileText,
  },
  {
    title: "Messages",
    href: "/admin/messages",
    icon: MessageSquare,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r bg-card">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
        <p className="text-sm text-muted-foreground">Platform Management</p>
      </div>
      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
