import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle,
  AlertCircle,
  Timer,
  DollarSign,
  CalendarClock,
  Hourglass
} from 'lucide-react';
import { format, formatDistanceToNow, differenceInHours, addHours } from 'date-fns';

interface PendingPayment {
  id: string;
  amount: number;
  taskTitle: string;
  status: 'held' | 'pending_confirmation' | 'disputed';
  createdAt: string;
  autoReleaseAt: string | null;
  taskGiverConfirmed: boolean;
  taskDoerConfirmed: boolean;
}

interface PendingPaymentsTimelineProps {
  pendingPayments: PendingPayment[];
}

export function PendingPaymentsTimeline({ pendingPayments }: PendingPaymentsTimelineProps) {
  if (pendingPayments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="font-semibold text-lg mb-2">All Caught Up!</h3>
          <p className="text-muted-foreground text-sm">
            No pending payments at the moment
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'held': return 'text-blue-600 bg-blue-500/10';
      case 'pending_confirmation': return 'text-amber-600 bg-amber-500/10';
      case 'disputed': return 'text-red-600 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'held': return 'In Escrow';
      case 'pending_confirmation': return 'Awaiting Confirmation';
      case 'disputed': return 'Under Review';
      default: return 'Processing';
    }
  };

  const calculateProgress = (createdAt: string, autoReleaseAt: string | null) => {
    if (!autoReleaseAt) return 0;
    const created = new Date(createdAt);
    const release = new Date(autoReleaseAt);
    const now = new Date();
    const totalDuration = release.getTime() - created.getTime();
    const elapsed = now.getTime() - created.getTime();
    return Math.min((elapsed / totalDuration) * 100, 100);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Hourglass className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Pending Payments</CardTitle>
              <CardDescription>
                {pendingPayments.length} payment{pendingPayments.length > 1 ? 's' : ''} in progress
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">${totalPending.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Total pending</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {pendingPayments.map((payment, index) => {
          const progress = calculateProgress(payment.createdAt, payment.autoReleaseAt);
          const hoursRemaining = payment.autoReleaseAt 
            ? Math.max(0, differenceInHours(new Date(payment.autoReleaseAt), new Date()))
            : null;

          return (
            <div 
              key={payment.id}
              className="border rounded-lg p-4 space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{payment.taskTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    Started {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <Badge className={getStatusColor(payment.status)}>
                  {getStatusLabel(payment.status)}
                </Badge>
              </div>

              {/* Amount & Timeline */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-xl font-bold">${payment.amount.toFixed(2)}</span>
                </div>
                {payment.autoReleaseAt && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Timer className="h-4 w-4" />
                    <span>
                      {hoursRemaining !== null && hoursRemaining > 0
                        ? `${hoursRemaining}h remaining`
                        : 'Releasing soon'
                      }
                    </span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {payment.autoReleaseAt && (
                <div className="space-y-1">
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Task Completed</span>
                    <span>
                      Auto-release {format(new Date(payment.autoReleaseAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
              )}

              {/* Confirmation Status */}
              <div className="flex gap-2">
                <div className={`flex-1 p-2 rounded text-xs text-center ${
                  payment.taskGiverConfirmed 
                    ? 'bg-green-500/10 text-green-600' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {payment.taskGiverConfirmed ? (
                    <span className="flex items-center justify-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Client Confirmed
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3" /> Awaiting Client
                    </span>
                  )}
                </div>
                <div className={`flex-1 p-2 rounded text-xs text-center ${
                  payment.taskDoerConfirmed 
                    ? 'bg-green-500/10 text-green-600' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {payment.taskDoerConfirmed ? (
                    <span className="flex items-center justify-center gap-1">
                      <CheckCircle className="h-3 w-3" /> You Confirmed
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3" /> Your Confirmation
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Tip */}
              {!payment.taskGiverConfirmed && !payment.taskDoerConfirmed && (
                <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Both parties confirming releases payment instantly
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
