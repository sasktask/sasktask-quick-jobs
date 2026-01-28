import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  DollarSign,
  RefreshCw,
  MessageSquare,
  Loader2,
  Send
} from "lucide-react";
import { format } from "date-fns";
import { useHireRequestStatus } from "@/hooks/useHireRequestStatus";
import { useNavigate } from "react-router-dom";

export const HireRequestStatusTracker = () => {
  const { pendingRequests, isLoading, refresh } = useHireRequestStatus();
  const navigate = useNavigate();

  const getStatusBadge = (decision: string) => {
    switch (decision) {
      case 'accepted':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        );
      case 'declined':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Declined
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="animate-pulse">
            <Clock className="h-3 w-3 mr-1" />
            Awaiting Response
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (pendingRequests.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Send className="h-5 w-5 text-primary" />
            My Hire Requests
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {pendingRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  layout
                >
                  <Card className={`border ${
                    request.tasker_decision === 'accepted' 
                      ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20' 
                      : request.tasker_decision === 'declined'
                        ? 'border-red-200 bg-red-50/50 dark:bg-red-950/20'
                        : 'border-primary/20 bg-primary/5'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={request.task_doer.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.task_doer.full_name}`} 
                            />
                            <AvatarFallback>
                              {request.task_doer.full_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{request.task_doer.full_name}</p>
                            <p className="text-xs text-muted-foreground">{request.task.title}</p>
                          </div>
                        </div>
                        {getStatusBadge(request.tasker_decision)}
                      </div>

                      {/* Amount */}
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold">${request.hire_amount?.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground">
                          {request.tasker_decision === 'declined' ? '(Refunded)' : '(In Escrow)'}
                        </span>
                      </div>

                      {/* Decline Reason */}
                      {request.tasker_decision === 'declined' && request.decline_reason && (
                        <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-2 text-xs mb-2">
                          <span className="font-medium text-red-700 dark:text-red-400">Reason: </span>
                          <span className="text-red-600 dark:text-red-300">{request.decline_reason}</span>
                        </div>
                      )}

                      {/* Decision Time */}
                      {request.decided_at && (
                        <p className="text-xs text-muted-foreground">
                          Responded: {format(new Date(request.decided_at), 'MMM d, h:mm a')}
                        </p>
                      )}

                      {/* Actions */}
                      {request.tasker_decision === 'accepted' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 w-full"
                          onClick={() => navigate(`/chat/${request.id}`)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message Tasker
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
