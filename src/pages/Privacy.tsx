import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Shield, 
  Lock, 
  Eye, 
  FileText, 
  Server, 
  Clock, 
  Globe, 
  AlertTriangle, 
  Mail, 
  Users,
  Database,
  ShieldCheck,
  MapPin,
  CreditCard,
  MessageSquare,
  CheckCircle2,
  Scale
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-surface">
      <SEOHead 
        title="Privacy Policy | SaskTask"
        description="Learn how SaskTask collects, uses, and protects your personal information. PIPEDA compliant privacy practices for Canadian users."
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: January 2026</p>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information in compliance with Canadian privacy laws.
            </p>
          </div>

          {/* Quick Links */}
          <div className="bg-muted/50 p-6 rounded-lg mb-8">
            <h2 className="font-bold mb-4">Quick Navigation</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <a href="#information-collect" className="text-primary hover:underline">Information We Collect</a>
              <a href="#how-we-use" className="text-primary hover:underline">How We Use It</a>
              <a href="#legal-basis" className="text-primary hover:underline">Legal Basis</a>
              <a href="#sharing" className="text-primary hover:underline">Information Sharing</a>
              <a href="#retention" className="text-primary hover:underline">Data Retention</a>
              <a href="#your-rights" className="text-primary hover:underline">Your Rights</a>
              <a href="#security" className="text-primary hover:underline">Data Security</a>
              <a href="#international" className="text-primary hover:underline">International Transfers</a>
              <a href="#breach" className="text-primary hover:underline">Breach Notification</a>
              <a href="#contact" className="text-primary hover:underline">Contact Us</a>
            </div>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* PIPEDA Compliance Banner */}
            <section className="bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <ShieldCheck className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold mb-2 text-green-700 dark:text-green-400">PIPEDA Compliant</h2>
                  <p className="text-green-600 dark:text-green-500 text-sm">
                    SaskTask operates in compliance with Canada's Personal Information Protection and Electronic Documents Act (PIPEDA) 
                    and applicable provincial privacy legislation including Saskatchewan's Freedom of Information and Protection of Privacy Act (FOIP), 
                    Alberta's Personal Information Protection Act (PIPA), British Columbia's Personal Information Protection Act (PIPA), 
                    and Quebec's Law 25.
                  </p>
                </div>
              </div>
            </section>

            {/* PIPEDA Principles */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6 text-primary" />
                PIPEDA's 10 Fair Information Principles
              </h2>
              <p className="text-muted-foreground mb-4">
                SaskTask adheres to PIPEDA's 10 Fair Information Principles:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm">1. Accountability</p>
                  <p className="text-xs text-muted-foreground">We're responsible for your personal information</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm">2. Identifying Purposes</p>
                  <p className="text-xs text-muted-foreground">We tell you why we collect your data</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm">3. Consent</p>
                  <p className="text-xs text-muted-foreground">We get your permission to collect and use data</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm">4. Limiting Collection</p>
                  <p className="text-xs text-muted-foreground">We only collect what's necessary</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm">5. Limiting Use, Disclosure, Retention</p>
                  <p className="text-xs text-muted-foreground">We only use data for stated purposes</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm">6. Accuracy</p>
                  <p className="text-xs text-muted-foreground">We keep your information accurate and current</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm">7. Safeguards</p>
                  <p className="text-xs text-muted-foreground">We protect your information with security measures</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm">8. Openness</p>
                  <p className="text-xs text-muted-foreground">We're transparent about our practices</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm">9. Individual Access</p>
                  <p className="text-xs text-muted-foreground">You can access and correct your data</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm">10. Challenging Compliance</p>
                  <p className="text-xs text-muted-foreground">You can question our privacy practices</p>
                </div>
              </div>
            </section>

            {/* Information We Collect */}
            <section id="information-collect" className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Database className="w-6 h-6 text-primary" />
                1. Information We Collect
              </h2>
              
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                Information You Provide Directly
              </h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li><strong>Account Information:</strong> Name, email address, phone number, password</li>
                <li><strong>Profile Information:</strong> Bio, skills, experience, profile photo, location preferences</li>
                <li><strong>Verification Documents:</strong> Government ID, insurance certificates, professional certifications, background check authorization</li>
                <li><strong>Payment Information:</strong> Bank account details (for payouts), billing address (processed securely through Stripe)</li>
                <li><strong>Task Information:</strong> Task descriptions, pricing, availability, requirements</li>
                <li><strong>Communications:</strong> Messages between users, support inquiries, reviews and ratings</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Server className="w-5 h-5 text-muted-foreground" />
                Information Collected Automatically
              </h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li><strong>Device Information:</strong> Device type, operating system, browser type, unique device identifiers</li>
                <li><strong>Usage Data:</strong> Pages viewed, features used, time spent, click patterns</li>
                <li><strong>Log Data:</strong> IP address, access times, referring URLs, error logs</li>
                <li><strong>Cookies & Tracking:</strong> Session cookies, preference cookies, analytics cookies (see our <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a>)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                Location Information
              </h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Precise Location:</strong> With your consent, for Instant Work, task matching, and navigation</li>
                <li><strong>Approximate Location:</strong> Derived from IP address for service area determination</li>
                <li><strong>Address Information:</strong> Saved addresses for task locations</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section id="how-we-use" className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-primary" />
                2. How We Use Your Information
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4">Purpose</th>
                      <th className="text-left py-3 px-4">Types of Data</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Provide our services</td>
                      <td className="py-3 px-4">Account, profile, task, location data</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Process payments</td>
                      <td className="py-3 px-4">Payment, billing information</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Verify identity</td>
                      <td className="py-3 px-4">ID documents, verification data</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Enable communication</td>
                      <td className="py-3 px-4">Contact info, messages</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Match tasks with users</td>
                      <td className="py-3 px-4">Skills, location, availability</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Prevent fraud</td>
                      <td className="py-3 px-4">Device info, usage patterns, IP addresses</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Improve our platform</td>
                      <td className="py-3 px-4">Usage data, feedback, analytics</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Send notifications</td>
                      <td className="py-3 px-4">Contact info, preferences</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Comply with laws</td>
                      <td className="py-3 px-4">All relevant data as required</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Legal Basis */}
            <section id="legal-basis" className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                3. Legal Basis for Processing
              </h2>
              <p className="text-muted-foreground mb-4">
                Under Canadian law and PIPEDA, we process your personal information based on:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Consent:</strong> You've given us explicit or implied consent (e.g., creating an account, enabling location services)</li>
                <li><strong>Contractual Necessity:</strong> Processing is necessary to fulfill our service agreement with you</li>
                <li><strong>Legal Obligation:</strong> Processing is required to comply with applicable laws (e.g., tax reporting, fraud prevention)</li>
                <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate business interests, provided these don't override your privacy rights</li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section id="sharing" className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                4. Information Sharing and Disclosure
              </h2>
              
              <h3 className="text-xl font-semibold mb-3">We Share Information With:</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li><strong>Other Users:</strong> Task Givers and Doers can see each other's public profile information, ratings, and relevant task details</li>
                <li><strong>Service Providers:</strong> Companies that help us operate our platform (hosting, email, analytics)</li>
                <li><strong>Payment Processors:</strong> Stripe for payment processing (see <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe's Privacy Policy</a>)</li>
                <li><strong>Background Check Providers:</strong> For identity verification and safety screening</li>
                <li><strong>Legal Authorities:</strong> When required by law, court order, or to protect rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>

              <Alert className="mb-4">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>We Never Sell Your Data</AlertTitle>
                <AlertDescription>
                  SaskTask does not sell, rent, or trade your personal information to third parties for their marketing purposes.
                </AlertDescription>
              </Alert>

              <h3 className="text-xl font-semibold mb-3">Third-Party Service Providers</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4">Provider</th>
                      <th className="text-left py-3 px-4">Purpose</th>
                      <th className="text-left py-3 px-4">Data Shared</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Supabase</td>
                      <td className="py-3 px-4">Database & Authentication</td>
                      <td className="py-3 px-4">Account data, app data</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Stripe</td>
                      <td className="py-3 px-4">Payment Processing</td>
                      <td className="py-3 px-4">Payment details, identity</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Vercel</td>
                      <td className="py-3 px-4">Web Hosting</td>
                      <td className="py-3 px-4">IP address, usage logs</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Mapbox/Google Maps</td>
                      <td className="py-3 px-4">Location Services</td>
                      <td className="py-3 px-4">Location, addresses</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Data Retention */}
            <section id="retention" className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" />
                5. Data Retention
              </h2>
              <p className="text-muted-foreground mb-4">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy:
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4">Data Category</th>
                      <th className="text-left py-3 px-4">Retention Period</th>
                      <th className="text-left py-3 px-4">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Account Information</td>
                      <td className="py-3 px-4">Duration of account + 3 years</td>
                      <td className="py-3 px-4">Legal obligations, disputes</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Transaction Records</td>
                      <td className="py-3 px-4">7 years</td>
                      <td className="py-3 px-4">Tax and financial regulations</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Messages</td>
                      <td className="py-3 px-4">Duration of account + 1 year</td>
                      <td className="py-3 px-4">Dispute resolution</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Verification Documents</td>
                      <td className="py-3 px-4">Duration of account + 5 years</td>
                      <td className="py-3 px-4">Compliance requirements</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Location Data (Real-time)</td>
                      <td className="py-3 px-4">24 hours</td>
                      <td className="py-3 px-4">Instant Work feature</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Analytics Data</td>
                      <td className="py-3 px-4">2 years (anonymized)</td>
                      <td className="py-3 px-4">Service improvement</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Support Tickets</td>
                      <td className="py-3 px-4">3 years</td>
                      <td className="py-3 px-4">Customer service quality</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p className="text-muted-foreground mt-4">
                After the retention period, data is securely deleted or anonymized.
              </p>
            </section>

            {/* Your Rights */}
            <section id="your-rights" className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                6. Your Privacy Rights
              </h2>
              <p className="text-muted-foreground mb-4">
                Under PIPEDA and applicable provincial privacy laws, you have the following rights:
              </p>
              
              <div className="grid gap-4 mb-6">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-1">Right to Access</h3>
                  <p className="text-sm text-muted-foreground">Request a copy of the personal information we hold about you</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-1">Right to Correction</h3>
                  <p className="text-sm text-muted-foreground">Request correction of inaccurate or incomplete information</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-1">Right to Deletion</h3>
                  <p className="text-sm text-muted-foreground">Request deletion of your account and personal information (subject to legal requirements)</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-1">Right to Withdraw Consent</h3>
                  <p className="text-sm text-muted-foreground">Withdraw consent for data processing (may affect service availability)</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-1">Right to Data Portability</h3>
                  <p className="text-sm text-muted-foreground">Receive your data in a commonly used, machine-readable format</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-1">Right to Complain</h3>
                  <p className="text-sm text-muted-foreground">Lodge a complaint with the Office of the Privacy Commissioner of Canada</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-3">How to Exercise Your Rights</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Access and update your information: <a href="/account" className="text-primary hover:underline">Account Settings</a></li>
                <li>Request data export: Contact <a href="mailto:privacy@sasktask.com" className="text-primary hover:underline">privacy@sasktask.com</a></li>
                <li>Delete your account: Go to Account Settings → Delete Account, or contact support</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We respond to privacy requests within 30 days. Complex requests may take up to 60 days, and we'll notify you if additional time is needed.
              </p>
            </section>

            {/* Data Security */}
            <section id="security" className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-primary" />
                7. Data Security
              </h2>
              <p className="text-muted-foreground mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-semibold mb-2">🔒 Encryption</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>TLS 1.3 for data in transit</li>
                    <li>AES-256 encryption for data at rest</li>
                    <li>End-to-end encryption for messages</li>
                  </ul>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-semibold mb-2">🛡️ Access Controls</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>Role-based access for employees</li>
                    <li>Two-factor authentication available</li>
                    <li>Regular access reviews</li>
                  </ul>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-semibold mb-2">🔍 Monitoring</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>24/7 security monitoring</li>
                    <li>Intrusion detection systems</li>
                    <li>Regular security audits</li>
                  </ul>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-semibold mb-2">📋 Compliance</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>PCI DSS compliant payment processing</li>
                    <li>Annual penetration testing</li>
                    <li>Employee security training</li>
                  </ul>
                </div>
              </div>

              <Alert variant="default" className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-700 dark:text-amber-400">No System is 100% Secure</AlertTitle>
                <AlertDescription className="text-amber-600 dark:text-amber-500">
                  While we use robust security measures, no internet transmission is completely secure. 
                  We encourage you to use strong passwords and enable two-factor authentication.
                </AlertDescription>
              </Alert>
            </section>

            {/* International Data Transfers */}
            <section id="international" className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary" />
                8. International Data Transfers
              </h2>
              <p className="text-muted-foreground mb-4">
                SaskTask is based in Saskatchewan, Canada. However, some of our service providers may store or process data in other countries, primarily the United States.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li>We ensure all international transfers comply with PIPEDA requirements</li>
                <li>Data transferred to the US may be subject to US law enforcement access</li>
                <li>We use contractual safeguards (Data Processing Agreements) with all service providers</li>
                <li>Service providers must maintain security standards comparable to our own</li>
              </ul>
              <p className="text-muted-foreground">
                By using SaskTask, you acknowledge that your information may be transferred to, stored, and processed in countries outside Canada.
              </p>
            </section>

            {/* Breach Notification */}
            <section id="breach" className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-primary" />
                9. Data Breach Notification
              </h2>
              <p className="text-muted-foreground mb-4">
                In compliance with PIPEDA's mandatory breach notification requirements:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li><strong>Assessment:</strong> We assess all potential breaches to determine risk of significant harm</li>
                <li><strong>User Notification:</strong> We notify affected users as soon as feasible if there's a real risk of significant harm</li>
                <li><strong>Regulator Notification:</strong> We report breaches to the Office of the Privacy Commissioner of Canada when required</li>
                <li><strong>Record Keeping:</strong> We maintain records of all breaches for a minimum of 24 months</li>
              </ul>
              <p className="text-muted-foreground">
                Notifications will include the nature of the breach, types of information involved, steps we're taking, and steps you can take to protect yourself.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">10. Children's Privacy</h2>
              <p className="text-muted-foreground">
                SaskTask is not intended for users under the age of 18. We do not knowingly collect personal information from children. 
                If you are a parent or guardian and believe your child has provided us with personal information, please contact us at 
                <a href="mailto:privacy@sasktask.com" className="text-primary hover:underline ml-1">privacy@sasktask.com</a>. 
                We will take steps to delete such information.
              </p>
            </section>

            {/* Cookies */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">11. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground mb-4">
                We use cookies and similar technologies to enhance your experience. For detailed information about the cookies we use and how to manage them, please see our <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a>.
              </p>
            </section>

            {/* Third-Party Links */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">12. Third-Party Links</h2>
              <p className="text-muted-foreground">
                Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies before providing any personal information.
              </p>
            </section>

            {/* Policy Changes */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">13. Changes to This Policy</h2>
              <p className="text-muted-foreground mb-4">
                We may update this Privacy Policy from time to time. When we make significant changes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>We'll notify you by email or in-app notification</li>
                <li>We'll update the "Last updated" date at the top of this page</li>
                <li>For material changes, we may require you to re-consent</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Your continued use of SaskTask after changes are posted constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact & Complaints */}
            <section id="contact" className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6 text-primary" />
                14. Contact Us & Complaints
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">SaskTask Privacy Officer</h3>
                  <p className="text-muted-foreground text-sm">
                    Email: <a href="mailto:privacy@sasktask.com" className="text-primary hover:underline">privacy@sasktask.com</a><br />
                    Response Time: Within 30 days
                  </p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">General Inquiries</h3>
                  <p className="text-muted-foreground text-sm">
                    Email: <a href="mailto:support@sasktask.com" className="text-primary hover:underline">support@sasktask.com</a><br />
                    Help Center: <a href="/help" className="text-primary hover:underline">sasktask.com/help</a>
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-3">File a Complaint</h3>
              <p className="text-muted-foreground mb-4">
                If you're not satisfied with our response to your privacy concern, you have the right to file a complaint with:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Office of the Privacy Commissioner of Canada</h4>
                <p className="text-muted-foreground text-sm">
                  Website: <a href="https://www.priv.gc.ca" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.priv.gc.ca</a><br />
                  Toll-free: 1-800-282-1376<br />
                  30 Victoria Street, Gatineau, Quebec K1A 1H3
                </p>
              </div>
            </section>

            {/* Final Summary */}
            <section className="bg-primary/5 border-2 border-primary/20 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-primary">Summary of Key Points</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>We collect only what's necessary to provide our services</li>
                <li>We never sell your personal information</li>
                <li>You have rights to access, correct, and delete your data</li>
                <li>We use industry-standard security to protect your information</li>
                <li>We notify you of data breaches that may affect you</li>
                <li>You can contact our Privacy Officer at privacy@sasktask.com</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}