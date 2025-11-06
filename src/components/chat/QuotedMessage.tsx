import { cn } from "@/lib/utils";

interface QuotedMessageProps {
  senderName: string;
  message: string;
  isOwn: boolean;
  isOwnReply: boolean;
}

export const QuotedMessage = ({ senderName, message, isOwn, isOwnReply }: QuotedMessageProps) => {
  return (
    <div
      className={cn(
        "border-l-2 pl-2 py-1 mb-2 text-xs",
        isOwnReply
          ? "border-primary-foreground/30"
          : "border-primary/50"
      )}
    >
      <div className={cn(
        "font-semibold mb-0.5",
        isOwnReply ? "text-primary-foreground/90" : "text-primary"
      )}>
        {isOwn ? "You" : senderName}
      </div>
      <div className={cn(
        "line-clamp-2 break-words",
        isOwnReply ? "text-primary-foreground/70" : "text-muted-foreground"
      )}>
        {message}
      </div>
    </div>
  );
};
