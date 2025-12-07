import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BlogEditor } from "@/components/BlogEditor";
import { Plus, Search, Edit, Trash2, Calendar, Eye } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { OWNER_USER_ID } from "@/lib/constants";

const AdminBlog = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    if (user.id !== OWNER_USER_ID) {
      toast.error("Access denied. Owner only.");
      navigate("/");
      return;
    }

    setIsAdmin(true);
  };

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-blog-posts", search],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  const handleDelete = async (postId: string) => {
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", postId);

      if (error) throw error;

      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      setDeletePostId(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleSuccess = () => {
    setIsCreating(false);
    setEditingPostId(null);
    queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Checking permissions...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (isCreating || editingPostId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container max-w-5xl mx-auto px-4 py-12">
          <BlogEditor
            postId={editingPostId || undefined}
            onSuccess={handleSuccess}
            onCancel={() => {
              setIsCreating(false);
              setEditingPostId(null);
            }}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold mb-2">Blog Management</h1>
            <p className="text-muted-foreground">Create and manage blog posts</p>
          </div>
          <Button onClick={() => setIsCreating(true)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Posts List */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                {search ? "No posts found matching your search." : "No posts yet. Create your first post!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {posts?.map((post) => (
              <Card key={post.id} className="group">
                {post.cover_image_url && (
                  <div className="relative h-48 overflow-hidden rounded-t-xl">
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <Badge variant={post.status === "published" ? "default" : "secondary"}>
                      {post.status}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {post.published_at
                      ? format(new Date(post.published_at), "MMM dd, yyyy")
                      : "Not scheduled"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPostId(post.id)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeletePostId(post.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The post will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePostId && handleDelete(deletePostId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBlog;
