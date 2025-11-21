import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Briefcase, ClipboardCheck, Users } from "lucide-react";
import { z } from "zod";

const onboardingSchema = z.object({
  city: z.string().trim().min(2, "City is required").max(100),
  bio: z.string().trim().min(10, "Bio must be at least 10 characters").max(500),
  skills: z.string().optional(),
  hourlyRate: z.string().optional(),
});

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [roleSelection, setRoleSelection] = useState<string[]>([]);
  
  // Form data
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);

    // Check if profile is already complete
    const { data: profile } = await supabase
      .from("profiles")
      .select("city, bio, profile_completion")
      .eq("id", session.user.id)
      .single();

    if (profile?.profile_completion >= 80) {
      navigate("/dashboard");
    }
  };

  const handleRoleToggle = (role: string) => {
    setRoleSelection(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleStep1Submit = async () => {
    if (roleSelection.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one role",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Insert roles into user_roles table
      for (const role of roleSelection) {
        await supabase
          .from("user_roles")
          .insert({ 
            user_id: user.id, 
            role: role as any 
          })
          .select()
          .single();
      }

      setStep(2);
    } catch (error: any) {
      console.error("Error saving roles:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save role selection",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validation = onboardingSchema.safeParse({
        city,
        bio,
        skills,
        hourlyRate,
      });

      if (!validation.success) {
        const firstError = validation.error.errors[0];
        throw new Error(firstError.message);
      }

      setLoading(true);

      const profileData: any = {
        city: validation.data.city,
        bio: validation.data.bio,
        profile_completion: 80,
      };

      // Add task doer specific fields if they selected task_doer
      if (roleSelection.includes("task_doer")) {
        if (validation.data.skills) {
          profileData.skills = validation.data.skills.split(",").map(s => s.trim());
        }
        if (validation.data.hourlyRate) {
          profileData.hourly_rate = parseFloat(validation.data.hourlyRate);
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile Complete! 🎉",
        description: "Welcome to SaskTask! Let's get started.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 text-gradient">Welcome to SaskTask!</h1>
          <p className="text-muted-foreground">Let's set up your profile</p>
        </div>

        {step === 1 && (
          <Card className="shadow-2xl border-border glass">
            <CardHeader>
              <CardTitle className="text-2xl">Choose Your Role</CardTitle>
              <CardDescription>
                Are you primarily a Task Giver, Task Doer, or Both?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Card 
                  className={`cursor-pointer transition-all ${
                    roleSelection.includes("task_giver") 
                      ? "border-primary bg-primary/5 ring-2 ring-primary" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleRoleToggle("task_giver")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Checkbox 
                        checked={roleSelection.includes("task_giver")}
                        onCheckedChange={() => handleRoleToggle("task_giver")}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Briefcase className="h-6 w-6 text-primary" />
                          </div>
                          <h3 className="text-xl font-semibold">Task Giver</h3>
                        </div>
                        <p className="text-muted-foreground">
                          Post tasks and get help from skilled taskers in your area
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${
                    roleSelection.includes("task_doer") 
                      ? "border-secondary bg-secondary/5 ring-2 ring-secondary" 
                      : "border-border hover:border-secondary/50"
                  }`}
                  onClick={() => handleRoleToggle("task_doer")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Checkbox 
                        checked={roleSelection.includes("task_doer")}
                        onCheckedChange={() => handleRoleToggle("task_doer")}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                            <ClipboardCheck className="h-6 w-6 text-secondary" />
                          </div>
                          <h3 className="text-xl font-semibold">Task Doer</h3>
                        </div>
                        <p className="text-muted-foreground">
                          Earn money by completing tasks and building your reputation
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${
                    roleSelection.includes("task_giver") && roleSelection.includes("task_doer")
                      ? "border-accent bg-accent/5 ring-2 ring-accent" 
                      : "border-border hover:border-accent/50"
                  }`}
                  onClick={() => {
                    if (roleSelection.includes("task_giver") && roleSelection.includes("task_doer")) {
                      setRoleSelection([]);
                    } else {
                      setRoleSelection(["task_giver", "task_doer"]);
                    }
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Checkbox 
                        checked={roleSelection.includes("task_giver") && roleSelection.includes("task_doer")}
                        onCheckedChange={() => {
                          if (roleSelection.includes("task_giver") && roleSelection.includes("task_doer")) {
                            setRoleSelection([]);
                          } else {
                            setRoleSelection(["task_giver", "task_doer"]);
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-accent" />
                          </div>
                          <h3 className="text-xl font-semibold">Both</h3>
                        </div>
                        <p className="text-muted-foreground">
                          Post tasks when you need help and complete tasks to earn money
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button 
                onClick={handleStep1Submit}
                disabled={loading || roleSelection.length === 0}
                className="w-full"
                variant="hero"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="shadow-2xl border-border glass">
            <CardHeader>
              <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
              <CardDescription>
                Tell us a bit about yourself
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep2Submit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="city">City / Location *</Label>
                  <Input
                    id="city"
                    placeholder="e.g., Saskatoon, SK"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Short Bio *</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself... (min 10 characters)"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    required
                    minLength={10}
                    maxLength={500}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    {bio.length}/500 characters
                  </p>
                </div>

                {roleSelection.includes("task_doer") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="skills">Your Skills (comma-separated)</Label>
                      <Input
                        id="skills"
                        placeholder="e.g., Plumbing, Electrical, Moving"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        List your skills to help clients find you
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Hourly Rate (CAD)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        placeholder="e.g., 25"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                      <p className="text-xs text-muted-foreground">
                        Set your default hourly rate
                      </p>
                    </div>
                  </>
                )}

                <div className="flex gap-3">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                    variant="hero"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Completing...
                      </>
                    ) : (
                      "Complete Profile"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
