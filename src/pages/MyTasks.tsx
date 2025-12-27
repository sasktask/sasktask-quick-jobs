import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Clock, 
  DollarSign, 
  MapPin,
  Loader2,
  Send,
  Copy
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Task = Tables<"tasks">;

export default function MyTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [publishingTaskId, setPublishingTaskId] = useState<string | null>(null);
  const [duplicatingTaskId, setDuplicatingTaskId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("task_giver_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      console.error("Error loading tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTaskId) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", deleteTaskId);

      if (error) throw error;

      toast.success("Task deleted successfully");
      setTasks(tasks.filter(t => t.id !== deleteTaskId));
      setDeleteTaskId(null);
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "cancelled" })
        .eq("id", taskId);

      if (error) throw error;

      toast.success("Task closed successfully");
      loadTasks();
    } catch (error: any) {
      console.error("Error closing task:", error);
      toast.error("Failed to close task");
    }
  };

  const handlePublishDraft = async (taskId: string) => {
    setPublishingTaskId(taskId);
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error("Task not found");

      // Validate minimum requirements for publishing
      if (!task.title || task.title.length < 5) {
        throw new Error("Title must be at least 5 characters");
      }
      if (!task.description || task.description.length < 20 || task.description === "Draft - no description yet") {
        throw new Error("Description must be at least 20 characters");
      }
      if (!task.pay_amount || task.pay_amount <= 0) {
        throw new Error("Pay amount must be positive");
      }

      const { error } = await supabase
        .from("tasks")
        .update({ status: "open" })
        .eq("id", taskId);

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
            taskId: task.id,
            taskTitle: task.title,
            recipientEmail: profile?.email || user.email,
            recipientName: profile?.full_name,
          },
        }).catch(console.error);
      }

      toast.success("Task published successfully!");
      loadTasks();
    } catch (error: any) {
      console.error("Error publishing task:", error);
      toast.error(error.message || "Failed to publish task");
    } finally {
      setPublishingTaskId(null);
    }
  };

  const handleDuplicateTask = async (taskId: string) => {
    setDuplicatingTaskId(taskId);
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error("Task not found");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          task_giver_id: user.id,
          title: `${task.title} (Copy)`,
          description: task.description,
          category: task.category,
          location: task.location,
          pay_amount: task.pay_amount,
          estimated_duration: task.estimated_duration,
          budget_type: task.budget_type,
          tools_provided: task.tools_provided,
          tools_description: task.tools_description,
          status: "draft"
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Task duplicated as draft!");
      loadTasks();
    } catch (error: any) {
      console.error("Error duplicating task:", error);
      toast.error(error.message || "Failed to duplicate task");
    } finally {
      setDuplicatingTaskId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      open: "default",
      in_progress: "secondary",
      completed: "secondary",
      cancelled: "destructive",
      draft: "outline",
    };
    const labels: Record<string, string> = {
      draft: "Draft",
      open: "Open",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  const filterTasks = (status?: string) => {
    if (!status) return tasks;
    return tasks.filter(t => t.status === status);
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl">{task.title}</CardTitle>
            <CardDescription className="mt-2 line-clamp-2">
              {task.description}
            </CardDescription>
          </div>
          <div className="ml-4">
            {getStatusBadge(task.status || "open")}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {task.location}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 mr-2" />
            ${task.pay_amount} {task.budget_type === "hourly" && "/hr"}
          </div>
          {task.estimated_duration && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              {task.estimated_duration} hours
            </div>
          )}
          <div className="flex items-center text-sm text-muted-foreground">
            <Badge variant="outline">{task.category}</Badge>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/tasks/${task.id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          {task.status === "draft" && (
            <Button
              variant="default"
              size="sm"
              onClick={() => handlePublishDraft(task.id)}
              disabled={publishingTaskId === task.id}
            >
              {publishingTaskId === task.id ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Publish
            </Button>
          )}
          {(task.status === "open" || task.status === "draft") && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/tasks/${task.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {task.status === "open" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCloseTask(task.id)}
                >
                  Close
                </Button>
              )}
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDuplicateTask(task.id)}
            disabled={duplicatingTaskId === task.id}
          >
            {duplicatingTaskId === task.id ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            Duplicate
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteTaskId(task.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <>
        <SEOHead
          title="My Tasks - SaskTask"
          description="Manage your posted tasks"
        />

        <div className="container max-w-6xl py-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold">My Tasks</h1>
              <p className="text-muted-foreground mt-2">
                Manage and track your posted tasks
              </p>
            </div>
            <Button onClick={() => navigate("/post-task")}>
              <Plus className="h-4 w-4 mr-2" />
              Post New Task
            </Button>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">
                All ({tasks.length})
              </TabsTrigger>
              <TabsTrigger value="draft">
                Drafts ({filterTasks("draft").length})
              </TabsTrigger>
              <TabsTrigger value="open">
                Open ({filterTasks("open").length})
              </TabsTrigger>
              <TabsTrigger value="in_progress">
                In Progress ({filterTasks("in_progress").length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({filterTasks("completed").length})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled ({filterTasks("cancelled").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid gap-6">
                {tasks.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-muted-foreground mb-4">
                        You haven't posted any tasks yet
                      </p>
                      <Button onClick={() => navigate("/post-task")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Post Your First Task
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  tasks.map(task => <TaskCard key={task.id} task={task} />)
                )}
              </div>
            </TabsContent>

            {["draft", "open", "in_progress", "completed", "cancelled"].map(status => (
              <TabsContent key={status} value={status} className="mt-6">
                <div className="grid gap-6">
                  {filterTasks(status).length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-12">
                        <p className="text-muted-foreground">
                          No {status === "draft" ? "draft" : status.replace("_", " ")} tasks
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    filterTasks(status).map(task => <TaskCard key={task.id} task={task} />)
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the task
                and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    </DashboardLayout>
  );
}
