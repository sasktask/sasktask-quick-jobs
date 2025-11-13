import { Trash2, MoreVertical, Forward, Reply, Edit2, History, Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MessageActionsProps {
  onDelete: () => void;
  onForward: () => void;
  onReply: () => void;
  onEdit: () => void;
  onViewHistory?: () => void;
  onPin?: () => void;
  onUnpin?: () => void;
  isOwn: boolean;
  isEdited?: boolean;
  isPinned?: boolean;
}

export const MessageActions = ({ 
  onDelete, 
  onForward, 
  onReply, 
  onEdit, 
  onViewHistory,
  onPin,
  onUnpin,
  isOwn,
  isEdited,
  isPinned 
}: MessageActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onReply}>
          <Reply className="mr-2 h-4 w-4" />
          Reply
        </DropdownMenuItem>
        
        {isPinned ? (
          <DropdownMenuItem onClick={onUnpin}>
            <PinOff className="mr-2 h-4 w-4" />
            Unpin message
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={onPin}>
            <Pin className="mr-2 h-4 w-4" />
            Pin message
          </DropdownMenuItem>
        )}
        
        {isOwn && (
          <>
            <DropdownMenuItem onClick={onEdit}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit message
            </DropdownMenuItem>
            {isEdited && onViewHistory && (
              <DropdownMenuItem onClick={onViewHistory}>
                <History className="mr-2 h-4 w-4" />
                View edit history
              </DropdownMenuItem>
            )}
          </>
        )}
        
        <DropdownMenuItem onClick={onForward}>
          <Forward className="mr-2 h-4 w-4" />
          Forward message
        </DropdownMenuItem>
        
        {isOwn && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete message
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
