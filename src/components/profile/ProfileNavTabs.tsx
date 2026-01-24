import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  ShieldCheck, 
  Trophy, 
  Settings, 
  CreditCard, 
  Lock,
  Briefcase,
  Calendar
} from "lucide-react";

interface ProfileNavTabsProps {
  userRole: string | null;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export const ProfileNavTabs = ({ userRole, defaultValue = "basic", onValueChange }: ProfileNavTabsProps) => {
  const baseTabs = [
    { value: "basic", label: "Profile", icon: User, mobileLabel: "Profile" },
    { value: "verification", label: "Verification", icon: ShieldCheck, mobileLabel: "Verify" },
    { value: "badges", label: "Badges", icon: Trophy, mobileLabel: "Badges" },
  ];
  
  // Add availability tab for Task Doers
  const availabilityTab = userRole === "task_doer" || userRole === "both" 
    ? [{ value: "availability", label: "Availability", icon: Calendar, mobileLabel: "Schedule" }]
    : [];
  
  const endTabs = [
    { value: "settings", label: "Advanced", icon: Settings, mobileLabel: "Settings" },
    { value: "payments", label: userRole === "task_giver" ? "Payment" : "Payout", icon: CreditCard, mobileLabel: "Pay" },
    { value: "security", label: "Security", icon: Lock, mobileLabel: "Security" },
  ];
  
  const tabs = [...baseTabs, ...availabilityTab, ...endTabs];
  const gridCols = tabs.length <= 6 ? "grid-cols-3 sm:grid-cols-6" : "grid-cols-4 sm:grid-cols-7";

  return (
    <TabsList className={`w-full h-auto p-1.5 bg-muted/50 rounded-xl grid ${gridCols} gap-1`}>
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
        >
          <tab.icon className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline text-sm">{tab.label}</span>
          <span className="sm:hidden text-xs">{tab.mobileLabel}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
};
