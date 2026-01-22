import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Zap,
  MapPin,
  Clock,
  DollarSign,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Radio,
  Navigation
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AvailabilityToggle } from '@/components/instant/AvailabilityToggle';
import { IncomingRequestCard } from '@/components/instant/IncomingRequestCard';
import { DoerArrivingCard } from '@/components/instant/DoerArrivingCard';
import { LiveLocationTracker } from '@/components/instant/LiveLocationTracker';
import { useInstantRequests } from '@/hooks/useInstantRequests';
import { useLiveLocation } from '@/hooks/useLiveLocation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  'Cleaning',
  'Moving',
  'Handyman',
  'Delivery',
  'Assembly',
  'Gardening',
  'Pet Care',
  'Errands',
  'Tech Help',
  'Other'
];

const URGENCY_OPTIONS = [
  { value: 'asap', label: 'ASAP (within 15 min)', color: 'text-red-600' },
  { value: 'within_hour', label: 'Within 1 hour', color: 'text-orange-600' },
  { value: 'within_2_hours', label: 'Within 2 hours', color: 'text-yellow-600' }
];

export default function InstantWork() {
  const navigate = useNavigate();
  
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'request' | 'available'>('request');
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState<'asap' | 'within_hour' | 'within_2_hours'>('asap');
  const [maxBudget, setMaxBudget] = useState('');
  const [address, setAddress] = useState('');

  // Location
  const { location, isTracking, requestPermission } = useLiveLocation({
    enableHighAccuracy: true,
    broadcastToServer: false
  });

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Load profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
        }
      }
      setIsLoading(false);
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Instant requests hook for doer mode
  const {
    incomingRequests,
    acceptRequest,
    declineRequest,
    isLoading: doerLoading
  } = useInstantRequests({
    userId: user?.id,
    role: 'doer',
    autoSubscribe: activeTab === 'available' && !!user
  });

  // Instant requests hook for giver mode
  const {
    activeRequest,
    matchedDoer,
    cancelRequest,
    isLoading: giverLoading
  } = useInstantRequests({
    userId: user?.id,
    role: 'giver',
    autoSubscribe: activeTab === 'request' && !!user
  });

  // Get location on mount
  useEffect(() => {
    requestPermission();
  }, []);

  // Create instant request
  const handleCreateRequest = async () => {
    if (!title || !category) {
      toast.error('Please fill in the required fields');
      return;
    }

    if (!location) {
      toast.error('Location is required. Please enable location services.');
      return;
    }

    setIsCreatingRequest(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to create a request');
        return;
      }

      const response = await supabase.functions.invoke('create-instant-request', {
        body: {
          title,
          description,
          category,
          latitude: location.latitude,
          longitude: location.longitude,
          address: address || undefined,
          max_budget: maxBudget ? parseFloat(maxBudget) : undefined,
          urgency_level: urgency,
          radius_km: 10
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      
      if (result.success) {
        toast.success(result.message);
        setShowRequestDialog(false);
        // Reset form
        setTitle('');
        setDescription('');
        setCategory('');
        setMaxBudget('');
        setAddress('');
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      console.error('Error creating request:', err);
      toast.error(err.message || 'Failed to create request');
    } finally {
      setIsCreatingRequest(false);
    }
  };

  // Handle request cancellation
  const handleCancelRequest = async () => {
    if (activeRequest) {
      await cancelRequest(activeRequest.id);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              Instant Work
            </h1>
            <p className="text-muted-foreground">
              Get help right now or earn by accepting instant tasks
            </p>
          </div>
        </div>

        {/* Main tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'request' | 'available')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="request" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Get Help Now
            </TabsTrigger>
            <TabsTrigger value="available" className="flex items-center gap-2">
              <Radio className="w-4 h-4" />
              Accept Tasks
            </TabsTrigger>
          </TabsList>

          {/* Request Tab - For Givers */}
          <TabsContent value="request" className="space-y-4">
            {/* Active request status */}
            {activeRequest ? (
              <div className="space-y-4">
                {activeRequest.status === 'searching' && (
                  <Card className="border-primary/50">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center"
                        >
                          <Search className="w-8 h-8 text-primary" />
                        </motion.div>
                        <div>
                          <h3 className="font-semibold text-lg">Searching for Doers...</h3>
                          <p className="text-muted-foreground">
                            Nearby doers are being notified
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>
                            Expires {new Date(activeRequest.expires_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={handleCancelRequest}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel Request
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeRequest.status === 'accepted' && matchedDoer && (
                  <DoerArrivingCard
                    requestId={activeRequest.id}
                    doer={matchedDoer}
                    taskTitle={activeRequest.title}
                    taskCategory={activeRequest.category}
                    estimatedArrival={Number(activeRequest.estimated_arrival) || 10}
                    onCancel={handleCancelRequest}
                    onMessage={() => navigate('/messages')}
                  />
                )}

                {/* Request details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{activeRequest.title}</CardTitle>
                    <CardDescription>
                      <Badge variant="secondary">{activeRequest.category}</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {activeRequest.description && (
                      <p className="text-sm text-muted-foreground">
                        {activeRequest.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{activeRequest.address || 'Location set'}</span>
                      </div>
                      {activeRequest.max_budget && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span>Up to ${activeRequest.max_budget}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Need Help Right Now?</h3>
                      <p className="text-muted-foreground">
                        Create an instant request and nearby doers will be notified immediately
                      </p>
                    </div>
                    <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                      <DialogTrigger asChild>
                        <Button size="lg" className="gap-2">
                          <Zap className="w-5 h-5" />
                          Create Instant Request
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            Instant Task Request
                          </DialogTitle>
                          <DialogDescription>
                            Describe what you need help with. Nearby doers will be notified instantly.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">What do you need help with? *</Label>
                            <Input
                              id="title"
                              placeholder="e.g., Help moving furniture"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select value={category} onValueChange={setCategory}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.map((cat) => (
                                  <SelectItem key={cat} value={cat.toLowerCase()}>
                                    {cat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="description">Details (optional)</Label>
                            <Textarea
                              id="description"
                              placeholder="Any additional details..."
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              rows={3}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>How soon do you need help?</Label>
                            <Select value={urgency} onValueChange={(v) => setUrgency(v as any)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {URGENCY_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    <span className={opt.color}>{opt.label}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="budget">Max Budget ($)</Label>
                              <Input
                                id="budget"
                                type="number"
                                placeholder="Optional"
                                value={maxBudget}
                                onChange={(e) => setMaxBudget(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="address">Address</Label>
                              <Input
                                id="address"
                                placeholder="Optional"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Location status */}
                          <div className={cn(
                            'flex items-center gap-2 p-3 rounded-lg text-sm',
                            location ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                          )}>
                            {location ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Location detected (±{Math.round(location.accuracy)}m)</span>
                              </>
                            ) : (
                              <>
                                <Navigation className="w-4 h-4" />
                                <span>Getting your location...</span>
                              </>
                            )}
                          </div>

                          <Button
                            onClick={handleCreateRequest}
                            disabled={isCreatingRequest || !location || !title || !category}
                            className="w-full"
                            size="lg"
                          >
                            {isCreatingRequest ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating Request...
                              </>
                            ) : (
                              <>
                                <Zap className="w-4 h-4 mr-2" />
                                Send to Nearby Doers
                              </>
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* How it works */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How Instant Requests Work</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Describe Task</p>
                      <p className="text-sm text-muted-foreground">
                        Tell us what you need and your budget
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Doers Notified</p>
                      <p className="text-sm text-muted-foreground">
                        Nearby available doers receive your request
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Doer Arrives</p>
                      <p className="text-sm text-muted-foreground">
                        Track their arrival in real-time
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Available Tab - For Doers */}
          <TabsContent value="available" className="space-y-4">
            {/* Availability toggle */}
            {user && (
              <AvailabilityToggle
                userId={user.id}
                variant="full"
              />
            )}

            {/* Live location tracker */}
            <LiveLocationTracker
              isActive={isTracking}
              showCard={true}
            />

            {/* Incoming requests */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Incoming Requests</h3>
                {incomingRequests.length > 0 && (
                  <Badge>{incomingRequests.length} active</Badge>
                )}
              </div>

              <AnimatePresence>
                {incomingRequests.length > 0 ? (
                  incomingRequests.map((request) => (
                    <IncomingRequestCard
                      key={request.id}
                      request={request}
                      doerLocation={location ? { latitude: location.latitude, longitude: location.longitude } : null}
                      onAccept={acceptRequest}
                      onDecline={declineRequest}
                      timeoutSeconds={30}
                    />
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">
                        {isTracking 
                          ? 'Waiting for instant requests...'
                          : 'Go online to receive instant task requests'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </AnimatePresence>
            </div>

            {/* Tips for doers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips for More Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Stay in busy areas with high task demand</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Keep your profile and skills updated</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Respond quickly - first to accept gets the job</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Maintain a high rating for priority matching</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
