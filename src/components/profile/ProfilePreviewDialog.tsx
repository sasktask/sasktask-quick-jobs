import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Eye, 
  Smartphone, 
  Monitor, 
  Tablet,
  Star,
  MapPin,
  Calendar,
  BadgeCheck,
  Shield,
  Briefcase,
  Clock,
  MessageSquare,
  Heart,
  Share2,
  ExternalLink,
  Award,
  TrendingUp,
  Users,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface ProfilePreviewDialogProps {
  profile: any;
  userRole: string | null;
  verification: any;
  trustScore: number;
  children?: React.ReactNode;
}

type DeviceView = 'desktop' | 'tablet' | 'mobile';

export const ProfilePreviewDialog = ({
  profile,
  userRole,
  verification,
  trustScore,
  children
}: ProfilePreviewDialogProps) => {
  const [open, setOpen] = useState(false);
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop');
  const [previewTab, setPreviewTab] = useState('overview');

  const isVerified = verification?.verification_status === 'verified';
  const joinedDate = profile?.joined_date || profile?.created_at;
  const coverPhotoUrl = profile?.id 
    ? localStorage.getItem(`cover_photo_${profile.id}`) 
    : null;

  const getDeviceWidth = () => {
    switch (deviceView) {
      case 'mobile': return 'max-w-[375px]';
      case 'tablet': return 'max-w-[768px]';
      default: return 'max-w-full';
    }
  };

  const deviceIcons = [
    { id: 'desktop' as DeviceView, icon: Monitor, label: 'Desktop' },
    { id: 'tablet' as DeviceView, icon: Tablet, label: 'Tablet' },
    { id: 'mobile' as DeviceView, icon: Smartphone, label: 'Mobile' },
  ];

  const stats = [
    { label: 'Rating', value: profile?.rating?.toFixed(1) || '0.0', icon: Star, color: 'text-yellow-500' },
    { label: 'Reviews', value: profile?.total_reviews || 0, icon: Users, color: 'text-blue-500' },
    { label: 'Completed', value: profile?.completed_tasks || 0, icon: Briefcase, color: 'text-green-500' },
    { label: 'Response', value: `${profile?.response_rate || 100}%`, icon: Clock, color: 'text-purple-500' },
  ];

  const skills = profile?.skills || [];
  const hasInsurance = verification?.has_insurance;
  const hasBackgroundCheck = verification?.background_check_status === 'verified';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Profile Preview
              </DialogTitle>
              <DialogDescription>
                See how your profile appears to other users
              </DialogDescription>
            </div>
            
            {/* Device Selector */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              {deviceIcons.map(({ id, icon: Icon, label }) => (
                <Button
                  key={id}
                  variant={deviceView === id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDeviceView(id)}
                  className="gap-1.5"
                  aria-label={`View as ${label}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </div>
        </DialogHeader>

        <Separator className="mt-4" />

        {/* Preview Content */}
        <ScrollArea className="h-[calc(90vh-120px)]">
          <div className="p-4 flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={deviceView}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`w-full ${getDeviceWidth()} mx-auto`}
              >
                {/* Preview Frame */}
                <div className={`bg-background border rounded-xl shadow-lg overflow-hidden ${
                  deviceView === 'mobile' ? 'rounded-3xl border-4 border-foreground/10' : ''
                }`}>
                  {/* Cover Photo */}
                  <div 
                    className={`relative overflow-hidden ${
                      deviceView === 'mobile' ? 'h-28' : 'h-36 sm:h-44'
                    }`}
                    style={{
                      background: coverPhotoUrl 
                        ? `url(${coverPhotoUrl}) center/cover no-repeat`
                        : 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.2))'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/60" />
                  </div>

                  {/* Profile Content */}
                  <div className={`px-4 ${deviceView === 'mobile' ? 'px-3' : 'sm:px-6'} pb-6`}>
                    {/* Avatar */}
                    <div className={`relative ${deviceView === 'mobile' ? '-mt-12' : '-mt-16'} mb-4`}>
                      <Avatar className={`${
                        deviceView === 'mobile' ? 'h-20 w-20' : 'h-28 w-28'
                      } border-4 border-background shadow-xl`}>
                        <AvatarImage src={profile?.avatar_url} className="object-cover" />
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                          {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      {isVerified && (
                        <div className="absolute top-0 right-0 bg-blue-500 text-white p-1 rounded-full shadow-lg">
                          <BadgeCheck className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    {/* Name & Info */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h2 className={`font-bold flex items-center gap-2 ${
                            deviceView === 'mobile' ? 'text-xl' : 'text-2xl'
                          }`}>
                            {profile?.full_name || "User Name"}
                            {isVerified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                          </h2>
                          <p className="text-sm text-muted-foreground capitalize">
                            {userRole?.replace("_", " ") || "Member"}
                          </p>
                        </div>
                        
                        {/* Action Buttons (Preview Only) */}
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" disabled className="gap-1">
                            <Heart className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" disabled className="gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {deviceView !== 'mobile' && <span>Message</span>}
                          </Button>
                        </div>
                      </div>

                      {/* Location & Join Date */}
                      <div className={`flex flex-wrap gap-3 text-sm text-muted-foreground ${
                        deviceView === 'mobile' ? 'text-xs' : ''
                      }`}>
                        {profile?.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {profile.city}{profile.country ? `, ${profile.country}` : ''}
                          </span>
                        )}
                        {joinedDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Joined {format(new Date(joinedDate), 'MMM yyyy')}
                          </span>
                        )}
                      </div>

                      {/* Trust Badges */}
                      <div className="flex flex-wrap gap-2">
                        {isVerified && (
                          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                            <BadgeCheck className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {hasBackgroundCheck && (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Background Check
                          </Badge>
                        )}
                        {hasInsurance && (
                          <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                            <Shield className="h-3 w-3 mr-1" />
                            Insured
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Stats Grid */}
                    <div className={`grid gap-3 ${
                      deviceView === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'
                    }`}>
                      {stats.map((stat) => (
                        <Card key={stat.label} className="bg-muted/30">
                          <CardContent className="p-3 text-center">
                            <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                            <p className="font-bold text-lg">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Trust Score */}
                    <Card className="mt-4 bg-gradient-to-r from-primary/5 to-accent/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <span className="font-medium">Trust Score</span>
                          </div>
                          <span className="text-2xl font-bold text-primary">{trustScore}/100</span>
                        </div>
                        <Progress value={trustScore} className="h-2" />
                      </CardContent>
                    </Card>

                    {/* Bio */}
                    {profile?.bio && (
                      <div className="mt-4">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          About
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {profile.bio}
                        </p>
                      </div>
                    )}

                    {/* Skills */}
                    {skills.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {skills.slice(0, deviceView === 'mobile' ? 4 : 8).map((skill: string, i: number) => (
                            <Badge key={i} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                          {skills.length > (deviceView === 'mobile' ? 4 : 8) && (
                            <Badge variant="outline">
                              +{skills.length - (deviceView === 'mobile' ? 4 : 8)} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Preview Notice */}
                    <div className="mt-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        This is a preview of how others see your profile
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Profile is {profile?.full_name ? 'complete' : 'incomplete'}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(`/profile/${profile?.id}`, '_blank')}
              className="gap-1.5"
            >
              <ExternalLink className="h-4 w-4" />
              View Public Page
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/profile/${profile?.id}`);
              }}
              className="gap-1.5"
            >
              <Share2 className="h-4 w-4" />
              Copy Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};