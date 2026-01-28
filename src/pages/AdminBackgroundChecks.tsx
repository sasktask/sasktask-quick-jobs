import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { 
  Shield, Search, CheckCircle, XCircle, Clock, 
  AlertTriangle, User, Calendar, FileText, Loader2,
  Eye, RefreshCw, Download, Filter
} from "lucide-react";
import { format } from "date-fns";

interface BackgroundCheck {
  id: string;
  user_id: string;
  check_type: string;
  status: string;
  provider: string | null;
  requested_at: string;
  completed_at: string | null;
  result_summary: string | null;
  risk_level: string | null;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  consent_given: boolean;
  profiles?: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

const checkTypeLabels: Record<string, string> = {
  criminal_record: "Criminal Record",
  identity_verification: "Identity",
  employment_history: "Employment",
  education_verification: "Education",
  credit_check: "Credit",
  reference_check: "Reference",
};

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  pending: { icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-100" },
  processing: { icon: Loader2, color: "text-blue-600", bgColor: "bg-blue-100" },
  passed: { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100" },
  failed: { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100" },
  expired: { icon: AlertTriangle, color: "text-orange-600", bgColor: "bg-orange-100" },
  cancelled: { icon: XCircle, color: "text-gray-600", bgColor: "bg-gray-100" },
};

const riskColors: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default function AdminBackgroundChecks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCheck, setSelectedCheck] = useState<BackgroundCheck | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [riskLevel, setRiskLevel] = useState<string>("low");
  const [resultSummary, setResultSummary] = useState("");
  const queryClient = useQueryClient();

  const { data: checks, isLoading, refetch } = useQuery({
    queryKey: ["admin-background-checks", statusFilter],
    queryFn: async () => {
      // First get the background checks
      let query = supabase
        .from("background_checks")
        .select("*")
        .order("requested_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as "pending" | "processing" | "passed" | "failed" | "expired" | "cancelled");
      }

      const { data: checksData, error: checksError } = await query;
      if (checksError) throw checksError;

      // Get unique user IDs
      const userIds = [...new Set(checksData.map(c => c.user_id))];
      
      // Fetch profiles for those users
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      // Combine the data
      return checksData.map(check => ({
        ...check,
        profiles: profilesMap.get(check.user_id) || null,
      })) as BackgroundCheck[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["background-check-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("background_checks")
        .select("status");

      if (error) throw error;

      const counts = {
        pending: 0,
        processing: 0,
        passed: 0,
        failed: 0,
        total: data.length,
      };

      data.forEach((check) => {
        if (check.status in counts) {
          counts[check.status as keyof typeof counts]++;
        }
      });

      return counts;
    },
  });

  const updateCheckMutation = useMutation({
    mutationFn: async ({ 
      checkId, 
      status, 
      riskLevel, 
      resultSummary, 
      reviewNotes 
    }: { 
      checkId: string; 
      status: string; 
      riskLevel: string;
      resultSummary: string;
      reviewNotes: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("background_checks")
        .update({
          status: status as "pending" | "processing" | "passed" | "failed" | "expired" | "cancelled",
          risk_level: riskLevel as "low" | "medium" | "high" | "critical",
          result_summary: resultSummary,
          review_notes: reviewNotes,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          completed_at: ["passed", "failed"].includes(status) ? new Date().toISOString() : null,
        })
        .eq("id", checkId);

      if (error) throw error;

      // Update profile background check status if this was the last check
      const check = checks?.find(c => c.id === checkId);
      if (check && ["passed", "failed"].includes(status)) {
        const userChecks = checks?.filter(c => c.user_id === check.user_id) || [];
        const allResolved = userChecks.every(c => 
          c.id === checkId ? ["passed", "failed"].includes(status) : ["passed", "failed", "cancelled", "expired"].includes(c.status)
        );
        const anyFailed = userChecks.some(c => 
          c.id === checkId ? status === "failed" : c.status === "failed"
        );

        if (allResolved) {
          await supabase
            .from("profiles")
            .update({ 
              background_check_status: anyFailed ? "failed" : "verified",
              background_check_verified_at: !anyFailed ? new Date().toISOString() : null,
              background_check_expires_at: !anyFailed 
                ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() 
                : null,
            })
            .eq("id", check.user_id);
        }
      }
    },
    onSuccess: () => {
      toast({ title: "Background check updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin-background-checks"] });
      queryClient.invalidateQueries({ queryKey: ["background-check-stats"] });
      setSelectedCheck(null);
    },
    onError: (error) => {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    },
  });

  const filteredChecks = checks?.filter(check => {
    if (!searchQuery) return true;
    const name = check.profiles?.full_name?.toLowerCase() || "";
    const email = check.profiles?.email?.toLowerCase() || "";
    return name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("admin-background-checks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "background_checks" },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleReviewSubmit = (status: string) => {
    if (!selectedCheck) return;
    updateCheckMutation.mutate({
      checkId: selectedCheck.id,
      status,
      riskLevel,
      resultSummary,
      reviewNotes,
    });
  };

  const openReviewDialog = (check: BackgroundCheck) => {
    setSelectedCheck(check);
    setReviewNotes(check.review_notes || "");
    setRiskLevel(check.risk_level || "low");
    setResultSummary(check.result_summary || "");
  };

  return (
    <AdminLayout title="Background Checks" description="Review and manage user background check requests">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Background Checks
            </h1>
            <p className="text-muted-foreground">Review and manage user background check requests</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total", value: stats?.total || 0, color: "text-foreground" },
            { label: "Pending", value: stats?.pending || 0, color: "text-yellow-600" },
            { label: "Processing", value: stats?.processing || 0, color: "text-blue-600" },
            { label: "Passed", value: stats?.passed || 0, color: "text-green-600" },
            { label: "Failed", value: stats?.failed || 0, color: "text-red-600" },
          ].map((stat) => (
            <Card key={stat.label} className="glass-card">
              <CardContent className="pt-4 text-center">
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Checks List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Background Check Requests</CardTitle>
            <CardDescription>
              {filteredChecks?.length || 0} requests found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredChecks?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No background checks found</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredChecks?.map((check) => {
                    const config = statusConfig[check.status] || statusConfig.pending;
                    const StatusIcon = config.icon;
                    return (
                      <div
                        key={check.id}
                        className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={check.profiles?.avatar_url || ""} />
                            <AvatarFallback>
                              {check.profiles?.full_name?.[0] || <User className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{check.profiles?.full_name || "Unknown"}</p>
                            <p className="text-sm text-muted-foreground">{check.profiles?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">
                            {checkTypeLabels[check.check_type] || check.check_type}
                          </Badge>
                          {check.risk_level && (
                            <Badge className={riskColors[check.risk_level]}>
                              {check.risk_level.toUpperCase()}
                            </Badge>
                          )}
                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${config.bgColor}`}>
                            <StatusIcon className={`h-4 w-4 ${config.color} ${check.status === "processing" ? "animate-spin" : ""}`} />
                            <span className={`text-sm font-medium capitalize ${config.color}`}>
                              {check.status}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(check.requested_at), "MMM d, yyyy")}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openReviewDialog(check)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={!!selectedCheck} onOpenChange={() => setSelectedCheck(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Background Check</DialogTitle>
              <DialogDescription>
                Review and update the status of this background check request
              </DialogDescription>
            </DialogHeader>

            {selectedCheck && (
              <div className="space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedCheck.profiles?.avatar_url || ""} />
                    <AvatarFallback>
                      {selectedCheck.profiles?.full_name?.[0] || <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedCheck.profiles?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedCheck.profiles?.email}</p>
                  </div>
                  <Badge className="ml-auto">
                    {checkTypeLabels[selectedCheck.check_type]}
                  </Badge>
                </div>

                {/* Check Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Current Status</label>
                    <p className="text-muted-foreground capitalize">{selectedCheck.status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Consent Given</label>
                    <p className="text-muted-foreground">{selectedCheck.consent_given ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Requested</label>
                    <p className="text-muted-foreground">
                      {format(new Date(selectedCheck.requested_at), "PPP")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Provider</label>
                    <p className="text-muted-foreground capitalize">{selectedCheck.provider || "Manual"}</p>
                  </div>
                </div>

                {/* Review Form */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Risk Level</label>
                    <Select value={riskLevel} onValueChange={setRiskLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Risk</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
                        <SelectItem value="critical">Critical Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Result Summary</label>
                    <Input
                      value={resultSummary}
                      onChange={(e) => setResultSummary(e.target.value)}
                      placeholder="Brief summary of check results..."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Review Notes</label>
                    <Textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Internal notes about this review..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedCheck(null)}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleReviewSubmit("processing")}
                disabled={updateCheckMutation.isPending}
              >
                <Clock className="h-4 w-4 mr-2" />
                Mark Processing
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReviewSubmit("failed")}
                disabled={updateCheckMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Fail
              </Button>
              <Button
                onClick={() => handleReviewSubmit("passed")}
                disabled={updateCheckMutation.isPending}
              >
                {updateCheckMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
