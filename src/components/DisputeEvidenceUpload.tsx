import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Image, FileText, FileVideo, Loader2, Plus } from "lucide-react";
import { compressImage } from "@/lib/imageCompression";

interface DisputeEvidenceUploadProps {
  disputeId: string;
  onUploadComplete?: () => void;
}

interface EvidenceFile {
  file: File;
  preview: string;
  description: string;
  type: string;
}

export const DisputeEvidenceUpload = ({
  disputeId,
  onUploadComplete
}: DisputeEvidenceUploadProps) => {
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'photo';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.includes('pdf')) return 'document';
    return 'document';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > 20) {
      toast.error("Maximum 20 files allowed for dispute evidence");
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
        description: '',
        type: getFileType(file.type)
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

  const updateDescription = (index: number, description: string) => {
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles[index] = { ...newFiles[index], description };
      return newFiles;
    });
  };

  const updateType = (index: number, type: string) => {
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles[index] = { ...newFiles[index], type };
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

      const uploadPromises = files.map(async ({ file, description, type }) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${disputeId}/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('dispute-evidence')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('dispute-evidence')
          .getPublicUrl(fileName);

        // Insert evidence record
        const { error: insertError } = await supabase
          .from('dispute_evidence')
          .insert({
            dispute_id: disputeId,
            uploaded_by: user.id,
            evidence_type: type,
            file_url: urlData.publicUrl,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            description: description || null
          });

        if (insertError) throw insertError;
      });

      await Promise.all(uploadPromises);

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

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'photo': return <Image className="h-4 w-4" />;
      case 'video': return <FileVideo className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Upload Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-20 border-dashed border-2 flex flex-col gap-2"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-5 w-5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Upload photos, videos, screenshots, or documents
        </span>
      </Button>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <Label>Evidence Files ({files.length})</Label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((item, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border"
              >
                {/* Preview */}
                <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
                  {item.preview ? (
                    <img 
                      src={item.preview} 
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getFileIcon(item.type)}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Select value={item.type} onValueChange={(v) => updateType(index, v)}>
                      <SelectTrigger className="h-8 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photo">📷 Photo</SelectItem>
                        <SelectItem value="video">🎥 Video</SelectItem>
                        <SelectItem value="screenshot">📱 Screenshot</SelectItem>
                        <SelectItem value="document">📄 Document</SelectItem>
                        <SelectItem value="chat_export">💬 Chat Export</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground truncate flex-1">
                      {item.file.name}
                    </span>
                  </div>
                  <Textarea
                    placeholder="Describe this evidence..."
                    className="text-xs h-16 resize-none"
                    value={item.description}
                    onChange={(e) => updateDescription(index, e.target.value)}
                  />
                </div>

                {/* Remove Button */}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add More Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="h-4 w-4" />
            Add More Files
          </Button>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading Evidence...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload {files.length} File{files.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      )}
    </div>
  );
};
