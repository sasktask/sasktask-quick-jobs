import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, ArrowRight, ArrowLeft, AlertCircle, 
  Clock, Calculator, Info, Shield
} from "lucide-react";
import { motion } from "framer-motion";

interface BudgetData {
  estimatedHours: number;
  budget: number;
  paymentType: "hourly" | "fixed";
}

interface HireStepBudgetProps {
  data: BudgetData;
  onChange: (data: BudgetData) => void;
  onNext: () => void;
  onBack: () => void;
  taskerHourlyRate?: number;
}

export const HireStepBudget = ({ 
  data, 
  onChange, 
  onNext, 
  onBack,
  taskerHourlyRate 
}: HireStepBudgetProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const suggestedBudget = taskerHourlyRate 
    ? taskerHourlyRate * data.estimatedHours 
    : data.estimatedHours * 25; // Default $25/hr

  const platformFee = data.budget * 0.15; // 15% platform fee
  const taskerEarnings = data.budget - platformFee;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.budget || data.budget < 10) {
      newErrors.budget = "Minimum budget is $10";
    }
    
    if (data.estimatedHours < 1) {
      newErrors.hours = "Minimum 1 hour required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const budgetPresets = [
    { label: "Budget", amount: suggestedBudget * 0.8 },
    { label: "Fair", amount: suggestedBudget },
    { label: "Premium", amount: suggestedBudget * 1.25 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold">Set Your Budget</h3>
        <p className="text-muted-foreground text-sm">
          A fair budget attracts quality taskers quickly
        </p>
      </div>

      {/* Tasker Rate Info */}
      {taskerHourlyRate && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Tasker's Rate: ${taskerHourlyRate}/hr</p>
            <p className="text-sm text-muted-foreground">
              Based on their profile and experience
            </p>
          </div>
        </div>
      )}

      {/* Payment Type Toggle */}
      <div className="space-y-2">
        <Label>Payment Type</Label>
        <div className="grid grid-cols-2 gap-2">
          <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              data.paymentType === "fixed" 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => onChange({ ...data, paymentType: "fixed" })}
          >
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="h-4 w-4" />
              <span className="font-medium">Fixed Price</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Pay a set amount for the entire task
            </p>
          </div>
          <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              data.paymentType === "hourly" 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => onChange({ ...data, paymentType: "hourly" })}
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Hourly Rate</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Pay based on actual hours worked
            </p>
          </div>
        </div>
      </div>

      {/* Estimated Hours */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Estimated Hours
          </Label>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {data.estimatedHours} hr{data.estimatedHours > 1 ? "s" : ""}
          </Badge>
        </div>
        <Slider
          value={[data.estimatedHours]}
          onValueChange={([value]) => {
            onChange({ 
              ...data, 
              estimatedHours: value,
              budget: taskerHourlyRate ? taskerHourlyRate * value : value * 25
            });
          }}
          min={1}
          max={8}
          step={0.5}
          className="py-4"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 hour</span>
          <span>4 hours</span>
          <span>8 hours</span>
        </div>
        {errors.hours && (
          <p className="text-destructive text-xs flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.hours}
          </p>
        )}
      </div>

      {/* Budget Input */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          Total Budget *
        </Label>
        
        {/* Preset Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {budgetPresets.map((preset) => (
            <Button
              key={preset.label}
              variant={Math.abs(data.budget - preset.amount) < 5 ? "default" : "outline"}
              size="sm"
              onClick={() => onChange({ ...data, budget: Math.round(preset.amount) })}
              className="flex flex-col h-auto py-2"
            >
              <span className="text-xs opacity-70">{preset.label}</span>
              <span className="font-bold">${Math.round(preset.amount)}</span>
            </Button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="number"
            placeholder="Enter custom amount"
            value={data.budget || ""}
            onChange={(e) => onChange({ ...data, budget: parseFloat(e.target.value) || 0 })}
            className={`pl-10 h-12 text-lg font-medium ${errors.budget ? "border-destructive" : ""}`}
          />
        </div>
        {errors.budget && (
          <p className="text-destructive text-xs flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.budget}
          </p>
        )}
      </div>

      {/* Payment Breakdown */}
      <div className="bg-muted/50 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-primary" />
          <span className="font-medium">Payment Breakdown</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Your Budget</span>
            <span className="font-medium">${data.budget.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform Fee (15%)</span>
            <span className="text-muted-foreground">-${platformFee.toFixed(2)}</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="font-medium">Tasker Receives</span>
            <span className="font-bold text-primary">${taskerEarnings.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Escrow Notice */}
      <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
        <Shield className="h-5 w-5 text-green-600 mt-0.5" />
        <div>
          <p className="font-medium text-green-700">Secure Escrow Protection</p>
          <p className="text-sm text-muted-foreground">
            Payment is held securely until the task is completed to your satisfaction
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} className="flex-1 gap-2">
          Review & Confirm
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};
