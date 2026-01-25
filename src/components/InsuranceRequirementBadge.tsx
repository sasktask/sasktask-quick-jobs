import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, HardHat, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface InsuranceRequirementBadgeProps {
  category: string;
  showDetails?: boolean;
  className?: string;
}

type InsuranceLevel = "mandatory" | "recommended" | "optional" | "not_required";

interface InsuranceInfo {
  level: InsuranceLevel;
  label: string;
  description: string;
  wcbRequired: boolean;
  liabilityRequired: boolean;
}

const categoryInsuranceMap: Record<string, InsuranceInfo> = {
  construction: {
    level: "mandatory",
    label: "WCB Required",
    description: "Workers' Compensation Board coverage is mandatory under Saskatchewan law",
    wcbRequired: true,
    liabilityRequired: true,
  },
  renovation: {
    level: "mandatory",
    label: "WCB Required",
    description: "WCB coverage required for renovation work in Saskatchewan",
    wcbRequired: true,
    liabilityRequired: true,
  },
  electrical: {
    level: "mandatory",
    label: "Licensed & Insured Required",
    description: "Must have valid electrical license and WCB coverage",
    wcbRequired: true,
    liabilityRequired: true,
  },
  plumbing: {
    level: "mandatory",
    label: "Licensed & Insured Required",
    description: "Must have valid plumbing license and WCB coverage",
    wcbRequired: true,
    liabilityRequired: true,
  },
  roofing: {
    level: "mandatory",
    label: "WCB Required",
    description: "High-risk work - WCB coverage mandatory",
    wcbRequired: true,
    liabilityRequired: true,
  },
  hvac: {
    level: "mandatory",
    label: "Licensed & Insured Required",
    description: "HVAC work requires licensing and WCB coverage",
    wcbRequired: true,
    liabilityRequired: true,
  },
  moving: {
    level: "recommended",
    label: "Insurance Recommended",
    description: "Liability insurance strongly recommended for moving services",
    wcbRequired: false,
    liabilityRequired: true,
  },
  delivery: {
    level: "recommended",
    label: "Insurance Recommended",
    description: "Vehicle and liability insurance recommended",
    wcbRequired: false,
    liabilityRequired: true,
  },
  landscaping: {
    level: "recommended",
    label: "Insurance Recommended",
    description: "Liability insurance recommended, especially for power tools",
    wcbRequired: false,
    liabilityRequired: true,
  },
  "lawn care": {
    level: "recommended",
    label: "Insurance Recommended",
    description: "Liability insurance recommended for lawn care services",
    wcbRequired: false,
    liabilityRequired: false,
  },
  "heavy lifting": {
    level: "recommended",
    label: "Insurance Recommended",
    description: "Personal Optional Insurance from WCB recommended",
    wcbRequired: false,
    liabilityRequired: true,
  },
  cleaning: {
    level: "optional",
    label: "Insurance Optional",
    description: "Low-risk activity - insurance optional but recommended",
    wcbRequired: false,
    liabilityRequired: false,
  },
  "pet care": {
    level: "optional",
    label: "Insurance Optional",
    description: "Pet liability insurance recommended but not required",
    wcbRequired: false,
    liabilityRequired: false,
  },
  tutoring: {
    level: "not_required",
    label: "No Insurance Required",
    description: "Virtual/online tasks typically don't require insurance",
    wcbRequired: false,
    liabilityRequired: false,
  },
  virtual: {
    level: "not_required",
    label: "No Insurance Required",
    description: "Remote work is exempt from WCB requirements",
    wcbRequired: false,
    liabilityRequired: false,
  },
  admin: {
    level: "not_required",
    label: "No Insurance Required",
    description: "Administrative tasks don't require insurance",
    wcbRequired: false,
    liabilityRequired: false,
  },
};

function getInsuranceInfo(category: string): InsuranceInfo {
  const normalizedCategory = category.toLowerCase().trim();
  
  // Check direct match
  if (categoryInsuranceMap[normalizedCategory]) {
    return categoryInsuranceMap[normalizedCategory];
  }
  
  // Check partial match
  for (const [key, value] of Object.entries(categoryInsuranceMap)) {
    if (normalizedCategory.includes(key) || key.includes(normalizedCategory)) {
      return value;
    }
  }
  
  // Default
  return {
    level: "optional",
    label: "Insurance Recommended",
    description: "Insurance coverage recommended for this task type",
    wcbRequired: false,
    liabilityRequired: false,
  };
}

export function InsuranceRequirementBadge({ 
  category, 
  showDetails = false,
  className = ""
}: InsuranceRequirementBadgeProps) {
  const info = getInsuranceInfo(category);

  const getBadgeVariant = () => {
    switch (info.level) {
      case "mandatory":
        return "destructive";
      case "recommended":
        return "secondary";
      case "optional":
        return "outline";
      case "not_required":
        return "outline";
      default:
        return "outline";
    }
  };

  const getIcon = () => {
    switch (info.level) {
      case "mandatory":
        return <ShieldAlert className="h-3 w-3" />;
      case "recommended":
        return <Shield className="h-3 w-3" />;
      case "optional":
        return <ShieldCheck className="h-3 w-3" />;
      case "not_required":
        return <ShieldCheck className="h-3 w-3" />;
      default:
        return <Shield className="h-3 w-3" />;
    }
  };

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={getBadgeVariant()} className={`gap-1 ${className}`}>
              {getIcon()}
              {info.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{info.description}</p>
            {info.wcbRequired && (
              <p className="text-red-500 text-xs mt-1">
                ⚠️ WCB Saskatchewan coverage required by law
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={`rounded-lg border p-4 ${className} ${
      info.level === "mandatory" 
        ? "border-red-300 bg-red-50 dark:bg-red-950/30" 
        : info.level === "recommended"
        ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30"
        : "border-border bg-muted/50"
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${
          info.level === "mandatory" 
            ? "bg-red-100 dark:bg-red-900" 
            : info.level === "recommended"
            ? "bg-amber-100 dark:bg-amber-900"
            : "bg-muted"
        }`}>
          {info.level === "mandatory" ? (
            <HardHat className={`h-5 w-5 ${
              info.level === "mandatory" ? "text-red-600" : "text-amber-600"
            }`} />
          ) : (
            <Shield className={`h-5 w-5 ${
              info.level === "recommended" ? "text-amber-600" : "text-muted-foreground"
            }`} />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={getBadgeVariant()}>{info.label}</Badge>
            {info.level === "mandatory" && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <p className={`text-sm ${
            info.level === "mandatory" 
              ? "text-red-700 dark:text-red-400" 
              : "text-muted-foreground"
          }`}>
            {info.description}
          </p>
          
          {(info.wcbRequired || info.liabilityRequired) && (
            <div className="mt-3 space-y-1">
              {info.wcbRequired && (
                <div className="flex items-center gap-2 text-xs">
                  <ShieldAlert className="h-3 w-3 text-red-500" />
                  <span className="text-red-600 dark:text-red-400">WCB Saskatchewan coverage required</span>
                </div>
              )}
              {info.liabilityRequired && (
                <div className="flex items-center gap-2 text-xs">
                  <Shield className="h-3 w-3 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400">Liability insurance required</span>
                </div>
              )}
            </div>
          )}

          {info.level === "mandatory" && (
            <Link 
              to="/saskatchewan-compliance" 
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
            >
              View SK Compliance Requirements <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export { getInsuranceInfo, type InsuranceInfo, type InsuranceLevel };
