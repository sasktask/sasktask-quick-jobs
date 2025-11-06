import { Trash2, MoreVertical, Forward } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MessageActionsProps {
  onDelete: () => void;
  onForward: () => void;
  isOwn: boolean;
}

export const MessageActions = ({ onDelete, onForward, isOwn }: MessageActionsProps) => {
  if (!isOwn) return null;

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
        <DropdownMenuItem onClick={onForward}>
          <Forward className="mr-2 h-4 w-4" />
          Forward message
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete message
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
