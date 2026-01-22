import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Users, Shield, Award, AlertTriangle, CreditCard, ShieldCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  {
    title: "User Management",
    href: "/admin/dashboard",
    icon: Users,
    description: "View & control users",
  },
  {
    title: "Verify Users",
    href: "/admin/verify-users",
    icon: ShieldCheck,
    description: "ID & background checks",
  },
  {
    title: "Certificates",
    href: "/admin/certificates",
    icon: Award,
    description: "Review certifications",
  },
  {
    title: "Disputes",
    href: "/admin/disputes",
    icon: AlertTriangle,
    description: "Resolve conflicts",
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
    description: "Payment management",
  },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r glass-card rounded-none">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">Management Console</p>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <div>
                  <span className="block">{item.title}</span>
                  <span className="text-xs opacity-70">{item.description}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
