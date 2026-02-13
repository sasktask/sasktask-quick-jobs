import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  MapPin,
  DollarSign,
  Clock,
  Zap,
  Star,
  X,
  ChevronUp,
  ChevronDown,
  Share2,
  Bookmark,
  BookmarkCheck,
  Route,
  MessageCircle,
  Calendar,
  User,
  Shield,
  CheckCircle2,
  Navigation,
  Copy,
  Check,
  ExternalLink,
  Compass,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { timeEstimateLabels, TimeEstimate } from '@/lib/categories';
import { supabase } from '@/integrations/supabase/client';

interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  pay_amount: number;
  category: string;
  latitude?: number;
  longitude?: number;
  estimated_duration?: number;
  priority?: string;
  created_at?: string;
  task_giver_id?: string;
}

interface TaskGiver {
  id: string;
  full_name: string;
  avatar_url?: string;
  rating?: number;
  verified_by_admin?: boolean;
  completed_tasks?: number;
}

interface GeocodedAddress {
  full: string;
  street?: string;
  city?: string;
  region?: string;
  postcode?: string;
}

interface MapTaskPreviewProps {
  task: Task;
  taskGiver?: TaskGiver | null;
  distance?: number;
  userLocation?: { latitude: number; longitude: number } | null;
  onClose: () => void;
  onShowRoute: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export function MapTaskPreview({
  task,
  taskGiver,
  distance,
  userLocation,
  onClose,
  onShowRoute,
  isSaved = false,
  onToggleSave,
}: MapTaskPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [geocodedAddress, setGeocodedAddress] = useState<GeocodedAddress | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // Reverse geocode the task location
  useEffect(() => {
    if (!task.latitude || !task.longitude) return;

    const reverseGeocode = async () => {
      setIsLoadingAddress(true);
      try {
        const { data } = await supabase.functions.invoke('get-mapbox-token');
        if (!data?.token) return;

        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${task.longitude},${task.latitude}.json?` +
          `access_token=${data.token}&types=address,place,locality,neighborhood`
        );

        if (response.ok) {
          const geoData = await response.json();
          const feature = geoData.features?.[0];

          if (feature) {
            const context = feature.context || [];
            const getContextValue = (type: string) =>
              context.find((c: any) => c.id?.startsWith(type))?.text;

            setGeocodedAddress({
              full: feature.place_name,
              street: feature.text,
              city: getContextValue('place') || getContextValue('locality'),
              region: getContextValue('region'),
              postcode: getContextValue('postcode'),
            });
          }
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
      } finally {
        setIsLoadingAddress(false);
      }
    };

    reverseGeocode();
  }, [task.latitude, task.longitude]);

  const getTimeEstimate = (duration: number | undefined): TimeEstimate => {
    if (!duration || duration <= 0.5) return 'quick';
    if (duration <= 2) return 'short';
    if (duration <= 4) return 'medium';
    return 'long';
  };

  const timeEstimate = getTimeEstimate(task.estimated_duration);
  const matchScore = Math.floor(Math.random() * 30) + 70;

  const handleShare = async () => {
    try {
      await navigator.share({
        title: task.title,
        text: `Check out this task: ${task.title} - $${task.pay_amount}`,
        url: `${window.location.origin}/task/${task.id}`,
      });
    } catch (err) {
      navigator.clipboard.writeText(`${window.location.origin}/task/${task.id}`);
    }
  };

  const copyAddress = async () => {
    const addressText = geocodedAddress?.full || task.location;
    try {
      await navigator.clipboard.writeText(addressText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const openInGoogleMaps = () => {
    if (task.latitude && task.longitude) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${task.latitude},${task.longitude}`,
        '_blank'
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="absolute bottom-4 left-4 right-4 z-20 max-w-lg mx-auto"
    >
      <Card className="bg-background/95 backdrop-blur-md shadow-2xl border-border overflow-hidden">
        {/* Match Score Bar */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Match Score</span>
            <span className={`text-xs font-medium ${matchScore >= 80 ? 'text-green-500' :
                matchScore >= 60 ? 'text-yellow-500' : 'text-orange-500'
              }`}>
              {matchScore}%
            </span>
          </div>
          <Progress value={matchScore} className="h-1.5" />
        </div>

        <CardContent className="p-4 pt-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg truncate">{task.title}</h3>
                {task.priority === 'urgent' && (
                  <Badge className="bg-red-500 shrink-0 animate-pulse">
                    <Zap className="h-3 w-3 mr-0.5" />
                    Urgent
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              {onToggleSave && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleSave}>
                  {isSaved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Enhanced Address Display */}
          <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border/50">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                {isLoadingAddress ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading address...</span>
                  </div>
                ) : geocodedAddress ? (
                  <>
                    {geocodedAddress.street && (
                      <p className="font-medium text-sm">{geocodedAddress.street}</p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {geocodedAddress.full}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {geocodedAddress.city && (
                        <Badge variant="secondary" className="text-xs">{geocodedAddress.city}</Badge>
                      )}
                      {geocodedAddress.postcode && (
                        <Badge variant="outline" className="text-xs">{geocodedAddress.postcode}</Badge>
                      )}
                      {distance !== undefined && (
                        <Badge variant="default" className="text-xs bg-blue-500">
                          <Navigation className="h-3 w-3 mr-0.5" />
                          {distance.toFixed(1)} km
                        </Badge>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm">{task.location}</p>
                    {distance !== undefined && (
                      <Badge variant="outline" className="text-xs mt-1">{distance.toFixed(1)} km away</Badge>
                    )}
                  </>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyAddress} title="Copy address">
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={openInGoogleMaps} title="Open in Maps">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {task.latitude && task.longitude && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                <Compass className="h-3.5 w-3.5 text-muted-foreground" />
                <code className="text-xs text-muted-foreground">
                  {task.latitude.toFixed(5)}, {task.longitude.toFixed(5)}
                </code>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge variant="default" className="bg-green-600">
              <DollarSign className="h-3 w-3 mr-0.5" />{task.pay_amount}
            </Badge>
            <Badge variant="secondary">{task.category}</Badge>
            {task.estimated_duration && (
              <Badge variant="outline" className={timeEstimateLabels[timeEstimate].color}>
                <Clock className="h-3 w-3 mr-0.5" />
                {timeEstimateLabels[timeEstimate].label}
              </Badge>
            )}
          </div>

          {/* Expandable Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground line-clamp-3">{task.description}</p>
                </div>

                {taskGiver && (
                  <div className="mt-4 flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={taskGiver.avatar_url} />
                      <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{taskGiver.full_name || 'Anonymous'}</p>
                        {taskGiver.verified_by_admin && <Shield className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {taskGiver.rating && (
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            {taskGiver.rating.toFixed(1)}
                          </span>
                        )}
                        {taskGiver.completed_tasks && (
                          <span className="flex items-center gap-0.5">
                            <CheckCircle2 className="h-3 w-3" />
                            {taskGiver.completed_tasks} tasks
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <Calendar className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Posted</p>
                    <p className="text-xs font-medium">
                      {task.created_at ? new Date(task.created_at).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <MessageCircle className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Bids</p>
                    <p className="text-xs font-medium">{Math.floor(Math.random() * 5)}</p>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-xs font-medium">
                      {task.estimated_duration ? `~${task.estimated_duration}h` : 'Flexible'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-1 mt-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? (
              <><ChevronDown className="h-4 w-4" /> Less details</>
            ) : (
              <><ChevronUp className="h-4 w-4" /> More details</>
            )}
          </button>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            {userLocation && task.latitude && task.longitude && (
              <Button variant="outline" className="flex-1 gap-1.5" onClick={onShowRoute}>
                <Route className="h-4 w-4" />
                Directions
              </Button>
            )}
            <Button className="flex-1" onClick={() => navigate(`/task/${task.id}`)}>
              View Task
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
