import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  User
} from "lucide-react";

const TaskDetail = () => {
  const { id } = useParams();
  const [task, setTask] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUserAndFetchTask();
  }, [id]);

  const checkUserAndFetchTask = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData);

      // Fetch task with task giver profile
      const { data: taskData, error } = await supabase
        .from("tasks")
        .select(`
          *,
          profiles!tasks_task_giver_id_fkey (
            full_name,
            avatar_url,
            rating,
            total_reviews,
            bio
          )
        `)
        .eq("id", id)
        .single();

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
    if (profile?.role !== "task_doer") {
      toast({
        title: "Access Denied",
        description: "Only task doers can apply to tasks",
        variant: "destructive",
      });
      return;
    }

    setIsApplying(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const { error } = await supabase
        .from("bookings")
        .insert({
          task_id: id,
          task_doer_id: session?.user.id,
          message: message,
          status: "pending"
        });

      if (error) throw error;

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
                <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {task.category}
                </span>
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

              {profile?.role === "task_doer" && task.status === "open" && (
                <div className="pt-6 border-t">
                  <h3 className="font-semibold text-lg mb-4">Apply for this Task</h3>
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
                      className="w-full"
                      size="lg"
                    >
                      {isApplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Apply Now
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
                <AvatarImage src={task.profiles?.avatar_url} />
                <AvatarFallback className="text-xl">
                  {task.profiles?.full_name?.charAt(0) || <User />}
                </AvatarFallback>
              </Avatar>

              <div>
                <h3 className="font-semibold text-lg">{task.profiles?.full_name || "Anonymous"}</h3>
                {task.profiles?.rating && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-semibold">{task.profiles.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({task.profiles.total_reviews} reviews)
                    </span>
                  </div>
                )}
              </div>

              {task.profiles?.bio && (
                <div className="text-sm text-muted-foreground text-left p-3 bg-muted/50 rounded-lg">
                  <p>{task.profiles.bio}</p>
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
