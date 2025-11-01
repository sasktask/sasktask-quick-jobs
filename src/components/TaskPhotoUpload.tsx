import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface TaskPhotoUploadProps {
  taskId: string;
  onUploadComplete?: () => void;
}

export const TaskPhotoUpload = ({ taskId, onUploadComplete }: TaskPhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    if (selectedFiles.length + files.length > 5) {
      toast({
        title: "Too many files",
        description: "You can upload maximum 5 photos per task",
        variant: "destructive",
      });
      return;
    }

    setFiles(prev => [...prev, ...selectedFiles]);
    
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload photos",
        variant: "destructive",
      });
      setUploading(false);
      return;
    }

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('task-photos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('task-photos')
          .getPublicUrl(fileName);

        const { error: dbError } = await supabase
          .from('task_photos')
          .insert({
            task_id: taskId,
            photo_url: publicUrl,
            caption: caption || null,
            uploaded_by: user.id
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "Success",
        description: "Photos uploaded successfully",
      });

      setFiles([]);
      setPreviews([]);
      setCaption("");
      onUploadComplete?.();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="photo-upload" className="block mb-2">
          Task Photos (Max 5)
        </Label>
        <div className="flex items-center gap-4">
          <Input
            id="photo-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('photo-upload')?.click()}
            disabled={files.length >= 5}
          >
            <Upload className="w-4 h-4 mr-2" />
            Select Photos
          </Button>
          {files.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {files.length} photo{files.length > 1 ? 's' : ''} selected
            </span>
          )}
        </div>
      </div>

      {previews.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-border"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div>
            <Label htmlFor="caption">Caption (Optional)</Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe what needs to be done..."
              maxLength={200}
            />
          </div>

          <Button
            onClick={uploadPhotos}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? "Uploading..." : "Upload Photos"}
          </Button>
        </>
      )}

      {files.length === 0 && (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Add photos to help taskers understand your task better
          </p>
        </div>
      )}
    </div>
  );
};