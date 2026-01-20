import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Star, Shield, MapPin, Briefcase, Award, TrendingUp, CheckCircle, Mail, Phone, Calendar, Globe, Linkedin, Facebook, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PortfolioManager } from "@/components/PortfolioManager";
import { SkillsShowcase } from "@/components/SkillsShowcase";
import { VerificationBadges } from "@/components/VerificationBadges";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { ReviewSection } from "@/components/ReviewSection";
import { CertificateManager } from "@/components/CertificateManager";


export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [verification, setVerification] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProfile();
      loadCurrentUser();
    }
  }, [id]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

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
    <>
      <SEOHead
        title={`${profile.full_name || "User"} - SaskTask Profile`}
        description={profile.bio || `View ${profile.full_name}'s profile, ratings, and completed work`}
      />
      
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
                    <VerificationBadges
                      verifiedByAdmin={profile.verified_by_admin}
                      idVerified={verification?.id_verified}
                      backgroundCheckStatus={verification?.background_check_status}
                      hasInsurance={verification?.has_insurance}
                      rating={profile.rating}
                      totalReviews={profile.total_reviews}
                    />
                  </div>

                  {profile.city && (
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.city}</span>
                    </div>
                  )}

                  {profile.bio && (
                    <p className="text-muted-foreground mb-4">{profile.bio}</p>
                  )}

                  {/* Social Links */}
                  {(profile.website || profile.linkedin || profile.twitter || profile.facebook) && (
                    <div className="flex gap-3 mb-4">
                      {profile.website && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={profile.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {profile.linkedin && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {profile.twitter && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={profile.twitter} target="_blank" rel="noopener noreferrer">
                            <Twitter className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {profile.facebook && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={profile.facebook} target="_blank" rel="noopener noreferrer">
                            <Facebook className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
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
                    <div className="mb-4">
                      <SkillsShowcase
                        userId={id!}
                        userSkills={profile.skills}
                        isOwnProfile={currentUserId === id}
                      />
                    </div>
                  )}

                  {/* Badges */}
                  {id && (
                    <div className="mb-4">
                      <BadgeDisplay userId={id} size="md" />
                    </div>
                  )}

                  {profile.hourly_rate && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Hourly Rate</p>
                      <p className="text-2xl font-bold text-primary">
                        ${profile.hourly_rate}/hr
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Availability & Contact */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Availability & Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Response Rate</span>
                  <span className="font-semibold">{profile.response_rate || 100}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">On-Time Rate</span>
                  <span className="font-semibold">{profile.on_time_rate || 100}%</span>
                </div>
                {profile.experience_years > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Experience</span>
                    <span className="font-semibold">{profile.experience_years} years</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="font-semibold">
                    {new Date(profile.joined_date || profile.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="default">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
                <Button className="w-full" variant="outline">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Offer a Task
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Last active: {profile.last_seen ? new Date(profile.last_seen).toLocaleDateString() : 'Recently'}
                </p>
              </CardContent>
            </Card>
          </div>

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

          {/* Certificates Section */}
          <div className="mb-8">
            <CertificateManager
              userId={id!}
              isOwnProfile={currentUserId === id}
            />
          </div>

          {/* Portfolio Section */}
          <div className="mb-8">
            <PortfolioManager
              userId={id!}
              isOwnProfile={currentUserId === id}
            />
          </div>

          {/* Reviews Section */}
          {id && (
            <ReviewSection
              profileUserId={id}
              currentUserId={currentUserId}
              isOwnProfile={currentUserId === id}
            />
          )}
        </div>
      </div>

      <Footer />
    </div>
    </>
  );
}
