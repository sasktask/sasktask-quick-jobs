import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OWNER_USER_ID } from "@/lib/constants";

interface Dispute {
  id: string;
  booking_id: string;
  task_id: string;
  raised_by: string;
  against_user: string;
  dispute_reason: string;
  dispute_details: string;
  status: string;
  resolution: string | null;
  created_at: string;
}

export default function AdminDisputes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    checkOwnerAndFetch();
  }, []);

  const checkOwnerAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    if (user.id !== OWNER_USER_ID) {
      toast({ title: "Access denied", description: "Owner only", variant: "destructive" });
      navigate("/dashboard");
      return;
    }
    fetchDisputes();
  };

  const fetchDisputes = async () => {
    const { data, error } = await supabase
      .from("disputes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load disputes",
        variant: "destructive",
      });
    } else {
      setDisputes(data || []);
    }
  };

  const handleResolve = async (disputeId: string, newStatus: string) => {
    if (newStatus === "resolved" && !resolution) {
      toast({
        title: "Resolution Required",
        description: "Please provide a resolution before marking as resolved",
        variant: "destructive",
      });
      return;
    }

    setIsResolving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("disputes")
        .update({
          status: newStatus,
          resolution: newStatus === "resolved" ? resolution : null,
          resolved_by: user?.id,
          resolved_at: newStatus === "resolved" ? new Date().toISOString() : null,
        })
        .eq("id", disputeId);

      if (error) throw error;

      toast({
        title: "Dispute Updated",
        description: `Dispute has been ${newStatus}`,
      });

      setSelectedDispute(null);
      setResolution("");
      fetchDisputes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsResolving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { icon: AlertTriangle, variant: "destructive" as const, label: "Open" },
      under_review: { icon: Clock, variant: "default" as const, label: "Under Review" },
      resolved: { icon: CheckCircle, variant: "outline" as const, label: "Resolved" },
      closed: { icon: XCircle, variant: "secondary" as const, label: "Closed" },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filterDisputes = (status: string) => {
    if (status === "all") return disputes;
    return disputes.filter((d) => d.status === status);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dispute Management</h1>
          <p className="text-muted-foreground">Review and resolve user disputes</p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All ({disputes.length})</TabsTrigger>
            <TabsTrigger value="open">Open ({filterDisputes("open").length})</TabsTrigger>
            <TabsTrigger value="under_review">Under Review ({filterDisputes("under_review").length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({filterDisputes("resolved").length})</TabsTrigger>
          </TabsList>

          {["all", "open", "under_review", "resolved"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {filterDisputes(tab).map((dispute) => (
                <Card key={dispute.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="capitalize">{dispute.dispute_reason.replace(/_/g, " ")}</CardTitle>
                        <CardDescription>
                          Submitted: {new Date(dispute.created_at).toLocaleString()}
                        </CardDescription>
                      </div>
                      {getStatusBadge(dispute.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Details</Label>
                      <p className="text-sm text-muted-foreground mt-1">{dispute.dispute_details}</p>
                    </div>

                    {dispute.resolution && (
                      <div>
                        <Label>Resolution</Label>
                        <p className="text-sm text-muted-foreground mt-1">{dispute.resolution}</p>
                      </div>
                    )}

                    {dispute.status !== "resolved" && dispute.status !== "closed" && (
                      <div className="space-y-4">
                        {selectedDispute?.id === dispute.id ? (
                          <>
                            <div className="space-y-2">
                              <Label>Resolution Details</Label>
                              <Textarea
                                placeholder="Provide a detailed resolution..."
                                value={resolution}
                                onChange={(e) => setResolution(e.target.value)}
                                rows={4}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleResolve(dispute.id, "resolved")}
                                disabled={isResolving}
                              >
                                {isResolving ? "Resolving..." : "Mark as Resolved"}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedDispute(null);
                                  setResolution("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="flex gap-2">
                            <Button onClick={() => setSelectedDispute(dispute)}>
                              Resolve Dispute
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleResolve(dispute.id, "under_review")}
                            >
                              Mark Under Review
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => handleResolve(dispute.id, "closed")}
                            >
                              Close
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {filterDisputes(tab).length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No disputes in this category
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
