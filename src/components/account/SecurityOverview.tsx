import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  Key,
  Mail,
  Smartphone,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

interface SecurityOverviewProps {
  userId: string;
  onNavigateToSection?: (section: string) => void;
}

interface SecurityStatus {
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  lastPasswordChange: Date | null;
  securityNotifications: boolean;
  profileComplete: boolean;
}

export const SecurityOverview = ({ userId, onNavigateToSection }: SecurityOverviewProps) => {
  const [status, setStatus] = useState<SecurityStatus>({
    emailVerified: false,
    phoneVerified: false,
    twoFactorEnabled: false,
    lastPasswordChange: null,
    securityNotifications: true,
    profileComplete: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSecurityStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('two_factor_enabled, last_password_change, security_notifications_enabled, profile_completion, phone')
            .eq('id', userId)
            .single();

          setStatus({
            emailVerified: user.email_confirmed_at !== null,
            phoneVerified: !!user.phone_confirmed_at,
            twoFactorEnabled: profile?.two_factor_enabled || false,
            lastPasswordChange: profile?.last_password_change ? new Date(profile.last_password_change) : null,
            securityNotifications: profile?.security_notifications_enabled ?? true,
            profileComplete: (profile?.profile_completion || 0) >= 80,
          });
        }
      } catch (error) {
        console.error('Failed to fetch security status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSecurityStatus();
  }, [userId]);

  const calculateSecurityScore = (): number => {
    let score = 0;
    if (status.emailVerified) score += 25;
    if (status.lastPasswordChange) {
      const daysSinceChange = Math.floor((Date.now() - status.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceChange < 90) score += 25;
      else if (daysSinceChange < 180) score += 15;
    } else {
      score += 10; // Default score if never changed but account exists
    }
    if (status.securityNotifications) score += 25;
    if (status.profileComplete) score += 25;
    return score;
  };

  const securityScore = calculateSecurityScore();

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Strong';
    if (score >= 50) return 'Moderate';
    return 'Weak';
  };

  const securityItems = [
    {
      key: 'email',
      label: 'Email Verified',
      description: 'Your email address is verified',
      status: status.emailVerified,
      icon: Mail,
    },
    {
      key: 'password',
      label: 'Password Strength',
      description: status.lastPasswordChange 
        ? `Last changed ${Math.floor((Date.now() - status.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24))} days ago`
        : 'Consider updating your password regularly',
      status: status.lastPasswordChange !== null,
      icon: Key,
      action: 'Change Password',
      section: 'password',
    },
    {
      key: 'notifications',
      label: 'Security Notifications',
      description: 'Get alerts about unusual activity',
      status: status.securityNotifications,
      icon: ShieldCheck,
    },
    {
      key: 'profile',
      label: 'Complete Profile',
      description: 'A complete profile helps verify your identity',
      status: status.profileComplete,
      icon: Shield,
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Security Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Overview
        </CardTitle>
        <CardDescription>Your account security status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Security Score */}
        <div className="text-center space-y-2">
          <div className={`text-4xl font-bold ${getScoreColor(securityScore)}`}>
            {securityScore}%
          </div>
          <Badge variant={securityScore >= 80 ? 'default' : securityScore >= 50 ? 'secondary' : 'destructive'}>
            {getScoreLabel(securityScore)} Security
          </Badge>
          <Progress value={securityScore} className="h-2 mt-2" />
        </div>

        {/* Security Items */}
        <div className="space-y-3">
          {securityItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card"
              >
                <div className={`p-2 rounded-full ${item.status ? 'bg-green-100 dark:bg-green-950' : 'bg-yellow-100 dark:bg-yellow-950'}`}>
                  <Icon className={`h-4 w-4 ${item.status ? 'text-green-600' : 'text-yellow-600'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.status ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                {item.action && onNavigateToSection && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigateToSection(item.section!)}
                    className="text-primary"
                  >
                    {item.action}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Recommendations */}
        {securityScore < 100 && (
          <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
            <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
              <ShieldAlert className="h-4 w-4 text-primary" />
              Recommendations
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              {!status.emailVerified && (
                <li>• Verify your email address for account recovery</li>
              )}
              {!status.lastPasswordChange && (
                <li>• Set a strong password and update it regularly</li>
              )}
              {!status.securityNotifications && (
                <li>• Enable security notifications for suspicious activity alerts</li>
              )}
              {!status.profileComplete && (
                <li>• Complete your profile to build trust with other users</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
