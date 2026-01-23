import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, 
  Phone, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ChevronRight,
  Award,
  Mail
} from "lucide-react";

interface VerificationStatusIndicatorProps {
  userId: string;
  showCard?: boolean;
  compact?: boolean;
  onlyBadges?: boolean;
}

interface VerificationStatus {
  emailVerified: boolean;
  paymentVerified: boolean;
  idVerified: boolean;
  phoneVerified: boolean;
}

export const VerificationStatusIndicator = ({ 
  userId, 
  showCard = true, 
  compact = false,
  onlyBadges = false 
}: VerificationStatusIndicatorProps) => {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchVerificationStatus();
    }
  }, [userId]);

  const fetchVerificationStatus = async () => {
    try {
      // Get current session to check email confirmation
      const { data: { session } } = await supabase.auth.getSession();
      const emailVerified = !!session?.user?.email_confirmed_at;

      // Fetch payment verification and admin verification from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("payment_verified, phone, verified_by_admin")
        .eq("id", userId)
        .maybeSingle();

      // If admin verified, all verifications are considered complete
      const isAdminVerified = !!(profile as any)?.verified_by_admin;

      // Fetch ID verification
      const { data: verification } = await supabase
        .from("verifications")
        .select("id_verified")
        .eq("user_id", userId)
        .maybeSingle();

      // Check phone verification
      let phoneVerified = false;
      if (profile?.phone) {
        const { count } = await supabase
          .from("phone_verifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("phone", profile.phone)
          .not("verified_at", "is", null);
        phoneVerified = !!count && count > 0;
      }

      // Admin verification unlocks all verifications
      setStatus({
        emailVerified: isAdminVerified || emailVerified,
        paymentVerified: isAdminVerified || !!(profile as any)?.payment_verified,
        idVerified: isAdminVerified || !!verification?.id_verified,
        phoneVerified: isAdminVerified || phoneVerified
      });
    } catch (error) {
      console.error("Error fetching verification status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!status) return null;

  const verifications = [
    { 
      key: 'email', 
      label: 'Email', 
      verified: status.emailVerified, 
      icon: Mail,
      description: 'Email address verified',
      link: '/account?tab=security'
    },
    { 
      key: 'payment', 
      label: 'Payment', 
      verified: status.paymentVerified, 
      icon: CreditCard,
      description: 'Payment method verified',
      link: '/account?tab=billing'
    },
    { 
      key: 'id', 
      label: 'ID', 
      verified: status.idVerified, 
      icon: Shield,
      description: 'Identity verified',
      link: '/verification'
    },
    { 
      key: 'phone', 
      label: 'Phone', 
      verified: status.phoneVerified, 
      icon: Phone,
      description: 'Phone number verified',
      link: '/profile?tab=profile'
    },
  ];

  const completedCount = verifications.filter(v => v.verified).length;
  const progress = (completedCount / verifications.length) * 100;
  const isFullyVerified = completedCount === verifications.length;

  // Only badges view for compact display
  if (onlyBadges) {
    return (
      <TooltipProvider>
        <div className="flex flex-wrap gap-1.5">
          {verifications.map((v) => (
            <Tooltip key={v.key}>
              <TooltipTrigger asChild>
                <Badge 
                  variant={v.verified ? "default" : "outline"}
                  className={v.verified 
                    ? "bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20" 
                    : "text-muted-foreground"
                  }
                >
                  <v.icon className="h-3 w-3 mr-1" />
                  {v.label}
                  {v.verified && <CheckCircle className="h-3 w-3 ml-1" />}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{v.verified ? v.description : `${v.label} not verified`}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    );
  }

  // Compact inline view
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {verifications.map((v) => (
            <TooltipProvider key={v.key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={`p-1.5 rounded-full ${
                      v.verified 
                        ? 'bg-green-500/10 text-green-600' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <v.icon className="h-4 w-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{v.verified ? v.description : `${v.label} not verified`}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {completedCount}/{verifications.length} verified
        </span>
      </div>
    );
  }

  // Full card view
  if (!showCard) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Verification Status
          </h3>
          {isFullyVerified && (
            <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              Fully Verified
            </Badge>
          )}
        </div>
        
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground">
          {completedCount} of {verifications.length} verifications complete
        </p>

        <div className="space-y-2">
          {verifications.map((v) => (
            <div 
              key={v.key}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                v.verified 
                  ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' 
                  : 'bg-muted/50 border-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  v.verified 
                    ? 'bg-green-500/20 text-green-600' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <v.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{v.label} Verification</p>
                  <p className="text-sm text-muted-foreground">
                    {v.verified ? v.description : 'Not verified yet'}
                  </p>
                </div>
              </div>
              {v.verified ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Button variant="ghost" size="sm" asChild>
                  <Link to={v.link}>
                    Verify <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className={isFullyVerified ? "border-green-500/30" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Verification Status
          </CardTitle>
          {isFullyVerified && (
            <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              Fully Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {completedCount} of {verifications.length} complete
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-2">
          {verifications.map((v) => (
            <div 
              key={v.key}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                v.verified 
                  ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' 
                  : 'bg-muted/50 border-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  v.verified 
                    ? 'bg-green-500/20 text-green-600' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <v.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{v.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {v.verified ? v.description : 'Not verified'}
                  </p>
                </div>
              </div>
              {v.verified ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link to={v.link}>Verify</Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Hook for checking verification status
export const useVerificationStatus = (userId: string | null) => {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        // Get current session to check email confirmation
        const { data: { session } } = await supabase.auth.getSession();
        const emailVerified = !!session?.user?.email_confirmed_at;

        const { data: profile } = await supabase
          .from("profiles")
          .select("payment_verified, phone, verified_by_admin")
          .eq("id", userId)
          .maybeSingle();

        // If admin verified, all verifications are considered complete
        const isAdminVerified = !!(profile as any)?.verified_by_admin;

        const { data: verification } = await supabase
          .from("verifications")
          .select("id_verified")
          .eq("user_id", userId)
          .maybeSingle();

        let phoneVerified = false;
        if (profile?.phone) {
          const { count } = await supabase
            .from("phone_verifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("phone", profile.phone)
            .not("verified_at", "is", null);
          phoneVerified = !!count && count > 0;
        }

        // Admin verification unlocks all verifications
        setStatus({
          emailVerified: isAdminVerified || emailVerified,
          paymentVerified: isAdminVerified || !!(profile as any)?.payment_verified,
          idVerified: isAdminVerified || !!verification?.id_verified,
          phoneVerified: isAdminVerified || phoneVerified
        });
      } catch (error) {
        console.error("Error fetching verification status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [userId]);

  return { 
    ...status, 
    isLoading,
    isFullyVerified: status ? status.emailVerified && status.paymentVerified && status.idVerified && status.phoneVerified : false
  };
};
