import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  DollarSign, 
  Receipt, 
  Calculator, 
  FileText, 
  AlertTriangle,
  CheckCircle2,
  Info,
  Calendar,
  Building2,
  Percent,
  Globe,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function TaxCompliance() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-surface">
      <SEOHead 
        title="Tax Compliance Guide | SaskTask"
        description="Understanding your tax obligations as a SaskTask user in Saskatchewan and Canada. GST, PST, and income tax guidance for independent contractors."
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Receipt className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Tax Compliance Guide</h1>
            <p className="text-muted-foreground">Last updated: January 2026</p>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              Important tax information for Task Doers and Task Givers operating in Saskatchewan and across Canada.
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Disclaimer */}
            <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-700 dark:text-amber-400">Tax Disclaimer</AlertTitle>
              <AlertDescription className="text-amber-600 dark:text-amber-500">
                This information is for general guidance only and does not constitute tax or legal advice. 
                Consult a qualified tax professional or the Canada Revenue Agency (CRA) for advice specific 
                to your situation. Tax laws and regulations may change.
              </AlertDescription>
            </Alert>

            {/* Overview */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Info className="w-6 h-6 text-primary" />
                1. Your Tax Responsibilities
              </h2>
              <p className="text-muted-foreground mb-4">
                As a Task Doer on SaskTask, you operate as an <strong>independent contractor</strong>, not an employee. 
                This means you are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Reporting all income earned through SaskTask to the CRA</li>
                <li>Collecting and remitting GST/HST if you exceed the small supplier threshold</li>
                <li>Paying quarterly income tax installments if required</li>
                <li>Maintaining accurate records of income and expenses</li>
                <li>Filing annual income tax returns</li>
              </ul>
            </section>

            {/* GST/PST in Saskatchewan */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Percent className="w-6 h-6 text-primary" />
                2. GST and PST in Saskatchewan
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-bold text-blue-700 dark:text-blue-400 mb-2">Federal GST</h3>
                  <p className="text-3xl font-bold text-blue-600">5%</p>
                  <p className="text-sm text-blue-600 dark:text-blue-500">Goods and Services Tax (federal)</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-bold text-green-700 dark:text-green-400 mb-2">Saskatchewan PST</h3>
                  <p className="text-3xl font-bold text-green-600">6%</p>
                  <p className="text-sm text-green-600 dark:text-green-500">Provincial Sales Tax</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-3">GST Small Supplier Threshold</h3>
              <div className="p-4 bg-muted/50 rounded-lg mb-4">
                <p className="text-2xl font-bold text-primary">$30,000</p>
                <p className="text-muted-foreground">
                  If your worldwide taxable revenue exceeds $30,000 in any single calendar quarter or over 
                  four consecutive calendar quarters, you <strong>must register</strong> for a GST/HST number.
                </p>
              </div>

              <h3 className="text-xl font-semibold mb-3">PST on Services</h3>
              <p className="text-muted-foreground mb-4">
                In Saskatchewan, PST generally applies to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Repair, installation, and maintenance services for tangible personal property</li>
                <li>Cleaning services for tangible personal property</li>
                <li>Certain professional services as specified by provincial regulation</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                <strong>Note:</strong> Many personal services (cleaning homes, yard work, general labor) 
                may be exempt from PST. Consult the Saskatchewan Ministry of Finance for specific guidance.
              </p>
            </section>

            {/* Registration Requirements */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" />
                3. Registration Requirements
              </h2>
              
              <h3 className="text-xl font-semibold mb-3">GST/HST Registration</h3>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4">Annual Revenue</th>
                      <th className="text-left py-3 px-4">GST Registration</th>
                      <th className="text-left py-3 px-4">Action Required</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-3 px-4">Under $30,000</td>
                      <td className="py-3 px-4">Optional (Small Supplier)</td>
                      <td className="py-3 px-4">May register voluntarily to claim input tax credits</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">$30,000+</td>
                      <td className="py-3 px-4 font-semibold text-red-600">Mandatory</td>
                      <td className="py-3 px-4">Must register within 29 days of exceeding threshold</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold mb-3">Saskatchewan PST Registration</h3>
              <p className="text-muted-foreground mb-4">
                If you provide taxable services in Saskatchewan, you may need to register with the 
                Saskatchewan Ministry of Finance for a PST vendor's licence.
              </p>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>SaskTask Threshold Monitoring</AlertTitle>
                <AlertDescription>
                  SaskTask tracks your earnings and will notify you when you're approaching the $30,000 GST threshold. 
                  You'll see a notification in your dashboard and receive an email reminder.
                </AlertDescription>
              </Alert>
            </section>

            {/* Income Tax */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Calculator className="w-6 h-6 text-primary" />
                4. Income Tax Obligations
              </h2>
              
              <h3 className="text-xl font-semibold mb-3">Reporting Self-Employment Income</h3>
              <p className="text-muted-foreground mb-4">
                All earnings from SaskTask are considered self-employment income and must be reported on your 
                annual income tax return using Form T2125 (Statement of Business or Professional Activities).
              </p>

              <h3 className="text-xl font-semibold mb-3">2026 Saskatchewan Tax Rates</h3>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4">Taxable Income</th>
                      <th className="text-left py-3 px-4">Federal Rate</th>
                      <th className="text-left py-3 px-4">SK Provincial Rate</th>
                      <th className="text-left py-3 px-4">Combined Rate</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-3 px-4">Up to $55,867</td>
                      <td className="py-3 px-4">15%</td>
                      <td className="py-3 px-4">10.5%</td>
                      <td className="py-3 px-4 font-semibold">25.5%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">$55,867 - $111,733</td>
                      <td className="py-3 px-4">20.5%</td>
                      <td className="py-3 px-4">12.5%</td>
                      <td className="py-3 px-4 font-semibold">33%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">$111,733 - $173,205</td>
                      <td className="py-3 px-4">26%</td>
                      <td className="py-3 px-4">14.5%</td>
                      <td className="py-3 px-4 font-semibold">40.5%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">$173,205 - $246,752</td>
                      <td className="py-3 px-4">29%</td>
                      <td className="py-3 px-4">14.5%</td>
                      <td className="py-3 px-4 font-semibold">43.5%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Over $246,752</td>
                      <td className="py-3 px-4">33%</td>
                      <td className="py-3 px-4">14.5%</td>
                      <td className="py-3 px-4 font-semibold">47.5%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold mb-3">Quarterly Installments</h3>
              <p className="text-muted-foreground">
                If you owe more than $3,000 in taxes (federal and provincial combined) in the current year 
                and either of the two previous years, you may be required to pay quarterly tax installments. 
                Installment due dates are: March 15, June 15, September 15, and December 15.
              </p>
            </section>

            {/* Deductible Expenses */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                5. Deductible Business Expenses
              </h2>
              
              <p className="text-muted-foreground mb-4">
                As a self-employed contractor, you may deduct reasonable business expenses from your income:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Common Deductions
                  </h4>
                  <ul className="text-sm text-green-600 dark:text-green-500 space-y-1">
                    <li>• Vehicle expenses (mileage, gas, maintenance)</li>
                    <li>• Tools and equipment</li>
                    <li>• Supplies and materials</li>
                    <li>• Phone and internet (business portion)</li>
                    <li>• Home office expenses</li>
                    <li>• Professional development</li>
                    <li>• Insurance premiums</li>
                    <li>• Accounting and legal fees</li>
                    <li>• Bank and platform fees</li>
                    <li>• Advertising and marketing</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Record Keeping Tips
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Keep all receipts for 6 years</li>
                    <li>• Use a mileage log app</li>
                    <li>• Separate business banking</li>
                    <li>• Track home office square footage</li>
                    <li>• Document business use percentage</li>
                    <li>• Save digital copies of receipts</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* CPP Contributions */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-primary" />
                6. CPP and EI Considerations
              </h2>
              
              <h3 className="text-xl font-semibold mb-3">Canada Pension Plan (CPP)</h3>
              <p className="text-muted-foreground mb-4">
                Self-employed individuals pay <strong>both</strong> the employee and employer portions of CPP:
              </p>
              <div className="p-4 bg-muted/50 rounded-lg mb-6">
                <p className="text-muted-foreground">
                  <strong>2026 CPP Rate:</strong> 11.9% on self-employment income<br />
                  <strong>Maximum Pensionable Earnings:</strong> $71,300<br />
                  <strong>Basic Exemption:</strong> $3,500<br />
                  <strong>Maximum Annual Contribution:</strong> ~$8,068
                </p>
              </div>

              <h3 className="text-xl font-semibold mb-3">Employment Insurance (EI)</h3>
              <p className="text-muted-foreground">
                Self-employed individuals are not required to pay EI premiums but may opt in to receive 
                special benefits (maternity, parental, sickness, compassionate care). Registration requires 
                a 12-month waiting period before benefits are accessible.
              </p>
            </section>

            {/* Tax Documents from SaskTask */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                7. Tax Documents from SaskTask
              </h2>
              
              <h3 className="text-xl font-semibold mb-3">What SaskTask Provides</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li><strong>Annual Earnings Summary:</strong> Available by January 31 each year</li>
                <li><strong>Transaction History:</strong> Downloadable anytime from your dashboard</li>
                <li><strong>T4A Slips:</strong> Issued if total payments exceed reporting thresholds</li>
                <li><strong>GST Threshold Alerts:</strong> Notifications when approaching $30,000</li>
                <li><strong>Fee Statements:</strong> Platform fees paid for expense deductions</li>
              </ul>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Download Your Tax Documents</AlertTitle>
                <AlertDescription>
                  Access your annual tax summary, transaction history, and T4A slips (if applicable) from 
                  your SaskTask dashboard under <strong>Settings → Tax Reports</strong>.
                </AlertDescription>
              </Alert>
            </section>

            {/* Resources */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary" />
                8. Tax Resources
              </h2>
              
              <div className="grid gap-4">
                <a href="https://www.canada.ca/en/revenue-agency.html" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div>
                    <h3 className="font-semibold">Canada Revenue Agency (CRA)</h3>
                    <p className="text-sm text-muted-foreground">Official federal tax information and filing</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </a>
                
                <a href="https://www.saskatchewan.ca/government/government-structure/ministries/finance" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div>
                    <h3 className="font-semibold">Saskatchewan Ministry of Finance</h3>
                    <p className="text-sm text-muted-foreground">Provincial tax information and PST registration</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </a>
                
                <a href="https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses.html" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div>
                    <h3 className="font-semibold">GST/HST for Businesses</h3>
                    <p className="text-sm text-muted-foreground">Registration, collection, and remittance information</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </a>
                
                <a href="https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/sole-proprietorships-partnerships.html" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div>
                    <h3 className="font-semibold">Self-Employment Tax Guide</h3>
                    <p className="text-sm text-muted-foreground">CRA guide for sole proprietors and freelancers</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </a>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className="bg-primary/5 border-2 border-primary/20 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-primary">Tax Responsibility Acknowledgment</h2>
              <p className="text-muted-foreground">
                By using SaskTask as a Task Doer, you acknowledge that you are responsible for understanding 
                and fulfilling all applicable tax obligations. SaskTask is not a tax advisor and does not 
                provide tax advice. We recommend consulting with a qualified tax professional to ensure 
                compliance with all federal and provincial tax requirements.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
