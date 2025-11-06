import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  messageCount?: number;
}

export const DeleteMessageDialog = ({
  open,
  onOpenChange,
  onConfirm,
  messageCount = 1,
}: DeleteMessageDialogProps) => {
  const isBulk = messageCount > 1;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isBulk
              ? `Delete ${messageCount} messages?`
              : "Delete message?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isBulk
              ? `This will permanently delete ${messageCount} selected messages. This action cannot be undone.`
              : "This will permanently delete this message. This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
