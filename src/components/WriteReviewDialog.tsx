import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface WriteReviewDialogProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  revieweeId: string;
  revieweeName: string;
  onSuccess?: () => void;
}

export const WriteReviewDialog = ({
  open,
  onClose,
  taskId,
  taskTitle,
  revieweeId,
  revieweeName,
  onSuccess
}: WriteReviewDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [qualityRating, setQualityRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [timelinessRating, setTimelinessRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDetailedRatings, setShowDetailedRatings] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if review already exists
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("task_id", taskId)
        .eq("reviewer_id", user.id)
        .maybeSingle();

      if (existingReview) {
        toast.error("You have already reviewed this task");
        return;
      }

      const { error } = await supabase
        .from("reviews")
        .insert({
          task_id: taskId,
          reviewer_id: user.id,
          reviewee_id: revieweeId,
          rating,
          comment: comment.trim() || null,
          quality_rating: qualityRating || null,
          communication_rating: communicationRating || null,
          timeliness_rating: timelinessRating || null,
          verified: true
        });

      if (error) throw error;

      toast.success("Review submitted successfully!");
      resetForm();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setComment("");
    setQualityRating(0);
    setCommunicationRating(0);
    setTimelinessRating(0);
    setShowDetailedRatings(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const StarRating = ({ 
    value, 
    onChange, 
    size = "lg",
    label
  }: { 
    value: number; 
    onChange: (val: number) => void;
    size?: "sm" | "lg";
    label?: string;
  }) => {
    const [hover, setHover] = useState(0);
    const starSize = size === "lg" ? "h-8 w-8" : "h-5 w-5";

    return (
      <div>
        {label && <Label className="mb-2 block text-sm">{label}</Label>}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => onChange(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`${starSize} transition-colors ${
                  star <= (hover || value)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/40 hover:text-muted-foreground"
                }`}
              />
            </button>
          ))}
          {value > 0 && (
            <span className="ml-2 text-sm text-muted-foreground self-center">
              {value}/5
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience working with <span className="font-medium text-foreground">{revieweeName}</span> on "{taskTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating */}
          <div className="text-center">
            <Label className="mb-3 block font-medium">Overall Rating</Label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30 hover:text-muted-foreground/50"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Detailed Ratings Toggle */}
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDetailedRatings(!showDetailedRatings)}
            >
              {showDetailedRatings ? "Hide" : "Add"} detailed ratings (optional)
            </Button>
          </div>

          {/* Detailed Ratings */}
          {showDetailedRatings && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <StarRating 
                value={qualityRating} 
                onChange={setQualityRating} 
                size="sm"
                label="Quality of Work"
              />
              <StarRating 
                value={communicationRating} 
                onChange={setCommunicationRating} 
                size="sm"
                label="Communication"
              />
              <StarRating 
                value={timelinessRating} 
                onChange={setTimelinessRating} 
                size="sm"
                label="Timeliness"
              />
            </div>
          )}

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review (optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share details about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/1000 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Review
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
