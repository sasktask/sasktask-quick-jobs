import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Mail,
  Phone,
  CreditCard,
  UserCheck,
  Camera,
  ArrowRight
} from 'lucide-react';
import { useFullVerification, FullVerificationStatus } from '@/hooks/useFullVerification';

interface VerificationGateProps {
  userId: string | null;
  children: React.ReactNode;
  requiredFor: 'post_task' | 'place_bid' | 'accept_task' | 'start_work';
  variant?: 'inline' | 'card' | 'overlay';
  showProgress?: boolean;
}

const actionLabels: Record<string, string> = {
  post_task: 'post tasks',
  place_bid: 'place bids',
  accept_task: 'accept tasks',
  start_work: 'start work',
};

const VerificationItem = ({ 
  label, 
  verified, 
  icon: Icon 
}: { 
  label: string; 
  verified: boolean; 
  icon: React.ElementType;
}) => (
  <div className="flex items-center gap-2 text-sm">
    <Icon className={`h-4 w-4 ${verified ? 'text-green-500' : 'text-muted-foreground'}`} />
    <span className={verified ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
    {verified ? (
      <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
    ) : (
      <XCircle className="h-4 w-4 text-destructive ml-auto" />
    )}
  </div>
);

const VerificationChecklist = ({ status }: { status: FullVerificationStatus }) => (
  <div className="space-y-2">
    <VerificationItem label="Email Verified" verified={status.emailVerified} icon={Mail} />
    <VerificationItem label="Phone Verified" verified={status.phoneVerified} icon={Phone} />
    <VerificationItem label="ID Document" verified={status.idVerified} icon={UserCheck} />
    <VerificationItem label="Payment Method" verified={status.paymentVerified} icon={CreditCard} />
    <VerificationItem label="Profile Photo" verified={status.photoVerified} icon={Camera} />
  </div>
);

export function VerificationGate({ 
  userId, 
  children, 
  requiredFor,
  variant = 'card',
  showProgress = true
}: VerificationGateProps) {
  const navigate = useNavigate();
  const { status, isLoading, error } = useFullVerification(userId);

  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Verification Check Failed</AlertTitle>
        <AlertDescription>
          Unable to verify your profile status. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // If user is fully verified (or has admin override), show children
  if (status?.isFullyVerified) {
    return <>{children}</>;
  }

  // User is not fully verified - show verification required UI
  const actionLabel = actionLabels[requiredFor] || 'perform this action';

  if (variant === 'inline') {
    return (
      <Alert className="border-amber-500/50 bg-amber-500/10">
        <Shield className="h-4 w-4 text-amber-500" />
        <AlertTitle className="text-amber-700 dark:text-amber-400">Verification Required</AlertTitle>
        <AlertDescription className="space-y-3">
          <p className="text-sm">
            Complete your profile verification to {actionLabel}.
            {status?.completionPercentage !== undefined && (
              <span className="ml-1 font-medium">({status.completionPercentage}% complete)</span>
            )}
          </p>
          {status?.missingVerifications && status.missingVerifications.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {status.missingVerifications.map((item) => (
                <Badge key={item} variant="outline" className="text-xs border-amber-500/50 text-amber-700 dark:text-amber-400">
                  {item}
                </Badge>
              ))}
            </div>
          )}
          <Button 
            size="sm" 
            onClick={() => navigate('/verification')}
            className="mt-2"
          >
            Complete Verification
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Card variant (default)
  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Shield className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Profile Verification Required
              {status?.isAdminOverride && (
                <Badge variant="secondary" className="text-xs">Admin Override</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Complete verification to {actionLabel}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {showProgress && status && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Verification Progress</span>
              <span className="font-medium">{status.completionPercentage}%</span>
            </div>
            <Progress value={status.completionPercentage} className="h-2" />
          </div>
        )}

        {status && <VerificationChecklist status={status} />}

        <div className="pt-2">
          <Button 
            onClick={() => navigate('/verification')}
            className="w-full"
          >
            <Shield className="h-4 w-4 mr-2" />
            Complete Verification
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Verification helps protect our community and builds trust between users.
        </p>
      </CardContent>
    </Card>
  );
}

// Simple hook-based check for conditional rendering
export function useVerificationGate(userId: string | null) {
  const { status, isLoading } = useFullVerification(userId);
  
  return {
    isVerified: status?.isFullyVerified ?? false,
    isLoading,
    status,
    canProceed: status?.isFullyVerified ?? false,
  };
}
