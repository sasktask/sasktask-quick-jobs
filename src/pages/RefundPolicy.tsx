import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  RefreshCw, 
  Clock, 
  XCircle, 
  CheckCircle2, 
  AlertTriangle,
  CreditCard,
  HelpCircle,
  Mail,
  CalendarX,
  CalendarCheck
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-surface">
      <SEOHead 
        title="Refund & Cancellation Policy | SaskTask"
        description="Understand SaskTask's refund and cancellation policies for Task Givers and Task Doers. Learn about our fair refund process."
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <RefreshCw className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Refund & Cancellation Policy</h1>
            <p className="text-muted-foreground">Last updated: January 2026</p>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              We understand that plans change. This policy outlines how refunds and cancellations are handled on SaskTask.
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Overview */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-primary" />
                Payment & Escrow Overview
              </h2>
              <p className="text-muted-foreground mb-4">
                When you book a task on SaskTask, your payment is held securely in escrow until the task is completed 
                and approved. This protects both Task Givers and Task Doers:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Task Givers:</strong> Your payment is protected until you confirm the task is complete</li>
                <li><strong>Task Doers:</strong> You're guaranteed payment once the Task Giver approves your work</li>
                <li><strong>Disputes:</strong> If issues arise, we mediate and determine fair resolutions</li>
              </ul>
            </section>

            {/* Task Giver Cancellations */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <CalendarX className="w-6 h-6 text-primary" />
                Task Giver Cancellation & Refunds
              </h2>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4">When You Cancel</th>
                      <th className="text-left py-3 px-4">Refund Amount</th>
                      <th className="text-left py-3 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Before Task Doer Accepts</td>
                      <td className="py-3 px-4">
                        <span className="text-green-600 font-semibold">100% refund</span>
                      </td>
                      <td className="py-3 px-4">No penalties</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">More than 24 hours before scheduled time</td>
                      <td className="py-3 px-4">
                        <span className="text-green-600 font-semibold">100% refund</span> minus $5 admin fee
                      </td>
                      <td className="py-3 px-4">Covers processing costs</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">4-24 hours before scheduled time</td>
                      <td className="py-3 px-4">
                        <span className="text-yellow-600 font-semibold">50% refund</span>
                      </td>
                      <td className="py-3 px-4">Task Doer receives 50%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Less than 4 hours before</td>
                      <td className="py-3 px-4">
                        <span className="text-red-600 font-semibold">No refund</span>
                      </td>
                      <td className="py-3 px-4">Task Doer receives full payment</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">No-show (you don't answer/aren't available)</td>
                      <td className="py-3 px-4">
                        <span className="text-red-600 font-semibold">No refund</span>
                      </td>
                      <td className="py-3 px-4">Task Doer receives full payment</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <Alert>
                <HelpCircle className="h-4 w-4" />
                <AlertTitle>How to Cancel</AlertTitle>
                <AlertDescription>
                  Go to My Bookings → Select the booking → Click "Cancel Booking" and follow the prompts.
                </AlertDescription>
              </Alert>
            </section>

            {/* Task Doer Cancellations */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <CalendarCheck className="w-6 h-6 text-primary" />
                Task Doer Cancellation Policy
              </h2>

              <p className="text-muted-foreground mb-4">
                Task Doers who cancel bookings may face the following consequences:
              </p>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4">When You Cancel</th>
                      <th className="text-left py-3 px-4">Consequence</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">More than 24 hours before</td>
                      <td className="py-3 px-4">
                        <span className="text-green-600">No penalty</span> (first 2 per month)
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">More than 24 hours before (3+ times/month)</td>
                      <td className="py-3 px-4">
                        <span className="text-yellow-600">Account warning</span>, reduced visibility
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">4-24 hours before</td>
                      <td className="py-3 px-4">
                        <span className="text-yellow-600">Account warning</span>, affects completion rate
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Less than 4 hours before</td>
                      <td className="py-3 px-4">
                        <span className="text-orange-600">Reduced visibility</span> for 7 days
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">No-show</td>
                      <td className="py-3 px-4">
                        <span className="text-red-600">Account suspension</span> pending review
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-amber-800 dark:text-amber-200 text-sm">
                  <strong>Completion Rate:</strong> Your cancellation history affects your completion rate, which is 
                  visible to Task Givers. A high completion rate leads to more bookings and higher visibility.
                </p>
              </div>
            </section>

            {/* Exceptional Circumstances */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-primary" />
                Exceptional Circumstances
              </h2>
              <p className="text-muted-foreground mb-4">
                We understand that emergencies happen. Refund or penalty waivers may be granted for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li><strong>Medical emergencies:</strong> Sudden illness, hospitalization, or family emergency</li>
                <li><strong>Severe weather:</strong> Dangerous conditions that prevent safe travel or work</li>
                <li><strong>Natural disasters:</strong> Events beyond reasonable control</li>
                <li><strong>Vehicle breakdown:</strong> Unexpected transportation failure (for Task Doers)</li>
                <li><strong>Bereavement:</strong> Death of immediate family member</li>
                <li><strong>Safety concerns:</strong> Legitimate safety issues at the task location</li>
              </ul>
              <p className="text-muted-foreground">
                To request an exception, contact support within 24 hours with documentation (medical notes, photos, etc.). 
                Exceptions are granted at SaskTask's sole discretion.
              </p>
            </section>

            {/* Dispute Refunds */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">Refunds from Disputes</h2>
              <p className="text-muted-foreground mb-4">
                If you're not satisfied with a completed task, you can open a dispute within 48 hours of task completion:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-6">
                <li>Go to the booking and select "Open Dispute"</li>
                <li>Describe the issue and provide evidence (photos, messages)</li>
                <li>The Task Doer will have 48 hours to respond</li>
                <li>If unresolved, SaskTask will review and make a decision</li>
              </ol>

              <h3 className="text-xl font-semibold mb-3">Possible Outcomes</h3>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400">Full Refund</p>
                    <p className="text-sm text-green-600 dark:text-green-500">Task not completed or significantly below expectations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-700 dark:text-yellow-400">Partial Refund</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-500">Task partially completed or minor issues</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-400">No Refund</p>
                    <p className="text-sm text-red-600 dark:text-red-500">Task completed as described, no valid complaint</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Service Fees */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">Service Fees</h2>
              <p className="text-muted-foreground mb-4">
                Important notes about service fees during refunds:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>SaskTask service fees are refundable when full refunds are issued</li>
                <li>Payment processing fees (charged by Stripe) may not be refundable</li>
                <li>Partial refunds will have service fees calculated proportionally</li>
              </ul>
            </section>

            {/* Processing Time */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" />
                Refund Processing Time
              </h2>
              <p className="text-muted-foreground mb-4">
                Once a refund is approved:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Credit/Debit Card:</strong> 5-10 business days to appear on your statement</li>
                <li><strong>SaskTask Credit:</strong> Immediate (can use for future bookings)</li>
                <li><strong>Bank Transfer:</strong> 3-5 business days</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Refund timelines depend on your payment provider. SaskTask initiates refunds within 24 hours of approval.
              </p>
            </section>

            {/* Contact */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6 text-primary" />
                Questions About Refunds?
              </h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about our refund policy or need assistance with a refund:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>SaskTask Support</strong><br />
                  Email: <a href="mailto:support@sasktask.com" className="text-primary hover:underline">support@sasktask.com</a><br />
                  Help Center: <a href="/help" className="text-primary hover:underline">sasktask.com/help</a><br />
                  Response Time: Within 24 hours
                </p>
              </div>
            </section>

            {/* Policy Changes */}
            <section className="bg-primary/5 border-2 border-primary/20 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-primary">Policy Updates</h2>
              <p className="text-muted-foreground">
                We may update this Refund & Cancellation Policy from time to time. Changes will be posted on this page 
                with an updated revision date. Continued use of SaskTask after changes constitutes acceptance of the 
                updated policy.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
