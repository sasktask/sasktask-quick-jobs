import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Star, MessageSquare } from "lucide-react";

interface EnhancedReviewFormProps {
  taskId: string;
  revieweeId: string;
  revieweeName: string;
  onReviewSubmitted?: () => void;
}

export const EnhancedReviewForm = ({ taskId, revieweeId, revieweeName, onReviewSubmitted }: EnhancedReviewFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qualityRating, setQualityRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [timelinessRating, setTimelinessRating] = useState(0);
  const [comment, setComment] = useState("");

  const StarRating = ({ rating, onRatingChange, label }: { rating: number; onRatingChange: (rating: number) => void; label: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const handleSubmit = async () => {
    if (!qualityRating || !communicationRating || !timelinessRating) {
      toast({
        title: "Missing Ratings",
        description: "Please provide ratings for all categories",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const overallRating = Math.round((qualityRating + communicationRating + timelinessRating) / 3);

      const { error } = await supabase.from("reviews").insert({
        task_id: taskId,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        rating: overallRating,
        quality_rating: qualityRating,
        communication_rating: communicationRating,
        timeliness_rating: timelinessRating,
        comment,
        verified: true, // Mark as verified since it's after task completion
      });

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Your review has been posted successfully",
      });

      onReviewSubmitted?.();
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Review {revieweeName}
        </CardTitle>
        <CardDescription>
          Share your experience to help others make informed decisions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <StarRating
          rating={qualityRating}
          onRatingChange={setQualityRating}
          label="Work Quality"
        />
        <StarRating
          rating={communicationRating}
          onRatingChange={setCommunicationRating}
          label="Communication"
        />
        <StarRating
          rating={timelinessRating}
          onRatingChange={setTimelinessRating}
          label="Timeliness"
        />

        <div className="space-y-2">
          <Label htmlFor="comment">Your Review (Optional)</Label>
          <Textarea
            id="comment"
            placeholder="Share details about your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>

        <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Review Guidelines</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Be honest and constructive</li>
            <li>Focus on specific aspects of the work</li>
            <li>Avoid personal attacks or inappropriate language</li>
          </ul>
        </div>

        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </CardContent>
    </Card>
  );
};
