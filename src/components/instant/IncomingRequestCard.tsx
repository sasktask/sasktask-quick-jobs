import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  MapPin,
  Clock,
  DollarSign,
  Star,
  Navigation,
  X,
  Check,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { InstantRequest } from '@/hooks/useInstantRequests';
import { calculateDistance } from '@/lib/distance';
import { cn } from '@/lib/utils';

interface IncomingRequestCardProps {
  request: InstantRequest;
  doerLocation?: { latitude: number; longitude: number } | null;
  onAccept: (requestId: string, etaMinutes: number) => Promise<boolean>;
  onDecline: (requestId: string) => Promise<boolean>;
  timeoutSeconds?: number;
  className?: string;
}

export function IncomingRequestCard({
  request,
  doerLocation,
  onAccept,
  onDecline,
  timeoutSeconds = 30,
  className
}: IncomingRequestCardProps) {
  const [timeLeft, setTimeLeft] = useState(timeoutSeconds);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);

  // Calculate distance and ETA
  const distance = doerLocation 
    ? calculateDistance(
        doerLocation.latitude,
        doerLocation.longitude,
        request.latitude,
        request.longitude
      )
    : null;

  // Estimate ETA based on distance (assuming 30 km/h average speed in urban areas)
  const estimatedEta = distance ? Math.max(5, Math.ceil(distance / 0.5)) : 15; // minutes

  // Countdown timer
  useEffect(() => {
    if (hasResponded || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-decline when time runs out
          onDecline(request.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasResponded, timeLeft, onDecline, request.id]);

  // Handle accept
  const handleAccept = useCallback(async () => {
    if (isProcessing || hasResponded) return;
    
    setIsProcessing(true);
    const success = await onAccept(request.id, estimatedEta);
    
    if (success) {
      setHasResponded(true);
    }
    setIsProcessing(false);
  }, [isProcessing, hasResponded, onAccept, request.id, estimatedEta]);

  // Handle decline
  const handleDecline = useCallback(async () => {
    if (isProcessing || hasResponded) return;
    
    setIsProcessing(true);
    const success = await onDecline(request.id);
    
    if (success) {
      setHasResponded(true);
    }
    setIsProcessing(false);
  }, [isProcessing, hasResponded, onDecline, request.id]);

  // Get urgency color
  const getUrgencyColor = () => {
    switch (request.urgency_level) {
      case 'asap':
        return 'text-red-600 bg-red-100';
      case 'within_hour':
        return 'text-orange-600 bg-orange-100';
      case 'within_2_hours':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Get urgency label
  const getUrgencyLabel = () => {
    switch (request.urgency_level) {
      case 'asap':
        return 'ASAP';
      case 'within_hour':
        return 'Within 1 hour';
      case 'within_2_hours':
        return 'Within 2 hours';
      default:
        return 'Flexible';
    }
  };

  const progressPercentage = (timeLeft / timeoutSeconds) * 100;

  return (
    <AnimatePresence>
      {!hasResponded && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <Card 
            className={cn(
              'overflow-hidden border-2 shadow-lg',
              timeLeft <= 10 ? 'border-red-400 animate-pulse' : 'border-primary/50',
              className
            )}
          >
            {/* Countdown progress bar */}
            <div className="relative h-1.5 bg-muted">
              <motion.div
                className={cn(
                  'absolute inset-y-0 left-0',
                  timeLeft <= 10 ? 'bg-red-500' : 'bg-primary'
                )}
                initial={{ width: '100%' }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <CardContent className="p-4">
              {/* Header with timer */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold text-sm">Instant Request</span>
                </div>
                <div className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-full font-mono text-sm font-bold',
                  timeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-muted'
                )}>
                  <Clock className="w-4 h-4" />
                  <span>{timeLeft}s</span>
                </div>
              </div>

              {/* Giver info */}
              {request.giver && (
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={request.giver.avatar_url || undefined} />
                    <AvatarFallback>
                      {request.giver.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{request.giver.full_name}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span>{request.giver.rating?.toFixed(1) || 'New'}</span>
                      {request.giver.total_reviews > 0 && (
                        <span>({request.giver.total_reviews})</span>
                      )}
                    </div>
                  </div>
                  <Badge className={getUrgencyColor()}>
                    {getUrgencyLabel()}
                  </Badge>
                </div>
              )}

              {/* Task details */}
              <div className="space-y-2 mb-4">
                <h4 className="font-semibold text-lg line-clamp-1">{request.title}</h4>
                
                {request.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {request.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{request.category}</Badge>
                </div>
              </div>

              {/* Location and distance */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium truncate">
                      {request.address || 'Location provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <Navigation className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Distance</p>
                    <p className="text-sm font-medium">
                      {distance ? `${distance.toFixed(1)} km` : 'Calculating...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Budget and ETA */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {request.max_budget && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-green-700">Budget</p>
                      <p className="text-sm font-bold text-green-700">
                        Up to ${request.max_budget}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-blue-700">Your ETA</p>
                    <p className="text-sm font-bold text-blue-700">
                      ~{estimatedEta} min
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleDecline}
                  disabled={isProcessing}
                  className="flex-1 border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="w-5 h-5 mr-2" />
                  Decline
                </Button>
                
                <Button
                  size="lg"
                  onClick={handleAccept}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Accept
                </Button>
              </div>

              {/* Warning for low time */}
              {timeLeft <= 10 && timeLeft > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Request expiring soon!</span>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
