import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Briefcase, 
  DollarSign, 
  Star, 
  TrendingUp,
  Plus,
  Search,
  User,
  MapPin
} from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();
      
      setUserRole(roleData?.role || null);

      // Fetch tasks based on role
      if (roleData?.role === "task_giver") {
        const { data: tasksData } = await supabase
          .from("tasks")
          .select("*")
          .eq("task_giver_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(5);
        setTasks(tasksData || []);
      } else {
        const { data: tasksData } = await supabase
          .from("tasks")
          .select("*")
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(5);
        setTasks(tasksData || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {profile?.full_name || user?.email}!
            </h1>
            <p className="text-muted-foreground">
              {userRole === "task_giver" ? "Manage your tasks" : "Find your next opportunity"}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/profile">
              <Button variant="outline">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-3xl font-bold">{profile?.rating?.toFixed(1) || "0.0"}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Star className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                  <p className="text-3xl font-bold">{profile?.total_reviews || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {userRole === "task_giver" ? "Posted Tasks" : "Completed Tasks"}
                  </p>
                  <p className="text-3xl font-bold">{tasks.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Earnings</p>
                  <p className="text-3xl font-bold">$0</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {userRole === "task_giver" ? (
            <Link to="/post-task">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-primary/50 h-full">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Post a New Task</h3>
                  <p className="text-muted-foreground">Get help with your tasks quickly</p>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <Link to="/browse">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-primary/50 h-full">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Browse Available Tasks</h3>
                  <p className="text-muted-foreground">Find your next opportunity</p>
                </CardContent>
              </Card>
            </Link>
          )}

          <Link to="/bookings">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-secondary/50 h-full">
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">View Bookings</h3>
                <p className="text-muted-foreground">Manage your task bookings</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Tasks */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {userRole === "task_giver" ? "Your Recent Tasks" : "Available Tasks - Accept Instantly"}
              {userRole === "task_doer" && (
                <span className="text-sm font-normal text-muted-foreground">
                  (Like Uber - One Tap Accept)
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {userRole === "task_giver" 
                ? "Manage your posted tasks" 
                : "Browse and instantly accept tasks near you"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tasks available yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card key={task.id} className="border-border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-1">{task.title}</h4>
                          <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{task.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                              {task.category}
                            </span>
                            <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-bold">
                              ${task.pay_amount}
                            </span>
                            <span className="px-3 py-1 bg-muted text-foreground rounded-full text-xs flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {task.location}
                            </span>
                          </div>
                        </div>
                        {userRole === "task_doer" ? (
                          <Button 
                            variant="default" 
                            size="lg"
                            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 font-bold shrink-0"
                            onClick={() => navigate(`/task/${task.id}`)}
                          >
                            Accept Task
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/task/${task.id}`)}
                          >
                            View Details
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
