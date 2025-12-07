import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Users, Shield, CreditCard, Briefcase, Scale } from "lucide-react";

export default function FAQ() {
  const faqCategories = [
    {
      title: "Getting Started",
      icon: Users,
      faqs: [
        {
          question: "What is SaskTask?",
          answer: "SaskTask is Saskatchewan's local task marketplace that connects people who need help with everyday tasks to skilled, verified taskers in their community. Whether you need snow removal, cleaning, moving help, or handyman services, SaskTask makes it easy to find trusted local help."
        },
        {
          question: "How does SaskTask work?",
          answer: "For Task Givers: Post your task with details and budget, receive offers from nearby taskers, review their profiles and ratings, choose the best fit, communicate through our secure platform, and pay only when the job is completed to your satisfaction.\n\nFor Taskers: Browse available tasks, submit proposals, get accepted, complete the work professionally, and receive payment directly to your bank account."
        },
        {
          question: "Is SaskTask available throughout Saskatchewan?",
          answer: "Yes! SaskTask operates across all of Saskatchewan, including Regina, Saskatoon, Prince Albert, Moose Jaw, Swift Current, Yorkton, North Battleford, and all smaller communities. Our platform uses location-based matching to connect you with taskers in your area."
        },
        {
          question: "How do I create an account?",
          answer: "Creating an account is free and takes less than 2 minutes. Click 'Sign Up', enter your email and create a password, verify your email address, and complete your profile. You can then immediately post tasks or, after additional verification, become a tasker."
        }
      ]
    },
    {
      title: "Safety & Verification",
      icon: Shield,
      faqs: [
        {
          question: "How are taskers verified?",
          answer: "All taskers must complete our verification process which includes:\n\n• Government ID verification (Canadian driver's license or passport)\n• Criminal background check through a certified Canadian provider\n• Address and contact verification\n• Profile review by our trust & safety team\n\nVerified taskers display verification badges on their profiles. We recommend only hiring verified taskers for added peace of mind."
        },
        {
          question: "Is my personal information secure?",
          answer: "Yes. SaskTask complies with Canadian privacy laws including PIPEDA (Personal Information Protection and Electronic Documents Act). We use bank-level encryption, never share your personal data with third parties without consent, and you control what information is visible on your profile. Read our full Privacy Policy for details."
        },
        {
          question: "What insurance coverage does SaskTask provide?",
          answer: "Tasks completed through our platform include general liability coverage up to $1,000,000 per incident, covering accidental property damage during task completion. This protection is subject to terms and requires the task to be fully booked and paid through our platform. For personal injury protection, taskers are encouraged to obtain their own WCB coverage."
        },
        {
          question: "What if I feel unsafe during a task?",
          answer: "Your safety is our top priority. If you ever feel unsafe:\n\n• Leave the situation immediately if you're in danger\n• Call 911 for emergencies\n• Report the incident to our Trust & Safety team via the app or email\n• We have a zero-tolerance policy for harassment, threats, or inappropriate behavior\n\nBoth parties can cancel a task at any time if they feel uncomfortable."
        }
      ]
    },
    {
      title: "Payments & Fees",
      icon: CreditCard,
      faqs: [
        {
          question: "How do payments work?",
          answer: "SaskTask uses a secure escrow payment system:\n\n1. When you book a tasker, your payment is authorized and held securely\n2. Funds are not released to the tasker until you confirm task completion\n3. Once approved, payment is transferred to the tasker within 3-5 business days\n\nAll payments are processed securely through Stripe, a PCI-compliant payment processor. We never store your full credit card information."
        },
        {
          question: "What fees does SaskTask charge?",
          answer: "Task Givers: Pay the agreed task amount with no additional platform fees.\n\nTaskers: A 15% service fee is deducted from completed tasks. This covers:\n• Payment processing\n• Platform insurance coverage\n• Customer support\n• Platform development and maintenance\n• Trust & safety systems\n\nAll prices are displayed in Canadian dollars (CAD)."
        },
        {
          question: "What is your refund policy?",
          answer: "• Cancellations 24+ hours before scheduled start: Full refund\n• Cancellations within 24 hours: 50% refund or credit\n• No-shows by taskers: Full refund plus priority rebooking\n• Unsatisfactory work: Contact support within 48 hours for review\n\nDisputes are reviewed by our team and resolved fairly based on the circumstances and evidence provided by both parties."
        },
        {
          question: "How do taskers get paid?",
          answer: "Taskers receive payments via direct deposit to their Canadian bank account. To set up payouts:\n\n1. Complete identity verification\n2. Add your banking information in Account Settings\n3. Payments are processed 3-5 business days after task completion\n\nYou can track all earnings and pending payments in your Dashboard."
        }
      ]
    },
    {
      title: "For Taskers",
      icon: Briefcase,
      faqs: [
        {
          question: "How do I become a tasker?",
          answer: "Becoming a tasker involves these steps:\n\n1. Create an account and select 'Become a Tasker'\n2. Complete your profile with skills, experience, and service areas\n3. Upload government-issued ID for verification\n4. Consent to and pass a background check\n5. Set your rates and availability\n\nThe verification process typically takes 2-5 business days. Once approved, you can start bidding on tasks immediately."
        },
        {
          question: "Am I an employee or independent contractor?",
          answer: "Taskers on SaskTask are independent contractors, not employees. This means:\n\n• You set your own rates and schedule\n• You're responsible for your own taxes (income tax, CPP contributions)\n• You may need to register for GST/HST if earning over $30,000/year\n• You're not entitled to employment benefits through SaskTask\n\nWe provide T4A slips for earnings over $500 in a calendar year. Consult a tax professional for personalized advice."
        },
        {
          question: "What categories of tasks can I offer?",
          answer: "SaskTask supports a wide range of services including:\n\n• Snow Removal & Yard Work\n• Cleaning (home, office, move-in/out)\n• Moving & Delivery\n• Handyman & Home Repairs\n• Furniture Assembly\n• Pet Care\n• Errands & Shopping\n• Tech Support\n• And many more!\n\nYou can select multiple categories that match your skills. Some categories may require proof of certifications (e.g., electrical, plumbing)."
        },
        {
          question: "How can I maximize my earnings?",
          answer: "Top-earning taskers on SaskTask:\n\n• Complete their profile with photos and detailed descriptions\n• Respond to task requests quickly (within 1 hour)\n• Maintain a 4.8+ star rating\n• Offer competitive but fair pricing\n• Communicate professionally with clients\n• Show up on time and complete work thoroughly\n• Ask satisfied clients for reviews\n• Stay active during peak demand times"
        }
      ]
    },
    {
      title: "Legal & Compliance",
      icon: Scale,
      faqs: [
        {
          question: "What laws govern SaskTask in Saskatchewan?",
          answer: "SaskTask operates under Canadian federal law and Saskatchewan provincial regulations, including:\n\n• Consumer Protection and Business Practices Act (Saskatchewan)\n• Personal Information Protection and Electronic Documents Act (PIPEDA)\n• Canada Revenue Agency tax regulations\n• Canadian Human Rights Act\n• Saskatchewan Employment Act (regarding contractor classification)\n\nOur Terms of Service and Privacy Policy are designed to comply with all applicable laws."
        },
        {
          question: "Do I need a business license to be a tasker?",
          answer: "This depends on your municipality and the services you offer. In most Saskatchewan cities, you may need a business license if you're operating as a sole proprietor providing services. Check with your local city hall for specific requirements. Some services (like electrical or plumbing) may require provincial trade certifications."
        },
        {
          question: "What are my tax obligations as a tasker?",
          answer: "As a self-employed individual in Canada, you must:\n\n• Report all income on your annual tax return\n• Pay both employee and employer portions of CPP (11.9% in 2024)\n• Register for and collect GST/HST if earning over $30,000/year\n• Keep records of income and business expenses\n• File taxes by June 15 (payment due April 30)\n\nSaskTask provides T4A slips for annual earnings over $500. Consult a tax professional for personalized guidance."
        },
        {
          question: "How does SaskTask handle disputes?",
          answer: "We have a structured dispute resolution process:\n\n1. Direct resolution: We encourage parties to communicate and resolve issues directly\n2. Mediation: Our support team reviews evidence and mediates\n3. Final decision: If needed, we make a binding decision based on our Terms of Service\n\nAll disputes must be filed within 48 hours of task completion. We aim to resolve most disputes within 5 business days."
        }
      ]
    }
  ];

  return (
    <>
      <SEOHead
        title="FAQ - Frequently Asked Questions | SaskTask"
        description="Find answers to common questions about SaskTask, Saskatchewan's local task marketplace. Learn about payments, safety, verification, and how the platform works."
        url="/faq"
      />
      
      <div className="min-h-screen flex flex-col bg-gradient-surface">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <HelpCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
              <p className="text-lg text-muted-foreground">
                Find answers to common questions about SaskTask
              </p>
            </div>

            {faqCategories.map((category, catIdx) => (
              <div key={catIdx} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <category.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">{category.title}</h2>
                </div>
                
                <Accordion type="single" collapsible className="space-y-4">
                  {category.faqs.map((faq, faqIdx) => (
                    <AccordionItem 
                      key={faqIdx} 
                      value={`cat-${catIdx}-item-${faqIdx}`}
                      className="bg-card border border-border rounded-lg px-6"
                    >
                      <AccordionTrigger className="text-left font-semibold hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}

            <div className="mt-12 p-6 bg-card border border-border rounded-lg text-center">
              <h2 className="text-xl font-bold mb-2">Still have questions?</h2>
              <p className="text-muted-foreground mb-4">
                Can't find what you're looking for? Visit our Help Center or contact our support team.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link 
                  to="/help"
                  className="text-primary hover:underline font-semibold"
                >
                  Visit Help Center
                </Link>
                <span className="text-muted-foreground">|</span>
                <a 
                  href="mailto:support@sasktask.com" 
                  className="text-primary hover:underline font-semibold"
                >
                  support@sasktask.com
                </a>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
