import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export default function FAQ() {
  const faqs = [
    {
      question: "How does SaskTask work?",
      answer: "SaskTask connects task givers with skilled taskers. Post your task, get offers from nearby taskers, review their profiles, and hire the one that fits best. Payment is held securely until the job is done."
    },
    {
      question: "How do I become a Tasker?",
      answer: "Click 'Become a Tasker' in the navigation menu, complete the verification process including ID verification and background check, set up your profile with skills and rates, and start bidding on tasks!"
    },
    {
      question: "Is payment secure?",
      answer: "Yes! We use Stripe for secure payment processing. Your payment is held in escrow until the task is completed to your satisfaction, protecting both task givers and taskers."
    },
    {
      question: "What if I need to cancel a task?",
      answer: "You can cancel a task before it's accepted with no fee. After acceptance, cancellation policies vary based on timing. Review our Terms of Service for detailed cancellation policies."
    },
    {
      question: "How are taskers verified?",
      answer: "All taskers go through a verification process including ID verification, background checks, and insurance verification. Verified badges are displayed on tasker profiles."
    },
    {
      question: "What categories of tasks can I post?",
      answer: "We support a wide range of tasks including home cleaning, handyman services, moving help, furniture assembly, lawn care, delivery, and much more. If you need help with something, chances are we have taskers who can do it!"
    },
    {
      question: "How do reviews work?",
      answer: "After a task is completed, both the task giver and tasker can leave reviews. These reviews help build trust in our community and help users make informed decisions."
    },
    {
      question: "What fees does SaskTask charge?",
      answer: "Task givers pay what they agree to for the task. Taskers pay a small service fee (typically 15-20%) which covers payment processing, insurance, and platform maintenance."
    },
    {
      question: "Can I message taskers before hiring?",
      answer: "Yes! Once a tasker makes an offer on your task, you can message them directly through our secure messaging system to discuss details, ask questions, and clarify expectations."
    },
    {
      question: "What if I'm not satisfied with the work?",
      answer: "Your satisfaction is important. If you're not happy with the completed work, contact our support team within 24 hours. We'll review the situation and work to find a fair resolution."
    },
    {
      question: "Do taskers provide their own tools?",
      answer: "This varies by task. When posting a task, you can specify whether tools are provided or if the tasker should bring their own. This will be clearly stated in the task details."
    },
    {
      question: "Is there a minimum task amount?",
      answer: "Yes, to ensure fair compensation for taskers, we have a minimum task amount of $25. This helps maintain quality and ensures tasks are worth the tasker's time."
    }
  ];

  return (
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

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 p-6 bg-card border border-border rounded-lg text-center">
            <h2 className="text-xl font-bold mb-2">Still have questions?</h2>
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? Contact our support team.
            </p>
            <a 
              href="mailto:support@sasktask.com" 
              className="text-primary hover:underline font-semibold"
            >
              support@sasktask.com
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}