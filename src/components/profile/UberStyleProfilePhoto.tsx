import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  User,
  Shield,
  Eye,
  Sun,
  Smartphone,
  Glasses,
  HelpCircle,
  Upload,
  RefreshCw,
} from "lucide-react";
import { ImageCropDialog } from "@/components/ImageCropDialog";

interface UberStyleProfilePhotoProps {
  userId: string;
  currentPhotoUrl: string | null;
  isPhotoVerified: boolean;
  verificationStatus: "none" | "pending" | "verified" | "rejected";
  onPhotoUpdated: () => void;
}

const PHOTO_GUIDELINES = [
  {
    icon: Eye,
    title: "Face clearly visible",
    description: "Your face should take up 60-90% of the frame",
  },
  {
    icon: Sun,
    title: "Good lighting",
    description: "Use natural lighting, avoid harsh shadows",
  },
  {
    icon: Glasses,
    title: "No sunglasses or masks",
    description: "Your full face must be visible without obstructions",
  },
  {
    icon: Smartphone,
    title: "Recent photo",
    description: "Photo should be taken within the last 6 months",
  },
];

const PHOTO_REQUIREMENTS = [
  "Clear, front-facing photo of your face",
  "Neutral background preferred",
  "No filters or heavy editing",
  "No group photos - only you",
  "No logos, text, or graphics",
  "Must match your ID for verification",
];

