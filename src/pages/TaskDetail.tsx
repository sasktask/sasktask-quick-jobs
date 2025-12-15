import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  MapPin, 
  DollarSign, 
  Calendar, 
  Wrench, 
  Star,
  Loader2,
  ArrowLeft,
  User,
  Gavel,
  Shield,
  CheckCircle2
} from "lucide-react";
import { z } from "zod";
import { TaskPriorityBadge, type TaskPriority } from "@/components/TaskPriorityBadge";
import { TaskBidding } from "@/components/TaskBidding";
import { DepositPaymentCard } from "@/components/DepositPaymentCard";

const bookingMessageSchema = z.object({
  message: z.string().max(1000, "Message too long (max 1000 characters)").optional(),
});

const TaskDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [task, setTask] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUserAndFetchTask();
  }, [id]);

  // Handle deposit payment confirmation
  useEffect(() => {
    const depositStatus = searchParams.get('deposit');
    if (depositStatus === 'success' && id) {
      confirmDeposit();
    } else if (depositStatus === 'cancelled') {
      toast({
        title: "Payment Cancelled",
        description: "Deposit payment was cancelled.",
        variant: "destructive",
      });
    }
  }, [searchParams, id]);

  const confirmDeposit = async () => {
    try {
      const { error } = await supabase.functions.invoke('confirm-deposit', {
        body: { taskId: id }
      });
      
      if (!error) {
        toast({
          title: "Deposit Confirmed!",
          description: "Your 25% deposit has been paid. Your task is now secured.",
        });
        checkUserAndFetchTask(); // Refresh task data
      }
    } catch (error) {
      console.error('Error confirming deposit:', error);
    }
  };

  const checkUserAndFetchTask = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);

      // Fetch user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      setUserRole(roleData?.role || null);

      // Fetch task with task giver profile (excluding PII)
      const { data: taskData, error } = await supabase
        .from("tasks")
        .select(`
          *,
          public_profiles!tasks_task_giver_id_fkey (
            full_name,
            avatar_url,
            rating,
            total_reviews,
            bio
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      setTask(taskData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/browse");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    if (userRole !== "task_doer") {
      toast({
        title: "Access Denied",
        description: "Only task doers can apply to tasks",
        variant: "destructive",
      });
      return;
    }

    setIsApplying(true);

    try {
      // Validate input
      const validation = bookingMessageSchema.safeParse({ message });

      if (!validation.success) {
        const firstError = validation.error.errors[0];
        throw new Error(firstError.message);
      }

      // Check if this is the first booking for this task
      const { count: existingBookings } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("task_id", id);

      const isFirstBooking = (existingBookings || 0) === 0;

      const { error } = await supabase
        .from("bookings")
        .insert({
          task_id: id,
          task_doer_id: userId,
          message: validation.data.message || null,
          status: "pending"
        });

      if (error) throw error;

      // Send first booking notification if applicable
      if (isFirstBooking && task?.task_giver_id) {
        // Get task giver profile and current user profile
        const [taskGiverResult, currentUserResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", task.task_giver_id)
            .single(),
          supabase
            .from("profiles")
            .select("full_name")
            .eq("id", userId)
            .single()
        ]);

        if (taskGiverResult.data) {
          supabase.functions.invoke("send-task-notification", {
            body: {
              type: "first_booking",
              taskId: id,
              taskTitle: task.title,
              recipientEmail: taskGiverResult.data.email,
              recipientName: taskGiverResult.data.full_name,
              bookerName: currentUserResult.data?.full_name,
            },
          }).catch(console.error);
        }
      }

      toast({
        title: "Success!",
        description: "Your application has been submitted",
      });

      navigate("/bookings");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Task not found</h2>
          <Button onClick={() => navigate("/browse")}>Back to Browse</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Task Details */}
          <Card className="md:col-span-2 border-border">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">{task.title}</CardTitle>
                  <CardDescription>Posted on {new Date(task.created_at).toLocaleDateString()}</CardDescription>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <TaskPriorityBadge priority={(task.priority || 'medium') as TaskPriority} />
                  <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {task.category}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-muted-foreground">{task.description}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Payment</p>
                    <p className="font-bold text-lg">${task.pay_amount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold">{task.location}</p>
                  </div>
                </div>

                {task.scheduled_date && (
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Calendar className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Scheduled</p>
                      <p className="font-semibold">
                        {new Date(task.scheduled_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Wrench className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tools</p>
                    <p className="font-semibold">
                      {task.tools_provided ? "Provided" : "Bring your own"}
                    </p>
                  </div>
                </div>
              </div>

              {task.tools_description && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Tools Information</h3>
                  <p className="text-muted-foreground">{task.tools_description}</p>
                </div>
              )}

              {/* Deposit Payment Section - Show for future tasks */}
              {task.scheduled_date && new Date(task.scheduled_date) > new Date() && (
                <div className="pt-6 border-t">
                  <DepositPaymentCard
                    taskId={task.id}
                    taskTitle={task.title}
                    totalAmount={task.pay_amount}
                    depositPaid={task.deposit_paid}
                    depositAmount={task.deposit_amount}
                    scheduledDate={task.scheduled_date}
                    isTaskOwner={userId === task.task_giver_id}
                    onDepositPaid={checkUserAndFetchTask}
                  />
                </div>
              )}

              {/* Show deposit status badge for all tasks with deposit */}
              {task.deposit_paid && (
                <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-green-700 dark:text-green-400 font-medium">
                    Task secured with 25% deposit (${task.deposit_amount?.toFixed(2)})
                  </span>
                  <Badge className="ml-auto bg-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              )}

              {/* Bidding Section */}
              {task.status === "open" && userId && (
                <div className="pt-6 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    <Gavel className="h-5 w-5" />
                    <h3 className="font-semibold text-lg">Bidding</h3>
                  </div>
                  <TaskBidding
                    taskId={task.id}
                    taskGiverId={task.task_giver_id}
                    currentUserId={userId}
                    userRole={userRole}
                    originalAmount={task.pay_amount}
                  />
                </div>
              )}

              {userRole === "task_doer" && task.status === "open" && (
                <div className="pt-6 border-t">
                  <h3 className="font-semibold text-lg mb-4">Quick Apply (No Bid)</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="message">Message to Task Giver (Optional)</Label>
                      <Textarea
                        id="message"
                        placeholder="Introduce yourself and explain why you're a good fit..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                    <Button
                      onClick={handleApply}
                      disabled={isApplying}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      {isApplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Apply at Posted Rate (${task.pay_amount})
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Task Giver Profile */}
          <Card className="border-border h-fit">
            <CardHeader>
              <CardTitle>Task Giver</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Avatar className="h-20 w-20 mx-auto">
                <AvatarImage src={task.public_profiles?.avatar_url} />
                <AvatarFallback className="text-xl">
                  {task.public_profiles?.full_name?.charAt(0) || <User />}
                </AvatarFallback>
              </Avatar>

              <div>
                <h3 className="font-semibold text-lg">{task.public_profiles?.full_name || "Anonymous"}</h3>
                {task.public_profiles?.rating && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-semibold">{task.public_profiles.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({task.public_profiles.total_reviews} reviews)
                    </span>
                  </div>
                )}
              </div>

              {task.public_profiles?.bio && (
                <div className="text-sm text-muted-foreground text-left p-3 bg-muted/50 rounded-lg">
                  <p>{task.public_profiles.bio}</p>
                  <p className="text-xs mt-2 opacity-75">
                    Contact information is private until booking is accepted
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TaskDetail;
