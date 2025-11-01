import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Shield } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-surface">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: January 2025</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
              <p className="text-muted-foreground mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Name, email address, and phone number</li>
                <li>Profile information including bio, skills, and experience</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Verification documents (ID, insurance, certifications)</li>
                <li>Task details, messages, and reviews</li>
                <li>Location data when using our services</li>
              </ul>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Verify identity and conduct background checks</li>
                <li>Monitor and analyze trends and usage</li>
                <li>Detect and prevent fraudulent activities</li>
                <li>Personalize your experience on the platform</li>
              </ul>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">3. Information Sharing and Disclosure</h2>
              <p className="text-muted-foreground mb-4">
                We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>With other users as necessary to complete tasks</li>
                <li>With service providers who perform services on our behalf</li>
                <li>With background check providers for verification</li>
                <li>With payment processors (Stripe) for transaction processing</li>
                <li>If required by law or to protect rights and safety</li>
                <li>In connection with a merger, sale, or acquisition</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet is 100% secure. We use encryption, secure servers, and regular security audits to protect your data.
              </p>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">5. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. Verification documents are retained for compliance purposes.
              </p>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">6. Your Rights and Choices</h2>
              <p className="text-muted-foreground mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Access and update your account information</li>
                <li>Request a copy of your personal data</li>
                <li>Request deletion of your account and data</li>
                <li>Opt out of marketing communications</li>
                <li>Disable location services (may limit functionality)</li>
                <li>Request correction of inaccurate information</li>
              </ul>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">7. Cookies and Tracking</h2>
              <p className="text-muted-foreground">
                We use cookies and similar tracking technologies to collect information about your browsing activities. You can control cookies through your browser settings, though this may affect functionality.
              </p>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">8. Third-Party Links</h2>
              <p className="text-muted-foreground">
                Our service may contain links to third-party websites. We are not responsible for the privacy practices of these sites. We encourage you to read their privacy policies.
              </p>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our service is not directed to individuals under 18. We do not knowingly collect personal information from children. If you become aware of any data we have collected from children, please contact us.
              </p>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">10. International Data Transfers</h2>
              <p className="text-muted-foreground">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information.
              </p>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">11. Changes to Privacy Policy</h2>
              <p className="text-muted-foreground">
                We may update this privacy policy from time to time. We will notify you of significant changes by email or through the platform. Your continued use after changes constitutes acceptance.
              </p>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy or our data practices, please contact us at:
                <br />
                <a href="mailto:privacy@sasktask.com" className="text-primary hover:underline">
                  privacy@sasktask.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}