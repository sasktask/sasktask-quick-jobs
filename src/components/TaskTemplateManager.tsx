import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, FileText, Star, Trash2, Plus } from "lucide-react";

interface TaskTemplate {
  id: string;
  name: string;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  pay_amount: number | null;
  budget_type: string | null;
  estimated_duration: number | null;
  tools_provided: boolean | null;
  tools_description: string | null;
  is_default: boolean | null;
  usage_count: number | null;
}

interface TaskTemplateManagerProps {
  onSelectTemplate: (template: TaskTemplate) => void;
  currentFormData?: {
    title: string;
    description: string;
    category: string;
    location: string;
    pay_amount: string;
    budget_type: string;
    estimated_duration: string;
    tools_provided: boolean;
    tools_description: string;
  };
}

export function TaskTemplateManager({ onSelectTemplate, currentFormData }: TaskTemplateManagerProps) {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_task_templates")
        .select("*")
        .eq("user_id", user.id)
        .order("usage_count", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error("Error loading templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    if (!currentFormData?.title) {
      toast.error("Please fill in at least the task title before saving");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_task_templates")
        .insert({
          user_id: user.id,
          name: templateName.trim(),
          title: currentFormData.title,
          description: currentFormData.description || null,
          category: currentFormData.category || "Other",
          location: currentFormData.location || null,
          pay_amount: currentFormData.pay_amount ? parseFloat(currentFormData.pay_amount) : null,
          budget_type: currentFormData.budget_type,
          estimated_duration: currentFormData.estimated_duration ? parseFloat(currentFormData.estimated_duration) : null,
          tools_provided: currentFormData.tools_provided,
          tools_description: currentFormData.tools_description || null,
        });

      if (error) throw error;

      toast.success("Template saved successfully!");
      setTemplateName("");
      setIsDialogOpen(false);
      loadTemplates();
    } catch (error: any) {
      toast.error(error.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectTemplate = async (template: TaskTemplate) => {
    // Update usage count
    supabase
      .from("user_task_templates")
      .update({ usage_count: (template.usage_count || 0) + 1 })
      .eq("id", template.id)
      .then(() => loadTemplates());

    onSelectTemplate(template);
    toast.success(`Template "${template.name}" applied!`);
  };

  const handleDeleteTemplate = async () => {
    if (!deleteTemplateId) return;

    try {
      const { error } = await supabase
        .from("user_task_templates")
        .delete()
        .eq("id", deleteTemplateId);

      if (error) throw error;

      toast.success("Template deleted");
      setDeleteTemplateId(null);
      loadTemplates();
    } catch (error: any) {
      toast.error("Failed to delete template");
    }
  };

  const handleSetDefault = async (templateId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Clear existing default
      await supabase
        .from("user_task_templates")
        .update({ is_default: false })
        .eq("user_id", user.id);

      // Set new default
      await supabase
        .from("user_task_templates")
        .update({ is_default: true })
        .eq("id", templateId);

      toast.success("Default template updated");
      loadTemplates();
    } catch (error) {
      toast.error("Failed to set default template");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Task Templates
            </CardTitle>
            <CardDescription>Save and reuse task configurations</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Save Current
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save as Template</DialogTitle>
                <DialogDescription>
                  Save your current form as a reusable template
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    placeholder="e.g., Weekly Cleaning Job"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No templates saved yet. Fill out a task and save it as a template!
          </p>
        ) : (
          <div className="space-y-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{template.name}</span>
                    {template.is_default && (
                      <Badge variant="secondary" className="text-xs">Default</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {template.title} • {template.category}
                    {template.pay_amount && ` • $${template.pay_amount}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSetDefault(template.id)}
                    title={template.is_default ? "Default template" : "Set as default"}
                  >
                    <Star className={`h-4 w-4 ${template.is_default ? "fill-yellow-500 text-yellow-500" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTemplateId(template.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!deleteTemplateId} onOpenChange={() => setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}