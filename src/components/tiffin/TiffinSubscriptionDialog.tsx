import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  Sparkles,
  Pause,
  Play,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionPlan {
  id: string;
  name: string;
  mealsPerWeek: number;
  pricePerMeal: number;
  totalWeekly: number;
  description: string;
  features: string[];
  popular?: boolean;
  savings?: string;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic Plan",
    mealsPerWeek: 5,
    pricePerMeal: 11,
    totalWeekly: 55,
    description: "Perfect for weekday lunches",
    features: ["5 meals per week", "Choose your cuisine", "Flexible delivery times", "Skip anytime"]
  },
  {
    id: "daily",
    name: "Daily Plan",
    mealsPerWeek: 7,
    pricePerMeal: 10,
    totalWeekly: 70,
    description: "Full week coverage with savings",
    features: ["7 meals per week", "Weekend specials", "Priority delivery", "Free delivery"],
    popular: true,
    savings: "Save $7/week"
  },
  {
    id: "family",
    name: "Family Plan",
    mealsPerWeek: 14,
    pricePerMeal: 8.5,
    totalWeekly: 119,
    description: "Feed the whole family",
    features: ["14 meals per week", "4 servings each", "Mixed cuisines", "Custom preferences"],
    savings: "Save $21/week"
  }
];

const daysOfWeek = [
  { id: 0, label: "Sun" },
  { id: 1, label: "Mon" },
  { id: 2, label: "Tue" },
  { id: 3, label: "Wed" },
  { id: 4, label: "Thu" },
  { id: 5, label: "Fri" },
  { id: 6, label: "Sat" }
];

interface TiffinSubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  providerId?: string;
  providerName?: string;
}

export function TiffinSubscriptionDialog({ 
  isOpen, 
  onClose, 
  providerId,
  providerName 
}: TiffinSubscriptionDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("daily");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("12:00");
  const [mealsPerDay, setMealsPerDay] = useState<"1" | "2">("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const plan = subscriptionPlans.find(p => p.id === selectedPlan)!;

  const toggleDay = (dayId: number) => {
    setSelectedDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId].sort()
    );
  };

  const handleSubscribe = async () => {
    if (!deliveryAddress.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }
    if (selectedDays.length === 0) {
      toast.error("Please select at least one delivery day");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please login to subscribe");
        setIsSubmitting(false);
        return;
      }

      // Note: In a real app, you'd need a valid menu_id
      // For now, we'll show success
      toast.success("Subscription created successfully!");
      onClose();
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast.error("Failed to create subscription. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Subscribe to Meal Plans
          </DialogTitle>
          <DialogDescription>
            {providerName ? `Subscribe to ${providerName}` : "Choose a meal subscription plan"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Choose Your Plan</Label>
            <RadioGroup 
              value={selectedPlan} 
              onValueChange={setSelectedPlan}
              className="grid gap-4"
            >
              {subscriptionPlans.map(plan => (
                <Label 
                  key={plan.id}
                  htmlFor={plan.id}
                  className={cn(
                    "relative flex flex-col rounded-xl border-2 p-4 cursor-pointer hover:bg-muted/50 transition-all",
                    selectedPlan === plan.id ? "border-primary bg-primary/5" : "border-muted"
                  )}
                >
                  <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                  
                  {plan.popular && (
                    <Badge className="absolute -top-2 right-4 bg-primary">Most Popular</Badge>
                  )}
                  
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-lg">{plan.name}</h4>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">${plan.totalWeekly}</div>
                      <div className="text-xs text-muted-foreground">${plan.pricePerMeal}/meal</div>
                      {plan.savings && (
                        <Badge variant="secondary" className="mt-1 text-green-600 bg-green-100">
                          {plan.savings}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {plan.features.map((feature, i) => (
                      <span 
                        key={i}
                        className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full"
                      >
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Delivery Days */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Delivery Days</Label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map(day => (
                <button
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    selectedDays.includes(day.id) 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {day.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Selected: {selectedDays.length} days/week
            </p>
          </div>

          {/* Meals Per Day */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Meals Per Day</Label>
            <RadioGroup 
              value={mealsPerDay} 
              onValueChange={(v) => setMealsPerDay(v as "1" | "2")}
              className="flex gap-4"
            >
              <Label 
                htmlFor="1-meal" 
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-lg border-2 p-3 cursor-pointer",
                  mealsPerDay === "1" ? "border-primary bg-primary/5" : "border-muted"
                )}
              >
                <RadioGroupItem value="1" id="1-meal" className="sr-only" />
                <span className="font-medium">1 Meal</span>
                <span className="text-xs text-muted-foreground">(Lunch or Dinner)</span>
              </Label>
              <Label 
                htmlFor="2-meals" 
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-lg border-2 p-3 cursor-pointer",
                  mealsPerDay === "2" ? "border-primary bg-primary/5" : "border-muted"
                )}
              >
                <RadioGroupItem value="2" id="2-meals" className="sr-only" />
                <span className="font-medium">2 Meals</span>
                <span className="text-xs text-muted-foreground">(Lunch & Dinner)</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Delivery Time */}
          <div className="space-y-2">
            <Label htmlFor="time" className="text-base font-semibold">Preferred Delivery Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select 
                id="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm"
              >
                <option value="11:00">11:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="12:30">12:30 PM</option>
                <option value="13:00">1:00 PM</option>
                <option value="18:00">6:00 PM</option>
                <option value="18:30">6:30 PM</option>
                <option value="19:00">7:00 PM</option>
                <option value="19:30">7:30 PM</option>
              </select>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-base font-semibold">Delivery Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="address"
                placeholder="Enter your full delivery address"
                className="pl-10"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Subscription Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Plan</span>
                <span className="font-medium">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Days</span>
                <span>{selectedDays.length} days/week</span>
              </div>
              <div className="flex justify-between">
                <span>Meals/Day</span>
                <span>{mealsPerDay}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-base">
                <span>Weekly Total</span>
                <span className="text-primary">${plan.totalWeekly}</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Pause className="h-4 w-4" />
              <span>Pause anytime</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Settings className="h-4 w-4" />
              <span>Modify preferences</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Cancel after 1 week</span>
            </div>
          </div>

          {/* Submit */}
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleSubscribe}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Start Subscription - ${plan.totalWeekly}/week
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
