import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Receipt, Info, DollarSign, Percent } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaxBreakdownCardProps {
  grossAmount: number;
  gstAmount: number;
  pstAmount: number;
  platformFee: number;
  payoutAmount: number;
  contractorWithholding?: number;
  isTaskDoer?: boolean;
  compact?: boolean;
}

export function TaxBreakdownCard({
  grossAmount,
  gstAmount,
  pstAmount,
  platformFee,
  payoutAmount,
  contractorWithholding = 0,
  isTaskDoer = false,
  compact = false,
}: TaxBreakdownCardProps) {
  const totalTax = gstAmount + pstAmount;
  const totalDeductions = platformFee + totalTax + contractorWithholding;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  if (compact) {
    return (
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(grossAmount)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>GST (5%)</span>
          <span>{formatCurrency(gstAmount)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>PST (6%)</span>
          <span>{formatCurrency(pstAmount)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Platform Fee (15%)</span>
          <span>{formatCurrency(platformFee)}</span>
        </div>
        {contractorWithholding > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Tax Withholding</span>
            <span>{formatCurrency(contractorWithholding)}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>{isTaskDoer ? "You'll receive" : "Total"}</span>
          <span className="text-primary">
            {formatCurrency(isTaskDoer ? payoutAmount : grossAmount + totalTax)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          {isTaskDoer ? "Earnings Breakdown" : "Payment Breakdown"}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  {isTaskDoer
                    ? "Shows your net earnings after platform fees and applicable taxes."
                    : "Shows the total amount including Saskatchewan GST (5%) and PST (6%)."}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gross Amount */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>Task Amount</span>
          </div>
          <span className="font-medium">{formatCurrency(grossAmount)}</span>
        </div>

        <Separator />

        {/* Tax Details */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                GST
              </Badge>
              <span className="text-muted-foreground">Federal (5%)</span>
            </div>
            <span className="text-muted-foreground">
              {isTaskDoer ? "-" : "+"}{formatCurrency(gstAmount)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                PST
              </Badge>
              <span className="text-muted-foreground">Saskatchewan (6%)</span>
            </div>
            <span className="text-muted-foreground">
              {isTaskDoer ? "-" : "+"}{formatCurrency(pstAmount)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <Percent className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Platform Fee (15%)</span>
            </div>
            <span className="text-muted-foreground">
              -{formatCurrency(platformFee)}
            </span>
          </div>

          {contractorWithholding > 0 && (
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Withholding
                </Badge>
                <span className="text-muted-foreground">Tax Withholding</span>
              </div>
              <span className="text-muted-foreground">
                -{formatCurrency(contractorWithholding)}
              </span>
            </div>
          )}
        </div>

        <Separator />

        {/* Summary */}
        <div className="space-y-2">
          {!isTaskDoer && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Tax</span>
              <span className="text-muted-foreground">
                {formatCurrency(totalTax)}
              </span>
            </div>
          )}

          {isTaskDoer && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Deductions</span>
              <span className="text-muted-foreground">
                {formatCurrency(totalDeductions)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <span className="font-semibold">
              {isTaskDoer ? "Your Earnings" : "Total to Pay"}
            </span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(
                isTaskDoer ? payoutAmount : grossAmount + totalTax
              )}
            </span>
          </div>
        </div>

        {/* Tax Info Footer */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            📍 Saskatchewan, Canada • GST/HST #: TBD
          </p>
          {isTaskDoer && (
            <p className="text-xs text-muted-foreground mt-1">
              💡 Keep records for your annual tax filing. T4A slips provided for
              earnings over $500.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
