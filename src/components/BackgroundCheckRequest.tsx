import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { Shield, CheckCircle, Clock, AlertTriangle, FileText, Loader2 } from "lucide-react";

interface BackgroundCheckPackage {
  id: string;
  name: string;
  description: string | null;
  check_types: string[];
  price_cad: number;
  is_required_for_tasker: boolean;
}

interface BackgroundCheck {
  id: string;
  check_type: string;
  status: string;
  requested_at: string;
  completed_at: string | null;
  result_summary: string | null;
  risk_level: string | null;
}

const checkTypeLabels: Record<string, string> = {
  criminal_record: "Criminal Record Check",
  identity_verification: "Identity Verification",
  employment_history: "Employment History",
  education_verification: "Education Verification",
  credit_check: "Credit Check",
  reference_check: "Reference Check",
};

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-yellow-500", label: "Pending" },
  processing: { icon: Loader2, color: "text-blue-500", label: "Processing" },
  passed: { icon: CheckCircle, color: "text-green-500", label: "Passed" },
  failed: { icon: AlertTriangle, color: "text-red-500", label: "Failed" },
  expired: { icon: AlertTriangle, color: "text-orange-500", label: "Expired" },
  cancelled: { icon: AlertTriangle, color: "text-muted-foreground", label: "Cancelled" },
};

export function BackgroundCheckRequest() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const queryClient = useQueryClient();

  const { data: packages, isLoading: packagesLoading } = useQuery({
    queryKey: ["background-check-packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("background_check_packages")
        .select("*")
        .eq("is_active", true)
        .order("price_cad", { ascending: true });

      if (error) throw error;
      return data as BackgroundCheckPackage[];
    },
  });

  const { data: existingChecks, isLoading: checksLoading } = useQuery({
    queryKey: ["my-background-checks"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("background_checks")
        .select("*")
        .eq("user_id", user.id)
        .order("requested_at", { ascending: false });

      if (error) throw error;
      return data as BackgroundCheck[];
    },
  });

  const requestCheckMutation = useMutation({
    mutationFn: async (packageId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const pkg = packages?.find(p => p.id === packageId);
      if (!pkg) throw new Error("Package not found");

      // Record consent
      const { error: consentError } = await supabase
        .from("background_check_consents")
        .insert({
          user_id: user.id,
          consent_type: "background_check",
          consent_text: `I consent to a background check including: ${pkg.check_types.join(", ")}. I understand this may include criminal record checks, identity verification, and other screenings as applicable.`,
          consent_version: "1.0",
        });

      if (consentError) throw consentError;

      // Create background check requests for each type in the package
      const checkTypes = pkg.check_types as Array<"criminal_record" | "identity_verification" | "employment_history" | "education_verification" | "credit_check" | "reference_check">;
      
      for (const checkType of checkTypes) {
        const { error: checksError } = await supabase
          .from("background_checks")
          .insert({
            user_id: user.id,
            check_type: checkType,
            status: "pending" as const,
            provider: "manual",
            consent_given: true,
            consent_given_at: new Date().toISOString(),
          });

        if (checksError) throw checksError;
      }

      // Update profile status
      await supabase
        .from("profiles")
        .update({ background_check_status: "pending" })
        .eq("id", user.id);
    },
    onSuccess: () => {
      toast({
        title: "Background Check Requested",
        description: "Your request has been submitted. You'll be notified when it's complete.",
      });
      queryClient.invalidateQueries({ queryKey: ["my-background-checks"] });
      setSelectedPackage(null);
      setConsentGiven(false);
    },
    onError: (error) => {
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const hasPendingOrActiveChecks = existingChecks?.some(
    c => ["pending", "processing", "passed"].includes(c.status)
  );

  if (packagesLoading || checksLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Existing Checks */}
      {existingChecks && existingChecks.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Background Checks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {existingChecks.map((check) => {
              const config = statusConfig[check.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              return (
                <div
                  key={check.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`h-5 w-5 ${config.color} ${check.status === "processing" ? "animate-spin" : ""}`} />
                    <div>
                      <p className="font-medium">{checkTypeLabels[check.check_type] || check.check_type}</p>
                      <p className="text-xs text-muted-foreground">
                        Requested: {new Date(check.requested_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={check.status === "passed" ? "default" : "secondary"}>
                    {config.label}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Request New Check */}
      {!hasPendingOrActiveChecks && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Request Background Check
            </CardTitle>
            <CardDescription>
              Complete a background check to increase your trust score and unlock more opportunities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Packages */}
            <div className="grid gap-4 md:grid-cols-3">
              {packages?.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPackage === pkg.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{pkg.name}</h3>
                    {pkg.is_required_for_tasker && (
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                  <div className="space-y-1 mb-3">
                    {pkg.check_types.map((type) => (
                      <div key={type} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {checkTypeLabels[type] || type}
                      </div>
                    ))}
                  </div>
                  <p className="text-lg font-bold text-primary">
                    ${pkg.price_cad.toFixed(2)} CAD
                  </p>
                </div>
              ))}
            </div>

            {selectedPackage && (
              <>
                <Separator />

                {/* Consent */}
                <Alert>
                  <AlertDescription className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="consent"
                        checked={consentGiven}
                        onCheckedChange={(checked) => setConsentGiven(checked === true)}
                      />
                      <label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                        I consent to a background check being conducted on my behalf. I understand that
                        this may include criminal record checks, identity verification, and other
                        screenings as applicable. I authorize SaskTask and its partners to collect,
                        use, and disclose my personal information for this purpose in accordance with
                        applicable privacy laws (PIPEDA).
                      </label>
                    </div>
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={() => requestCheckMutation.mutate(selectedPackage)}
                  disabled={!consentGiven || requestCheckMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {requestCheckMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Request Background Check
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
