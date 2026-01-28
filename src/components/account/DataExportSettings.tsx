import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  FileText,
  History,
  Eye,
  Calendar,
  Bell,
  Lock,
  Award,
  Heart,
  Search,
  AlertTriangle,
  Package,
  MapPin,
  FileCheck,
  Settings,
  Trash2,
  RefreshCw,
  ChevronRight,
  CheckCircle,
  XCircle,
  Archive,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format as formatDate, formatDistanceToNow } from "date-fns";

interface DataExportSettingsProps {
  userId: string;
}

interface DataCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  count?: number;
  estimatedSize?: string;
  sensitive?: boolean;
}

interface ExportRecord {
  id: string;
  date: Date;
  format: 'json' | 'csv';
  categories: string[];
  size: string;
  status: 'completed' | 'failed' | 'expired';
}

const DATA_CATEGORIES: DataCategory[] = [
  { id: 'profile', label: 'Profile Information', icon: User, description: 'Name, email, bio, skills, preferences', sensitive: false },
  { id: 'tasks', label: 'Tasks Created', icon: Briefcase, description: 'All tasks you have posted', sensitive: false },
  { id: 'bookings', label: 'Bookings & Jobs', icon: Calendar, description: 'Bookings made and jobs completed', sensitive: false },
  { id: 'messages', label: 'Messages', icon: MessageSquare, description: 'All sent and received messages', sensitive: true },
  { id: 'payments', label: 'Payment History', icon: CreditCard, description: 'Payments made and received', sensitive: true },
  { id: 'reviews', label: 'Reviews', icon: Star, description: 'Reviews given and received', sensitive: false },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'All notification history', sensitive: false },
  { id: 'badges', label: 'Badges & Achievements', icon: Award, description: 'Earned badges and milestones', sensitive: false },
  { id: 'certificates', label: 'Certificates', icon: FileCheck, description: 'Professional certifications', sensitive: false },
  { id: 'portfolio', label: 'Portfolio', icon: Package, description: 'Portfolio items and projects', sensitive: false },
  { id: 'favorites', label: 'Favorites', icon: Heart, description: 'Saved taskers and items', sensitive: false },
  { id: 'savedSearches', label: 'Saved Searches', icon: Search, description: 'Your saved search filters', sensitive: false },
  { id: 'availability', label: 'Availability', icon: MapPin, description: 'Availability slots and schedule', sensitive: false },
  { id: 'disputes', label: 'Disputes', icon: AlertTriangle, description: 'Dispute history and resolutions', sensitive: true },
  { id: 'loginHistory', label: 'Login History', icon: Lock, description: 'Login attempts and security events', sensitive: true },
  { id: 'payoutAccounts', label: 'Payout Accounts', icon: CreditCard, description: 'Connected payout methods (sanitized)', sensitive: true },
];

const EXPORT_HISTORY_KEY = 'data_export_history';

