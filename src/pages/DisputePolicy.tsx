import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Scale, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Users, 
  Shield,
  MessageSquare,
  Gavel,
  CheckCircle2,
  XCircle,
  DollarSign,
  Phone,
  Mail,
  ArrowRight,
  Info
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DisputePolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-surface">
      <SEOHead 
        title="Dispute Resolution Policy | SaskTask"
        description="Learn about SaskTask's dispute resolution process, mediation procedures, and arbitration policies for Saskatchewan and Canada."
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Scale className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Dispute Resolution Policy</h1>
            <p className="text-muted-foreground">Last updated: January 2026</p>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              A fair and transparent process for resolving disputes between Task Givers and Task Doers on the SaskTask platform.
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Saskatchewan Jurisdiction Notice */}
            <section className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <Gavel className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold mb-2 text-blue-700 dark:text-blue-400">Governing Law</h2>
                  <p className="text-blue-600 dark:text-blue-500 text-sm">
                    This Dispute Resolution Policy is governed by the laws of the Province of Saskatchewan and the federal laws 
                    of Canada applicable therein. Disputes are subject to the <strong>Saskatchewan Arbitration Act</strong>, 
                    the <strong>Consumer Protection and Business Practices Act</strong>, and applicable federal consumer protection regulations.
                  </p>
                </div>
              </div>
            </section>

            {/* Overview */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Info className="w-6 h-6 text-primary" />
                1. Policy Overview
              </h2>
              <p className="text-muted-foreground mb-4">
                SaskTask is committed to providing a fair, transparent, and efficient dispute resolution process. 
                This policy applies to all disputes arising from transactions conducted through the SaskTask platform, 
                including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Quality of services provided</li>
                <li>Non-completion or partial completion of tasks</li>
                <li>Payment disputes</li>
                <li>Damage to property during task completion</li>
                <li>Conduct and behavior issues</li>
                <li>Cancellation and refund disagreements</li>
                <li>Misrepresentation of services or qualifications</li>
              </ul>
            </section>

            {/* Resolution Timeline */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" />
                2. Resolution Timeline
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold">Initial Filing (0-24 hours)</h3>
                    <p className="text-sm text-muted-foreground">Dispute must be filed within 7 days of task completion or scheduled date</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold">Direct Negotiation (24-72 hours)</h3>
                    <p className="text-sm text-muted-foreground">Parties attempt resolution through platform messaging</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold">Platform Mediation (3-7 days)</h3>
                    <p className="text-sm text-muted-foreground">SaskTask mediator reviews evidence and facilitates resolution</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div>
                    <h3 className="font-semibold">Final Decision (7-14 days)</h3>
                    <p className="text-sm text-muted-foreground">Platform issues binding decision if mediation fails</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0">5</div>
                  <div>
                    <h3 className="font-semibold">Appeal Period (7 days after decision)</h3>
                    <p className="text-sm text-muted-foreground">Either party may appeal with new evidence only</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Resolution Stages */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                3. Resolution Stages
              </h2>
              
              <h3 className="text-xl font-semibold mb-3">Stage 1: Direct Negotiation</h3>
              <p className="text-muted-foreground mb-4">
                Parties are encouraged to resolve disputes directly through the platform's messaging system. 
                This maintains a record of all communications for potential escalation.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>All communications must remain professional and respectful</li>
                <li>Parties should clearly state their concerns and desired resolution</li>
                <li>Evidence (photos, messages, documentation) should be shared</li>
                <li>Agreements reached should be documented in writing</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Stage 2: Platform Mediation</h3>
              <p className="text-muted-foreground mb-4">
                If direct negotiation fails, either party may request platform mediation:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>A SaskTask mediator is assigned within 24 hours</li>
                <li>Both parties submit evidence and statements</li>
                <li>Mediator may request additional information</li>
                <li>Mediator proposes resolution options</li>
                <li>Mediation is non-binding at this stage</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Stage 3: Platform Decision</h3>
              <p className="text-muted-foreground mb-4">
                If mediation fails, SaskTask issues a binding decision:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Based on Terms of Service, evidence, and platform policies</li>
                <li>Decision includes reasoning and applicable policy references</li>
                <li>May include full refund, partial refund, or no refund</li>
                <li>May include account warnings or suspensions</li>
                <li>Decision is binding subject to appeal rights</li>
              </ul>
            </section>

            {/* Evidence Requirements */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                4. Evidence Requirements
              </h2>
              
              <p className="text-muted-foreground mb-4">
                To support your dispute, you may submit the following types of evidence:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Acceptable Evidence
                  </h4>
                  <ul className="text-sm text-green-600 dark:text-green-500 space-y-1">
                    <li>• Photos with timestamps</li>
                    <li>• Video recordings</li>
                    <li>• Platform message history</li>
                    <li>• Receipts and invoices</li>
                    <li>• GPS check-in/out records</li>
                    <li>• Third-party assessments</li>
                    <li>• Witness statements</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Not Acceptable
                  </h4>
                  <ul className="text-sm text-red-600 dark:text-red-500 space-y-1">
                    <li>• Edited or manipulated media</li>
                    <li>• Communications outside platform</li>
                    <li>• Hearsay without documentation</li>
                    <li>• Evidence submitted after deadline</li>
                    <li>• Irrelevant personal information</li>
                    <li>• Threatening communications</li>
                  </ul>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Evidence Deadline</AlertTitle>
                <AlertDescription>
                  All evidence must be submitted within 48 hours of dispute escalation. 
                  Late submissions may not be considered unless accompanied by a valid explanation.
                </AlertDescription>
              </Alert>
            </section>

            {/* Payment Disputes */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-primary" />
                5. Payment Dispute Procedures
              </h2>
              
              <h3 className="text-xl font-semibold mb-3">5.1 Escrow Protection</h3>
              <p className="text-muted-foreground mb-4">
                When a dispute is filed, funds in escrow are frozen until resolution:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Task Giver payment remains in secure escrow</li>
                <li>Task Doer payout is paused pending resolution</li>
                <li>No automatic releases during active disputes</li>
                <li>Platform fee is only charged upon final resolution</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">5.2 Refund Determinations</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4">Scenario</th>
                      <th className="text-left py-3 px-4">Typical Resolution</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-3 px-4">Task not started</td>
                      <td className="py-3 px-4">100% refund to Task Giver</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Task partially completed</td>
                      <td className="py-3 px-4">Prorated payment based on completion</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Quality dispute</td>
                      <td className="py-3 px-4">Case-by-case evaluation</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Task Doer no-show</td>
                      <td className="py-3 px-4">100% refund + account penalty</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Task Giver cancellation (late)</td>
                      <td className="py-3 px-4">Partial compensation to Task Doer</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Property damage</td>
                      <td className="py-3 px-4">Damage assessment + insurance claim if applicable</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Saskatchewan Consumer Protection */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                6. Saskatchewan Consumer Protection
              </h2>
              
              <p className="text-muted-foreground mb-4">
                Your rights under Saskatchewan and Canadian consumer protection laws are preserved:
              </p>
              
              <h3 className="text-xl font-semibold mb-3">6.1 Consumer Rights</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Right to fair treatment and honest disclosure</li>
                <li>Right to cancel within cooling-off periods where applicable</li>
                <li>Right to dispute unfair contract terms</li>
                <li>Right to pursue remedies under the Consumer Protection and Business Practices Act</li>
                <li>Right to file complaints with Financial and Consumer Affairs Authority of Saskatchewan</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">6.2 External Remedies</h3>
              <p className="text-muted-foreground mb-4">
                Nothing in this policy limits your right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>File a complaint with the Better Business Bureau of Saskatchewan</li>
                <li>Seek remedies through Saskatchewan's Small Claims Court (up to $30,000)</li>
                <li>File complaints with the Office of the Privacy Commissioner of Canada</li>
                <li>Report criminal matters to the RCMP or local police</li>
                <li>Pursue civil action in the Court of Queen's Bench of Saskatchewan</li>
              </ul>
            </section>

            {/* Arbitration */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Gavel className="w-6 h-6 text-primary" />
                7. Binding Arbitration
              </h2>
              
              <Alert className="mb-4 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-700 dark:text-amber-400">Important Legal Notice</AlertTitle>
                <AlertDescription className="text-amber-600 dark:text-amber-500">
                  By using SaskTask, you agree that disputes not resolved through platform mediation 
                  may be submitted to binding arbitration under the Saskatchewan Arbitration Act, 1992.
                </AlertDescription>
              </Alert>

              <h3 className="text-xl font-semibold mb-3">7.1 Arbitration Process</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Arbitration is conducted in English in Saskatoon, Saskatchewan</li>
                <li>Virtual arbitration available for parties outside Saskatchewan</li>
                <li>Single arbitrator appointed by mutual agreement or ADR Institute of Saskatchewan</li>
                <li>Arbitration fees split equally unless arbitrator decides otherwise</li>
                <li>Decision is final and binding, enforceable as a court judgment</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">7.2 Class Action Waiver</h3>
              <p className="text-muted-foreground mb-4">
                To the fullest extent permitted by law, you agree to pursue any dispute individually 
                and not as part of a class action or representative proceeding.
              </p>

              <h3 className="text-xl font-semibold mb-3">7.3 Exceptions to Arbitration</h3>
              <p className="text-muted-foreground">
                Either party may seek injunctive relief in court for: intellectual property infringement, 
                unauthorized access, data security breaches, or other claims requiring immediate court intervention.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-primary" />
                8. Contact Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Dispute Resolution Team
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Email: <a href="mailto:disputes@sasktask.com" className="text-primary hover:underline">disputes@sasktask.com</a><br />
                    Response Time: Within 24 hours
                  </p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    Urgent Disputes
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Phone: (306) 555-TASK<br />
                    Hours: Monday-Friday 9am-5pm CST
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h3 className="font-semibold mb-2">External Resources</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    <ArrowRight className="w-3 h-3 inline mr-1" />
                    <a href="https://www.fcaa.gov.sk.ca/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Financial and Consumer Affairs Authority of Saskatchewan
                    </a>
                  </li>
                  <li>
                    <ArrowRight className="w-3 h-3 inline mr-1" />
                    <a href="https://adrsask.ca/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      ADR Institute of Saskatchewan
                    </a>
                  </li>
                  <li>
                    <ArrowRight className="w-3 h-3 inline mr-1" />
                    <a href="https://saskatoon.ca/community-culture-heritage/community-safety/conflict-resolution-services" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Saskatoon Conflict Resolution Services
                    </a>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
