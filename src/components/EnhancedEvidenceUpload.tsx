import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Camera, 
  Upload, 
  X, 
  FileVideo, 
  CheckCircle, 
  Loader2,
  MapPin,
  Clock,
  Image as ImageIcon,
  Sparkles,
  Eye,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  RotateCw,
  Play
} from "lucide-react";
import { compressImage } from "@/lib/imageCompression";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface EnhancedEvidenceUploadProps {
  bookingId: string;
  taskId: string;
  onUploadComplete?: () => void;
  evidenceType?: 'before' | 'during' | 'completion' | 'after';
  title?: string;
  description?: string;
  required?: boolean;
  taskLocation?: { latitude: number; longitude: number } | null;
}

interface EvidenceFile {
  file: File;
  preview: string;
  caption: string;
  type: 'image' | 'video';
  timestamp: Date;
  gpsLocation?: { lat: number; lng: number };
}

export const EnhancedEvidenceUpload = ({
  bookingId,
  taskId,
  onUploadComplete,
  evidenceType = 'completion',
  title = "Upload Work Evidence",
  description = "Capture photos or videos as proof of completed work",
  required = false,
  taskLocation
}: EnhancedEvidenceUploadProps) => {
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedType, setSelectedType] = useState(evidenceType);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Get current location for GPS stamping
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => console.log("Location unavailable:", err)
      );
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, isCamera = false) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > 10) {
      toast.error("Maximum 10 files allowed");
      return;
    }

    const validFiles: EvidenceFile[] = [];
    
    for (const file of selectedFiles) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 100MB per file.`);
        continue;
      }

      let processedFile = file;
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      // Compress images
      if (isImage) {
        try {
          processedFile = await compressImage(file, { maxSizeMB: 5 });
        } catch (err) {
          console.error("Compression error:", err);
        }
      }

      const preview = isImage 
        ? URL.createObjectURL(processedFile) 
        : isVideo 
          ? URL.createObjectURL(processedFile)
          : '';
      
      validFiles.push({
        file: processedFile,
        preview,
        caption: '',
        type: isVideo ? 'video' : 'image',
        timestamp: new Date(),
        gpsLocation: currentLocation || undefined
      });
    }

    setFiles(prev => [...prev, ...validFiles]);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const updateCaption = (index: number, caption: string) => {
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles[index] = { ...newFiles[index], caption };
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let completed = 0;
      const total = files.length;

      const uploadPromises = files.map(async ({ file, caption, type, timestamp, gpsLocation }) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${bookingId}/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('work-evidence')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('work-evidence')
          .getPublicUrl(fileName);

        const { error: insertError } = await supabase
          .from('work_evidence')
          .insert({
            booking_id: bookingId,
            task_id: taskId,
            uploaded_by: user.id,
            evidence_type: selectedType,
            file_url: urlData.publicUrl,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            caption: caption || null,
            metadata: {
              timestamp: timestamp.toISOString(),
              gps_location: gpsLocation,
              media_type: type
            }
          });

        if (insertError) throw insertError;

        completed++;
        setUploadProgress(Math.round((completed / total) * 100));
      });

      await Promise.all(uploadPromises);

      await supabase
        .from('bookings')
        .update({ 
          completion_evidence_uploaded: true,
          evidence_count: files.length
        })
        .eq('id', bookingId);

      toast.success(`${files.length} evidence file(s) uploaded successfully`, {
        description: "Your work evidence has been recorded with timestamps and location data"
      });
      
      setFiles([]);
      onUploadComplete?.();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload evidence");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'before': return { label: 'Before Starting', icon: '📷', color: 'bg-blue-500' };
      case 'during': return { label: 'Work in Progress', icon: '🔧', color: 'bg-amber-500' };
      case 'completion': return { label: 'Completed Work', icon: '✅', color: 'bg-green-500' };
      case 'after': return { label: 'After Cleanup', icon: '🧹', color: 'bg-purple-500' };
      default: return { label: type, icon: '📎', color: 'bg-gray-500' };
    }
  };

  return (
    <Card className="border-2 border-primary/20 overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Camera className="h-5 w-5 text-primary" />
          {title}
          {required && <Badge variant="destructive" className="text-xs">Required</Badge>}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        {/* Evidence Type Selector */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Evidence Type
            <Badge variant="outline" className="text-xs">{files.length}/10</Badge>
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['before', 'during', 'completion', 'after'].map((type) => {
              const config = getTypeConfig(type);
              return (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedType(type as any)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    selectedType === type 
                      ? 'border-primary bg-primary/10 shadow-md' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-xl">{config.icon}</span>
                  <p className="text-xs font-medium mt-1">{config.label}</p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e)}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFileSelect(e, true)}
        />

        {/* Upload Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-24 border-dashed border-2 flex flex-col gap-2 hover:border-primary hover:bg-primary/5"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Upload Files</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-24 border-dashed border-2 flex flex-col gap-2 hover:border-primary hover:bg-primary/5"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Take Photo</span>
          </Button>
        </div>

        {/* Location & Time Stamp Info */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {currentLocation ? 'GPS Enabled' : 'GPS Unavailable'}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Auto-timestamped
          </div>
        </div>

        {/* File Previews */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <Label className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Selected Files ({files.length})
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <AnimatePresence mode="popLayout">
                {files.map((item, index) => (
                  <motion.div
                    key={index}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group bg-muted rounded-xl overflow-hidden border-2 border-border hover:border-primary/50"
                  >
                    {item.type === 'image' ? (
                      <img 
                        src={item.preview} 
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-32 object-cover cursor-pointer"
                        onClick={() => setPreviewIndex(index)}
                      />
                    ) : (
                      <div 
                        className="w-full h-32 flex items-center justify-center bg-black/80 cursor-pointer relative"
                        onClick={() => setPreviewIndex(index)}
                      >
                        <video src={item.preview} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                        <Play className="h-10 w-10 text-white z-10" />
                      </div>
                    )}
                    
                    {/* Timestamp overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-[10px] text-white/80 font-mono">
                        {format(item.timestamp, "MMM d, HH:mm:ss")}
                      </p>
                      {item.gpsLocation && (
                        <p className="text-[9px] text-white/60 flex items-center gap-0.5">
                          <MapPin className="h-2.5 w-2.5" />
                          GPS stamped
                        </p>
                      )}
                    </div>
                    
                    {/* Remove Button */}
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    {/* Caption Input */}
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Add caption..."
                        className="w-full text-xs p-1.5 bg-background border rounded-md"
                        value={item.caption}
                        onChange={(e) => updateCaption(index, e.target.value)}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Lightbox Preview */}
        <AnimatePresence>
          {previewIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
              onClick={() => setPreviewIndex(null)}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white"
                onClick={() => setPreviewIndex(null)}
              >
                <X className="h-6 w-6" />
              </Button>
              
              {files[previewIndex].type === 'image' ? (
                <img 
                  src={files[previewIndex].preview} 
                  alt="Preview"
                  className="max-w-[90vw] max-h-[90vh] object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <video 
                  src={files[previewIndex].preview} 
                  controls
                  className="max-w-[90vw] max-h-[90vh]"
                  onClick={(e) => e.stopPropagation()}
                />
              )}

              {files.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewIndex(prev => prev !== null ? (prev - 1 + files.length) % files.length : 0);
                    }}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewIndex(prev => prev !== null ? (prev + 1) % files.length : 0);
                    }}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips */}
        <div className="p-4 bg-gradient-to-r from-accent/20 to-accent/10 rounded-xl border border-accent/30">
          <p className="text-sm font-medium flex items-center gap-2 mb-2">
            💡 Tips for Strong Evidence
          </p>
          <ul className="text-xs text-muted-foreground space-y-1.5 grid sm:grid-cols-2 gap-1">
            <li className="flex items-start gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
              Take clear, well-lit photos
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
              Include before/after comparisons
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
              Show work area and results
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
              Add captions for context
            </li>
          </ul>
        </div>

        {/* Upload Button with Progress */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full gap-2 h-12 text-base"
              size="lg"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Uploading Evidence...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Upload {files.length} Evidence File{files.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};