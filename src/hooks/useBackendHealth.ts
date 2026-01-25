import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ServiceCheck {
  status: "ok" | "error" | "not_configured" | "degraded";
  configured: boolean;
  latency_ms?: number;
  error?: string;
}

interface HealthMetrics {
  active_users_24h: number;
  active_users_7d: number;
  tasks_created_24h: number;
  tasks_completed_24h: number;
  payments_processed_24h: number;
  revenue_24h: number;
  avg_response_time_ms: number;
  pending_disputes: number;
  escrow_held_amount: number;
}

interface EdgeFunctionsStatus {
  total: number;
  configured: number;
  critical_functions_status: Record<string, boolean>;
}

export interface BackendHealth {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime_seconds: number;
  checks: {
    database: ServiceCheck;
    stripe: ServiceCheck;
    email: ServiceCheck;
    ai: ServiceCheck;
    sms: ServiceCheck;
    maps: ServiceCheck;
  };
  metrics: HealthMetrics;
  edge_functions: EdgeFunctionsStatus;
}

interface UseBackendHealthResult {
  health: BackendHealth | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastChecked: Date | null;
}

export function useBackendHealth(autoRefreshMs = 60000): UseBackendHealthResult {
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke("backend-health", {
        method: "GET",
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      setHealth(data as BackendHealth);
      setLastChecked(new Date());
    } catch (err) {
      console.error("Failed to fetch backend health:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch health status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();

    if (autoRefreshMs > 0) {
      const interval = setInterval(fetchHealth, autoRefreshMs);
      return () => clearInterval(interval);
    }
  }, [fetchHealth, autoRefreshMs]);

  return {
    health,
    loading,
    error,
    refresh: fetchHealth,
    lastChecked,
  };
}

// Service health utilities
export function getServiceStatusColor(status: ServiceCheck["status"]): string {
  switch (status) {
    case "ok":
      return "text-green-500";
    case "degraded":
      return "text-yellow-500";
    case "error":
      return "text-red-500";
    case "not_configured":
      return "text-gray-400";
    default:
      return "text-gray-500";
  }
}

export function getServiceStatusBadge(status: ServiceCheck["status"]): string {
  switch (status) {
    case "ok":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "degraded":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "error":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "not_configured":
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function getOverallStatusColor(status: BackendHealth["status"]): string {
  switch (status) {
    case "healthy":
      return "text-green-500";
    case "degraded":
      return "text-yellow-500";
    case "unhealthy":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
}

export function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}
