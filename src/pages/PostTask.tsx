import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Loader2 } from "lucide-react";

const PostTask = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    pay_amount: "",
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
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);

      // Check if user is task_giver
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role !== "task_giver") {
        toast({
          title: "Access Denied",
          description: "Only task givers can post tasks",
          variant: "destructive",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to post a task",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("tasks")
        .insert({
          task_giver_id: userId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          pay_amount: parseFloat(formData.pay_amount),
          scheduled_date: formData.scheduled_date || null,
          tools_provided: formData.tools_provided,
          tools_description: formData.tools_description || null,
          status: "open"
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your task has been posted successfully",
      });

      navigate("/dashboard");
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Post a New Task</h1>
          <p className="text-muted-foreground">Fill in the details to find the right person for your task</p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
            <CardDescription>Provide clear information to attract qualified task doers</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Snow removal from driveway"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the task in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
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
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pay_amount">Pay Amount ($) *</Label>
                  <Input
                    id="pay_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 50.00"
                    value={formData.pay_amount}
                    onChange={(e) => setFormData({ ...formData, pay_amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduled_date">Scheduled Date</Label>
                  <Input
                    id="scheduled_date"
                    type="datetime-local"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
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
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, tools_provided: checked })
                    }
                  />
                </div>

                {formData.tools_provided && (
                  <div className="space-y-2">
                    <Label htmlFor="tools_description">Tools Description</Label>
                    <Textarea
                      id="tools_description"
                      placeholder="List the tools you'll provide..."
                      value={formData.tools_description}
                      onChange={(e) => setFormData({ ...formData, tools_description: e.target.value })}
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Post Task
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default PostTask;
