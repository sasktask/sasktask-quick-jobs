import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReplyPreviewProps {
  senderName: string;
  message: string;
  onCancel: () => void;
  isOwn: boolean;
}

export const ReplyPreview = ({ senderName, message, onCancel, isOwn }: ReplyPreviewProps) => {
  return (
    <div className="flex items-start gap-2 p-3 bg-muted/50 border-l-4 border-primary rounded-lg mb-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-primary">
            {isOwn ? "You" : senderName}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 break-words">
          {message}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 flex-shrink-0"
        onClick={onCancel}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
