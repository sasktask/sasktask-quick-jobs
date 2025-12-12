import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AlertTriangle, Shield, TrendingUp, Eye, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FraudAlert {
  id: string;
  user_id: string;
  alert_type: string;
  severity: string;
  status: string;
  description: string;
  metadata: any;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

const AdminFraud = () => {
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteAlertId, setDeleteAlertId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    pending: 0
  });

  useEffect(() => {
    fetchFraudAlerts();
    fetchStats();
  }, []);

  const fetchFraudAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("fraud_alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch profiles separately
      const alerts = data || [];
      const userIds = [...new Set(alerts.map(a => a.user_id))];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const alertsWithProfiles = alerts.map(alert => ({
        ...alert,
        profiles: profileMap.get(alert.user_id) || null
      }));
      
      setFraudAlerts(alertsWithProfiles);
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

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("fraud_alerts")
        .delete()
        .eq("id", alertId);

      if (error) throw error;
      toast.success("Alert deleted");
      setDeleteAlertId(null);
      fetchFraudAlerts();
      fetchStats();
    } catch (error) {
      console.error("Error deleting alert:", error);
      toast.error("Failed to delete alert");
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

  const filterByStatus = (status: string) => {
    if (status === 'all') return fraudAlerts;
    return fraudAlerts.filter(a => a.status === status);
  };

  const AlertCard = ({ alert }: { alert: FraudAlert }) => (
    <Card key={alert.id}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
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
          <div className="flex flex-col gap-2">
            {alert.status === 'pending' && (
              <>
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
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleteAlertId(alert.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <SEOHead
        title="Fraud Detection - Admin"
        description="Monitor and manage fraud detection alerts"
        url="/admin/fraud"
      />
      
      <AdminLayout title="Fraud Detection" description="Monitor and manage fraud alerts">
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

        {/* Alerts Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({fraudAlerts.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({filterByStatus('pending').length})</TabsTrigger>
            <TabsTrigger value="investigating">Investigating ({filterByStatus('investigating').length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({filterByStatus('resolved').length})</TabsTrigger>
          </TabsList>

          {['all', 'pending', 'investigating', 'resolved'].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {loading ? (
                <p>Loading...</p>
              ) : filterByStatus(tab).length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No fraud alerts in this category
                  </CardContent>
                </Card>
              ) : (
                filterByStatus(tab).map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteAlertId} onOpenChange={() => setDeleteAlertId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Alert?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this fraud alert.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteAlertId && handleDeleteAlert(deleteAlertId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </>
  );
};

export default AdminFraud;