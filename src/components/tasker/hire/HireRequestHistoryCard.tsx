import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Calendar, 
  MapPin,
  MessageSquare,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface HireRequest {
  id: string;
  task_id: string;
  hire_amount: number;
  message: string;
  created_at: string;
  tasker_decision: string;
  decline_reason: string | null;
  decided_at: string | null;
  task: {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    scheduled_date: string;
    priority: string;
    task_giver: {
      id: string;
      full_name: string;
      avatar_url: string;
      rating: number;
      total_reviews: number;
    };
  };
}

interface HireRequestHistoryCardProps {
  request: HireRequest;
  status: 'accepted' | 'declined';
}

export const HireRequestHistoryCard = ({ request, status }: HireRequestHistoryCardProps) => {
  const navigate = useNavigate();
  const isAccepted = status === 'accepted';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`border ${isAccepted ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20' : 'border-red-200 bg-red-50/50 dark:bg-red-950/20'}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Status Icon */}
            <div className={`rounded-full p-2 ${isAccepted ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
              {isAccepted ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium truncate">{request.task.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={request.task.task_giver.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {request.task.task_giver.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{request.task.task_giver.full_name}</span>
                  </div>
                </div>
                <Badge variant={isAccepted ? "default" : "secondary"} className={isAccepted ? "bg-green-600" : "bg-red-600 text-white"}>
                  {isAccepted ? 'Accepted' : 'Declined'}
                </Badge>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>${request.hire_amount?.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {request.task.scheduled_date 
                      ? format(new Date(request.task.scheduled_date), 'MMM d')
                      : 'Flexible'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{request.task.location || 'TBD'}</span>
                </div>
                <div className="text-xs">
                  {request.decided_at && format(new Date(request.decided_at), 'MMM d, h:mm a')}
                </div>
              </div>

              {/* Decline Reason */}
              {!isAccepted && request.decline_reason && (
                <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-2 text-xs">
                  <span className="font-medium text-red-700 dark:text-red-400">Reason: </span>
                  <span className="text-red-600 dark:text-red-300">{request.decline_reason}</span>
                </div>
              )}

              {/* Actions for Accepted */}
              {isAccepted && (
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/chat/${request.id}`)}
                    className="text-xs"
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Message
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/task/${request.task_id}`)}
                    className="text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Task
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
