import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Clock, Zap, Timer, Hourglass, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DurationSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const presetDurations = [
  { label: "Quick", sublabel: "15-30 min", value: "0.5", icon: Zap, color: "text-green-500 bg-green-500/10 border-green-500/30" },
  { label: "Short", sublabel: "1-2 hours", value: "1.5", icon: Timer, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
  { label: "Medium", sublabel: "2-4 hours", value: "3", icon: Clock, color: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
  { label: "Half Day", sublabel: "4-6 hours", value: "5", icon: Hourglass, color: "text-purple-500 bg-purple-500/10 border-purple-500/30" },
  { label: "Full Day", sublabel: "6+ hours", value: "8", icon: Calendar, color: "text-rose-500 bg-rose-500/10 border-rose-500/30" },
];

export function DurationSelector({ value, onChange }: DurationSelectorProps) {
  const selectedPreset = presetDurations.find(p => p.value === value);
  
  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        Estimated Duration
      </Label>
      
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {presetDurations.map((preset) => {
          const Icon = preset.icon;
          const isSelected = value === preset.value;
          
          return (
            <Card
              key={preset.value}
              onClick={() => onChange(preset.value)}
              className={cn(
                "p-3 cursor-pointer transition-all hover:shadow-md border-2",
                isSelected 
                  ? `${preset.color} border-current` 
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex flex-col items-center text-center gap-1">
                <Icon className={cn("h-5 w-5", isSelected ? "" : "text-muted-foreground")} />
                <span className={cn("text-sm font-medium", isSelected ? "" : "text-foreground")}>
                  {preset.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {preset.sublabel}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
      
      <div className="flex items-center gap-3 pt-2">
        <span className="text-sm text-muted-foreground">Or enter custom hours:</span>
        <Input
          type="number"
          step="0.5"
          min="0.5"
          max="24"
          placeholder="e.g., 2.5"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24"
        />
        <span className="text-sm text-muted-foreground">hours</span>
      </div>
      
      {value && (
        <p className="text-sm text-muted-foreground">
          {parseFloat(value) <= 0.5 && "⚡ This will be marked as a Quick task (15-30 min)"}
          {parseFloat(value) > 0.5 && parseFloat(value) <= 2 && "🕐 This will be marked as a Short task (1-2 hrs)"}
          {parseFloat(value) > 2 && parseFloat(value) <= 4 && "🕑 This will be marked as a Medium task (2-4 hrs)"}
          {parseFloat(value) > 4 && parseFloat(value) <= 6 && "🕓 This will be marked as a Half Day task"}
          {parseFloat(value) > 6 && "📅 This will be marked as a Full Day+ task"}
        </p>
      )}
    </div>
  );
}
