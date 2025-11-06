import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface EditHistory {
  id: string;
  previous_content: string;
  edited_at: string;
}

interface EditHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageId: string;
  currentContent: string;
}

export const EditHistoryDialog = ({
  open,
  onOpenChange,
  messageId,
  currentContent,
}: EditHistoryDialogProps) => {
  const [history, setHistory] = useState<EditHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && messageId) {
      loadHistory();
    }
  }, [open, messageId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("message_edit_history")
        .select("*")
        .eq("message_id", messageId)
        .order("edited_at", { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Error loading edit history:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit History</DialogTitle>
          <DialogDescription>
            View all previous versions of this message
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {/* Current version */}
              <div className="border-l-4 border-primary pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-primary">
                    Current Version
                  </span>
                  <span className="text-xs text-muted-foreground">Now</span>
                </div>
                <p className="text-sm break-words whitespace-pre-wrap">
                  {currentContent}
                </p>
              </div>

              {/* Previous versions */}
              {history.length > 0 ? (
                history.map((entry, index) => (
                  <div key={entry.id} className="border-l-4 border-muted pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Version {history.length - index}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(entry.edited_at), "MMM d, yyyy HH:mm")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground break-words whitespace-pre-wrap">
                      {entry.previous_content}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No edit history available
                </p>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
