import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileJson, Loader2, Database } from "lucide-react";

interface DataSettingsProps {
  user: any;
}

export const DataSettings = ({ user }: DataSettingsProps) => {
  const [exporting, setExporting] = useState(false);

  const exportUserData = async () => {
    setExporting(true);
    try {
      // Fetch all user-related data
      const [
        { data: profile },
        { data: tasks },
        { data: bookings },
        { data: reviews },
        { data: messages },
        { data: favorites },
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("tasks").select("*").eq("task_giver_id", user.id),
        supabase.from("bookings").select("*").eq("task_doer_id", user.id),
        supabase.from("reviews").select("*").eq("reviewer_id", user.id),
        supabase.from("messages").select("*").eq("sender_id", user.id),
        supabase.from("favorites").select("*").eq("user_id", user.id),
      ]);

      // Compile data export
      const exportData = {
        export_date: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
        profile: profile || {},
        tasks: tasks || [],
        bookings: bookings || [],
        reviews: reviews || [],
        messages: messages || [],
        favorites: favorites || [],
        metadata: {
          description: "SaskTask User Data Export",
          version: "1.0",
          generated_by: "SaskTask Account Settings",
          note: "This file contains all personal data associated with your SaskTask account as of the export date.",
        },
      };

      // Create downloadable JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `sasktask-data-export-${user.id}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Your data has been exported successfully!");
    } catch (error: any) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data & Privacy
        </CardTitle>
        <CardDescription>
          Export your data and manage your privacy settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Export Section */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Export Your Data</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Download a complete copy of your SaskTask data in JSON format. This includes your profile, tasks, bookings, reviews, messages, and more.
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <FileJson className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h5 className="font-medium text-sm mb-1">JSON Data Export</h5>
                <p className="text-xs text-muted-foreground mb-3">
                  Your data will be generated on-demand and downloaded as a JSON file to your device. The export includes:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Profile information (name, email, avatar, etc.)</li>
                  <li>All tasks you've created or worked on</li>
                  <li>Booking history and messages</li>
                  <li>Reviews you've given and received</li>
                  <li>Account settings and preferences</li>
                </ul>
              </div>
            </div>

            <Button 
              onClick={exportUserData} 
              disabled={exporting}
              className="w-full sm:w-auto"
            >
              {exporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Export...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export My Data
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Data Generation Explanation */}
        <div className="border-t pt-6">
          <h4 className="font-medium mb-2">How Data Export Works</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Generation:</strong> When you click "Export My Data", we query our database in real-time to collect all information associated with your account.
            </p>
            <p>
              <strong>Format:</strong> The data is compiled into a structured JSON file that's both human-readable and machine-parseable.
            </p>
            <p>
              <strong>Storage:</strong> The export file is generated on-demand and immediately downloaded to your device. We don't store export files on our servers.
            </p>
            <p>
              <strong>Privacy:</strong> Only you can access your data export. The download happens directly from your browser without passing through additional servers.
            </p>
          </div>
        </div>

        {/* Privacy Information */}
        <div className="border-t pt-6">
          <h4 className="font-medium mb-2">Data Privacy</h4>
          <p className="text-sm text-muted-foreground">
            We take your privacy seriously. You have full control over your data and can export or delete it at any time. For more information, please review our{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
