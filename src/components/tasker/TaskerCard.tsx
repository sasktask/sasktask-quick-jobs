import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, Shield, MapPin, Briefcase, Award, TrendingUp, 
  CheckCircle, Clock, MessageSquare, Calendar
} from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";

interface TaskerCardProps {
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
  showHireButton?: boolean;
  onHire?: (taskerId: string) => void;
}

export const TaskerCard = ({ 
  tasker, 
  currentUserId, 
  showHireButton = true,
  onHire 
}: TaskerCardProps) => {
  const navigate = useNavigate();
  const isVerified = tasker.verifications?.verification_status === "verified";

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
    <Card 
      className="hover:shadow-lg transition-all duration-300 border-border group cursor-pointer relative overflow-hidden"
      onClick={handleViewProfile}
    >
      {/* Online Status Indicator */}
      {tasker.is_online && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="default" className="bg-green-500 text-white text-xs animate-pulse">
            <Clock className="h-3 w-3 mr-1" />
            Online Now
          </Badge>
        </div>
      )}

      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <Avatar className="h-20 w-20 border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
              <AvatarImage
                src={tasker.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tasker.full_name}`}
                alt={tasker.full_name}
              />
              <AvatarFallback className="text-2xl">
                {tasker.full_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {tasker.is_online && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-background rounded-full" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold truncate">{tasker.full_name}</h3>
              {isVerified && (
                <Shield className="h-5 w-5 text-primary shrink-0" />
              )}
            </div>

            {tasker.rating && tasker.rating > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{tasker.rating.toFixed(1)}</span>
                <span className="text-muted-foreground text-sm">
                  ({tasker.total_reviews || 0} reviews)
                </span>
              </div>
            )}

            {tasker.city && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <MapPin className="h-3.5 w-3.5" />
                <span>{tasker.city}</span>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                <Briefcase className="h-3 w-3 mr-1" />
                {tasker.completed_tasks || 0} tasks
              </Badge>
              {tasker.badgeCount && tasker.badgeCount > 0 && (
                <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                  <Award className="h-3 w-3 mr-1" />
                  {tasker.badgeCount} badges
                </Badge>
              )}
              {tasker.reputation_score && tasker.reputation_score > 70 && (
                <Badge variant="default" className="text-xs bg-gradient-to-r from-primary to-secondary">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Top Rated
                </Badge>
              )}
            </div>
          </div>

          {/* Favorite Button */}
          {currentUserId && currentUserId !== tasker.id && (
            <div onClick={(e) => e.stopPropagation()}>
              <FavoriteButton taskerId={tasker.id} />
            </div>
          )}
        </div>

        {tasker.bio && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{tasker.bio}</p>
        )}

        {/* Skills */}
        {tasker.skills && tasker.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tasker.skills.slice(0, 4).map((skill: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {tasker.skills.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{tasker.skills.length - 4} more
              </Badge>
            )}
          </div>
        )}

        {/* Verification Badges */}
        {isVerified && (
          <div className="flex flex-wrap gap-2 mb-4 text-xs">
            {tasker.verifications?.id_verified && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>ID Verified</span>
              </div>
            )}
            {tasker.verifications?.background_check_status === "verified" && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Background Check</span>
              </div>
            )}
            {tasker.verifications?.has_insurance && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Insured</span>
              </div>
            )}
          </div>
        )}

        {/* Hourly Rate & Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            {tasker.hourly_rate ? (
              <div>
                <span className="text-2xl font-bold text-primary">${tasker.hourly_rate}</span>
                <span className="text-sm text-muted-foreground">/hr</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Rate varies by task</span>
            )}
            {tasker.response_rate && tasker.response_rate >= 90 && (
              <p className="text-xs text-muted-foreground">
                {tasker.response_rate}% response rate
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleMessage}
              className="gap-1"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            {showHireButton && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleHire}
                className="gap-1"
              >
                <Calendar className="h-4 w-4" />
                Hire
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
