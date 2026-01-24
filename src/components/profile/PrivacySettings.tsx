import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Globe,
  Users,
  Lock,
  Shield,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Bell,
  Clock,
  Star,
  Briefcase,
  UserCheck,
  Download,
  Trash2,
  Save,
  Loader2,
  Info,
} from "lucide-react";

interface PrivacySettingsProps {
  userId: string;
  profile?: any;
  onUpdate?: () => void;
}

interface PrivacyOptions {
  profileVisibility: "public" | "users_only" | "private";
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  showLastActive: boolean;
  showRating: boolean;
  showCompletedTasks: boolean;
  allowMessages: "everyone" | "verified_only" | "connections_only" | "nobody";
  showOnlineStatus: boolean;
  showActivityStatus: boolean;
  searchable: boolean;
  showInLeaderboard: boolean;
  allowTagging: boolean;
  dataSharing: boolean;
  analyticsTracking: boolean;
  marketingEmails: boolean;
  partnerOffers: boolean;
}

const visibilityOptions = [
  {
    value: "public",
    label: "Public",
    description: "Anyone can view your profile",
    icon: Globe,
  },
  {
    value: "users_only",
    label: "Registered Users",
    description: "Only registered users can view",
    icon: Users,
  },
  {
    value: "private",
    label: "Private",
    description: "Only you can see your profile",
    icon: Lock,
  },
];

const messageOptions = [
  { value: "everyone", label: "Everyone" },
  { value: "verified_only", label: "Verified users only" },
  { value: "connections_only", label: "People I've worked with" },
  { value: "nobody", label: "No one" },
];

export const PrivacySettings = ({ userId, profile, onUpdate }: PrivacySettingsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<PrivacyOptions>({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    showLocation: true,
    showLastActive: true,
    showRating: true,
    showCompletedTasks: true,
    allowMessages: "everyone",
    showOnlineStatus: true,
    showActivityStatus: true,
    searchable: true,
    showInLeaderboard: true,
    allowTagging: true,
    dataSharing: false,
    analyticsTracking: true,
    marketingEmails: false,
    partnerOffers: false,
  });

  useEffect(() => {
    loadPrivacySettings();
  }, [userId]);

  const loadPrivacySettings = async () => {
    setIsLoading(true);
    try {
      // Privacy settings are stored locally for now
      // In production, these would be stored in a dedicated privacy_settings table
      const storedSettings = localStorage.getItem(`privacy_settings_${userId}`);
      if (storedSettings) {
        setSettings(prev => ({ ...prev, ...JSON.parse(storedSettings) }));
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Store privacy settings locally
      localStorage.setItem(`privacy_settings_${userId}`, JSON.stringify(settings));
      
      toast.success("Privacy settings saved");
      onUpdate?.();
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
      toast.error("Failed to save privacy settings");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof PrivacyOptions>(key: K, value: PrivacyOptions[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Eye className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Profile Visibility</CardTitle>
              <CardDescription className="text-xs">
                Control who can see your profile
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.profileVisibility}
            onValueChange={(value) => updateSetting('profileVisibility', value as any)}
            className="space-y-3"
          >
            {visibilityOptions.map((option) => {
              const Icon = option.icon;
              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    settings.profileVisibility === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <RadioGroupItem value={option.value} className="sr-only" />
                  <div className={`p-2 rounded-lg ${
                    settings.profileVisibility === option.value
                      ? 'bg-primary/10'
                      : 'bg-muted'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      settings.profileVisibility === option.value
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-sm">{option.label}</span>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  {settings.profileVisibility === option.value && (
                    <Badge variant="secondary" className="text-xs">Active</Badge>
                  )}
                </label>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Information Display */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Info className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Information Display</CardTitle>
              <CardDescription className="text-xs">
                Choose what information is visible on your profile
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <PrivacyToggle
            icon={Mail}
            label="Email Address"
            description="Show your email address on your profile"
            checked={settings.showEmail}
            onCheckedChange={(checked) => updateSetting('showEmail', checked)}
          />
          <Separator />
          <PrivacyToggle
            icon={Phone}
            label="Phone Number"
            description="Show your phone number on your profile"
            checked={settings.showPhone}
            onCheckedChange={(checked) => updateSetting('showPhone', checked)}
          />
          <Separator />
          <PrivacyToggle
            icon={MapPin}
            label="Location"
            description="Show your city/region on your profile"
            checked={settings.showLocation}
            onCheckedChange={(checked) => updateSetting('showLocation', checked)}
          />
          <Separator />
          <PrivacyToggle
            icon={Clock}
            label="Last Active"
            description="Show when you were last active"
            checked={settings.showLastActive}
            onCheckedChange={(checked) => updateSetting('showLastActive', checked)}
          />
          <Separator />
          <PrivacyToggle
            icon={Star}
            label="Rating & Reviews"
            description="Display your rating and review count"
            checked={settings.showRating}
            onCheckedChange={(checked) => updateSetting('showRating', checked)}
          />
          <Separator />
          <PrivacyToggle
            icon={Briefcase}
            label="Completed Tasks"
            description="Show number of tasks you've completed"
            checked={settings.showCompletedTasks}
            onCheckedChange={(checked) => updateSetting('showCompletedTasks', checked)}
          />
        </CardContent>
      </Card>

      {/* Communication Settings */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Communication</CardTitle>
              <CardDescription className="text-xs">
                Control who can contact you
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Who can message you</Label>
            <Select
              value={settings.allowMessages}
              onValueChange={(value) => updateSetting('allowMessages', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {messageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          <PrivacyToggle
            icon={UserCheck}
            label="Online Status"
            description="Show when you're online"
            checked={settings.showOnlineStatus}
            onCheckedChange={(checked) => updateSetting('showOnlineStatus', checked)}
          />
        </CardContent>
      </Card>

      {/* Discovery & Search */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Globe className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Discovery</CardTitle>
              <CardDescription className="text-xs">
                Control how others can find you
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <PrivacyToggle
            icon={Globe}
            label="Searchable Profile"
            description="Allow others to find you via search"
            checked={settings.searchable}
            onCheckedChange={(checked) => updateSetting('searchable', checked)}
          />
          <Separator />
          <PrivacyToggle
            icon={Star}
            label="Leaderboard Visibility"
            description="Appear on public leaderboards"
            checked={settings.showInLeaderboard}
            onCheckedChange={(checked) => updateSetting('showInLeaderboard', checked)}
          />
        </CardContent>
      </Card>

      {/* Data & Marketing */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Data & Marketing</CardTitle>
              <CardDescription className="text-xs">
                Control data usage and marketing preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <PrivacyToggle
            icon={Bell}
            label="Marketing Emails"
            description="Receive promotional emails and offers"
            checked={settings.marketingEmails}
            onCheckedChange={(checked) => updateSetting('marketingEmails', checked)}
          />
          <Separator />
          <PrivacyToggle
            icon={Users}
            label="Partner Offers"
            description="Receive offers from our partners"
            checked={settings.partnerOffers}
            onCheckedChange={(checked) => updateSetting('partnerOffers', checked)}
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={loadPrivacySettings}>
          Reset
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Helper component for privacy toggles
const PrivacyToggle = ({
  icon: Icon,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <Label className="font-medium text-sm">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);
