import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Receipt, 
  Info, 
  ChevronDown, 
  ChevronUp,
  Shield,
  Banknote,
  Calculator,
  Building2,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TaxBreakdownPanelProps {
  grossAmount: number;
  showDetailed?: boolean;
}

interface TaxRates {
  gst_rate: number;
  pst_rate: number;
  platform_fee_rate: number;
  instant_fee: number;
}

interface CalculatedTax {
  grossAmount: number;
  gstAmount: number;
  pstAmount: number;
  totalTax: number;
  platformFee: number;
  netPayout: number;
  instantFee?: number;
  finalPayout: number;
}

export function TaxBreakdownPanel({ grossAmount, showDetailed = false }: TaxBreakdownPanelProps) {
  const [rates, setRates] = useState<TaxRates>({
    gst_rate: 5.0,
    pst_rate: 6.0,
    platform_fee_rate: 15.0,
    instant_fee: 0.50
  });
  const [expanded, setExpanded] = useState(showDetailed);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTaxRates();
  }, []);

  const fetchTaxRates = async () => {
    try {
      const { data } = await supabase
        .from('tax_configurations')
        .select('tax_type, rate')
        .eq('is_active', true);

      if (data) {
        const newRates = { ...rates };
        data.forEach((config: any) => {
          if (config.tax_type === 'GST') newRates.gst_rate = config.rate;
          if (config.tax_type === 'PST') newRates.pst_rate = config.rate;
        });
        setRates(newRates);
      }
    } catch (error) {
      console.error('Error fetching tax rates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTax = (): CalculatedTax => {
    const gstAmount = Math.round(grossAmount * (rates.gst_rate / 100) * 100) / 100;
    const pstAmount = Math.round(grossAmount * (rates.pst_rate / 100) * 100) / 100;
    const totalTax = gstAmount + pstAmount;
    const platformFee = Math.round(grossAmount * (rates.platform_fee_rate / 100) * 100) / 100;
    const netPayout = Math.round((grossAmount - platformFee) * 100) / 100;
    
    return {
      grossAmount,
      gstAmount,
      pstAmount,
      totalTax,
      platformFee,
      netPayout,
      finalPayout: netPayout
    };
  };

  const tax = calculateTax();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="py-8">
          <div className="h-32 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <Calculator className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-base">Tax & Fee Summary</CardTitle>
              <CardDescription className="text-xs">Saskatchewan Compliant</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
            <Shield className="h-3 w-3 mr-1" />
            CRA Compliant
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Summary View */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Gross Earnings</span>
            </div>
            <span className="font-semibold">{formatCurrency(tax.grossAmount)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Platform Fee ({rates.platform_fee_rate}%)</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      This fee covers payment processing, platform maintenance, 
                      customer support, and insurance coverage.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-red-500">-{formatCurrency(tax.platformFee)}</span>
          </div>
        </div>

        <Separator />

        {/* Expandable Tax Details */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full justify-between hover:bg-muted/50"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Receipt className="h-4 w-4" />
            Tax Details (Info Only)
          </span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {expanded && (
          <div className="space-y-3 p-3 bg-muted/30 rounded-lg animate-in slide-in-from-top-2">
            <div className="text-xs text-muted-foreground mb-2">
              <Info className="h-3 w-3 inline mr-1" />
              As an independent contractor, you're responsible for reporting income. 
              These are for your reference:
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs px-2 py-0">GST</Badge>
                <span className="text-muted-foreground">Federal ({rates.gst_rate}%)</span>
              </div>
              <span className="font-mono text-muted-foreground">{formatCurrency(tax.gstAmount)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs px-2 py-0">PST</Badge>
                <span className="text-muted-foreground">Saskatchewan ({rates.pst_rate}%)</span>
              </div>
              <span className="font-mono text-muted-foreground">{formatCurrency(tax.pstAmount)}</span>
            </div>

            <Separator className="my-2" />

            <div className="flex justify-between items-center text-sm font-medium">
              <span>Estimated Tax Liability</span>
              <span className="text-amber-600">{formatCurrency(tax.totalTax)}</span>
            </div>

            <div className="text-xs text-muted-foreground p-2 bg-amber-500/10 rounded border border-amber-500/20">
              <Building2 className="h-3 w-3 inline mr-1" />
              If you earn over $30,000/year, you may need to register for GST/HST. 
              Consult a tax professional for guidance.
            </div>
          </div>
        )}

        <Separator />

        {/* Final Payout */}
        <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Your Payout</p>
              <p className="text-xs text-muted-foreground">After platform fee</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{formatCurrency(tax.netPayout)}</p>
              <p className="text-xs text-muted-foreground">
                {((tax.netPayout / tax.grossAmount) * 100).toFixed(0)}% of earnings
              </p>
            </div>
          </div>
        </div>

        {/* Tax Reminder */}
        <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg text-xs">
          <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-muted-foreground">
            <strong className="text-foreground">Tax Reminder:</strong> As a self-employed 
            contractor, you're responsible for setting aside funds for income tax. 
            We recommend saving 20-30% of your earnings for tax season.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
