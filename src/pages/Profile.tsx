import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdvancedProfileSettings } from "@/components/AdvancedProfileSettings";
import { PaymentMethodManager } from "@/components/PaymentMethodManager";
import { PayoutAccountSetup } from "@/components/PayoutAccountSetup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { BadgeShowcase } from "@/components/BadgeShowcase";
import { ProfileStrengthMeter } from "@/components/ProfileStrengthMeter";
import { ProfileTips } from "@/components/ProfileTips";
import { Loader2, Star, Briefcase, Award, Upload, Shield, TrendingUp, Clock, Settings, CreditCard, Wallet, Lock, User, Trophy, BadgeCheck, ShieldCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VerificationStatus {
  id_verified: boolean;
  verification_status: string | null;
  background_check_status: string | null;
  has_insurance: boolean;
}

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    bio: "",
    avatar_url: ""
  });
  const [uploading, setUploading] = useState(false);
  const [trustScore, setTrustScore] = useState<number>(50);
  const [verification, setVerification] = useState<VerificationStatus | null>(null);

  useEffect(() => {
    checkUserAndLoadProfile();
  }, []);

  const checkUserAndLoadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) throw error;

      // If no profile exists, create one
      if (!profileData) {
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .upsert({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (createError) throw createError;
        setProfile(newProfile);
        setTrustScore(newProfile?.trust_score || 50);
        setFormData({
          full_name: newProfile?.full_name || "",
          phone: newProfile?.phone || "",
          bio: newProfile?.bio || "",
          avatar_url: newProfile?.avatar_url || ""
        });
      } else {
        setProfile(profileData);
        setTrustScore(profileData.trust_score || 50);
        setFormData({
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
          bio: profileData.bio || "",
          avatar_url: profileData.avatar_url || ""
        });
      }

      // Fetch user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      setUserRole(roleData?.role || null);

      // Fetch verification status
      const { data: verificationData } = await supabase
        .from("verifications")
        .select("id_verified, verification_status, background_check_status, has_insurance")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      if (verificationData) {
        setVerification(verificationData);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      
      setUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      setFormData({ ...formData, avatar_url: publicUrl });
      
      toast({
        title: "Photo uploaded!",
        description: "Don't forget to save your changes",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          last_active: new Date().toISOString()
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your profile has been updated",
      });

      checkUserAndLoadProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information, settings, and payment methods</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Profile Sidebar - Enhanced Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-border">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <Avatar className="h-32 w-32 border-4 border-primary/20">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-3xl">
                      {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  {/* Verified Badge */}
                  {verification?.verification_status === 'verified' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="absolute top-0 right-0 bg-blue-500 text-white p-1.5 rounded-full shadow-lg">
                            <BadgeCheck className="h-5 w-5" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Verified Profile</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                    <Upload className="h-4 w-4" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h3 className="font-bold text-xl">{profile?.full_name || "No Name"}</h3>
                  {verification?.verification_status === 'verified' && (
                    <BadgeCheck className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{profile?.email}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {userRole?.replace("_", " ") || "N/A"}
                  </Badge>
                  {verification?.id_verified && (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      ID Verified
                    </Badge>
                  )}
                  {verification?.background_check_status === 'verified' && (
                    <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                      <Shield className="h-3 w-3 mr-1" />
                      Background Check
                    </Badge>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Trust Score */}
              <div className="mb-4 p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-sm">Trust Score</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{trustScore}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                    style={{ width: `${trustScore}%` }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs">Rating</span>
                  </div>
                  <span className="text-sm font-semibold">{profile?.rating?.toFixed(1) || "0.0"}</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    <Award className="h-3 w-3 text-primary" />
                    <span className="text-xs">Reviews</span>
                  </div>
                  <span className="text-sm font-semibold">{profile?.total_reviews || 0}</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3 w-3 text-accent" />
                    <span className="text-xs">Completed</span>
                  </div>
                  <span className="text-sm font-semibold">{profile?.completed_tasks || 0}</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs">Response</span>
                  </div>
                  <span className="text-sm font-semibold">{profile?.response_rate || 100}%</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-blue-500" />
                    <span className="text-xs">On-Time</span>
                  </div>
                  <span className="text-sm font-semibold">{profile?.on_time_rate || 100}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Strength Meter */}
          <ProfileStrengthMeter profile={profile} userRole={userRole} />

          {/* Profile Tips */}
          {userRole === "task_doer" && <ProfileTips />}
          </div>

          {/* Main Content with Tabs */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto gap-1">
                <TabsTrigger value="basic" className="flex items-center gap-1 px-2 py-2 text-xs sm:text-sm">
                  <User className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">Basic Info</span>
                  <span className="sm:hidden">Info</span>
                </TabsTrigger>
                <TabsTrigger value="badges" className="flex items-center gap-1 px-2 py-2 text-xs sm:text-sm">
                  <Trophy className="h-4 w-4 shrink-0" />
                  <span>Badges</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-1 px-2 py-2 text-xs sm:text-sm">
                  <Settings className="h-4 w-4 shrink-0" />
                  <span>Settings</span>
                </TabsTrigger>
                <TabsTrigger value="payments" className="flex items-center gap-1 px-2 py-2 text-xs sm:text-sm">
                  <CreditCard className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{userRole === "task_giver" ? "Payment" : "Payout"}</span>
                  <span className="sm:hidden">Pay</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-1 px-2 py-2 text-xs sm:text-sm col-span-2 sm:col-span-1">
                  <Lock className="h-4 w-4 shrink-0" />
                  <span>Security</span>
                </TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          placeholder="Enter your full name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile?.email}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself..."
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="avatar_url">Avatar URL</Label>
                        <Input
                          id="avatar_url"
                          type="url"
                          placeholder="https://example.com/avatar.jpg"
                          value={formData.avatar_url}
                          onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                        />
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="submit"
                          disabled={isSaving}
                          className="flex-1"
                        >
                          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Changes
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate("/dashboard")}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Badges Tab */}
              <TabsContent value="badges">
                {userId && <BadgeShowcase userId={userId} />}
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <AdvancedProfileSettings profile={profile} onUpdate={checkUserAndLoadProfile} />
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments">
                {userRole === "task_giver" ? (
                  <PaymentMethodManager />
                ) : (
                  <PayoutAccountSetup />
                )}
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Security & Privacy</CardTitle>
                    <CardDescription>Manage your account security and privacy settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h4 className="font-semibold mb-1">Email Notifications</h4>
                          <p className="text-sm text-muted-foreground">Receive updates about your tasks and bookings</p>
                        </div>
                        <Badge variant="secondary">Enabled</Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h4 className="font-semibold mb-1">Two-Factor Authentication</h4>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                        </div>
                        <Button variant="outline" size="sm">Setup</Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h4 className="font-semibold mb-1">Profile Visibility</h4>
                          <p className="text-sm text-muted-foreground">Control who can see your profile information</p>
                        </div>
                        <Badge>Public</Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h4 className="font-semibold mb-1">Data Export</h4>
                          <p className="text-sm text-muted-foreground">Download a copy of your personal data</p>
                        </div>
                        <Button variant="outline" size="sm">Export</Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-semibold text-destructive">Danger Zone</h4>
                      <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                        <h5 className="font-semibold mb-2">Delete Account</h5>
                        <p className="text-sm text-muted-foreground mb-4">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <Button variant="destructive" size="sm">Delete Account</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
