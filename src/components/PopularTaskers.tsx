import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, CheckCircle2, Award, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Tasker {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  rating: number | null;
  total_reviews: number | null;
  completed_tasks: number | null;
  skills: string[] | null;
  verified_by_admin: boolean | null;
}

export const PopularTaskers = () => {
  const [taskers, setTaskers] = useState<Tasker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopTaskers = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, bio, city, rating, total_reviews, completed_tasks, skills, verified_by_admin")
          .not("rating", "is", null)
          .gte("rating", 4)
          .order("rating", { ascending: false })
          .order("completed_tasks", { ascending: false })
          .limit(6);

        if (error) throw error;
        setTaskers(data || []);
      } catch (error) {
        console.error("Error fetching taskers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopTaskers();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Popular Taskers</h2>
            <p className="text-xl text-muted-foreground">Loading top-rated professionals...</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-muted" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (taskers.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4">
            <Award className="h-4 w-4" />
            Top Rated Professionals
          </div>
          <h2 className="text-4xl font-bold mb-4">Popular Taskers</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Meet our highest-rated task doers who consistently deliver exceptional results
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {taskers.map((tasker, index) => (
            <Card 
              key={tasker.id} 
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/30 relative overflow-hidden"
            >
              {index < 3 && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-primary/80 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                  #{index + 1} Top Rated
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage src={tasker.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                        {tasker.full_name?.charAt(0) || "T"}
                      </AvatarFallback>
                    </Avatar>
                    {tasker.verified_by_admin && (
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{tasker.full_name || "Anonymous Tasker"}</h3>
                    {tasker.city && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {tasker.city}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold">{tasker.rating?.toFixed(1) || "N/A"}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({tasker.total_reviews || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {tasker.bio && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {tasker.bio}
                  </p>
                )}

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{tasker.completed_tasks || 0} tasks completed</span>
                  </div>
                </div>

                {tasker.skills && tasker.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {tasker.skills.slice(0, 3).map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {tasker.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{tasker.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <Link to={`/profile/${tasker.id}`}>
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white transition-colors">
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/find-taskers">
            <Button size="lg" variant="outline" className="gap-2">
              <Users className="h-5 w-5" />
              View All Taskers
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
