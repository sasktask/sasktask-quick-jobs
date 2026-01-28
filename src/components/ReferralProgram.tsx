import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Gift, 
  Copy, 
  Share2, 
  Users, 
  DollarSign, 
  CheckCircle,
  Loader2,
  Sparkles,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalEarned: number;
}

interface Referral {
  id: string;
  status: string;
  referrer_reward: number;
  created_at: string;
  completed_at: string | null;
}

export const ReferralProgram = ({ userId }: { userId: string }) => {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, [userId]);

  const fetchReferralData = async () => {
    try {
      // Get or create referral code
      const { data: codeData, error: codeError } = await supabase
        .rpc('get_or_create_referral_code', { p_user_id: userId });

      if (codeError) throw codeError;

      // Get referrals made by this user
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (referralsError) throw referralsError;

      const typedReferrals = (referralsData || []) as Referral[];
      const pending = typedReferrals.filter(r => r.status === 'pending').length;
      const completed = typedReferrals.filter(r => r.status === 'completed' || r.status === 'rewarded').length;
      const totalEarned = typedReferrals
        .filter(r => r.status === 'rewarded')
        .reduce((sum, r) => sum + Number(r.referrer_reward), 0);

      setStats({
        referralCode: codeData as string,
        totalReferrals: typedReferrals.length,
        pendingReferrals: pending,
        completedReferrals: completed,
        totalEarned
      });
      setReferrals(typedReferrals);
    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    if (!stats?.referralCode) return;
    
    const link = `${window.location.origin}/auth?ref=${stats.referralCode}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = async () => {
    if (!stats?.referralCode) return;
    
    const link = `${window.location.origin}/auth?ref=${stats.referralCode}`;
    const text = `Join SaskTask and get $5 off your first task! Use my referral link:`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Join SaskTask', text, url: link });
      } catch (error) {
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Hero Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Invite Friends, Earn Rewards</CardTitle>
              <CardDescription>
                Give $5, Get $10 for each friend who completes their first task
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-6">
          {/* Referral Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Your Referral Link</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  readOnly
                  value={`${window.location.origin}/auth?ref=${stats?.referralCode || ''}`}
                  className="pr-24 font-mono text-sm bg-background/50"
                />
                <Badge 
                  variant="secondary" 
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  {stats?.referralCode}
                </Badge>
              </div>
              <Button
                onClick={copyReferralLink}
                variant="outline"
                className="shrink-0"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Copy className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
              <Button onClick={shareReferral} className="shrink-0 gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl bg-background/50 border border-border/50 text-center"
            >
              <div className="flex justify-center mb-2">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{stats?.totalReferrals || 0}</div>
              <div className="text-xs text-muted-foreground">Total Invites</div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl bg-background/50 border border-border/50 text-center"
            >
              <div className="flex justify-center mb-2">
                <Loader2 className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold">{stats?.pendingReferrals || 0}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl bg-background/50 border border-border/50 text-center"
            >
              <div className="flex justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold">{stats?.completedReferrals || 0}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-center"
            >
              <div className="flex justify-center mb-2">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">${stats?.totalEarned?.toFixed(2) || '0.00'}</div>
              <div className="text-xs text-muted-foreground">Total Earned</div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: 1, title: 'Share Your Link', desc: 'Send your unique referral link to friends' },
              { step: 2, title: 'They Sign Up', desc: 'Your friend creates an account and gets $5 credit' },
              { step: 3, title: 'You Get Rewarded', desc: 'Earn $10 when they complete their first task' }
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-bold">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      {referrals.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Your Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrals.slice(0, 5).map((referral, idx) => (
                <motion.div
                  key={referral.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Invited Friend</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      referral.status === 'rewarded' ? 'default' :
                      referral.status === 'completed' ? 'secondary' :
                      'outline'
                    }>
                      {referral.status}
                    </Badge>
                    {referral.status === 'rewarded' && (
                      <span className="text-green-600 font-medium">
                        +${referral.referrer_reward}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default ReferralProgram;
