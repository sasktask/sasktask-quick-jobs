import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  ShieldCheck, 
  Crown,
  Zap,
  Lock,
  CheckCircle,
  ArrowRight,
  Info
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface WithdrawalTier {
  name: string;
  level: 'basic' | 'verified' | 'premium';
  dailyLimit: number;
  weeklyLimit: number;
  instantEnabled: boolean;
  feePercentage: number;
  requirements: string[];
  benefits: string[];
}

interface WithdrawalTiersProps {
  currentTier: 'basic' | 'verified' | 'premium';
  verificationProgress: number;
  onUpgrade: () => void;
}

const tiers: WithdrawalTier[] = [
  {
    name: 'Basic',
    level: 'basic',
    dailyLimit: 100,
    weeklyLimit: 500,
    instantEnabled: false,
    feePercentage: 2.5,
    requirements: ['Email verified', 'Profile complete'],
    benefits: ['Standard bank transfers', '2-3 business day processing'],
  },
  {
    name: 'Verified',
    level: 'verified',
    dailyLimit: 500,
    weeklyLimit: 2000,
    instantEnabled: true,
    feePercentage: 1.5,
    requirements: ['ID verification', 'Phone verified', 'Bank account linked'],
    benefits: ['Instant cashouts', 'Same-day processing', 'Lower fees'],
  },
  {
    name: 'Premium',
    level: 'premium',
    dailyLimit: 2500,
    weeklyLimit: 10000,
    instantEnabled: true,
    feePercentage: 0.5,
    requirements: ['50+ completed tasks', '4.8+ rating', '3+ months active'],
    benefits: ['Highest limits', 'Priority support', 'Lowest fees', 'Early payouts'],
  },
];

const tierIcons = {
  basic: Shield,
  verified: ShieldCheck,
  premium: Crown,
};

const tierColors = {
  basic: 'text-muted-foreground',
  verified: 'text-blue-600',
  premium: 'text-amber-500',
};

const tierBgColors = {
  basic: 'bg-muted/50',
  verified: 'bg-blue-500/10',
  premium: 'bg-amber-500/10',
};

export function WithdrawalTiers({ currentTier, verificationProgress, onUpgrade }: WithdrawalTiersProps) {
  const currentTierIndex = tiers.findIndex(t => t.level === currentTier);
  const currentTierData = tiers[currentTierIndex];
  const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;
  const CurrentIcon = tierIcons[currentTier];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full ${tierBgColors[currentTier]} flex items-center justify-center`}>
              <CurrentIcon className={`h-5 w-5 ${tierColors[currentTier]}`} />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Withdrawal Limits
                <Badge className={`${tierBgColors[currentTier]} ${tierColors[currentTier]} border-0`}>
                  {currentTierData.name}
                </Badge>
              </CardTitle>
              <CardDescription>Your current tier benefits and limits</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Limits */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Daily Limit</p>
            <p className="text-xl font-bold">${currentTierData.dailyLimit.toLocaleString()}</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Weekly Limit</p>
            <p className="text-xl font-bold">${currentTierData.weeklyLimit.toLocaleString()}</p>
          </div>
        </div>

        {/* Current Benefits */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Your Benefits</p>
          <div className="flex flex-wrap gap-2">
            {currentTierData.instantEnabled && (
              <Badge variant="outline" className="gap-1">
                <Zap className="h-3 w-3 text-amber-500" />
                Instant Cashouts
              </Badge>
            )}
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              {currentTierData.feePercentage}% Fee
            </Badge>
            {currentTierData.benefits.slice(0, 2).map((benefit, i) => (
              <Badge key={i} variant="outline">{benefit}</Badge>
            ))}
          </div>
        </div>

        {/* Upgrade Section */}
        {nextTier && (
          <div className="border border-dashed border-primary/30 rounded-lg p-4 bg-primary/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(() => {
                  const NextIcon = tierIcons[nextTier.level];
                  return <NextIcon className={`h-5 w-5 ${tierColors[nextTier.level]}`} />;
                })()}
                <span className="font-medium">Upgrade to {nextTier.name}</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-medium mb-1">Requirements:</p>
                    <ul className="text-xs space-y-1">
                      {nextTier.requirements.map((req, i) => (
                        <li key={i}>• {req}</li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <Progress value={verificationProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {verificationProgress}% complete • {100 - verificationProgress}% to unlock
            </p>

            <div className="flex items-center justify-between text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Unlock:</p>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">${nextTier.dailyLimit.toLocaleString()}/day</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-semibold">{nextTier.feePercentage}% fee</span>
                </div>
              </div>
              <Button size="sm" onClick={onUpgrade} className="gap-1">
                Upgrade
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* All Tiers Comparison */}
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-3">All Tiers</p>
          <div className="grid grid-cols-3 gap-2">
            {tiers.map((tier, index) => {
              const Icon = tierIcons[tier.level];
              const isActive = tier.level === currentTier;
              const isLocked = index > currentTierIndex;
              
              return (
                <div 
                  key={tier.level}
                  className={`p-3 rounded-lg text-center ${
                    isActive 
                      ? 'bg-primary/10 border border-primary/30' 
                      : isLocked
                      ? 'bg-muted/30 opacity-60'
                      : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Icon className={`h-4 w-4 ${tierColors[tier.level]}`} />
                    {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                  </div>
                  <p className="text-xs font-medium">{tier.name}</p>
                  <p className="text-xs text-muted-foreground">${tier.dailyLimit}/day</p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
