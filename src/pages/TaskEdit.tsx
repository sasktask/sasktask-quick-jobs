import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Loader2, Save, Send, CheckCircle, Repeat } from "lucide-react";
import { z } from "zod";
import { SEOHead } from "@/components/SEOHead";
import { RecurringTaskForm } from "@/components/scheduling";

const taskSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(200, "Title too long"),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(5000, "Description too long"),
  category: z.string().min(1, "Category is required"),
  location: z.string().trim().min(3, "Location must be at least 3 characters").max(200, "Location too long"),
  pay_amount: z.number().positive("Pay amount must be positive").max(100000, "Pay amount too high"),
  estimated_duration: z.number().positive("Duration must be positive").optional(),
  budget_type: z.enum(["fixed", "hourly"]),
  scheduled_date: z.string().optional(),
  tools_provided: z.boolean(),
  tools_description: z.string().max(1000, "Tools description too long").optional(),
});

const TaskEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<string>("open");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [recurrence, setRecurrence] = useState<{
    frequency: string;
    start_date: string;
    end_date: string | null;
    is_active: boolean;
  } | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    pay_amount: "",
    estimated_duration: "",
    budget_type: "fixed" as "fixed" | "hourly",
    scheduled_date: "",
    tools_provided: false,
    tools_description: ""
  });

  const categories = [
    "Snow Removal",
    "Cleaning",
    "Moving",
    "Delivery",
    "Handyman",
    "Gardening",
    "Pet Care",
    "Other"
  ];

  useEffect(() => {
    checkUserAndLoadTask();
  }, [id]);

  // Auto-save effect for drafts
  useEffect(() => {
    if (taskStatus === "draft" && hasUnsavedChanges && formData.title.trim()) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, taskStatus, hasUnsavedChanges]);

  const checkUserAndLoadTask = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);

      // Load the task
      const { data: task, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (task.task_giver_id !== session.user.id) {
        toast({
          title: "Access Denied",
          description: "You can only edit your own tasks",
          variant: "destructive",
        });
        navigate("/my-tasks");
        return;
      }

      setTaskStatus(task.status || "open");
      setFormData({
        title: task.title || "",
        description: task.description || "",
        category: task.category || "",
        location: task.location || "",
        pay_amount: task.pay_amount?.toString() || "",
        estimated_duration: task.estimated_duration?.toString() || "",
        budget_type: (task.budget_type as "fixed" | "hourly") || "fixed",
        scheduled_date: task.scheduled_date ? new Date(task.scheduled_date).toISOString().slice(0, 16) : "",
        tools_provided: task.tools_provided || false,
        tools_description: task.tools_description || ""
      });

      // Fetch recurring task data if exists
      const { data: recurringData } = await supabase
        .from("recurring_tasks")
        .select("frequency, start_date, end_date, is_active")
        .eq("task_id", id)
        .maybeSingle();

      if (recurringData) {
        setRecurrence(recurringData);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/my-tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const handleAutoSave = useCallback(async () => {
    if (!userId || !id || taskStatus !== "draft") return;

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || "Draft - no description yet",
          category: formData.category || "Other",
          location: formData.location.trim() || "TBD",
          pay_amount: parseFloat(formData.pay_amount) || 0,
          estimated_duration: formData.estimated_duration ? parseFloat(formData.estimated_duration) : null,
          budget_type: formData.budget_type,
          scheduled_date: formData.scheduled_date || null,
          tools_provided: formData.tools_provided,
          tools_description: formData.tools_description || null,
        })
        .eq("id", id);

      if (error) throw error;

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [userId, id, formData, taskStatus]);

  const handleSave = async () => {
    if (!userId || !id) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || "Draft - no description yet",
          category: formData.category || "Other",
          location: formData.location.trim() || "TBD",
          pay_amount: parseFloat(formData.pay_amount) || 0,
          estimated_duration: formData.estimated_duration ? parseFloat(formData.estimated_duration) : null,
          budget_type: formData.budget_type,
          scheduled_date: formData.scheduled_date || null,
          tools_provided: formData.tools_provided,
          tools_description: formData.tools_description || null,
        })
        .eq("id", id);

      if (error) throw error;

      setLastSaved(new Date());
      setHasUnsavedChanges(false);

      toast({
        title: "Saved",
        description: "Your changes have been saved",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!userId || !id) return;

    setIsPublishing(true);

    try {
      const validation = taskSchema.safeParse({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        pay_amount: parseFloat(formData.pay_amount),
        estimated_duration: formData.estimated_duration ? parseFloat(formData.estimated_duration) : undefined,
        budget_type: formData.budget_type,
        scheduled_date: formData.scheduled_date,
        tools_provided: formData.tools_provided,
        tools_description: formData.tools_description,
      });

      if (!validation.success) {
        const firstError = validation.error.errors[0];
        throw new Error(firstError.message);
      }

      const { error } = await supabase
        .from("tasks")
        .update({
          title: validation.data.title,
          description: validation.data.description,
          category: validation.data.category,
          location: validation.data.location,
          pay_amount: validation.data.pay_amount,
          estimated_duration: validation.data.estimated_duration,
          budget_type: validation.data.budget_type,
          scheduled_date: validation.data.scheduled_date || null,
          tools_provided: validation.data.tools_provided,
          tools_description: validation.data.tools_description || null,
          status: "open"
        })
        .eq("id", id);

      if (error) throw error;

      // Send email notification
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .single();

        supabase.functions.invoke("send-task-notification", {
          body: {
            type: "draft_published",
            taskId: id,
            taskTitle: validation.data.title,
            recipientEmail: profile?.email || user.email,
            recipientName: profile?.full_name,
          },
        }).catch(console.error);
      }

      toast({
        title: "Published!",
        description: "Your task is now live and visible to taskers",
      });

      navigate("/my-tasks");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !id) return;

    setIsSubmitting(true);

    try {
      const validation = taskSchema.safeParse({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        pay_amount: parseFloat(formData.pay_amount),
        estimated_duration: formData.estimated_duration ? parseFloat(formData.estimated_duration) : undefined,
        budget_type: formData.budget_type,
        scheduled_date: formData.scheduled_date,
        tools_provided: formData.tools_provided,
        tools_description: formData.tools_description,
      });

      if (!validation.success) {
        const firstError = validation.error.errors[0];
        throw new Error(firstError.message);
      }

      const { error } = await supabase
        .from("tasks")
        .update({
          title: validation.data.title,
          description: validation.data.description,
          category: validation.data.category,
          location: validation.data.location,
          pay_amount: validation.data.pay_amount,
          estimated_duration: validation.data.estimated_duration,
          budget_type: validation.data.budget_type,
          scheduled_date: validation.data.scheduled_date || null,
          tools_provided: validation.data.tools_provided,
          tools_description: validation.data.tools_description || null,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your task has been updated",
      });

      navigate("/my-tasks");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Edit Task - SaskTask"
        description="Edit your task details"
      />
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20 max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Edit Task</h1>
            <p className="text-muted-foreground">Update your task details</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={taskStatus === "draft" ? "outline" : "default"}>
              {taskStatus === "draft" ? "Draft" : taskStatus}
            </Badge>
            {taskStatus === "draft" && lastSaved && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
            <CardDescription>
              {taskStatus === "draft" 
                ? "Complete the details and publish when ready. Auto-saves every 30 seconds."
                : "Update your task information"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Snow removal from driveway"
                  value={formData.title}
                  onChange={(e) => handleFormChange({ title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the task in detail..."
                  value={formData.description}
                  onChange={(e) => handleFormChange({ description: e.target.value })}
                  rows={5}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleFormChange({ category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Saskatoon, SK"
                    value={formData.location}
                    onChange={(e) => handleFormChange({ location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pay_amount">
                    {formData.budget_type === "hourly" ? "Hourly Rate ($) *" : "Total Budget ($) *"}
                  </Label>
                  <Input
                    id="pay_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={formData.budget_type === "hourly" ? "e.g., 25.00" : "e.g., 150.00"}
                    value={formData.pay_amount}
                    onChange={(e) => handleFormChange({ pay_amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget_type">Budget Type *</Label>
                  <Select
                    value={formData.budget_type}
                    onValueChange={(value: "fixed" | "hourly") => handleFormChange({ budget_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="hourly">Hourly Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="estimated_duration">Estimated Duration (hours)</Label>
                  <Input
                    id="estimated_duration"
                    type="number"
                    step="0.5"
                    min="0.5"
                    placeholder="e.g., 2.5"
                    value={formData.estimated_duration}
                    onChange={(e) => handleFormChange({ estimated_duration: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduled_date">Scheduled Date</Label>
                  <Input
                    id="scheduled_date"
                    type="datetime-local"
                    value={formData.scheduled_date}
                    onChange={(e) => handleFormChange({ scheduled_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="tools_provided">Tools Provided</Label>
                    <p className="text-sm text-muted-foreground">
                      Will you provide the necessary tools?
                    </p>
                  </div>
                  <Switch
                    id="tools_provided"
                    checked={formData.tools_provided}
                    onCheckedChange={(checked) => handleFormChange({ tools_provided: checked })}
                  />
                </div>

                {formData.tools_provided && (
                  <div className="space-y-2">
                    <Label htmlFor="tools_description">Tools Description</Label>
                    <Textarea
                      id="tools_description"
                      placeholder="List the tools you'll provide..."
                      value={formData.tools_description}
                      onChange={(e) => handleFormChange({ tools_description: e.target.value })}
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {taskStatus === "draft" ? (
                  <>
                    <Button
                      type="button"
                      onClick={handlePublish}
                      disabled={isSubmitting || isPublishing}
                      className="flex-1"
                    >
                      {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Send className="mr-2 h-4 w-4" />
                      Publish Task
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleSave}
                      disabled={isSubmitting || isPublishing}
                      className="gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Draft
                    </Button>
                  </>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Task
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/my-tasks")}
                  disabled={isSubmitting || isPublishing}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Recurring Task Settings - Only show for published tasks */}
        {taskStatus !== "draft" && id && (
          <div className="mt-6">
            <RecurringTaskForm
              taskId={id}
              taskTitle={formData.title}
              initialRecurrence={recurrence}
              onSave={() => {
                toast({
                  title: "Recurrence updated",
                  description: "Your recurring task settings have been saved.",
                });
              }}
            />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default TaskEdit;