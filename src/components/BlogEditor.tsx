import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface BlogEditorProps {
  postId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  status: "draft" | "published";
  published_at: string;
}

export const BlogEditor = ({ postId, onSuccess, onCancel }: BlogEditorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewTab, setPreviewTab] = useState<"edit" | "preview">("edit");
  const { register, handleSubmit, watch, setValue, reset } = useForm<BlogFormData>({
    defaultValues: {
      status: "draft",
      published_at: new Date().toISOString().slice(0, 16),
    },
  });

  const watchTitle = watch("title");
  const watchContent = watch("content");
  const watchCoverImage = watch("cover_image_url");

  // Auto-generate slug from title
  useEffect(() => {
    if (watchTitle && !postId) {
      const slug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", slug);
    }
  }, [watchTitle, setValue, postId]);

  // Load post data if editing
  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (error) throw error;
      if (data) {
        reset({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || "",
          content: data.content,
          cover_image_url: data.cover_image_url || "",
          status: data.status as "draft" | "published",
          published_at: data.published_at
            ? new Date(data.published_at).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
        });
      }
    } catch (error) {
      console.error("Error loading post:", error);
      toast.error("Failed to load post");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("blog-images")
        .getPublicUrl(filePath);

      setValue("cover_image_url", publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const removeCoverImage = async () => {
    const currentUrl = watchCoverImage;
    if (!currentUrl) return;

    try {
      // Extract file path from URL
      const urlParts = currentUrl.split("/blog-images/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("blog-images").remove([filePath]);
      }
      setValue("cover_image_url", "");
      toast.success("Cover image removed");
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image");
    }
  };

  const onSubmit = async (data: BlogFormData) => {
    setIsLoading(true);
    try {
      const postData = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: data.content,
        cover_image_url: data.cover_image_url || null,
        status: data.status,
        published_at: data.status === "published" ? data.published_at : null,
        author_id: (await supabase.auth.getUser()).data.user?.id,
      };

      if (postId) {
        const { error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", postId);

        if (error) throw error;
        toast.success("Post updated successfully");
      } else {
        const { error } = await supabase.from("blog_posts").insert(postData);

        if (error) throw error;
        toast.success("Post created successfully");
      }

      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving post:", error);
      toast.error(error.message || "Failed to save post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{postId ? "Edit Post" : "Create New Post"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title", { required: true })}
              placeholder="Enter post title"
            />
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              {...register("slug", { required: true })}
              placeholder="post-url-slug"
            />
          </div>

          {/* Excerpt */}
          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              {...register("excerpt")}
              placeholder="Brief summary (optional)"
              rows={3}
            />
          </div>

          {/* Cover Image */}
          <div>
            <Label>Cover Image</Label>
            {watchCoverImage ? (
              <div className="relative mt-2">
                <img
                  src={watchCoverImage}
                  alt="Cover"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeCoverImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="mt-2">
                <Label
                  htmlFor="cover-upload"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/10"
                >
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2" />
                      <span className="text-sm">Click to upload cover image</span>
                    </div>
                  )}
                </Label>
                <Input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </div>
            )}
          </div>

          {/* Content with Preview */}
          <div>
            <Label>Content (Markdown) *</Label>
            <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as any)} className="mt-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="mt-2">
                <Textarea
                  {...register("content", { required: true })}
                  placeholder="Write your post content in markdown..."
                  rows={15}
                  className="font-mono text-sm"
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-2">
                <div className="border rounded-lg p-4 min-h-[400px] prose prose-sm max-w-none dark:prose-invert">
                  {watchContent ? (
                    <ReactMarkdown>{watchContent}</ReactMarkdown>
                  ) : (
                    <p className="text-muted-foreground">Nothing to preview yet...</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Status & Publish Date */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select onValueChange={(v) => setValue("status", v as any)} defaultValue="draft">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="published_at">Publish Date & Time</Label>
              <Input
                id="published_at"
                type="datetime-local"
                {...register("published_at")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {postId ? "Update Post" : "Create Post"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
