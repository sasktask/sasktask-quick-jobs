import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, Shield, MapPin, Briefcase, Award, TrendingUp, 
  CheckCircle, Clock, MessageSquare, Calendar, Zap,
  ThumbsUp, Users
} from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { motion } from "framer-motion";

interface EnhancedTaskerCardProps {
  tasker: {
    id: string;
    full_name: string;
    avatar_url?: string;
    bio?: string;
    skills?: string[];
    rating?: number;
    total_reviews?: number;
    completed_tasks?: number;
    hourly_rate?: number;
    city?: string;
    reputation_score?: number;
    response_rate?: number;
    is_online?: boolean;
    verifications?: {
      verification_status?: string;
      id_verified?: boolean;
      background_check_status?: string;
      has_insurance?: boolean;
    };
    badgeCount?: number;
  };
  currentUserId?: string;
  onHire?: (taskerId: string) => void;
  index?: number;
}

export const EnhancedTaskerCard = ({ 
  tasker, 
  currentUserId, 
  onHire,
  index = 0
}: EnhancedTaskerCardProps) => {
  const navigate = useNavigate();
  const isVerified = tasker.verifications?.verification_status === "verified";
  const isElite = (tasker.reputation_score || 0) > 80;

  const handleViewProfile = () => {
    navigate(`/profile/${tasker.id}`);
  };

  const handleHire = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onHire) {
      onHire(tasker.id);
    } else {
      navigate('/post-task', {
        state: {
          prefillData: {
            preferred_tasker_id: tasker.id,
            preferred_tasker_name: tasker.full_name
          }
        }
      });
    }
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/messages?contact=${tasker.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card 
        className="group cursor-pointer relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-2xl hover:border-primary/30 transition-all duration-500"
        onClick={handleViewProfile}
      >
        {/* Elite Gradient Border */}
        {isElite && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}

        {/* Status Badges */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          {tasker.is_online && (
            <Badge className="bg-green-500/90 text-white text-xs gap-1 animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full" />
              Online
            </Badge>
          )}
          {isElite && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs gap-1">
              <Zap className="h-3 w-3" />
              Elite
            </Badge>
          )}
        </div>

        <CardContent className="p-6 relative">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <div className={`absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 blur transition-opacity ${isElite ? "opacity-50" : ""}`} />
              <Avatar className="relative h-20 w-20 border-2 border-background">
                <AvatarImage
                  src={tasker.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tasker.full_name}`}
                  alt={tasker.full_name}
                />
                <AvatarFallback className="text-2xl bg-primary/10">
                  {tasker.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {tasker.is_online && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-background rounded-full flex items-center justify-center">
                  <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold truncate text-foreground group-hover:text-primary transition-colors">
                  {tasker.full_name}
                </h3>
                {isVerified && (
                  <Shield className="h-5 w-5 text-primary shrink-0" />
                )}
              </div>

              {/* Rating */}
              {tasker.rating && tasker.rating > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-bold text-sm text-foreground">{tasker.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-foreground/70">
                    ({tasker.total_reviews || 0} reviews)
                  </span>
                </div>
              )}

              {/* Location */}
              {tasker.city && (
                <div className="flex items-center gap-1 text-sm text-foreground/70">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{tasker.city}</span>
                </div>
              )}
            </div>

            {/* Favorite Button */}
            {currentUserId && currentUserId !== tasker.id && (
              <div onClick={(e) => e.stopPropagation()}>
                <FavoriteButton taskerId={tasker.id} />
              </div>
            )}
          </div>

          {/* Bio */}
          {tasker.bio && (
            <p className="text-sm text-foreground/70 mb-4 line-clamp-2 group-hover:text-foreground/90 transition-colors">
              {tasker.bio}
            </p>
          )}

          {/* Skills */}
          {tasker.skills && tasker.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tasker.skills.slice(0, 3).map((skill: string, idx: number) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className="text-xs bg-primary/5 hover:bg-primary/10 transition-colors"
                >
                  {skill}
                </Badge>
              ))}
              {tasker.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tasker.skills.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-y border-border">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-foreground/60 mb-1">
                <Briefcase className="h-3.5 w-3.5" />
              </div>
              <p className="font-bold text-sm text-foreground">{tasker.completed_tasks || 0}</p>
              <p className="text-xs text-foreground/60 font-medium">Tasks</p>
            </div>
            <div className="text-center border-x border-border">
              <div className="flex items-center justify-center gap-1 text-foreground/60 mb-1">
                <ThumbsUp className="h-3.5 w-3.5" />
              </div>
              <p className="font-bold text-sm text-foreground">{tasker.response_rate || 95}%</p>
              <p className="text-xs text-foreground/60 font-medium">Response</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-foreground/60 mb-1">
                <Award className="h-3.5 w-3.5" />
              </div>
              <p className="font-bold text-sm text-foreground">{tasker.badgeCount || 0}</p>
              <p className="text-xs text-foreground/60 font-medium">Badges</p>
            </div>
          </div>

          {/* Verification Badges */}
          {isVerified && (
            <div className="flex flex-wrap gap-3 mb-4">
              {tasker.verifications?.id_verified && (
                <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>ID Verified</span>
                </div>
              )}
              {tasker.verifications?.background_check_status === "verified" && (
                <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Background Check</span>
                </div>
              )}
              {tasker.verifications?.has_insurance && (
                <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Insured</span>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {tasker.hourly_rate ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-primary">
                    ${tasker.hourly_rate}
                  </span>
                  <span className="text-sm text-foreground/70 font-medium">/hr</span>
                </div>
              ) : (
                <span className="text-sm text-foreground/70 font-medium">Contact for rate</span>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleMessage}
                className="gap-1 rounded-xl hover:bg-primary/10 hover:border-primary"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                onClick={handleHire}
                className="gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                <Calendar className="h-4 w-4" />
                Hire Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
