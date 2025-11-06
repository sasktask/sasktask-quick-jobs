import { useState, useEffect } from "react";
import { Download, FileText, Image as ImageIcon, Music, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Attachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  attachment_type: string;
  duration?: number;
}

interface MediaMessageProps {
  attachments: Attachment[];
}

export const MediaMessage = ({ attachments }: MediaMessageProps) => {
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    loadMediaUrls();
  }, [attachments]);

  const loadMediaUrls = async () => {
    const urls: Record<string, string> = {};
    
    for (const attachment of attachments) {
      try {
        const { data } = await supabase.storage
          .from('message-attachments')
          .createSignedUrl(attachment.storage_path, 3600); // 1 hour expiry

        if (data?.signedUrl) {
          urls[attachment.id] = data.signedUrl;
        }
      } catch (error) {
        console.error("Error loading media:", error);
      }
    }
    
    setMediaUrls(urls);
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const url = mediaUrls[attachment.id];
      if (!url) return;

      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = attachment.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success("Download started");
    } catch (error) {
      console.error("Error downloading:", error);
      toast.error("Failed to download file");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => {
        const url = mediaUrls[attachment.id];

        // Image attachment
        if (attachment.attachment_type === 'image' && url) {
          return (
            <div key={attachment.id} className="relative group">
              <img
                src={url}
                alt={attachment.file_name}
                className="max-w-sm rounded-lg cursor-pointer hover:opacity-90 transition"
                onClick={() => window.open(url, '_blank')}
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                onClick={() => handleDownload(attachment)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          );
        }

        // Voice note attachment
        if (attachment.attachment_type === 'voice' && url) {
          return (
            <div key={attachment.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg max-w-sm">
              <Music className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <audio
                  src={url}
                  controls
                  className="w-full"
                  onPlay={() => setPlayingAudio(attachment.id)}
                  onPause={() => setPlayingAudio(null)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDuration(attachment.duration)}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDownload(attachment)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          );
        }

        // File attachment
        if (attachment.attachment_type === 'file') {
          return (
            <div key={attachment.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg max-w-sm">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{attachment.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.file_size)}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDownload(attachment)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
