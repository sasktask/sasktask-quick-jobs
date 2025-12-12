import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Shield, FileText, Eye, User, Clock } from "lucide-react";
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
  legal_name: string | null;
  date_of_birth: string | null;
  id_type: string | null;
  id_document_url: string | null;
  insurance_document_url: string | null;
  has_insurance: boolean;
  insurance_provider: string | null;
  skills: string[] | null;
  certifications: string[] | null;
  verification_status: string | null;
  created_at: string;
  rejection_reason: string | null;
}

interface VerificationWithProfile extends Verification {
  profiles: {
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const AdminVerification = () => {
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState<VerificationWithProfile[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<VerificationWithProfile | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    loadVerifications();
  }, []);

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
      
      const typedData = (data || []) as VerificationWithProfile[];
      setVerifications(typedData);

      setStats({
        total: typedData.length,
        pending: typedData.filter(v => v.verification_status === "pending").length,
        approved: typedData.filter(v => v.verification_status === "verified").length,
        rejected: typedData.filter(v => v.verification_status === "rejected").length,
      });
    } catch (error: any) {
      console.error("Error loading verifications:", error);
      toast.error("Failed to load verifications");
    } finally {
      setLoading(false);
    }
  };

  const openReviewDialog = (verification: VerificationWithProfile) => {
    setSelectedVerification(verification);
    setReviewNotes(verification.rejection_reason || "");
    setShowDialog(true);
  };

  const viewDocument = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('verification-documents')
        .createSignedUrl(filePath, 3600);
      
      if (error) throw error;
      setCurrentDocument(data.signedUrl);
      setShowDocumentDialog(true);
    } catch (error: any) {
      toast.error("Failed to load document");
    }
  };

  const handleApproveVerification = async () => {
    if (!selectedVerification) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: verificationError } = await supabase
        .from("verifications")
        .update({
          verification_status: "verified",
          id_verified: true,
          id_verified_at: new Date().toISOString(),
          verified_by: user.id,
        })
        .eq("id", selectedVerification.id);

      if (verificationError) throw verificationError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          verified_by_admin: true,
          verified_at: new Date().toISOString(),
          verified_by: user.id,
          verification_notes: reviewNotes || "Approved by admin",
        })
        .eq("id", selectedVerification.user_id);

      if (profileError) throw profileError;

      toast.success(`${selectedVerification.profiles?.full_name || 'User'} verified successfully`);
      setShowDialog(false);
      setReviewNotes("");
      await loadVerifications();
    } catch (error: any) {
      console.error("Approval error:", error);
      toast.error("Failed to approve verification");
    }
  };

  const handleRejectVerification = async () => {
    if (!selectedVerification) return;
    if (!reviewNotes.trim()) {
      toast.error("Please provide a reason for rejection");
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

      toast.success("Verification rejected");
      setShowDialog(false);
      setReviewNotes("");
      await loadVerifications();
    } catch (error: any) {
      console.error("Rejection error:", error);
      toast.error("Failed to reject verification");
    }
  };

  const renderVerificationCard = (verification: VerificationWithProfile) => (
    <Card key={verification.id}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4 flex-1">
            {verification.profiles?.avatar_url ? (
              <img 
                src={verification.profiles.avatar_url} 
                alt={verification.profiles.full_name || "User"}
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
                  <h3 className="font-semibold text-lg">{verification.profiles?.full_name || "Unknown"}</h3>
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
                <p className="text-sm text-muted-foreground">{verification.profiles?.email || "No email"}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Legal Name:</span>
                  <p className="font-medium">{verification.legal_name || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">ID Type:</span>
                  <p className="font-medium capitalize">{verification.id_type?.replace('_', ' ') || "N/A"}</p>
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
                onClick={() => viewDocument(verification.id_document_url!)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View ID
              </Button>
            )}
            {verification.insurance_document_url && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => viewDocument(verification.insurance_document_url!)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Insurance
              </Button>
            )}
            <Button
              size="sm"
              variant={verification.verification_status === "pending" ? "default" : "outline"}
              onClick={() => openReviewDialog(verification)}
            >
              {verification.verification_status === "pending" ? "Review" : "View Details"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const pendingVerifications = verifications.filter(v => v.verification_status === "pending");
  const approvedVerifications = verifications.filter(v => v.verification_status === "verified");
  const rejectedVerifications = verifications.filter(v => v.verification_status === "rejected");

  return (
    <>
      <SEOHead
        title="ID Verification - Admin"
        description="Review and approve user verifications"
      />
      
      <AdminLayout title="ID Verification Management" description="Review and approve user verification requests">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
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
            {loading ? (
              <p>Loading...</p>
            ) : pendingVerifications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No pending verifications
                </CardContent>
              </Card>
            ) : (
              pendingVerifications.map(renderVerificationCard)
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedVerifications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No approved verifications
                </CardContent>
              </Card>
            ) : (
              approvedVerifications.map(renderVerificationCard)
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedVerifications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No rejected verifications
                </CardContent>
              </Card>
            ) : (
              rejectedVerifications.map(renderVerificationCard)
            )}
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Verification</DialogTitle>
              <DialogDescription>
                {selectedVerification?.profiles?.full_name} - {selectedVerification?.profiles?.email}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Legal Name</Label>
                  <p className="font-medium">{selectedVerification?.legal_name || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date of Birth</Label>
                  <p className="font-medium">{selectedVerification?.date_of_birth || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">ID Type</Label>
                  <p className="font-medium capitalize">{selectedVerification?.id_type?.replace('_', ' ') || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Insurance</Label>
                  <p className="font-medium">
                    {selectedVerification?.has_insurance 
                      ? `Yes - ${selectedVerification?.insurance_provider || 'Unknown'}` 
                      : "No"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  {selectedVerification?.verification_status === "pending" 
                    ? "Review Notes" 
                    : "Notes / Rejection Reason"}
                </Label>
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

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              {selectedVerification?.verification_status === "pending" && (
                <>
                  <Button
                    variant="destructive"
                    onClick={handleRejectVerification}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button onClick={handleApproveVerification}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </>
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
            <div className="overflow-auto max-h-[70vh]">
              {currentDocument && (
                currentDocument.endsWith('.pdf') ? (
                  <iframe 
                    src={currentDocument}
                    className="w-full h-[60vh]"
                    title="Document viewer"
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
      </AdminLayout>
    </>
  );
};

export default AdminVerification;