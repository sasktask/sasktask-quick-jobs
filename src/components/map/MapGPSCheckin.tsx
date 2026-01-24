import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Navigation,
  Loader2,
  Upload,
  X,
  Shield,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CheckinStep {
  id: string;
  type: 'arrival' | 'progress' | 'completion';
  title: string;
  description: string;
  requiresPhoto: boolean;
  requiresLocation: boolean;
  completed: boolean;
  timestamp?: Date;
  photoUrl?: string;
  location?: { latitude: number; longitude: number; accuracy: number };
}

interface MapGPSCheckinProps {
  taskId: string;
  bookingId: string;
  taskLocation: { latitude: number; longitude: number };
  taskTitle: string;
  onCheckinComplete?: (checkin: CheckinStep) => void;
  className?: string;
}

export function MapGPSCheckin({
  taskId,
  bookingId,
  taskLocation,
  taskTitle,
  onCheckinComplete,
  className,
}: MapGPSCheckinProps) {
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [checkinSteps, setCheckinSteps] = useState<CheckinStep[]>([
    {
      id: '1',
      type: 'arrival',
      title: 'Arrival Check-in',
      description: 'Confirm you\'ve arrived at the task location',
      requiresPhoto: false,
      requiresLocation: true,
      completed: false,
    },
    {
      id: '2',
      type: 'progress',
      title: 'Work Progress',
      description: 'Document work in progress (optional)',
      requiresPhoto: true,
      requiresLocation: false,
      completed: false,
    },
    {
      id: '3',
      type: 'completion',
      title: 'Task Completion',
      description: 'Submit final photo evidence',
      requiresPhoto: true,
      requiresLocation: true,
      completed: false,
    },
  ]);

  const currentStep = checkinSteps.find((s) => !s.completed) || checkinSteps[checkinSteps.length - 1];
  const completedCount = checkinSteps.filter((s) => s.completed).length;
  const progress = (completedCount / checkinSteps.length) * 100;

  // Calculate distance between two coordinates in meters
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation(position);
        setIsLoadingLocation(false);

        const dist = calculateDistance(
          position.coords.latitude,
          position.coords.longitude,
          taskLocation.latitude,
          taskLocation.longitude
        );
        setDistance(dist);
      },
      (error) => {
        setIsLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please enable GPS.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location unavailable. Please try again.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out. Please try again.');
            break;
          default:
            setLocationError('An unknown error occurred.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [taskLocation, calculateDistance]);

  // Auto-refresh location
  useEffect(() => {
    getCurrentLocation();
    const interval = setInterval(getCurrentLocation, 15000);
    return () => clearInterval(interval);
  }, [getCurrentLocation]);

  // Handle photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit check-in
  const handleSubmitCheckin = async () => {
    if (!currentStep) return;

    // Validate requirements
    if (currentStep.requiresLocation && !currentLocation) {
      toast.error('Location required for this check-in');
      getCurrentLocation();
      return;
    }

    if (currentStep.requiresPhoto && !selectedPhoto) {
      toast.error('Photo required for this check-in');
      return;
    }

    // Check if within acceptable distance for arrival/completion
    if (currentStep.requiresLocation && distance && distance > 200) {
      toast.error(`You must be within 200m of the task location. Currently ${Math.round(distance)}m away.`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const completedStep: CheckinStep = {
        ...currentStep,
        completed: true,
        timestamp: new Date(),
        photoUrl: photoPreview || undefined,
        location: currentLocation ? {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          accuracy: currentLocation.coords.accuracy,
        } : undefined,
      };

      setCheckinSteps((steps) =>
        steps.map((s) => (s.id === currentStep.id ? completedStep : s))
      );

      onCheckinComplete?.(completedStep);
      toast.success(`${currentStep.title} completed!`);

      // Reset form
      setSelectedPhoto(null);
      setPhotoPreview(null);
      setNotes('');
    } catch (error) {
      toast.error('Failed to submit check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDistanceStatus = () => {
    if (!distance) return null;
    if (distance <= 50) return { status: 'success', text: 'At location', color: 'text-green-500' };
    if (distance <= 200) return { status: 'warning', text: 'Near location', color: 'text-amber-500' };
    return { status: 'error', text: 'Too far', color: 'text-red-500' };
  };

  const distanceStatus = getDistanceStatus();

  return (
    <Card className={cn('bg-card/95 backdrop-blur-sm border-primary/20 shadow-xl', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            GPS Check-in
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {completedCount}/{checkinSteps.length} Complete
          </Badge>
        </div>
        <Progress value={progress} className="h-1.5 mt-2" />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Task Info */}
        <div className="text-sm">
          <span className="text-muted-foreground">Task: </span>
          <span className="font-medium">{taskTitle}</span>
        </div>

        {/* Step Timeline */}
        <div className="space-y-2">
          {checkinSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'flex items-center gap-3 p-2 rounded-lg transition-colors',
                step.completed ? 'bg-green-500/10' : step.id === currentStep?.id ? 'bg-primary/10' : 'bg-muted/30'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                step.completed ? 'bg-green-500 text-white' : step.id === currentStep?.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                {step.completed ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
              </div>
              <div className="flex-1">
                <p className={cn('text-sm font-medium', step.completed && 'text-green-500')}>
                  {step.title}
                </p>
                {step.timestamp && (
                  <p className="text-xs text-muted-foreground">
                    {step.timestamp.toLocaleTimeString()}
                  </p>
                )}
              </div>
              {step.requiresPhoto && (
                <Camera className={cn('h-4 w-4', step.completed ? 'text-green-500' : 'text-muted-foreground')} />
              )}
              {step.requiresLocation && (
                <MapPin className={cn('h-4 w-4', step.completed ? 'text-green-500' : 'text-muted-foreground')} />
              )}
            </motion.div>
          ))}
        </div>

        {/* Current Step Actions */}
        {currentStep && !currentStep.completed && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 pt-2 border-t"
            >
              <div>
                <h4 className="font-medium text-sm">{currentStep.title}</h4>
                <p className="text-xs text-muted-foreground">{currentStep.description}</p>
              </div>

              {/* Location Status */}
              {currentStep.requiresLocation && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <Navigation className="h-4 w-4" />
                      GPS Location
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={getCurrentLocation}
                      disabled={isLoadingLocation}
                    >
                      {isLoadingLocation ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                      Refresh
                    </Button>
                  </div>

                  {locationError ? (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      {locationError}
                    </div>
                  ) : currentLocation ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Distance to task:</span>
                        <span className={cn('font-medium', distanceStatus?.color)}>
                          {distance ? `${Math.round(distance)}m` : 'Calculating...'} - {distanceStatus?.text}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Accuracy: ±{Math.round(currentLocation.coords.accuracy)}m</span>
                        <span>Updated: {new Date().toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Getting location...
                    </div>
                  )}
                </div>
              )}

              {/* Photo Upload */}
              {currentStep.requiresPhoto && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Photo Evidence {currentStep.type === 'progress' ? '(Optional)' : '(Required)'}
                  </label>
                  
                  {photoPreview ? (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={() => {
                          setSelectedPhoto(null);
                          setPhotoPreview(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Tap to take photo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handlePhotoSelect}
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  placeholder="Add any relevant notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                className="w-full"
                onClick={handleSubmitCheckin}
                disabled={isSubmitting || (currentStep.requiresLocation && !currentLocation)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Complete {currentStep.title}
                  </>
                )}
              </Button>
            </motion.div>
          </AnimatePresence>
        )}

        {/* All Complete */}
        {checkinSteps.every((s) => s.completed) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="font-medium text-green-500">All check-ins completed!</p>
            <p className="text-sm text-muted-foreground">Task completion verified</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
