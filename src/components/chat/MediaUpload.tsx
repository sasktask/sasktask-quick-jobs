import { useRef } from "react";
import { Image, Paperclip, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MediaUploadProps {
  onFileSelect: (file: File, type: 'image' | 'file') => void;
  onVoiceRecord: () => void;
}

export const MediaUpload = ({ onFileSelect, onVoiceRecord }: MediaUploadProps) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be less than 10MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      onFileSelect(file, 'image');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File must be less than 10MB");
        return;
      }
      onFileSelect(file, 'file');
    }
  };

  return (
    <div className="flex items-center gap-1">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
        className="hidden"
        onChange={handleFileChange}
      />
      
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={handleImageClick}
        title="Send image"
      >
        <Image className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={handleFileClick}
        title="Send file"
      >
        <Paperclip className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={onVoiceRecord}
        title="Record voice note"
      >
        <Mic className="h-4 w-4" />
      </Button>
    </div>
  );
};
