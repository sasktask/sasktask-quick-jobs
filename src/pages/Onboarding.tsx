import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Briefcase, ClipboardCheck, Users, Sparkles, MapPin, FileText, DollarSign, ArrowRight, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { OnboardingProgress } from "@/components/OnboardingProgress";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { SEOHead } from "@/components/SEOHead";

const onboardingSchema = z.object({
  city: z.string().trim().min(2, "City is required").max(100),
  bio: z.string().trim().min(10, "Bio must be at least 10 characters").max(500),
  skills: z.string().optional(),
  hourlyRate: z.string().optional(),
});

const onboardingSteps = [
  { title: "Role", description: "Choose how you'll use SaskTask" },
  { title: "Profile", description: "Tell us about yourself" },
  { title: "Complete", description: "You're ready to go!" },
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [roleSelection, setRoleSelection] = useState<string[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  
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
    
    // Get user name from metadata
    const fullName = session.user.user_metadata?.full_name || 
                     session.user.user_metadata?.first_name || 
                     "";
    setUserName(fullName.split(" ")[0]);

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

      // Show welcome dialog before navigating
      setStep(3);
      setShowWelcome(true);
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

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    toast({
      title: "Profile Complete! 🎉",
      description: "Welcome to SaskTask! Let's get started.",
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <SEOHead 
        title="Complete Your Profile - SaskTask"
        description="Set up your SaskTask profile and start connecting with your community"
        url="/onboarding"
      />
      
      <WelcomeDialog 
        open={showWelcome} 
        onClose={handleWelcomeClose}
        userName={userName}
      />
      
      <div className="max-w-2xl w-full">
        {/* Header with animated icon */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {step === 1 ? `Welcome${userName ? `, ${userName}` : ""}!` : "Almost There!"}
          </h1>
          <p className="text-muted-foreground">
            {step === 1 ? "Let's set up your profile in just 2 steps" : "Complete your profile to get started"}
          </p>
        </div>

        {/* Progress indicator */}
        <OnboardingProgress 
          currentStep={step} 
          totalSteps={onboardingSteps.length - 1}
          steps={onboardingSteps}
        />

        {step === 1 && (
          <Card className="shadow-2xl border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">How will you use SaskTask?</CardTitle>
              <CardDescription>
                Select one or more roles that fit your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Task Giver Card */}
              <div 
                className={`relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${
                  roleSelection.includes("task_giver") 
                    ? "ring-2 ring-primary shadow-lg shadow-primary/20" 
                    : "hover:shadow-md border border-border"
                }`}
                onClick={() => handleRoleToggle("task_giver")}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 transition-opacity ${
                  roleSelection.includes("task_giver") ? "opacity-100" : "opacity-0"
                }`} />
                <div className="relative p-5 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                    roleSelection.includes("task_giver") 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-primary/10 text-primary"
                  }`}>
                    <Briefcase className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">Task Giver</h3>
                    <p className="text-sm text-muted-foreground">Post tasks and hire local help</p>
                  </div>
                  <Checkbox 
                    checked={roleSelection.includes("task_giver")}
                    className="h-5 w-5"
                  />
                </div>
              </div>

              {/* Task Doer Card */}
              <div 
                className={`relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${
                  roleSelection.includes("task_doer") 
                    ? "ring-2 ring-secondary shadow-lg shadow-secondary/20" 
                    : "hover:shadow-md border border-border"
                }`}
                onClick={() => handleRoleToggle("task_doer")}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-secondary/10 to-secondary/5 transition-opacity ${
                  roleSelection.includes("task_doer") ? "opacity-100" : "opacity-0"
                }`} />
                <div className="relative p-5 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                    roleSelection.includes("task_doer") 
                      ? "bg-secondary text-secondary-foreground" 
                      : "bg-secondary/10 text-secondary"
                  }`}>
                    <ClipboardCheck className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">Task Doer</h3>
                    <p className="text-sm text-muted-foreground">Earn money completing tasks</p>
                  </div>
                  <Checkbox 
                    checked={roleSelection.includes("task_doer")}
                    className="h-5 w-5"
                  />
                </div>
              </div>

              {/* Both Card */}
              <div 
                className={`relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${
                  roleSelection.includes("task_giver") && roleSelection.includes("task_doer")
                    ? "ring-2 ring-accent shadow-lg shadow-accent/20" 
                    : "hover:shadow-md border border-border"
                }`}
                onClick={() => {
                  if (roleSelection.includes("task_giver") && roleSelection.includes("task_doer")) {
                    setRoleSelection([]);
                  } else {
                    setRoleSelection(["task_giver", "task_doer"]);
                  }
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-accent/10 to-accent/5 transition-opacity ${
                  roleSelection.includes("task_giver") && roleSelection.includes("task_doer") ? "opacity-100" : "opacity-0"
                }`} />
                <div className="relative p-5 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                    roleSelection.includes("task_giver") && roleSelection.includes("task_doer")
                      ? "bg-accent text-accent-foreground" 
                      : "bg-accent/10 text-accent"
                  }`}>
                    <Users className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">Both</h3>
                    <p className="text-sm text-muted-foreground">Do it all - post and complete tasks</p>
                  </div>
                  <Checkbox 
                    checked={roleSelection.includes("task_giver") && roleSelection.includes("task_doer")}
                    className="h-5 w-5"
                  />
                </div>
              </div>

              <Button 
                onClick={handleStep1Submit}
                disabled={loading || roleSelection.length === 0}
                className="w-full mt-6 group"
                variant="hero"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="shadow-2xl border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Tell us about yourself</CardTitle>
              <CardDescription>
                This helps others find and connect with you
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleStep2Submit} className="space-y-5">
                {/* Location Field */}
                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    City / Location *
                  </Label>
                  <Input
                    id="city"
                    placeholder="e.g., Saskatoon, SK"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                {/* Bio Field */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Short Bio *
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself, your experience, and what makes you great at what you do..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    required
                    minLength={10}
                    maxLength={500}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min 10 characters</span>
                    <span className={bio.length >= 10 ? "text-green-500" : ""}>{bio.length}/500</span>
                  </div>
                </div>

                {roleSelection.includes("task_doer") && (
                  <div className="space-y-5 p-4 rounded-xl bg-secondary/5 border border-secondary/20">
                    <h4 className="font-medium text-secondary flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4" />
                      Task Doer Details
                    </h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="skills">Your Skills</Label>
                      <Input
                        id="skills"
                        placeholder="e.g., Plumbing, Electrical, Moving, Cleaning"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="h-12"
                      />
                      <p className="text-xs text-muted-foreground">
                        Separate skills with commas
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Hourly Rate (CAD)
                      </Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        placeholder="e.g., 25"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        min="0"
                        step="0.01"
                        className="h-12"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    disabled={loading || bio.length < 10 || !city.trim()}
                    className="flex-1 group"
                    variant="hero"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Completing...
                      </>
                    ) : (
                      <>
                        Complete Profile
                        <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                      </>
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
