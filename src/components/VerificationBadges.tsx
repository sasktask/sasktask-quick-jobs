import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, CheckCircle, Award, Star } from "lucide-react";

interface VerificationBadgesProps {
  verifiedByAdmin?: boolean;
  idVerified?: boolean;
  backgroundCheckStatus?: string;
  hasInsurance?: boolean;
  rating?: number;
  totalReviews?: number;
}

export const VerificationBadges = ({
  verifiedByAdmin,
  idVerified,
  backgroundCheckStatus,
  hasInsurance,
  rating,
  totalReviews,
}: VerificationBadgesProps) => {
  const badges = [];

  if (verifiedByAdmin) {
    badges.push({
      icon: <Shield className="h-3 w-3" />,
      label: "Admin Verified",
      description: "Verified by SaskTask administrators",
      variant: "default" as const,
    });
  }

  if (idVerified) {
    badges.push({
      icon: <CheckCircle className="h-3 w-3" />,
      label: "ID Verified",
      description: "Government ID verified",
      variant: "secondary" as const,
    });
  }

  if (backgroundCheckStatus === "verified") {
    badges.push({
      icon: <Shield className="h-3 w-3" />,
      label: "Background Checked",
      description: "Background check completed",
      variant: "secondary" as const,
    });
  }

  if (hasInsurance) {
    badges.push({
      icon: <Award className="h-3 w-3" />,
      label: "Insured",
      description: "Has liability insurance",
      variant: "secondary" as const,
    });
  }

  if (rating && rating >= 4.8 && totalReviews && totalReviews >= 10) {
    badges.push({
      icon: <Star className="h-3 w-3" />,
      label: "Top Rated",
      description: `${rating.toFixed(1)} rating with ${totalReviews}+ reviews`,
      variant: "default" as const,
    });
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant={badge.variant} className="gap-1">
                {badge.icon}
                {badge.label}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{badge.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};
