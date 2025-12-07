import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Clock,
  MessageCircle,
  FileCheck
} from 'lucide-react';

interface TrustScoreCardProps {
  trustScore: number;
  verificationLevel?: string;
  idVerified?: boolean;
  backgroundCheck?: string;
  hasInsurance?: boolean;
  rating?: number;
  responseRate?: number;
  onTimeRate?: number;
  completedTasks?: number;
}

export function TrustScoreCard({
  trustScore,
  verificationLevel,
  idVerified,
  backgroundCheck,
  hasInsurance,
  rating,
  responseRate,
  onTimeRate,
  completedTasks
}: TrustScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Building Trust';
  };

  const getShieldIcon = (score: number) => {
    if (score >= 80) return <ShieldCheck className="h-8 w-8 text-green-500" />;
    if (score >= 60) return <Shield className="h-8 w-8 text-amber-500" />;
    return <ShieldAlert className="h-8 w-8 text-red-500" />;
  };

  const verificationItems = [
    {
      label: 'ID Verified',
      verified: idVerified,
      icon: FileCheck
    },
    {
      label: 'Background Check',
      verified: backgroundCheck === 'verified',
      pending: backgroundCheck === 'pending',
      icon: Shield
    },
    {
      label: 'Insurance',
      verified: hasInsurance,
      icon: ShieldCheck
    }
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Trust Score
          </span>
          <Badge 
            variant="outline" 
            className={`${getScoreColor(trustScore)} border-current`}
          >
            {getScoreLabel(trustScore)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Trust Score */}
        <div className="flex items-center gap-4">
          {getShieldIcon(trustScore)}
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <span className={`text-3xl font-bold ${getScoreColor(trustScore)}`}>
                {trustScore}
              </span>
              <span className="text-muted-foreground text-sm">/100</span>
            </div>
            <Progress 
              value={trustScore} 
              className="h-2"
            />
          </div>
        </div>

        {/* Verification Status */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Verification Status</p>
          <div className="grid grid-cols-3 gap-2">
            {verificationItems.map((item) => (
              <div 
                key={item.label}
                className={`flex flex-col items-center p-2 rounded-lg border ${
                  item.verified 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : item.pending
                    ? 'bg-amber-500/10 border-amber-500/20'
                    : 'bg-muted/50 border-border'
                }`}
              >
                {item.verified ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mb-1" />
                ) : item.pending ? (
                  <AlertCircle className="h-5 w-5 text-amber-500 mb-1" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground mb-1" />
                )}
                <span className="text-xs text-center">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Performance</p>
          <div className="grid grid-cols-2 gap-3">
            {rating !== undefined && (
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <div>
                  <p className="text-sm font-medium">{rating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>
            )}
            {responseRate !== undefined && (
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">{responseRate}%</p>
                  <p className="text-xs text-muted-foreground">Response</p>
                </div>
              </div>
            )}
            {onTimeRate !== undefined && (
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <Clock className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">{onTimeRate}%</p>
                  <p className="text-xs text-muted-foreground">On Time</p>
                </div>
              </div>
            )}
            {completedTasks !== undefined && (
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">{completedTasks}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}