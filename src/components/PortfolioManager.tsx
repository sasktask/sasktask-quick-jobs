import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Star, Calendar, User, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PortfolioItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  images: string[];
  completed_date: string | null;
  client_name: string | null;
  is_featured: boolean;
  created_at: string;
}

interface PortfolioManagerProps {
  userId: string;
  isOwnProfile: boolean;
}

const categories = [
  "Cleaning",
  "Moving",
  "Handyman",
  "Plumbing",
  "Electrical",
  "Painting",
  "Gardening",
  "Assembly",
  "Delivery",
  "Other",
];

export const PortfolioManager = ({ userId, isOwnProfile }: PortfolioManagerProps) => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    completed_date: "",
    client_name: "",
    is_featured: false,
  });

  useEffect(() => {
    loadPortfolio();
  }, [userId]);

  const loadPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("user_id", userId)
        .order("is_featured", { ascending: false })
        .order("completed_date", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Error loading portfolio:", error);
      toast.error("Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.from("portfolio_items").insert({
        user_id: userId,
        ...formData,
      });

      if (error) throw error;

      toast.success("Portfolio item added successfully");
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        category: "",
        completed_date: "",
        client_name: "",
        is_featured: false,
      });
      loadPortfolio();
    } catch (error: any) {
      console.error("Error adding portfolio item:", error);
      toast.error("Failed to add portfolio item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("portfolio_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Portfolio item deleted");
      loadPortfolio();
    } catch (error: any) {
      console.error("Error deleting portfolio item:", error);
      toast.error("Failed to delete portfolio item");
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("portfolio_items")
        .update({ is_featured: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast.success(currentStatus ? "Removed from featured" : "Added to featured");
      loadPortfolio();
    } catch (error: any) {
      console.error("Error updating featured status:", error);
      toast.error("Failed to update featured status");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Work Portfolio</h2>
          <p className="text-muted-foreground">
            {isOwnProfile ? "Showcase your completed work" : "View completed projects"}
          </p>
        </div>
        {isOwnProfile && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Portfolio Item</DialogTitle>
                <DialogDescription>
                  Showcase a completed project to attract more clients
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g., Complete Home Renovation"
                  />
                </div>

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
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the project..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Client Name</Label>
                    <Input
                      id="client_name"
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="completed_date">Completion Date</Label>
                    <Input
                      id="completed_date"
                      type="date"
                      value={formData.completed_date}
                      onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_featured" className="cursor-pointer">
                    Feature this project
                  </Label>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Project"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              {isOwnProfile ? "No portfolio items yet. Add your first project!" : "No portfolio items to display"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="relative hover:shadow-lg transition-shadow">
              {item.is_featured && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-yellow-500">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                </div>
              )}
              <CardHeader>
                <Badge variant="outline" className="w-fit mb-2">
                  {item.category}
                </Badge>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                {item.description && (
                  <CardDescription className="line-clamp-3">
                    {item.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {item.client_name && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {item.client_name}
                    </div>
                  )}
                  {item.completed_date && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(item.completed_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {isOwnProfile && (
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleFeatured(item.id, item.is_featured)}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      {item.is_featured ? "Unfeature" : "Feature"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
