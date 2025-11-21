import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VideoCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  otherUserId: string;
  otherUserName: string;
  callType: 'video' | 'audio';
}

export const VideoCallDialog = ({
  isOpen,
  onClose,
  bookingId,
  otherUserId,
  otherUserName,
  callType
}: VideoCallDialogProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [callSessionId, setCallSessionId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'active' | 'ended'>('connecting');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      initializeCall();
    }
    return () => {
      cleanup();
    };
  }, [isOpen]);

  const initializeCall = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create call session
      const { data: session, error } = await supabase
        .from('call_sessions')
        .insert({
          booking_id: bookingId,
          caller_id: user.id,
          receiver_id: otherUserId,
          call_type: callType,
          status: 'ringing'
        })
        .select()
        .single();

      if (error) throw error;
      setCallSessionId(session.id);
      setCallStatus('ringing');

      // Initialize WebRTC
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        setCallStatus('active');
      };

      pc.onicecandidate = async (event) => {
        if (event.candidate && callSessionId) {
          // In a production app, send this to the other peer via signaling server
          console.log('ICE candidate:', event.candidate);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Update session with offer
      await supabase
        .from('call_sessions')
        .update({
          ice_servers: { offer: offer.sdp },
          started_at: new Date().toISOString()
        })
        .eq('id', session.id);

      setPeerConnection(pc);

      // Subscribe to call status changes
      const channel = supabase
        .channel(`call-${session.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'call_sessions',
          filter: `id=eq.${session.id}`
        }, (payload) => {
          if (payload.new.status === 'ended' || payload.new.status === 'rejected') {
            endCall();
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };

    } catch (error) {
      console.error('Call initialization error:', error);
      toast.error('Failed to initialize call');
      onClose();
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
  };

  const endCall = async () => {
    if (callSessionId) {
      await supabase
        .from('call_sessions')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', callSessionId);
    }
    setCallStatus('ended');
    cleanup();
    onClose();
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream && callType === 'video') {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px]">
        <DialogHeader>
          <DialogTitle>
            {callStatus === 'ringing' && `Calling ${otherUserName}...`}
            {callStatus === 'active' && `In call with ${otherUserName}`}
            {callStatus === 'connecting' && 'Connecting...'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 h-full">
          {/* Remote video */}
          <div className="relative bg-muted rounded-lg overflow-hidden">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {callStatus === 'ringing' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <p className="text-white">Waiting for {otherUserName} to join...</p>
              </div>
            )}
          </div>

          {/* Local video */}
          <div className="relative bg-muted rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-4">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            onClick={toggleMute}
            className="rounded-full h-12 w-12"
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          {callType === 'video' && (
            <Button
              variant={isVideoOff ? "destructive" : "secondary"}
              size="icon"
              onClick={toggleVideo}
              className="rounded-full h-12 w-12"
            >
              {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>
          )}

          <Button
            variant="destructive"
            size="icon"
            onClick={endCall}
            className="rounded-full h-12 w-12"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};