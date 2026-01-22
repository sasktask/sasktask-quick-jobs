import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Copyright, 
  FileWarning, 
  AlertTriangle,
  Shield,
  Mail,
  Clock,
  Scale,
  FileCheck,
  Flag
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CopyrightDMCA() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-surface">
      <SEOHead 
        title="Copyright & DMCA Policy | SaskTask"
        description="SaskTask's copyright policy and DMCA takedown procedures. Learn how to report intellectual property violations."
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Copyright className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Copyright & DMCA Policy</h1>
            <p className="text-muted-foreground">Last updated: January 2026</p>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              SaskTask respects intellectual property rights and expects our users to do the same. 
              This policy explains how we handle copyright claims and DMCA takedown requests.
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Overview */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Our Commitment to Intellectual Property
              </h2>
              <p className="text-muted-foreground mb-4">
                SaskTask ("we," "us," or "our") complies with the Digital Millennium Copyright Act (DMCA) 
                and the Canadian Copyright Act. We respond promptly to claims of copyright infringement 
                that are reported in accordance with applicable law.
              </p>
              <p className="text-muted-foreground">
                We will remove or disable access to material that we believe in good faith to be copyrighted 
                material that has been illegally copied and distributed.
              </p>
            </section>

            {/* What is Protected */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">Types of Protected Content</h2>
              <p className="text-muted-foreground mb-4">
                The following types of content are protected by copyright law and must not be used 
                without proper authorization:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Photographs and images</li>
                  <li>Written content and text</li>
                  <li>Videos and animations</li>
                  <li>Music and audio recordings</li>
                  <li>Software and code</li>
                </ul>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Logos and brand assets</li>
                  <li>Artwork and illustrations</li>
                  <li>Designs and templates</li>
                  <li>Databases and compilations</li>
                  <li>Training materials and courses</li>
                </ul>
              </div>
            </section>

            {/* User Responsibilities */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">User Responsibilities</h2>
              <p className="text-muted-foreground mb-4">
                As a SaskTask user, you are responsible for ensuring that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>You own or have rights to all content you upload (profile pictures, portfolio items)</li>
                <li>You do not use copyrighted material without permission when completing tasks</li>
                <li>You do not copy or redistribute other users' content without authorization</li>
                <li>Work products you create for clients respect third-party intellectual property</li>
                <li>You do not falsely represent yourself as the owner of others' work</li>
              </ul>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Violation Consequences</AlertTitle>
                <AlertDescription>
                  Users who repeatedly infringe copyrights will have their accounts terminated. 
                  SaskTask reserves the right to suspend or terminate any account at any time for 
                  intellectual property violations.
                </AlertDescription>
              </Alert>
            </section>

            {/* DMCA Takedown Notice */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileWarning className="w-6 h-6 text-primary" />
                Filing a DMCA Takedown Notice
              </h2>
              <p className="text-muted-foreground mb-4">
                If you believe that your copyrighted work has been copied in a way that constitutes 
                copyright infringement on SaskTask, please submit a written notice containing:
              </p>

              <ol className="list-decimal list-inside space-y-3 text-muted-foreground mb-6">
                <li>
                  <strong>Identification of the copyrighted work:</strong> A description of the copyrighted 
                  work that you claim has been infringed (or a list if multiple works are covered)
                </li>
                <li>
                  <strong>Identification of the infringing material:</strong> The URL(s) or other specific 
                  location on SaskTask where the material you claim is infringing is located
                </li>
                <li>
                  <strong>Your contact information:</strong> Your name, address, telephone number, and email address
                </li>
                <li>
                  <strong>Good faith statement:</strong> A statement that you have a good faith belief that 
                  the disputed use is not authorized by the copyright owner, its agent, or the law
                </li>
                <li>
                  <strong>Accuracy statement:</strong> A statement, under penalty of perjury, that the 
                  information in your notice is accurate and that you are the copyright owner or authorized 
                  to act on behalf of the copyright owner
                </li>
                <li>
                  <strong>Physical or electronic signature:</strong> Your physical or electronic signature
                </li>
              </ol>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Send DMCA Notices To:</h3>
                <p className="text-muted-foreground">
                  <strong>SaskTask DMCA Agent</strong><br />
                  Email: <a href="mailto:dmca@sasktask.com" className="text-primary hover:underline">dmca@sasktask.com</a><br />
                  Subject Line: "DMCA Takedown Notice"<br /><br />
                  <span className="text-sm">
                    Please include "DMCA Takedown Notice" in the subject line to ensure prompt processing.
                  </span>
                </p>
              </div>
            </section>

            {/* Counter-Notification */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileCheck className="w-6 h-6 text-primary" />
                DMCA Counter-Notification
              </h2>
              <p className="text-muted-foreground mb-4">
                If you believe your content was wrongfully removed due to a DMCA notice, you may file 
                a counter-notification. Your counter-notification must include:
              </p>

              <ol className="list-decimal list-inside space-y-3 text-muted-foreground mb-6">
                <li>Your physical or electronic signature</li>
                <li>Identification of the material that was removed and its location before removal</li>
                <li>
                  A statement under penalty of perjury that you have a good faith belief that the material 
                  was removed or disabled as a result of mistake or misidentification
                </li>
                <li>
                  Your name, address, and telephone number, and a statement that you consent to the 
                  jurisdiction of the Federal District Court for the judicial district in which your address 
                  is located, or if your address is outside Canada/United States, for any judicial district 
                  in which SaskTask may be found
                </li>
                <li>
                  A statement that you will accept service of process from the person who provided the 
                  original DMCA notification
                </li>
              </ol>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-amber-800 dark:text-amber-200 text-sm">
                  <strong>⚠️ Important:</strong> Filing a false counter-notification may result in legal 
                  liability. Consult with a legal professional before submitting a counter-notification.
                </p>
              </div>
            </section>

            {/* Processing Timeline */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" />
                Processing Timeline
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-medium">DMCA Notice Received</p>
                    <p className="text-sm text-muted-foreground">
                      We review the notice within 24-48 hours for completeness
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Content Removed</p>
                    <p className="text-sm text-muted-foreground">
                      Infringing content is removed or access is disabled
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-medium">User Notified</p>
                    <p className="text-sm text-muted-foreground">
                      The user who posted the content is notified and may file a counter-notification
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">4</span>
                  </div>
                  <div>
                    <p className="font-medium">Counter-Notification Period</p>
                    <p className="text-sm text-muted-foreground">
                      User has 10-14 business days to submit a counter-notification
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">5</span>
                  </div>
                  <div>
                    <p className="font-medium">Resolution</p>
                    <p className="text-sm text-muted-foreground">
                      Content remains down, is restored, or legal proceedings determine outcome
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Canadian Copyright Act */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6 text-primary" />
                Canadian Copyright Act Compliance
              </h2>
              <p className="text-muted-foreground mb-4">
                In addition to DMCA compliance, SaskTask complies with the Canadian Copyright Act (R.S.C., 1985, c. C-42) 
                and its notice-and-notice regime:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  <strong>Notice Forwarding:</strong> We forward notices of claimed infringement to users 
                  in accordance with Canada's notice-and-notice system
                </li>
                <li>
                  <strong>Record Keeping:</strong> We maintain records of notices received and forwarded 
                  as required by Canadian law
                </li>
                <li>
                  <strong>User Information:</strong> We do not disclose user information to claimants 
                  without a valid court order or other legal requirement
                </li>
                <li>
                  <strong>Fair Dealing:</strong> We recognize that fair dealing for purposes such as research, 
                  private study, criticism, review, or news reporting is not infringement
                </li>
              </ul>
            </section>

            {/* Report Other IP Violations */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Flag className="w-6 h-6 text-primary" />
                Other Intellectual Property Concerns
              </h2>
              <p className="text-muted-foreground mb-4">
                For intellectual property issues other than copyright infringement:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li><strong>Trademark Infringement:</strong> Unauthorized use of trademarks in profiles or listings</li>
                <li><strong>Trade Secret Violations:</strong> Disclosure of confidential business information</li>
                <li><strong>Patent Concerns:</strong> Infringement of patented methods or inventions</li>
                <li><strong>Publicity Rights:</strong> Unauthorized use of a person's name or likeness</li>
              </ul>
              <p className="text-muted-foreground">
                Contact <a href="mailto:legal@sasktask.com" className="text-primary hover:underline">legal@sasktask.com</a> 
                {" "}with a detailed description of your concern.
              </p>
            </section>

            {/* Repeat Infringers */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">Repeat Infringer Policy</h2>
              <p className="text-muted-foreground mb-4">
                SaskTask will terminate, in appropriate circumstances, the accounts of users who are 
                repeat infringers of intellectual property rights. Our repeat infringer policy:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  <strong>First Offense:</strong> Warning and content removal; user educated on copyright compliance
                </li>
                <li>
                  <strong>Second Offense:</strong> Temporary account suspension (7-30 days)
                </li>
                <li>
                  <strong>Third Offense:</strong> Permanent account termination
                </li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We reserve the right to skip steps and immediately terminate accounts for severe or 
                intentional infringement.
              </p>
            </section>

            {/* Contact */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6 text-primary" />
                Contact Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">DMCA Notices</h3>
                  <p className="text-muted-foreground text-sm">
                    <strong>SaskTask DMCA Agent</strong><br />
                    Email: <a href="mailto:dmca@sasktask.com" className="text-primary hover:underline">dmca@sasktask.com</a>
                  </p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Other IP Concerns</h3>
                  <p className="text-muted-foreground text-sm">
                    <strong>SaskTask Legal</strong><br />
                    Email: <a href="mailto:legal@sasktask.com" className="text-primary hover:underline">legal@sasktask.com</a>
                  </p>
                </div>
              </div>
            </section>

            {/* Disclaimer */}
            <section className="bg-primary/5 border-2 border-primary/20 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-primary">Legal Disclaimer</h2>
              <p className="text-muted-foreground text-sm">
                This policy is provided for informational purposes only and does not constitute legal advice. 
                If you have specific legal questions about copyright or intellectual property, please consult 
                with a qualified attorney. SaskTask's interpretation and application of this policy is at its 
                sole discretion.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
