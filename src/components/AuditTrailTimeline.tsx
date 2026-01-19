import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Shield, 
  Loader2, 
  ChevronDown,
  Play,
  Square,
  Pause,
  RotateCcw,
  DollarSign,
  MessageSquare,
  Camera,
  CheckSquare,
  AlertTriangle,
  FileText,
  User,
  Clock,
  MapPin,
  Hash,
  Link2
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface AuditTrailTimelineProps {
  bookingId?: string;
  taskId?: string;
  maxHeight?: string;
  showVerification?: boolean;
}

interface AuditEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_category: string;
  event_data: any;
  location_data: any;
  event_hash: string;
  previous_hash: string | null;
  created_at: string;
  user?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  task_start: <Play className="h-4 w-4" />,
  task_end: <Square className="h-4 w-4" />,
  task_pause: <Pause className="h-4 w-4" />,
  task_resume: <RotateCcw className="h-4 w-4" />,
  payment_initiated: <DollarSign className="h-4 w-4" />,
  payment_completed: <DollarSign className="h-4 w-4" />,
  payment_released: <DollarSign className="h-4 w-4" />,
  message_sent: <MessageSquare className="h-4 w-4" />,
  evidence_uploaded: <Camera className="h-4 w-4" />,
  checklist_item_completed: <CheckSquare className="h-4 w-4" />,
  checklist_item_approved: <CheckSquare className="h-4 w-4" />,
  checklist_item_rejected: <AlertTriangle className="h-4 w-4" />,
  dispute_opened: <AlertTriangle className="h-4 w-4" />,
  dispute_resolved: <FileText className="h-4 w-4" />,
  booking_created: <User className="h-4 w-4" />,
  booking_accepted: <User className="h-4 w-4" />,
  booking_rejected: <User className="h-4 w-4" />,
  booking_cancelled: <User className="h-4 w-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  task: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  booking: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  payment: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  checkin: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  checklist: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  evidence: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  dispute: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  communication: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  system: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

export const AuditTrailTimeline = ({
  bookingId,
  taskId,
  maxHeight = "400px",
  showVerification = true
}: AuditTrailTimelineProps) => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [chainValid, setChainValid] = useState<boolean | null>(null);

  useEffect(() => {
    fetchEvents();
    
    // Subscribe to realtime updates
    const filter = bookingId 
      ? `booking_id=eq.${bookingId}` 
      : `task_id=eq.${taskId}`;

    const channel = supabase
      .channel(`audit-${bookingId || taskId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_trail_events',
          filter
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, taskId]);

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from('audit_trail_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingId) {
        query = query.eq('booking_id', bookingId);
      } else if (taskId) {
        query = query.eq('task_id', taskId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch user profiles
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(e => e.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        const eventsWithUsers = data.map(event => ({
          ...event,
          user: profiles?.find(p => p.id === event.user_id)
        }));

        setEvents(eventsWithUsers);
        
        // Verify chain integrity
        if (showVerification) {
          verifyChain(eventsWithUsers);
        }
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching audit events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyChain = (eventList: AuditEvent[]) => {
    // Check if each event's previous_hash matches the previous event's hash
    const reversedEvents = [...eventList].reverse();
    let isValid = true;

    for (let i = 1; i < reversedEvents.length; i++) {
      if (reversedEvents[i].previous_hash !== reversedEvents[i - 1].event_hash) {
        isValid = false;
        break;
      }
    }

    setChainValid(isValid);
  };

  const toggleExpand = (eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const formatEventType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <Card className="glass-card overflow-hidden border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Loading audit trail...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card overflow-hidden border-border/50">
      <CardHeader className="bg-gradient-to-r from-primary/5 via-transparent to-secondary/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl">Audit Trail</span>
            </CardTitle>
            <CardDescription className="mt-1.5">
              Immutable record of all task-related actions
            </CardDescription>
          </div>
          {showVerification && chainValid !== null && (
            <Badge className={cn(
              "px-3 py-1.5 font-medium",
              chainValid 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' 
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
            )}>
              <Link2 className="h-3.5 w-3.5 mr-1.5" />
              {chainValid ? 'Chain Verified' : 'Chain Broken'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {events.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 opacity-50" />
            </div>
            <p className="text-sm font-medium">No audit events recorded yet</p>
            <p className="text-xs mt-1">Events will appear as actions are performed</p>
          </div>
        ) : (
          <ScrollArea style={{ maxHeight }} className="pr-4">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-border to-transparent" />

              <div className="space-y-4">
                {events.map((event, index) => (
                  <Collapsible key={event.id}>
                    <div className="relative flex items-start gap-4 pl-8">
                      {/* Timeline dot */}
                      <div className={cn(
                        "absolute left-0 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center",
                        CATEGORY_COLORS[event.event_category] || CATEGORY_COLORS.system
                      )}>
                        {EVENT_ICONS[event.event_type] || <Clock className="h-3 w-3" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <CollapsibleTrigger asChild>
                          <button
                            className="w-full text-left hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
                            onClick={() => toggleExpand(event.id)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium">{formatEventType(event.event_type)}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {event.event_category}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {event.user?.full_name || 'System'} • {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                                </p>
                              </div>
                              <ChevronDown className={cn(
                                "h-4 w-4 text-muted-foreground transition-transform",
                                expandedEvents.has(event.id) && "rotate-180"
                              )} />
                            </div>
                          </button>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="mt-2 p-3 bg-muted/30 rounded-lg space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{format(new Date(event.created_at), 'PPpp')}</span>
                            </div>

                            {event.location_data && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>
                                  {event.location_data.lat?.toFixed(6)}, {event.location_data.lng?.toFixed(6)}
                                </span>
                              </div>
                            )}

                            {event.event_data && Object.keys(event.event_data).length > 0 && (
                              <div className="pt-2 border-t">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Event Details:</p>
                                <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
                                  {JSON.stringify(event.event_data, null, 2)}
                                </pre>
                              </div>
                            )}

                            {showVerification && (
                              <div className="pt-2 border-t">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Hash className="h-3 w-3" />
                                  <span className="font-mono truncate">{event.event_hash?.substring(0, 16)}...</span>
                                </div>
                                {event.previous_hash && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    <Link2 className="h-3 w-3" />
                                    <span className="font-mono truncate">← {event.previous_hash?.substring(0, 16)}...</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </div>
                  </Collapsible>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
