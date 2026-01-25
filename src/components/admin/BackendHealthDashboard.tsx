import { RefreshCw, CheckCircle, AlertTriangle, XCircle, Clock, Server, Database, CreditCard, Mail, Bot, MessageSquare, Map } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useBackendHealth, getServiceStatusBadge, getOverallStatusColor, formatUptime } from "@/hooks/useBackendHealth";

export default function BackendHealthDashboard() {
  const { health, loading, error, refresh, lastChecked } = useBackendHealth(30000);

  if (loading && !health) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !health) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <XCircle className="h-5 w-5" />
            <span>Failed to fetch backend health: {error}</span>
          </div>
          <Button onClick={refresh} variant="outline" size="sm" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!health) return null;

  const StatusIcon = health.status === "healthy" ? CheckCircle : 
                     health.status === "degraded" ? AlertTriangle : XCircle;

  const serviceIcons: Record<string, React.ReactNode> = {
    database: <Database className="h-4 w-4" />,
    stripe: <CreditCard className="h-4 w-4" />,
    email: <Mail className="h-4 w-4" />,
    ai: <Bot className="h-4 w-4" />,
    sms: <MessageSquare className="h-4 w-4" />,
    maps: <Map className="h-4 w-4" />,
  };

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon className={`h-8 w-8 ${getOverallStatusColor(health.status)}`} />
              <div>
                <CardTitle className="text-xl">Backend Status</CardTitle>
                <CardDescription>
                  v{health.version} • Last checked: {lastChecked?.toLocaleTimeString()}
                </CardDescription>
              </div>
            </div>
            <Button onClick={refresh} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge className={getServiceStatusBadge(health.status === "healthy" ? "ok" : health.status === "degraded" ? "degraded" : "error")}>
              {health.status.toUpperCase()}
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Uptime: {formatUptime(health.uptime_seconds)}
            </span>
            <span className="text-sm text-muted-foreground">
              Response: {health.metrics.avg_response_time_ms}ms
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(health.checks).map(([name, check]) => (
          <Card key={name} className={check.status === "error" ? "border-red-200 dark:border-red-800" : ""}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-2">
                {serviceIcons[name] || <Server className="h-4 w-4" />}
                <span className="font-medium capitalize">{name}</span>
              </div>
              <Badge className={getServiceStatusBadge(check.status)} variant="secondary">
                {check.status === "ok" ? "Online" : 
                 check.status === "not_configured" ? "Not Set" :
                 check.status === "degraded" ? "Slow" : "Error"}
              </Badge>
              {check.latency_ms !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">{check.latency_ms}ms</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Active Users (24h)</p>
            <p className="text-2xl font-bold">{health.metrics.active_users_24h}</p>
            <p className="text-xs text-muted-foreground">{health.metrics.active_users_7d} in 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Tasks Today</p>
            <p className="text-2xl font-bold">{health.metrics.tasks_created_24h}</p>
            <p className="text-xs text-muted-foreground">{health.metrics.tasks_completed_24h} completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Revenue (24h)</p>
            <p className="text-2xl font-bold">${health.metrics.revenue_24h.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{health.metrics.payments_processed_24h} payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Escrow Held</p>
            <p className="text-2xl font-bold">${health.metrics.escrow_held_amount.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{health.metrics.pending_disputes} disputes</p>
          </CardContent>
        </Card>
      </div>

      {/* Edge Functions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Edge Functions</CardTitle>
          <CardDescription>{health.edge_functions.configured} of {health.edge_functions.total} configured</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(health.edge_functions.configured / health.edge_functions.total) * 100} className="mb-4" />
          <div className="flex flex-wrap gap-2">
            {Object.entries(health.edge_functions.critical_functions_status).map(([name, status]) => (
              <Badge key={name} variant={status ? "default" : "destructive"} className="text-xs">
                {status ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                {name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
