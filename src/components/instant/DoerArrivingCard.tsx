import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Navigation,
  Clock,
  Phone,
  MessageCircle,
  MapPin,
  Star,
  X,
  AlertTriangle,
  CheckCircle2,
  Car,
  Loader2,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DoerInfo {
  id: string;
  full_name: string;
  avatar_url?: string;
  rating?: number;
  total_reviews?: number;
  phone?: string;
}

interface DoerArrivingCardProps {
  requestId: string;
  doer: DoerInfo;
  estimatedArrival: number; // in minutes
  taskTitle: string;
  taskCategory: string;
  onCancel?: () => void;
  onMessage?: () => void;
  onCall?: () => void;
  className?: string;
}

export function DoerArrivingCard({
  requestId,
  doer,
  estimatedArrival,
  taskTitle,
  taskCategory,
  onCancel,
  onMessage,
  onCall,
  className
}: DoerArrivingCardProps) {
  const [currentETA, setCurrentETA] = useState(estimatedArrival);
  const [doerLocation, setDoerLocation] = useState<{
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
  } | null>(null);
  const [status, setStatus] = useState<'en_route' | 'arriving' | 'arrived'>('en_route');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Subscribe to doer's live location
  useEffect(() => {
    // Use type assertion for new table
    const channel = supabase
      .channel(`doer-location-${doer.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'doer_live_availability',
          filter: `user_id=eq.${doer.id}`
        },
        (payload: any) => {
          const { current_latitude, current_longitude, heading, speed } = payload.new;
          if (current_latitude && current_longitude) {
            setDoerLocation({
              latitude: current_latitude,
              longitude: current_longitude,
              heading,
              speed
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [doer.id]);

  // Subscribe to request status updates
  useEffect(() => {
    const channel = supabase
      .channel(`request-status-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'instant_task_requests',
          filter: `id=eq.${requestId}`
        },
        (payload: any) => {
          const newStatus = payload.new.status;
          if (newStatus === 'doer_arrived') {
            setStatus('arrived');
          } else if (newStatus === 'cancelled') {
            toast.info('The task has been cancelled');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  // Update ETA countdown
  useEffect(() => {
    if (status === 'arrived' || currentETA <= 0) return;

    const interval = setInterval(() => {
      setCurrentETA(prev => {
        const newETA = Math.max(0, prev - 1/60); // Decrease by 1 second
        if (newETA <= 2 && status === 'en_route') {
          setStatus('arriving');
        }
        if (newETA <= 0) {
          setStatus('arrived');
        }
        return newETA;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, currentETA]);

  // Calculate progress percentage
  const progressPercent = useMemo(() => {
    return Math.max(0, Math.min(100, ((estimatedArrival - currentETA) / estimatedArrival) * 100));
  }, [estimatedArrival, currentETA]);

  // Format ETA display
  const formatETA = (minutes: number): string => {
    if (minutes < 1) {
      return 'Less than 1 min';
    }
    return `${Math.ceil(minutes)} min`;
  };

  // Handle cancel request
  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      // Use type assertion for new table
      const { error } = await (supabase as any)
        .from('instant_task_requests')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: cancelReason || 'Cancelled by giver'
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Task cancelled');
      setShowCancelDialog(false);
      onCancel?.();
    } catch (err: any) {
      console.error('Error cancelling:', err);
      toast.error('Failed to cancel task');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'arrived':
        return 'bg-green-500';
      case 'arriving':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'arrived':
        return 'Arrived!';
      case 'arriving':
        return 'Almost there...';
      default:
        return 'On the way';
    }
  };

  return (
    <>
      <Card className={cn('overflow-hidden', className)}>
        {/* Status Banner */}
        <div className={cn('py-2 px-4', getStatusColor())}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              {status === 'arrived' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Car className="w-5 h-5" />
                </motion.div>
              )}
              <span className="font-medium">{getStatusText()}</span>
            </div>
            {status !== 'arrived' && (
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Clock className="w-3 h-3 mr-1" />
                {formatETA(currentETA)}
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Progress bar */}
          {status !== 'arrived' && (
            <div className="space-y-2">
              <Progress value={progressPercent} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Request accepted</span>
                <span>Arrival</span>
              </div>
            </div>
          )}

          {/* Doer Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16">
                <AvatarImage src={doer.avatar_url} />
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-lg">{doer.full_name}</h3>
              {doer.rating && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{doer.rating.toFixed(1)}</span>
                  {doer.total_reviews && (
                    <span className="text-muted-foreground">
                      ({doer.total_reviews} reviews)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Contact buttons */}
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={onMessage}
                className="rounded-full"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
              {doer.phone && (
                <Button
                  size="icon"
                  variant="outline"
                  onClick={onCall}
                  className="rounded-full"
                >
                  <Phone className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Task info */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary">{taskCategory}</Badge>
            </div>
            <p className="text-sm font-medium">{taskTitle}</p>
          </div>

          {/* Live location indicator */}
          {doerLocation && status !== 'arrived' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg text-sm text-blue-700"
            >
              <Navigation className="w-4 h-4 animate-pulse" />
              <span>Live location tracking active</span>
              {doerLocation.speed && doerLocation.speed > 0 && (
                <Badge variant="outline" className="ml-auto">
                  {Math.round(doerLocation.speed * 3.6)} km/h
                </Badge>
              )}
            </motion.div>
          )}

          {/* Arrived state */}
          <AnimatePresence>
            {status === 'arrived' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-green-50 rounded-lg text-center"
              >
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold text-green-700">
                  {doer.full_name} has arrived!
                </h4>
                <p className="text-sm text-green-600 mt-1">
                  They're ready to help with your task
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 text-red-600 hover:bg-red-50"
              onClick={() => setShowCancelDialog(true)}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel Task
            </Button>
            <Button
              className="flex-1"
              onClick={onMessage}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Cancel This Task?
            </DialogTitle>
            <DialogDescription>
              {doer.full_name} is on their way. Are you sure you want to cancel?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
              <p>
                <strong>Note:</strong> Frequent cancellations may affect your account standing.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Reason for cancellation (optional)
              </label>
              <Textarea
                placeholder="Let us know why you're cancelling..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={isCancelling}
            >
              Keep Task
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Yes, Cancel Task'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
