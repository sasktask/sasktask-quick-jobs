import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Reply, ThumbsUp, Send, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ReviewerInfo {
  full_name: string;
  avatar_url: string | null;
}

interface TaskInfo {
  title: string;
}

interface ReviewResponse {
  id: string;
  response_text: string;
  created_at: string;
  responded_by: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  quality_rating: number | null;
  communication_rating: number | null;
  timeliness_rating: number | null;
  helpful_count: number | null;
  response: string | null;
  responded_at: string | null;
  reviewer_id: string;
  reviewer: ReviewerInfo;
  task: TaskInfo;
}

interface ReviewSectionProps {
  profileUserId: string;
  currentUserId: string | null;
  isOwnProfile: boolean;
}

export const ReviewSection = ({ profileUserId, currentUserId, isOwnProfile }: ReviewSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchReviews();
  }, [profileUserId]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          quality_rating,
          communication_rating,
          timeliness_rating,
          helpful_count,
          response,
          responded_at,
          reviewer_id,
          reviewer:profiles!reviews_reviewer_id_fkey (
            full_name,
            avatar_url
          ),
          task:tasks (
            title
          )
        `)
        .eq("reviewee_id", profileUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews((data as unknown as Review[]) || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    setSubmittingReply(true);
    try {
      // Update the review with the response
      const { error } = await supabase
        .from("reviews")
        .update({
          response: replyText.trim(),
          responded_at: new Date().toISOString()
        })
        .eq("id", reviewId)
        .eq("reviewee_id", currentUserId); // Ensure only the reviewee can respond

      if (error) throw error;

      toast.success("Reply posted successfully!");
      setReplyText("");
      setReplyingTo(null);
      fetchReviews();
    } catch (error: any) {
      console.error("Error submitting reply:", error);
      toast.error(error.message || "Failed to post reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    if (!currentUserId) {
      toast.error("Please sign in to mark reviews as helpful");
      return;
    }

    try {
      const review = reviews.find(r => r.id === reviewId);
      const newCount = (review?.helpful_count || 0) + 1;

      const { error } = await supabase
        .from("reviews")
        .update({ helpful_count: newCount })
        .eq("id", reviewId);

      if (error) throw error;

      // Update local state
      setReviews(reviews.map(r => 
        r.id === reviewId ? { ...r, helpful_count: newCount } : r
      ));
      
      toast.success("Marked as helpful!");
    } catch (error) {
      console.error("Error marking helpful:", error);
    }
  };

  const toggleExpanded = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const renderStars = (rating: number, size: string = "h-4 w-4") => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${size} ${
              i < rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingBreakdown = (review: Review) => {
    const ratings = [
      { label: "Quality", value: review.quality_rating },
      { label: "Communication", value: review.communication_rating },
      { label: "Timeliness", value: review.timeliness_rating },
    ].filter(r => r.value !== null);

    if (ratings.length === 0) return null;

    return (
      <div className="mt-3 pt-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground mb-2">Rating Breakdown</p>
        <div className="grid grid-cols-3 gap-2">
          {ratings.map(r => (
            <div key={r.label} className="text-center">
              <p className="text-xs text-muted-foreground">{r.label}</p>
              <div className="flex items-center justify-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{r.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4">
                <div className="h-12 w-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Reviews ({reviews.length})
          </CardTitle>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length))}
              </div>
              <span className="text-sm font-medium">
                {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Star className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="font-medium text-lg">No reviews yet</p>
            <p className="text-sm mt-1">Complete tasks to receive your first review!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => {
              const isExpanded = expandedReviews.has(review.id);
              const hasDetailedRatings = review.quality_rating || review.communication_rating || review.timeliness_rating;

              return (
                <div 
                  key={review.id} 
                  className="border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
                >
                  {/* Review Header */}
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border-2 border-border">
                      <AvatarImage 
                        src={review.reviewer.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.reviewer.full_name}`}
                        alt={review.reviewer.full_name}
                      />
                      <AvatarFallback>{review.reviewer.full_name?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-semibold">{review.reviewer.full_name}</h4>
                        {renderStars(review.rating)}
                        <Badge variant="secondary" className="text-xs">
                          {review.rating}/5
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        For: <span className="font-medium text-foreground">{review.task?.title || "Task"}</span>
                      </p>

                      {review.comment && (
                        <p className="text-foreground leading-relaxed">{review.comment}</p>
                      )}

                      {/* Detailed Ratings (expandable) */}
                      {hasDetailedRatings && isExpanded && renderRatingBreakdown(review)}

                      {/* Review Meta */}
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>
                          {format(new Date(review.created_at), "MMM d, yyyy")}
                        </span>
                        
                        {hasDetailedRatings && (
                          <button 
                            onClick={() => toggleExpanded(review.id)}
                            className="flex items-center gap-1 hover:text-foreground transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            {isExpanded ? "Less" : "More details"}
                          </button>
                        )}

                        <button 
                          onClick={() => handleMarkHelpful(review.id)}
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          Helpful {review.helpful_count ? `(${review.helpful_count})` : ""}
                        </button>

                        {isOwnProfile && !review.response && (
                          <button 
                            onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                            className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                          >
                            <Reply className="h-3 w-3" />
                            Reply
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Owner's Response */}
                  {review.response && (
                    <div className="mt-4 ml-16 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">Owner Response</span>
                        {review.responded_at && (
                          <span className="text-xs text-muted-foreground">
                            • {format(new Date(review.responded_at), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground">{review.response}</p>
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyingTo === review.id && isOwnProfile && !review.response && (
                    <div className="mt-4 ml-16 p-4 bg-muted/30 rounded-lg border border-border">
                      <p className="text-sm font-medium mb-2">Reply to this review</p>
                      <Textarea
                        placeholder="Thank you for your feedback..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={3}
                        className="mb-3"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSubmitReply(review.id)}
                          disabled={submittingReply || !replyText.trim()}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {submittingReply ? "Posting..." : "Post Reply"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
