import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, FileIcon, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
  onSend: () => void;
}

export const FilePreview = ({ file, onRemove, onSend }: FilePreviewProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const isImage = file.type.startsWith("image/");

  // Generate preview for images
  if (isImage && !preview) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="p-3 bg-muted/50 border-t border-border">
      <div className="flex items-center gap-3">
        <div className="relative group">
          {isImage && preview ? (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
              <img
                src={preview}
                alt={file.name}
                className="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onRemove}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="relative w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
              <FileIcon className="h-8 w-8 text-muted-foreground" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onRemove}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          {isImage && (
            <div className="flex items-center gap-1 mt-1">
              <ImageIcon className="h-3 w-3 text-primary" />
              <span className="text-xs text-primary">Image ready to send</span>
            </div>
          )}
        </div>

        <Button onClick={onSend} size="sm">
          Send
        </Button>
      </div>
    </div>
  );
};