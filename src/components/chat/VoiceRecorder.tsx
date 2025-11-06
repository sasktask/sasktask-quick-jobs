import { useState, useRef, useEffect } from "react";
import { Mic, Square, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
}

export const VoiceRecorder = ({ onSend, onCancel }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, duration);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
      {!isRecording && !audioBlob && (
        <Button onClick={startRecording} size="icon" variant="default">
          <Mic className="h-4 w-4" />
        </Button>
      )}

      {isRecording && (
        <>
          <div className="flex items-center gap-2 flex-1">
            <div className="h-2 w-2 bg-destructive rounded-full animate-pulse" />
            <span className="text-sm font-medium">{formatDuration(duration)}</span>
          </div>
          <Button onClick={stopRecording} size="icon" variant="destructive">
            <Square className="h-4 w-4" />
          </Button>
        </>
      )}

      {audioBlob && !isRecording && (
        <>
          <audio src={URL.createObjectURL(audioBlob)} controls className="flex-1" />
          <Button onClick={handleSend} size="icon" variant="default">
            <Send className="h-4 w-4" />
          </Button>
          <Button onClick={onCancel} size="icon" variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </>
      )}

      {!isRecording && !audioBlob && (
        <Button onClick={onCancel} size="icon" variant="ghost">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
