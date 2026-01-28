import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { UberStyleProfilePhoto } from "@/components/profile/UberStyleProfilePhoto";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().optional(),
  city: z.string().optional(),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  skills: z.string().optional(),
  hourly_rate: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileSettingsProps {
  user: any;
}

export const ProfileSettings = ({ user }: ProfileSettingsProps) => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [photoVerificationStatus, setPhotoVerificationStatus] = useState<"none" | "pending" | "verified" | "rejected">("none");

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Prefer profile flag if present; fall back to auth metadata
  const isPhoneVerified = Boolean((profile as any)?.phone_verified ?? user?.user_metadata?.phone_verified);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      // Fetch profile and verification status
      const [profileResult, verificationResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single(),
        supabase
          .from("verifications")
          .select("photo_verification_status")
          .eq("user_id", user.id)
          .single()
      ]);

      if (profileResult.error) throw profileResult.error;

      setProfile(profileResult.data);
      
      // Set photo verification status
      if (verificationResult.data?.photo_verification_status) {
        setPhotoVerificationStatus(
          verificationResult.data.photo_verification_status as "none" | "pending" | "verified" | "rejected"
        );
      } else {
        setPhotoVerificationStatus("none");
      }

      reset({
        full_name: profileResult.data.full_name || "",
        phone: profileResult.data.phone || "",
        city: profileResult.data.city || "",
        bio: profileResult.data.bio || "",
        skills: profileResult.data.skills?.join(", ") || "",
        hourly_rate: profileResult.data.hourly_rate?.toString() || "",
        website: profileResult.data.website || "",
        linkedin: profileResult.data.linkedin || "",
        twitter: profileResult.data.twitter || "",
        facebook: profileResult.data.facebook || "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      const updateData: any = {
        full_name: data.full_name,
        city: data.city,
        bio: data.bio,
        website: data.website || null,
        linkedin: data.linkedin || null,
        twitter: data.twitter || null,
        facebook: data.facebook || null,
      };

      // Do not allow changing phone once verified
      if (!isPhoneVerified) {
        updateData.phone = data.phone;
      }

      // Parse skills if provided
      if (data.skills) {
        updateData.skills = data.skills.split(",").map(s => s.trim()).filter(Boolean);
      }

      // Parse hourly rate if provided
      if (data.hourly_rate) {
        updateData.hourly_rate = parseFloat(data.hourly_rate);
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      loadProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Uber-Style Profile Photo Section */}
      <UberStyleProfilePhoto
        userId={user.id}
        currentPhotoUrl={profile?.avatar_url || null}
        isPhotoVerified={(profile as any)?.photo_verified || false}
        verificationStatus={photoVerificationStatus}
        onPhotoUpdated={loadProfile}
      />

      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Profile Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                {...register("full_name")}
                placeholder="Your full name"
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+1 (555) 123-4567"
                disabled={isPhoneVerified}
                className={isPhoneVerified ? "bg-muted/70 cursor-not-allowed" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
              {isPhoneVerified && (
                <p className="text-xs text-muted-foreground">
                  Phone number is locked after verification.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City / Location</Label>
              <Input
                id="city"
                {...register("city")}
                placeholder="e.g., Saskatoon, SK"
              />
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Short Bio</Label>
              <textarea
                id="bio"
                {...register("bio")}
                placeholder="Tell us about yourself..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                maxLength={500}
              />
              {errors.bio && (
                <p className="text-sm text-destructive">{errors.bio.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                {...register("skills")}
                placeholder="e.g., Plumbing, Electrical, Moving"
              />
              {errors.skills && (
                <p className="text-sm text-destructive">{errors.skills.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                List your skills to help clients find you
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Hourly Rate (CAD)</Label>
              <Input
                id="hourly_rate"
                type="number"
                {...register("hourly_rate")}
                placeholder="e.g., 25"
                min="0"
                step="0.01"
              />
              {errors.hourly_rate && (
                <p className="text-sm text-destructive">{errors.hourly_rate.message}</p>
              )}
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Social Media & Links</h3>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  {...register("website")}
                  placeholder="https://yourwebsite.com"
                />
                {errors.website && (
                  <p className="text-sm text-destructive">{errors.website.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input
                  id="linkedin"
                  {...register("linkedin")}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter / X Profile</Label>
                <Input
                  id="twitter"
                  {...register("twitter")}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook Profile</Label>
                <Input
                  id="facebook"
                  {...register("facebook")}
                  placeholder="https://facebook.com/yourprofile"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
