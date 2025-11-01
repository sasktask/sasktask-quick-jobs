import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

interface FavoriteButtonProps {
  taskerId: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
}

export const FavoriteButton = ({ taskerId, size = "default", variant = "ghost" }: FavoriteButtonProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkFavoriteStatus();
  }, [taskerId]);

  const checkFavoriteStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('tasker_id', taskerId)
      .single();

    setIsFavorite(!!data);
  };

  const toggleFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to save favorites",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isFavorite) {
        // Remove favorite
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('tasker_id', taskerId);

        toast({
          title: "Removed from favorites",
        });
        setIsFavorite(false);
      } else {
        // Add favorite
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            tasker_id: taskerId,
          });

        toast({
          title: "Added to favorites",
        });
        setIsFavorite(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleFavorite}
      disabled={loading}
      className="gap-2"
    >
      <Heart
        className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
      />
      {isFavorite ? 'Saved' : 'Save'}
    </Button>
  );
};