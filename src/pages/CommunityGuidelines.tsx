import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Users, 
  Shield, 
  Heart, 
  AlertTriangle, 
  Ban, 
  MessageCircle,
  Star,
  ThumbsUp,
  Scale,
  UserCheck,
  Handshake,
  Flag
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CommunityGuidelines() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-surface">
      <SEOHead 
        title="Community Guidelines | SaskTask"
        description="Our community guidelines ensure SaskTask remains a safe, respectful, and productive platform for everyone. Learn about expected behavior and prohibited activities."
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Community Guidelines</h1>
            <p className="text-muted-foreground">Last updated: January 2026</p>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              SaskTask is built on trust, respect, and professionalism. These guidelines help ensure a positive experience for everyone in our community.
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Our Values */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary" />
                Our Community Values
              </h2>
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Safety First</h4>
                    <p className="text-sm text-muted-foreground">We prioritize the physical and digital safety of all community members.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Handshake className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Mutual Respect</h4>
                    <p className="text-sm text-muted-foreground">Treat everyone with dignity and respect, regardless of differences.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Quality & Professionalism</h4>
                    <p className="text-sm text-muted-foreground">Deliver excellent work and maintain professional standards.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <ThumbsUp className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Honesty & Integrity</h4>
                    <p className="text-sm text-muted-foreground">Be truthful in all interactions and honor your commitments.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Expected Behavior */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-primary" />
                Expected Behavior
              </h2>

              <h3 className="text-xl font-semibold mb-3">For All Users</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li><strong>Be Respectful:</strong> Use courteous language and treat others as you would like to be treated</li>
                <li><strong>Be Honest:</strong> Provide accurate information about yourself, your skills, and your tasks</li>
                <li><strong>Be Reliable:</strong> Honor your commitments, show up on time, and communicate proactively</li>
                <li><strong>Be Responsive:</strong> Reply to messages promptly and keep others informed</li>
                <li><strong>Be Professional:</strong> Maintain appropriate boundaries and conduct yourself professionally</li>
                <li><strong>Be Inclusive:</strong> Welcome and support all community members regardless of background</li>
                <li><strong>Be Constructive:</strong> Provide helpful feedback and reviews that benefit the community</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">For Task Givers</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Write clear, accurate, and complete task descriptions</li>
                <li>Set fair and reasonable compensation for the work required</li>
                <li>Provide a safe working environment for in-person tasks</li>
                <li>Supply necessary materials, tools, and information as promised</li>
                <li>Pay promptly upon satisfactory task completion</li>
                <li>Give honest and fair reviews based on actual performance</li>
                <li>Respect Task Doers' time and professional expertise</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">For Task Doers</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Only accept tasks you are qualified and able to complete</li>
                <li>Arrive on time and prepared for scheduled tasks</li>
                <li>Complete tasks to the agreed-upon specifications and quality</li>
                <li>Communicate immediately if issues arise</li>
                <li>Respect the Task Giver's property and privacy</li>
                <li>Maintain necessary licenses, insurance, and certifications</li>
                <li>Dress appropriately for the task environment</li>
              </ul>
            </section>

            {/* Prohibited Conduct */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Ban className="w-6 h-6 text-red-600" />
                Prohibited Conduct
              </h2>

              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Zero Tolerance Policy</AlertTitle>
                <AlertDescription>
                  The following behaviors may result in immediate account suspension or permanent ban from the platform.
                </AlertDescription>
              </Alert>

              <h3 className="text-xl font-semibold mb-3 text-red-600">Absolutely Prohibited</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li><strong>Illegal Activities:</strong> Requesting or performing any illegal tasks or services</li>
                <li><strong>Violence & Threats:</strong> Any form of physical violence, threats, or intimidation</li>
                <li><strong>Harassment:</strong> Unwanted contact, stalking, bullying, or persistent unwelcome behavior</li>
                <li><strong>Discrimination:</strong> Discrimination based on race, ethnicity, religion, gender, sexual orientation, disability, or any protected characteristic</li>
                <li><strong>Sexual Misconduct:</strong> Sexual harassment, inappropriate advances, or sexual services</li>
                <li><strong>Fraud:</strong> Providing false information, identity theft, or fraudulent activities</li>
                <li><strong>Theft:</strong> Stealing property, funds, or personal information</li>
                <li><strong>Substance Abuse:</strong> Being under the influence of drugs or alcohol while performing tasks</li>
                <li><strong>Weapons:</strong> Bringing weapons to task locations</li>
                <li><strong>Child Exploitation:</strong> Any content or behavior involving minors inappropriately</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-orange-600">Platform Violations</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li><strong>Payment Circumvention:</strong> Taking payments outside the SaskTask platform</li>
                <li><strong>Review Manipulation:</strong> Fake reviews, review trading, or coercing reviews</li>
                <li><strong>Multiple Accounts:</strong> Creating duplicate accounts or using false identities</li>
                <li><strong>Spam:</strong> Sending unsolicited promotional messages or advertisements</li>
                <li><strong>Account Sharing:</strong> Allowing others to use your account</li>
                <li><strong>Bid Manipulation:</strong> Artificially inflating bids or price fixing</li>
                <li><strong>Misrepresentation:</strong> False claims about qualifications, experience, or capabilities</li>
                <li><strong>Contact Sharing:</strong> Sharing personal contact information to avoid platform fees</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-yellow-600">Unprofessional Behavior</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Excessive cancellations or no-shows without valid reason</li>
                <li>Rude, disrespectful, or abusive communication</li>
                <li>Intentionally poor quality work</li>
                <li>Revealing confidential information shared during tasks</li>
                <li>Negative, unfair, or retaliatory reviews</li>
                <li>Disputing completed work without valid reason</li>
                <li>Pressuring others to tip or provide additional payment</li>
              </ul>
            </section>

            {/* Communication Guidelines */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-primary" />
                Communication Guidelines
              </h2>

              <h3 className="text-xl font-semibold mb-3 text-green-600">Do</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Use professional and respectful language at all times</li>
                <li>Communicate through the SaskTask platform for safety and record-keeping</li>
                <li>Respond to messages within 24 hours when possible</li>
                <li>Provide clear and detailed information about tasks and expectations</li>
                <li>Notify the other party immediately if you need to cancel or reschedule</li>
                <li>Ask clarifying questions before accepting or starting a task</li>
                <li>Document task completion with photos when appropriate</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-red-600">Don't</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Use profanity, slurs, or offensive language</li>
                <li>Send spam, chain messages, or unsolicited advertisements</li>
                <li>Make threats or use intimidating language</li>
                <li>Share personal contact information to avoid platform fees</li>
                <li>Send messages unrelated to legitimate task purposes</li>
                <li>Continue contacting someone who has asked you to stop</li>
                <li>Discuss or share other users' personal information</li>
              </ul>
            </section>

            {/* Reviews & Ratings */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-primary" />
                Reviews & Ratings Guidelines
              </h2>
              <p className="text-muted-foreground mb-4">
                Reviews are essential to building trust in our community. We expect all reviews to be:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li><strong>Honest:</strong> Based on your genuine experience with the task</li>
                <li><strong>Fair:</strong> Consider the full context and give credit where due</li>
                <li><strong>Specific:</strong> Include helpful details about the experience</li>
                <li><strong>Constructive:</strong> Focus on behavior and work quality, not personal attributes</li>
                <li><strong>Relevant:</strong> Address only the task-related experience</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-red-600">Prohibited in Reviews</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>False or misleading statements</li>
                <li>Discriminatory comments</li>
                <li>Personal information (phone numbers, addresses, etc.)</li>
                <li>Profanity or offensive language</li>
                <li>Retaliatory reviews based on previous negative reviews</li>
                <li>Reviews for tasks that were not actually completed</li>
                <li>Offers or requests for compensation in exchange for reviews</li>
              </ul>
            </section>

            {/* Safety */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Safety Guidelines
              </h2>

              <h3 className="text-xl font-semibold mb-3">For In-Person Tasks</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Meet in well-lit, public areas when possible for initial meetings</li>
                <li>Share your location with a trusted friend or family member</li>
                <li>Trust your instincts—if something feels wrong, leave</li>
                <li>Verify the identity of the person you're meeting</li>
                <li>Keep your valuables secured</li>
                <li>Don't share sensitive personal information</li>
                <li>Report any safety concerns immediately</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Emergency Situations</h3>
              <p className="text-muted-foreground mb-4">
                If you are in immediate danger, call emergency services:
              </p>
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <p className="text-red-800 dark:text-red-200 font-bold text-lg">
                  Emergency: 911
                </p>
              </div>
              <p className="text-muted-foreground">
                After ensuring your safety, please report the incident to SaskTask at <a href="mailto:safety@sasktask.com" className="text-primary hover:underline">safety@sasktask.com</a>.
              </p>
            </section>

            {/* Reporting */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Flag className="w-6 h-6 text-primary" />
                Reporting Violations
              </h2>
              <p className="text-muted-foreground mb-4">
                If you witness or experience a violation of these guidelines, please report it immediately:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li><strong>In-App:</strong> Use the "Report" button on any user profile, message, or task</li>
                <li><strong>Email:</strong> Send details to <a href="mailto:report@sasktask.com" className="text-primary hover:underline">report@sasktask.com</a></li>
                <li><strong>Support:</strong> Contact our support team through the Help Center</li>
              </ul>
              <p className="text-muted-foreground">
                All reports are reviewed by our Trust & Safety team. Reports are confidential, and we do not tolerate retaliation against those who report violations in good faith.
              </p>
            </section>

            {/* Consequences */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6 text-primary" />
                Consequences of Violations
              </h2>
              <p className="text-muted-foreground mb-4">
                Violations of these Community Guidelines may result in:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li><strong>Warning:</strong> First-time minor violations may result in a warning</li>
                <li><strong>Temporary Suspension:</strong> Account access temporarily restricted</li>
                <li><strong>Permanent Ban:</strong> Complete removal from the platform</li>
                <li><strong>Fund Withholding:</strong> Pending payments may be withheld during investigation</li>
                <li><strong>Legal Action:</strong> Serious violations may be reported to law enforcement</li>
              </ul>
              <p className="text-muted-foreground">
                The severity of consequences depends on the nature and frequency of violations. We review each case individually and strive to be fair while protecting our community.
              </p>
            </section>

            {/* Updates */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">Updates to Guidelines</h2>
              <p className="text-muted-foreground">
                We may update these Community Guidelines from time to time to address new behaviors, technologies, or legal requirements. We will notify users of significant changes through email or platform notifications. Continued use of SaskTask after changes constitutes acceptance of the updated guidelines.
              </p>
            </section>

            {/* Contact */}
            <section className="bg-primary/5 border-2 border-primary/20 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-primary">Questions?</h2>
              <p className="text-muted-foreground">
                If you have questions about these Community Guidelines or need clarification, please contact us at{" "}
                <a href="mailto:community@sasktask.com" className="text-primary hover:underline">community@sasktask.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
