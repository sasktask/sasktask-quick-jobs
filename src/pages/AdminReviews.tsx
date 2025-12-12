import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Star, Trash2, Search, CheckCircle, XCircle, Flag, MessageSquare } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminReviews = () => {
  const [search, setSearch] = useState("");
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const [flagReviewId, setFlagReviewId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin-reviews", search],
    queryFn: async () => {
      let query = supabase
        .from("reviews")
        .select(`
          *,
          reviewer:reviewer_id(full_name, email, avatar_url),
          reviewee:reviewee_id(full_name, email, avatar_url),
          task:task_id(title)
        `)
        .order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      
      // Filter by search term if provided
      if (search) {
        return (data || []).filter((review: any) =>
          review.reviewer?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          review.reviewee?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          review.comment?.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      return data || [];
    },
  });

  const handleDelete = async (reviewId: string) => {
    try {
      const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
      if (error) throw error;

      toast.success("Review deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      setDeleteReviewId(null);
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const handleVerify = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ verified: true })
        .eq("id", reviewId);

      if (error) throw error;
      toast.success("Review verified");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    } catch (error) {
      toast.error("Failed to verify review");
    }
  };

  const handleUnverify = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ verified: false })
        .eq("id", reviewId);

      if (error) throw error;
      toast.success("Verification removed");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    } catch (error) {
      toast.error("Failed to update review");
    }
  };

  const verifiedReviews = reviews?.filter((r: any) => r.verified) || [];
  const unverifiedReviews = reviews?.filter((r: any) => !r.verified) || [];
  const lowRatingReviews = reviews?.filter((r: any) => r.rating <= 2) || [];

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const ReviewCard = ({ review }: { review: any }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {renderStars(review.rating)}
              {review.verified && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              )}
              {review.rating <= 2 && (
                <Badge variant="destructive">Low Rating</Badge>
              )}
            </div>

            <div className="mb-3">
              <p className="text-sm">
                <span className="font-medium">{review.reviewer?.full_name || "Unknown"}</span>
                <span className="text-muted-foreground"> reviewed </span>
                <span className="font-medium">{review.reviewee?.full_name || "Unknown"}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Task: {review.task?.title || "Unknown"}
              </p>
            </div>

            {review.comment && (
              <p className="text-sm text-muted-foreground mb-3 bg-muted p-3 rounded-lg">
                "{review.comment}"
              </p>
            )}

            {review.response && (
              <div className="text-sm bg-primary/5 p-3 rounded-lg mb-3">
                <p className="font-medium text-xs text-primary mb-1">Response:</p>
                <p className="text-muted-foreground">{review.response}</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {new Date(review.created_at).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {review.verified ? (
              <Button size="sm" variant="outline" onClick={() => handleUnverify(review.id)}>
                <XCircle className="h-4 w-4 mr-1" />
                Unverify
              </Button>
            ) : (
              <Button size="sm" variant="default" onClick={() => handleVerify(review.id)}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Verify
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDeleteReviewId(review.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout title="Reviews Management" description="Manage and moderate user reviews">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{verifiedReviews.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <XCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{unverifiedReviews.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Ratings</CardTitle>
            <Flag className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowRatingReviews.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative w-full md:max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search reviews..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Reviews Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All ({reviews?.length || 0})</TabsTrigger>
          <TabsTrigger value="verified">Verified ({verifiedReviews.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({unverifiedReviews.length})</TabsTrigger>
          <TabsTrigger value="low">Low Ratings ({lowRatingReviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <p>Loading...</p>
          ) : reviews?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No reviews found
              </CardContent>
            </Card>
          ) : (
            reviews?.map((review: any) => <ReviewCard key={review.id} review={review} />)
          )}
        </TabsContent>

        <TabsContent value="verified" className="space-y-4">
          {verifiedReviews.map((review: any) => <ReviewCard key={review.id} review={review} />)}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {unverifiedReviews.map((review: any) => <ReviewCard key={review.id} review={review} />)}
        </TabsContent>

        <TabsContent value="low" className="space-y-4">
          {lowRatingReviews.map((review: any) => <ReviewCard key={review.id} review={review} />)}
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteReviewId} onOpenChange={() => setDeleteReviewId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this review. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteReviewId && handleDelete(deleteReviewId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminReviews;
