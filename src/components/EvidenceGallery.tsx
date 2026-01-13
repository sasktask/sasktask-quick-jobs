import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Image, FileVideo, Clock, User, Download, Eye, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { format } from "date-fns";

interface Evidence {
  id: string;
  booking_id: string;
  task_id: string;
  uploaded_by: string;
  evidence_type: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  caption: string | null;
  created_at: string;
  uploader?: {
    full_name: string;
    avatar_url: string;
  };
}

interface EvidenceGalleryProps {
  bookingId: string;
  title?: string;
  showUploader?: boolean;
}

export const EvidenceGallery = ({ 
  bookingId, 
  title = "Work Evidence",
  showUploader = true 
}: EvidenceGalleryProps) => {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchEvidence();
  }, [bookingId]);

  const fetchEvidence = async () => {
    try {
      const { data, error } = await supabase
        .from('work_evidence')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch uploader info for each evidence
      const evidenceWithUploaders = await Promise.all(
        (data || []).map(async (ev) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', ev.uploaded_by)
            .single();
          
          return {
            ...ev,
            uploader: profile || { full_name: 'Unknown', avatar_url: '' }
          };
        })
      );

      setEvidence(evidenceWithUploaders);
    } catch (error) {
      console.error("Error fetching evidence:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'before': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'during': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completion': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'after': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'before': return '📷 Before';
      case 'during': return '🔧 During';
      case 'completion': return '✅ Completed';
      case 'after': return '🧹 After';
      default: return type;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const openLightbox = (ev: Evidence, index: number) => {
    setSelectedEvidence(ev);
    setCurrentIndex(index);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + evidence.length) % evidence.length
      : (currentIndex + 1) % evidence.length;
    setCurrentIndex(newIndex);
    setSelectedEvidence(evidence[newIndex]);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="h-8 w-8 bg-muted rounded-full" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (evidence.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <Shield className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No evidence uploaded yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Evidence helps build trust and resolve disputes
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group evidence by type
  const groupedEvidence = evidence.reduce((acc, ev) => {
    if (!acc[ev.evidence_type]) acc[ev.evidence_type] = [];
    acc[ev.evidence_type].push(ev);
    return acc;
  }, {} as Record<string, Evidence[]>);

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Image className="h-5 w-5 text-primary" />
            {title}
            <Badge variant="secondary" className="ml-auto">
              {evidence.length} file{evidence.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
          <CardDescription>
            Timestamped documentation of work performed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Evidence Timeline by Type */}
          {Object.entries(groupedEvidence).map(([type, items]) => (
            <div key={type} className="space-y-2">
              <Badge className={getTypeColor(type)}>
                {getTypeLabel(type)} ({items.length})
              </Badge>
              <div className="grid grid-cols-3 gap-2">
                {items.map((ev, idx) => (
                  <div
                    key={ev.id}
                    className="relative group cursor-pointer rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                    onClick={() => openLightbox(ev, evidence.indexOf(ev))}
                  >
                    {ev.file_type.startsWith('image/') ? (
                      <img
                        src={ev.file_url}
                        alt={ev.caption || ev.file_name}
                        className="w-full h-20 object-cover"
                      />
                    ) : (
                      <div className="w-full h-20 flex items-center justify-center bg-muted">
                        <FileVideo className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="h-5 w-5 text-white" />
                    </div>

                    {/* Timestamp Badge */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5">
                      {format(new Date(ev.created_at), 'HH:mm')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedEvidence} onOpenChange={() => setSelectedEvidence(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Badge className={getTypeColor(selectedEvidence?.evidence_type || '')}>
                  {getTypeLabel(selectedEvidence?.evidence_type || '')}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {currentIndex + 1} / {evidence.length}
                </span>
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="relative">
            {/* Main Image/Video */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              {selectedEvidence?.file_type.startsWith('image/') ? (
                <img
                  src={selectedEvidence.file_url}
                  alt={selectedEvidence.caption || selectedEvidence.file_name}
                  className="w-full max-h-[60vh] object-contain"
                />
              ) : (
                <video
                  src={selectedEvidence?.file_url}
                  controls
                  className="w-full max-h-[60vh]"
                />
              )}

              {/* Navigation Arrows */}
              {evidence.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateLightbox('prev');
                    }}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateLightbox('next');
                    }}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>

            {/* Evidence Details */}
            <div className="mt-4 space-y-2">
              {selectedEvidence?.caption && (
                <p className="text-sm">{selectedEvidence.caption}</p>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {selectedEvidence && format(new Date(selectedEvidence.created_at), 'PPp')}
                  </span>
                  <span>{selectedEvidence && formatFileSize(selectedEvidence.file_size)}</span>
                </div>
                
                {showUploader && selectedEvidence?.uploader && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {selectedEvidence.uploader.full_name}
                  </span>
                )}
              </div>

              {/* Download Button */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => window.open(selectedEvidence?.file_url, '_blank')}
              >
                <Download className="h-4 w-4" />
                Download Original
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
