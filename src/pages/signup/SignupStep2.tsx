import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { getSignupDraft, saveSignupDraft, SignupRole } from "@/lib/signupDraft";

const SignupStep2 = () => {
  const [roles, setRoles] = useState<SignupRole[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const draft = getSignupDraft();
    if (!draft.email || !draft.firstName || !draft.lastName || !draft.dateOfBirth) {
      navigate("/signup/step-1");
      return;
    }
    if (draft.role) {
      if (draft.role === "both") {
        setRoles(["task_giver", "task_doer"]);
      } else {
        setRoles([draft.role]);
      }
    }
  }, [navigate]);

  const toggleRole = (role: SignupRole) => {
    if (role === "both") {
      setRoles((prev) =>
        prev.includes("task_giver") && prev.includes("task_doer") ? [] : ["task_giver", "task_doer"],
      );
      return;
    }
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  };

  const handleContinue = () => {
    if (roles.length === 0) {
      toast({
        title: "Select a role",
        description: "Please choose at least one role to continue.",
        variant: "destructive",
      });
      return;
    }
    const wantsBoth = roles.includes("task_giver") && roles.includes("task_doer");
    const primaryRole: SignupRole = wantsBoth ? "both" : roles[0];
    saveSignupDraft({ role: primaryRole, wantsBothRoles: wantsBoth });
    navigate("/signup/step-3");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-xl shadow-2xl border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Choose your role</CardTitle>
          <CardDescription>Step 2 of 4: How will you use SaskTask?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border border-border rounded-lg p-4">
            <div>
              <p className="font-medium">Task Giver</p>
              <p className="text-sm text-muted-foreground">Post tasks and hire local help</p>
            </div>
            <Checkbox
              checked={roles.includes("task_giver")}
              onCheckedChange={() => toggleRole("task_giver")}
            />
          </div>
          <div className="flex items-center justify-between border border-border rounded-lg p-4">
            <div>
              <p className="font-medium">Task Doer</p>
              <p className="text-sm text-muted-foreground">Earn money completing tasks</p>
            </div>
            <Checkbox
              checked={roles.includes("task_doer")}
              onCheckedChange={() => toggleRole("task_doer")}
            />
          </div>
          <div className="flex items-center justify-between border border-border rounded-lg p-4">
            <div>
              <p className="font-medium">Both</p>
              <p className="text-sm text-muted-foreground">Post and complete tasks</p>
            </div>
            <Checkbox
              checked={roles.includes("task_giver") && roles.includes("task_doer")}
              onCheckedChange={() => toggleRole("both")}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/signup/step-1")}>
              Back
            </Button>
            <Button className="flex-1" variant="hero" size="lg" onClick={handleContinue}>
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupStep2;
