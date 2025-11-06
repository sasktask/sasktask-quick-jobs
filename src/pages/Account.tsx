import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/account/ProfileSettings";
import { SecuritySettings } from "@/components/account/SecuritySettings";
import { DataSettings } from "@/components/account/DataSettings";
import { BillingSettings } from "@/components/account/BillingSettings";
import { User, CreditCard, Shield, Database } from "lucide-react";

const Account = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to access your account settings");
        navigate("/auth");
        return;
      }

      setUser(session.user);
    } catch (error) {
      console.error("Error checking user:", error);
      toast.error("Failed to load account information");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <SEOHead
        title="Account Settings - Manage Your Profile"
        description="Manage your SaskTask account settings, profile, security, and billing information."
        url="/account"
      />
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Account Settings</h1>
              <p className="text-muted-foreground">
                Manage your profile, security, and account preferences
              </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="billing" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Billing
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Data
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <ProfileSettings user={user} />
              </TabsContent>

              <TabsContent value="security">
                <SecuritySettings user={user} />
              </TabsContent>

              <TabsContent value="billing">
                <BillingSettings user={user} />
              </TabsContent>

              <TabsContent value="data">
                <DataSettings user={user} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Account;
