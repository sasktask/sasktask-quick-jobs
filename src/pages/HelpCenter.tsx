import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  MessageSquare, 
  Shield, 
  CreditCard, 
  Users, 
  FileText,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Scale,
  BookOpen,
  Briefcase,
  Home,
  Gavel
} from "lucide-react";

export default function HelpCenter() {
  const helpCategories = [
    {
      icon: Users,
      title: "Getting Started",
      description: "New to SaskTask? Learn the basics of posting tasks and becoming a tasker.",
      links: [
        { text: "How to create an account", href: "/how-it-works" },
        { text: "Post your first task", href: "/post-task" },
        { text: "Become a tasker", href: "/become-tasker" },
        { text: "Understanding the platform", href: "/how-it-works" }
      ]
    },
    {
      icon: Shield,
      title: "Safety & Trust",
      description: "Your safety is our priority. Learn about our verification and protection measures.",
      links: [
        { text: "Tasker verification process", href: "/verification" },
        { text: "Background check information", href: "/verification" },
        { text: "Insurance coverage details", href: "#insurance" },
        { text: "Report a safety concern", href: "/contact" }
      ]
    },
    {
      icon: CreditCard,
      title: "Payments & Billing",
      description: "Everything about payments, fees, refunds, and getting paid as a tasker.",
      links: [
        { text: "How payments work", href: "#payments" },
        { text: "Platform fees explained", href: "#fees" },
        { text: "Refund policy", href: "/terms" },
        { text: "Setting up payouts", href: "/account" }
      ]
    },
    {
      icon: AlertTriangle,
      title: "Disputes & Issues",
      description: "Having a problem? Learn how to resolve disputes and get support.",
      links: [
        { text: "Open a dispute", href: "/bookings" },
        { text: "Cancellation policy", href: "/terms" },
        { text: "Report a problem", href: "/contact" },
        { text: "Saskatchewan consumer rights", href: "#consumer-rights" }
      ]
    },
    {
      icon: FileText,
      title: "Legal & Policies",
      description: "Terms of service, privacy policy, and legal information.",
      links: [
        { text: "Terms of Service", href: "/terms" },
        { text: "Privacy Policy", href: "/privacy" },
        { text: "Canadian tax obligations", href: "#tax-info" },
        { text: "Saskatchewan labour laws", href: "#labour-laws" }
      ]
    },
    {
      icon: Briefcase,
      title: "For Taskers",
      description: "Resources specifically for service providers on the platform.",
      links: [
        { text: "Maximizing earnings", href: "/become-tasker" },
        { text: "Tax reporting (T4A)", href: "#tax-info" },
        { text: "Building your profile", href: "/profile" },
        { text: "Handling difficult clients", href: "/contact" }
      ]
    }
  ];

  const legalInfo = [
    {
      icon: Scale,
      title: "Your Rights Under Canadian Law",
      content: `As a user of SaskTask in Saskatchewan, Canada, you are protected by:
      
• **Consumer Protection and Business Practices Act (Saskatchewan)** - Protects consumers from unfair business practices and ensures transparent pricing.

• **Privacy Act & PIPEDA** - Your personal information is protected under Canadian federal privacy legislation. We only collect data necessary for service delivery.

• **Saskatchewan Employment Act** - Taskers are classified as independent contractors, not employees. This means taskers are responsible for their own tax obligations and are not entitled to employment benefits through SaskTask.

• **Canadian Human Rights Act** - We do not discriminate based on race, national or ethnic origin, colour, religion, age, sex, sexual orientation, gender identity, marital status, family status, genetic characteristics, or disability.`
    },
    {
      icon: Gavel,
      title: "Independent Contractor Status",
      content: `**Important Notice for Taskers:**

Under Saskatchewan law and Canada Revenue Agency (CRA) guidelines, taskers on SaskTask operate as independent contractors. This means:

• **You are self-employed** - Not an employee of SaskTask or task givers
• **Tax responsibility** - You must report income and may need to register for GST/HST if earning over $30,000/year
• **No employment benefits** - CPP contributions, EI premiums, and workers' compensation are your responsibility
• **Business expenses** - You may deduct legitimate business expenses from your taxable income
• **T4A slips** - You will receive a T4A slip for earnings over $500 in a calendar year

We recommend consulting with a tax professional or visiting the CRA website for guidance.`
    },
    {
      icon: Shield,
      title: "Platform Insurance & Liability",
      content: `**SaskTask Platform Protection:**

• **General liability coverage** - Tasks completed through our platform include basic liability coverage up to $1,000,000 per incident.

• **Property damage protection** - Coverage for accidental damage during task completion, subject to terms and claim limits.

• **What's NOT covered:**
  - Intentional damage or misconduct
  - Tasks not booked through the platform
  - Cash payments outside the platform
  - Work performed before payment authorization
  
• **Filing a claim** - Contact support@sasktask.com within 48 hours of an incident with photos and documentation.

• **Workers' Compensation** - Taskers are encouraged to obtain their own Saskatchewan Workers' Compensation Board (WCB) coverage for personal injury protection.`
    },
    {
      icon: CreditCard,
      title: "Payment Terms & Fees",
      content: `**How SaskTask Payments Work:**

• **Secure escrow system** - Payment is authorized when you book, held securely, and released to the tasker only after task completion.

• **Platform service fee** - Taskers pay a 15% service fee on completed tasks. Task givers pay the agreed task amount with no additional fees.

• **Payment processing** - We use Stripe, a PCI-compliant payment processor. All transactions are encrypted and secure.

• **Payout schedule** - Taskers receive payments within 3-5 business days after task completion via direct deposit.

• **Refund policy** - Full refunds available for cancellations made 24+ hours before scheduled start. Partial refunds or credits may apply for later cancellations.

• **Canadian currency** - All prices are in CAD. GST/HST may apply to platform fees.`
    }
  ];

  return (
    <>
      <SEOHead
        title="Help Center - SaskTask Support & Resources"
        description="Get help with SaskTask. Find answers about payments, safety, disputes, and learn about your rights under Canadian and Saskatchewan law."
        url="/help"
      />
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 pt-32 pb-20">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <HelpCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl font-bold mb-4">
              Help <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Center</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers, get support, and learn about your rights as a SaskTask user in Saskatchewan, Canada
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Link to="/contact">
              <Card className="hover:shadow-lg transition-all cursor-pointer border-primary/20 hover:border-primary">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-1">Contact Support</h3>
                  <p className="text-sm text-muted-foreground">Get help from our team</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/faq">
              <Card className="hover:shadow-lg transition-all cursor-pointer border-primary/20 hover:border-primary">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-1">FAQs</h3>
                  <p className="text-sm text-muted-foreground">Quick answers to common questions</p>
                </CardContent>
              </Card>
            </Link>
            <Card className="border-primary/20">
              <CardContent className="p-6 text-center">
                <Phone className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-1">Emergency Line</h3>
                <p className="text-sm text-muted-foreground">Call 911 for emergencies</p>
              </CardContent>
            </Card>
          </div>

          {/* Help Categories */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-8 text-center">Browse Help Topics</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpCategories.map((category, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <category.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{category.description}</p>
                    <ul className="space-y-2">
                      {category.links.map((link, linkIdx) => (
                        <li key={linkIdx}>
                          <Link 
                            to={link.href}
                            className="text-primary hover:underline text-sm flex items-center gap-2"
                          >
                            <span>→</span> {link.text}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Legal Information */}
          <section className="mb-20" id="legal-info">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Legal Information & Your Rights
            </h2>
            <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
              SaskTask operates under Canadian federal law and Saskatchewan provincial regulations. 
              Here's what you need to know about your rights and responsibilities.
            </p>
            
            <div className="space-y-6">
              {legalInfo.map((info, idx) => (
                <Card key={idx} id={info.title.toLowerCase().replace(/\s+/g, '-')}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <info.icon className="h-6 w-6 text-primary" />
                      <CardTitle>{info.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                      {info.content.split('\n').map((line, i) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <p key={i} className="font-semibold text-foreground mt-4 first:mt-0">{line.replace(/\*\*/g, '')}</p>;
                        }
                        if (line.startsWith('• **')) {
                          const parts = line.replace('• **', '').split('**');
                          return (
                            <p key={i} className="ml-4">
                              <span className="font-semibold text-foreground">• {parts[0]}</span>
                              {parts[1]}
                            </p>
                          );
                        }
                        if (line.startsWith('• ') || line.startsWith('- ')) {
                          return <p key={i} className="ml-4">{line}</p>;
                        }
                        return <p key={i}>{line}</p>;
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Tax Information Section */}
          <section className="mb-20" id="tax-info">
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Canadian Tax Information for Taskers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Income Reporting</h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• All income earned through SaskTask must be reported to the CRA</li>
                      <li>• You will receive a T4A slip for annual earnings over $500</li>
                      <li>• Keep records of all tasks completed and income received</li>
                      <li>• File your taxes by April 30 (June 15 for self-employed, but payment due April 30)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">GST/HST Registration</h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Registration required if earning over $30,000 in 4 consecutive quarters</li>
                      <li>• Saskatchewan uses 5% GST (no provincial PST on most services)</li>
                      <li>• You may voluntarily register to claim input tax credits</li>
                      <li>• Visit canada.ca/gst-hst for registration</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Deductible Expenses</h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Vehicle expenses (mileage or actual costs)</li>
                      <li>• Tools and equipment purchased for tasks</li>
                      <li>• Cell phone and internet (business portion)</li>
                      <li>• Professional development and certifications</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">CPP Contributions</h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Self-employed individuals pay both employee and employer portions</li>
                      <li>• 2024 rate: 11.9% on net self-employment income</li>
                      <li>• Maximum pensionable earnings apply</li>
                      <li>• Contributions are tax-deductible</li>
                    </ul>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 p-4 bg-background rounded-lg">
                  <strong>Disclaimer:</strong> This information is provided for general guidance only and does not constitute tax advice. 
                  Please consult with a qualified tax professional or visit the Canada Revenue Agency website (canada.ca/cra) for specific guidance on your situation.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Contact Information */}
          <section className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Still Need Help?</h2>
              <p className="text-muted-foreground">Our support team is here for you</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Mail className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-1">Email Support</h3>
                <a href="mailto:support@sasktask.com" className="text-primary hover:underline">
                  support@sasktask.com
                </a>
                <p className="text-sm text-muted-foreground mt-1">Response within 24 hours</p>
              </div>
              <div className="text-center">
                <MapPin className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-1">Location</h3>
                <p className="text-muted-foreground">Saskatchewan, Canada</p>
                <p className="text-sm text-muted-foreground mt-1">Serving all SK communities</p>
              </div>
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-1">Support Hours</h3>
                <p className="text-muted-foreground">Mon-Fri: 8AM - 8PM CST</p>
                <p className="text-sm text-muted-foreground mt-1">Weekends: 10AM - 6PM CST</p>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link to="/contact">
                <Button size="lg" variant="hero">
                  Contact Support
                </Button>
              </Link>
            </div>
          </section>
        </div>
        
        <Footer />
      </div>
    </>
  );
}
