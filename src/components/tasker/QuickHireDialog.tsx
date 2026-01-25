import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Star, Shield, CalendarIcon, Clock, DollarSign, 
  Briefcase, ArrowRight, Loader2, MapPin
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getCategoryTitles } from "@/lib/categories";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuickHireDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasker: {
    id: string;
    full_name: string;
    avatar_url?: string;
    rating?: number;
    total_reviews?: number;
    hourly_rate?: number;
    skills?: string[];
    city?: string;
  };
}

export const QuickHireDialog = ({ open, onOpenChange, tasker }: QuickHireDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    category: tasker.skills?.[0] || "",
    description: "",
    date: undefined as Date | undefined,
    estimatedHours: "2",
    budget: tasker.hourly_rate ? (tasker.hourly_rate * 2).toString() : "",
    location: "",
  });

  const categories = getCategoryTitles();

  const handleSubmit = async () => {
    if (!formData.title || !formData.category || !formData.date || !formData.budget) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Create the task
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .insert({
          task_giver_id: user.id,
          title: formData.title,
          category: formData.category,
          description: formData.description || "Task created via quick hire",
          scheduled_date: formData.date?.toISOString(),
          pay_amount: parseFloat(formData.budget),
          location: formData.location || "TBD",
          status: "open" as const,
          priority: "medium" as const,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Create a booking directly with this tasker
      const { error: bookingError } = await supabase
        .from("bookings")
        .insert({
          task_id: task.id,
          task_doer_id: tasker.id,
          status: "pending",
          message: `Quick hire request for: ${formData.title}`,
        });

      if (bookingError) throw bookingError;

      // Notify the tasker
      await supabase
        .from("notifications")
        .insert({
          user_id: tasker.id,
          title: "New Task Offer! 🎉",
          message: `You've been directly invited to work on: ${formData.title}`,
          type: "booking",
          link: `/bookings`,
        });

      toast({
        title: "Task Created!",
        description: `${tasker.full_name} has been notified of your task offer.`,
      });

      onOpenChange(false);
      navigate("/bookings");
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Hire</DialogTitle>
          <DialogDescription>
            Create a task and send it directly to {tasker.full_name}
          </DialogDescription>
        </DialogHeader>

        {/* Tasker Info */}
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage
              src={tasker.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tasker.full_name}`}
              alt={tasker.full_name}
            />
            <AvatarFallback>{tasker.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{tasker.full_name}</h3>
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {tasker.rating && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {tasker.rating.toFixed(1)}
                </span>
              )}
              {tasker.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {tasker.city}
                </span>
              )}
            </div>
            {tasker.hourly_rate && (
              <Badge variant="secondary" className="mt-1">
                ${tasker.hourly_rate}/hr
              </Badge>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Help me move furniture"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what you need help with..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>When do you need this done? *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => setFormData({ ...formData, date })}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Duration & Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Estimated Hours</Label>
              <Select
                value={formData.estimatedHours}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    estimatedHours: value,
                    budget: tasker.hourly_rate 
                      ? (tasker.hourly_rate * parseFloat(value)).toString()
                      : formData.budget,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                    <SelectItem key={h} value={h.toString()}>
                      {h} hour{h > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget ($) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="budget"
                  type="number"
                  placeholder="0"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location (optional)</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="Enter address or location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Send Task Offer
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
