import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  location: string;
  avatar: string;
  rating: number;
  comment: string;
  taskType?: string;
  savings?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Homeowner",
    location: "Saskatoon",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    rating: 5,
    comment: "Found a reliable snow removal tasker within minutes. The platform made booking and paying so easy. Saved me hours of searching!",
    taskType: "Snow Removal",
    savings: "Saved $50"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Task Doer",
    location: "Regina",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    rating: 5,
    comment: "SaskTask helped me grow my handyman business significantly. The verification system builds trust and I get consistent work.",
    taskType: "Handyman",
    savings: "Earned $2,400/mo"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Business Owner",
    location: "Prince Albert",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    rating: 5,
    comment: "We use SaskTask for all our office cleaning needs. The quality of taskers is exceptional and booking is streamlined.",
    taskType: "Commercial Cleaning",
    savings: "Saved 10hrs/week"
  },
  {
    id: 4,
    name: "David Thompson",
    role: "Homeowner",
    location: "Moose Jaw",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    rating: 5,
    comment: "Needed help moving and found someone within an hour. Professional, punctual, and affordable. Highly recommend!",
    taskType: "Moving Help",
    savings: "Saved $200"
  },
  {
    id: 5,
    name: "Jessica Lee",
    role: "Task Doer",
    location: "Swift Current",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
    rating: 5,
    comment: "The verification process gave me credibility as a new tasker. Within weeks, I had steady clients and positive reviews!",
    taskType: "Pet Care",
    savings: "Earned $1,800/mo"
  },
  {
    id: 6,
    name: "Robert Martinez",
    role: "Property Manager",
    location: "Yorkton",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
    rating: 5,
    comment: "Managing multiple properties is easier with SaskTask. Quick, reliable help for maintenance and repairs whenever needed.",
    taskType: "Property Maintenance",
    savings: "Saved $500/mo"
  }
];

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
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-muted/30 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-2 text-sm font-medium">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-2" />
            Over 5,000+ Happy Users
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Real Stories, Real Results
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See why Saskatchewan trusts SaskTask for getting things done
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
                      src={testimonials[activeIndex].avatar}
                      alt={testimonials[activeIndex].name}
                      className="h-16 w-16 md:h-20 md:w-20 rounded-full border-4 border-primary/20 bg-background"
                    />
                    <div className="absolute -bottom-1 -right-1 h-7 w-7 bg-primary rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 fill-white text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-xl">{testimonials[activeIndex].name}</h4>
                    <p className="text-muted-foreground">
                      {testimonials[activeIndex].role} • {testimonials[activeIndex].location}
                    </p>
                    <StarRating rating={testimonials[activeIndex].rating} />
                  </div>
                </div>

                {/* Comment */}
                <blockquote className="text-lg md:text-xl text-foreground leading-relaxed mb-6">
                  "{testimonials[activeIndex].comment}"
                </blockquote>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {testimonials[activeIndex].taskType && (
                    <Badge variant="secondary" className="text-sm">
                      {testimonials[activeIndex].taskType}
                    </Badge>
                  )}
                  {testimonials[activeIndex].savings && (
                    <Badge variant="default" className="text-sm bg-emerald-500">
                      {testimonials[activeIndex].savings}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>

            {/* Navigation */}
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

            {/* Progress dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {testimonials.map((_, index) => (
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
          </Card>
        </div>

        {/* Mini Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <Card
              key={testimonial.id}
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
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-10 w-10 rounded-full border-2 border-primary/20 bg-background"
                  />
                  <div>
                    <h4 className="font-semibold text-sm">{testimonial.name}</h4>
                    <StarRating rating={testimonial.rating} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  "{testimonial.comment}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-muted/30 rounded-2xl p-6 md:p-8">
          {[
            { value: "5,000+", label: "Happy Customers", color: "text-primary" },
            { value: "2,500+", label: "Verified Taskers", color: "text-emerald-500" },
            { value: "4.9/5", label: "Average Rating", color: "text-yellow-500" },
            { value: "15,000+", label: "Tasks Completed", color: "text-blue-500" }
          ].map((stat, index) => (
            <div 
              key={stat.label} 
              className="text-center animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn("text-3xl md:text-4xl font-bold mb-1", stat.color)}>
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