export const DataExportSettings = ({ userId }: DataExportSettingsProps) => {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    DATA_CATEGORIES.map(c => c.id)
  );
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [includeSensitive, setIncludeSensitive] = useState(true);
  const [anonymizeData, setAnonymizeData] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [activeTab, setActiveTab] = useState('export');

  // Load export history and data counts
  useEffect(() => {
    loadExportHistory();
    loadDataCounts();
  }, [userId]);

  const loadExportHistory = () => {
    try {
      const stored = localStorage.getItem(`${EXPORT_HISTORY_KEY}_${userId}`);
      if (stored) {
        const history = JSON.parse(stored).map((h: any) => ({
          ...h,
          date: new Date(h.date)
        }));
        setExportHistory(history);
      }
    } catch (e) {
      console.error('Failed to load export history:', e);
    }
  };

  const saveExportToHistory = (record: ExportRecord) => {
    const updated = [record, ...exportHistory].slice(0, 10); // Keep last 10
    setExportHistory(updated);
    localStorage.setItem(`${EXPORT_HISTORY_KEY}_${userId}`, JSON.stringify(updated));
  };

  const loadDataCounts = async () => {
    setLoadingCounts(true);
    try {
      const counts: Record<string, number> = {};
      
      // Fetch counts from various tables
      const [
        { count: tasksCount },
        { count: bookingsCount },
        { count: messagesCount },
        { count: paymentsCount },
        { count: reviewsCount },
        { count: badgesCount },
        { count: notificationsCount }
      ] = await Promise.all([
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('task_giver_id', userId),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('task_doer_id', userId),
        supabase.from('messages').select('*', { count: 'exact', head: true }).eq('sender_id', userId),
        supabase.from('payments').select('*', { count: 'exact', head: true }).or(`payer_id.eq.${userId},payee_id.eq.${userId}`),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).or(`reviewer_id.eq.${userId},reviewee_id.eq.${userId}`),
        supabase.from('badges').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      ]);

      counts.tasks = tasksCount || 0;
      counts.bookings = bookingsCount || 0;
      counts.messages = messagesCount || 0;
      counts.payments = paymentsCount || 0;
      counts.reviews = reviewsCount || 0;
      counts.badges = badgesCount || 0;
      counts.notifications = notificationsCount || 0;
      counts.profile = 1;

      setCategoryCounts(counts);
    } catch (error) {
      console.error('Failed to load data counts:', error);
    } finally {
      setLoadingCounts(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const selectAllCategories = () => {
    const categories = includeSensitive 
      ? DATA_CATEGORIES.map(c => c.id)
      : DATA_CATEGORIES.filter(c => !c.sensitive).map(c => c.id);
    setSelectedCategories(categories);
  };

  const deselectAllCategories = () => {
    setSelectedCategories(['profile']); // Always include profile
  };

  const handlePreview = async () => {
    setShowPreview(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, bio, city, skills, rating, completed_tasks')
        .eq('id', userId)
        .single();
      
      setPreviewData({
        profile: anonymizeData ? {
          ...profile,
          email: profile?.email?.replace(/(.{2}).*(@.*)/, '$1***$2'),
          full_name: profile?.full_name?.split(' ').map((n: string) => n[0] + '***').join(' ')
        } : profile,
        selectedCategories: selectedCategories.length,
        estimatedRecords: Object.entries(categoryCounts)
          .filter(([key]) => selectedCategories.includes(key))
          .reduce((sum, [, count]) => sum + count, 0)
      });
    } catch (error) {
      console.error('Preview error:', error);
    }
  };

  const handleExport = async () => {
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one data category');
      return;
    }

    setExporting(true);
    setProgress(0);

    const steps = [
      'Authenticating...',
      'Fetching profile data...',
      'Collecting activity data...',
      'Processing messages...',
      'Compiling payment history...',
      'Gathering reviews...',
      'Packaging data...',
      'Generating file...'
    ];

    try {
      let stepIndex = 0;
      const progressInterval = setInterval(() => {
        if (stepIndex < steps.length) {
          setCurrentStep(steps[stepIndex]);
          setProgress((stepIndex + 1) / steps.length * 90);
          stepIndex++;
        }
      }, 400);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error('Please log in to export your data');
        return;
      }

      const response = await supabase.functions.invoke('export-user-data', {
        body: { 
          format,
          categories: selectedCategories,
          anonymize: anonymizeData
        },
      });

      clearInterval(progressInterval);
      setProgress(100);
      setCurrentStep('Complete!');

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Create and download the file
      const content = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data, null, 2);
      
      const blob = new Blob([content], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = formatDate(new Date(), 'yyyy-MM-dd-HHmmss');
      a.download = `sasktask-data-export-${timestamp}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Save to history
      const exportRecord: ExportRecord = {
        id: crypto.randomUUID(),
        date: new Date(),
        format,
        categories: selectedCategories,
        size: `${(blob.size / 1024).toFixed(1)} KB`,
        status: 'completed'
      };
      saveExportToHistory(exportRecord);

      toast.success('Data exported successfully!', {
        description: `${selectedCategories.length} categories exported as ${format.toUpperCase()}`
      });
    } catch (error: any) {
      console.error('Export error:', error);
      
      const exportRecord: ExportRecord = {
        id: crypto.randomUUID(),
        date: new Date(),
        format,
        categories: selectedCategories,
        size: '0 KB',
        status: 'failed'
      };
      saveExportToHistory(exportRecord);
      
      toast.error(error.message || 'Failed to export data');
    } finally {
      setExporting(false);
      setTimeout(() => {
        setProgress(0);
        setCurrentStep('');
      }, 2000);
    }
  };

  const clearExportHistory = () => {
    setExportHistory([]);
    localStorage.removeItem(`${EXPORT_HISTORY_KEY}_${userId}`);
    toast.success('Export history cleared');
  };

  const getTotalRecords = () => {
    return Object.entries(categoryCounts)
      .filter(([key]) => selectedCategories.includes(key))
      .reduce((sum, [, count]) => sum + count, 0);
  };

  const getSensitiveCount = () => {
    return selectedCategories.filter(id => 
      DATA_CATEGORIES.find(c => c.id === id)?.sensitive
    ).length;
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
                Data Export Center
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                  <Shield className="h-3 w-3 mr-1" />
                  GDPR Compliant
                </Badge>
              </CardTitle>
              <CardDescription>
                Download your personal data with full control over what's included
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger 
              value="export" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
            >
              <History className="h-4 w-4 mr-2" />
              Export History
              {exportHistory.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {exportHistory.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="p-6 space-y-6 mt-0">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <motion.div 
                className="p-3 rounded-lg bg-primary/5 border border-primary/20"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-2xl font-bold text-primary">{selectedCategories.length}</p>
                <p className="text-xs text-muted-foreground">Categories Selected</p>
              </motion.div>
              <motion.div 
                className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-2xl font-bold text-blue-500">
                  {loadingCounts ? '...' : getTotalRecords()}
                </p>
                <p className="text-xs text-muted-foreground">Total Records</p>
              </motion.div>
              <motion.div 
                className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-2xl font-bold text-amber-500">{getSensitiveCount()}</p>
                <p className="text-xs text-muted-foreground">Sensitive Items</p>
              </motion.div>
              <motion.div 
                className="p-3 rounded-lg bg-green-500/5 border border-green-500/20"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-2xl font-bold text-green-500 uppercase">{format === 'json' ? 'JSON' : 'CSV'}</p>
                <p className="text-xs text-muted-foreground">Export Format</p>
              </motion.div>
            </div>

            {/* Data Categories */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Select Data to Export
                </Label>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAllCategories}>
                    Select All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={deselectAllCategories}>
                    Deselect All
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-[280px] pr-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DATA_CATEGORIES.map((category) => {
                    const isSelected = selectedCategories.includes(category.id);
                    const isDisabled = !includeSensitive && category.sensitive;
                    const count = categoryCounts[category.id];
                    
                    return (
                      <motion.div
                        key={category.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-primary/5 border-primary/30' 
                            : 'bg-card border-border hover:border-primary/20'
                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !isDisabled && toggleCategory(category.id)}
                        whileHover={!isDisabled ? { scale: 1.01 } : {}}
                        whileTap={!isDisabled ? { scale: 0.99 } : {}}
                      >
                        <Checkbox 
                          checked={isSelected} 
                          disabled={isDisabled}
                          className="pointer-events-none"
                        />
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/20' : 'bg-muted'}`}>
                          <category.icon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{category.label}</p>
                            {category.sensitive && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Lock className="h-3 w-3 text-amber-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Contains sensitive data</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{category.description}</p>
                        </div>
                        {count !== undefined && (
                          <Badge variant="secondary" className="shrink-0">
                            {count}
                          </Badge>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
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
                    <div className="flex-1">
                      <p className="font-medium">JSON</p>
                      <p className="text-xs text-muted-foreground">Structured, nested data</p>
                    </div>
                    <Badge variant="outline" className="text-xs">Recommended</Badge>
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
                    <div className="flex-1">
                      <p className="font-medium">CSV</p>
                      <p className="text-xs text-muted-foreground">Excel/Sheets compatible</p>
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
                  className="space-y-3 p-4 rounded-lg bg-primary/5 border border-primary/20"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {currentStep || 'Preparing export...'}
                    </span>
                    <span className="font-medium text-primary">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    Processing {selectedCategories.length} categories...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Export Actions */}
            <div className="flex items-center justify-between gap-4">
              <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={handlePreview} disabled={exporting}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Export Preview</DialogTitle>
                    <DialogDescription>
                      Preview of data that will be included in your export
                    </DialogDescription>
                  </DialogHeader>
                  {previewData && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                        <h4 className="font-medium text-sm">Profile Sample</h4>
                        <pre className="text-xs bg-background p-3 rounded-md overflow-auto max-h-48">
                          {JSON.stringify(previewData.profile, null, 2)}
                        </pre>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-3 rounded-lg border">
                          <p className="text-muted-foreground">Categories</p>
                          <p className="font-medium">{previewData.selectedCategories}</p>
                        </div>
                        <div className="p-3 rounded-lg border">
                          <p className="text-muted-foreground">Est. Records</p>
                          <p className="font-medium">{previewData.estimatedRecords}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <Button
                onClick={handleExport}
                disabled={exporting || selectedCategories.length === 0}
                className="gap-2 flex-1 sm:flex-none"
                size="lg"
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export {selectedCategories.length} Categories
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history" className="p-6 mt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Recent Exports
                </h3>
                {exportHistory.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearExportHistory}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {exportHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Archive className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No export history yet</p>
                  <p className="text-sm text-muted-foreground">
                    Your export history will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {exportHistory.map((record) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                    >
                      <div className={`p-2 rounded-lg ${
                        record.status === 'completed' ? 'bg-green-500/10' :
                        record.status === 'failed' ? 'bg-red-500/10' : 'bg-muted'
                      }`}>
                        {record.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : record.status === 'failed' ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            {record.format.toUpperCase()} Export
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {record.categories.length} categories
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(record.date, { addSuffix: true })} • {record.size}
                        </p>
                      </div>
                      <Badge 
                        variant={record.status === 'completed' ? 'default' : 'destructive'}
                        className="capitalize"
                      >
                        {record.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="p-6 mt-0">
            <div className="space-y-6">
              <h3 className="font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Export Preferences
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="font-medium text-sm">Include Sensitive Data</p>
                      <p className="text-xs text-muted-foreground">
                        Messages, payments, login history, etc.
                      </p>
                    </div>
                  </div>
                  <Switch 
                    checked={includeSensitive} 
                    onCheckedChange={setIncludeSensitive} 
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">Anonymize Personal Info</p>
                      <p className="text-xs text-muted-foreground">
                        Mask email addresses and full names
                      </p>
                    </div>
                  </div>
                  <Switch 
                    checked={anonymizeData} 
                    onCheckedChange={setAnonymizeData} 
                  />
                </div>

                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-3 mb-3">
                    <RefreshCw className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Data Refresh</p>
                      <p className="text-xs text-muted-foreground">
                        Update record counts from database
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadDataCounts}
                    disabled={loadingCounts}
                  >
                    {loadingCounts ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh Counts
                  </Button>
                </div>
              </div>

              <Separator />

              {/* GDPR Info */}
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
                    <ul className="mt-2 space-y-1.5 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Right to access all your personal data
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Export includes all data we store about you
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Sensitive data like passwords is never included
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Request data deletion from Account Settings
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};