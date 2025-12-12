import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEOHead } from "@/components/SEOHead";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  MoreVertical,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  pay_amount: number;
  status: string | null;
  priority: string | null;
  created_at: string | null;
  task_giver: { full_name: string | null; email: string } | null;
}

export default function AdminTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; task: Task | null }>({
    open: false,
    task: null,
  });
  const [deleteReason, setDeleteReason] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          task_giver:profiles!tasks_task_giver_id_fkey(full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTasks(data || []);
      
      // Calculate stats
      setStats({
        total: data?.length || 0,
        open: data?.filter(t => t.status === "open").length || 0,
        inProgress: data?.filter(t => t.status === "in_progress").length || 0,
        completed: data?.filter(t => t.status === "completed").length || 0,
      });
    } catch (error: any) {
      console.error("Error loading tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteDialog.task) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", deleteDialog.task.id);

      if (error) throw error;

      toast.success("Task deleted successfully");
      loadTasks();
      setDeleteDialog({ open: false, task: null });
      setDeleteReason("");
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: "open" | "in_progress" | "completed" | "cancelled" | "draft") => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status })
        .eq("id", taskId);

      if (error) throw error;

      toast.success("Task status updated");
      loadTasks();
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "open":
        return "bg-green-600";
      case "in_progress":
        return "bg-blue-600";
      case "completed":
        return "bg-gray-600";
      case "cancelled":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.task_giver?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <SEOHead title="Task Management - Admin" description="Manage platform tasks" />
      <AdminLayout title="Task Management" description="View and manage all platform tasks">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Open
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.open}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, category, or poster..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Posted By</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading tasks...
                    </TableCell>
                  </TableRow>
                ) : filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No tasks found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {task.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{task.category}</Badge>
                      </TableCell>
                      <TableCell>{task.task_giver?.full_name || "N/A"}</TableCell>
                      <TableCell className="max-w-[150px] truncate text-muted-foreground">
                        {task.location}
                      </TableCell>
                      <TableCell className="font-medium">${task.pay_amount}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {task.created_at
                          ? format(new Date(task.created_at), "MMM d, yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/task/${task.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Task
                            </DropdownMenuItem>
                            {task.status !== "completed" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateTaskStatus(task.id, "open")}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Open
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateTaskStatus(task.id, "cancelled")}
                                  className="text-orange-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel Task
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => setDeleteDialog({ open: true, task })}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Delete Task Dialog */}
        <Dialog
          open={deleteDialog.open}
          onOpenChange={(open) => {
            setDeleteDialog({ open, task: deleteDialog.task });
            if (!open) setDeleteReason("");
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Delete Task
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deleteDialog.task?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Reason for deletion (optional)..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              rows={3}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialog({ open: false, task: null });
                  setDeleteReason("");
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteTask}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}
