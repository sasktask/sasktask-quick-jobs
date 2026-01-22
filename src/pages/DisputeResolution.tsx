import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Scale, 
  MessageSquare, 
  Clock, 
  FileText, 
  Users, 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Mail,
  ArrowRight,
  Camera,
  FileCheck
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DisputeResolution() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-surface">
      <SEOHead 
        title="Dispute Resolution Policy | SaskTask"
        description="Learn about SaskTask's fair dispute resolution process. We help resolve conflicts between Task Givers and Task Doers."
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
              We're committed to fair and efficient dispute resolution. This policy explains how we handle 
              disagreements between Task Givers and Task Doers.
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Our Philosophy */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Our Dispute Resolution Philosophy
              </h2>
              <p className="text-muted-foreground mb-4">
                At SaskTask, we believe that most disputes can be resolved through open communication and 
                good faith negotiation. Our dispute resolution process is designed to be:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Fair:</strong> We consider both sides of every dispute impartially</li>
                <li><strong>Fast:</strong> We aim to resolve most disputes within 3-5 business days</li>
                <li><strong>Transparent:</strong> Both parties are informed throughout the process</li>
                <li><strong>Evidence-Based:</strong> Decisions are based on documentation and facts</li>
              </ul>
            </section>

            {/* Before Opening a Dispute */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-primary" />
                Step 1: Try to Resolve It Directly
              </h2>
              <p className="text-muted-foreground mb-4">
                Before opening a formal dispute, we strongly encourage you to:
              </p>
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground mb-4">
                <li>
                  <strong>Communicate:</strong> Use the in-app messaging system to discuss the issue with the 
                  other party. Often, misunderstandings can be resolved through clear communication.
                </li>
                <li>
                  <strong>Be Specific:</strong> Clearly explain what went wrong and what resolution you're seeking.
                </li>
                <li>
                  <strong>Give Time:</strong> Allow 24 hours for the other party to respond before escalating.
                </li>
                <li>
                  <strong>Document Everything:</strong> Take photos, save messages, and keep records.
                </li>
              </ol>

              <Alert>
                <HelpCircle className="h-4 w-4" />
                <AlertTitle>Many Issues Resolve Without Disputes</AlertTitle>
                <AlertDescription>
                  Over 70% of issues are resolved through direct communication. A polite message often 
                  leads to a quick resolution.
                </AlertDescription>
              </Alert>
            </section>

            {/* When to Open a Dispute */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">When to Open a Formal Dispute</h2>
              <p className="text-muted-foreground mb-4">
                You should open a formal dispute when:
              </p>

              <h3 className="text-xl font-semibold mb-3 text-primary">For Task Givers:</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Task was not completed or only partially completed</li>
                <li>Work quality is significantly below what was agreed upon</li>
                <li>Task Doer caused damage to your property</li>
                <li>Task Doer didn't show up (no-show)</li>
                <li>Task Doer was significantly late without notice</li>
                <li>Safety or trust concerns during the task</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-primary">For Task Doers:</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Task Giver refuses to release payment despite work completion</li>
                <li>Task requirements changed significantly after starting</li>
                <li>Task Giver was abusive or created unsafe conditions</li>
                <li>Task Giver wasn't present/available as agreed</li>
                <li>False or misleading task description</li>
              </ul>
            </section>

            {/* How to Open a Dispute */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Step 2: How to Open a Dispute
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
                  <div>
                    <p className="font-semibold">Go to Your Booking</p>
                    <p className="text-sm text-muted-foreground">
                      Navigate to "My Bookings" and select the relevant booking
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
                  <div>
                    <p className="font-semibold">Click "Open Dispute"</p>
                    <p className="text-sm text-muted-foreground">
                      You'll find this option in the booking details. Must be within 48 hours of task completion.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
                  <div>
                    <p className="font-semibold">Select Dispute Reason</p>
                    <p className="text-sm text-muted-foreground">
                      Choose the category that best describes your issue
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold text-sm">4</div>
                  <div>
                    <p className="font-semibold">Describe the Problem</p>
                    <p className="text-sm text-muted-foreground">
                      Provide a detailed description of what happened
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold text-sm">5</div>
                  <div>
                    <p className="font-semibold">Upload Evidence</p>
                    <p className="text-sm text-muted-foreground">
                      Add photos, screenshots, or other documentation
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold text-sm">6</div>
                  <div>
                    <p className="font-semibold">Submit</p>
                    <p className="text-sm text-muted-foreground">
                      Your dispute will be opened and the other party notified
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Evidence Guidelines */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Camera className="w-6 h-6 text-primary" />
                What Counts as Good Evidence?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-green-600 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Strong Evidence
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                    <li>Time-stamped photos (before/after)</li>
                    <li>Screenshots of messages</li>
                    <li>Video documentation</li>
                    <li>Written communication records</li>
                    <li>Third-party receipts or invoices</li>
                    <li>Witness statements</li>
                    <li>GPS/location data from the app</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-red-600 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Weak Evidence
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                    <li>Verbal claims without documentation</li>
                    <li>Edited or manipulated images</li>
                    <li>Hearsay from uninvolved parties</li>
                    <li>Evidence submitted after the deadline</li>
                    <li>Contradictory statements</li>
                    <li>General complaints without specifics</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong>💡 Pro Tip:</strong> Always take photos before starting any task and after completion. 
                  This creates a clear record of the initial and final state.
                </p>
              </div>
            </section>

            {/* Resolution Process */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" />
                Step 3: The Resolution Process
              </h2>
              
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4">Timeline</th>
                      <th className="text-left py-3 px-4">What Happens</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Day 0</td>
                      <td className="py-3 px-4">Dispute opened; other party notified via email and app</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Days 0-2</td>
                      <td className="py-3 px-4">Other party has 48 hours to respond with their side</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Days 2-3</td>
                      <td className="py-3 px-4">SaskTask reviews both sides and all evidence</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Days 3-5</td>
                      <td className="py-3 px-4">SaskTask may request additional information</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Day 5-7</td>
                      <td className="py-3 px-4">Final decision issued; payment released or refunded</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <Alert variant="default" className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-700 dark:text-amber-400">Funds on Hold</AlertTitle>
                <AlertDescription className="text-amber-600 dark:text-amber-500">
                  During the dispute resolution process, the payment is held in escrow and not released 
                  to either party until a decision is made.
                </AlertDescription>
              </Alert>
            </section>

            {/* Possible Outcomes */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileCheck className="w-6 h-6 text-primary" />
                Possible Outcomes
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-700 dark:text-green-400">Full Refund to Task Giver</h3>
                      <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                        Issued when: Task was not completed, Task Doer no-show, or significant quality issues
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Scale className="w-6 h-6 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-700 dark:text-blue-400">Partial Refund (Split Payment)</h3>
                      <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">
                        Issued when: Task was partially completed, or both parties share some responsibility
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Users className="w-6 h-6 text-purple-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-purple-700 dark:text-purple-400">Full Payment to Task Doer</h3>
                      <p className="text-sm text-purple-600 dark:text-purple-500 mt-1">
                        Issued when: Task was completed as agreed, and dispute is found to be invalid
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <ArrowRight className="w-6 h-6 text-orange-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-orange-700 dark:text-orange-400">Task Extension/Redo</h3>
                      <p className="text-sm text-orange-600 dark:text-orange-500 mt-1">
                        Issued when: Both parties agree to have the task redone or completed properly
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Appeals */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">Appealing a Decision</h2>
              <p className="text-muted-foreground mb-4">
                If you disagree with our resolution, you may appeal within 7 days:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-6">
                <li>Email <a href="mailto:disputes@sasktask.com" className="text-primary hover:underline">disputes@sasktask.com</a> with subject line "Dispute Appeal - [Booking ID]"</li>
                <li>Explain why you believe the decision was incorrect</li>
                <li>Provide any new evidence not previously submitted</li>
                <li>A senior resolution specialist will review your case</li>
              </ol>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-muted-foreground text-sm">
                  <strong>Note:</strong> Appeals are reviewed by a different team member than the original decision maker. 
                  The appeal decision is final and binding.
                </p>
              </div>
            </section>

            {/* What We Look At */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">How We Make Decisions</h2>
              <p className="text-muted-foreground mb-4">
                Our resolution team considers:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Original Task Description:</strong> What was agreed upon?</li>
                <li><strong>Message History:</strong> What did both parties communicate?</li>
                <li><strong>Evidence Submitted:</strong> Photos, screenshots, documentation</li>
                <li><strong>User History:</strong> Past disputes, ratings, and behavior patterns</li>
                <li><strong>Response Quality:</strong> Did each party cooperate with the process?</li>
                <li><strong>Reasonableness:</strong> What would a fair-minded person conclude?</li>
              </ul>
            </section>

            {/* Prohibited Conduct */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                Prohibited Conduct During Disputes
              </h2>
              <p className="text-muted-foreground mb-4">
                The following actions may result in automatic ruling against you and/or account suspension:
              </p>
              <ul className="list-disc list-inside space-y-2 text-red-600 dark:text-red-400">
                <li>Filing false or fraudulent disputes</li>
                <li>Submitting fabricated or manipulated evidence</li>
                <li>Harassing, threatening, or intimidating the other party</li>
                <li>Attempting to resolve disputes outside the platform to circumvent fees</li>
                <li>Creating multiple accounts to manipulate the outcome</li>
                <li>Retaliatory reviews or actions after a dispute decision</li>
                <li>Refusing to cooperate with the resolution process</li>
              </ul>
            </section>

            {/* Mediation and Arbitration */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6 text-primary" />
                Formal Mediation & Arbitration
              </h2>
              <p className="text-muted-foreground mb-4">
                For disputes exceeding $500 or involving complex issues, either party may request formal mediation:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Mediation is conducted by an independent third-party mediator</li>
                <li>Costs are split 50/50 between both parties</li>
                <li>Mediation sessions are conducted virtually when possible</li>
                <li>If mediation fails, binding arbitration may be required per our Terms of Service</li>
              </ul>
              <p className="text-muted-foreground">
                For disputes under $500, SaskTask's internal resolution process is final and binding.
              </p>
            </section>

            {/* Prevention Tips */}
            <section className="bg-primary/5 border-2 border-primary/20 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-primary">Preventing Disputes</h2>
              <p className="text-muted-foreground mb-4">
                The best dispute is one that never happens. Here's how to avoid issues:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-primary">For Task Givers:</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                    <li>Write clear, detailed task descriptions</li>
                    <li>Include photos of the area/project</li>
                    <li>Agree on scope before starting</li>
                    <li>Be available for questions</li>
                    <li>Inspect work before approving</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-primary">For Task Doers:</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                    <li>Ask questions before accepting</li>
                    <li>Take before/after photos</li>
                    <li>Communicate delays immediately</li>
                    <li>Don't over-promise</li>
                    <li>Confirm satisfaction before leaving</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6 text-primary" />
                Contact Our Resolution Team
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Dispute Support</h3>
                  <p className="text-muted-foreground text-sm">
                    Email: <a href="mailto:disputes@sasktask.com" className="text-primary hover:underline">disputes@sasktask.com</a><br />
                    Response Time: Within 24 hours
                  </p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">General Support</h3>
                  <p className="text-muted-foreground text-sm">
                    Email: <a href="mailto:support@sasktask.com" className="text-primary hover:underline">support@sasktask.com</a><br />
                    Help Center: <a href="/help" className="text-primary hover:underline">sasktask.com/help</a>
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
