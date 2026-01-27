import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  TrendingUp, 
  FileText, 
  Calendar,
  Info,
  Download,
  PiggyBank,
  AlertTriangle,
  CheckCircle,
  Building
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface PayoutTaxSummaryProps {
  userId: string | null;
  totalEarnings: number;
}

interface TaxSummary {
  totalGross: number;
  totalPlatformFees: number;
  totalNetEarnings: number;
  estimatedGST: number;
  estimatedPST: number;
  estimatedTotalTax: number;
  transactionCount: number;
  gstThreshold: number;
  gstThresholdMet: boolean;
}

export function PayoutTaxSummary({ userId, totalEarnings }: PayoutTaxSummaryProps) {
  const [summary, setSummary] = useState<TaxSummary>({
    totalGross: 0,
    totalPlatformFees: 0,
    totalNetEarnings: 0,
    estimatedGST: 0,
    estimatedPST: 0,
    estimatedTotalTax: 0,
    transactionCount: 0,
    gstThreshold: 30000,
    gstThresholdMet: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (userId) {
      fetchTaxSummary();
    }
  }, [userId]);

  const fetchTaxSummary = async () => {
    try {
      // Get all released payments for the current year
      const startOfYear = new Date(currentYear, 0, 1).toISOString();
      
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, platform_fee, payout_amount, tax_deducted')
        .eq('payee_id', userId)
        .eq('escrow_status', 'released')
        .gte('released_at', startOfYear);

      if (payments) {
        const totalGross = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalPlatformFees = payments.reduce((sum, p) => sum + (p.platform_fee || 0), 0);
        const totalNetEarnings = payments.reduce((sum, p) => sum + (p.payout_amount || 0), 0);
        
        // Calculate estimated tax liability (informational)
        const GST_RATE = 0.05;
        const PST_RATE = 0.06;
        const estimatedGST = totalNetEarnings * GST_RATE;
        const estimatedPST = totalNetEarnings * PST_RATE;

        setSummary({
          totalGross,
          totalPlatformFees,
          totalNetEarnings,
          estimatedGST,
          estimatedPST,
          estimatedTotalTax: estimatedGST + estimatedPST,
          transactionCount: payments.length,
          gstThreshold: 30000,
          gstThresholdMet: totalNetEarnings >= 30000
        });
      }
    } catch (error) {
      console.error('Error fetching tax summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const recommendedTaxSavings = summary.totalNetEarnings * 0.25; // 25% recommended savings

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="py-8">
          <div className="h-40 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">{currentYear} Tax Summary</CardTitle>
              <CardDescription className="text-xs">For your records</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            YTD
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Earnings Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Gross Earnings</p>
            <p className="text-lg font-bold">{formatCurrency(summary.totalGross)}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Net Income</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(summary.totalNetEarnings)}</p>
          </div>
        </div>

        {/* Platform Fees */}
        <div className="flex justify-between items-center text-sm p-3 bg-muted/30 rounded-lg">
          <span className="text-muted-foreground">Platform Fees Paid</span>
          <span className="font-medium">{formatCurrency(summary.totalPlatformFees)}</span>
        </div>

        {/* GST Registration Threshold */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">GST Registration Threshold</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      If you earn over $30,000 in four consecutive quarters, 
                      you must register for GST/HST.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="font-medium">
              {formatCurrency(summary.totalNetEarnings)} / {formatCurrency(summary.gstThreshold)}
            </span>
          </div>
          <Progress 
            value={(summary.totalNetEarnings / summary.gstThreshold) * 100} 
            className="h-2"
          />
          {summary.gstThresholdMet ? (
            <div className="flex items-center gap-2 text-amber-600 text-xs">
              <AlertTriangle className="h-3 w-3" />
              <span>You may need to register for GST/HST. Consult a tax professional.</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary.gstThreshold - summary.totalNetEarnings)} remaining before GST registration required
            </p>
          )}
        </div>

        {/* Estimated Tax Liability */}
        <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-sm">Estimated Tax Liability</span>
            </div>
            <Badge variant="outline" className="text-amber-600 border-amber-500/30 text-xs">
              Informational
            </Badge>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST (5%)</span>
              <span>{formatCurrency(summary.estimatedGST)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">PST (6%)</span>
              <span>{formatCurrency(summary.estimatedPST)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t border-amber-500/20">
              <span>Total Estimated</span>
              <span className="text-amber-600">{formatCurrency(summary.estimatedTotalTax)}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            This is an estimate only. Your actual tax obligation may vary based on deductions, 
            expenses, and tax bracket. Consult a professional.
          </p>
        </div>

        {/* Recommended Savings */}
        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <PiggyBank className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Recommended Tax Savings</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(recommendedTaxSavings)}</p>
              <p className="text-xs text-muted-foreground">25% of net earnings</p>
            </div>
          </div>
        </div>

        {/* Transaction Count */}
        <div className="flex items-center justify-between text-sm py-2">
          <span className="text-muted-foreground">Completed Transactions</span>
          <Badge variant="secondary">{summary.transactionCount}</Badge>
        </div>

        {/* Download Button */}
        <Button variant="outline" className="w-full gap-2">
          <Download className="h-4 w-4" />
          Download Tax Report
        </Button>

        {/* Disclaimer */}
        <p className="text-xs text-center text-muted-foreground">
          This summary is for informational purposes only and should not be considered tax advice.
        </p>
      </CardContent>
    </Card>
  );
}
