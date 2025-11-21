import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Gift, Copy, Users, DollarSign, TrendingUp, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ReferralProgram() {
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch or create referral code
      let { data: codeData, error: codeError } = await supabase
        .from("referral_codes" as any)
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (codeError && codeError.code === "PGRST116") {
        // No code exists, create one
        const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        const { data: createdCode } = await supabase
          .from("referral_codes" as any)
          .insert({
            user_id: user.id,
            referral_code: newCode
          })
          .select()
          .single();
        codeData = createdCode;
      }

      setReferralCode((codeData as any)?.referral_code || "");

      // Fetch referrals
      const { data: referralsData } = await supabase
        .from("referrals" as any)
        .select(`
          *,
          referred_user:profiles!referrals_referred_user_id_fkey (full_name, avatar_url)
        `)
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      setReferrals(referralsData || []);

      // Fetch wallet
      const { data: walletData } = await supabase
        .from("wallets" as any)
        .select("*")
        .eq("user_id", user.id)
        .single();

      setWallet(walletData);
    } catch (error: any) {
      console.error("Error fetching referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const shareReferral = (platform: string) => {
    const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;
    const message = `Join SaskTask and get $5 bonus! Use my referral link: ${referralLink}`;
    
    const urls: { [key: string]: string } = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
    };

    window.open(urls[platform], "_blank");
  };

  const completedReferrals = referrals.filter(r => r.status === "rewarded").length;
  const totalEarnings = referrals.reduce((sum, r) => sum + (r.status === "rewarded" ? r.referrer_reward : 0), 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Gift className="h-10 w-10 text-primary" />
            Referral Program
          </h1>
          <p className="text-muted-foreground">Earn rewards by inviting friends to SaskTask</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                  <p className="text-3xl font-bold">{referrals.length}</p>
                </div>
                <Users className="h-10 w-10 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{completedReferrals}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-3xl font-bold text-primary">${totalEarnings.toFixed(2)}</p>
                </div>
                <DollarSign className="h-10 w-10 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  <p className="text-3xl font-bold">${wallet?.referral_credits?.toFixed(2) || "0.00"}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Code Card */}
        <Card className="mb-8 border-primary/50">
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>Share this link with friends to earn $10 per successful referral</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                value={`${window.location.origin}/auth?ref=${referralCode}`} 
                readOnly 
                className="font-mono"
              />
              <Button onClick={copyReferralCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => shareReferral("whatsapp")} variant="outline">
                Share on WhatsApp
              </Button>
              <Button onClick={() => shareReferral("facebook")} variant="outline">
                Share on Facebook
              </Button>
              <Button onClick={() => shareReferral("twitter")} variant="outline">
                Share on Twitter
              </Button>
              <Button onClick={() => shareReferral("linkedin")} variant="outline">
                Share on LinkedIn
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h4 className="font-semibold mb-2">Share Your Link</h4>
                <p className="text-sm text-muted-foreground">
                  Share your unique referral link with friends and family
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold mb-2">They Sign Up</h4>
                <p className="text-sm text-muted-foreground">
                  Your friend signs up and gets $5 bonus credit
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h4 className="font-semibold mb-2">You Both Earn</h4>
                <p className="text-sm text-muted-foreground">
                  After their first task, you get $10 and they get another $5
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
            <CardDescription>Track your referrals and earnings</CardDescription>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No referrals yet. Start inviting friends!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {referrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {referral.referred_user?.full_name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-semibold">{referral.referred_user?.full_name || "User"}</p>
                        <p className="text-sm text-muted-foreground">
                          Joined {new Date(referral.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={referral.status === "rewarded" ? "default" : "secondary"}>
                        {referral.status}
                      </Badge>
                      {referral.status === "rewarded" && (
                        <p className="text-sm font-semibold text-primary mt-1">
                          +${referral.referrer_reward.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
