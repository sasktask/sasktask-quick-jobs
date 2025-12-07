import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  ShieldCheck, 
  MessageCircle, 
  Camera, 
  MapPin, 
  Clock,
  Users,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SafetyChecklistProps {
  isTaskGiver: boolean;
  bookingId?: string;
  onComplete?: () => void;
}

export function SafetyChecklist({ isTaskGiver, bookingId, onComplete }: SafetyChecklistProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const taskGiverItems = [
    { id: 'verify_profile', label: 'Verified tasker profile and reviews', icon: Users },
    { id: 'communicate', label: 'Communicated task details clearly', icon: MessageCircle },
    { id: 'safe_location', label: 'Meeting in a safe, public location', icon: MapPin },
    { id: 'share_itinerary', label: 'Shared task details with someone', icon: Shield },
    { id: 'document_condition', label: 'Documented initial conditions', icon: Camera },
  ];

  const taskerItems = [
    { id: 'verify_task', label: 'Verified task details and location', icon: MapPin },
    { id: 'check_reviews', label: 'Checked task giver\'s history', icon: Users },
    { id: 'confirm_payment', label: 'Payment secured in escrow', icon: ShieldCheck },
    { id: 'share_location', label: 'Shared location with trusted contact', icon: Shield },
    { id: 'set_timeline', label: 'Agreed on timeline and milestones', icon: Clock },
  ];

  const items = isTaskGiver ? taskGiverItems : taskerItems;
  const progress = (checkedItems.length / items.length) * 100;

  const toggleItem = (id: string) => {
    setCheckedItems(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    );
  };

  const allComplete = checkedItems.length === items.length;

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-amber-500" />
                Safety Checklist
                {allComplete && (
                  <Badge className="bg-green-500/10 text-green-600 ml-2">
                    Complete
                  </Badge>
                )}
              </CardTitle>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CollapsibleTrigger>
          <div className="flex items-center gap-2 mt-2">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground">
              {checkedItems.length}/{items.length}
            </span>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-3">
            {items.map((item) => {
              const Icon = item.icon;
              const isChecked = checkedItems.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    isChecked 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-background border-border hover:border-primary/30'
                  }`}
                  onClick={() => toggleItem(item.id)}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleItem(item.id)}
                  />
                  <Icon className={`h-4 w-4 ${isChecked ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <span className={`text-sm ${isChecked ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
            
            {allComplete && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-600">Safety checklist complete!</p>
                  <p className="text-xs text-muted-foreground">You're ready to proceed safely.</p>
                </div>
                {onComplete && (
                  <Button size="sm" onClick={onComplete}>
                    Continue
                  </Button>
                )}
              </div>
            )}

            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg mt-4">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                If anything seems suspicious or unsafe, please report it immediately. 
                Your safety is our priority.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}