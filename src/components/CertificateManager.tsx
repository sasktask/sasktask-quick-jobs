import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Award, 
  Plus, 
  Upload, 
  Eye, 
  EyeOff, 
  Trash2, 
  FileText, 
  Calendar,
  Building,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  X
} from "lucide-react";
import { format } from "date-fns";

interface Certificate {
  id: string;
  name: string;
  issuing_organization: string;
  issue_date: string | null;
  expiry_date: string | null;
  certificate_number: string | null;
  document_url: string | null;
  is_public: boolean;
  status: string;
  verified_at: string | null;
  created_at: string;
}

interface CertificateManagerProps {
  userId: string;
  isOwnProfile?: boolean;
}

export const CertificateManager = ({ userId, isOwnProfile = true }: CertificateManagerProps) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    issuing_organization: "",
    issue_date: "",
    expiry_date: "",
    certificate_number: "",
    is_public: false
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, [userId]);

  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error: any) {
      console.error("Error fetching certificates:", error);
      toast({
        title: "Error",
        description: "Failed to load certificates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `cert_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("certificate-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setDocumentUrl(filePath);
      toast({
        title: "Upload Successful",
        description: "Certificate document uploaded"
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.issuing_organization) {
      toast({
        title: "Missing Information",
        description: "Please provide certificate name and issuing organization",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("certificates")
        .insert({
          user_id: user.id,
          name: formData.name,
          issuing_organization: formData.issuing_organization,
          issue_date: formData.issue_date || null,
          expiry_date: formData.expiry_date || null,
          certificate_number: formData.certificate_number || null,
          document_url: documentUrl,
          is_public: formData.is_public,
          status: "pending"
        });

      if (error) throw error;

      toast({
        title: "Certificate Added",
        description: "Your certificate has been submitted for verification"
      });

      // Reset form
      setFormData({
        name: "",
        issuing_organization: "",
        issue_date: "",
        expiry_date: "",
        certificate_number: "",
        is_public: false
      });
      setDocumentFile(null);
      setDocumentUrl(null);
      setIsDialogOpen(false);
      fetchCertificates();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleVisibility = async (certId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("certificates")
        .update({ is_public: !currentStatus })
        .eq("id", certId);

      if (error) throw error;

      setCertificates(prev =>
        prev.map(c => c.id === certId ? { ...c, is_public: !currentStatus } : c)
      );

      toast({
        title: currentStatus ? "Certificate Hidden" : "Certificate Public",
        description: currentStatus 
          ? "This certificate is now private" 
          : "This certificate is now visible to others"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteCertificate = async (certId: string, documentUrl: string | null) => {
    try {
      // Delete document from storage if exists
      if (documentUrl) {
        await supabase.storage
          .from("certificate-documents")
          .remove([documentUrl]);
      }

      const { error } = await supabase
        .from("certificates")
        .delete()
        .eq("id", certId);

      if (error) throw error;

      setCertificates(prev => prev.filter(c => c.id !== certId));
      toast({
        title: "Certificate Deleted",
        description: "The certificate has been removed"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string, expiryDate: string | null) => {
    // Check if expired
    if (expiryDate && new Date(expiryDate) < new Date()) {
      return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Expired</Badge>;
    }

    switch (status) {
      case "verified":
        return <Badge className="gap-1 bg-green-500"><CheckCircle className="h-3 w-3" />Verified</Badge>;
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // For viewing other profiles, only show public certificates
  const visibleCertificates = isOwnProfile 
    ? certificates 
    : certificates.filter(c => c.is_public);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Professional Certificates
            </CardTitle>
            <CardDescription>
              {isOwnProfile 
                ? "Add and manage your professional certifications"
                : "Professional certifications and qualifications"
              }
            </CardDescription>
          </div>
          {isOwnProfile && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Certificate
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Certificate</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cert-name">Certificate Name *</Label>
                    <Input
                      id="cert-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Red Seal Electrician"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cert-org">Issuing Organization *</Label>
                    <Input
                      id="cert-org"
                      value={formData.issuing_organization}
                      onChange={(e) => setFormData({ ...formData, issuing_organization: e.target.value })}
                      placeholder="e.g., Saskatchewan Apprenticeship"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="issue-date">Issue Date</Label>
                      <Input
                        id="issue-date"
                        type="date"
                        value={formData.issue_date}
                        onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiry-date">Expiry Date</Label>
                      <Input
                        id="expiry-date"
                        type="date"
                        value={formData.expiry_date}
                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cert-number">Certificate Number</Label>
                    <Input
                      id="cert-number"
                      value={formData.certificate_number}
                      onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Upload Certificate Document</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      {documentUrl ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="text-sm">Document uploaded</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDocumentFile(null);
                              setDocumentUrl(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <Input
                            type="file"
                            accept="image/*,.pdf"
                            className="max-w-xs mx-auto"
                            disabled={isUploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setDocumentFile(file);
                                handleFileUpload(file);
                              }
                            }}
                          />
                          {isUploading && (
                            <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="public-toggle">Make Public</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow others to see this certificate
                      </p>
                    </div>
                    <Switch
                      id="public-toggle"
                      checked={formData.is_public}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                    />
                  </div>

                  <Button 
                    onClick={handleSubmit} 
                    className="w-full" 
                    disabled={isSaving || isUploading}
                  >
                    {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Add Certificate
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {visibleCertificates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>{isOwnProfile ? "No certificates added yet" : "No public certificates"}</p>
            {isOwnProfile && (
              <p className="text-sm">Add your professional certifications to build trust</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {visibleCertificates.map((cert) => (
              <div
                key={cert.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Award className="h-6 w-6 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium">{cert.name}</h4>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Building className="h-3.5 w-3.5" />
                        {cert.issuing_organization}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(cert.status, cert.expiry_date)}
                      {cert.is_public ? (
                        <Badge variant="outline" className="gap-1">
                          <Eye className="h-3 w-3" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-muted-foreground">
                          <EyeOff className="h-3 w-3" />
                          Private
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {cert.issue_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Issued: {format(new Date(cert.issue_date), "MMM yyyy")}
                      </span>
                    )}
                    {cert.expiry_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Expires: {format(new Date(cert.expiry_date), "MMM yyyy")}
                      </span>
                    )}
                    {cert.certificate_number && (
                      <span>#{cert.certificate_number}</span>
                    )}
                  </div>

                  {isOwnProfile && (
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVisibility(cert.id, cert.is_public)}
                      >
                        {cert.is_public ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5 mr-1" />
                            Make Private
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Make Public
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteCertificate(cert.id, cert.document_url)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
