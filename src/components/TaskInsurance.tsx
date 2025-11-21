import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TaskInsuranceProps {
  taskId: string;
  taskAmount: number;
  onInsuranceAdded?: () => void;
}

const insurancePlans = {
  basic: {
    name: "Basic Protection",
    coverage: 0.5, // 50% of task amount
    premium: 0.05, // 5% of task amount
    features: [
      "Covers work quality issues",
      "Up to 50% of task value",
      "24-hour claim processing",
    ],
  },
  standard: {
    name: "Standard Protection",
    coverage: 0.8, // 80% of task amount
    premium: 0.08, // 8% of task amount
    features: [
      "Covers work quality & delays",
      "Up to 80% of task value",
      "Priority claim processing",
      "Dispute mediation included",
    ],
  },
  premium: {
    name: "Premium Protection",
    coverage: 1.0, // 100% of task amount
    premium: 0.12, // 12% of task amount
    features: [
      "Full task value coverage",
      "All risks covered",
      "Instant claim processing",
      "Dedicated support",
      "Legal assistance",
    ],
  },
};

export const TaskInsurance = ({ taskId, taskAmount, onInsuranceAdded }: TaskInsuranceProps) => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof insurancePlans>("standard");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddInsurance = async () => {
    setIsAdding(true);
    try {
      const plan = insurancePlans[selectedPlan];
      const coverageAmount = taskAmount * plan.coverage;
      const premiumAmount = taskAmount * plan.premium;

      const { error } = await supabase.from("task_insurance").insert({
        task_id: taskId,
        insurance_type: selectedPlan,
        coverage_amount: coverageAmount,
        premium_amount: premiumAmount,
        status: "active",
        policy_details: {
          plan_name: plan.name,
          features: plan.features,
        },
      });

      if (error) throw error;

      toast({
        title: "Insurance Added",
        description: `${plan.name} has been added to your task.`,
      });

      onInsuranceAdded?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Task Insurance
        </CardTitle>
        <CardDescription>
          Protect your investment with comprehensive task insurance coverage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={selectedPlan} onValueChange={(value) => setSelectedPlan(value as keyof typeof insurancePlans)}>
          {Object.entries(insurancePlans).map(([key, plan]) => {
            const coverageAmount = taskAmount * plan.coverage;
            const premiumAmount = taskAmount * plan.premium;

            return (
              <Card
                key={key}
                className={`cursor-pointer transition-all ${
                  selectedPlan === key ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border"
                }`}
                onClick={() => setSelectedPlan(key as keyof typeof insurancePlans)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <RadioGroupItem value={key} id={key} />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={key} className="text-lg font-semibold cursor-pointer">
                          {plan.name}
                        </Label>
                        {key === "standard" && (
                          <Badge variant="default">Recommended</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Coverage: ${coverageAmount.toFixed(2)} | Premium: ${premiumAmount.toFixed(2)}
                      </div>
                      <ul className="space-y-1 mt-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </RadioGroup>

        <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>How it works:</strong> Insurance premium is added to your task cost. If issues arise,
            file a claim and get reimbursed up to the coverage amount after review.
          </p>
        </div>

        <Button onClick={handleAddInsurance} disabled={isAdding} className="w-full" size="lg">
          {isAdding ? "Adding Insurance..." : `Add Insurance ($${(taskAmount * insurancePlans[selectedPlan].premium).toFixed(2)})`}
        </Button>
      </CardContent>
    </Card>
  );
};
