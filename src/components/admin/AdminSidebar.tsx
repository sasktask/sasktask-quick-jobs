import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Shield,
  Flag,
  AlertTriangle,
  CreditCard,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    description: "Overview & stats",
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    description: "Manage all users",
  },
  {
    title: "Verifications",
    href: "/admin/verify-users",
    icon: Shield,
    description: "Approve verifications",
    showBadge: true,
    badgeKey: "verifications",
  },
  {
    title: "Disputes",
    href: "/admin/disputes",
    icon: Flag,
    description: "Resolve disputes",
    showBadge: true,
    badgeKey: "disputes",
  },
  {
    title: "Fraud Alerts",
    href: "/admin/fraud",
    icon: AlertTriangle,
    description: "Monitor fraud",
    showBadge: true,
    badgeKey: "fraud",
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
    description: "Payment overview",
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const [badgeCounts, setBadgeCounts] = useState({
    verifications: 0,
    disputes: 0,
    fraud: 0,
  });

  useEffect(() => {
    loadBadgeCounts();
  }, []);

  const loadBadgeCounts = async () => {
    const [
      { count: verifications },
      { count: disputes },
      { count: fraud },
    ] = await Promise.all([
      supabase.from("verifications").select("*", { count: "exact", head: true }).eq("verification_status", "pending"),
      supabase.from("disputes").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("fraud_alerts").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]);

    setBadgeCounts({
      verifications: verifications || 0,
      disputes: disputes || 0,
      fraud: fraud || 0,
    });
  };

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
            const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey as keyof typeof badgeCounts] : 0;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  <div>
                    <span className="block">{item.title}</span>
                    {!isActive && (
                      <span className="text-xs opacity-60 hidden group-hover:block">
                        {item.description}
                      </span>
                    )}
                  </div>
                </div>
                {item.showBadge && badgeCount > 0 && (
                  <Badge 
                    variant={isActive ? "secondary" : "destructive"} 
                    className="text-xs px-1.5 py-0"
                  >
                    {badgeCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      
      {/* Admin Quick Stats */}
      <div className="p-4 border-t bg-muted/50">
        <p className="text-xs text-muted-foreground mb-2">Quick Stats</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-background rounded p-2 text-center">
            <p className="font-semibold text-orange-500">{badgeCounts.verifications}</p>
            <p className="text-muted-foreground">Pending</p>
          </div>
          <div className="bg-background rounded p-2 text-center">
            <p className="font-semibold text-red-500">{badgeCounts.disputes}</p>
            <p className="text-muted-foreground">Disputes</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
