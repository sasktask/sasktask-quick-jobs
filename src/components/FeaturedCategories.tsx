import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFeaturedCategories, timeEstimateLabels } from "@/lib/categories";
import { ArrowRight, Star, Clock } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function FeaturedCategories() {
  const featured = getFeaturedCategories();

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-primary fill-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wide">Most Popular</span>
            </div>
            <h2 className="text-4xl font-bold">Featured Categories</h2>
            <p className="text-xl text-muted-foreground mt-2">Top requested tasks in Saskatchewan</p>
          </div>
          <Link to="/categories">
            <Button variant="outline" className="gap-2">
              View All Categories
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {featured.map((category, idx) => {
              const timeInfo = timeEstimateLabels[category.timeEstimate];
              return (
                <CarouselItem key={idx} className="pl-4 md:basis-1/2 lg:basis-1/4">
                  <Link to={`/browse?category=${encodeURIComponent(category.title)}`}>
                    <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-border hover:border-primary/50 h-full relative overflow-hidden">
                      {/* Featured badge */}
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Featured
                        </Badge>
                      </div>
                      
                      <CardContent className="p-6">
                        <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                          <category.icon className="h-8 w-8 text-white" />
                        </div>
                        
                        <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-sm text-primary font-semibold mb-2">{category.count}</p>
                        <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                        
                        {/* Time estimate badge */}
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`${timeInfo.color} text-xs`}>
                            <Clock className="h-3 w-3 mr-1" />
                            {timeInfo.label}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4" />
          <CarouselNext className="hidden md:flex -right-4" />
        </Carousel>
      </div>
    </section>
  );
}
