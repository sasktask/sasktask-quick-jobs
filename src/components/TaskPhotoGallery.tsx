import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "./ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface TaskPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  created_at: string;
}

interface TaskPhotoGalleryProps {
  taskId: string;
}

export const TaskPhotoGallery = ({ taskId }: TaskPhotoGalleryProps) => {
  const [photos, setPhotos] = useState<TaskPhoto[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, [taskId]);

  const fetchPhotos = async () => {
    const { data } = await supabase
      .from('task_photos')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (data) {
      setPhotos(data);
    }
  };

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  if (photos.length === 0) return null;

  return (
    <>
      <div className="space-y-2">
        <h3 className="font-semibold">Task Photos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative group cursor-pointer"
              onClick={() => setSelectedIndex(index)}
            >
              <img
                src={photo.photo_url}
                alt={photo.caption || `Task photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-border group-hover:opacity-80 transition-opacity"
              />
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  {photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-4xl p-0">
          {selectedIndex !== null && (
            <div className="relative">
              <img
                src={photos[selectedIndex].photo_url}
                alt={photos[selectedIndex].caption || 'Task photo'}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              {photos[selectedIndex].caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4">
                  {photos[selectedIndex].caption}
                </div>
              )}
              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={goToPrevious}
                    disabled={selectedIndex === 0}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={goToNext}
                    disabled={selectedIndex === photos.length - 1}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {selectedIndex + 1} / {photos.length}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};