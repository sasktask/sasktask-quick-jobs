import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  CheckSquare, 
  Plus, 
  Camera, 
  Check, 
  X, 
  Loader2, 
  Trash2,
  Image as ImageIcon,
  Clock,
  AlertCircle,
  GripVertical,
  Upload
} from "lucide-react";
import { format } from "date-fns";
import { compressImage } from "@/lib/imageCompression";

interface TaskChecklistManagerProps {
  taskId: string;
  bookingId?: string;
  isTaskGiver: boolean;
  isTaskDoer: boolean;
  onUpdate?: () => void;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  requires_photo: boolean;
  requires_giver_approval: boolean;
  display_order: number;
  created_at: string;
  completion?: {
    id: string;
    status: string;
    photo_url: string | null;
    notes: string | null;
    completed_at: string;
    rejection_reason: string | null;
  } | null;
}

export const TaskChecklistManager = ({
  taskId,
  bookingId,
  isTaskGiver,
  isTaskDoer,
  onUpdate
}: TaskChecklistManagerProps) => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    requires_photo: false,
    requires_giver_approval: true
  });
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [reviewingItem, setReviewingItem] = useState<ChecklistItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchItems();
  }, [taskId, bookingId]);

  const fetchItems = async () => {
    try {
      let query = supabase
        .from('task_checklists')
        .select('*')
        .eq('task_id', taskId)
        .order('display_order', { ascending: true });

      const { data: checklistItems, error } = await query;
      if (error) throw error;

      // Fetch completions if booking exists
      if (bookingId && checklistItems) {
        const { data: completions } = await supabase
          .from('checklist_completions')
          .select('*')
          .eq('booking_id', bookingId);

        const itemsWithCompletions = checklistItems.map(item => ({
          ...item,
          completion: completions?.find(c => c.checklist_id === item.id) || null
        }));

        setItems(itemsWithCompletions);
      } else {
        setItems(checklistItems || []);
      }
    } catch (error) {
      console.error('Error fetching checklist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('task_checklists')
        .insert({
          task_id: taskId,
          created_by: user.id,
          title: newItem.title.trim(),
          description: newItem.description.trim() || null,
          requires_photo: newItem.requires_photo,
          requires_giver_approval: newItem.requires_giver_approval,
          display_order: items.length
        });

      if (error) throw error;

      toast.success('Checklist item added');
      setNewItem({ title: '', description: '', requires_photo: false, requires_giver_approval: true });
      fetchItems();
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add item');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('task_checklists')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast.success('Item deleted');
      fetchItems();
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete item');
    }
  };

  const handleCompleteItem = async (item: ChecklistItem, photoFile?: File) => {
    if (!bookingId) return;

    setUploadingItemId(item.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let photoUrl = null;

      // Upload photo if required and provided
      if (photoFile) {
        const compressed = await compressImage(photoFile);
        const fileName = `${bookingId}/${item.id}/${Date.now()}.jpg`;
        
        const { error: uploadError } = await supabase.storage
          .from('work-evidence')
          .upload(fileName, compressed);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('work-evidence')
          .getPublicUrl(fileName);

        photoUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('checklist_completions')
        .insert({
          checklist_id: item.id,
          booking_id: bookingId,
          completed_by: user.id,
          photo_url: photoUrl,
          status: item.requires_giver_approval ? 'pending' : 'approved'
        });

      if (error) throw error;

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_booking_id: bookingId,
        p_task_id: taskId,
        p_user_id: user.id,
        p_event_type: 'checklist_item_completed',
        p_event_category: 'checklist',
        p_event_data: {
          checklist_id: item.id,
          title: item.title,
          has_photo: !!photoUrl
        }
      });

      toast.success(item.requires_giver_approval 
        ? 'Item completed! Waiting for approval.' 
        : 'Item completed!');
      fetchItems();
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete item');
    } finally {
      setUploadingItemId(null);
    }
  };

  const handleApproveItem = async (item: ChecklistItem) => {
    if (!item.completion) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('checklist_completions')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', item.completion.id);

      if (error) throw error;

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_booking_id: bookingId,
        p_task_id: taskId,
        p_user_id: user.id,
        p_event_type: 'checklist_item_approved',
        p_event_category: 'checklist',
        p_event_data: {
          checklist_id: item.id,
          title: item.title
        }
      });

      toast.success('Item approved!');
      setReviewingItem(null);
      fetchItems();
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve item');
    }
  };

  const handleRejectItem = async (item: ChecklistItem) => {
    if (!item.completion || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('checklist_completions')
        .update({
          status: 'rejected',
          rejected_by: user.id,
          rejected_at: new Date().toISOString(),
          rejection_reason: rejectionReason.trim()
        })
        .eq('id', item.completion.id);

      if (error) throw error;

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_booking_id: bookingId,
        p_task_id: taskId,
        p_user_id: user.id,
        p_event_type: 'checklist_item_rejected',
        p_event_category: 'checklist',
        p_event_data: {
          checklist_id: item.id,
          title: item.title,
          reason: rejectionReason.trim()
        }
      });

      toast.success('Item rejected');
      setReviewingItem(null);
      setRejectionReason("");
      fetchItems();
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject item');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, item: ChecklistItem) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    await handleCompleteItem(item, file);
    e.target.value = '';
  };

  const completedCount = items.filter(i => i.completion?.status === 'approved').length;
  const pendingCount = items.filter(i => i.completion?.status === 'pending').length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  const getStatusBadge = (item: ChecklistItem) => {
    if (!item.completion) {
      return <Badge variant="outline" className="text-muted-foreground">Not Started</Badge>;
    }
    
    switch (item.completion.status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pending Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Rejected</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-card overflow-hidden border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Loading checklist...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass-card overflow-hidden border-border/50">
        <CardHeader className="bg-gradient-to-r from-primary/5 via-transparent to-secondary/5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                  <CheckSquare className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl">Task Checklist</span>
              </CardTitle>
              <CardDescription className="mt-1.5">
                {isTaskGiver ? 'Define requirements for task completion' : 'Complete each item with proof'}
              </CardDescription>
            </div>
            {items.length > 0 && (
              <div className="text-right bg-primary/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-primary/20">
                <span className="text-2xl font-bold text-primary">{completedCount}/{items.length}</span>
                <p className="text-xs text-primary/70">completed</p>
              </div>
            )}
          </div>
          {items.length > 0 && (
            <div className="mt-3">
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {/* Pending approvals notice for task giver */}
          {isTaskGiver && pendingCount > 0 && (
            <div className="flex items-center gap-3 p-4 bg-yellow-100/80 dark:bg-yellow-900/30 backdrop-blur-sm rounded-xl text-sm border border-yellow-200 dark:border-yellow-800/50">
              <div className="h-8 w-8 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </div>
              <span className="text-yellow-800 dark:text-yellow-400 font-medium">
                {pendingCount} item{pendingCount > 1 ? 's' : ''} waiting for your approval
              </span>
            </div>
          )}

          <div className="space-y-3">
            {items.map((item) => (
              <div 
                key={item.id}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl border backdrop-blur-sm transition-all duration-300",
                  item.completion?.status === 'approved' 
                    ? 'bg-green-50/80 dark:bg-green-900/20 border-green-200/50 dark:border-green-700/50' 
                    : item.completion?.status === 'rejected'
                    ? 'bg-red-50/80 dark:bg-red-900/20 border-red-200/50 dark:border-red-700/50'
                    : item.completion?.status === 'pending'
                    ? 'bg-yellow-50/80 dark:bg-yellow-900/20 border-yellow-200/50 dark:border-yellow-700/50'
                    : 'bg-muted/30 border-border/50 hover:border-primary/30 hover:bg-muted/50'
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {item.completion?.status === 'approved' ? (
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  ) : item.completion?.status === 'rejected' ? (
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
                      <X className="h-4 w-4 text-white" />
                    </div>
                  ) : item.completion?.status === 'pending' ? (
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-md">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="h-7 w-7 rounded-lg border-2 border-muted-foreground/30 flex items-center justify-center bg-background/50" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className={`font-medium ${item.completion?.status === 'approved' ? 'line-through text-muted-foreground' : ''}`}>
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.requires_photo && (
                        <Badge variant="outline" className="text-xs">
                          <Camera className="h-3 w-3 mr-1" />
                          Photo
                        </Badge>
                      )}
                      {getStatusBadge(item)}
                    </div>
                  </div>

                  {/* Show photo if uploaded */}
                  {item.completion?.photo_url && (
                    <div className="mt-2">
                      <img 
                        src={item.completion.photo_url} 
                        alt="Completion proof"
                        className="h-20 w-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                        onClick={() => window.open(item.completion!.photo_url!, '_blank')}
                      />
                    </div>
                  )}

                  {/* Rejection reason */}
                  {item.completion?.status === 'rejected' && item.completion.rejection_reason && (
                    <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-sm text-red-800 dark:text-red-300">
                      <strong>Rejected:</strong> {item.completion.rejection_reason}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 mt-2">
                    {/* Task doer: complete item */}
                    {isTaskDoer && !item.completion && (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={(e) => handleFileSelect(e, item)}
                        />
                        {item.requires_photo ? (
                          <Button
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingItemId === item.id}
                          >
                            {uploadingItemId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Camera className="h-4 w-4 mr-2" />
                            )}
                            Complete with Photo
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleCompleteItem(item)}
                            disabled={uploadingItemId === item.id}
                          >
                            {uploadingItemId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Check className="h-4 w-4 mr-2" />
                            )}
                            Mark Complete
                          </Button>
                        )}
                      </>
                    )}

                    {/* Task doer: retry rejected item */}
                    {isTaskDoer && item.completion?.status === 'rejected' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Delete the rejected completion and allow retry
                          supabase
                            .from('checklist_completions')
                            .delete()
                            .eq('id', item.completion!.id)
                            .then(() => fetchItems());
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    )}

                    {/* Task giver: review pending items */}
                    {isTaskGiver && item.completion?.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => setReviewingItem(item)}
                      >
                        Review
                      </Button>
                    )}

                    {/* Task giver: delete item (only if no completion) */}
                    {isTaskGiver && !item.completion && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add new item (task giver only) */}
          {isTaskGiver && (
            <div className="pt-4 border-t space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Checklist Item
              </h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="item-title">Item Title</Label>
                  <Input
                    id="item-title"
                    placeholder="e.g., Clean kitchen counters"
                    value={newItem.title}
                    onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="item-desc">Description (optional)</Label>
                  <Textarea
                    id="item-desc"
                    placeholder="Additional details..."
                    value={newItem.description}
                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="requires-photo"
                      checked={newItem.requires_photo}
                      onCheckedChange={(checked) => setNewItem(prev => ({ ...prev, requires_photo: checked }))}
                    />
                    <Label htmlFor="requires-photo" className="text-sm">Require photo proof</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="requires-approval"
                      checked={newItem.requires_giver_approval}
                      onCheckedChange={(checked) => setNewItem(prev => ({ ...prev, requires_giver_approval: checked }))}
                    />
                    <Label htmlFor="requires-approval" className="text-sm">Require my approval</Label>
                  </div>
                </div>
                <Button
                  onClick={handleAddItem}
                  disabled={isAdding || !newItem.title.trim()}
                  className="w-full"
                >
                  {isAdding && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Add Item
                </Button>
              </div>
            </div>
          )}

          {items.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No checklist items yet</p>
              {isTaskGiver && (
                <p className="text-sm">Add items above to define completion requirements</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!reviewingItem} onOpenChange={() => { setReviewingItem(null); setRejectionReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Completion</DialogTitle>
            <DialogDescription>
              Review the tasker's submission for "{reviewingItem?.title}"
            </DialogDescription>
          </DialogHeader>

          {reviewingItem?.completion?.photo_url && (
            <div className="flex justify-center">
              <img 
                src={reviewingItem.completion.photo_url} 
                alt="Submission"
                className="max-h-64 rounded-lg"
              />
            </div>
          )}

          {reviewingItem?.completion?.notes && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{reviewingItem.completion.notes}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Rejection reason (required if rejecting)</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Explain why this doesn't meet requirements..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => reviewingItem && handleRejectItem(reviewingItem)}
              disabled={!rejectionReason.trim()}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => reviewingItem && handleApproveItem(reviewingItem)}
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Missing import
import { RotateCcw } from "lucide-react";
