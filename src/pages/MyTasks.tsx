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
  Loader2 
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Task = Tables<"tasks">;

export default function MyTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      open: "default",
      in_progress: "secondary",
      completed: "secondary",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
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
          {task.status === "open" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/tasks/${task.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCloseTask(task.id)}
              >
                Close
              </Button>
            </>
          )}
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
    <>
      <SEOHead
        title="My Tasks - SaskTask"
        description="Manage your posted tasks"
      />

      <div className="min-h-screen bg-background py-12">
        <div className="container max-w-6xl">
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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">
                All ({tasks.length})
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

            {["open", "in_progress", "completed", "cancelled"].map(status => (
              <TabsContent key={status} value={status} className="mt-6">
                <div className="grid gap-6">
                  {filterTasks(status).length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-12">
                        <p className="text-muted-foreground">
                          No {status} tasks
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
  );
}
