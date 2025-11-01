import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FileText } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-surface">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: January 2025</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using SaskTask, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">2. Use of Service</h2>
              <p className="text-muted-foreground mb-4">
                SaskTask is a platform that connects individuals who need tasks completed ("Task Givers") with individuals who can complete those tasks ("Taskers").
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>You must be at least 18 years old to use this service</li>
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You agree to accept responsibility for all activities that occur under your account</li>
              </ul>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">3. Task Posting and Completion</h2>
              <p className="text-muted-foreground mb-4">
                Task Givers agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li>Provide accurate descriptions of tasks</li>
                <li>Pay the agreed-upon amount upon successful task completion</li>
                <li>Treat Taskers with respect and professionalism</li>
                <li>Not request illegal or inappropriate services</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                Taskers agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Complete tasks to the best of their ability</li>
                <li>Be honest about their skills and availability</li>
                <li>Complete background checks and verification processes</li>
                <li>Maintain appropriate insurance where required</li>
              </ul>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">4. Payment Terms</h2>
              <p className="text-muted-foreground">
                All payments are processed through Stripe. Task Givers' payments are held in escrow until task completion. SaskTask charges a service fee to Taskers for each completed task. Refund policies vary based on cancellation timing and circumstances.
              </p>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">5. Cancellation Policy</h2>
              <p className="text-muted-foreground">
                Tasks can be cancelled before acceptance without penalty. After acceptance, cancellation fees may apply based on proximity to the scheduled time. Repeated cancellations may result in account suspension.
              </p>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">6. User Conduct</h2>
              <p className="text-muted-foreground mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Use the service for any illegal purpose</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Post false or misleading information</li>
                <li>Attempt to circumvent payment through the platform</li>
                <li>Use automated systems to access the service</li>
              </ul>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">7. Liability and Disputes</h2>
              <p className="text-muted-foreground">
                SaskTask acts as a platform connecting users and is not responsible for the actions of Task Givers or Taskers. We do not guarantee the quality of services provided. Users agree to resolve disputes directly, with SaskTask serving as a mediator if requested.
              </p>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">8. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content on SaskTask, including logos, text, and graphics, is the property of SaskTask and protected by copyright laws. Users retain rights to content they create but grant SaskTask a license to use it on the platform.
              </p>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">9. Termination</h2>
              <p className="text-muted-foreground">
                SaskTask reserves the right to terminate or suspend accounts that violate these terms or engage in fraudulent activity. Users may close their accounts at any time.
              </p>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">10. Changes to Terms</h2>
              <p className="text-muted-foreground">
                SaskTask reserves the right to modify these terms at any time. Users will be notified of significant changes. Continued use of the service after changes constitutes acceptance of new terms.
              </p>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about these Terms of Service, please contact us at:
                <br />
                <a href="mailto:legal@sasktask.com" className="text-primary hover:underline">
                  legal@sasktask.com
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