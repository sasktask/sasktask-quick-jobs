import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, Upload, FileCheck, AlertCircle, Shield, User, Loader2, X, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface IDVerificationUploadProps {
  userId: string;
  onComplete?: () => void;
  onSkip?: () => void;
}

const ID_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "national_id", label: "National ID Card" },
  { value: "health_card", label: "Provincial Health Card" },
  { value: "pr_card", label: "Permanent Resident Card" },
];

export function IDVerificationUpload({ userId, onComplete, onSkip }: IDVerificationUploadProps) {
  const [idType, setIdType] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ id: false, selfie: false });
  
  const idInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null, type: "id" | "selfie") => {
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or WebP image");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "id") {
        setIdFile(file);
        setIdPreview(reader.result as string);
      } else {
        setSelfieFile(file);
        setSelfiePreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearFile = (type: "id" | "selfie") => {
    if (type === "id") {
      setIdFile(null);
      setIdPreview(null);
      if (idInputRef.current) idInputRef.current.value = "";
    } else {
      setSelfieFile(null);
      setSelfiePreview(null);
      if (selfieInputRef.current) selfieInputRef.current.value = "";
    }
  };

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from("verification-documents")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      throw error;
    }

    return data.path;
  };

  const handleSubmit = async () => {
    if (!idType) {
      toast.error("Please select your ID type");
      return;
    }

    if (!idFile) {
      toast.error("Please upload your government ID");
      return;
    }

    if (!selfieFile) {
      toast.error("Please upload a selfie for verification");
      return;
    }

    setIsUploading(true);

    try {
      // Upload ID document
      const idPath = `${userId}/id-${Date.now()}.${idFile.name.split(".").pop()}`;
      const idStoragePath = await uploadFile(idFile, idPath);
      setUploadProgress(prev => ({ ...prev, id: true }));

      // Upload selfie
      const selfiePath = `${userId}/selfie-${Date.now()}.${selfieFile.name.split(".").pop()}`;
      const selfieStoragePath = await uploadFile(selfieFile, selfiePath);
      setUploadProgress(prev => ({ ...prev, selfie: true }));

      // Get public URLs
      const { data: idUrlData } = supabase.storage
        .from("verification-documents")
        .getPublicUrl(idStoragePath!);

      const { data: selfieUrlData } = supabase.storage
        .from("verification-documents")
        .getPublicUrl(selfieStoragePath!);

      // Check if verification record exists
      const { data: existingVerification } = await supabase
        .from("verifications")
        .select("id")
        .eq("user_id", userId)
        .single();

      const verificationData = {
        id_type: idType,
        id_document_url: idUrlData.publicUrl,
        id_verified: false, // Will be verified by admin
        verification_status: "pending" as const,
        updated_at: new Date().toISOString(),
      };

      if (existingVerification) {
        const { error: updateError } = await supabase
          .from("verifications")
          .update(verificationData)
          .eq("user_id", userId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("verifications")
          .insert({
            user_id: userId,
            ...verificationData,
          });

        if (insertError) throw insertError;
      }

      toast.success("Documents uploaded successfully! Our team will review them shortly.");
      onComplete?.();
    } catch (error) {
      console.error("Verification upload error:", error);
      toast.error("Failed to upload documents. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Verify Your Identity</CardTitle>
        <CardDescription>
          Upload your government-issued ID and a selfie to complete verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your documents are securely stored and only used for identity verification. 
            We comply with Canadian privacy laws (PIPEDA).
          </AlertDescription>
        </Alert>

        {/* ID Type Selection */}
        <div className="space-y-2">
          <Label>Type of Government ID <span className="text-destructive">*</span></Label>
          <Select value={idType} onValueChange={setIdType}>
            <SelectTrigger>
              <SelectValue placeholder="Select your ID type" />
            </SelectTrigger>
            <SelectContent>
              {ID_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ID Upload */}
        <div className="space-y-2">
          <Label>Government ID Photo <span className="text-destructive">*</span></Label>
          <p className="text-sm text-muted-foreground mb-2">
            Upload a clear photo of the front of your ID. Make sure all text is readable.
          </p>
          
          {idPreview ? (
            <div className="relative rounded-lg border border-border overflow-hidden">
              <img 
                src={idPreview} 
                alt="ID Preview" 
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => clearFile("id")}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
              {uploadProgress.id && (
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
          ) : (
            <div 
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => idInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG or WebP (max 10MB)
              </p>
            </div>
          )}
          
          <input
            ref={idInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null, "id")}
          />
        </div>

        {/* Selfie Upload */}
        <div className="space-y-2">
          <Label>Selfie Photo <span className="text-destructive">*</span></Label>
          <p className="text-sm text-muted-foreground mb-2">
            Take a clear selfie holding your ID next to your face. This helps us verify you are the ID owner.
          </p>
          
          {selfiePreview ? (
            <div className="relative rounded-lg border border-border overflow-hidden">
              <img 
                src={selfiePreview} 
                alt="Selfie Preview" 
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => clearFile("selfie")}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
              {uploadProgress.selfie && (
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
          ) : (
            <div 
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => selfieInputRef.current?.click()}
            >
              <Camera className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                Click to upload your selfie
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG or WebP (max 10MB)
              </p>
            </div>
          )}
          
          <input
            ref={selfieInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null, "selfie")}
          />
        </div>

        {/* Tips */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-primary" />
            Tips for Quick Approval
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Ensure good lighting and clear focus</li>
            <li>• All text on ID should be readable</li>
            <li>• ID should not be expired</li>
            <li>• Selfie should clearly show your face and the ID</li>
            <li>• Remove glasses or hats if possible</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {onSkip && (
            <Button 
              variant="outline" 
              onClick={onSkip}
              disabled={isUploading}
              className="flex-1"
            >
              Skip for Now
            </Button>
          )}
          <Button 
            onClick={handleSubmit}
            disabled={isUploading || !idType || !idFile || !selfieFile}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Submit for Verification
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Verification typically takes 24-48 hours. You can use the platform while waiting for approval.
        </p>
      </CardContent>
    </Card>
  );
}
