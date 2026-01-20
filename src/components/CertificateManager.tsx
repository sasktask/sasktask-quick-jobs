import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  X,
  ExternalLink,
  Download,
  Share2,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Heart,
  Wrench,
  Sparkles,
  Copy,
  Check
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

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

const CERTIFICATE_TYPES = [
  { value: "professional", label: "Professional License", icon: Briefcase },
  { value: "education", label: "Education/Training", icon: GraduationCap },
  { value: "trade", label: "Trade Certificate", icon: Wrench },
  { value: "safety", label: "Safety Certification", icon: ShieldCheck },
  { value: "health", label: "Health & Safety", icon: Heart },
  { value: "other", label: "Other", icon: Award }
];

export const CertificateManager = ({ userId, isOwnProfile = true }: CertificateManagerProps) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    issuing_organization: "",
    issue_date: "",
    expiry_date: "",
    certificate_number: "",
    certificate_type: "professional",
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
    setUploadProgress(0);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const fileExt = file.name.split('.').pop();
      const fileName = `cert_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("certificate-documents")
        .upload(filePath, file);

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      setUploadProgress(100);
      setDocumentUrl(filePath);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }

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

      resetForm();
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

  const resetForm = () => {
    setFormData({
      name: "",
      issuing_organization: "",
      issue_date: "",
      expiry_date: "",
      certificate_number: "",
      certificate_type: "professional",
      is_public: false
    });
    setDocumentFile(null);
    setDocumentUrl(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setIsDialogOpen(false);
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

  const copyShareLink = async (certId: string) => {
    const link = `${window.location.origin}/certificate/${certId}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(certId);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: "Link Copied",
      description: "Certificate link copied to clipboard"
    });
  };

  const getStatusBadge = (status: string, expiryDate: string | null) => {
    if (expiryDate) {
      const daysUntilExpiry = differenceInDays(new Date(expiryDate), new Date());
      if (daysUntilExpiry < 0) {
        return (
          <Badge variant="destructive" className="gap-1 animate-pulse">
            <AlertCircle className="h-3 w-3" />Expired
          </Badge>
        );
      }
      if (daysUntilExpiry <= 30) {
        return (
          <Badge variant="outline" className="gap-1 text-orange-600 border-orange-300 bg-orange-50">
            <Clock className="h-3 w-3" />Expires in {daysUntilExpiry}d
          </Badge>
        );
      }
    }

    switch (status) {
      case "verified":
        return (
          <Badge className="gap-1 bg-gradient-to-r from-green-500 to-emerald-500 border-0">
            <CheckCircle className="h-3 w-3" />Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3 animate-spin" />Pending Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCertificateIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("safety") || lowerName.includes("first aid")) return ShieldCheck;
    if (lowerName.includes("education") || lowerName.includes("degree") || lowerName.includes("diploma")) return GraduationCap;
    if (lowerName.includes("trade") || lowerName.includes("electrician") || lowerName.includes("plumber")) return Wrench;
    if (lowerName.includes("health") || lowerName.includes("medical")) return Heart;
    return Award;
  };

  const filteredCertificates = certificates.filter(cert => {
    if (activeTab === "all") return true;
    if (activeTab === "verified") return cert.status === "verified";
    if (activeTab === "pending") return cert.status === "pending";
    if (activeTab === "expiring") {
      if (!cert.expiry_date) return false;
      const daysUntilExpiry = differenceInDays(new Date(cert.expiry_date), new Date());
      return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    }
    return true;
  });

  const visibleCertificates = isOwnProfile 
    ? filteredCertificates 
    : filteredCertificates.filter(c => c.is_public);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex flex-col items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-8 w-8 text-primary" />
          </motion.div>
          <p className="text-sm text-muted-foreground">Loading certificates...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Professional Certificates
              {certificates.filter(c => c.status === "verified").length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {certificates.filter(c => c.status === "verified").length} verified
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {isOwnProfile 
                ? "Showcase your qualifications and build trust"
                : "Verified professional certifications"
              }
            </CardDescription>
          </div>
          {isOwnProfile && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 shadow-lg">
                  <Plus className="h-4 w-4" />
                  Add Certificate
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Add New Certificate
                  </DialogTitle>
                  <DialogDescription>
                    Add your professional certifications to build trust with clients
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-5 py-4">
                  {/* Certificate Type */}
                  <div className="space-y-2">
                    <Label>Certificate Type</Label>
                    <Select 
                      value={formData.certificate_type}
                      onValueChange={(v) => setFormData({ ...formData, certificate_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CERTIFICATE_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cert-name">Certificate Name *</Label>
                    <Input
                      id="cert-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Red Seal Electrician, CPR Certification"
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
                    <Label htmlFor="cert-number">Certificate/License Number</Label>
                    <Input
                      id="cert-number"
                      value={formData.certificate_number}
                      onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
                      placeholder="Optional - helps with verification"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Upload Certificate Document</Label>
                    <div className="border-2 border-dashed rounded-xl p-6 text-center transition-colors hover:border-primary/50 hover:bg-primary/5">
                      {documentUrl ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="space-y-3"
                        >
                          {previewUrl ? (
                            <img 
                              src={previewUrl} 
                              alt="Preview" 
                              className="max-h-32 mx-auto rounded-lg shadow-md"
                            />
                          ) : (
                            <FileText className="h-12 w-12 mx-auto text-primary" />
                          )}
                          <p className="text-sm font-medium text-primary">Document uploaded</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDocumentFile(null);
                              setDocumentUrl(null);
                              setPreviewUrl(null);
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </motion.div>
                      ) : isUploading ? (
                        <div className="space-y-3">
                          <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
                          <Progress value={uploadProgress} className="max-w-xs mx-auto" />
                          <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                          <p className="text-sm font-medium mb-1">Drop your file here or click to browse</p>
                          <p className="text-xs text-muted-foreground mb-3">PDF, JPG, or PNG up to 10MB</p>
                          <Input
                            type="file"
                            accept="image/*,.pdf"
                            className="max-w-xs mx-auto cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setDocumentFile(file);
                                handleFileUpload(file);
                              }
                            }}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border">
                    <div className="space-y-0.5">
                      <Label htmlFor="public-toggle" className="flex items-center gap-2">
                        {formData.is_public ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        Make Public
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Allow others to see this certificate on your profile
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
                    className="w-full gap-2" 
                    size="lg"
                    disabled={isSaving || isUploading}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Add Certificate
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filter tabs for own profile */}
        {isOwnProfile && certificates.length > 0 && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-black/20">
              <TabsTrigger value="all">All ({certificates.length})</TabsTrigger>
              <TabsTrigger value="verified">
                Verified ({certificates.filter(c => c.status === "verified").length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({certificates.filter(c => c.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="expiring">Expiring</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </CardHeader>

      <CardContent className="pt-6">
        {visibleCertificates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="relative inline-block mb-4">
              <Award className="h-16 w-16 text-muted-foreground/30" />
              <motion.div
                className="absolute inset-0"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Award className="h-16 w-16 text-primary/20" />
              </motion.div>
            </div>
            <p className="font-medium text-muted-foreground">
              {isOwnProfile ? "No certificates added yet" : "No public certificates"}
            </p>
            {isOwnProfile && (
              <p className="text-sm text-muted-foreground mt-1">
                Add your professional certifications to stand out and build trust
              </p>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {visibleCertificates.map((cert, index) => {
                const CertIcon = getCertificateIcon(cert.name);
                return (
                  <motion.div
                    key={cert.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -2 }}
                    className={`relative p-5 rounded-xl border-2 transition-all ${
                      cert.status === "verified" 
                        ? "bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10 border-green-200 dark:border-green-800/50" 
                        : "bg-card border-border hover:border-primary/30"
                    }`}
                  >
                    {/* Verified badge overlay */}
                    {cert.status === "verified" && (
                      <div className="absolute top-3 right-3">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                        >
                          <ShieldCheck className="h-6 w-6 text-green-500" />
                        </motion.div>
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <div className={`h-14 w-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        cert.status === "verified" 
                          ? "bg-green-100 dark:bg-green-900/30" 
                          : "bg-primary/10"
                      }`}>
                        <CertIcon className={`h-7 w-7 ${
                          cert.status === "verified" ? "text-green-600" : "text-primary"
                        }`} />
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <h4 className="font-semibold truncate">{cert.name}</h4>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Building className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{cert.issuing_organization}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {getStatusBadge(cert.status, cert.expiry_date)}
                          {cert.is_public ? (
                            <Badge variant="outline" className="gap-1 text-xs">
                              <Eye className="h-3 w-3" />
                              Public
                            </Badge>
                          ) : isOwnProfile && (
                            <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
                              <EyeOff className="h-3 w-3" />
                              Private
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                          {cert.issue_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(cert.issue_date), "MMM yyyy")}
                            </span>
                          )}
                          {cert.certificate_number && (
                            <span className="font-mono">#{cert.certificate_number}</span>
                          )}
                        </div>

                        {isOwnProfile && (
                          <div className="flex items-center gap-1 pt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => toggleVisibility(cert.id, cert.is_public)}
                            >
                              {cert.is_public ? (
                                <><EyeOff className="h-3.5 w-3.5 mr-1" />Hide</>
                              ) : (
                                <><Eye className="h-3.5 w-3.5 mr-1" />Show</>
                              )}
                            </Button>
                            {cert.is_public && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => copyShareLink(cert.id)}
                              >
                                {copiedId === cert.id ? (
                                  <><Check className="h-3.5 w-3.5 mr-1" />Copied</>
                                ) : (
                                  <><Share2 className="h-3.5 w-3.5 mr-1" />Share</>
                                )}
                              </Button>
                            )}
                            {cert.document_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={async () => {
                                  const { data } = supabase.storage
                                    .from("certificate-documents")
                                    .getPublicUrl(cert.document_url!);
                                  window.open(data.publicUrl, "_blank");
                                }}
                              >
                                <ExternalLink className="h-3.5 w-3.5 mr-1" />View
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-destructive hover:text-destructive"
                              onClick={() => deleteCertificate(cert.id, cert.document_url)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
};