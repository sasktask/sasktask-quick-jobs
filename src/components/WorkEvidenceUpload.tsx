import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Upload, X, Image, FileVideo, CheckCircle, Loader2 } from "lucide-react";
import { compressImage } from "@/lib/imageCompression";

interface WorkEvidenceUploadProps {
  bookingId: string;
  taskId: string;
  onUploadComplete?: () => void;
  evidenceType?: 'before' | 'during' | 'completion' | 'after';
  title?: string;
  description?: string;
  required?: boolean;
}

interface EvidenceFile {
  file: File;
  preview: string;
  caption: string;
}

export const WorkEvidenceUpload = ({
  bookingId,
  taskId,
  onUploadComplete,
  evidenceType = 'completion',
  title = "Upload Work Evidence",
  description = "Upload photos or videos as proof of completed work",
  required = false
}: WorkEvidenceUploadProps) => {
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedType, setSelectedType] = useState(evidenceType);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > 10) {
      toast.error("Maximum 10 files allowed");
      return;
    }

    const validFiles: EvidenceFile[] = [];
    
    for (const file of selectedFiles) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 50MB per file.`);
        continue;
      }

      let processedFile = file;
      
      // Compress images
      if (file.type.startsWith('image/')) {
        try {
          processedFile = await compressImage(file, { maxSizeMB: 5 });
        } catch (err) {
          console.error("Compression error:", err);
        }
      }

      const preview = file.type.startsWith('image/') 
        ? URL.createObjectURL(processedFile) 
        : '';
      
      validFiles.push({
        file: processedFile,
        preview,
        caption: ''
      });
    }

    setFiles(prev => [...prev, ...validFiles]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const uploadPromises = files.map(async ({ file, caption }) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${bookingId}/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('work-evidence')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('work-evidence')
          .getPublicUrl(fileName);

        // Insert evidence record
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
            caption: caption || null
          });

        if (insertError) throw insertError;
      });

      await Promise.all(uploadPromises);

      // Update booking evidence count
      await supabase
        .from('bookings')
        .update({ 
          completion_evidence_uploaded: true,
          evidence_count: files.length
        })
        .eq('id', bookingId);

      toast.success(`${files.length} evidence file(s) uploaded successfully`);
      setFiles([]);
      onUploadComplete?.();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload evidence");
    } finally {
      setIsUploading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'before': return 'Before Starting';
      case 'during': return 'Work in Progress';
      case 'completion': return 'Completed Work';
      case 'after': return 'After Cleanup';
      default: return type;
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Camera className="h-5 w-5 text-primary" />
          {title}
          {required && <span className="text-destructive">*</span>}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Evidence Type Selector */}
        <div className="space-y-2">
          <Label>Evidence Type</Label>
          <Select value={selectedType} onValueChange={(v: any) => setSelectedType(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="before">📷 Before Starting</SelectItem>
              <SelectItem value="during">🔧 Work in Progress</SelectItem>
              <SelectItem value="completion">✅ Completed Work</SelectItem>
              <SelectItem value="after">🧹 After Cleanup</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Upload Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-24 border-dashed border-2 flex flex-col gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Click to upload photos or videos (max 10 files, 50MB each)
          </span>
        </Button>

        {/* File Previews */}
        {files.length > 0 && (
          <div className="space-y-3">
            <Label>Selected Files ({files.length})</Label>
            <div className="grid grid-cols-2 gap-3">
              {files.map((item, index) => (
                <div 
                  key={index} 
                  className="relative bg-muted rounded-lg overflow-hidden border border-border"
                >
                  {item.preview ? (
                    <img 
                      src={item.preview} 
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-muted">
                      <FileVideo className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Remove Button */}
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  {/* Caption Input */}
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Add caption..."
                      className="w-full text-xs p-1 bg-background border rounded"
                      value={item.caption}
                      onChange={(e) => updateCaption(index, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tips for good evidence:</strong>
          </p>
          <ul className="text-xs text-muted-foreground mt-1 space-y-1 list-disc list-inside">
            <li>Take clear, well-lit photos</li>
            <li>Include before/after shots when possible</li>
            <li>Show the work area and completed result</li>
            <li>Add captions to explain each photo</li>
          </ul>
        </div>

        {/* Upload Button */}
        {files.length > 0 && (
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full gap-2"
            size="lg"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Upload {files.length} Evidence File{files.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
