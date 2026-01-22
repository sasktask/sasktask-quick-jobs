import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  FileText, 
  Briefcase, 
  Scale, 
  DollarSign, 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  Building2,
  UserCheck,
  Clock,
  Receipt,
  Gavel
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function IndependentContractorAgreement() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-surface">
      <SEOHead 
        title="Independent Contractor Agreement | SaskTask"
        description="Understand the independent contractor relationship between Task Doers and SaskTask. Review the terms governing contractor status, responsibilities, and rights."
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Independent Contractor Agreement</h1>
            <p className="text-muted-foreground">Last updated: January 2026</p>
            <p className="text-sm text-muted-foreground mt-2">Effective Date: January 22, 2026</p>
          </div>

          <Alert className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Legal Document</AlertTitle>
            <AlertDescription>
              This Independent Contractor Agreement ("Agreement") governs your relationship with SaskTask as a Task Doer. 
              By registering as a Task Doer, you acknowledge that you have read, understood, and agree to be bound by this Agreement.
            </AlertDescription>
          </Alert>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Parties */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                1. Parties to This Agreement
              </h2>
              <p className="text-muted-foreground mb-4">
                This Independent Contractor Agreement is entered into between:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li><strong>"SaskTask"</strong> - The platform operator, based in Saskatchewan, Canada</li>
                <li><strong>"Contractor" / "Task Doer" / "You"</strong> - The individual registered as a Task Doer on the SaskTask platform</li>
              </ul>
              <p className="text-muted-foreground">
                SaskTask provides a technology platform that connects Task Doers with Task Givers. SaskTask does not employ Task Doers and is not a party to the service agreements between Task Doers and Task Givers.
              </p>
            </section>

            {/* Independent Contractor Status */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-primary" />
                2. Independent Contractor Status
              </h2>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                <p className="text-amber-800 dark:text-amber-200 text-sm font-medium mb-2">
                  KEY ACKNOWLEDGMENT
                </p>
                <p className="text-amber-800 dark:text-amber-200 text-sm">
                  You acknowledge and agree that you are an <strong>INDEPENDENT CONTRACTOR</strong> and NOT an employee of SaskTask, 
                  any Task Giver, or any other user of the platform. This classification is fundamental to your relationship with SaskTask.
                </p>
              </div>

              <h3 className="text-xl font-semibold mb-3">2.1 What This Means</h3>
              <p className="text-muted-foreground mb-4">
                As an independent contractor:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>You operate your own independent business providing services to Task Givers</li>
                <li>You are free to engage in other business activities, including working for competitors</li>
                <li>You control when, where, and how you perform your services</li>
                <li>You are not subject to SaskTask's direction or control except as set out in platform policies</li>
                <li>You have no obligation to accept any particular task offered through the platform</li>
                <li>You may hire employees, subcontractors, or assistants (with Task Giver consent)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">2.2 Canadian Legal Context</h3>
              <p className="text-muted-foreground mb-4">
                Under Canadian law, the determination of whether someone is an employee or independent contractor 
                depends on various factors established by courts. Key factors include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Control:</strong> You control how you perform your services</li>
                <li><strong>Tools:</strong> You provide your own tools and equipment</li>
                <li><strong>Financial Risk:</strong> You bear the risk of profit or loss from your services</li>
                <li><strong>Integration:</strong> You operate independently of SaskTask's business</li>
                <li><strong>Exclusivity:</strong> You are not required to work exclusively for SaskTask</li>
              </ul>
            </section>

            {/* No Employment Relationship */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" />
                3. No Employment Relationship
              </h2>
              
              <h3 className="text-xl font-semibold mb-3">3.1 What SaskTask Does NOT Provide</h3>
              <p className="text-muted-foreground mb-4">
                As an independent contractor, you understand that SaskTask does NOT provide:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Wages, salary, or guaranteed minimum earnings</li>
                <li>Employment Insurance (EI) contributions</li>
                <li>Canada Pension Plan (CPP) contributions</li>
                <li>Workers' Compensation coverage</li>
                <li>Health insurance or benefits</li>
                <li>Vacation pay, sick leave, or parental leave</li>
                <li>Notice of termination or severance pay</li>
                <li>Training or supervision (beyond platform usage)</li>
                <li>Tools, equipment, or materials for performing services</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">3.2 Your Responsibilities</h3>
              <p className="text-muted-foreground mb-4">
                As an independent contractor, YOU are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Setting your own rates (within platform guidelines)</li>
                <li>Managing your own schedule and availability</li>
                <li>Providing your own tools, equipment, and transportation</li>
                <li>Obtaining any required licenses, permits, or certifications</li>
                <li>Maintaining appropriate insurance coverage</li>
                <li>Paying all applicable taxes, including income tax and GST/HST if applicable</li>
                <li>Complying with all applicable laws and regulations</li>
              </ul>
            </section>

            {/* Tax Obligations */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Receipt className="w-6 h-6 text-primary" />
                4. Tax Obligations
              </h2>

              <h3 className="text-xl font-semibold mb-3">4.1 Income Reporting</h3>
              <p className="text-muted-foreground mb-4">
                All income earned through the SaskTask platform is taxable income. You are solely responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Tracking all earnings received through the platform</li>
                <li>Reporting all income to the Canada Revenue Agency (CRA)</li>
                <li>Paying federal and provincial income taxes</li>
                <li>Filing annual tax returns</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">4.2 GST/HST Registration</h3>
              <p className="text-muted-foreground mb-4">
                If your gross revenue from all sources exceeds $30,000 in any four consecutive calendar quarters, you may be required to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Register for a GST/HST account with the CRA</li>
                <li>Collect GST/HST from Task Givers where applicable</li>
                <li>Remit GST/HST to the CRA</li>
                <li>File GST/HST returns</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">4.3 Tax Documentation</h3>
              <p className="text-muted-foreground mb-4">
                SaskTask will provide:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li><strong>T4A slips:</strong> For payments over $500 in a calendar year (as required by CRA)</li>
                <li><strong>Earnings summaries:</strong> Available in your account dashboard</li>
                <li><strong>Transaction history:</strong> Detailed records of all platform transactions</li>
              </ul>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong>Tax Advice:</strong> SaskTask does not provide tax advice. We recommend consulting with a qualified 
                  tax professional or accountant to understand your specific tax obligations.
                </p>
              </div>
            </section>

            {/* Insurance Requirements */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                5. Insurance Requirements
              </h2>

              <h3 className="text-xl font-semibold mb-3">5.1 Required Insurance</h3>
              <p className="text-muted-foreground mb-4">
                Depending on the services you provide, you may be required to maintain:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li><strong>General Liability Insurance:</strong> Minimum $1,000,000 coverage recommended for most service categories</li>
                <li><strong>Professional Liability Insurance:</strong> For services requiring professional expertise</li>
                <li><strong>Commercial Auto Insurance:</strong> If using a vehicle for task-related activities</li>
                <li><strong>Workers' Compensation:</strong> If you have employees or subcontractors</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">5.2 Verification</h3>
              <p className="text-muted-foreground mb-4">
                SaskTask may request proof of insurance for certain task categories. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide certificates of insurance upon request</li>
                <li>Maintain insurance coverage throughout your use of the platform</li>
                <li>Notify SaskTask of any changes to your insurance status</li>
              </ul>
            </section>

            {/* Licensing & Certification */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                6. Licensing & Certification
              </h2>
              <p className="text-muted-foreground mb-4">
                You are solely responsible for ensuring you have all necessary:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li><strong>Business licenses:</strong> Municipal or provincial business licenses as required</li>
                <li><strong>Trade certifications:</strong> For regulated trades (electrician, plumber, etc.)</li>
                <li><strong>Professional licenses:</strong> For regulated professions</li>
                <li><strong>Permits:</strong> For specific activities or locations</li>
                <li><strong>Safety certifications:</strong> First aid, WHMIS, etc. as applicable</li>
              </ul>
              <p className="text-muted-foreground">
                Performing services without required licenses or certifications may result in legal penalties and 
                removal from the SaskTask platform.
              </p>
            </section>

            {/* Compensation */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-primary" />
                7. Compensation Terms
              </h2>

              <h3 className="text-xl font-semibold mb-3">7.1 Setting Your Rates</h3>
              <p className="text-muted-foreground mb-4">
                You have the freedom to set your own rates for services, subject to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Rates being clearly communicated to Task Givers before booking</li>
                <li>Compliance with any platform minimum or maximum guidelines</li>
                <li>Honoring quoted rates once accepted by a Task Giver</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">7.2 Payment Processing</h3>
              <p className="text-muted-foreground mb-4">
                All payments for services booked through SaskTask must be processed through the platform. Payment terms include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Payments are held in escrow until task completion is confirmed</li>
                <li>SaskTask deducts a service fee from each transaction</li>
                <li>Payouts are processed according to your payout schedule settings</li>
                <li>You must maintain a valid payout method to receive earnings</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">7.3 No Minimum Guarantee</h3>
              <p className="text-muted-foreground">
                SaskTask does not guarantee any minimum number of tasks, bookings, or earnings. Your earnings depend 
                entirely on the tasks you accept and complete.
              </p>
            </section>

            {/* Term and Termination */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" />
                8. Term and Termination
              </h2>

              <h3 className="text-xl font-semibold mb-3">8.1 Effective Period</h3>
              <p className="text-muted-foreground mb-4">
                This Agreement becomes effective when you register as a Task Doer and remains in effect until terminated 
                by either party.
              </p>

              <h3 className="text-xl font-semibold mb-3">8.2 Termination by You</h3>
              <p className="text-muted-foreground mb-4">
                You may terminate this Agreement at any time by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Completing all outstanding tasks and commitments</li>
                <li>Deactivating your Task Doer account through account settings</li>
                <li>Contacting SaskTask support to request account closure</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">8.3 Termination by SaskTask</h3>
              <p className="text-muted-foreground mb-4">
                SaskTask may terminate this Agreement immediately if you:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Violate the Terms of Service or Community Guidelines</li>
                <li>Engage in fraudulent, illegal, or harmful activities</li>
                <li>Receive multiple complaints or negative reviews</li>
                <li>Misrepresent your qualifications or identity</li>
                <li>Fail to meet verification requirements</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">8.4 Effect of Termination</h3>
              <p className="text-muted-foreground">
                Upon termination, your access to the platform will be revoked. Any pending payments for completed tasks 
                will be processed according to standard payout procedures. Sections of this Agreement relating to 
                indemnification, liability, and surviving provisions will continue in effect.
              </p>
            </section>

            {/* Indemnification */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6 text-primary" />
                9. Indemnification
              </h2>
              <p className="text-muted-foreground mb-4">
                You agree to indemnify, defend, and hold harmless SaskTask, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Your performance or failure to perform services</li>
                <li>Any claim that you are an employee rather than an independent contractor</li>
                <li>Any claim related to your tax obligations</li>
                <li>Personal injury or property damage caused by your actions</li>
                <li>Violation of any laws, regulations, or third-party rights</li>
                <li>Your violation of this Agreement or the Terms of Service</li>
              </ul>
            </section>

            {/* Governing Law */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Gavel className="w-6 h-6 text-primary" />
                10. Governing Law and Disputes
              </h2>
              <p className="text-muted-foreground mb-4">
                This Agreement is governed by and construed in accordance with the laws of the Province of Saskatchewan 
                and the federal laws of Canada applicable therein.
              </p>
              <p className="text-muted-foreground mb-4">
                Any disputes arising from this Agreement shall be resolved through:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
                <li>Good faith negotiation between the parties</li>
                <li>Mediation administered by an agreed-upon mediator</li>
                <li>Binding arbitration in accordance with the Arbitration Act of Saskatchewan</li>
              </ol>
              <p className="text-muted-foreground">
                You agree to waive your right to participate in class action lawsuits against SaskTask.
              </p>
            </section>

            {/* Entire Agreement */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">11. Entire Agreement</h2>
              <p className="text-muted-foreground mb-4">
                This Independent Contractor Agreement, together with the Terms of Service, Privacy Policy, and 
                Community Guidelines, constitutes the entire agreement between you and SaskTask regarding your 
                use of the platform as a Task Doer.
              </p>
              <p className="text-muted-foreground">
                This Agreement supersedes any prior agreements, representations, or understandings. If any provision 
                of this Agreement is held to be unenforceable, the remaining provisions will continue in full force and effect.
              </p>
            </section>

            {/* Contact */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">12. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                For questions about this Independent Contractor Agreement, please contact:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>SaskTask Legal Department</strong><br />
                  Email: <a href="mailto:legal@sasktask.com" className="text-primary hover:underline">legal@sasktask.com</a><br />
                  Address: Saskatchewan, Canada
                </p>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className="bg-primary/5 border-2 border-primary/20 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-primary">Acknowledgment</h2>
              <p className="text-muted-foreground">
                BY REGISTERING AS A TASK DOER ON SASKTASK, I ACKNOWLEDGE THAT I HAVE READ, UNDERSTOOD, AND AGREE TO BE 
                BOUND BY THIS INDEPENDENT CONTRACTOR AGREEMENT. I UNDERSTAND THAT I AM AN INDEPENDENT CONTRACTOR AND 
                NOT AN EMPLOYEE OF SASKTASK. I ACCEPT FULL RESPONSIBILITY FOR MY TAX OBLIGATIONS, INSURANCE REQUIREMENTS, 
                AND COMPLIANCE WITH ALL APPLICABLE LAWS AND REGULATIONS.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
