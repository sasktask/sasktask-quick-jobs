import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Shield, Mail, Phone, User, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  verified_by_admin: boolean;
  verification_notes: string;
  verified_at: string;
  created_at: string;
}

const AdminVerification = () => {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndLoadProfiles();
  }, []);

  const checkAdminAndLoadProfiles = async () => {
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

      // Check if user is admin
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
      await loadProfiles();
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

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProfiles(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load user profiles.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openVerificationDialog = (profile: Profile) => {
    setSelectedProfile(profile);
    setVerificationNotes(profile.verification_notes || "");
    setShowDialog(true);
  };

  const handleVerifyUser = async (verified: boolean) => {
    if (!selectedProfile) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const updateData: any = {
        verified_by_admin: verified,
        verification_notes: verificationNotes,
        verified_at: verified ? new Date().toISOString() : null,
        verified_by: verified ? session.user.id : null,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", selectedProfile.id);

      if (error) throw error;

      toast({
        title: verified ? "User Verified ✅" : "Verification Removed",
        description: `${selectedProfile.full_name} has been ${verified ? "verified" : "unverified"} successfully.`,
      });

      setShowDialog(false);
      await loadProfiles();
    } catch (error: any) {
      console.error("Verification error:", error);
      toast({
        title: "Error",
        description: "Failed to update verification status.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading profiles...</p>
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
              <h1 className="text-4xl font-bold">User Verification</h1>
            </div>
            <p className="text-muted-foreground">Manage user profile verifications</p>
          </div>

          <div className="grid gap-4">
            {profiles.map((profile) => (
              <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.full_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{profile.full_name}</h3>
                          {profile.verified_by_admin ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Not Verified
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {profile.email}
                          </div>
                          {profile.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {profile.phone}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Joined {new Date(profile.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        {profile.verification_notes && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <strong>Notes:</strong> {profile.verification_notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button 
                      onClick={() => openVerificationDialog(profile)}
                      variant={profile.verified_by_admin ? "outline" : "default"}
                    >
                      {profile.verified_by_admin ? "Manage" : "Verify User"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {profiles.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify User Profile</DialogTitle>
            <DialogDescription>
              {selectedProfile?.full_name} - {selectedProfile?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Verification Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this verification..."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {selectedProfile?.verified_by_admin ? (
              <Button 
                variant="destructive"
                onClick={() => handleVerifyUser(false)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Remove Verification
              </Button>
            ) : (
              <Button 
                variant="default"
                onClick={() => handleVerifyUser(true)}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Verify User
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminVerification;