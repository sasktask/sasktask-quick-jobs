import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FileText, Shield, Scale, AlertTriangle, Users, CreditCard, Ban, Globe, Lock, Mail } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-surface">
      <SEOHead 
        title="Terms of Service | SaskTask"
        description="Read our comprehensive Terms of Service governing the use of SaskTask platform in Canada and worldwide."
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: January 15, 2026</p>
            <p className="text-sm text-muted-foreground mt-2">Effective Date: January 15, 2026</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Introduction */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6 text-primary" />
                1. Introduction and Acceptance
              </h2>
              <p className="text-muted-foreground mb-4">
                Welcome to SaskTask ("Platform", "we", "us", or "our"). These Terms of Service ("Terms", "Agreement") constitute a legally binding agreement between you ("User", "you", or "your") and SaskTask, governing your access to and use of the SaskTask platform, website, mobile applications, and all related services.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>IMPORTANT:</strong> BY CREATING AN ACCOUNT, ACCESSING, OR USING THE SASKTASK PLATFORM, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE, OUR PRIVACY POLICY, AND ALL APPLICABLE LAWS AND REGULATIONS.
              </p>
              <p className="text-muted-foreground mb-4">
                If you do not agree to these Terms, you must not access or use the Platform. These Terms apply to all users, including Task Givers (those who post tasks) and Task Doers (those who complete tasks).
              </p>
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                <p className="text-amber-800 dark:text-amber-200 text-sm">
                  <strong>Legal Notice:</strong> This Agreement is governed by the laws of Canada, specifically the Province of Saskatchewan, without regard to conflict of law principles. By using this Platform, you consent to the exclusive jurisdiction of the courts of Saskatchewan, Canada.
                </p>
              </div>
            </section>

            {/* Definitions */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">2. Definitions</h2>
              <ul className="list-disc list-inside space-y-3 text-muted-foreground">
                <li><strong>"Task Giver"</strong> means any User who posts a task on the Platform seeking services from a Task Doer.</li>
                <li><strong>"Task Doer"</strong> means any User who offers to perform or performs tasks posted by Task Givers on the Platform.</li>
                <li><strong>"Task"</strong> means any job, service, or work posted on the Platform by a Task Giver.</li>
                <li><strong>"Booking"</strong> means the agreement between a Task Giver and Task Doer for the completion of a specific Task.</li>
                <li><strong>"Service Fee"</strong> means the fees charged by SaskTask for facilitating transactions on the Platform.</li>
                <li><strong>"Escrow"</strong> means the secure holding of funds by SaskTask until Task completion and approval.</li>
                <li><strong>"Content"</strong> means any text, images, videos, reviews, ratings, or other materials submitted to the Platform.</li>
              </ul>
            </section>

            {/* Eligibility */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                3. Eligibility and Account Requirements
              </h2>
              <h3 className="text-xl font-semibold mb-3">3.1 Age Requirement</h3>
              <p className="text-muted-foreground mb-4">
                You must be at least eighteen (18) years of age to create an account and use the Platform. By creating an account, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into this Agreement.
              </p>
              
              <h3 className="text-xl font-semibold mb-3">3.2 Account Registration</h3>
              <p className="text-muted-foreground mb-4">To use the Platform, you must:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li>Provide accurate, current, and complete registration information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and accept responsibility for all activities under your account</li>
                <li>Immediately notify SaskTask of any unauthorized use of your account</li>
                <li>Not create more than one account or create an account for someone else without permission</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">3.3 Verification Requirements</h3>
              <p className="text-muted-foreground mb-4">
                Task Doers must complete our verification process, which may include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Identity verification with government-issued identification</li>
                <li>Background check consent and completion (where applicable by law)</li>
                <li>Proof of insurance for certain task categories</li>
                <li>Skills and certification verification</li>
                <li>Phone number and email verification</li>
              </ul>
            </section>

            {/* Platform Rules */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                4. Platform Rules and User Conduct
              </h2>
              
              <h3 className="text-xl font-semibold mb-3">4.1 Task Giver Obligations</h3>
              <p className="text-muted-foreground mb-2">As a Task Giver, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li>Provide accurate, complete, and lawful task descriptions</li>
                <li>Set fair and reasonable compensation for tasks</li>
                <li>Pay the agreed-upon amount upon satisfactory task completion</li>
                <li>Respond promptly to Task Doer inquiries and communications</li>
                <li>Provide a safe working environment for in-person tasks</li>
                <li>Not request illegal, dangerous, or inappropriate services</li>
                <li>Treat Task Doers with respect and professionalism</li>
                <li>Provide all necessary materials, tools, and information for task completion (unless otherwise agreed)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">4.2 Task Doer Obligations</h3>
              <p className="text-muted-foreground mb-2">As a Task Doer, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li>Accurately represent your skills, qualifications, and experience</li>
                <li>Complete accepted tasks to the best of your ability and as described</li>
                <li>Communicate promptly and professionally with Task Givers</li>
                <li>Arrive on time for scheduled tasks</li>
                <li>Maintain appropriate insurance coverage where required</li>
                <li>Comply with all applicable laws, regulations, and licensing requirements</li>
                <li>Report any issues or concerns immediately</li>
                <li>Not subcontract tasks without Task Giver approval</li>
                <li>Maintain confidentiality of Task Giver information</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">4.3 Prohibited Activities</h3>
              <p className="text-muted-foreground mb-2">All Users are prohibited from:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Posting or accepting illegal tasks or services</li>
                <li>Circumventing the Platform's payment system</li>
                <li>Harassing, threatening, or discriminating against other Users</li>
                <li>Posting false, misleading, or fraudulent information</li>
                <li>Creating multiple accounts or impersonating others</li>
                <li>Using automated systems or bots to access the Platform</li>
                <li>Sharing account credentials with others</li>
                <li>Soliciting personal information from other Users for non-Platform purposes</li>
                <li>Engaging in price manipulation or bid rigging</li>
                <li>Posting spam, advertisements, or promotional content</li>
                <li>Violating intellectual property rights</li>
              </ul>
            </section>

            {/* Payment Terms */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-primary" />
                5. Payment Terms and Fees
              </h2>
              
              <h3 className="text-xl font-semibold mb-3">5.1 Payment Processing</h3>
              <p className="text-muted-foreground mb-4">
                All payments are processed through our secure payment partner, Stripe. By using the Platform, you agree to Stripe's terms of service. Task Giver payments are held in escrow until task completion is confirmed.
              </p>

              <h3 className="text-xl font-semibold mb-3">5.2 Service Fees</h3>
              <p className="text-muted-foreground mb-4">
                SaskTask charges the following fees:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li><strong>Task Doer Service Fee:</strong> A percentage of the task amount is deducted from Task Doer earnings</li>
                <li><strong>Payment Processing Fee:</strong> Standard payment processing fees apply to all transactions</li>
                <li><strong>Premium Features:</strong> Additional fees may apply for optional premium services</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">5.3 Deposits</h3>
              <p className="text-muted-foreground mb-4">
                Certain tasks may require a deposit from the Task Giver. Deposits are:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li>Held securely in escrow until task completion</li>
                <li>Applied toward the final task payment</li>
                <li>Refundable according to our cancellation policy</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">5.4 Payouts</h3>
              <p className="text-muted-foreground mb-4">
                Task Doers receive payment after:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Task completion is confirmed by the Task Giver</li>
                <li>Any applicable dispute period has passed</li>
                <li>All verification requirements are met</li>
                <li>A valid payout method is configured</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">5.5 Taxes</h3>
              <p className="text-muted-foreground">
                Users are solely responsible for determining, collecting, reporting, and remitting all applicable taxes. SaskTask may issue tax documentation (such as T4A slips in Canada) where required by law. Users should consult with a tax professional regarding their obligations.
              </p>
            </section>

            {/* Cancellation Policy */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Ban className="w-6 h-6 text-primary" />
                6. Cancellation and Refund Policy
              </h2>
              
              <h3 className="text-xl font-semibold mb-3">6.1 Task Giver Cancellations</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li><strong>Before Acceptance:</strong> Full refund, no penalties</li>
                <li><strong>More than 24 hours before scheduled time:</strong> Full refund minus administrative fee</li>
                <li><strong>Less than 24 hours before scheduled time:</strong> Partial refund (50%)</li>
                <li><strong>No-show or same-day cancellation:</strong> No refund</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">6.2 Task Doer Cancellations</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li><strong>More than 24 hours before:</strong> No penalty (first 2 per month)</li>
                <li><strong>Less than 24 hours before:</strong> Account warning</li>
                <li><strong>Repeated cancellations:</strong> May result in account suspension</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">6.3 Exceptional Circumstances</h3>
              <p className="text-muted-foreground">
                Refunds or waivers may be granted in cases of documented emergencies, severe weather, or other exceptional circumstances at SaskTask's sole discretion.
              </p>
            </section>

            {/* Dispute Resolution */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6 text-primary" />
                7. Dispute Resolution
              </h2>
              
              <h3 className="text-xl font-semibold mb-3">7.1 Resolution Process</h3>
              <p className="text-muted-foreground mb-4">
                In the event of a dispute between Users:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
                <li><strong>Direct Communication:</strong> Users should first attempt to resolve disputes directly</li>
                <li><strong>Platform Mediation:</strong> If unresolved, either party may request SaskTask mediation</li>
                <li><strong>Decision:</strong> SaskTask will review evidence and make a binding decision</li>
                <li><strong>Appeal:</strong> Decisions may be appealed within 7 days with new evidence</li>
              </ol>

              <h3 className="text-xl font-semibold mb-3">7.2 Arbitration Agreement</h3>
              <p className="text-muted-foreground mb-4">
                By using the Platform, you agree that any dispute, claim, or controversy arising out of or relating to these Terms or your use of the Platform shall be resolved by binding arbitration in accordance with the Arbitration Act of Saskatchewan, rather than in court. You waive your right to participate in class action lawsuits.
              </p>

              <h3 className="text-xl font-semibold mb-3">7.3 Exceptions</h3>
              <p className="text-muted-foreground">
                Nothing in this section prevents either party from seeking injunctive or other equitable relief in court for matters relating to intellectual property, data security, or unauthorized access.
              </p>
            </section>

            {/* Liability */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-primary" />
                8. Limitation of Liability and Disclaimers
              </h2>
              
              <h3 className="text-xl font-semibold mb-3">8.1 Platform Role</h3>
              <p className="text-muted-foreground mb-4">
                SaskTask is a platform that connects Task Givers and Task Doers. We are not a party to the agreements between Users and do not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li>Employ, direct, or control Task Doers</li>
                <li>Guarantee the quality, safety, or legality of tasks</li>
                <li>Guarantee the qualifications, identity, or abilities of Users</li>
                <li>Guarantee that tasks will be completed satisfactorily</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">8.2 Disclaimer of Warranties</h3>
              <p className="text-muted-foreground mb-4">
                THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
              </p>

              <h3 className="text-xl font-semibold mb-3">8.3 Limitation of Liability</h3>
              <p className="text-muted-foreground mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, SASKTASK AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
                <li>Damages exceeding the amount paid by you to SaskTask in the past twelve (12) months</li>
                <li>Any damages arising from User conduct or content</li>
                <li>Any damages arising from unauthorized access to your account</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">8.4 Indemnification</h3>
              <p className="text-muted-foreground">
                You agree to indemnify, defend, and hold harmless SaskTask and its affiliates, officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Platform, your violation of these Terms, or your violation of any rights of another.
              </p>
            </section>

            {/* Privacy and Data */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-primary" />
                9. Privacy and Data Protection
              </h2>
              
              <h3 className="text-xl font-semibold mb-3">9.1 Privacy Policy</h3>
              <p className="text-muted-foreground mb-4">
                Your use of the Platform is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our data collection and use practices.
              </p>

              <h3 className="text-xl font-semibold mb-3">9.2 Canadian Privacy Laws</h3>
              <p className="text-muted-foreground mb-4">
                We comply with the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable provincial privacy legislation, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li>Collection of personal information only with consent and for identified purposes</li>
                <li>Protection of personal information with appropriate security measures</li>
                <li>Access to your personal information upon request</li>
                <li>Correction of inaccurate personal information</li>
                <li>Data breach notification where required by law</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">9.3 User Content</h3>
              <p className="text-muted-foreground">
                By posting Content on the Platform, you grant SaskTask a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute such Content in connection with operating and promoting the Platform. You retain ownership of your Content and are responsible for ensuring it does not violate any laws or third-party rights.
              </p>
            </section>

            {/* International Use */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary" />
                10. International Use
              </h2>
              
              <h3 className="text-xl font-semibold mb-3">10.1 Geographic Availability</h3>
              <p className="text-muted-foreground mb-4">
                While the Platform is based in Canada, it may be accessible internationally. Users outside Canada are responsible for compliance with their local laws regarding:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li>Online platform usage</li>
                <li>Service provision and receipt</li>
                <li>Tax obligations</li>
                <li>Labor and employment laws</li>
                <li>Consumer protection regulations</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">10.2 Export Compliance</h3>
              <p className="text-muted-foreground">
                You agree to comply with all applicable export and import laws and regulations, including Canadian export controls and international sanctions programs.
              </p>
            </section>

            {/* Termination */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">11. Account Termination</h2>
              
              <h3 className="text-xl font-semibold mb-3">11.1 User Termination</h3>
              <p className="text-muted-foreground mb-4">
                You may close your account at any time through your account settings. Upon closure:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li>Outstanding payments will be processed</li>
                <li>Active bookings must be completed or properly cancelled</li>
                <li>Some information may be retained as required by law</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">11.2 Platform Termination</h3>
              <p className="text-muted-foreground mb-4">
                SaskTask may suspend or terminate your account immediately if you:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li>Violate these Terms or any Platform policies</li>
                <li>Engage in fraudulent or illegal activity</li>
                <li>Pose a safety risk to other Users</li>
                <li>Receive multiple negative reviews or complaints</li>
                <li>Fail to complete verification requirements</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">11.3 Effect of Termination</h3>
              <p className="text-muted-foreground">
                Upon termination, your right to use the Platform ceases immediately. Sections relating to indemnification, limitation of liability, dispute resolution, and any provisions that by their nature should survive, will survive termination.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">12. Modifications to Terms</h2>
              <p className="text-muted-foreground mb-4">
                SaskTask reserves the right to modify these Terms at any time. We will provide notice of material changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li>Posting the updated Terms on the Platform</li>
                <li>Sending an email notification to registered Users</li>
                <li>Displaying a prominent notice on the Platform</li>
              </ul>
              <p className="text-muted-foreground">
                Your continued use of the Platform after the effective date of any modifications constitutes your acceptance of the updated Terms. If you do not agree to the modified Terms, you must stop using the Platform and close your account.
              </p>
            </section>

            {/* Intellectual Property */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">13. Intellectual Property</h2>
              <p className="text-muted-foreground mb-4">
                All content, features, and functionality of the Platform, including but not limited to text, graphics, logos, icons, images, audio clips, software, and the compilation thereof, are the exclusive property of SaskTask or its licensors and are protected by Canadian and international intellectual property laws.
              </p>
              <p className="text-muted-foreground">
                You may not copy, modify, distribute, sell, or lease any part of our Platform or included software, nor may you reverse engineer or attempt to extract the source code of that software, unless laws prohibit these restrictions or you have our written permission.
              </p>
            </section>

            {/* General Provisions */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">14. General Provisions</h2>
              
              <h3 className="text-xl font-semibold mb-3">14.1 Entire Agreement</h3>
              <p className="text-muted-foreground mb-4">
                These Terms, together with our Privacy Policy and any other policies incorporated by reference, constitute the entire agreement between you and SaskTask regarding the Platform.
              </p>

              <h3 className="text-xl font-semibold mb-3">14.2 Severability</h3>
              <p className="text-muted-foreground mb-4">
                If any provision of these Terms is held to be unenforceable, the remaining provisions will continue in full force and effect.
              </p>

              <h3 className="text-xl font-semibold mb-3">14.3 Waiver</h3>
              <p className="text-muted-foreground mb-4">
                The failure of SaskTask to enforce any right or provision of these Terms will not be deemed a waiver of such right or provision.
              </p>

              <h3 className="text-xl font-semibold mb-3">14.4 Assignment</h3>
              <p className="text-muted-foreground mb-4">
                You may not assign or transfer your rights under these Terms without SaskTask's prior written consent. SaskTask may assign its rights and obligations without restriction.
              </p>

              <h3 className="text-xl font-semibold mb-3">14.5 Force Majeure</h3>
              <p className="text-muted-foreground">
                SaskTask shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including natural disasters, wars, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, pandemics, strikes, or shortages of transportation, facilities, fuel, energy, labor, or materials.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6 text-primary" />
                15. Contact Information
              </h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>SaskTask Legal Department</strong><br />
                  Email: <a href="mailto:legal@sasktask.com" className="text-primary hover:underline">legal@sasktask.com</a><br />
                  Address: Saskatchewan, Canada<br />
                  <br />
                  For general inquiries: <a href="mailto:support@sasktask.com" className="text-primary hover:underline">support@sasktask.com</a>
                </p>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className="bg-primary/5 border-2 border-primary/20 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-primary">Acknowledgment</h2>
              <p className="text-muted-foreground">
                BY CREATING AN ACCOUNT ON SASKTASK, I ACKNOWLEDGE THAT I HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE. I UNDERSTAND THAT THESE TERMS CONSTITUTE A LEGALLY BINDING AGREEMENT BETWEEN ME AND SASKTASK. I FURTHER ACKNOWLEDGE THAT I AM AT LEAST 18 YEARS OF AGE AND HAVE THE LEGAL CAPACITY TO ENTER INTO THIS AGREEMENT.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
