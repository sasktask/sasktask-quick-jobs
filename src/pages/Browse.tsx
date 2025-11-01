import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Search, MapPin, DollarSign, Calendar, Briefcase, Wrench } from "lucide-react";

const Browse = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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
    checkAuthAndFetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [searchTerm, categoryFilter, tasks]);

  const checkAuthAndFetchTasks = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      fetchTasks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          profiles!tasks_task_giver_id_fkey (
            full_name,
            rating,
            avatar_url
          )
        `)
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
      setFilteredTasks(data || []);
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

  const filterTasks = () => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(task => task.category === categoryFilter);
    }

    setFilteredTasks(filtered);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Available Tasks</h1>
          <p className="text-muted-foreground">Find your next opportunity</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 border-border">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="border-border hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-2xl font-bold mb-1">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Posted by {task.profiles?.full_name || "Anonymous"}
                            {task.profiles?.rating && (
                              <span className="ml-2">⭐ {task.profiles.rating.toFixed(1)}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">{task.description}</p>
                      
                      <div className="grid sm:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{task.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-secondary" />
                          <span className="font-semibold">${task.pay_amount}</span>
                        </div>
                        {task.scheduled_date && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-accent" />
                            <span>{new Date(task.scheduled_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Wrench className="h-4 w-4 text-muted-foreground" />
                          <span>{task.tools_provided ? "Tools provided" : "Bring your tools"}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {task.category}
                        </span>
                        <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium">
                          {task.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2 md:justify-center">
                      <Button 
                        onClick={() => navigate(`/task/${task.id}`)}
                        className="flex-1 md:flex-none"
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/task/${task.id}`)}
                        className="flex-1 md:flex-none"
                      >
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Browse;
