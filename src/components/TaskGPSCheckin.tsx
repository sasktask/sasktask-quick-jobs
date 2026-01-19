import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  MapPin, 
  Play, 
  Square, 
  Pause, 
  RotateCcw, 
  Loader2, 
  Navigation,
  Clock,
  CheckCircle2,
  Camera,
  AlertTriangle
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface TaskGPSCheckinProps {
  bookingId: string;
  taskId: string;
  isTaskDoer: boolean;
  taskLocation?: string;
  onCheckin?: () => void;
}

interface CheckinRecord {
  id: string;
  checkin_type: string;
  latitude: number | null;
  longitude: number | null;
  location_address: string | null;
  location_accuracy: number | null;
  notes: string | null;
  photo_url: string | null;
  verified: boolean;
  created_at: string;
}

export const TaskGPSCheckin = ({
  bookingId,
  taskId,
  isTaskDoer,
  taskLocation,
  onCheckin
}: TaskGPSCheckinProps) => {
  const [checkins, setCheckins] = useState<CheckinRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const currentStatus = getStatus(checkins);

  useEffect(() => {
    fetchCheckins();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel(`checkins-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_checkins',
          filter: `booking_id=eq.${bookingId}`
        },
        () => {
          fetchCheckins();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  function getStatus(records: CheckinRecord[]): 'not_started' | 'in_progress' | 'paused' | 'completed' {
    if (records.length === 0) return 'not_started';
    
    const latest = records[0];
    switch (latest.checkin_type) {
      case 'start':
      case 'resume':
        return 'in_progress';
      case 'pause':
        return 'paused';
      case 'end':
        return 'completed';
      default:
        return 'not_started';
    }
  }

  const fetchCheckins = async () => {
    try {
      const { data, error } = await supabase
        .from('task_checkins')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCheckins(data || []);
    } catch (error) {
      console.error('Error fetching checkins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(position);
          setLocationError(null);
          resolve(position);
        },
        (error) => {
          let message = 'Unable to get your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location permission denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out.';
              break;
          }
          setLocationError(message);
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const getAddressFromCoords = async (lat: number, lng: number): Promise<string | null> => {
    try {
      // Use the mapbox token from edge function
      const { data } = await supabase.functions.invoke('get-mapbox-token');
      if (!data?.token) return null;

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${data.token}`
      );
      const result = await response.json();
      
      if (result.features && result.features.length > 0) {
        return result.features[0].place_name;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleCheckin = async (type: 'start' | 'end' | 'pause' | 'resume') => {
    setIsSubmitting(true);
    
    try {
      const position = await requestLocation();
      const address = await getAddressFromCoords(
        position.coords.latitude,
        position.coords.longitude
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from('task_checkins')
        .insert({
          booking_id: bookingId,
          task_id: taskId,
          user_id: user.id,
          checkin_type: type,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          location_accuracy: position.coords.accuracy,
          location_address: address,
          device_info: deviceInfo,
          notes: notes || null
        });

      if (error) throw error;

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_booking_id: bookingId,
        p_task_id: taskId,
        p_user_id: user.id,
        p_event_type: `task_${type}`,
        p_event_category: 'checkin',
        p_event_data: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          address
        },
        p_location_data: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      });

      const messages = {
        start: 'Task started! Your location has been recorded.',
        end: 'Task completed! End time and location recorded.',
        pause: 'Task paused. Take your break!',
        resume: 'Task resumed. Keep up the great work!'
      };

      toast.success(messages[type]);
      setNotes("");
      setShowNotes(false);
      onCheckin?.();
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to check in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionButton = () => {
    if (!isTaskDoer) return null;

    const buttonConfigs = {
      not_started: {
        label: 'Start Task',
        icon: Play,
        action: () => handleCheckin('start'),
        variant: 'default' as const,
        className: 'bg-green-600 hover:bg-green-700'
      },
      in_progress: [
        {
          label: 'Pause',
          icon: Pause,
          action: () => handleCheckin('pause'),
          variant: 'outline' as const,
          className: ''
        },
        {
          label: 'Complete Task',
          icon: Square,
          action: () => handleCheckin('end'),
          variant: 'default' as const,
          className: 'bg-red-600 hover:bg-red-700'
        }
      ],
      paused: {
        label: 'Resume Task',
        icon: RotateCcw,
        action: () => handleCheckin('resume'),
        variant: 'default' as const,
        className: 'bg-blue-600 hover:bg-blue-700'
      },
      completed: null
    };

    const config = buttonConfigs[currentStatus];

    if (!config) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Task Completed</span>
        </div>
      );
    }

    if (Array.isArray(config)) {
      return (
        <div className="flex gap-2">
          {config.map((btn, idx) => (
            <Button
              key={idx}
              variant={btn.variant}
              onClick={btn.action}
              disabled={isSubmitting}
              className={btn.className}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <btn.icon className="h-4 w-4 mr-2" />
              )}
              {btn.label}
            </Button>
          ))}
        </div>
      );
    }

    return (
      <Button
        variant={config.variant}
        onClick={config.action}
        disabled={isSubmitting}
        className={config.className}
        size="lg"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <config.icon className="h-4 w-4 mr-2" />
        )}
        {config.label}
      </Button>
    );
  };

  const getStatusBadge = () => {
    const configs = {
      not_started: { label: 'Not Started', className: 'bg-muted text-muted-foreground' },
      in_progress: { label: 'In Progress', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      paused: { label: 'Paused', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      completed: { label: 'Completed', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' }
    };
    
    const config = configs[currentStatus];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const calculateDuration = () => {
    const starts = checkins.filter(c => c.checkin_type === 'start' || c.checkin_type === 'resume');
    const pauses = checkins.filter(c => c.checkin_type === 'pause' || c.checkin_type === 'end');

    let totalMs = 0;
    
    for (let i = 0; i < Math.min(starts.length, pauses.length); i++) {
      const startTime = new Date(starts[starts.length - 1 - i].created_at).getTime();
      const endTime = new Date(pauses[pauses.length - 1 - i].created_at).getTime();
      totalMs += endTime - startTime;
    }

    // Add ongoing time if in progress
    if (currentStatus === 'in_progress' && starts.length > 0) {
      const lastStart = new Date(starts[0].created_at).getTime();
      totalMs += Date.now() - lastStart;
    }

    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              GPS Check-in
            </CardTitle>
            <CardDescription>
              Record your start/end times with verified location
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location error warning */}
        {locationError && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{locationError}</span>
          </div>
        )}

        {/* Task location reference */}
        {taskLocation && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>Task location: <span className="font-medium">{taskLocation}</span></span>
          </div>
        )}

        {/* Duration tracker */}
        {checkins.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm">Total time: <span className="font-semibold">{calculateDuration()}</span></span>
          </div>
        )}

        {/* Notes input for task doer */}
        {isTaskDoer && currentStatus !== 'completed' && (
          <>
            {showNotes ? (
              <div className="space-y-2">
                <Label htmlFor="checkin-notes">Add notes (optional)</Label>
                <Textarea
                  id="checkin-notes"
                  placeholder="Any notes about this check-in..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotes(true)}
                className="text-muted-foreground"
              >
                + Add notes
              </Button>
            )}
          </>
        )}

        {/* Action buttons */}
        <div className="flex justify-center py-2">
          {getActionButton()}
        </div>

        {/* Check-in history */}
        {checkins.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="text-sm font-medium text-muted-foreground">Check-in History</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {checkins.map((checkin) => (
                <div 
                  key={checkin.id}
                  className="flex items-start gap-3 p-2 bg-muted/30 rounded-lg text-sm"
                >
                  <div className={`p-1.5 rounded-full ${
                    checkin.checkin_type === 'start' ? 'bg-green-100 text-green-600' :
                    checkin.checkin_type === 'end' ? 'bg-red-100 text-red-600' :
                    checkin.checkin_type === 'pause' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {checkin.checkin_type === 'start' && <Play className="h-3 w-3" />}
                    {checkin.checkin_type === 'end' && <Square className="h-3 w-3" />}
                    {checkin.checkin_type === 'pause' && <Pause className="h-3 w-3" />}
                    {checkin.checkin_type === 'resume' && <RotateCcw className="h-3 w-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{checkin.checkin_type}</span>
                      {checkin.verified && (
                        <Badge variant="outline" className="text-xs text-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(checkin.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                    {checkin.location_address && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        📍 {checkin.location_address}
                      </p>
                    )}
                    {checkin.notes && (
                      <p className="text-xs text-foreground mt-1">{checkin.notes}</p>
                    )}
                  </div>
                  {checkin.location_accuracy && (
                    <span className="text-xs text-muted-foreground">
                      ±{Math.round(checkin.location_accuracy)}m
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
