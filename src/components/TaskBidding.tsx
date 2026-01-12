import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Gavel, User, Clock, Check, X, DollarSign, MessageSquare } from "lucide-react";
import { z } from "zod";

const bidSchema = z.object({
  bid_amount: z.number().positive("Bid amount must be positive").max(100000, "Bid amount too high"),
  message: z.string().max(1000, "Message too long").optional(),
  estimated_hours: z.number().positive("Estimated hours must be positive").optional(),
});

interface TaskBiddingProps {
  taskId: string;
  taskGiverId: string;
  currentUserId: string;
  userRole: string | null;
  originalAmount: number;
}

interface Bid {
  id: string;
  task_id: string;
  bidder_id: string;
  bid_amount: number;
  message: string | null;
  estimated_hours: number | null;
  status: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    rating: number | null;
    total_reviews: number | null;
  };
}

export const TaskBidding = ({ taskId, taskGiverId, currentUserId, userRole, originalAmount }: TaskBiddingProps) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [myBid, setMyBid] = useState<Bid | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatLoadingId, setChatLoadingId] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState(originalAmount.toString());
  const [message, setMessage] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [showBidForm, setShowBidForm] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const isTaskGiver = currentUserId === taskGiverId;
  const isTaskDoer = userRole === "task_doer";

  useEffect(() => {
    fetchBids();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('task-bids')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_bids',
          filter: `task_id=eq.${taskId}`
        },
        () => {
          fetchBids();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId]);

  const fetchBids = async () => {
    try {
      const { data, error } = await supabase
        .from("task_bids")
        .select(`
          *,
          profiles:bidder_id (
            full_name,
            avatar_url,
            rating,
            total_reviews
          )
        `)
        .eq("task_id", taskId)
        .order("bid_amount", { ascending: true });

      if (error) throw error;

      const typedBids = (data || []) as Bid[];
      setBids(typedBids);

      const userBid = typedBids.find(b => b.bidder_id === currentUserId);
      setMyBid(userBid || null);

      if (userBid) {
        setBidAmount(userBid.bid_amount.toString());
        setMessage(userBid.message || "");
        setEstimatedHours(userBid.estimated_hours?.toString() || "");
      }
    } catch (error: any) {
      console.error("Error fetching bids:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitBid = async () => {
    setIsSubmitting(true);

    try {
      const validation = bidSchema.safeParse({
        bid_amount: parseFloat(bidAmount),
        message: message || undefined,
        estimated_hours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      });

      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      if (myBid) {
        // Update existing bid
        const { error } = await supabase
          .from("task_bids")
          .update({
            bid_amount: validation.data.bid_amount,
            message: validation.data.message || null,
            estimated_hours: validation.data.estimated_hours || null,
          })
          .eq("id", myBid.id);

        if (error) throw error;

        toast({
          title: "Bid Updated",
          description: "Your bid has been updated successfully",
        });
      } else {
        // Create new bid
        const { data: bidData, error } = await supabase
          .from("task_bids")
          .insert({
            task_id: taskId,
            bidder_id: currentUserId,
            bid_amount: validation.data.bid_amount,
            message: validation.data.message || null,
            estimated_hours: validation.data.estimated_hours || null,
          })
          .select()
          .single();

        if (error) throw error;

        // Send notification to task giver
        try {
          await supabase.functions.invoke('notify-new-bid', {
            body: {
              taskId,
              bidId: bidData.id,
              bidderId: currentUserId,
              bidAmount: validation.data.bid_amount,
              message: validation.data.message || null,
            },
          });
        } catch (notifyError) {
          console.error("Error sending bid notification:", notifyError);
        }

        toast({
          title: "Bid Submitted",
          description: "Your bid has been submitted successfully",
        });
      }

      fetchBids();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawBid = async () => {
    if (!myBid) return;

    try {
      const { error } = await supabase
        .from("task_bids")
        .delete()
        .eq("id", myBid.id);

      if (error) throw error;

      toast({
        title: "Bid Withdrawn",
        description: "Your bid has been withdrawn",
      });

      setMyBid(null);
      setBidAmount(originalAmount.toString());
      setMessage("");
      setEstimatedHours("");
      fetchBids();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAcceptBid = async (bidId: string, bidderId: string) => {
    try {
      console.log("Accepted bid:", bidId, bidderId);
      const acceptedBid = bids.find(b => b.id === bidId);
      const bookingInsertPayload = {
        task_id: taskId,
        task_doer_id: bidderId,
        message: acceptedBid?.message || "Bid accepted",
        status: "accepted" as const,
      };

      // Update the accepted bid
      const { error: bidError } = await supabase
        .from("task_bids")
        .update({ status: "accepted" })
        .eq("id", bidId);

      if (bidError) throw bidError;

      // Reject all other bids
      const { error: rejectError } = await supabase
        .from("task_bids")
        .update({ status: "rejected" })
        .eq("task_id", taskId)
        .neq("id", bidId);

      if (rejectError) throw rejectError;

      // Check for existing booking first
      const { data: existingBooking } = await supabase
        .from("bookings")
        .select("id")
        .eq("task_id", taskId)
        .eq("task_doer_id", bidderId)
        .maybeSingle();

      let bookingId = existingBooking?.id;

      if (!bookingId) {
        // Create a booking for the accepted bidder
        const { data: newBooking, error: bookingError } = await supabase
          .from("bookings")
          .insert(bookingInsertPayload)
          .select("id")
          .single();

        if (bookingError) throw bookingError;
        bookingId = newBooking.id;
      } else {
        // Update existing booking to accepted
        await supabase
          .from("bookings")
          .update({ status: "accepted" })
          .eq("id", bookingId);
      }

      toast({
        title: "Bid Accepted",
        description: "Redirecting you to chat with the tasker...",
      });

      // Navigate to chat with the task doer
      navigate(`/chat/${bookingId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRejectBid = async (bidId: string) => {
    try {
      const { error } = await supabase
        .from("task_bids")
        .update({ status: "rejected" })
        .eq("id", bidId);

      if (error) throw error;

      toast({
        title: "Bid Rejected",
        description: "The bid has been rejected",
      });

      fetchBids();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleChatWithBidder = async (bid: Bid) => {
    if (!isTaskGiver) return;

    setChatLoadingId(bid.id);
    try {
      // Reuse existing booking between this task and bidder if present
      const { data: existingBooking, error: existingError } = await supabase
        .from("bookings")
        .select("id, status")
        .eq("task_id", taskId)
        .eq("task_doer_id", bid.bidder_id)
        .maybeSingle();

      if (existingError) throw existingError;

      let bookingId = existingBooking?.id;

      if (!bookingId) {
        const { data: newBooking, error: createError } = await supabase
          .from("bookings")
          .insert({
            task_id: taskId,
            task_doer_id: bid.bidder_id,
            message: bid.message || "Chat initiated from bid",
            status: bid.status === "accepted" ? "accepted" : "pending",
          })
          .select("id")
          .single();

        if (createError) throw createError;
        bookingId = newBooking.id;
      }

      navigate(`/chat/${bookingId}`);
    } catch (error: any) {
      toast({
        title: "Chat Unavailable",
        description: error.message || "Unable to start chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setChatLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bidding Section for Task Doers */}
      {isTaskDoer && !isTaskGiver && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              {myBid ? "Update Your Bid" : "Place a Bid"}
            </CardTitle>
            <CardDescription>
              Submit your proposal for this task. Original budget: ${originalAmount}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bidAmount">Your Bid Amount ($) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="bidAmount"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="e.g., 100.00"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="estimatedHours"
                    type="number"
                    step="0.5"
                    min="0.5"
                    placeholder="e.g., 2.5"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message to Task Giver</Label>
              <Textarea
                id="message"
                placeholder="Introduce yourself and explain why you're the best fit..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitBid}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {myBid ? "Update Bid" : "Submit Bid"}
              </Button>
              {myBid && (
                <Button variant="outline" onClick={handleWithdrawBid}>
                  Withdraw
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bids List */}
      {bids.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Bids ({bids.length})</span>
              {bids.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  Lowest: ${Math.min(...bids.map(b => b.bid_amount))}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bids.map((bid) => (
                <div
                  key={bid.id}
                  className={`p-4 rounded-lg border ${bid.bidder_id === currentUserId
                    ? "border-primary bg-primary/5"
                    : "border-border"
                    } ${bid.status === "rejected" ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={bid.profiles?.avatar_url || undefined} />
                        <AvatarFallback>
                          {bid.profiles?.full_name?.charAt(0) || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">
                            {bid.profiles?.full_name || "Anonymous"}
                          </span>
                          {bid.profiles?.rating && (
                            <span className="text-sm text-muted-foreground">
                              ⭐ {bid.profiles.rating.toFixed(1)} ({bid.profiles.total_reviews} reviews)
                            </span>
                          )}
                          {bid.bidder_id === currentUserId && (
                            <Badge variant="secondary">Your Bid</Badge>
                          )}
                          {bid.status === "accepted" && (
                            <Badge className="bg-green-100 text-green-700">Accepted</Badge>
                          )}
                          {bid.status === "rejected" && (
                            <Badge variant="destructive">Rejected</Badge>
                          )}
                        </div>
                        {bid.message && (
                          <p className="text-sm text-muted-foreground mt-1">{bid.message}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="font-bold text-lg text-primary">
                            ${bid.bid_amount}
                          </span>
                          {bid.estimated_hours && (
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {bid.estimated_hours}h
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions for Task Giver */}
                    {isTaskGiver && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleChatWithBidder(bid)}
                          disabled={chatLoadingId === bid.id}
                          className="gap-1"
                        >
                          {chatLoadingId === bid.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MessageSquare className="h-4 w-4" />
                          )}
                          Chat
                        </Button>
                        {bid.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAcceptBid(bid.id, bid.bidder_id)}
                              className="gap-1"
                            >
                              <Check className="h-4 w-4" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectBid(bid.id)}
                              className="gap-1"
                            >
                              <X className="h-4 w-4" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No bids message - clickable for task doers */}
      {bids.length === 0 && !showBidForm && (
        <Card
          className={isTaskDoer && !isTaskGiver ? "cursor-pointer hover:border-primary/50 transition-colors" : ""}
          onClick={() => {
            if (isTaskDoer && !isTaskGiver) {
              setShowBidForm(true);
            }
          }}
        >
          <CardContent className="p-8 text-center">
            <Gavel className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              No bids yet. {isTaskDoer && !isTaskGiver ? "Be the first to submit a proposal!" : ""}
            </p>
            {isTaskDoer && !isTaskGiver && (
              <p className="text-sm text-primary mt-2">Click here to place your bid</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Inline Bid Form when triggered from empty state */}
      {bids.length === 0 && showBidForm && isTaskDoer && !isTaskGiver && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              Place a Bid
            </CardTitle>
            <CardDescription>
              Submit your proposal for this task. Original budget: ${originalAmount}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bidAmountInline">Your Bid Amount ($) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="bidAmountInline"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="e.g., 100.00"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedHoursInline">Estimated Hours</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="estimatedHoursInline"
                    type="number"
                    step="0.5"
                    min="0.5"
                    placeholder="e.g., 2.5"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="messageInline">Message to Task Giver</Label>
              <Textarea
                id="messageInline"
                placeholder="Introduce yourself and explain why you're the best fit..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitBid}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Bid
              </Button>
              <Button variant="outline" onClick={() => setShowBidForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
