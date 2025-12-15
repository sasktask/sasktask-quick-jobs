import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Monitor, Smartphone, Globe, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';

interface LoginHistoryProps {
  userId: string;
}

interface LoginRecord {
  id: string;
  login_at: string;
  ip_address: string | null;
  user_agent: string | null;
  login_method: string | null;
  success: boolean;
  failure_reason: string | null;
}

const getDeviceIcon = (userAgent: string | null) => {
  if (!userAgent) return <Globe className="h-4 w-4" />;
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return <Smartphone className="h-4 w-4" />;
  }
  return <Monitor className="h-4 w-4" />;
};

const getDeviceName = (userAgent: string | null): string => {
  if (!userAgent) return 'Unknown Device';
  const ua = userAgent.toLowerCase();
  
  // OS detection
  let os = 'Unknown OS';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  
  // Browser detection
  let browser = 'Unknown Browser';
  if (ua.includes('chrome') && !ua.includes('edge')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edge')) browser = 'Edge';
  
  return `${browser} on ${os}`;
};

export const LoginHistory = ({ userId }: LoginHistoryProps) => {
  const [history, setHistory] = useState<LoginRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getLoginHistory } = useSecurityMonitor(userId);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      const data = await getLoginHistory(20);
      setHistory(data);
      setIsLoading(false);
    };
    
    fetchHistory();
  }, [getLoginHistory]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>Recent login activity on your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Login History
        </CardTitle>
        <CardDescription>Recent login activity on your account</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No login history available
          </p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="mt-1 text-muted-foreground">
                    {getDeviceIcon(record.user_agent)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {getDeviceName(record.user_agent)}
                      </span>
                      {record.success ? (
                        <Badge variant="outline" className="text-green-600 border-green-600/30 bg-green-50 dark:bg-green-950/30">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Success
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Failed
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{formatDistanceToNow(new Date(record.login_at), { addSuffix: true })}</span>
                      {record.ip_address && (
                        <>
                          <span>•</span>
                          <span>{record.ip_address}</span>
                        </>
                      )}
                    </div>
                    {record.failure_reason && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                        <AlertTriangle className="h-3 w-3" />
                        {record.failure_reason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
