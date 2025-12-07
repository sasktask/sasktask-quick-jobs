import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Calendar,
  DollarSign,
  Receipt,
  AlertCircle,
  Printer,
  CheckCircle
} from 'lucide-react';
import { format, parseISO, getYear, startOfYear, endOfYear, isWithinInterval } from 'date-fns';

interface Transaction {
  id: string;
  amount: number;
  payout_amount: number;
  platform_fee: number;
  status: string;
  escrow_status: string | null;
  created_at: string;
  task: {
    title: string;
    category: string;
  } | null;
}

interface TaxReportsProps {
  transactions: Transaction[];
}

export function TaxReports({ transactions }: TaxReportsProps) {
  const currentYear = getYear(new Date());
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    transactions.forEach(tx => {
      years.add(getYear(parseISO(tx.created_at)));
    });
    // Add current year if not present
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions, currentYear]);

  const yearlyData = useMemo(() => {
    const year = parseInt(selectedYear);
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(new Date(year, 0, 1));
    
    const yearTransactions = transactions.filter(tx => {
      const txDate = parseISO(tx.created_at);
      return isWithinInterval(txDate, { start: yearStart, end: yearEnd }) &&
             tx.escrow_status === 'released';
    });

    const totalGrossIncome = yearTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const totalPlatformFees = yearTransactions.reduce((sum, tx) => sum + (tx.platform_fee || 0), 0);
    const totalNetIncome = yearTransactions.reduce((sum, tx) => sum + (tx.payout_amount || 0), 0);
    const totalTransactions = yearTransactions.length;

    // Group by quarter
    const quarterlyBreakdown = [1, 2, 3, 4].map(q => {
      const qStart = new Date(year, (q - 1) * 3, 1);
      const qEnd = new Date(year, q * 3, 0);
      
      const qTransactions = yearTransactions.filter(tx => {
        const txDate = parseISO(tx.created_at);
        return isWithinInterval(txDate, { start: qStart, end: qEnd });
      });

      return {
        quarter: `Q${q}`,
        income: qTransactions.reduce((sum, tx) => sum + (tx.payout_amount || 0), 0),
        transactions: qTransactions.length
      };
    });

    // Group by category
    const categoryBreakdown: Record<string, number> = {};
    yearTransactions.forEach(tx => {
      const cat = tx.task?.category || 'Other';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + (tx.payout_amount || 0);
    });

    return {
      totalGrossIncome,
      totalPlatformFees,
      totalNetIncome,
      totalTransactions,
      quarterlyBreakdown,
      categoryBreakdown: Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])
    };
  }, [transactions, selectedYear]);

  const generateTaxReport = () => {
    const reportContent = `
=================================================
            ANNUAL EARNINGS STATEMENT
                  Tax Year ${selectedYear}
=================================================

Generated: ${format(new Date(), 'MMMM d, yyyy')}

INCOME SUMMARY
-------------------------------------------------
Gross Income:           $${yearlyData.totalGrossIncome.toFixed(2)}
Platform Fees:         -$${yearlyData.totalPlatformFees.toFixed(2)}
                        -----------------
Net Income:             $${yearlyData.totalNetIncome.toFixed(2)}

Total Transactions:     ${yearlyData.totalTransactions}

QUARTERLY BREAKDOWN
-------------------------------------------------
${yearlyData.quarterlyBreakdown.map(q => 
  `${q.quarter}:  $${q.income.toFixed(2).padStart(12)} (${q.transactions} transactions)`
).join('\n')}

INCOME BY CATEGORY
-------------------------------------------------
${yearlyData.categoryBreakdown.map(([cat, amount]) => 
  `${cat.padEnd(25)} $${amount.toFixed(2)}`
).join('\n')}

=================================================
This statement is for informational purposes only.
Please consult a tax professional for tax advice.
=================================================
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SaskTask_Tax_Report_${selectedYear}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printTaxReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tax Report ${selectedYear} - SaskTask</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
          h2 { color: #333; margin-top: 30px; }
          .summary-box { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .summary-row.total { border-top: 2px solid #333; font-weight: bold; margin-top: 10px; padding-top: 15px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f5f5f5; }
          .text-right { text-align: right; }
          .disclaimer { margin-top: 40px; padding: 15px; background: #fff3cd; border-radius: 8px; font-size: 12px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <h1>Annual Earnings Statement<br><small>Tax Year ${selectedYear}</small></h1>
        <p style="text-align: center; color: #666;">Generated: ${format(new Date(), 'MMMM d, yyyy')}</p>
        
        <h2>Income Summary</h2>
        <div class="summary-box">
          <div class="summary-row">
            <span>Gross Income:</span>
            <span>$${yearlyData.totalGrossIncome.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Platform Fees:</span>
            <span>-$${yearlyData.totalPlatformFees.toFixed(2)}</span>
          </div>
          <div class="summary-row total">
            <span>Net Income:</span>
            <span>$${yearlyData.totalNetIncome.toFixed(2)}</span>
          </div>
        </div>
        <p>Total Transactions: ${yearlyData.totalTransactions}</p>

        <h2>Quarterly Breakdown</h2>
        <table>
          <tr><th>Quarter</th><th class="text-right">Income</th><th class="text-right">Transactions</th></tr>
          ${yearlyData.quarterlyBreakdown.map(q => `
            <tr><td>${q.quarter}</td><td class="text-right">$${q.income.toFixed(2)}</td><td class="text-right">${q.transactions}</td></tr>
          `).join('')}
        </table>

        <h2>Income by Category</h2>
        <table>
          <tr><th>Category</th><th class="text-right">Amount</th></tr>
          ${yearlyData.categoryBreakdown.map(([cat, amount]) => `
            <tr><td>${cat}</td><td class="text-right">$${amount.toFixed(2)}</td></tr>
          `).join('')}
        </table>

        <div class="disclaimer">
          <strong>Disclaimer:</strong> This statement is for informational purposes only and should not be considered tax advice. 
          Please consult a qualified tax professional for guidance on your specific tax situation.
        </div>

        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tax Reports
            </CardTitle>
            <CardDescription>Download annual earnings statements for tax purposes</CardDescription>
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Year Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">Gross Income</p>
            <p className="text-2xl font-bold">${yearlyData.totalGrossIncome.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">Platform Fees</p>
            <p className="text-2xl font-bold text-red-600">-${yearlyData.totalPlatformFees.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">Net Income</p>
            <p className="text-2xl font-bold text-green-600">${yearlyData.totalNetIncome.toFixed(2)}</p>
          </div>
        </div>

        {/* Quarterly Breakdown */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Quarterly Breakdown
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {yearlyData.quarterlyBreakdown.map(q => (
              <div key={q.quarter} className="p-3 bg-muted/30 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">{q.quarter}</p>
                <p className="font-semibold">${q.income.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{q.transactions} tasks</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Tax Documents */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Available Documents
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Annual Earnings Statement</p>
                  <p className="text-sm text-muted-foreground">Complete income summary for {selectedYear}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={printTaxReport}>
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
                <Button size="sm" onClick={generateTaxReport}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>

            {yearlyData.totalNetIncome >= 600 && (
              <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">1099 Form Notice</p>
                    <p className="text-sm text-muted-foreground">
                      You earned over $600. A 1099-K form will be issued by January 31.
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30">
                  Pending
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <p className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              This information is provided for your convenience and should not be considered tax advice. 
              Please consult a qualified tax professional regarding your specific tax situation.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
