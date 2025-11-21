import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, CheckCircle, Clock, DollarSign, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Milestone {
  id?: string;
  title: string;
  description: string;
  amount: number;
  milestone_order: number;
  status?: string;
  due_date?: string;
}

interface MilestoneManagerProps {
  taskId: string;
  isTaskGiver: boolean;
  totalTaskAmount: number;
}

export const MilestoneManager = ({ taskId, isTaskGiver, totalTaskAmount }: MilestoneManagerProps) => {
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newMilestone, setNewMilestone] = useState<Milestone>({
    title: "",
    description: "",
    amount: 0,
    milestone_order: 1,
  });

  useEffect(() => {
    fetchMilestones();
  }, [taskId]);

  const fetchMilestones = async () => {
    const { data, error } = await supabase
      .from("task_milestones")
      .select("*")
      .eq("task_id", taskId)
      .order("milestone_order");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load milestones",
        variant: "destructive",
      });
    } else {
      setMilestones(data || []);
    }
  };

  const addMilestone = async () => {
    if (!newMilestone.title || newMilestone.amount <= 0) {
      toast({
        title: "Invalid Milestone",
        description: "Please provide a title and valid amount",
        variant: "destructive",
      });
      return;
    }

    const totalAllocated = milestones.reduce((sum, m) => sum + Number(m.amount), 0) + newMilestone.amount;
    if (totalAllocated > totalTaskAmount) {
      toast({
        title: "Amount Exceeded",
        description: `Total milestone amount cannot exceed $${totalTaskAmount}`,
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("task_milestones").insert({
      task_id: taskId,
      ...newMilestone,
      milestone_order: milestones.length + 1,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Milestone Added",
        description: "Milestone has been added successfully",
      });
      setIsAdding(false);
      setNewMilestone({ title: "", description: "", amount: 0, milestone_order: 1 });
      fetchMilestones();
    }
  };

  const deleteMilestone = async (id: string) => {
    const { error } = await supabase.from("task_milestones").delete().eq("id", id);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Milestone Deleted",
        description: "Milestone has been removed",
      });
      fetchMilestones();
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" as const },
      in_progress: { label: "In Progress", variant: "default" as const },
      completed: { label: "Completed", variant: "outline" as const },
      paid: { label: "Paid", variant: "default" as const },
      released: { label: "Released", variant: "default" as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const totalAllocated = milestones.reduce((sum, m) => sum + Number(m.amount), 0);
  const remaining = totalTaskAmount - totalAllocated;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Milestones
          </CardTitle>
          {isTaskGiver && (
            <Button onClick={() => setIsAdding(!isAdding)} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Total: ${totalTaskAmount.toFixed(2)} | Allocated: ${totalAllocated.toFixed(2)} | Remaining: ${remaining.toFixed(2)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <Card className="border-primary">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Milestone Title</Label>
                <Input
                  placeholder="e.g., Initial Setup"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="What needs to be completed for this milestone?"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Amount ($)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newMilestone.amount || ""}
                  onChange={(e) => setNewMilestone({ ...newMilestone, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addMilestone} className="flex-1">Add Milestone</Button>
                <Button onClick={() => setIsAdding(false)} variant="outline" className="flex-1">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {milestones.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No milestones created yet</p>
            <p className="text-sm">Break down the task into smaller payments for better tracking</p>
          </div>
        ) : (
          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <Card key={milestone.id} className="border-border">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">#{index + 1}</span>
                        <h4 className="font-semibold">{milestone.title}</h4>
                        {getStatusBadge(milestone.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">${Number(milestone.amount).toFixed(2)}</span>
                      {isTaskGiver && milestone.status === "pending" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => milestone.id && deleteMilestone(milestone.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {milestone.status === "completed" && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mt-2">
                      <CheckCircle className="h-4 w-4" />
                      Completed
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
