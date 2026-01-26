import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Inbox, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Loader2,
  BellRing
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuthContext";
import { IncomingHireRequestCard } from "./IncomingHireRequestCard";
import { HireRequestHistoryCard } from "./HireRequestHistoryCard";

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

export const HireRequestsPanel = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<HireRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  const fetchRequests = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          task_id,
          hire_amount,
          message,
          created_at,
          tasker_decision,
          decline_reason,
          decided_at,
          tasks!inner (
            id,
            title,
            description,
            category,
            location,
            scheduled_date,
            priority,
            task_giver_id
          )
        `)
        .eq('task_doer_id', user.id)
        .not('hire_amount', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch task giver profiles
      const enrichedRequests = await Promise.all(
        (data || []).map(async (booking: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, rating, total_reviews')
            .eq('id', booking.tasks.task_giver_id)
            .single();

          return {
            ...booking,
            task: {
              ...booking.tasks,
              task_giver: profile || {}
            }
          };
        })
      );

      setRequests(enrichedRequests);
    } catch (error) {
      console.error("Error fetching hire requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('hire-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `task_doer_id=eq.${user?.id}`
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const pendingRequests = requests.filter(r => r.tasker_decision === 'pending');
  const acceptedRequests = requests.filter(r => r.tasker_decision === 'accepted');
  const declinedRequests = requests.filter(r => r.tasker_decision === 'declined');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" />
            Hire Requests
          </CardTitle>
          {pendingRequests.length > 0 && (
            <Badge className="bg-primary animate-pulse">
              {pendingRequests.length} New
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending
              {pendingRequests.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="accepted" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Accepted
            </TabsTrigger>
            <TabsTrigger value="declined" className="gap-2">
              <XCircle className="h-4 w-4" />
              Declined
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] pr-4">
            <TabsContent value="pending" className="space-y-4 mt-0">
              <AnimatePresence mode="popLayout">
                {pendingRequests.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <Inbox className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No pending hire requests</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      New requests will appear here
                    </p>
                  </motion.div>
                ) : (
                  pendingRequests.map((request) => (
                    <IncomingHireRequestCard
                      key={request.id}
                      request={request}
                      onDecisionMade={fetchRequests}
                    />
                  ))
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="accepted" className="space-y-4 mt-0">
              <AnimatePresence mode="popLayout">
                {acceptedRequests.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No accepted requests yet</p>
                  </motion.div>
                ) : (
                  acceptedRequests.map((request) => (
                    <HireRequestHistoryCard
                      key={request.id}
                      request={request}
                      status="accepted"
                    />
                  ))
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="declined" className="space-y-4 mt-0">
              <AnimatePresence mode="popLayout">
                {declinedRequests.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <XCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No declined requests</p>
                  </motion.div>
                ) : (
                  declinedRequests.map((request) => (
                    <HireRequestHistoryCard
                      key={request.id}
                      request={request}
                      status="declined"
                    />
                  ))
                )}
              </AnimatePresence>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};
