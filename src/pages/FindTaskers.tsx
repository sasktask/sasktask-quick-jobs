import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Star, MapPin, Shield, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FindTaskers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [taskers, setTaskers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchTaskers();
  }, []);

  const fetchTaskers = async () => {
    try {
      setIsLoading(true);

      // Fetch task doers with complete profiles
      const { data: taskDoers, error } = await supabase
        .from("profiles")
        .select("*")
        .not("full_name", "is", null)
        .not("full_name", "eq", "")
        .gte("rating", 0)
        .order("rating", { ascending: false });

      if (error) throw error;

      // Filter verified task doers with complete data
      const verifiedTaskers = await Promise.all(
        (taskDoers || []).map(async (tasker) => {
          // Check if user has task_doer role
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", tasker.id)
            .eq("role", "task_doer")
            .maybeSingle();

          if (!roleData) return null;

          // Get verification status
          const { data: verification } = await supabase
            .from("verifications")
            .select("verification_status, id_verified, background_check_status, has_insurance")
            .eq("user_id", tasker.id)
            .maybeSingle();

          // Only include verified users
          if (verification?.verification_status !== "verified") return null;

          return {
            ...tasker,
            verifications: verification
          };
        })
      );

      // Remove nulls
      const filtered = verifiedTaskers.filter((tasker) => tasker !== null);

      setTaskers(filtered);
    } catch (error: any) {
      console.error("Error fetching taskers:", error);
      toast({
        title: "Error",
        description: "Failed to load taskers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTaskers = taskers.filter((tasker) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      tasker.full_name?.toLowerCase().includes(query) ||
      tasker.skills?.some((skill: string) => skill.toLowerCase().includes(query)) ||
      tasker.bio?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Find <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Verified Taskers</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse skilled professionals in Saskatchewan ready to help with your tasks
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by skill, location, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg"
            />
            <Button className="absolute right-2 top-2 h-10" variant="hero">
              Search
            </Button>
          </div>
        </div>

        {/* Taskers Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : filteredTaskers.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No verified taskers found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try adjusting your search" : "Check back later for verified professionals"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTaskers.map((tasker) => (
              <Card 
                key={tasker.id} 
                className="hover:shadow-lg transition-all duration-300 border-border group cursor-pointer"
                onClick={() => navigate(`/profile/${tasker.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-20 w-20 border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                      <AvatarImage
                        src={tasker.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tasker.full_name}`}
                        alt={tasker.full_name}
                      />
                      <AvatarFallback className="text-2xl">{tasker.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold truncate">{tasker.full_name}</h3>
                        {tasker.verifications?.verification_status === "verified" && (
                          <Shield className="h-5 w-5 text-primary shrink-0" />
                        )}
                      </div>
                      {tasker.rating > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{tasker.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground text-sm">
                            ({tasker.total_reviews} reviews)
                          </span>
                        </div>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {tasker.completed_tasks || 0} tasks completed
                      </Badge>
                    </div>
                  </div>

                  {tasker.bio && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{tasker.bio}</p>
                  )}

                  <div className="space-y-3">
                    {tasker.skills && tasker.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tasker.skills.slice(0, 3).map((skill: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {tasker.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{tasker.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {tasker.hourly_rate && (
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-sm text-muted-foreground">Hourly Rate</span>
                        <span className="font-bold text-lg text-primary">${tasker.hourly_rate}</span>
                      </div>
                    )}

                    <Button className="w-full" variant="hero">
                      View Profile & Reviews
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}