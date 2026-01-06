// @ts-nocheck
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
import { Shield, FileCheck, Award, CreditCard, CheckCircle, Upload, FileText, X, Phone } from "lucide-react";
import { PhoneVerification } from "@/components/PhoneVerification";
import { Progress } from "@/components/ui/progress";

export default function Verification() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [idDocumentUrl, setIdDocumentUrl] = useState<string | null>(null);
  const [selfieDocument, setSelfieDocument] = useState<File | null>(null);
  const [selfieDocumentUrl, setSelfieDocumentUrl] = useState<string | null>(null);
  const [insuranceDocument, setInsuranceDocument] = useState<File | null>(null);
  const [insuranceDocumentUrl, setInsuranceDocumentUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Legal
    termsAccepted: false,
    privacyAccepted: false,
    legalName: "",
    dateOfBirth: "",
    phoneVerified: false,
    verifiedPhone: "",

    // Identity
    idType: "",
    idNumber: "",

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
      .maybeSingle();

    if (existing) {
      // If already verified, redirect to dashboard; otherwise stay on page so user can view status or resubmit
      if (existing.verification_status === "verified") {
        toast({
          title: "Already Verified",
          description: "Your account is already verified.",
        });
        navigate("/dashboard");
        return;
      }

      // Pre-fill form state as needed (kept minimal here)
      setFormData((prev) => ({
        ...prev,
        legalName: existing.legal_name || prev.legalName,
        dateOfBirth: existing.date_of_birth || prev.dateOfBirth,
        idType: existing.id_type || prev.idType,
        idNumber: existing.id_number_hash ? "Submitted" : prev.idNumber,
        backgroundCheckConsent: existing.background_check_consent ?? prev.backgroundCheckConsent,
        hasInsurance: existing.has_insurance ?? prev.hasInsurance,
        insuranceProvider: existing.insurance_provider || prev.insuranceProvider,
        insurancePolicyNumber: existing.insurance_policy_number || prev.insurancePolicyNumber,
        insuranceExpiryDate: existing.insurance_expiry_date || prev.insuranceExpiryDate,
        skills: (existing.skills as string[] | null)?.join(", ") || prev.skills,
        certifications: (existing.certifications as string[] | null)?.join(", ") || prev.certifications,
        sinProvided: existing.sin_provided ?? prev.sinProvided,
        termsAccepted: existing.terms_accepted ?? prev.termsAccepted,
        privacyAccepted: existing.privacy_accepted ?? prev.privacyAccepted,
      }));
    }
  };

  const handleFileUpload = async (file: File, type: 'id' | 'insurance' | 'selfie') => {
    if (!userId) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${Date.now()}.${fileExt}`;
      // Use userId as the folder name to match storage RLS policy
      const filePath = `${userId}/${fileName}`;

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(filePath, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) throw uploadError;

      // Store the file path (not public URL) since bucket is private
      // Admins will use signed URLs to view documents
      if (type === 'id') {
        setIdDocumentUrl(filePath);
      } else if (type === 'selfie') {
        setSelfieDocumentUrl(filePath);
      } else {
        setInsuranceDocumentUrl(filePath);
      }

      toast({
        title: "Upload Successful",
        description: `${type === 'id' ? 'ID' : type === 'selfie' ? 'Selfie' : 'Insurance'} document uploaded successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate ID document and selfie on step 2
    if (currentStep === 2) {
      if (!idDocumentUrl) {
        toast({
          title: "ID Document Required",
          description: "Please upload your government ID document to continue.",
          variant: "destructive",
        });
        return;
      }
      if (!selfieDocumentUrl) {
        toast({
          title: "Selfie Required",
          description: "Please upload a selfie holding your ID for verification.",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setLoading(true);

    try {
      // Hash ID number for security
      const encoder = new TextEncoder();
      const data = encoder.encode(formData.idNumber);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const idNumberHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { error } = await supabase.from("verifications").insert({
        user_id: userId,
        terms_accepted: formData.termsAccepted,
        terms_accepted_at: formData.termsAccepted ? new Date().toISOString() : null,
        privacy_accepted: formData.privacyAccepted,
        privacy_accepted_at: formData.privacyAccepted ? new Date().toISOString() : null,
        age_verified: calculateAge(formData.dateOfBirth) >= 18,
        legal_name: formData.legalName,
        date_of_birth: formData.dateOfBirth,
        phone_verified: formData.phoneVerified,
        verified_phone: formData.verifiedPhone || null,
        id_type: formData.idType,
        id_number_hash: idNumberHash,
        id_document_url: idDocumentUrl,
        background_check_consent: formData.backgroundCheckConsent,
        has_insurance: formData.hasInsurance,
        insurance_provider: formData.insuranceProvider || null,
        insurance_policy_number: formData.insurancePolicyNumber || null,
        insurance_expiry_date: formData.insuranceExpiryDate || null,
        insurance_document_url: insuranceDocumentUrl,
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

              {/* Phone Verification */}
              {userId && (
                <PhoneVerification
                  userId={userId}
                  onVerified={(phone) => setFormData({ ...formData, phoneVerified: true, verifiedPhone: phone })}
                />
              )}
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

              <div className="space-y-3">
                <Label htmlFor="idNumber">ID Number (Last 4 digits) *</Label>
                <Input
                  id="idNumber"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  placeholder="Last 4 digits only"
                  maxLength={4}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  For security, only enter the last 4 digits of your ID number
                </p>
              </div>

              <div className="space-y-3">
                <Label>Upload ID Document *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  {idDocumentUrl ? (
                    <div className="space-y-3">
                      <FileText className="h-12 w-12 mx-auto text-primary" />
                      <p className="text-sm text-muted-foreground">Document uploaded successfully</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIdDocument(null);
                          setIdDocumentUrl(null);
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload a clear photo or scan of your government ID
                      </p>
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIdDocument(file);
                            handleFileUpload(file, 'id');
                          }
                        }}
                        disabled={uploading}
                        className="max-w-xs mx-auto"
                      />
                      {uploading && (
                        <div className="mt-4 space-y-2">
                          <Progress value={uploadProgress} />
                          <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Accepted formats: JPG, PNG, PDF (Max 5MB)
                </p>
              </div>

              {/* Selfie Upload */}
              <div className="space-y-3">
                <Label>Upload Selfie with ID *</Label>
                <p className="text-sm text-muted-foreground">
                  Take a clear selfie holding your ID next to your face. This helps verify you are the ID owner.
                </p>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  {selfieDocumentUrl ? (
                    <div className="space-y-3">
                      <FileText className="h-12 w-12 mx-auto text-primary" />
                      <p className="text-sm text-muted-foreground">Selfie uploaded successfully</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelfieDocument(null);
                          setSelfieDocumentUrl(null);
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload a selfie holding your ID next to your face
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelfieDocument(file);
                            handleFileUpload(file, 'selfie');
                          }
                        }}
                        disabled={uploading}
                        className="max-w-xs mx-auto"
                      />
                      {uploading && (
                        <div className="mt-4 space-y-2">
                          <Progress value={uploadProgress} />
                          <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Accepted formats: JPG, PNG (Max 5MB)
                </p>
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

                  <div className="space-y-3">
                    <Label>Upload Insurance Document (Optional)</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      {insuranceDocumentUrl ? (
                        <div className="space-y-3">
                          <FileText className="h-12 w-12 mx-auto text-primary" />
                          <p className="text-sm text-muted-foreground">Insurance document uploaded</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setInsuranceDocument(null);
                              setInsuranceDocumentUrl(null);
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <Input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setInsuranceDocument(file);
                                handleFileUpload(file, 'insurance');
                              }
                            }}
                            disabled={uploading}
                            className="max-w-xs mx-auto"
                          />
                        </>
                      )}
                    </div>
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
                  <li>✓ Phone verified: {formData.phoneVerified ? formData.verifiedPhone : "No"}</li>
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
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${currentStep >= step.num
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
                    disabled={loading || (currentStep === 1 && (!formData.termsAccepted || !formData.privacyAccepted || !formData.phoneVerified))}
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