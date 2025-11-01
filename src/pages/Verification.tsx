import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Shield, FileCheck, Award, CreditCard, CheckCircle } from "lucide-react";

export default function Verification() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    // Legal
    termsAccepted: false,
    privacyAccepted: false,
    legalName: "",
    dateOfBirth: "",
    
    // Identity
    idType: "",
    
    // Background check
    backgroundCheckConsent: false,
    
    // Insurance
    hasInsurance: false,
    insuranceProvider: "",
    insurancePolicyNumber: "",
    insuranceExpiryDate: "",
    
    // Skills
    skills: "",
    certifications: "",
    
    // Tax
    sinProvided: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUserId(user.id);
    
    // Check if verification already exists
    const { data: existing } = await supabase
      .from("verifications")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    if (existing) {
      toast({
        title: "Verification in Progress",
        description: "You have already submitted your verification.",
      });
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.from("verifications").insert({
        user_id: userId,
        terms_accepted: formData.termsAccepted,
        terms_accepted_at: formData.termsAccepted ? new Date().toISOString() : null,
        privacy_accepted: formData.privacyAccepted,
        privacy_accepted_at: formData.privacyAccepted ? new Date().toISOString() : null,
        age_verified: calculateAge(formData.dateOfBirth) >= 18,
        legal_name: formData.legalName,
        date_of_birth: formData.dateOfBirth,
        id_type: formData.idType,
        background_check_consent: formData.backgroundCheckConsent,
        has_insurance: formData.hasInsurance,
        insurance_provider: formData.insuranceProvider || null,
        insurance_policy_number: formData.insurancePolicyNumber || null,
        insurance_expiry_date: formData.insuranceExpiryDate || null,
        skills: formData.skills ? formData.skills.split(",").map(s => s.trim()) : [],
        certifications: formData.certifications ? formData.certifications.split(",").map(c => c.trim()) : [],
        sin_provided: formData.sinProvided,
        verification_status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Verification Submitted!",
        description: "Your verification is under review. We'll notify you once approved.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Legal Compliance (Saskatchewan & Canada)</h3>
              <p className="text-muted-foreground">
                Please review and accept the following terms to proceed with verification.
              </p>
              
              <div className="space-y-4 border border-border rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, termsAccepted: checked as boolean })
                    }
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    I accept the Terms of Service and understand my rights and responsibilities as a Tasker in Saskatchewan and Canada.
                  </Label>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="privacy"
                    checked={formData.privacyAccepted}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, privacyAccepted: checked as boolean })
                    }
                  />
                  <Label htmlFor="privacy" className="text-sm leading-relaxed cursor-pointer">
                    I accept the Privacy Policy and consent to data processing in accordance with Canadian privacy laws (PIPEDA).
                  </Label>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="legalName">Full Legal Name *</Label>
                <Input
                  id="legalName"
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  placeholder="As it appears on government ID"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="dob">Date of Birth * (Must be 18+)</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Identity Verification</h3>
              <p className="text-muted-foreground">
                Verify your identity to build trust with task givers.
              </p>

              <div className="space-y-3">
                <Label htmlFor="idType">Government ID Type *</Label>
                <select
                  id="idType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.idType}
                  onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                  required
                >
                  <option value="">Select ID type</option>
                  <option value="driver_license">Driver's License</option>
                  <option value="passport">Passport</option>
                  <option value="health_card">Saskatchewan Health Card</option>
                </select>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="backgroundCheck"
                  checked={formData.backgroundCheckConsent}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, backgroundCheckConsent: checked as boolean })
                  }
                />
                <Label htmlFor="backgroundCheck" className="text-sm leading-relaxed cursor-pointer">
                  I consent to a background check as required by Saskatchewan law for service providers.
                </Label>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Insurance & Skills</h3>
              <p className="text-muted-foreground">
                Provide insurance details and your skills (optional but recommended).
              </p>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="insurance"
                  checked={formData.hasInsurance}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, hasInsurance: checked as boolean })
                  }
                />
                <Label htmlFor="insurance" className="text-sm leading-relaxed cursor-pointer">
                  I have liability insurance (Recommended for certain tasks)
                </Label>
              </div>

              {formData.hasInsurance && (
                <>
                  <div className="space-y-3">
                    <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                    <Input
                      id="insuranceProvider"
                      value={formData.insuranceProvider}
                      onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                      placeholder="e.g., SGI, TD Insurance"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="policyNumber">Policy Number</Label>
                    <Input
                      id="policyNumber"
                      value={formData.insurancePolicyNumber}
                      onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.insuranceExpiryDate}
                      onChange={(e) => setFormData({ ...formData, insuranceExpiryDate: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="space-y-3">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Textarea
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g., Plumbing, Electrical, Carpentry, Snow Removal"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="certifications">Certifications (comma-separated)</Label>
                <Textarea
                  id="certifications"
                  value={formData.certifications}
                  onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                  placeholder="e.g., Red Seal, First Aid, WHMIS"
                />
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Tax Information</h3>
              <p className="text-muted-foreground">
                Tax information is required for earnings over $500 (CRA requirement).
              </p>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="sin"
                  checked={formData.sinProvided}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, sinProvided: checked as boolean })
                  }
                />
                <Label htmlFor="sin" className="text-sm leading-relaxed cursor-pointer">
                  I will provide my Social Insurance Number (SIN) for tax reporting purposes as required by the Canada Revenue Agency.
                </Label>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Review Your Information
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>✓ Legal name: {formData.legalName}</li>
                  <li>✓ Age verified: {calculateAge(formData.dateOfBirth) >= 18 ? "Yes" : "No"}</li>
                  <li>✓ ID type: {formData.idType}</li>
                  <li>✓ Background check consent: {formData.backgroundCheckConsent ? "Yes" : "No"}</li>
                  <li>✓ Insurance: {formData.hasInsurance ? "Yes" : "No"}</li>
                </ul>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Become a Verified Tasker</CardTitle>
              <CardDescription>
                Complete the verification process to start accepting tasks and earning money on SaskTask.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {/* Progress Steps */}
              <div className="flex justify-between mb-8">
                {[
                  { num: 1, icon: FileCheck, label: "Legal" },
                  { num: 2, icon: Shield, label: "Identity" },
                  { num: 3, icon: Award, label: "Skills" },
                  { num: 4, icon: CreditCard, label: "Tax Info" }
                ].map((step) => (
                  <div key={step.num} className="flex flex-col items-center gap-2">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      currentStep >= step.num 
                        ? "bg-primary text-white" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      <step.icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs text-center">{step.label}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {renderStep()}

                <div className="flex gap-4 pt-6">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      disabled={loading}
                    >
                      Back
                    </Button>
                  )}
                  
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading || (currentStep === 1 && (!formData.termsAccepted || !formData.privacyAccepted))}
                  >
                    {loading ? "Submitting..." : currentStep === 4 ? "Submit Verification" : "Continue"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}