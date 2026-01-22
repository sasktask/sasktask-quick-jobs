import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Cookie, Settings, Shield, BarChart3, Target, Globe, ToggleLeft } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookiePolicy() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    functional: true,
    analytics: true,
    marketing: false,
  });

  const savePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    toast.success('Cookie preferences saved successfully');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-surface">
      <SEOHead 
        title="Cookie Policy | SaskTask"
        description="Learn about how SaskTask uses cookies and similar technologies to provide, improve, and protect our services."
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Cookie className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
            <p className="text-muted-foreground">Last updated: January 2026</p>
            <p className="text-sm text-muted-foreground mt-2">Effective Date: January 22, 2026</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Introduction */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Cookie className="w-6 h-6 text-primary" />
                1. What Are Cookies?
              </h2>
              <p className="text-muted-foreground mb-4">
                Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and give us information about how you use our platform.
              </p>
              <p className="text-muted-foreground mb-4">
                We also use similar technologies such as:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Local Storage:</strong> Data stored in your browser that persists even after you close the browser</li>
                <li><strong>Session Storage:</strong> Data stored temporarily during your browsing session</li>
                <li><strong>Pixels/Web Beacons:</strong> Small images embedded in pages or emails to track activity</li>
                <li><strong>Device Fingerprinting:</strong> Collection of device characteristics for identification</li>
              </ul>
            </section>

            {/* Canadian Law Compliance */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                2. Legal Framework (PIPEDA Compliance)
              </h2>
              <p className="text-muted-foreground mb-4">
                This Cookie Policy complies with the <strong>Personal Information Protection and Electronic Documents Act (PIPEDA)</strong> and applicable provincial privacy legislation in Canada, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li><strong>Saskatchewan:</strong> FOIP (Freedom of Information and Protection of Privacy Act)</li>
                <li><strong>Alberta:</strong> PIPA (Personal Information Protection Act)</li>
                <li><strong>British Columbia:</strong> PIPA (Personal Information Protection Act)</li>
                <li><strong>Quebec:</strong> Act Respecting the Protection of Personal Information (Law 25)</li>
              </ul>
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-amber-800 dark:text-amber-200 text-sm">
                  <strong>Your Consent:</strong> By continuing to use our platform after being notified of this Cookie Policy, you consent to our use of cookies as described herein. You may withdraw consent at any time by adjusting your cookie preferences below or in your browser settings.
                </p>
              </div>
            </section>

            {/* Types of Cookies */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Settings className="w-6 h-6 text-primary" />
                3. Types of Cookies We Use
              </h2>

              {/* Essential Cookies */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  3.1 Essential Cookies (Required)
                </h3>
                <p className="text-muted-foreground mb-3">
                  These cookies are strictly necessary for the platform to function. Without them, services you have asked for cannot be provided. They include:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4">Cookie Name</th>
                        <th className="text-left py-2 pr-4">Purpose</th>
                        <th className="text-left py-2">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b">
                        <td className="py-2 pr-4"><code>sb-*-auth-token</code></td>
                        <td className="py-2 pr-4">Authentication and session management</td>
                        <td className="py-2">Session / 7 days</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4"><code>csrf_token</code></td>
                        <td className="py-2 pr-4">Security - prevents cross-site request forgery</td>
                        <td className="py-2">Session</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4"><code>cookiePreferences</code></td>
                        <td className="py-2 pr-4">Stores your cookie consent preferences</td>
                        <td className="py-2">1 year</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4"><code>theme</code></td>
                        <td className="py-2 pr-4">Stores dark/light mode preference</td>
                        <td className="py-2">1 year</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <ToggleLeft className="w-5 h-5 text-blue-600" />
                  3.2 Functional Cookies (Optional)
                </h3>
                <p className="text-muted-foreground mb-3">
                  These cookies enable enhanced functionality and personalization. They may be set by us or third-party providers:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4">Cookie Name</th>
                        <th className="text-left py-2 pr-4">Purpose</th>
                        <th className="text-left py-2">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b">
                        <td className="py-2 pr-4"><code>user_location</code></td>
                        <td className="py-2 pr-4">Remembers your location for task searches</td>
                        <td className="py-2">30 days</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4"><code>recent_searches</code></td>
                        <td className="py-2 pr-4">Stores recent search history</td>
                        <td className="py-2">90 days</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4"><code>language</code></td>
                        <td className="py-2 pr-4">Language preference</td>
                        <td className="py-2">1 year</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4"><code>notification_prefs</code></td>
                        <td className="py-2 pr-4">Notification settings</td>
                        <td className="py-2">1 year</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  3.3 Analytics Cookies (Optional)
                </h3>
                <p className="text-muted-foreground mb-3">
                  These cookies help us understand how visitors interact with our platform by collecting anonymous information:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4">Provider</th>
                        <th className="text-left py-2 pr-4">Purpose</th>
                        <th className="text-left py-2 pr-4">Privacy Policy</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b">
                        <td className="py-2 pr-4">Google Analytics</td>
                        <td className="py-2 pr-4">Website traffic analysis and user behavior</td>
                        <td className="py-2 pr-4">
                          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View</a>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4">Hotjar</td>
                        <td className="py-2 pr-4">Heatmaps and session recordings (anonymized)</td>
                        <td className="py-2 pr-4">
                          <a href="https://www.hotjar.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View</a>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4">Mixpanel</td>
                        <td className="py-2 pr-4">Product analytics and user engagement</td>
                        <td className="py-2 pr-4">
                          <a href="https://mixpanel.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View</a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-600" />
                  3.4 Marketing/Advertising Cookies (Optional)
                </h3>
                <p className="text-muted-foreground mb-3">
                  These cookies are used to track visitors across websites to display relevant advertisements:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4">Provider</th>
                        <th className="text-left py-2 pr-4">Purpose</th>
                        <th className="text-left py-2 pr-4">Opt-Out</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b">
                        <td className="py-2 pr-4">Google Ads</td>
                        <td className="py-2 pr-4">Conversion tracking and remarketing</td>
                        <td className="py-2 pr-4">
                          <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Manage</a>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4">Facebook Pixel</td>
                        <td className="py-2 pr-4">Social media advertising and analytics</td>
                        <td className="py-2 pr-4">
                          <a href="https://www.facebook.com/settings/?tab=ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Manage</a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Cookie Preferences */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Settings className="w-6 h-6 text-primary" />
                4. Manage Your Cookie Preferences
              </h2>
              <p className="text-muted-foreground mb-6">
                Use the controls below to customize which cookies you allow. Essential cookies cannot be disabled as they are necessary for the platform to function.
              </p>

              <div className="space-y-4">
                {/* Essential - Always On */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-medium">Essential Cookies</h4>
                      <p className="text-sm text-muted-foreground">Required for the platform to work properly</p>
                    </div>
                  </div>
                  <Switch checked={true} disabled className="opacity-50" />
                </div>

                {/* Functional */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ToggleLeft className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Functional Cookies</h4>
                      <p className="text-sm text-muted-foreground">Enhanced features and personalization</p>
                    </div>
                  </div>
                  <Switch 
                    checked={preferences.functional}
                    onCheckedChange={(checked) => setPreferences({...preferences, functional: checked})}
                  />
                </div>

                {/* Analytics */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="font-medium">Analytics Cookies</h4>
                      <p className="text-sm text-muted-foreground">Help us improve the platform experience</p>
                    </div>
                  </div>
                  <Switch 
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => setPreferences({...preferences, analytics: checked})}
                  />
                </div>

                {/* Marketing */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-orange-600" />
                    <div>
                      <h4 className="font-medium">Marketing Cookies</h4>
                      <p className="text-sm text-muted-foreground">Personalized advertisements</p>
                    </div>
                  </div>
                  <Switch 
                    checked={preferences.marketing}
                    onCheckedChange={(checked) => setPreferences({...preferences, marketing: checked})}
                  />
                </div>

                <Button onClick={savePreferences} className="w-full mt-4">
                  Save Cookie Preferences
                </Button>
              </div>
            </section>

            {/* Browser Controls */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary" />
                5. Browser Cookie Controls
              </h2>
              <p className="text-muted-foreground mb-4">
                You can also control cookies through your browser settings. Here are instructions for popular browsers:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
                <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
              </ul>
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong>Note:</strong> Disabling cookies may affect platform functionality. Some features may not work correctly without essential cookies.
                </p>
              </div>
            </section>

            {/* Third-Party Services */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">6. Third-Party Services</h2>
              <p className="text-muted-foreground mb-4">
                Our platform integrates with third-party services that may set their own cookies:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Stripe:</strong> Payment processing (<a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a>)</li>
                <li><strong>Supabase:</strong> Database and authentication services</li>
                <li><strong>Mapbox:</strong> Location and mapping services (<a href="https://www.mapbox.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a>)</li>
                <li><strong>Intercom:</strong> Customer support chat (if applicable)</li>
              </ul>
            </section>

            {/* Updates */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">7. Updates to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our business practices. We will notify you of significant changes by posting a notice on our platform. The "Last Updated" date at the top of this page indicates when this policy was last revised.
              </p>
            </section>

            {/* Contact */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">8. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>SaskTask Privacy Team</strong><br />
                  Email: <a href="mailto:privacy@sasktask.com" className="text-primary hover:underline">privacy@sasktask.com</a><br />
                  Address: Saskatchewan, Canada
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
