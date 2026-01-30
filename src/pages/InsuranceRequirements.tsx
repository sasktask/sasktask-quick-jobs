import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Shield, 
  HardHat, 
  Car, 
  Home, 
  Briefcase, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ExternalLink,
  FileText,
  Scale,
  Zap,
  Wrench,
  Truck,
  Droplets,
  Paintbrush
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function InsuranceRequirements() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-surface">
      <SEOHead 
        title="Insurance Requirements | SaskTask"
        description="Saskatchewan insurance requirements for independent contractors on SaskTask. WCB, liability, and professional insurance information."
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Insurance Requirements</h1>
            <p className="text-muted-foreground">Last updated: January 2026</p>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              Insurance requirements for Task Doers operating in Saskatchewan. Understanding your obligations 
              protects you, your clients, and ensures compliance with provincial regulations.
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* WCB Notice */}
            <section className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <HardHat className="w-8 h-8 text-amber-600 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold mb-2 text-amber-700 dark:text-amber-400">
                    Saskatchewan Workers' Compensation Board (WCB)
                  </h2>
                  <p className="text-amber-600 dark:text-amber-500 text-sm mb-2">
                    Under the <strong>Saskatchewan Workers' Compensation Act, 2013</strong>, certain industries 
                    require mandatory WCB coverage. As an independent contractor, you may be required to register 
                    with WCB depending on the type of work you perform.
                  </p>
                  <a href="https://www.wcbsask.com/" target="_blank" rel="noopener noreferrer" 
                     className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:underline text-sm font-medium">
                    Visit WCB Saskatchewan <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </section>

            {/* Overview */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Info className="w-6 h-6 text-primary" />
                1. Overview
              </h2>
              <p className="text-muted-foreground mb-4">
                SaskTask is a technology platform that connects Task Givers with independent contractors (Task Doers). 
                As an independent contractor, you are responsible for obtaining and maintaining appropriate insurance coverage 
                for your business activities.
              </p>
              <p className="text-muted-foreground">
                Insurance requirements vary based on the type of services you provide. Some categories have 
                <strong> mandatory</strong> requirements under Saskatchewan law, while others are 
                <strong> strongly recommended</strong> for your protection.
              </p>
            </section>

            {/* Requirements by Category */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-primary" />
                2. Requirements by Service Category
              </h2>
              
              {/* Construction */}
              <div className="mb-6 p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-red-700 dark:text-red-400">
                  <HardHat className="w-5 h-5" />
                  Construction & Renovation
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full ml-2">MANDATORY</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Required Coverage:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        WCB Coverage (mandatory for construction industry)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        Commercial General Liability ($1,000,000 minimum)
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Legal Reference:</h4>
                    <p className="text-muted-foreground">
                      Saskatchewan Workers' Compensation Act, 2013<br />
                      Saskatchewan Construction Industry Labour Relations Act
                    </p>
                  </div>
                </div>
              </div>

              {/* Electrical */}
              <div className="mb-6 p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-red-700 dark:text-red-400">
                  <Zap className="w-5 h-5" />
                  Electrical Services
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full ml-2">MANDATORY</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Required Coverage:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        WCB Coverage (mandatory)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        Professional Liability ($1,000,000 minimum)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        Valid Saskatchewan Electrician's Licence
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Legal Reference:</h4>
                    <p className="text-muted-foreground">
                      Saskatchewan Electrical Licensing Act<br />
                      Saskatchewan Electrical Regulations
                    </p>
                  </div>
                </div>
              </div>

              {/* Plumbing */}
              <div className="mb-6 p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-red-700 dark:text-red-400">
                  <Droplets className="w-5 h-5" />
                  Plumbing & Gas Fitting
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full ml-2">MANDATORY</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Required Coverage:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        WCB Coverage (mandatory)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        Commercial General Liability ($1,000,000 minimum)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        Valid Saskatchewan Plumber's Licence
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Legal Reference:</h4>
                    <p className="text-muted-foreground">
                      Saskatchewan Plumbing and Drainage Regulations<br />
                      Gas Licensing Act
                    </p>
                  </div>
                </div>
              </div>

              {/* Moving & Delivery */}
              <div className="mb-6 p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-red-700 dark:text-red-400">
                  <Truck className="w-5 h-5" />
                  Moving & Delivery
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full ml-2">MANDATORY</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Required Coverage:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        Commercial Vehicle Insurance ($1,000,000+ for moving trucks)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        Cargo Insurance (for goods in transit)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        Commercial General Liability
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Legal Reference:</h4>
                    <p className="text-muted-foreground">
                      Saskatchewan Auto Fund Requirements<br />
                      The Automobile Accident Insurance Act
                    </p>
                  </div>
                </div>
              </div>

              {/* Handyman - Recommended */}
              <div className="mb-6 p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Wrench className="w-5 h-5" />
                  Handyman & General Repairs
                  <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full ml-2">RECOMMENDED</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Recommended Coverage:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        Commercial General Liability ($500,000+ recommended)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        Tools & Equipment Insurance
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Note:</h4>
                    <p className="text-muted-foreground">
                      While not legally required, liability insurance protects you from claims 
                      arising from property damage or injuries during work.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cleaning - Recommended */}
              <div className="mb-6 p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Home className="w-5 h-5" />
                  Cleaning Services
                  <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full ml-2">RECOMMENDED</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Recommended Coverage:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        Commercial General Liability ($500,000+ recommended)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        Bonding (for high-value properties)
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Note:</h4>
                    <p className="text-muted-foreground">
                      Insurance demonstrates professionalism and protects against claims 
                      for accidental damage to client property.
                    </p>
                  </div>
                </div>
              </div>

              {/* Painting - Recommended */}
              <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Paintbrush className="w-5 h-5" />
                  Painting & Decorating
                  <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full ml-2">RECOMMENDED</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Recommended Coverage:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        Commercial General Liability ($500,000+ recommended)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        Completed Operations Coverage
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Note:</h4>
                    <p className="text-muted-foreground">
                      Protects against claims for paint spills, surface damage, 
                      and issues discovered after project completion.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Types of Insurance */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                3. Types of Insurance Explained
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-2">Workers' Compensation (WCB)</h3>
                  <p className="text-sm text-muted-foreground">
                    Provides wage replacement and medical benefits if you're injured on the job. 
                    In Saskatchewan, WCB coverage is mandatory for most construction and industrial work. 
                    Self-employed individuals in mandatory industries must register as a "Personal Coverage" client.
                  </p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-2">Commercial General Liability (CGL)</h3>
                  <p className="text-sm text-muted-foreground">
                    Protects against third-party claims for bodily injury or property damage caused 
                    by your work. Standard policies cover $1-2 million per occurrence. Essential for 
                    any contractor working on client property.
                  </p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-2">Professional Liability (Errors & Omissions)</h3>
                  <p className="text-sm text-muted-foreground">
                    Covers claims arising from professional mistakes, negligence, or failure to 
                    perform services. Required for licensed trades (electrical, plumbing) and 
                    recommended for specialized services.
                  </p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-2">Commercial Vehicle Insurance</h3>
                  <p className="text-sm text-muted-foreground">
                    Required if you use a vehicle for business purposes. Personal auto insurance 
                    does NOT cover commercial use. In Saskatchewan, commercial coverage is obtained 
                    through SGI (Saskatchewan Government Insurance).
                  </p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-2">Bonding</h3>
                  <p className="text-sm text-muted-foreground">
                    A surety bond protects clients against theft, fraud, or failure to complete work. 
                    Often required for cleaning services, moving companies, and contractors working 
                    on high-value projects.
                  </p>
                </div>
              </div>
            </section>

            {/* SaskTask Insurance Badge */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                4. SaskTask Insurance Verification
              </h2>
              
              <p className="text-muted-foreground mb-4">
                Task Doers who maintain verified insurance coverage receive a special badge on their profile:
              </p>
              
              <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-700 dark:text-green-400">Insured Professional</h3>
                    <p className="text-sm text-green-600 dark:text-green-500">
                      This badge indicates verified liability insurance coverage
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-3">To Get Verified:</h3>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Upload a copy of your insurance certificate in your profile settings</li>
                <li>Ensure the policy is current and shows minimum required coverage</li>
                <li>Our team reviews and verifies within 2-3 business days</li>
                <li>Badge automatically appears on your profile upon verification</li>
                <li>Re-verification required when policy renews</li>
              </ol>
            </section>

            {/* Disclaimer */}
            <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-700 dark:text-amber-400">Important Disclaimer</AlertTitle>
              <AlertDescription className="text-amber-600 dark:text-amber-500">
                This information is for general guidance only. Insurance requirements may vary based on 
                specific circumstances, contract terms, and changes in provincial regulations. 
                Consult with a licensed insurance broker to determine appropriate coverage for your business.
              </AlertDescription>
            </Alert>

            {/* Resources */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6 text-primary" />
                5. Resources
              </h2>
              
              <div className="grid gap-4">
                <a href="https://www.wcbsask.com/" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div>
                    <h3 className="font-semibold">Saskatchewan WCB</h3>
                    <p className="text-sm text-muted-foreground">Register and manage your WCB coverage</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </a>
                
                <a href="https://www.sgi.sk.ca/" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div>
                    <h3 className="font-semibold">Saskatchewan Government Insurance (SGI)</h3>
                    <p className="text-sm text-muted-foreground">Vehicle insurance and commercial coverage</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </a>
                
                <a href="https://www.ibas.ca/" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div>
                    <h3 className="font-semibold">Insurance Brokers Association of Saskatchewan</h3>
                    <p className="text-sm text-muted-foreground">Find a licensed insurance broker</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </a>
                
                <a href="https://www.tsask.ca/" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div>
                    <h3 className="font-semibold">Technical Safety Authority of Saskatchewan</h3>
                    <p className="text-sm text-muted-foreground">Trade licensing and safety regulations</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
