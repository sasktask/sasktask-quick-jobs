import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, 
  FileJson, 
  FileSpreadsheet, 
  Shield, 
  CheckCircle2,
  Loader2,
  Database,
  User,
  MessageSquare,
  CreditCard,
  Star,
  Briefcase,
  Clock,
  Info,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DataExportSettingsProps {
  userId: string;
}

const DATA_CATEGORIES = [
  { id: 'profile', label: 'Profile Information', icon: User, description: 'Name, email, bio, skills, etc.' },
  { id: 'tasks', label: 'Tasks & Bookings', icon: Briefcase, description: 'Tasks created and bookings made' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, description: 'All sent messages' },
  { id: 'payments', label: 'Payment History', icon: CreditCard, description: 'Payments made and received' },
  { id: 'reviews', label: 'Reviews', icon: Star, description: 'Reviews given and received' },
  { id: 'activity', label: 'Activity & Login History', icon: Clock, description: 'Login history and activity logs' },
];

export const DataExportSettings = ({ userId }: DataExportSettingsProps) => {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastExport, setLastExport] = useState<Date | null>(() => {
    const stored = localStorage.getItem(`last_data_export_${userId}`);
    return stored ? new Date(stored) : null;
  });

  const handleExport = async () => {
    setExporting(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error('Please log in to export your data');
        return;
      }

      const response = await supabase.functions.invoke('export-user-data', {
        body: { format },
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Create and download the file
      const blob = new Blob(
        [typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)],
        { type: format === 'json' ? 'application/json' : 'text/csv' }
      );
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sasktask-data-export-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Save last export time
      const now = new Date();
      setLastExport(now);
      localStorage.setItem(`last_data_export_${userId}`, now.toISOString());

      toast.success('Data exported successfully!');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || 'Failed to export data');
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500/5 via-blue-500/10 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="h-6 w-6 text-blue-500" />
            </motion.div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Export Your Data
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                  <Shield className="h-3 w-3 mr-1" />
                  GDPR
                </Badge>
              </CardTitle>
              <CardDescription>
                Download all your personal data in your preferred format
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {/* Data Categories */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data Included in Export
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DATA_CATEGORIES.map((category) => (
              <motion.div
                key={category.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                whileHover={{ scale: 1.01 }}
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <category.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{category.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{category.description}</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Format Selection */}
        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export Format
          </Label>
          <RadioGroup
            value={format}
            onValueChange={(v) => setFormat(v as 'json' | 'csv')}
            className="grid grid-cols-2 gap-4"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Label
                htmlFor="json"
                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  format === 'json' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="json" id="json" />
                <FileJson className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium">JSON</p>
                  <p className="text-xs text-muted-foreground">Structured data format</p>
                </div>
              </Label>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Label
                htmlFor="csv"
                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  format === 'csv' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="csv" id="csv" />
                <FileSpreadsheet className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">CSV</p>
                  <p className="text-xs text-muted-foreground">Spreadsheet compatible</p>
                </div>
              </Label>
            </motion.div>
          </RadioGroup>
        </div>

        <Separator />

        {/* Export Progress */}
        <AnimatePresence>
          {exporting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Exporting your data...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export Button & Status */}
        <div className="flex items-center justify-between">
          <div>
            {lastExport && (
              <p className="text-xs text-muted-foreground">
                Last export: {lastExport.toLocaleDateString()} at {lastExport.toLocaleTimeString()}
              </p>
            )}
          </div>
          
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export Data
              </>
            )}
          </Button>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20"
        >
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-600 dark:text-blue-400">
                Your Data Rights (GDPR)
              </p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• You have the right to access all your personal data</li>
                <li>• Export includes all data we store about you</li>
                <li>• Sensitive data like passwords is never included</li>
                <li>• You can request data deletion from Account Settings</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};