export const UberStyleProfilePhoto = ({
  userId,
  currentPhotoUrl,
  isPhotoVerified,
  verificationStatus,
  onPhotoUpdated,
}: UberStyleProfilePhotoProps) => {
  const [uploading, setUploading] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start camera for selfie
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 720, height: 720 },
        audio: false,
      });
      setCameraStream(stream);
      setShowCamera(true);
      
      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error("Camera access error:", error);
      toast.error("Unable to access camera. Please check permissions.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
    setCapturedImage(null);
  };

  // Capture selfie
  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Mirror the image for selfie
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        
        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.95);
        setCapturedImage(imageDataUrl);
      }
    }
  };

  // Retake selfie
  const retakeSelfie = () => {
    setCapturedImage(null);
  };

  // Confirm and upload selfie
  const confirmSelfie = async () => {
    if (!capturedImage) return;
    
    stopCamera();
    setImageToCrop(capturedImage);
    setCropDialogOpen(true);
  };

  // Handle file upload from gallery
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (JPG, PNG)");
        return;
      }

      // Read file as data URL for cropping
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);

      // Reset input
      event.target.value = "";
    } catch (error: any) {
      console.error("Error preparing image:", error);
      toast.error(error.message || "Failed to load image");
    }
  };

  // Upload cropped photo
  const handleCropComplete = async (croppedBlob: Blob) => {
    try {
      setUploading(true);
      setUploadProgress(10);

      const filePath = `${userId}/${Date.now()}.jpg`;
      setUploadProgress(30);

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, croppedBlob, { upsert: true });

      if (uploadError) throw uploadError;
      setUploadProgress(60);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath);

      setUploadProgress(80);

      // Update profile with new photo and reset verification status
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
          photo_verified: false, // Reset verification when photo changes
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      setUploadProgress(100);
      toast.success("Photo uploaded! Submit for verification to get the verified badge.");
      onPhotoUpdated();
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error(error.message || "Failed to upload photo");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Submit photo for verification
  const submitForVerification = async () => {
    if (!currentPhotoUrl) {
      toast.error("Please upload a photo first");
      return;
    }

    try {
      // Update verifications table
      const { data: existing } = await supabase
        .from("verifications")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existing) {
        await supabase
          .from("verifications")
          .update({
            photo_verification_status: "pending",
            photo_url: currentPhotoUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      } else {
        await supabase.from("verifications").insert({
          user_id: userId,
          photo_verification_status: "pending",
          photo_url: currentPhotoUrl,
        });
      }

      toast.success("Photo submitted for verification! We'll review it within 24 hours.");
      onPhotoUpdated();
    } catch (error: any) {
      console.error("Error submitting for verification:", error);
      toast.error("Failed to submit for verification");
    }
  };

  const getVerificationBadge = () => {
    switch (verificationStatus) {
      case "verified":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Verified Photo
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Pending Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected - Update Required
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Not Verified
          </Badge>
        );
    }
  };

  return (
    <>
      {/* Image Crop Dialog */}
      <ImageCropDialog
        open={cropDialogOpen}
        onClose={() => setCropDialogOpen(false)}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
      />

      {/* Photo Guidelines Dialog */}
      <Dialog open={showGuidelines} onOpenChange={setShowGuidelines}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Photo Guidelines
            </DialogTitle>
            <DialogDescription>
              Follow these guidelines to ensure your photo is approved
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {PHOTO_GUIDELINES.map((guideline, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-muted/50 border"
                >
                  <guideline.icon className="h-5 w-5 text-primary mb-2" />
                  <p className="font-medium text-sm">{guideline.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {guideline.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border">
              <h4 className="font-medium mb-2 text-sm">Requirements</h4>
              <ul className="space-y-1">
                {PHOTO_REQUIREMENTS.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-500 shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Camera/Selfie Dialog */}
      <Dialog open={showCamera} onOpenChange={(open) => !open && stopCamera()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Take a Selfie</DialogTitle>
            <DialogDescription>
              Position your face in the center of the frame
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              {!capturedImage ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  {/* Face guide overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-56 border-2 border-dashed border-white/50 rounded-full" />
                  </div>
                </>
              ) : (
                <img
                  src={capturedImage}
                  alt="Captured selfie"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex gap-2">
              {!capturedImage ? (
                <>
                  <Button variant="outline" onClick={stopCamera} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={captureSelfie} className="flex-1">
                    <Camera className="h-4 w-4 mr-2" />
                    Capture
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={retakeSelfie} className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retake
                  </Button>
                  <Button onClick={confirmSelfie} className="flex-1">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Use Photo
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Main Profile Photo Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Profile Photo
              </CardTitle>
              <CardDescription>
                A verified photo helps build trust with clients
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGuidelines(true)}
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Guidelines
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Photo Display */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-28 w-28 ring-4 ring-muted">
                <AvatarImage src={currentPhotoUrl || undefined} alt="Profile" />
                <AvatarFallback className="text-2xl">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              
              {/* Verification indicator */}
              {verificationStatus === "verified" && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-2 border-background">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              {getVerificationBadge()}
              
              {uploading && (
                <div className="space-y-1">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={startCamera}
                  disabled={uploading}
                  className="gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Take Selfie
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </div>
            </div>
          </div>

          {/* Verification CTA */}
          {currentPhotoUrl && verificationStatus !== "verified" && verificationStatus !== "pending" && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Get Verified</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Verified photos increase trust by 40% and help you get more jobs. 
                    Your photo will be compared with your ID for authenticity.
                  </p>
                  <Button size="sm" onClick={submitForVerification}>
                    Submit for Verification
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Pending status message */}
          {verificationStatus === "pending" && (
            <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
              <div className="flex items-start gap-3">
                <Loader2 className="h-5 w-5 text-yellow-600 animate-spin mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Under Review</h4>
                  <p className="text-xs text-muted-foreground">
                    Your photo is being reviewed. This usually takes less than 24 hours.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rejected status message */}
          {verificationStatus === "rejected" && (
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Photo Rejected</h4>
                  <p className="text-xs text-muted-foreground">
                    Your photo didn't meet our guidelines. Please upload a new photo 
                    following the requirements and submit again.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick tips */}
          <div className="grid grid-cols-2 gap-2">
            {PHOTO_GUIDELINES.slice(0, 2).map((guideline, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-muted/50 flex items-center gap-2"
              >
                <guideline.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground">
                  {guideline.title}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};
