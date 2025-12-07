import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  DollarSign, 
  Calendar,
  Loader2,
  CheckCircle,
  Settings,
  Zap,
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AutoPayoutSettingsProps {
  payoutAccountActive: boolean;
}

export function AutoPayoutSettings({ payoutAccountActive }: AutoPayoutSettingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Auto-payout settings (stored in localStorage for demo - in production use database)
  const [settings, setSettings] = useState({
    enabled: false,
    frequency: 'weekly',
    minimumAmount: 50,
    dayOfWeek: 'friday',
    dayOfMonth: 1,
    emailNotifications: true
  });

  useEffect(() => {
    const saved = localStorage.getItem('autoPayoutSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage (in production, save to database)
      localStorage.setItem('autoPayoutSettings', JSON.stringify(settings));
      
      toast({
        title: 'Settings Saved',
        description: 'Your auto-payout preferences have been updated.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const getScheduleDescription = () => {
    if (!settings.enabled) return 'Auto-payout is disabled';
    
    if (settings.frequency === 'weekly') {
      return `Every ${settings.dayOfWeek.charAt(0).toUpperCase() + settings.dayOfWeek.slice(1)} when balance exceeds $${settings.minimumAmount}`;
    } else if (settings.frequency === 'biweekly') {
      return `Every other ${settings.dayOfWeek.charAt(0).toUpperCase() + settings.dayOfWeek.slice(1)} when balance exceeds $${settings.minimumAmount}`;
    } else {
      return `On the ${settings.dayOfMonth}${getOrdinalSuffix(settings.dayOfMonth)} of each month when balance exceeds $${settings.minimumAmount}`;
    }
  };

  const getOrdinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Auto-Payout Settings
            </CardTitle>
            <CardDescription>Automatically transfer your earnings to your bank</CardDescription>
          </div>
          <Badge variant={settings.enabled ? 'default' : 'secondary'}>
            {settings.enabled ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!payoutAccountActive && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              ⚠️ You need to set up a payout account before enabling auto-payouts.
            </p>
          </div>
        )}

        {/* Enable Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="auto-payout" className="font-medium">Enable Auto-Payout</Label>
            <p className="text-sm text-muted-foreground">
              Automatically withdraw funds when they become available
            </p>
          </div>
          <Switch
            id="auto-payout"
            checked={settings.enabled}
            onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
            disabled={!payoutAccountActive}
          />
        </div>

        {settings.enabled && (
          <>
            {/* Frequency */}
            <div className="space-y-2">
              <Label htmlFor="frequency" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Payout Frequency
              </Label>
              <Select
                value={settings.frequency}
                onValueChange={(value) => setSettings({ ...settings, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Day Selection */}
            {(settings.frequency === 'weekly' || settings.frequency === 'biweekly') && (
              <div className="space-y-2">
                <Label htmlFor="day" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Day of Week
                </Label>
                <Select
                  value={settings.dayOfWeek}
                  onValueChange={(value) => setSettings({ ...settings, dayOfWeek: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {settings.frequency === 'monthly' && (
              <div className="space-y-2">
                <Label htmlFor="dayOfMonth" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Day of Month
                </Label>
                <Select
                  value={settings.dayOfMonth.toString()}
                  onValueChange={(value) => setSettings({ ...settings, dayOfMonth: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 5, 10, 15, 20, 25, 28].map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}{getOrdinalSuffix(day)} of each month
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Minimum Amount */}
            <div className="space-y-2">
              <Label htmlFor="minAmount" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Minimum Payout Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="minAmount"
                  type="number"
                  min="10"
                  step="10"
                  className="pl-7"
                  value={settings.minimumAmount}
                  onChange={(e) => setSettings({ ...settings, minimumAmount: parseInt(e.target.value) || 10 })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Payouts will only be triggered when your balance exceeds this amount
              </p>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="email-notify" className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive email confirmation when payouts are processed
                </p>
              </div>
              <Switch
                id="email-notify"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>

            {/* Schedule Summary */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Schedule Summary</span>
              </div>
              <p className="text-sm text-muted-foreground">{getScheduleDescription()}</p>
            </div>
          </>
        )}

        {/* Save Button */}
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Settings className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
