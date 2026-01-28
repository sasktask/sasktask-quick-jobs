import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BadgeCheck, Camera, MapPin, Calendar, Shield, Hash, Copy, Check, ImagePlus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { VerificationStatusIndicator } from "@/components/VerificationStatusIndicator";
import { supabase } from "@/integrations/supabase/client";

interface ProfileHeaderProps {
  profile: any;
  userRole: string | null;
  verification: any;
  uploading: boolean;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverPhotoChange?: (url: string) => void;
}

export const ProfileHeader = ({
  profile,
  userRole,
  verification,
  uploading,
  onPhotoUpload,
  onCoverPhotoChange
}: ProfileHeaderProps) => {
  const [copied, setCopied] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isVerified = verification?.verification_status === 'verified';
  const joinedDate = profile?.joined_date || profile?.created_at;

  const copyUserId = async () => {
    if (profile?.user_id_number) {
      await navigator.clipboard.writeText(profile.user_id_number);
      setCopied(true);
      toast({ title: "Copied!", description: "User ID copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ 
        title: "Invalid file type", 
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: "File too large", 
        description: "Please upload an image under 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploadingCover(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/cover-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Update profile with cover photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: profile.avatar_url }) // Keep avatar, we'll store cover in localStorage for now
        .eq('id', profile.id);

      // Store cover photo URL in localStorage (until we add a cover_photo_url column)
      localStorage.setItem(`cover_photo_${profile.id}`, publicUrl);
      
      onCoverPhotoChange?.(publicUrl);
      
      toast({ 
        title: "Cover photo updated!", 
        description: "Your cover photo has been changed successfully" 
      });

      // Force re-render
      window.location.reload();
    } catch (error: any) {
      console.error('Cover upload error:', error);
      toast({ 
        title: "Upload failed", 
        description: error.message || "Failed to upload cover photo",
        variant: "destructive"
      });
    } finally {
      setUploadingCover(false);
    }
  };

  // Get cover photo from localStorage
  const coverPhotoUrl = profile?.id 
    ? localStorage.getItem(`cover_photo_${profile.id}`) 
    : null;

  return (
    <div className="relative" role="banner" aria-label="Profile header">
      {/* Cover Photo */}
      <div 
        className="h-36 sm:h-48 md:h-56 rounded-t-xl relative overflow-hidden group"
        style={{
          background: coverPhotoUrl 
            ? `url(${coverPhotoUrl}) center/cover no-repeat`
            : 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.2))'
        }}
        role="img"
        aria-label={coverPhotoUrl ? "Profile cover photo" : "Default gradient background"}
      >
        {/* Overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60" />
        
        {/* Cover Photo Upload Button */}
        <input
          ref={coverInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleCoverPhotoUpload}
          disabled={uploadingCover}
          aria-label="Upload cover photo"
        />
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity gap-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                aria-label="Change cover photo"
              >
                {uploadingCover ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="hidden sm:inline">
                  {uploadingCover ? 'Uploading...' : 'Change Cover'}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upload a cover photo (max 5MB)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Keyboard accessible indicator */}
        <div className="absolute bottom-2 right-2 text-xs text-white/70 bg-black/30 px-2 py-1 rounded opacity-0 group-focus-within:opacity-100 transition-opacity">
          Press Enter to change cover
        </div>
      </div>
      
      {/* Profile Content */}
      <div className="px-4 sm:px-6 pb-6">
        {/* Avatar - positioned to overlap cover */}
        <div className="relative -mt-16 sm:-mt-20 mb-4">
          <div className="relative inline-block">
            <Avatar 
              className="h-28 w-28 sm:h-36 sm:w-36 border-4 border-background shadow-xl ring-2 ring-primary/10"
              role="img"
              aria-label={`Profile photo of ${profile?.full_name || 'user'}`}
            >
              <AvatarImage 
                src={profile?.avatar_url} 
                className="object-cover" 
                alt={`${profile?.full_name || 'User'}'s profile photo`}
              />
              <AvatarFallback 
                className="text-3xl sm:text-4xl bg-primary/10 text-primary font-semibold"
                aria-label={`${profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'} avatar placeholder`}
              >
                {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            
            {/* Verified Badge */}
            {isVerified && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="absolute top-1 right-1 bg-blue-500 text-white p-1.5 rounded-full shadow-lg ring-2 ring-background"
                      role="status"
                      aria-label="Verified profile"
                    >
                      <BadgeCheck className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Verified Profile</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* Upload Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <label 
                    className="absolute bottom-1 right-1 bg-primary hover:bg-primary/90 text-primary-foreground p-2.5 rounded-full cursor-pointer transition-all shadow-md hover:shadow-lg group focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                    tabIndex={0}
                    role="button"
                    aria-label="Upload profile photo"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        (e.currentTarget.querySelector('input') as HTMLInputElement)?.click();
                      }
                    }}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Camera className="h-4 w-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
                    )}
                    <input 
                      type="file" 
                      className="sr-only" 
                      accept="image/*" 
                      onChange={onPhotoUpload}
                      disabled={uploading}
                      aria-label="Choose profile photo file"
                    />
                    <span className="sr-only">Upload profile photo</span>
                  </label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Change profile photo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Name and Info */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold" id="profile-name">
              {profile?.full_name || "Complete Your Profile"}
            </h1>
            {isVerified && (
              <BadgeCheck 
                className="h-6 w-6 text-blue-500 shrink-0" 
                aria-label="Verified"
              />
            )}
          </div>
          
          <p className="text-muted-foreground" aria-label="Email address">
            {profile?.email}
          </p>
          
          {/* Meta Info Row */}
          <div 
            className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground"
            role="list"
            aria-label="Profile details"
          >
            {profile?.user_id_number && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={copyUserId}
                      className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1.5 rounded-md font-mono font-medium text-primary hover:bg-primary/20 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      aria-label={`User ID: ${profile.user_id_number}. Click to copy`}
                      role="listitem"
                    >
                      <Hash className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{profile.user_id_number}</span>
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copied ? 'Copied!' : 'Click to copy User ID'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {profile?.city && (
              <div 
                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50"
                role="listitem"
                aria-label={`Location: ${profile.city}${profile.country ? `, ${profile.country}` : ''}`}
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>{profile.city}{profile.country ? `, ${profile.country}` : ''}</span>
              </div>
            )}
            {joinedDate && (
              <div 
                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50"
                role="listitem"
                aria-label={`Member since ${format(new Date(joinedDate), 'MMMM yyyy')}`}
              >
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <span>Joined {format(new Date(joinedDate), 'MMM yyyy')}</span>
              </div>
            )}
          </div>

          {/* Role Badge */}
          <div 
            className="flex flex-wrap gap-2 pt-1"
            role="list"
            aria-label="User badges and status"
          >
            <Badge 
              variant="secondary" 
              className="capitalize font-medium text-sm px-3 py-1"
              role="listitem"
            >
              {userRole?.replace("_", " ") || "Member"}
            </Badge>
            {verification?.background_check_status === 'verified' && (
              <Badge 
                className="bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/15 px-3 py-1"
                role="listitem"
              >
                <BadgeCheck className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                Background Checked
              </Badge>
            )}
            {verification?.has_insurance && (
              <Badge 
                className="bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/15 px-3 py-1"
                role="listitem"
              >
                <Shield className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                Insured
              </Badge>
            )}
          </div>

          {/* Verification Status Indicator */}
          {profile?.id && (
            <div className="pt-2">
              <VerificationStatusIndicator userId={profile.id} onlyBadges />
            </div>
          )}

          {/* Bio */}
          {profile?.bio && (
            <p 
              className="text-muted-foreground leading-relaxed pt-2 max-w-2xl"
              aria-label="About me"
            >
              {profile.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};