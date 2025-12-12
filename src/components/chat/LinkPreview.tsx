import { useState, useEffect } from "react";
import { ExternalLink, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkPreviewProps {
  url: string;
  className?: string;
}

interface PreviewData {
  title: string;
  description: string;
  image?: string;
  domain: string;
}

// Extract URLs from text
export const extractUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

// Check if text contains URLs
export const hasUrls = (text: string): boolean => {
  return extractUrls(text).length > 0;
};

export const LinkPreview = ({ url, className }: LinkPreviewProps) => {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        setError(false);

        // Parse the URL to get domain
        const urlObj = new URL(url);
        const domain = urlObj.hostname.replace("www.", "");

        // For now, we'll create a simple preview based on the URL
        // In production, you'd want to use an API service or edge function
        // to fetch actual Open Graph metadata
        
        const preview: PreviewData = {
          title: domain,
          description: url,
          domain: domain,
        };

        // Common site previews
        if (domain.includes("youtube.com") || domain.includes("youtu.be")) {
          preview.title = "YouTube Video";
          preview.description = "Watch on YouTube";
          preview.image = `https://img.youtube.com/vi/${extractYouTubeId(url)}/hqdefault.jpg`;
        } else if (domain.includes("github.com")) {
          preview.title = "GitHub Repository";
          preview.description = url.split("github.com/")[1] || "View on GitHub";
        } else if (domain.includes("twitter.com") || domain.includes("x.com")) {
          preview.title = "Twitter / X Post";
          preview.description = "View on Twitter";
        } else if (domain.includes("linkedin.com")) {
          preview.title = "LinkedIn";
          preview.description = "View on LinkedIn";
        } else if (domain.includes("instagram.com")) {
          preview.title = "Instagram Post";
          preview.description = "View on Instagram";
        } else if (domain.includes("maps.google") || domain.includes("goo.gl/maps")) {
          preview.title = "Google Maps Location";
          preview.description = "View on Google Maps";
        }

        setPreview(preview);
      } catch (err) {
        console.error("Error parsing URL:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  const extractYouTubeId = (url: string): string => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : "";
  };

  if (loading) {
    return (
      <div className={cn("animate-pulse bg-muted rounded-lg h-16 mt-2", className)} />
    );
  }

  if (error || !preview) {
    return null;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block mt-2 rounded-lg border bg-card overflow-hidden hover:bg-muted/50 transition-colors",
        className
      )}
    >
      <div className="flex">
        {preview.image && (
          <div className="w-24 h-20 flex-shrink-0">
            <img
              src={preview.image}
              alt={preview.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Globe className="h-3 w-3" />
            <span className="truncate">{preview.domain}</span>
            <ExternalLink className="h-3 w-3 ml-auto flex-shrink-0" />
          </div>
          <p className="font-medium text-sm truncate">{preview.title}</p>
          <p className="text-xs text-muted-foreground truncate">{preview.description}</p>
        </div>
      </div>
    </a>
  );
};