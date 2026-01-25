import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  Scale, 
  Shield, 
  FileText, 
  Gavel,
  Info,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";

type DisclaimerType = 
  | "general"
  | "tax"
  | "insurance"
  | "safety"
  | "medical"
  | "legal"
  | "contractor"
  | "liability"
  | "platform";

interface LegalDisclaimerProps {
  type: DisclaimerType;
  className?: string;
  compact?: boolean;
}

const disclaimerContent: Record<DisclaimerType, {
  icon: React.ElementType;
  title: string;
  content: string;
  link?: { href: string; label: string };
  variant: "default" | "destructive";
}> = {
  general: {
    icon: Info,
    title: "General Disclaimer",
    content: "The information provided on this platform is for general informational purposes only and does not constitute professional advice. You should consult with appropriate professionals before taking any action based on this information.",
    variant: "default",
  },
  tax: {
    icon: FileText,
    title: "Tax Disclaimer",
    content: "SaskTask does not provide tax advice. As an independent contractor, you are solely responsible for determining, collecting, reporting, and remitting all applicable taxes. Please consult with a qualified tax professional or the Canada Revenue Agency (canada.ca/cra) for guidance on your specific tax situation.",
    link: { href: "https://www.canada.ca/en/revenue-agency.html", label: "Visit CRA" },
    variant: "default",
  },
  insurance: {
    icon: Shield,
    title: "Insurance Notice",
    content: "SaskTask does not provide insurance coverage for users. Task Doers are responsible for maintaining their own insurance, including liability insurance and Workers' Compensation Board (WCB) coverage where required by Saskatchewan law. Task Givers should verify insurance status before hiring.",
    link: { href: "/saskatchewan-compliance", label: "View SK Requirements" },
    variant: "default",
  },
  safety: {
    icon: AlertTriangle,
    title: "Safety Warning",
    content: "Your safety is your responsibility. SaskTask does not guarantee the safety of any task or user. Always follow our safety guidelines, trust your instincts, and contact emergency services (911) if you feel threatened. Report unsafe behavior to safety@sasktask.com immediately.",
    link: { href: "/safety", label: "Safety Guidelines" },
    variant: "destructive",
  },
  medical: {
    icon: AlertTriangle,
    title: "Medical Disclaimer",
    content: "Tasks involving health, fitness, nutrition, or personal care do not constitute medical advice. Always consult with qualified healthcare professionals before making health-related decisions. In case of medical emergency, call 911 immediately.",
    variant: "destructive",
  },
  legal: {
    icon: Gavel,
    title: "Legal Disclaimer",
    content: "The information provided on this platform does not constitute legal advice. For legal matters, please consult with a qualified attorney licensed in your jurisdiction. SaskTask does not provide legal services or representation.",
    variant: "default",
  },
  contractor: {
    icon: Scale,
    title: "Independent Contractor Notice",
    content: "Task Doers on SaskTask are independent contractors, NOT employees. SaskTask does not employ, direct, or control Task Doers. Each Task Doer is responsible for their own taxes, insurance, licensing, and compliance with applicable laws.",
    link: { href: "/contractor-agreement", label: "Contractor Agreement" },
    variant: "default",
  },
  liability: {
    icon: Shield,
    title: "Limitation of Liability",
    content: "SaskTask is a platform connecting users and is not liable for the quality, safety, or legality of tasks, the qualifications of users, or any damages arising from the use of the platform. Services are provided 'AS IS' without warranties of any kind.",
    link: { href: "/terms", label: "Terms of Service" },
    variant: "default",
  },
  platform: {
    icon: Scale,
    title: "Platform Role",
    content: "SaskTask is a technology platform that connects Task Givers with Task Doers. We are not a party to agreements between users and do not guarantee task completion, user conduct, or outcomes. Users transact directly with each other.",
    variant: "default",
  },
};

export function LegalDisclaimer({ type, className = "", compact = false }: LegalDisclaimerProps) {
  const { icon: Icon, title, content, link, variant } = disclaimerContent[type];

  if (compact) {
    return (
      <div className={`text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg ${className}`}>
        <div className="flex items-start gap-2">
          <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-medium">{title}:</span>{" "}
            <span>{content}</span>
            {link && (
              <Link 
                to={link.href.startsWith("http") ? link.href : link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="ml-1 text-primary hover:underline inline-flex items-center gap-1"
              >
                {link.label}
                {link.href.startsWith("http") && <ExternalLink className="h-3 w-3" />}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Alert variant={variant} className={className}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {content}
        {link && (
          <>
            {" "}
            <Link 
              to={link.href.startsWith("http") ? link.href : link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              {link.label}
              {link.href.startsWith("http") && <ExternalLink className="h-3 w-3" />}
            </Link>
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Export a combined disclaimer component for pages
export function PageLegalFooter({ disclaimers }: { disclaimers: DisclaimerType[] }) {
  return (
    <div className="mt-8 pt-8 border-t border-border space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        <Gavel className="h-4 w-4" />
        Legal Notices
      </h3>
      <div className="space-y-3">
        {disclaimers.map((type) => (
          <LegalDisclaimer key={type} type={type} compact />
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center pt-4 border-t">
        © {new Date().getFullYear()} SaskTask. All rights reserved. |{" "}
        <Link to="/terms" className="hover:underline">Terms</Link> |{" "}
        <Link to="/privacy" className="hover:underline">Privacy</Link> |{" "}
        <Link to="/safety" className="hover:underline">Safety</Link>
      </p>
    </div>
  );
}
