import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Search,
  ClipboardList,
  CalendarDays,
  MessageSquare,
  User,
  Settings,
  DollarSign,
  ShieldCheck,
  Trophy,
  Star,
  Users,
  FileText,
  Calendar,
  MapPin,
  Bell,
  ChevronRight,
  TrendingUp,
  Award,
  Shield,
  Zap,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { OWNER_USER_ID } from "@/lib/constants";

interface DashboardSidebarProps {
  userRole: string | null;
  userRoles?: string[];
  unreadMessages: number;
  pendingBookings: number;
  isVerified?: boolean;
  className?: string;
  userId?: string;
}

export function DashboardSidebar({
  userRole,
  userRoles = [],
  unreadMessages,
  pendingBookings,
  isVerified,
  className,
  userId,
}: DashboardSidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const isOwner = userId === OWNER_USER_ID;

  const isActive = (path: string) => currentPath === path;

  // Check if user has specific roles
  const isTaskGiver = userRoles.includes('task_giver');
  const isTaskDoer = userRoles.includes('task_doer');
  const hasBothRoles = isTaskGiver && isTaskDoer;

  // Task Doers and Both-role users get full access to all features
  const showAllFeatures = isTaskDoer || hasBothRoles;

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    // Show Post Task for task givers or users with both roles
    ...(isTaskGiver || hasBothRoles ? [{
      title: "Post Task",
      href: "/post-task",
      icon: ClipboardList,
      badge: null,
    }] : []),
    // Show Find Tasks for task doers or users with both roles
    ...(showAllFeatures ? [{
      title: "Find Tasks",
      href: "/browse",
      icon: Search,
      badge: null,
    }] : []),
    {
      title: "My Tasks",
      href: "/my-tasks",
      icon: Briefcase,
      badge: null,
    },
    {
      title: "Bookings",
      href: "/bookings",
      icon: Calendar,
      badge: pendingBookings > 0 ? pendingBookings : null,
    },
    {
      title: "Messages",
      href: "/messages",
      icon: MessageSquare,
      badge: unreadMessages > 0 ? unreadMessages : null,
    },
    // Instant Work - highlighted for task doers
    ...(showAllFeatures ? [{
      title: "Instant Work",
      href: "/instant-work",
      icon: Zap,
      badge: null,
      highlight: true,
    }] : []),
  ];

  const moneyItems = [
    {
      title: "Payments",
      href: "/payments",
      icon: DollarSign,
    },
    {
      title: "Payouts",
      href: "/payouts",
      icon: TrendingUp,
    },
  ];

  const exploreItems = [
    {
      title: "Services Hub",
      href: "/services-hub",
      icon: Star,
      highlight: true,
    },
    {
      title: "Browse Tasks",
      href: "/browse",
      icon: Search,
    },
    {
      title: "Find Taskers",
      href: "/find-taskers",
      icon: Users,
    },
    {
      title: "Calendar",
      href: "/calendar",
      icon: CalendarDays,
    },
    {
      title: "Map View",
      href: "/map",
      icon: MapPin,
    },
    {
      title: "Leaderboard",
      href: "/leaderboard",
      icon: Trophy,
    },
    {
      title: "Achievements",
      href: "/achievements",
      icon: Award,
    },
    {
      title: "Referrals",
      href: "/referrals",
      icon: Gift,
    },
  ];

  const accountItems = [
    {
      title: "Profile",
      href: "/profile",
      icon: User,
    },
    {
      title: "Account Settings",
      href: "/account",
      icon: Settings,
    },
  ];

  // Task doer specific items - show full professional toolkit for task doers
  const taskDoerItems = showAllFeatures ? [
    {
      title: "Get Verified",
      href: "/verification",
      icon: ShieldCheck,
      highlight: !isVerified,
    },
    {
      title: "My Reputation",
      href: "/leaderboard",
      icon: Award,
    },
    {
      title: "Find Taskers",
      href: "/find-taskers",
      icon: Users,
    },
    {
      title: "Tax Compliance",
      href: "/tax-compliance",
      icon: FileText,
    },
    {
      title: "Insurance",
      href: "/insurance-requirements",
      icon: Shield,
    },
  ] : [];

  const NavItem = ({ item, showBadge = true }: { item: any; showBadge?: boolean }) => (
    <Link
      to={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
        isActive(item.href)
          ? "bg-primary text-primary-foreground shadow-md"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        item.highlight && !isActive(item.href) && "border border-primary/50 bg-primary/5"
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{item.title}</span>
      {showBadge && item.badge && (
        <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 text-xs">
          {item.badge > 9 ? "9+" : item.badge}
        </Badge>
      )}
      {item.highlight && !isActive(item.href) && (
        <ChevronRight className="h-4 w-4 text-primary" />
      )}
    </Link>
  );

  return (
    <aside className={cn("w-64 border-r border-border bg-card/50 backdrop-blur-sm", className)}>
      <ScrollArea className="h-full py-6 px-4">
        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Main
          </p>
          {mainNavItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>

        <Separator className="my-4" />

        {/* Task Doer Specific */}
        {taskDoerItems.length > 0 && (
          <>
            <div className="space-y-1">
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Professional Tools
              </p>
              {taskDoerItems.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </div>
            <Separator className="my-4" />
          </>
        )}

        {/* Money Section */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Payments
          </p>
          {moneyItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>

        <Separator className="my-4" />

        {/* Explore Section */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Explore
          </p>
          {exploreItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>

        <Separator className="my-4" />

        {/* Account Section */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Account
          </p>
          {accountItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>

        {/* Admin Section - Only for Owner */}
        {isOwner && (
          <>
            <Separator className="my-4" />
            <div className="space-y-1">
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Admin
              </p>
              <Link
                to="/admin/dashboard"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  currentPath.startsWith("/admin")
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border border-primary/30 bg-primary/5"
                )}
              >
                <Shield className="h-4 w-4 shrink-0" />
                <span className="flex-1">Admin Panel</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </ScrollArea>
    </aside>
  );
}
