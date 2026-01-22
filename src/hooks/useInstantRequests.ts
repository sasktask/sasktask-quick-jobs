import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface InstantRequest {
  id: string;
  giver_id: string;
  title: string;
  description: string | null;
  category: string;
  latitude: number;
  longitude: number;
  address: string | null;
  max_budget: number | null;
  urgency_level: 'asap' | 'within_hour' | 'within_2_hours';
  status: 'searching' | 'matched' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
  radius_km: number;
  expires_at: string;
  created_at: string;
  matched_doer_id: string | null;
  accepted_at: string | null;
  estimated_arrival: string | null;
  giver?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    rating: number;
    total_reviews: number;
  };
}

export interface InstantRequestResponse {
  id: string;
  request_id: string;
  doer_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  notified_at: string;
  responded_at: string | null;
  eta_minutes: number | null;
  distance_km: number | null;
}

interface UseInstantRequestsOptions {
  userId?: string;
  role?: 'giver' | 'doer';
  autoSubscribe?: boolean;
}

interface UseInstantRequestsResult {
  // For doers
  incomingRequests: InstantRequest[];
  pendingResponses: InstantRequestResponse[];
  
  // For givers
  activeRequest: InstantRequest | null;
  matchedDoer: any | null;
  
  // Actions
  acceptRequest: (requestId: string, etaMinutes: number) => Promise<boolean>;
  declineRequest: (requestId: string, reason?: string) => Promise<boolean>;
  cancelRequest: (requestId: string) => Promise<boolean>;
  
  // State
  isLoading: boolean;
  error: string | null;
}

