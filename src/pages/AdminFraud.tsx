import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AlertTriangle, Shield, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminFraud = () => {
  const navigate = useNavigate();
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    pending: 0
  });

  useEffect(() => {
    checkAdminAccess();
    fetchFraudAlerts();
    fetchStats();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roles) {
      toast.error("Access denied");
      navigate("/");
    }
  };

  const fetchFraudAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("fraud_alerts")
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFraudAlerts(data || []);
    } catch (error) {
      console.error("Error fetching fraud alerts:", error);
      toast.error("Failed to load fraud alerts");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const { data } = await supabase
      .from("fraud_alerts")
      .select("severity, status");

    if (data) {
      setStats({
        total: data.length,
        high: data.filter(a => a.severity === 'high').length,
        medium: data.filter(a => a.severity === 'medium').length,
        low: data.filter(a => a.severity === 'low').length,
        pending: data.filter(a => a.status === 'pending').length
      });
    }
  };

  const updateAlertStatus = async (alertId: string, status: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("fraud_alerts")
        .update({
          status,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", alertId);

      if (error) throw error;
      toast.success("Alert status updated");
      fetchFraudAlerts();
      fetchStats();
    } catch (error) {
      console.error("Error updating alert:", error);
      toast.error("Failed to update alert");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      <SEOHead
        title="Fraud Detection - Admin"
        description="Monitor and manage fraud detection alerts"
        url="/admin/fraud"
      />
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 py-24">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Fraud Detection</h1>
            <p className="text-muted-foreground">Monitor and manage fraud alerts</p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">High Severity</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{stats.high}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Medium Severity</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{stats.medium}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Fraud Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : fraudAlerts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No fraud alerts</p>
              ) : (
                <div className="space-y-4">
                  {fraudAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <Badge variant={alert.status === 'pending' ? 'default' : 'outline'}>
                              {alert.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {alert.alert_type.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="font-medium mb-1">
                            User: {alert.profiles?.full_name || 'Unknown'} ({alert.profiles?.email})
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                          {alert.metadata && (
                            <p className="text-xs text-muted-foreground">
                              Details: {JSON.stringify(alert.metadata)}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Created: {new Date(alert.created_at).toLocaleString()}
                          </p>
                        </div>
                        {alert.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateAlertStatus(alert.id, 'investigating')}
                            >
                              Investigate
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateAlertStatus(alert.id, 'resolved')}
                            >
                              Resolve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateAlertStatus(alert.id, 'confirmed')}
                            >
                              Confirm Fraud
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
        </div>

        <Footer />
      </div>
    </>
  );
};

export default AdminFraud;