import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Shield, MapPin, Briefcase, Award, TrendingUp, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer: {
    full_name: string;
    avatar_url?: string;
  };
  task: {
    title: string;
  };
}

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [verification, setVerification] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError) throw profileError;

      // Check if profile has proper data
      if (!profileData.full_name || !profileData.email) {
        toast({
          title: "Profile not found",
          description: "This user profile is not available",
          variant: "destructive",
        });
        navigate("/find-taskers");
        return;
      }

      setProfile(profileData);

      // Fetch verification status
      const { data: verificationData } = await supabase
        .from("verifications")
        .select("*")
        .eq("user_id", id)
        .maybeSingle();

      setVerification(verificationData);

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          reviewer:profiles!reviews_reviewer_id_fkey (
            full_name,
            avatar_url
          ),
          task:tasks (
            title
          )
        `)
        .eq("reviewee_id", id)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      setReviews(reviewsData || []);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const isVerified = verification?.verification_status === "verified";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="border-border mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarImage 
                    src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`}
                    alt={profile.full_name}
                  />
                  <AvatarFallback className="text-3xl">{profile.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                    {isVerified && (
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        <Shield className="h-4 w-4 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="text-muted-foreground mb-4">{profile.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-lg">{profile.rating?.toFixed(1) || "0.0"}</span>
                      <span className="text-muted-foreground">({profile.total_reviews || 0} reviews)</span>
                    </div>

                    <Separator orientation="vertical" className="h-6" />

                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold">{profile.completed_tasks || 0}</span>
                      <span className="text-muted-foreground">tasks completed</span>
                    </div>

                    <Separator orientation="vertical" className="h-6" />

                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold">{profile.trust_score || 50}</span>
                      <span className="text-muted-foreground">trust score</span>
                    </div>
                  </div>

                  {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Details */}
          {isVerified && verification && (
            <Card className="border-border mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Verification Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {verification.id_verified && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">ID Verified</span>
                    </div>
                  )}
                  {verification.background_check_status === "verified" && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Background Check Passed</span>
                    </div>
                  )}
                  {verification.has_insurance && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Insured</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews Section */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Reviews ({reviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-border last:border-0 pb-6 last:pb-0">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 border-2 border-border">
                          <AvatarImage 
                            src={review.reviewer.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.reviewer.full_name}`}
                            alt={review.reviewer.full_name}
                          />
                          <AvatarFallback>{review.reviewer.full_name.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{review.reviewer.full_name}</h4>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            Task: {review.task.title}
                          </p>

                          {review.comment && (
                            <p className="text-foreground">{review.comment}</p>
                          )}

                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(review.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