export function useInstantRequests(options: UseInstantRequestsOptions = {}): UseInstantRequestsResult {
  const { userId, role = 'doer', autoSubscribe = true } = options;

  const [incomingRequests, setIncomingRequests] = useState<InstantRequest[]>([]);
  const [pendingResponses, setPendingResponses] = useState<InstantRequestResponse[]>([]);
  const [activeRequest, setActiveRequest] = useState<InstantRequest | null>(null);
  const [matchedDoer, setMatchedDoer] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const responseChannelRef = useRef<RealtimeChannel | null>(null);

  // Fetch initial requests for doer
  const fetchIncomingRequests = useCallback(async () => {
    if (!userId || role !== 'doer') return;

    try {
      // Get responses that are pending for this doer
      // Use type assertion for new tables
      const { data: responses, error: respError } = await (supabase as any)
        .from('instant_request_responses')
        .select(`
          *,
          instant_task_requests (
            *,
            profiles:giver_id (
              id,
              full_name,
              avatar_url,
              rating,
              total_reviews
            )
          )
        `)
        .eq('doer_id', userId)
        .eq('status', 'pending')
        .order('notified_at', { ascending: false });

      if (respError) throw respError;

      setPendingResponses(responses || []);
      
      // Extract the requests with giver info
      const requests = (responses || [])
        .map((r: any) => ({
          ...r.instant_task_requests,
          giver: r.instant_task_requests?.profiles
        }))
        .filter((r: any) => r && r.status === 'searching');
      
      setIncomingRequests(requests as InstantRequest[]);
    } catch (err: any) {
      console.error('Error fetching incoming requests:', err);
      setError(err.message);
    }
  }, [userId, role]);

  // Fetch active request for giver
  const fetchActiveRequest = useCallback(async () => {
    if (!userId || role !== 'giver') return;

    try {
      const { data: request, error: reqError } = await (supabase as any)
        .from('instant_task_requests')
        .select(`
          *,
          matched_doer:matched_doer_id (
            id,
            full_name,
            avatar_url,
            rating,
            total_reviews,
            latitude,
            longitude
          )
        `)
        .eq('giver_id', userId)
        .in('status', ['searching', 'matched', 'accepted', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (reqError) throw reqError;

      setActiveRequest(request);
      if (request?.matched_doer) {
        setMatchedDoer(request.matched_doer);
      }
    } catch (err: any) {
      console.error('Error fetching active request:', err);
      setError(err.message);
    }
  }, [userId, role]);

  // Accept a request
  const acceptRequest = useCallback(async (requestId: string, etaMinutes: number): Promise<boolean> => {
    if (!userId) return false;

    try {
      // Update the response
      const { error: respError } = await (supabase as any)
        .from('instant_request_responses')
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString(),
          eta_minutes: etaMinutes
        })
        .eq('request_id', requestId)
        .eq('doer_id', userId);

      if (respError) throw respError;

      // Update the request to matched status
      const estimatedArrival = new Date(Date.now() + etaMinutes * 60 * 1000).toISOString();
      
      const { error: reqError } = await (supabase as any)
        .from('instant_task_requests')
        .update({
          status: 'accepted',
          matched_doer_id: userId,
          accepted_at: new Date().toISOString(),
          estimated_arrival: estimatedArrival
        })
        .eq('id', requestId)
        .eq('status', 'searching');

      if (reqError) throw reqError;

      // Remove from local state
      setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
      setPendingResponses(prev => prev.filter(r => r.request_id !== requestId));

      toast.success('Request accepted! Navigate to the location.');
      return true;
    } catch (err: any) {
      console.error('Error accepting request:', err);
      toast.error('Failed to accept request');
      return false;
    }
  }, [userId]);

  // Decline a request
  const declineRequest = useCallback(async (requestId: string, reason?: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { error: respError } = await (supabase as any)
        .from('instant_request_responses')
        .update({
          status: 'declined',
          responded_at: new Date().toISOString()
        })
        .eq('request_id', requestId)
        .eq('doer_id', userId);

      if (respError) throw respError;

      // Remove from local state
      setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
      setPendingResponses(prev => prev.filter(r => r.request_id !== requestId));

      return true;
    } catch (err: any) {
      console.error('Error declining request:', err);
      toast.error('Failed to decline request');
      return false;
    }
  }, [userId]);

  // Cancel a request (for givers)
  const cancelRequest = useCallback(async (requestId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { error } = await (supabase as any)
        .from('instant_task_requests')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('giver_id', userId);

      if (error) throw error;

      setActiveRequest(null);
      setMatchedDoer(null);
      toast.info('Request cancelled');
      return true;
    } catch (err: any) {
      console.error('Error cancelling request:', err);
      toast.error('Failed to cancel request');
      return false;
    }
  }, [userId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!autoSubscribe || !userId) {
      setIsLoading(false);
      return;
    }

    const setupSubscriptions = async () => {
      setIsLoading(true);

      if (role === 'doer') {
        await fetchIncomingRequests();

        // Subscribe to new responses for this doer
        responseChannelRef.current = supabase
          .channel(`instant-responses-${userId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'instant_request_responses',
              filter: `doer_id=eq.${userId}`
            },
            async (payload: any) => {
              console.log('New instant request notification:', payload);
              
              // Fetch the full request with giver info
              const { data: request } = await (supabase as any)
                .from('instant_task_requests')
                .select(`
                  *,
                  profiles:giver_id (
                    id,
                    full_name,
                    avatar_url,
                    rating,
                    total_reviews
                  )
                `)
                .eq('id', payload.new.request_id)
                .single();

              if (request && request.status === 'searching') {
                const requestWithGiver = {
                  ...request,
                  giver: request.profiles
                } as InstantRequest;

                setIncomingRequests(prev => [requestWithGiver, ...prev]);
                setPendingResponses(prev => [payload.new as InstantRequestResponse, ...prev]);

                // Play notification sound
                try {
                  const audio = new Audio('/notification.mp3');
                  audio.play().catch(() => {});
                } catch {}

                // Show notification
                toast.info('New instant task request!', {
                  description: request.title,
                  duration: 10000
                });
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'instant_request_responses',
              filter: `doer_id=eq.${userId}`
            },
            (payload: any) => {
              // Request was taken by someone else or expired
              if (payload.new.status !== 'pending') {
                setIncomingRequests(prev => 
                  prev.filter(r => r.id !== payload.new.request_id)
                );
                setPendingResponses(prev =>
                  prev.filter(r => r.request_id !== payload.new.request_id)
                );
              }
            }
          )
          .subscribe();

      } else {
        // Giver role
        await fetchActiveRequest();

        // Subscribe to request updates
        channelRef.current = supabase
          .channel(`instant-request-giver-${userId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'instant_task_requests',
              filter: `giver_id=eq.${userId}`
            },
            async (payload: any) => {
              console.log('Request updated:', payload);
              const updatedRequest = payload.new as InstantRequest;
              
              setActiveRequest(prev => 
                prev?.id === updatedRequest.id ? { ...prev, ...updatedRequest } : prev
              );

              // If matched, fetch doer info
              if (updatedRequest.matched_doer_id && updatedRequest.status === 'accepted') {
                const { data: doer } = await supabase
                  .from('profiles')
                  .select('id, full_name, avatar_url, rating, total_reviews, latitude, longitude')
                  .eq('id', updatedRequest.matched_doer_id)
                  .single();

                if (doer) {
                  setMatchedDoer(doer);
                  toast.success(`${doer.full_name} accepted your request!`, {
                    description: `ETA: ${updatedRequest.estimated_arrival ? 
                      new Date(updatedRequest.estimated_arrival).toLocaleTimeString() : 'Soon'}`
                  });
                }
              }

              if (updatedRequest.status === 'expired') {
                toast.error('Request expired. No doers available.');
                setActiveRequest(null);
              }
            }
          )
          .subscribe();
      }

      setIsLoading(false);
    };

    setupSubscriptions();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (responseChannelRef.current) {
        supabase.removeChannel(responseChannelRef.current);
      }
    };
  }, [userId, role, autoSubscribe, fetchIncomingRequests, fetchActiveRequest]);

  return {
    incomingRequests,
    pendingResponses,
    activeRequest,
    matchedDoer,
    acceptRequest,
    declineRequest,
    cancelRequest,
    isLoading,
    error
  };
}
