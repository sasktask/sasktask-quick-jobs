import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AdvancedProfileSettings } from "@/components/AdvancedProfileSettings";
import { PaymentMethodManager } from "@/components/PaymentMethodManager";
import { PayoutAccountSetup } from "@/components/PayoutAccountSetup";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { BadgeShowcase } from "@/components/BadgeShowcase";
import { ProfileStrengthMeter } from "@/components/ProfileStrengthMeter";
import { ProfileTips } from "@/components/ProfileTips";
import { ProfileHeader, ProfileStatsCard, ProfileQuickActions, ProfileNavTabs, EnhancedSecurityDashboard, ProfileActivityTimeline, PrivacySettings, TwoFactorSetup } from "@/components/profile";
import { CertificateManager } from "@/components/CertificateManager";
import { VerificationStatusIndicator } from "@/components/VerificationStatusIndicator";
import { DeleteAccountDialog } from "@/components/account/DeleteAccountDialog";
import {
  Loader2, Shield, Clock, Settings, CreditCard, Lock, User,
  ShieldCheck, AlertCircle, Camera, FileCheck, CheckCircle2, XCircle,
  Sparkles
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface VerificationStatus {
  id_verified: boolean;
  verification_status: string | null;
  background_check_status: string | null;
  has_insurance: boolean;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  age_verified: boolean;
  id_document_url: string | null;
  legal_name: string | null;
  skills: string[] | null;
  certifications: string[] | null;
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
    avatar_url: "",
    city: "",
    country: "",
    website: "",
    linkedin: "",
    twitter: ""
  });
  const [uploading, setUploading] = useState(false);
  const [trustScore, setTrustScore] = useState<number>(50);
  const [verification, setVerification] = useState<VerificationStatus | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
          avatar_url: newProfile?.avatar_url || "",
          city: newProfile?.city || "",
          country: newProfile?.country || "",
          website: newProfile?.website || "",
          linkedin: newProfile?.linkedin || "",
          twitter: newProfile?.twitter || ""
        });
      } else {
        setProfile(profileData);
        setTrustScore(profileData.trust_score || 50);
        setFormData({
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
          bio: profileData.bio || "",
          avatar_url: profileData.avatar_url || "",
          city: profileData.city || "",
          country: profileData.country || "",
          website: profileData.website || "",
          linkedin: profileData.linkedin || "",
          twitter: profileData.twitter || ""
        });
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      setUserRole(roleData?.role || null);

      const { data: verificationData } = await supabase
        .from("verifications")
        .select("id_verified, verification_status, background_check_status, has_insurance, terms_accepted, privacy_accepted, age_verified, id_document_url, legal_name, skills, certifications")
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
      if (!userId) {
        toast({
          title: "Upload unavailable",
          description: "We could not confirm your session. Please re-login.",
          variant: "destructive",
        });
        return;
      }

      if (!e.target.files || e.target.files.length === 0) return;

      setUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (updateError) throw updateError;

      setFormData((prev) => ({ ...prev, avatar_url: publicUrl }));
      setProfile((prev: any) => prev ? { ...prev, avatar_url: publicUrl } : prev);

      toast({
        title: "Photo uploaded!",
        description: "Your profile photo was updated successfully.",
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
          city: formData.city,
          country: formData.country,
          website: formData.website,
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          last_active: new Date().toISOString()
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your changes have been saved successfully",
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-primary/20 mx-auto" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-primary mx-auto animate-spin" />
          </div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">My Profile</h1>
          </div>
          <p className="text-muted-foreground">Manage your personal information and preferences</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            {/* Main Profile Card */}
            <Card className="border-border overflow-hidden">
              <ProfileHeader
                profile={profile}
                userRole={userRole}
                verification={verification}
                uploading={uploading}
                onPhotoUpload={handlePhotoUpload}
              />
            </Card>

            {/* Stats Card */}
            <ProfileStatsCard profile={profile} trustScore={trustScore} />

            {/* Quick Actions */}
            {/* <ProfileQuickActions
              userId={userId}
              userRole={userRole}
              profile={profile}
              verification={verification}
              trustScore={trustScore}
            /> */}

            {/* Verification Status Card */}
            {/* {userId && (
              <VerificationStatusIndicator userId={userId} />
            )} */}

            {/* Profile Strength - Desktop */}
            <div className="hidden lg:block">
              <ProfileStrengthMeter profile={profile} userRole={userRole} />
            </div>

            {/* Profile Tips for Task Doers - Desktop */}
            {userRole === "task_doer" && (
              <div className="hidden lg:block">
                <ProfileTips />
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Profile Strength - Mobile */}
            <div className="lg:hidden">
              <ProfileStrengthMeter profile={profile} userRole={userRole} />
            </div>

            {/* Tabs Section */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <ProfileNavTabs userRole={userRole} />

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="mt-6">
                <Card className="border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your profile details visible to others</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Basic Info Section */}
                      <div className="grid sm:grid-cols-2 gap-4">
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
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone}
                            disabled
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile?.email}
                          disabled
                          className="bg-muted/50"
                        />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            placeholder="Your city"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            placeholder="Your country"
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Bio Section */}
                      <div className="space-y-2">
                        <Label htmlFor="bio">About Me</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          rows={4}
                          className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          {formData.bio.length}/500 characters
                        </p>
                      </div>

                      <Separator />

                      {/* Social Links Section */}
                      <div>
                        <h4 className="font-medium mb-4">Social Links</h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                              id="website"
                              type="url"
                              placeholder="https://yourwebsite.com"
                              value={formData.website}
                              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn</Label>
                            <Input
                              id="linkedin"
                              type="url"
                              placeholder="https://linkedin.com/in/username"
                              value={formData.linkedin}
                              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                          type="submit"
                          disabled={isSaving}
                          className="flex-1 sm:flex-none sm:min-w-[140px]"
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

              {/* Verification Tab */}
              <TabsContent value="verification" className="mt-6">
                <Card className="border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Identity Verification</CardTitle>
                        <CardDescription>Complete verification to build trust and access all features</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Verification Progress */}
                    {(() => {
                      const steps = [
                        { key: 'terms', label: 'Terms Accepted', done: verification?.terms_accepted },
                        { key: 'id', label: 'Government ID', done: verification?.id_document_url },
                        { key: 'verified', label: 'ID Verified', done: verification?.id_verified },
                        { key: 'background', label: 'Background Check', done: verification?.background_check_status === 'verified' },
                      ];
                      const completedSteps = steps.filter(s => s.done).length;
                      const progressPercent = (completedSteps / steps.length) * 100;

                      return (
                        <div className="p-4 rounded-lg bg-muted/30 border border-border">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium">Verification Progress</span>
                            <Badge variant="secondary">{completedSteps}/{steps.length} completed</Badge>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                        </div>
                      );
                    })()}

                    {/* Status Banner */}
                    {verification?.verification_status === 'verified' ? (
                      <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                        <div>
                          <h4 className="font-semibold text-green-700 dark:text-green-400">Fully Verified</h4>
                          <p className="text-sm text-green-600 dark:text-green-500">Your identity has been verified. You have full platform access.</p>
                        </div>
                      </div>
                    ) : verification?.verification_status === 'pending' ? (
                      <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <Clock className="h-6 w-6 text-yellow-600 shrink-0" />
                        <div>
                          <h4 className="font-semibold text-yellow-700 dark:text-yellow-400">Verification Pending</h4>
                          <p className="text-sm text-yellow-600 dark:text-yellow-500">Your documents are being reviewed. This usually takes 1-2 business days.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
                        <div>
                          <h4 className="font-semibold text-amber-700 dark:text-amber-400">Verification Required</h4>
                          <p className="text-sm text-amber-600 dark:text-amber-500">Complete identity verification to unlock all features.</p>
                        </div>
                      </div>
                    )}

                    {/* Verification Checklist */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Verification Steps</h4>

                      <div className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${verification?.terms_accepted ? 'border-green-500/30 bg-green-500/5' : 'border-border hover:border-primary/30'}`}>
                        <div className="flex items-center gap-3">
                          {verification?.terms_accepted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <h5 className="font-medium">Terms & Privacy Policy</h5>
                            <p className="text-sm text-muted-foreground">Accept our terms and privacy policy</p>
                          </div>
                        </div>
                        {verification?.terms_accepted ? (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Done</Badge>
                        ) : (
                          <Button size="sm" onClick={() => navigate("/onboarding")}>Accept</Button>
                        )}
                      </div>

                      <div className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${verification?.id_document_url ? 'border-green-500/30 bg-green-500/5' : 'border-border hover:border-primary/30'}`}>
                        <div className="flex items-center gap-3">
                          {verification?.id_document_url ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <FileCheck className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <h5 className="font-medium">Government ID</h5>
                            <p className="text-sm text-muted-foreground">Upload a valid government-issued photo ID</p>
                          </div>
                        </div>
                        {verification?.id_document_url ? (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Done</Badge>
                        ) : (
                          <Button size="sm" onClick={() => navigate("/verification")}>Upload</Button>
                        )}
                      </div>

                      <div className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${verification?.id_verified ? 'border-green-500/30 bg-green-500/5' : 'border-border hover:border-primary/30'}`}>
                        <div className="flex items-center gap-3">
                          {verification?.id_verified ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Camera className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <h5 className="font-medium">Selfie Verification</h5>
                            <p className="text-sm text-muted-foreground">Upload a selfie holding your ID</p>
                          </div>
                        </div>
                        {verification?.id_verified ? (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Done</Badge>
                        ) : verification?.id_document_url ? (
                          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>
                        ) : (
                          <Button size="sm" variant="outline" disabled>Upload ID First</Button>
                        )}
                      </div>

                      <div className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${verification?.background_check_status === 'verified' ? 'border-green-500/30 bg-green-500/5' : 'border-border hover:border-primary/30'}`}>
                        <div className="flex items-center gap-3">
                          {verification?.background_check_status === 'verified' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Shield className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <h5 className="font-medium">Background Check</h5>
                            <p className="text-sm text-muted-foreground">Optional verification for enhanced trust</p>
                          </div>
                        </div>
                        {verification?.background_check_status === 'verified' ? (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Done</Badge>
                        ) : verification?.background_check_status === 'pending' ? (
                          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => navigate("/verification")}>Request</Button>
                        )}
                      </div>
                    </div>

                    {/* CTA */}
                    {verification?.verification_status !== 'verified' && (
                      <div className="pt-4 border-t">
                        <Button className="w-full" size="lg" onClick={() => navigate("/verification")}>
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          {verification ? 'Complete Verification' : 'Start Verification'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Badges Tab */}
              <TabsContent value="badges" className="mt-6 space-y-6">
                {userId && <BadgeShowcase userId={userId} />}
                {userId && <CertificateManager userId={userId} isOwnProfile={true} />}
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-6">
                <AdvancedProfileSettings profile={profile} onUpdate={checkUserAndLoadProfile} />
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments" className="mt-6">
                {userRole === "task_giver" ? (
                  <PaymentMethodManager />
                ) : (
                  <PayoutAccountSetup />
                )}
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="mt-6 space-y-6">
                {userId && (
                  <>
                    <EnhancedSecurityDashboard userId={userId} />
                    <TwoFactorSetup userId={userId} />
                    <PrivacySettings userId={userId} profile={profile} onUpdate={checkUserAndLoadProfile} />
                    {/* <ProfileActivityTimeline userId={userId} /> */}

                    {/* Danger Zone */}
                    <Card className="border-destructive/30">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-destructive/10">
                            <Lock className="h-5 w-5 text-destructive" />
                          </div>
                          <div>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                            <CardDescription>Irreversible account actions</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 border border-destructive/30 rounded-lg bg-destructive/5">
                          <h5 className="font-semibold mb-2">Delete Account</h5>
                          <p className="text-sm text-muted-foreground mb-4">
                            Permanently delete your account and all data. This cannot be undone.
                          </p>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDeleteDialog(true)}
                          >
                            Delete Account
                          </Button>
                        </div>
                        <DeleteAccountDialog
                          open={showDeleteDialog}
                          onOpenChange={setShowDeleteDialog}
                          user={profile}
                        />
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
