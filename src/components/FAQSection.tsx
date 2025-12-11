import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HelpCircle, MessageCircle } from "lucide-react";

const faqs = [
  {
    question: "How does SaskTask work?",
    answer: "SaskTask connects people who need help with tasks (Task Givers) to skilled local workers (Task Doers). Simply post a task describing what you need done, receive proposals from verified task doers, choose the best match, and pay securely through our platform once the work is completed."
  },
  {
    question: "How do I become a Task Doer?",
    answer: "Sign up for a free account, complete your profile with your skills and experience, verify your identity, and start browsing available tasks. You can submit proposals to tasks that match your expertise and set your own rates."
  },
  {
    question: "Is my payment secure?",
    answer: "Yes! We use secure escrow payments. When you hire a Task Doer, your payment is held securely until the task is completed to your satisfaction. We use bank-level encryption and Stripe for all transactions."
  },
  {
    question: "How are Task Doers verified?",
    answer: "All Task Doers undergo ID verification. Additionally, we offer optional enhanced background checks for certain categories. Each user has a public rating and review history to help you make informed decisions."
  },
  {
    question: "What if I'm not satisfied with the work?",
    answer: "Your satisfaction is our priority. If there's an issue, you can communicate directly with the Task Doer through our messaging system. If the issue can't be resolved, our 24/7 support team can help mediate disputes and ensure fair outcomes."
  },
  {
    question: "What types of tasks can I post?",
    answer: "You can post a wide variety of tasks including home repairs, cleaning, moving help, delivery, snow removal, lawn care, assembly, pet care, errands, and much more. If it's legal and safe, you can probably find help for it on SaskTask!"
  },
  {
    question: "How much does it cost to use SaskTask?",
    answer: "Posting tasks and browsing is completely free. Task Doers set their own rates, and we charge a small service fee on completed transactions to maintain the platform and provide secure payments."
  },
  {
    question: "Can I cancel a booking?",
    answer: "Yes, you can cancel a booking, though cancellation policies may apply depending on how close to the scheduled time you cancel. Early cancellations are typically free, while late cancellations may incur a small fee to compensate the Task Doer."
  }
];

export const FAQSection = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4">
            <HelpCircle className="h-4 w-4" />
            Got Questions?
          </div>
          <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about using SaskTask
          </p>
        </div>

        <Card className="border-2">
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b last:border-0">
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-semibold text-base pr-4">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="text-center mt-10">
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/help">
              <Button variant="outline" className="gap-2">
                <HelpCircle className="h-4 w-4" />
                Visit Help Center
              </Button>
            </Link>
            <Link to="/contact">
              <Button className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
