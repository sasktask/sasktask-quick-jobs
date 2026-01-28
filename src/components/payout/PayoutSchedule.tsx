import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  CheckCircle,
  Loader2,
  Zap,
  CalendarDays
} from 'lucide-react';

interface PayoutScheduleProps {
  payoutAccountActive: boolean;
}

interface ScheduleSettings {
  enabled: boolean;
  frequency: 'weekly' | 'daily' | 'custom';
  dayOfWeek: string;
  instantEnabled: boolean;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
];

export function PayoutSchedule({ payoutAccountActive }: PayoutScheduleProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ScheduleSettings>({
    enabled: true,
    frequency: 'weekly',
    dayOfWeek: 'monday',
    instantEnabled: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem('payoutScheduleSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('payoutScheduleSettings', JSON.stringify(settings));
      toast({
        title: 'Schedule Updated',
        description: 'Your payout schedule has been saved.'
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save settings.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const getNextPayoutDate = () => {
    const today = new Date();
    const dayIndex = DAYS_OF_WEEK.findIndex(d => d.value === settings.dayOfWeek);
    const targetDay = dayIndex + 1; // Monday = 1
    const currentDay = today.getDay();
    
    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntil);
    
    return nextDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!payoutAccountActive) {
    return (
      <Card className="border-muted">
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Set Up Payout Schedule</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Add a bank account to configure automatic weekly or daily payouts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Payout Schedule</CardTitle>
              <CardDescription>Choose when you receive your earnings</CardDescription>
            </div>
          </div>
          <Badge variant={settings.enabled ? 'default' : 'secondary'}>
            {settings.enabled ? 'Active' : 'Paused'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Next Payout Info */}
        {settings.enabled && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Scheduled Payout</p>
                <p className="font-semibold text-lg">{getNextPayoutDate()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div>
            <p className="font-medium">Automatic Payouts</p>
            <p className="text-sm text-muted-foreground">
              Receive earnings on a regular schedule
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
          />
        </div>

        {settings.enabled && (
          <>
            {/* Frequency Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Payout Frequency</Label>
              <RadioGroup
                value={settings.frequency}
                onValueChange={(value: 'weekly' | 'daily' | 'custom') => 
                  setSettings({ ...settings, frequency: value })
                }
                className="grid gap-3"
              >
                <Label
                  htmlFor="weekly"
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    settings.frequency === 'weekly' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <RadioGroupItem value="weekly" id="weekly" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Weekly</span>
                      <Badge variant="secondary" className="text-xs">Recommended</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Receive a single payout every week
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">Free</span>
                </Label>

                <Label
                  htmlFor="daily"
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    settings.frequency === 'daily' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <RadioGroupItem value="daily" id="daily" />
                  <div className="flex-1">
                    <span className="font-medium">Daily</span>
                    <p className="text-sm text-muted-foreground">
                      Receive earnings every business day
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">Free</span>
                </Label>
              </RadioGroup>
            </div>

            {/* Day of Week Selection (for weekly) */}
            {settings.frequency === 'weekly' && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Payout Day</Label>
                <div className="grid grid-cols-5 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <Button
                      key={day.value}
                      variant={settings.dayOfWeek === day.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSettings({ ...settings, dayOfWeek: day.value })}
                      className="text-xs"
                    >
                      {day.label.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Instant Cashout Option */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium">Allow Instant Cashouts</p>
                  <p className="text-sm text-muted-foreground">
                    Cash out anytime for a $0.50 fee
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.instantEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, instantEnabled: checked })}
              />
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
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Schedule
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
