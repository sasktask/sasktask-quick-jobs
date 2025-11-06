import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  comment: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Homeowner",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    rating: 5,
    comment: "Amazing service! Found a reliable snow removal tasker within minutes. The platform made it so easy to book and pay securely. Highly recommend SaskTask!"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Task Doer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    rating: 5,
    comment: "As a handyman, SaskTask has helped me grow my business significantly. The verification system builds trust with clients and I get consistent work throughout the month."
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Business Owner",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    rating: 5,
    comment: "We use SaskTask for all our office cleaning and maintenance needs. The quality of taskers is exceptional and the booking process is streamlined. A game-changer!"
  },
  {
    id: 4,
    name: "David Thompson",
    role: "Homeowner",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    rating: 5,
    comment: "I needed help with moving and found someone within an hour. Professional, punctual, and affordable. SaskTask connects you with the right people for any job."
  },
  {
    id: 5,
    name: "Jessica Lee",
    role: "Task Doer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
    rating: 5,
    comment: "The verification process gave me credibility as a new tasker. Within weeks, I had a steady stream of clients and positive reviews. Love this platform!"
  },
  {
    id: 6,
    name: "Robert Martinez",
    role: "Property Manager",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
    rating: 5,
    comment: "Managing multiple properties is easier with SaskTask. I can quickly find reliable help for maintenance, cleaning, and repairs. The escrow system is perfect for peace of mind."
  }
];

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          className={`h-5 w-5 ${
            index < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
};

export const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Star className="h-5 w-5 fill-primary" />
            <span className="font-semibold">Customer Reviews</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied customers and taskers who trust SaskTask
            for their everyday needs
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group"
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Quote className="h-16 w-16 text-primary" />
                </div>

                {/* User Info */}
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="relative">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="h-16 w-16 rounded-full border-2 border-primary/20 bg-background"
                    />
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                      <Star className="h-3 w-3 fill-white text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-4">
                  <StarRating rating={testimonial.rating} />
                </div>

                {/* Comment */}
                <p className="text-muted-foreground leading-relaxed">
                  "{testimonial.comment}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
            <div className="text-muted-foreground">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">2,500+</div>
            <div className="text-muted-foreground">Verified Taskers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">4.9/5</div>
            <div className="text-muted-foreground">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">15,000+</div>
            <div className="text-muted-foreground">Tasks Completed</div>
          </div>
        </div>
      </div>
    </section>
  );
};
