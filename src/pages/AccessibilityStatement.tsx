import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Accessibility, 
  Eye, 
  Keyboard, 
  Monitor, 
  MousePointer2, 
  Volume2,
  Mail,
  Phone,
  MessageCircle,
  CheckCircle2
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

export default function AccessibilityStatement() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-surface">
      <SEOHead 
        title="Accessibility Statement | SaskTask"
        description="SaskTask is committed to ensuring digital accessibility for people with disabilities. Learn about our accessibility features and standards."
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Accessibility className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Accessibility Statement</h1>
            <p className="text-muted-foreground">Last updated: January 2026</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Commitment */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                Our Commitment
              </h2>
              <p className="text-muted-foreground mb-4">
                SaskTask is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards to guarantee we provide equal access to all users.
              </p>
              <p className="text-muted-foreground mb-4">
                We believe that the internet should be available and accessible to anyone, and are committed to providing a platform that is accessible to the widest possible audience, regardless of ability or technology.
              </p>
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200 text-sm">
                  <strong>Canadian Compliance:</strong> We strive to meet the standards set by the Accessible Canada Act (ACA) and provincial accessibility legislation including the Accessibility for Ontarians with Disabilities Act (AODA).
                </p>
              </div>
            </section>

            {/* Standards */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">Conformance Status</h2>
              <p className="text-muted-foreground mb-4">
                We aim to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> standards. These guidelines explain how to make web content more accessible to people with a wide range of disabilities, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li>Visual impairments (blindness, low vision, color blindness)</li>
                <li>Hearing impairments (deafness, hard of hearing)</li>
                <li>Motor impairments (limited fine motor control, muscle slowness)</li>
                <li>Cognitive impairments (learning disabilities, distractibility)</li>
                <li>Speech impairments</li>
                <li>Photosensitive conditions</li>
              </ul>
              <p className="text-muted-foreground">
                We are committed to ongoing accessibility testing and remediation to improve conformance across all areas of our platform.
              </p>
            </section>

            {/* Features */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Monitor className="w-6 h-6 text-primary" />
                Accessibility Features
              </h2>

              {/* Visual */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Visual Accessibility
                </h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>High contrast mode:</strong> Dark and light themes with sufficient contrast ratios</li>
                  <li><strong>Scalable text:</strong> Text can be resized up to 200% without loss of functionality</li>
                  <li><strong>Alternative text:</strong> All images include descriptive alt text for screen readers</li>
                  <li><strong>Color independence:</strong> Information is not conveyed by color alone</li>
                  <li><strong>Focus indicators:</strong> Clear visual focus indicators for keyboard navigation</li>
                  <li><strong>Consistent layout:</strong> Predictable page structure and navigation</li>
                </ul>
              </div>

              {/* Keyboard */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-purple-600" />
                  Keyboard Accessibility
                </h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Full keyboard navigation:</strong> All interactive elements are accessible via keyboard</li>
                  <li><strong>Skip links:</strong> Skip to main content links for easy navigation</li>
                  <li><strong>Logical tab order:</strong> Focus moves in a logical sequence through the page</li>
                  <li><strong>No keyboard traps:</strong> Users can navigate away from all components</li>
                  <li><strong>Keyboard shortcuts:</strong> Common actions have keyboard shortcuts</li>
                </ul>
              </div>

              {/* Screen Reader */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-green-600" />
                  Screen Reader Support
                </h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>ARIA labels:</strong> Proper ARIA landmarks and labels for screen readers</li>
                  <li><strong>Semantic HTML:</strong> Proper heading hierarchy and semantic structure</li>
                  <li><strong>Form labels:</strong> All form fields have associated labels</li>
                  <li><strong>Error identification:</strong> Form errors are clearly identified and described</li>
                  <li><strong>Live regions:</strong> Dynamic content updates are announced to screen readers</li>
                </ul>
              </div>

              {/* Motor */}
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <MousePointer2 className="w-5 h-5 text-orange-600" />
                  Motor Accessibility
                </h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Large click targets:</strong> Minimum 44x44 pixel touch targets</li>
                  <li><strong>No time limits:</strong> Sessions do not expire during active use</li>
                  <li><strong>Gesture alternatives:</strong> Touch gestures have keyboard/button alternatives</li>
                  <li><strong>Motion alternatives:</strong> Motion-based inputs have static alternatives</li>
                </ul>
              </div>
            </section>

            {/* Technologies */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">Compatibility</h2>
              <p className="text-muted-foreground mb-4">
                SaskTask is designed to be compatible with the following assistive technologies:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li>JAWS (Windows)</li>
                <li>NVDA (Windows)</li>
                <li>VoiceOver (macOS and iOS)</li>
                <li>TalkBack (Android)</li>
                <li>Dragon NaturallySpeaking</li>
                <li>ZoomText and other screen magnification software</li>
              </ul>
              <p className="text-muted-foreground">
                The platform is optimized for the latest versions of Chrome, Firefox, Safari, and Edge browsers.
              </p>
            </section>

            {/* Known Limitations */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">Known Limitations</h2>
              <p className="text-muted-foreground mb-4">
                While we strive for WCAG 2.1 Level AA conformance, we acknowledge the following limitations:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li><strong>Maps:</strong> Interactive maps may have limited screen reader support. Alternative address input is provided.</li>
                <li><strong>Third-party content:</strong> Some embedded third-party content (e.g., payment forms) may not fully meet accessibility standards.</li>
                <li><strong>User-generated content:</strong> Content uploaded by users (images, descriptions) may not have adequate accessibility features.</li>
                <li><strong>Real-time chat:</strong> Live chat features are being enhanced for better screen reader support.</li>
                <li><strong>PDF documents:</strong> Some legacy PDF documents may not be fully accessible.</li>
              </ul>
              <p className="text-muted-foreground">
                We are actively working to address these limitations and improve accessibility across all platform features.
              </p>
            </section>

            {/* Assessment */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">Assessment Methods</h2>
              <p className="text-muted-foreground mb-4">
                We assess the accessibility of our platform through:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Automated testing:</strong> Regular scans using accessibility testing tools (axe, WAVE)</li>
                <li><strong>Manual testing:</strong> Keyboard navigation and screen reader testing</li>
                <li><strong>User testing:</strong> Feedback from users with disabilities</li>
                <li><strong>Expert review:</strong> Periodic audits by accessibility specialists</li>
                <li><strong>Continuous monitoring:</strong> Accessibility checks integrated into our development process</li>
              </ul>
            </section>

            {/* Feedback */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">Feedback and Contact</h2>
              <p className="text-muted-foreground mb-4">
                We welcome your feedback on the accessibility of SaskTask. If you encounter accessibility barriers or have suggestions for improvement, please contact us:
              </p>
              
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:accessibility@sasktask.com" className="text-sm text-primary hover:underline">
                      accessibility@sasktask.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a href="tel:+13065551234" className="text-sm text-primary hover:underline">
                      +1 (306) 555-1234
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Support</p>
                    <a href="/contact" className="text-sm text-primary hover:underline">
                      Contact Form
                    </a>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground mb-4">
                When contacting us, please include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>The web page URL or feature where you encountered the issue</li>
                <li>A description of the accessibility problem</li>
                <li>The assistive technology you were using (if applicable)</li>
                <li>Your browser and operating system</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We aim to respond to accessibility feedback within <strong>2 business days</strong> and resolve issues as quickly as possible.
              </p>
            </section>

            {/* Enforcement */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">Enforcement Procedures</h2>
              <p className="text-muted-foreground mb-4">
                If you are not satisfied with our response to your accessibility concern, you may escalate to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li><strong>Canadian Human Rights Commission:</strong> For complaints under the Accessible Canada Act</li>
                <li><strong>Provincial Human Rights Commissions:</strong> For provincial accessibility complaints</li>
                <li><strong>Accessibility Standards Canada:</strong> For feedback on accessibility standards</li>
              </ul>
              <p className="text-muted-foreground">
                We are committed to resolving all accessibility concerns and will work with regulatory bodies to ensure compliance.
              </p>
            </section>

            {/* Technical Specifications */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">Technical Specifications</h2>
              <p className="text-muted-foreground mb-4">
                Accessibility of SaskTask relies on the following technologies:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>HTML5</li>
                <li>WAI-ARIA</li>
                <li>CSS3</li>
                <li>JavaScript (with progressive enhancement)</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                These technologies are relied upon for conformance with the accessibility standards used.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
