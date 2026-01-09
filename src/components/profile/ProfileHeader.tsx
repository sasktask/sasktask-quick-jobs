import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BadgeCheck, Camera, MapPin, Calendar, Shield, Upload, Hash, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProfileHeaderProps {
  profile: any;
  userRole: string | null;
  verification: any;
  uploading: boolean;
  avatarUrl?: string;
  uploadStatus?: string | null;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileHeader = ({
  profile,
  userRole,
  verification,
  uploading,
  avatarUrl,
  uploadStatus,
  onPhotoUpload
}: ProfileHeaderProps) => {
  const [copied, setCopied] = useState(false);
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

  return (
    <div className="relative">
      {/* Cover Background */}
      <div className="h-32 sm:h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 rounded-t-xl" />
      
      {/* Profile Content */}
      <div className="px-6 pb-6">
        {/* Avatar - positioned to overlap cover */}
        <div className="relative -mt-16 sm:-mt-20 mb-4">
          <div className="relative inline-block">
            <Avatar className="h-28 w-28 sm:h-36 sm:w-36 border-4 border-background shadow-xl">
              <AvatarImage src={avatarUrl || profile?.avatar_url} className="object-cover" />
              <AvatarFallback className="text-3xl sm:text-4xl bg-primary/10 text-primary font-semibold">
                {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            
            {/* Verified Badge */}
            {isVerified && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute top-1 right-1 bg-blue-500 text-white p-1.5 rounded-full shadow-lg ring-2 ring-background">
                      <BadgeCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Verified Profile</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* Upload Button */}
            <label className="absolute bottom-1 right-1 bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-full cursor-pointer transition-all shadow-md hover:shadow-lg group">
              {uploading ? (
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="h-4 w-4 group-hover:scale-110 transition-transform" />
              )}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={onPhotoUpload}
                disabled={uploading}
              />
            </label>
          </div>
          {uploadStatus && (
            <p className="mt-1 text-xs text-muted-foreground">{uploadStatus}</p>
          )}
        </div>

        {/* Name and Info */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold">{profile?.full_name || "Complete Your Profile"}</h1>
            {isVerified && (
              <BadgeCheck className="h-6 w-6 text-blue-500 shrink-0" />
            )}
          </div>
          
          <p className="text-muted-foreground">{profile?.email}</p>
          
          {/* Meta Info Row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {profile?.user_id_number && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={copyUserId}
                      className="flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded-md font-mono font-medium text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      <Hash className="h-3.5 w-3.5" />
                      <span>{profile.user_id_number}</span>
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 opacity-60" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to copy User ID</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {profile?.city && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{profile.city}{profile.country ? `, ${profile.country}` : ''}</span>
              </div>
            )}
            {joinedDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Joined {format(new Date(joinedDate), 'MMM yyyy')}</span>
              </div>
            )}
          </div>

          {/* Role and Verification Badges */}
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="secondary" className="capitalize font-medium">
              {userRole?.replace("_", " ") || "Member"}
            </Badge>
            {verification?.id_verified && (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/15">
                <Shield className="h-3 w-3 mr-1" />
                ID Verified
              </Badge>
            )}
            {verification?.background_check_status === 'verified' && (
              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/15">
                <BadgeCheck className="h-3 w-3 mr-1" />
                Background Checked
              </Badge>
            )}
            {verification?.has_insurance && (
              <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/15">
                <Shield className="h-3 w-3 mr-1" />
                Insured
              </Badge>
            )}
          </div>

          {/* Bio */}
          {profile?.bio && (
            <p className="text-muted-foreground leading-relaxed pt-2 max-w-2xl">
              {profile.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
