import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CheckCircle2, 
  XCircle, 
  Award, 
  FileText, 
  Eye, 
  User, 
  Clock, 
  Building,
  Calendar,
  Search,
  Loader2,
  ExternalLink,
  Download,
  ShieldCheck,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface Certificate {
  id: string;
  user_id: string;
  name: string;
  issuing_organization: string;
  issue_date: string | null;
  expiry_date: string | null;
  certificate_number: string | null;
  document_url: string | null;
  is_public: boolean;
  status: string;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
}

interface CertificateWithProfile extends Certificate {
  profiles: {
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const AdminCertificates = () => {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<CertificateWithProfile[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateWithProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [currentDocumentUrl, setCurrentDocumentUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
  });

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      
      // First, get all certificates
      const { data: certsData, error: certsError } = await supabase
        .from("certificates")
        .select("*")
        .order("created_at", { ascending: false });

      if (certsError) throw certsError;

      // Get unique user IDs
      const userIds = [...new Set((certsData || []).map(c => c.user_id))];
      
      // Fetch profiles for those users
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url")
        .in("id", userIds);

      // Create a map of profiles by user ID
      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, p])
      );

      // Combine certificates with profiles
      const typedData: CertificateWithProfile[] = (certsData || []).map(cert => ({
        ...cert,
        profiles: profilesMap.get(cert.user_id) || null
      }));
      
      setCertificates(typedData);

      setStats({
        total: typedData.length,
        pending: typedData.filter(c => c.status === "pending").length,
        verified: typedData.filter(c => c.status === "verified").length,
        rejected: typedData.filter(c => c.status === "rejected").length,
      });
    } catch (error: any) {
      console.error("Error loading certificates:", error);
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const openReviewDialog = (certificate: CertificateWithProfile) => {
    setSelectedCertificate(certificate);
    setRejectionReason("");
    setShowReviewDialog(true);
  };

  const viewDocument = async (documentUrl: string) => {
    try {
      const { data } = supabase.storage
        .from("certificate-documents")
        .getPublicUrl(documentUrl);
      
      setCurrentDocumentUrl(data.publicUrl);
      setShowDocumentDialog(true);
    } catch (error) {
      toast.error("Failed to load document");
    }
  };

  const handleVerify = async (approved: boolean) => {
    if (!selectedCertificate) return;
    
    if (!approved && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update certificate status
      const { error: updateError } = await supabase
        .from("certificates")
        .update({
          status: approved ? "verified" : "rejected",
          verified_at: approved ? new Date().toISOString() : null,
          verified_by: approved ? user.id : null,
        })
        .eq("id", selectedCertificate.id);

      if (updateError) throw updateError;

      // Create notification for user
      await supabase.from("notifications").insert({
        user_id: selectedCertificate.user_id,
        title: approved ? "Certificate Verified! ✅" : "Certificate Rejected",
        message: approved 
          ? `Your certificate "${selectedCertificate.name}" has been verified and is now visible on your profile.`
          : `Your certificate "${selectedCertificate.name}" was rejected. Reason: ${rejectionReason}`,
        type: approved ? "certificate_verified" : "certificate_rejected",
      });

      toast.success(approved ? "Certificate verified successfully" : "Certificate rejected");
      setShowReviewDialog(false);
      loadCertificates();
    } catch (error: any) {
      console.error("Error processing certificate:", error);
      toast.error(error.message || "Failed to process certificate");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesTab = activeTab === "all" || cert.status === activeTab;
    const matchesSearch = !searchQuery || 
      cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.issuing_organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <>
      <SEOHead
        title="Certificate Verification - Admin"
        description="Review and verify user certificates"
      />
      
      <AdminLayout 
        title="Certificate Verification" 
        description="Review and verify professional certificates submitted by task doers"
      >
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Award className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Verified</p>
                  <p className="text-2xl font-bold text-green-700">{stats.verified}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, organization, or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={loadCertificates} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending">
              Pending ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="verified">
              Verified ({stats.verified})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({stats.rejected})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({stats.total})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <Card>
                <CardContent className="py-12 flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading certificates...</p>
                </CardContent>
              </Card>
            ) : filteredCertificates.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="font-medium text-muted-foreground">No certificates found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeTab === "pending" 
                      ? "No certificates pending review" 
                      : "Try adjusting your search or filters"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredCertificates.map((cert) => (
                  <Card key={cert.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* User Info */}
                        <div className="flex items-center gap-3 md:w-48 flex-shrink-0">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={cert.profiles?.avatar_url || undefined} />
                            <AvatarFallback>
                              {cert.profiles?.full_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {cert.profiles?.full_name || "Unknown User"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {cert.profiles?.email}
                            </p>
                          </div>
                        </div>

                        {/* Certificate Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold flex items-center gap-2">
                                <Award className="h-4 w-4 text-primary" />
                                {cert.name}
                              </h4>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                <Building className="h-3 w-3" />
                                {cert.issuing_organization}
                              </div>
                            </div>
                            {getStatusBadge(cert.status)}
                          </div>

                          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                            {cert.issue_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Issued: {format(new Date(cert.issue_date), "MMM d, yyyy")}
                              </span>
                            )}
                            {cert.expiry_date && (
                              <span className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Expires: {format(new Date(cert.expiry_date), "MMM d, yyyy")}
                              </span>
                            )}
                            {cert.certificate_number && (
                              <span className="font-mono">
                                #{cert.certificate_number}
                              </span>
                            )}
                            <span>
                              Submitted: {format(new Date(cert.created_at), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {cert.document_url && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => viewDocument(cert.document_url!)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          )}
                          {cert.status === "pending" && (
                            <Button 
                              size="sm"
                              onClick={() => openReviewDialog(cert)}
                            >
                              <ShieldCheck className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Review Certificate
              </DialogTitle>
              <DialogDescription>
                Verify or reject this certificate submission
              </DialogDescription>
            </DialogHeader>

            {selectedCertificate && (
              <div className="space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar>
                    <AvatarImage src={selectedCertificate.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {selectedCertificate.profiles?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedCertificate.profiles?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedCertificate.profiles?.email}</p>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground text-xs">Certificate Name</Label>
                    <p className="font-medium">{selectedCertificate.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Issuing Organization</Label>
                    <p className="font-medium">{selectedCertificate.issuing_organization}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Issue Date</Label>
                      <p className="font-medium">
                        {selectedCertificate.issue_date 
                          ? format(new Date(selectedCertificate.issue_date), "MMM d, yyyy")
                          : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Expiry Date</Label>
                      <p className="font-medium">
                        {selectedCertificate.expiry_date 
                          ? format(new Date(selectedCertificate.expiry_date), "MMM d, yyyy")
                          : "No expiry"}
                      </p>
                    </div>
                  </div>
                  {selectedCertificate.certificate_number && (
                    <div>
                      <Label className="text-muted-foreground text-xs">Certificate Number</Label>
                      <p className="font-mono font-medium">{selectedCertificate.certificate_number}</p>
                    </div>
                  )}
                </div>

                {/* View Document Button */}
                {selectedCertificate.document_url && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => viewDocument(selectedCertificate.document_url!)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Uploaded Document
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                )}

                {/* Rejection Reason */}
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">Rejection Reason (required if rejecting)</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Enter reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="destructive"
                onClick={() => handleVerify(false)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Reject
              </Button>
              <Button
                onClick={() => handleVerify(true)}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Verify
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Document Preview Dialog */}
        <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Certificate Document
              </DialogTitle>
            </DialogHeader>
            {currentDocumentUrl && (
              <div className="space-y-4">
                {currentDocumentUrl.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={currentDocumentUrl}
                    className="w-full h-[60vh] rounded-lg border"
                    title="Certificate Document"
                  />
                ) : (
                  <img
                    src={currentDocumentUrl}
                    alt="Certificate Document"
                    className="max-w-full max-h-[60vh] mx-auto rounded-lg shadow-lg"
                  />
                )}
                <div className="flex justify-center">
                  <Button variant="outline" asChild>
                    <a href={currentDocumentUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
};

export default AdminCertificates;
