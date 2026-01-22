import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  MapPin, 
  Shield, 
  Scale, 
  FileText, 
  AlertTriangle,
  HardHat,
  Building2,
  Users,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle2,
  Briefcase,
  Heart,
  Banknote
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SaskatchewanCompliance() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-surface">
      <SEOHead 
        title="Saskatchewan Compliance & Regulations | SaskTask"
        description="Saskatchewan-specific legal compliance information for SaskTask users. Learn about provincial regulations, WCB requirements, and consumer protections."
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Saskatchewan Compliance</h1>
            <p className="text-muted-foreground">Last updated: January 2026</p>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              SaskTask is proudly based in Saskatchewan. This document outlines our compliance with 
              provincial laws and regulations specific to Saskatchewan.
            </p>
          </div>

          {/* Saskatchewan Pride Banner */}
          <div className="bg-gradient-to-r from-green-600 to-yellow-500 text-white p-6 rounded-lg mb-8">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🌾</div>
              <div>
                <h2 className="text-xl font-bold">Proudly Saskatchewan</h2>
                <p className="text-green-100">
                  SaskTask is a Saskatchewan-based company, built to serve our local communities from 
                  Regina to Saskatoon, Prince Albert to Moose Jaw, and everywhere in between.
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Overview */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6 text-primary" />
                Provincial Regulatory Framework
              </h2>
              <p className="text-muted-foreground mb-4">
                SaskTask operates in compliance with the following Saskatchewan provincial legislation:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>The Saskatchewan Employment Act</strong> - Labour standards and contractor classification</li>
                <li><strong>The Consumer Protection and Business Practices Act</strong> - Consumer rights and fair dealing</li>
                <li><strong>The Saskatchewan Human Rights Code, 2018</strong> - Anti-discrimination protections</li>
                <li><strong>The Occupational Health and Safety Act, 1993</strong> - Workplace safety requirements</li>
                <li><strong>The Workers' Compensation Act, 2013</strong> - WCB coverage requirements</li>
                <li><strong>The Freedom of Information and Protection of Privacy Act (FOIP)</strong> - Privacy protections</li>
                <li><strong>The Electronic Information and Documents Act, 2000</strong> - Electronic contracts</li>
              </ul>
            </section>

            {/* Consumer Protection */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Consumer Protection (Saskatchewan)
              </h2>
              <p className="text-muted-foreground mb-4">
                Under <strong>The Consumer Protection and Business Practices Act</strong>, Saskatchewan consumers 
                are entitled to specific protections. SaskTask ensures:
              </p>

              <h3 className="text-xl font-semibold mb-3">Your Rights as a Consumer</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li><strong>Fair Dealing:</strong> All services are described accurately and honestly</li>
                <li><strong>Unfair Practices Protection:</strong> Protection against deceptive or unconscionable conduct</li>
                <li><strong>Clear Pricing:</strong> All fees and charges are disclosed upfront before booking</li>
                <li><strong>Cancellation Rights:</strong> Clear cancellation policies as outlined in our Refund Policy</li>
                <li><strong>Dispute Resolution:</strong> Access to fair dispute resolution mechanisms</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Internet Agreement Requirements</h3>
              <p className="text-muted-foreground mb-4">
                As an internet-based service, our agreements comply with Saskatchewan's internet agreement requirements:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Clear disclosure of all material terms before you agree</li>
                <li>Express consent required before charges are applied</li>
                <li>Confirmation of transactions via email</li>
                <li>Easy access to your agreement terms at any time</li>
              </ul>

              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Filing a Consumer Complaint</h4>
                <p className="text-blue-600 dark:text-blue-500 text-sm">
                  If you believe your consumer rights have been violated, you may file a complaint with:<br />
                  <strong>Financial and Consumer Affairs Authority of Saskatchewan (FCAA)</strong><br />
                  Phone: 306-787-5645 | Toll-free: 1-877-880-5550<br />
                  Website: <a href="https://fcaa.gov.sk.ca" target="_blank" rel="noopener noreferrer" className="underline">fcaa.gov.sk.ca</a>
                </p>
              </div>
            </section>

            {/* Workers' Compensation */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <HardHat className="w-6 h-6 text-primary" />
                Workers' Compensation Board (WCB) Saskatchewan
              </h2>
              
              <Alert variant="default" className="mb-6 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-700 dark:text-amber-400">Important for Task Doers</AlertTitle>
                <AlertDescription className="text-amber-600 dark:text-amber-500">
                  As an independent contractor, you are responsible for your own Workers' Compensation coverage. 
                  This section explains your obligations under Saskatchewan law.
                </AlertDescription>
              </Alert>

              <h3 className="text-xl font-semibold mb-3">WCB Coverage in Saskatchewan</h3>
              <p className="text-muted-foreground mb-4">
                Under <strong>The Workers' Compensation Act, 2013</strong>, workers performing certain types of 
                tasks may require WCB coverage. As an independent contractor using SaskTask:
              </p>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4">Industry/Task Type</th>
                      <th className="text-left py-3 px-4">WCB Coverage</th>
                      <th className="text-left py-3 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Construction & Renovation</td>
                      <td className="py-3 px-4">
                        <span className="text-red-600 font-semibold">Mandatory</span>
                      </td>
                      <td className="py-3 px-4">Required for all construction work</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Roofing</td>
                      <td className="py-3 px-4">
                        <span className="text-red-600 font-semibold">Mandatory</span>
                      </td>
                      <td className="py-3 px-4">High-risk activity</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Electrical Work</td>
                      <td className="py-3 px-4">
                        <span className="text-red-600 font-semibold">Mandatory</span>
                      </td>
                      <td className="py-3 px-4">Requires licensing too</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Plumbing</td>
                      <td className="py-3 px-4">
                        <span className="text-red-600 font-semibold">Mandatory</span>
                      </td>
                      <td className="py-3 px-4">Requires licensing too</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Moving & Delivery</td>
                      <td className="py-3 px-4">
                        <span className="text-yellow-600 font-semibold">Recommended</span>
                      </td>
                      <td className="py-3 px-4">Personal Optional Insurance available</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Lawn Care & Landscaping</td>
                      <td className="py-3 px-4">
                        <span className="text-yellow-600 font-semibold">Recommended</span>
                      </td>
                      <td className="py-3 px-4">Depends on tools used</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Cleaning Services</td>
                      <td className="py-3 px-4">
                        <span className="text-green-600 font-semibold">Optional</span>
                      </td>
                      <td className="py-3 px-4">Low-risk activity</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Pet Care & Dog Walking</td>
                      <td className="py-3 px-4">
                        <span className="text-green-600 font-semibold">Optional</span>
                      </td>
                      <td className="py-3 px-4">Low-risk activity</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Virtual/Online Tasks</td>
                      <td className="py-3 px-4">
                        <span className="text-green-600 font-semibold">Not Required</span>
                      </td>
                      <td className="py-3 px-4">Office work exempt</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold mb-3">Personal Optional Insurance (POI)</h3>
              <p className="text-muted-foreground mb-4">
                Self-employed individuals in Saskatchewan can purchase Personal Optional Insurance from WCB Saskatchewan:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li>Covers you if you're injured while working</li>
                <li>Provides wage loss benefits and healthcare coverage</li>
                <li>Premiums based on your industry classification</li>
                <li>Can be purchased annually or for specific projects</li>
              </ul>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">WCB Saskatchewan Contact</h4>
                <p className="text-muted-foreground text-sm">
                  <strong>Workers' Compensation Board Saskatchewan</strong><br />
                  Phone: 306-787-4370 | Toll-free: 1-800-667-7590<br />
                  Website: <a href="https://www.wcbsask.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">wcbsask.com</a><br />
                  Email: customerservice@wcbsask.com
                </p>
              </div>
            </section>

            {/* Saskatchewan Human Rights */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Saskatchewan Human Rights Code
              </h2>
              <p className="text-muted-foreground mb-4">
                SaskTask is committed to upholding the <strong>Saskatchewan Human Rights Code, 2018</strong>. 
                Discrimination is prohibited on our platform based on:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                  <li>Religion or creed</li>
                  <li>Marital or family status</li>
                  <li>Sex (including pregnancy)</li>
                  <li>Sexual orientation</li>
                  <li>Gender identity</li>
                  <li>Disability</li>
                  <li>Age (18+)</li>
                </ul>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                  <li>Colour, race, or perceived race</li>
                  <li>Ancestry or place of origin</li>
                  <li>Nationality or citizenship</li>
                  <li>Indigenous identity</li>
                  <li>Receipt of public assistance</li>
                  <li>Political belief</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold mb-3">Zero Tolerance Policy</h3>
              <p className="text-muted-foreground mb-4">
                SaskTask maintains a zero tolerance policy for discrimination. If you experience discrimination:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
                <li>Report the incident through the app or email <a href="mailto:safety@sasktask.com" className="text-primary hover:underline">safety@sasktask.com</a></li>
                <li>We will investigate within 48 hours</li>
                <li>Violators will be permanently banned from the platform</li>
              </ol>

              <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">File a Human Rights Complaint</h4>
                <p className="text-purple-600 dark:text-purple-500 text-sm">
                  <strong>Saskatchewan Human Rights Commission</strong><br />
                  Phone: 306-933-5952 | Toll-free: 1-800-667-9249<br />
                  Website: <a href="https://saskatchewanhumanrights.ca" target="_blank" rel="noopener noreferrer" className="underline">saskatchewanhumanrights.ca</a>
                </p>
              </div>
            </section>

            {/* Occupational Health and Safety */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary" />
                Occupational Health and Safety (Saskatchewan)
              </h2>
              <p className="text-muted-foreground mb-4">
                Under <strong>The Saskatchewan Employment Act</strong> and <strong>The Occupational Health and 
                Safety Regulations, 2020</strong>, all workers have the right to a safe workplace.
              </p>

              <h3 className="text-xl font-semibold mb-3">Your Three Basic Rights</h3>
              <div className="grid gap-4 mb-6">
                <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-700 dark:text-green-400">Right to Know</p>
                      <p className="text-sm text-green-600 dark:text-green-500">
                        You have the right to know about hazards in the workplace
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-700 dark:text-blue-400">Right to Participate</p>
                      <p className="text-sm text-blue-600 dark:text-blue-500">
                        You have the right to participate in health and safety activities
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-700 dark:text-orange-400">Right to Refuse</p>
                      <p className="text-sm text-orange-600 dark:text-orange-500">
                        You have the right to refuse unusually dangerous work
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-3">Exercising Your Right to Refuse</h3>
              <p className="text-muted-foreground mb-4">
                If a task presents an unusual danger to your health or safety, you can refuse to perform it:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
                <li>Inform the Task Giver that you're refusing the work and explain why</li>
                <li>Report the issue to SaskTask through the app</li>
                <li>You will not be penalized for refusing unsafe work</li>
                <li>If unresolved, contact Saskatchewan Labour Relations and Workplace Safety</li>
              </ol>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Report Unsafe Work Conditions</h4>
                <p className="text-muted-foreground text-sm">
                  <strong>Saskatchewan Labour Relations and Workplace Safety</strong><br />
                  Phone: 306-787-4496 | Toll-free: 1-800-567-7233<br />
                  Website: <a href="https://www.saskatchewan.ca/business/safety-in-the-workplace" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">saskatchewan.ca/workplace-safety</a>
                </p>
              </div>
            </section>

            {/* Licensed Trades */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-primary" />
                Licensed & Certified Trades in Saskatchewan
              </h2>
              <p className="text-muted-foreground mb-4">
                Certain trades in Saskatchewan require licensing or certification. Task Doers performing 
                these tasks must hold valid credentials:
              </p>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4">Trade/Service</th>
                      <th className="text-left py-3 px-4">Regulatory Body</th>
                      <th className="text-left py-3 px-4">Requirements</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Electrical Work</td>
                      <td className="py-3 px-4">Saskatchewan Apprenticeship and Trade Certification Commission (SATCC)</td>
                      <td className="py-3 px-4">Journeyperson Certificate required</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Plumbing</td>
                      <td className="py-3 px-4">SATCC</td>
                      <td className="py-3 px-4">Journeyperson Certificate required</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Gas Fitting</td>
                      <td className="py-3 px-4">Technical Safety Authority of Saskatchewan (TSASK)</td>
                      <td className="py-3 px-4">Gas license required</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">HVAC</td>
                      <td className="py-3 px-4">SATCC / TSASK</td>
                      <td className="py-3 px-4">Refrigeration Mechanic certificate</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Automotive Repair</td>
                      <td className="py-3 px-4">SATCC</td>
                      <td className="py-3 px-4">Automotive Service Technician certificate</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Pest Control</td>
                      <td className="py-3 px-4">Ministry of Environment</td>
                      <td className="py-3 px-4">Pesticide Applicator License</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Tree Removal (Large)</td>
                      <td className="py-3 px-4">Various</td>
                      <td className="py-3 px-4">ISA Certification recommended</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Verification Required</AlertTitle>
                <AlertDescription>
                  Task Doers offering licensed trade services on SaskTask must upload proof of their 
                  credentials during verification. We verify licenses with the appropriate regulatory bodies.
                </AlertDescription>
              </Alert>
            </section>

            {/* Saskatchewan Taxes */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Banknote className="w-6 h-6 text-primary" />
                Tax Obligations in Saskatchewan
              </h2>
              <p className="text-muted-foreground mb-4">
                As an independent contractor earning income through SaskTask, you have tax obligations:
              </p>

              <h3 className="text-xl font-semibold mb-3">GST/PST Requirements</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>
                  <strong>GST (5%):</strong> You must register and collect GST if your worldwide revenue 
                  exceeds $30,000 in any 12-month period
                </li>
                <li>
                  <strong>PST (6%):</strong> Saskatchewan's Provincial Sales Tax applies to certain tangible goods. 
                  Most services are exempt from PST, but check specific categories
                </li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Income Reporting</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Report all income earned through SaskTask on your tax return</li>
                <li>You will receive a T4A slip if your earnings exceed $500 in a calendar year</li>
                <li>Keep records of all expenses for potential deductions</li>
                <li>Consider making quarterly tax instalments to avoid year-end surprises</li>
              </ul>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">CRA Contact</h4>
                  <p className="text-muted-foreground text-sm">
                    <strong>Canada Revenue Agency</strong><br />
                    Business Enquiries: 1-800-959-5525<br />
                    Website: <a href="https://www.canada.ca/en/revenue-agency.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">canada.ca/cra</a>
                  </p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Saskatchewan PST</h4>
                  <p className="text-muted-foreground text-sm">
                    <strong>Ministry of Finance</strong><br />
                    Phone: 306-787-6645 | Toll-free: 1-800-667-6102<br />
                    Website: <a href="https://www.saskatchewan.ca/pst" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">saskatchewan.ca/pst</a>
                  </p>
                </div>
              </div>
            </section>

            {/* Service Areas */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                SaskTask Service Areas
              </h2>
              <p className="text-muted-foreground mb-4">
                SaskTask primarily serves communities across Saskatchewan:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold mb-2 text-primary">Major Cities</h3>
                  <ul className="text-muted-foreground text-sm space-y-1">
                    <li>• Saskatoon</li>
                    <li>• Regina</li>
                    <li>• Prince Albert</li>
                    <li>• Moose Jaw</li>
                    <li>• Swift Current</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-primary">Mid-Size Communities</h3>
                  <ul className="text-muted-foreground text-sm space-y-1">
                    <li>• North Battleford</li>
                    <li>• Yorkton</li>
                    <li>• Estevan</li>
                    <li>• Weyburn</li>
                    <li>• Lloydminster (SK side)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-primary">Growing Areas</h3>
                  <ul className="text-muted-foreground text-sm space-y-1">
                    <li>• Martensville</li>
                    <li>• Warman</li>
                    <li>• White City</li>
                    <li>• Pilot Butte</li>
                    <li>• And many more...</li>
                  </ul>
                </div>
              </div>

              <p className="text-muted-foreground">
                We continue to expand across Saskatchewan. If your community isn't listed, you can still 
                use SaskTask - we're just building up our Task Doer network in your area!
              </p>
            </section>

            {/* Indigenous Acknowledgment */}
            <section className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-2 border-orange-200 dark:border-orange-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Indigenous Land Acknowledgment</h2>
              <p className="text-muted-foreground mb-4">
                SaskTask acknowledges that we operate on Treaty 4, Treaty 5, Treaty 6, Treaty 8, and Treaty 10 
                territories, the traditional lands of the Cree, Saulteaux, Dene, Dakota, Lakota, Nakota, 
                and the homeland of the Métis Nation.
              </p>
              <p className="text-muted-foreground">
                We are committed to serving all Saskatchewan communities, including First Nations and Métis 
                communities. We welcome Task Givers and Task Doers from all backgrounds.
              </p>
            </section>

            {/* Contacts Summary */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Phone className="w-6 h-6 text-primary" />
                Saskatchewan Regulatory Contacts
              </h2>
              
              <div className="grid gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Consumer Affairs
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    FCAA: 1-877-880-5550 | <a href="https://fcaa.gov.sk.ca" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">fcaa.gov.sk.ca</a>
                  </p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2">
                    <HardHat className="w-4 h-4" />
                    Workers' Compensation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    WCB SK: 1-800-667-7590 | <a href="https://wcbsask.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">wcbsask.com</a>
                  </p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Human Rights
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    SHRC: 1-800-667-9249 | <a href="https://saskatchewanhumanrights.ca" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">saskatchewanhumanrights.ca</a>
                  </p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Workplace Safety
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    SK Labour: 1-800-567-7233 | <a href="https://saskatchewan.ca/business/safety-in-the-workplace" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">saskatchewan.ca/workplace-safety</a>
                  </p>
                </div>
              </div>
            </section>

            {/* SaskTask Contact */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6 text-primary" />
                Contact SaskTask
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">General Support</h3>
                  <p className="text-muted-foreground text-sm">
                    Email: <a href="mailto:support@sasktask.com" className="text-primary hover:underline">support@sasktask.com</a><br />
                    Help Center: <a href="/help" className="text-primary hover:underline">sasktask.com/help</a>
                  </p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Compliance Questions</h3>
                  <p className="text-muted-foreground text-sm">
                    Email: <a href="mailto:compliance@sasktask.com" className="text-primary hover:underline">compliance@sasktask.com</a>
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
