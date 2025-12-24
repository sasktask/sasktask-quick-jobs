import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: {
    full_name: string | null;
    avatar_url: string | null;
    city: string | null;
  } | null;
  task: {
    category: string;
  } | null;
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          className={cn(
            "h-4 w-4 transition-all",
            index < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );
};

export const TestimonialsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const stats = usePlatformStats();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select(`
            id,
            rating,
            comment,
            created_at,
            reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url, city),
            task:tasks!reviews_task_id_fkey(category)
          `)
          .gte("rating", 4)
          .not("comment", "is", null)
          .order("created_at", { ascending: false })
          .limit(6);

        if (error) throw error;
        setReviews(data || []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isAutoPlaying || reviews.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, reviews.length]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev + 1) % reviews.length);
  };

  // Don't show section if no reviews
  if (!loading && reviews.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-background via-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loading Reviews...</h2>
          </div>
        </div>
      </section>
    );
  }

  const currentReview = reviews[activeIndex];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-muted/30 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-2 text-sm font-medium">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-2" />
            {stats.totalUsers > 0 ? `${stats.totalUsers} Users` : "Real Reviews"}
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real feedback from real customers
          </p>
        </div>

        {/* Featured Testimonial - Large Card */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-xl">
            <CardContent className="p-8 md:p-12">
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 h-20 w-20 text-primary/10" />
              
              <div className="relative z-10">
                {/* User Info */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <img
                      src={currentReview.reviewer?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentReview.id}`}
                      alt={currentReview.reviewer?.full_name || "User"}
                      className="h-16 w-16 md:h-20 md:w-20 rounded-full border-4 border-primary/20 bg-background"
                    />
                    <div className="absolute -bottom-1 -right-1 h-7 w-7 bg-primary rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 fill-white text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-xl">{currentReview.reviewer?.full_name || "Anonymous"}</h4>
                    <p className="text-muted-foreground">
                      {currentReview.reviewer?.city || "Saskatchewan"}
                    </p>
                    <StarRating rating={currentReview.rating} />
                  </div>
                </div>

                {/* Comment */}
                <blockquote className="text-lg md:text-xl text-foreground leading-relaxed mb-6">
                  "{currentReview.comment}"
                </blockquote>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {currentReview.task?.category && (
                    <Badge variant="secondary" className="text-sm">
                      {currentReview.task.category}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>

            {/* Navigation */}
            {reviews.length > 1 && (
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrev}
                  className="h-10 w-10 rounded-full"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  className="h-10 w-10 rounded-full"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Progress dots */}
            {reviews.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setActiveIndex(index);
                    }}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      index === activeIndex
                        ? "w-8 bg-primary"
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Mini Testimonials Grid */}
        {reviews.length > 1 && (
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {reviews.slice(0, 3).map((review, index) => (
              <Card
                key={review.id}
                className={cn(
                  "relative overflow-hidden border hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer animate-fade-in",
                  index === activeIndex % 3 && "ring-2 ring-primary/50"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setActiveIndex(index);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={review.reviewer?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.id}`}
                      alt={review.reviewer?.full_name || "User"}
                      className="h-10 w-10 rounded-full border-2 border-primary/20 bg-background"
                    />
                    <div>
                      <h4 className="font-semibold text-sm">{review.reviewer?.full_name || "Anonymous"}</h4>
                      <StarRating rating={review.rating} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    "{review.comment}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
