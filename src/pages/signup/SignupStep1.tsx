import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getSignupDraft, saveSignupDraft } from "@/lib/signupDraft";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { AppleSignInButton } from "@/components/auth/AppleSignInButton";

const SignupStep1 = () => {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const draft = getSignupDraft();
    setFirstName(draft.firstName);
    setMiddleName(draft.middleName);
    setLastName(draft.lastName);
    setEmail(draft.email);
    setDateOfBirth(draft.dateOfBirth);
  }, []);

  const handleContinue = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !dateOfBirth) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields to continue.",
        variant: "destructive",
      });
      return;
    }

    saveSignupDraft({
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      dateOfBirth,
    });
    navigate("/signup/step-2");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-xl shadow-2xl border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Step 1 of 4: Basic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <GoogleSignInButton mode="signup" />
            <AppleSignInButton mode="signup" />
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or sign up with email
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">First name *</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="middleName">Middle name</Label>
            <Input
              id="middleName"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              placeholder="Middle name"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name *</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of birth *</Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="h-11"
            />
          </div>
          <Button onClick={handleContinue} className="w-full" variant="hero" size="lg">
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupStep1;
