import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Shield, FileText, Eye, Calendar, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Verification {
  id: string;
  user_id: string;
  legal_name: string;
  date_of_birth: string;
  id_type: string;
  id_document_url: string;
  insurance_document_url: string;
  has_insurance: boolean;
  insurance_provider: string;
  skills: string[];
  certifications: string[];
  verification_status: string;
  created_at: string;
  rejection_reason: string;
}

interface VerificationWithProfile extends Verification {
  profiles: {
    email: string;
    full_name: string;
    avatar_url: string;
  };
}

const AdminVerification = () => {
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState<VerificationWithProfile[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<VerificationWithProfile | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndLoadVerifications();
  }, []);

  const checkAdminAndLoadVerifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Access Denied",
          description: "You must be logged in to access this page.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleError || roleData?.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "You do not have permission to access this page.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      await loadVerifications();
    } catch (error: any) {
      console.error("Error checking admin status:", error);
      toast({
        title: "Error",
        description: "Failed to verify admin access.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  };

  const loadVerifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("verifications")
        .select(`
          *,
          profiles!verifications_user_id_fkey(email, full_name, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVerifications((data as any) || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load verifications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openReviewDialog = (verification: VerificationWithProfile) => {
    setSelectedVerification(verification);
    setReviewNotes(verification.rejection_reason || "");
    setShowDialog(true);
  };

  const viewDocument = (url: string) => {
    setCurrentDocument(url);
    setShowDocumentDialog(true);
  };

  const handleApproveVerification = async () => {
    if (!selectedVerification) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Update verification status
      const { error: verificationError } = await supabase
        .from("verifications")
        .update({
          verification_status: "verified",
          id_verified: true,
          id_verified_at: new Date().toISOString(),
          verified_by: session.user.id,
        })
        .eq("id", selectedVerification.id);

      if (verificationError) throw verificationError;

      // Update profile verification
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          verified_by_admin: true,
          verified_at: new Date().toISOString(),
          verified_by: session.user.id,
          verification_notes: reviewNotes || "Approved by admin",
        })
        .eq("id", selectedVerification.user_id);

      if (profileError) throw profileError;

      toast({
        title: "Verification Approved ✅",
        description: `${selectedVerification.profiles.full_name} has been verified successfully.`,
      });

      setShowDialog(false);
      await loadVerifications();
    } catch (error: any) {
      console.error("Approval error:", error);
      toast({
        title: "Error",
        description: "Failed to approve verification.",
        variant: "destructive",
      });
    }
  };

  const handleRejectVerification = async () => {
    if (!selectedVerification) return;
    if (!reviewNotes.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("verifications")
        .update({
          verification_status: "rejected",
          rejection_reason: reviewNotes,
        })
        .eq("id", selectedVerification.id);

      if (error) throw error;

      toast({
        title: "Verification Rejected",
        description: `${selectedVerification.profiles.full_name}'s verification has been rejected.`,
      });

      setShowDialog(false);
      await loadVerifications();
    } catch (error: any) {
      console.error("Rejection error:", error);
      toast({
        title: "Error",
        description: "Failed to reject verification.",
        variant: "destructive",
      });
    }
  };

  const renderVerificationCard = (verification: VerificationWithProfile) => (
    <Card key={verification.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4 flex-1">
            {verification.profiles.avatar_url ? (
              <img 
                src={verification.profiles.avatar_url} 
                alt={verification.profiles.full_name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{verification.profiles.full_name}</h3>
                  {verification.verification_status === "verified" && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                  {verification.verification_status === "pending" && (
                    <Badge variant="secondary">Pending Review</Badge>
                  )}
                  {verification.verification_status === "rejected" && (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Rejected
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{verification.profiles.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Legal Name:</span>
                  <p className="font-medium">{verification.legal_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">ID Type:</span>
                  <p className="font-medium capitalize">{verification.id_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Insurance:</span>
                  <p className="font-medium">{verification.has_insurance ? "Yes" : "No"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Submitted:</span>
                  <p className="font-medium">{new Date(verification.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {verification.skills && verification.skills.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {verification.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {verification.rejection_reason && (
                <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded text-sm">
                  <strong className="text-destructive">Rejection Reason:</strong>
                  <p className="text-muted-foreground mt-1">{verification.rejection_reason}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {verification.id_document_url && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => viewDocument(verification.id_document_url)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View ID
              </Button>
            )}
            {verification.insurance_document_url && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => viewDocument(verification.insurance_document_url)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Insurance
              </Button>
            )}
            {verification.verification_status === "pending" && (
              <Button
                size="sm"
                onClick={() => openReviewDialog(verification)}
              >
                Review
              </Button>
            )}
            {verification.verification_status !== "pending" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openReviewDialog(verification)}
              >
                View Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const pendingVerifications = verifications.filter(v => v.verification_status === "pending");
  const approvedVerifications = verifications.filter(v => v.verification_status === "verified");
  const rejectedVerifications = verifications.filter(v => v.verification_status === "rejected");

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading verifications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">ID Verification Management</h1>
            </div>
            <p className="text-muted-foreground">Review and approve user verification requests</p>
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Pending ({pendingVerifications.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({approvedVerifications.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedVerifications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingVerifications.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending verifications</p>
                  </CardContent>
                </Card>
              ) : (
                pendingVerifications.map(renderVerificationCard)
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {approvedVerifications.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No approved verifications</p>
                  </CardContent>
                </Card>
              ) : (
                approvedVerifications.map(renderVerificationCard)
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {rejectedVerifications.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No rejected verifications</p>
                  </CardContent>
                </Card>
              ) : (
                rejectedVerifications.map(renderVerificationCard)
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Verification</DialogTitle>
            <DialogDescription>
              {selectedVerification?.profiles.full_name} - {selectedVerification?.profiles.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Legal Name</Label>
                <p className="font-medium">{selectedVerification?.legal_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Date of Birth</Label>
                <p className="font-medium">{selectedVerification?.date_of_birth}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">ID Type</Label>
                <p className="font-medium capitalize">{selectedVerification?.id_type.replace('_', ' ')}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Insurance</Label>
                <p className="font-medium">{selectedVerification?.has_insurance ? `Yes - ${selectedVerification?.insurance_provider}` : "No"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{selectedVerification?.verification_status === "pending" ? "Review Notes" : "Notes / Rejection Reason"}</Label>
              <Textarea
                placeholder={selectedVerification?.verification_status === "pending" 
                  ? "Add notes about this verification..." 
                  : "View notes..."}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={4}
                disabled={selectedVerification?.verification_status !== "pending"}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {selectedVerification?.verification_status === "pending" ? (
              <>
                <Button 
                  variant="destructive"
                  onClick={handleRejectVerification}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  variant="default"
                  onClick={handleApproveVerification}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Dialog */}
      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Document Viewer</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto">
            {currentDocument && (
              currentDocument.endsWith('.pdf') ? (
                <iframe 
                  src={currentDocument}
                  className="w-full h-[70vh]"
                  title="Document Viewer"
                />
              ) : (
                <img 
                  src={currentDocument}
                  alt="ID Document"
                  className="w-full h-auto"
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminVerification;
