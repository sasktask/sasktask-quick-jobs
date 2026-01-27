import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Copy, 
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  FileText,
  ExternalLink,
  Zap,
  ArrowDownToLine
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface TransactionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: {
    id: string;
    amount: number;
    payout_amount: number;
    platform_fee: number;
    status: string;
    escrow_status: string;
    created_at: string;
    released_at: string | null;
    payout_at: string | null;
    release_type?: string;
    task?: {
      title: string;
      category: string;
    } | null;
    payer?: {
      full_name: string;
    } | null;
  } | null;
}

export function TransactionDetailDialog({ 
  open, 
  onOpenChange, 
  transaction 
}: TransactionDetailDialogProps) {
  const { toast } = useToast();
  
  if (!transaction) return null;

  const isReleased = transaction.escrow_status === 'released';
  const StatusIcon = isReleased ? CheckCircle : Clock;
  const statusColor = isReleased ? 'text-green-600' : 'text-amber-600';

  const handleCopyId = () => {
    navigator.clipboard.writeText(transaction.id);
    toast({
      title: 'Copied!',
      description: 'Transaction ID copied to clipboard'
    });
  };

  const getReleaseTypeLabel = (type?: string) => {
    switch (type) {
      case 'instant': return 'Instant Cashout';
      case 'auto_72hr': return 'Auto Release (72h)';
      case 'mutual_confirmation': return 'Mutual Confirmation';
      default: return 'Manual Release';
    }
  };

  const getReleaseTypeIcon = (type?: string) => {
    switch (type) {
      case 'instant': return Zap;
      default: return ArrowDownToLine;
    }
  };

  const ReleaseIcon = getReleaseTypeIcon(transaction.release_type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transaction Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Banner */}
          <div className={`p-4 rounded-lg ${isReleased ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusIcon className={`h-5 w-5 ${statusColor}`} />
                <span className={`font-medium ${statusColor}`}>
                  {isReleased ? 'Payment Released' : 'In Escrow'}
                </span>
              </div>
              <Badge variant="outline">
                {transaction.release_type ? getReleaseTypeLabel(transaction.release_type) : 'Standard'}
              </Badge>
            </div>
          </div>

          {/* Amount */}
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-1">Amount Received</p>
            <p className="text-4xl font-bold text-green-600">
              ${transaction.payout_amount.toFixed(2)}
            </p>
          </div>

          <Separator />

          {/* Transaction Details */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Task</span>
              <span className="font-medium text-right max-w-[200px] truncate">
                {transaction.task?.title || 'Task'}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Category</span>
              <Badge variant="outline">{transaction.task?.category || 'General'}</Badge>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Client</span>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{transaction.payer?.full_name || 'Client'}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gross Amount</span>
              <span>${transaction.amount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee</span>
              <span className="text-amber-600">-${transaction.platform_fee.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm font-medium">
              <span>Net Earnings</span>
              <span className="text-green-600">${transaction.payout_amount.toFixed(2)}</span>
            </div>

            <Separator />

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Created</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(transaction.created_at), 'MMM d, yyyy h:mm a')}</span>
              </div>
            </div>

            {transaction.released_at && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Released</span>
                <div className="flex items-center gap-1">
                  <ReleaseIcon className="h-3 w-3" />
                  <span>{format(new Date(transaction.released_at), 'MMM d, yyyy h:mm a')}</span>
                </div>
              </div>
            )}

            {transaction.payout_at && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid Out</span>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>{format(new Date(transaction.payout_at), 'MMM d, yyyy h:mm a')}</span>
                </div>
              </div>
            )}

            <Separator />

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transaction ID</span>
              <button 
                onClick={handleCopyId}
                className="flex items-center gap-1 text-xs font-mono hover:text-primary transition-colors"
              >
                {transaction.id.slice(0, 8)}...
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 gap-2" onClick={handleCopyId}>
              <Copy className="h-4 w-4" />
              Copy ID
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
