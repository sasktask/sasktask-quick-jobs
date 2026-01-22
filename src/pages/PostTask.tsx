import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Loader2, Save, CheckCircle, Clock, AlertTriangle, MapPin, Shield, BadgePercent } from "lucide-react";
import { TaskPriorityBadge } from "@/components/TaskPriorityBadge";
import { DurationSelector } from "@/components/DurationSelector";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { z } from "zod";
import { TaskTemplateManager } from "@/components/TaskTemplateManager";
import { getCategoryTitles } from "@/lib/categories";
import { PhoneVerification } from "@/components/PhoneVerification";
import { InstantTaskerMatching } from "@/components/InstantTaskerMatching";
import { PaymentVerification, usePaymentVerification } from "@/components/PaymentVerification";
// Full validation for publishing
const taskSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(200, "Title too long"),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(5000, "Description too long"),
  category: z.string().min(1, "Category is required"),
  location: z.string().trim().min(3, "Location must be at least 3 characters").max(200, "Location too long"),
  pay_amount: z.number().positive("Pay amount must be positive").max(100000, "Pay amount too high"),
  estimated_duration: z.number().positive("Duration must be positive").optional(),
  budget_type: z.enum(["fixed", "hourly"]),
  scheduled_date: z.string().optional(),
  tools_provided: z.boolean(),
  tools_description: z.string().max(1000, "Tools description too long").optional(),
  expires_at: z.string().optional(),
});

// Minimal validation for drafts
const draftSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title too long"),
});

const PostTask = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profilePhone, setProfilePhone] = useState<string | null>(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState<boolean>(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Payment verification check
  const { isPaymentVerified, isLoading: isPaymentCheckLoading } = usePaymentVerification(userId);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    latitude: null as number | null,
    longitude: null as number | null,
    pay_amount: "",
    estimated_duration: "",
    budget_type: "fixed" as "fixed" | "hourly",
    scheduled_date: "",
    tools_provided: false,
    tools_description: "",
    expires_at: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    // Transport-specific fields
    ride_type: "" as "" | "pickup_dropoff" | "long_distance" | "rural_remote" | "airport" | "medical",
    destination: "",
    destination_latitude: null as number | null,
    destination_longitude: null as number | null,
    passengers: "1",
    has_luggage: false,
    is_round_trip: false,
  });

  const categories = getCategoryTitles();

  useEffect(() => {
    checkUser();
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (hasUnsavedChanges && formData.title.trim() && userId) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, hasUnsavedChanges, userId]);

  const handleAutoSave = useCallback(async () => {
    if (!userId || !formData.title.trim()) return;

    try {
      if (draftId) {
        // Update existing draft
        const { error } = await supabase
          .from("tasks")
          .update({
            title: formData.title.trim(),
            description: formData.description.trim() || "Draft - no description yet",
            category: formData.category || "Other",
            location: formData.location.trim() || "TBD",
            pay_amount: parseFloat(formData.pay_amount) || 0,
            estimated_duration: formData.estimated_duration ? parseFloat(formData.estimated_duration) : null,
            budget_type: formData.budget_type,
            scheduled_date: formData.scheduled_date || null,
            tools_provided: formData.tools_provided,
            tools_description: formData.tools_description || null,
          })
          .eq("id", draftId);

        if (error) throw error;
      } else {
        // Create new draft
        const { data, error } = await supabase
          .from("tasks")
          .insert({
            task_giver_id: userId,
            title: formData.title.trim(),
            description: formData.description.trim() || "Draft - no description yet",
            category: formData.category || "Other",
            location: formData.location.trim() || "TBD",
            pay_amount: parseFloat(formData.pay_amount) || 0,
            estimated_duration: formData.estimated_duration ? parseFloat(formData.estimated_duration) : null,
            budget_type: formData.budget_type,
            scheduled_date: formData.scheduled_date || null,
            tools_provided: formData.tools_provided,
            tools_description: formData.tools_description || null,
            status: "draft"
          })
          .select("id")
          .single();

        if (error) throw error;
        if (data) setDraftId(data.id);
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [userId, formData, draftId]);

  const handleFormChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const handleSelectTemplate = (template: any) => {
    setFormData({
      title: template.title || "",
      description: template.description || "",
      category: template.category || "",
      location: template.location || "",
      latitude: null,
      longitude: null,
      pay_amount: template.pay_amount?.toString() || "",
      estimated_duration: template.estimated_duration?.toString() || "",
      budget_type: (template.budget_type as "fixed" | "hourly") || "fixed",
      scheduled_date: "",
      tools_provided: template.tools_provided || false,
      tools_description: template.tools_description || "",
      expires_at: "",
      priority: "medium",
      ride_type: "",
      destination: "",
      destination_latitude: null,
      destination_longitude: null,
      passengers: "1",
      has_luggage: false,
      is_round_trip: false,
    });
    setHasUnsavedChanges(true);
  };

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const hasTaskGiverRole = roleData?.some(r => r.role === "task_giver" || r.role === "admin");

      // Fetch profile phone and verification status for gating
      const { data: profileData } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", session.user.id)
        .maybeSingle();
      const phone = profileData?.phone || null;
      setProfilePhone(phone);

      if (phone) {
        const { count: phoneVerifiedCount } = await supabase
          .from("phone_verifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", session.user.id)
          .eq("phone", phone)
          .not("verified_at", "is", null);
        setIsPhoneVerified(!!phoneVerifiedCount && phoneVerifiedCount > 0);
      } else {
        setIsPhoneVerified(false);
      }

      if (!hasTaskGiverRole) {
        toast({
          title: "Access Denied",
          description: "Only task givers can post tasks",
          variant: "destructive",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveDraft = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to save a draft",
        variant: "destructive",
      });
      return;
    }

    // Validate minimum draft requirements
    const draftValidation = draftSchema.safeParse({ title: formData.title });
    if (!draftValidation.success) {
      toast({
        title: "Error",
        description: draftValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSavingDraft(true);

    try {
      const { error } = await supabase
        .from("tasks")
        .insert({
          task_giver_id: userId,
          title: formData.title.trim(),
          description: formData.description.trim() || "Draft - no description yet",
          category: formData.category || "Other",
          location: formData.location.trim() || "TBD",
          pay_amount: parseFloat(formData.pay_amount) || 0,
          estimated_duration: formData.estimated_duration ? parseFloat(formData.estimated_duration) : null,
          budget_type: formData.budget_type,
          scheduled_date: formData.scheduled_date || null,
          tools_provided: formData.tools_provided,
          tools_description: formData.tools_description || null,
          status: "draft"
        });

      if (error) throw error;

      toast({
        title: "Draft Saved",
        description: "Your task has been saved as a draft. You can edit it from My Tasks.",
      });

      navigate("/my-tasks");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to post a task",
        variant: "destructive",
      });
      return;
    }

    const requirePhoneVerified = async () => {
      if (isPhoneVerified) return;

      const phone = profilePhone;
      if (!phone) {
        throw new Error("Please verify your phone number before posting a task.");
      }

      const { count, error: verificationError } = await supabase
        .from("phone_verifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("phone", phone)
        .not("verified_at", "is", null);

      if (verificationError) throw verificationError;
      if (!count || count === 0) {
        throw new Error("Please verify your phone number before posting a task.");
      }

      setIsPhoneVerified(true);
    };

    setIsSubmitting(true);

    try {
      await requirePhoneVerified();

      const validation = taskSchema.safeParse({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        pay_amount: parseFloat(formData.pay_amount),
        estimated_duration: formData.estimated_duration ? parseFloat(formData.estimated_duration) : undefined,
        budget_type: formData.budget_type,
        scheduled_date: formData.scheduled_date,
        tools_provided: formData.tools_provided,
        tools_description: formData.tools_description,
      });

      if (!validation.success) {
        const firstError = validation.error.errors[0];
        throw new Error(firstError.message);
      }

      // Check if this is a future task requiring deposit
      const isFutureTask = validation.data.scheduled_date && new Date(validation.data.scheduled_date) > new Date();
      const depositAmount = isFutureTask ? validation.data.pay_amount * 0.25 : 0;

      const { data: insertedTask, error } = await supabase
        .from("tasks")
        .insert({
          task_giver_id: userId,
          title: validation.data.title,
          description: validation.data.description,
          category: validation.data.category,
          location: validation.data.location,
          latitude: formData.latitude,
          longitude: formData.longitude,
          pay_amount: validation.data.pay_amount,
          estimated_duration: validation.data.estimated_duration,
          budget_type: validation.data.budget_type,
          scheduled_date: validation.data.scheduled_date || null,
          tools_provided: validation.data.tools_provided,
          tools_description: validation.data.tools_description || null,
          expires_at: formData.expires_at || null,
          priority: formData.priority,
          status: "open",
          requires_deposit: isFutureTask,
          deposit_amount: depositAmount,
        })
        .select('id')
        .single();

      if (error) throw error;

      // If it's a future task, redirect to task detail to pay deposit
      if (isFutureTask && insertedTask?.id) {
        toast({
          title: "Task Posted!",
          description: "Please pay the 25% deposit to secure your booking.",
        });
        navigate(`/task/${insertedTask.id}`);
      } else {
        toast({
          title: "Success!",
          description: "Your task has been posted successfully",
        });
        navigate("/my-tasks");
      }
    } catch (error: any) {
      const message = error.message || "Verification required";
      if (message.toLowerCase().includes("verify your phone number")) {
        setShowPhoneVerification(true);
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Post a New Task</h1>
            <p className="text-muted-foreground">Fill in the details to find the right person for your task</p>
          </div>
          {lastSaved && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Auto-saved {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Payment Verification Check */}
        {userId && !isPaymentCheckLoading && !isPaymentVerified && (
          <div className="mb-6">
            <PaymentVerification userId={userId} onVerified={() => window.location.reload()} />
          </div>
        )}

        {/* Task Templates - only show if payment verified */}
        {isPaymentVerified && (
          <div className="mb-6">
            <TaskTemplateManager
              onSelectTemplate={handleSelectTemplate}
              currentFormData={formData}
            />
          </div>
        )}

        {/* Only show form if payment is verified */}
        {isPaymentVerified && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
            <CardDescription>Provide clear information to attract qualified task doers. Auto-saves every 30 seconds.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Snow removal from driveway"
                  value={formData.title}
                  onChange={(e) => handleFormChange({ title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the task in detail..."
                  value={formData.description}
                  onChange={(e) => handleFormChange({ description: e.target.value })}
                  rows={5}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleFormChange({ category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <LocationAutocomplete
                    value={formData.location}
                    onChange={(location, coordinates) => {
                      handleFormChange({
                        location,
                        latitude: coordinates?.latitude ?? null,
                        longitude: coordinates?.longitude ?? null
                      });
                    }}
                    placeholder="Start typing an address..."
                  />
                  {formData.latitude && formData.longitude && (
                    <p className="text-xs text-muted-foreground">
                      📍 Coordinates saved for map display
                    </p>
                  )}
                </div>
              </div>

              {/* Transport-specific fields - only show when Rides & Transport is selected */}
              {formData.category === "Rides & Transport" && (
                <div className="space-y-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                    <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">Transport Details</h3>
                  </div>

                  <div className="space-y-2">
                    <Label>Ride Type *</Label>
                    <Select
                      value={formData.ride_type}
                      onValueChange={(value: typeof formData.ride_type) => handleFormChange({ ride_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ride type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pickup_dropoff">Pick Up & Drop Off (Short Distance)</SelectItem>
                        <SelectItem value="long_distance">Long Distance Drive</SelectItem>
                        <SelectItem value="rural_remote">Rural/Remote Area (Where Uber Can't Go)</SelectItem>
                        <SelectItem value="airport">Airport Transfer</SelectItem>
                        <SelectItem value="medical">Medical Appointment Transport</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      Perfect for areas without rideshare coverage, remote locations, or special transport needs
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Destination *</Label>
                    <LocationAutocomplete
                      value={formData.destination}
                      onChange={(destination, coordinates) => {
                        handleFormChange({
                          destination,
                          destination_latitude: coordinates?.latitude ?? null,
                          destination_longitude: coordinates?.longitude ?? null
                        });
                      }}
                      placeholder="Where do you need to go?"
                    />
                    {formData.destination_latitude && formData.destination_longitude && (
                      <p className="text-xs text-muted-foreground">
                        📍 Destination coordinates saved
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Number of Passengers</Label>
                      <Select
                        value={formData.passengers}
                        onValueChange={(value) => handleFormChange({ passengers: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Passenger</SelectItem>
                          <SelectItem value="2">2 Passengers</SelectItem>
                          <SelectItem value="3">3 Passengers</SelectItem>
                          <SelectItem value="4">4+ Passengers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Has Luggage?</Label>
                        <Switch
                          checked={formData.has_luggage}
                          onCheckedChange={(checked) => handleFormChange({ has_luggage: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Round Trip?</Label>
                        <Switch
                          checked={formData.is_round_trip}
                          onCheckedChange={(checked) => handleFormChange({ is_round_trip: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pay_amount">
                    {formData.budget_type === "hourly" ? "Hourly Rate ($) *" : "Total Budget ($) *"}
                  </Label>
                  <Input
                    id="pay_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={formData.budget_type === "hourly" ? "e.g., 25.00" : "e.g., 150.00"}
                    value={formData.pay_amount}
                    onChange={(e) => handleFormChange({ pay_amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget_type">Budget Type *</Label>
                  <Select
                    value={formData.budget_type}
                    onValueChange={(value: "fixed" | "hourly") => handleFormChange({ budget_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="hourly">Hourly Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Duration Selector */}
              <div className="p-4 bg-muted/50 border border-border rounded-lg">
                <DurationSelector
                  value={formData.estimated_duration}
                  onChange={(value) => handleFormChange({ estimated_duration: value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled_date">Scheduled Date</Label>
                <Input
                  id="scheduled_date"
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => handleFormChange({ scheduled_date: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-muted-foreground">
                  Schedule for tomorrow or later to book in advance
                </p>
              </div>

              {/* Deposit Info - Show when future date is selected */}
              {formData.scheduled_date && new Date(formData.scheduled_date) > new Date() && formData.pay_amount && (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <BadgePercent className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-amber-900 dark:text-amber-100">25% Advance Deposit Required</h4>
                      </div>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        For future tasks, a 25% deposit is required to show commitment and build trust with taskers.
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-600">Deposit:</span>
                          <span className="font-bold text-amber-900 dark:text-amber-100">
                            ${(parseFloat(formData.pay_amount) * 0.25).toFixed(2)} CAD
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-600">Remaining:</span>
                          <span className="font-medium text-amber-900 dark:text-amber-100">
                            ${(parseFloat(formData.pay_amount) * 0.75).toFixed(2)} CAD (after accepting tasker)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-amber-600 dark:text-amber-400">
                        <span className="flex items-center gap-1">
                          <Shield className="h-3.5 w-3.5" />
                          Full refund if cancelled 24h+ before
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Builds trust with taskers
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Priority Selection */}
              <div className="space-y-4 p-4 bg-muted/50 border border-border rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label className="text-foreground">Task Priority</Label>
                      <p className="text-sm text-muted-foreground">
                        Set the urgency level to help taskers prioritize
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(["low", "medium", "high", "urgent"] as const).map((priority) => (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => handleFormChange({ priority })}
                          className={`transition-all ${formData.priority === priority ? "ring-2 ring-primary ring-offset-2" : ""} rounded-full`}
                        >
                          <TaskPriorityBadge priority={priority} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant Tasker Matching - Show for urgent tasks with location */}
              {formData.priority === "urgent" && formData.latitude && formData.longitude && (
                <InstantTaskerMatching
                  taskCategory={formData.category}
                  taskLocation={
                    formData.latitude && formData.longitude
                      ? { latitude: formData.latitude, longitude: formData.longitude }
                      : null
                  }
                  onSelectTasker={(taskerId) => {
                    toast({
                      title: "Tasker Selected",
                      description: "Once you post your task, this tasker will be notified first."
                    });
                  }}
                  isUrgent={true}
                />
              )}

              <div className="space-y-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label htmlFor="expires_at" className="text-amber-900 dark:text-amber-100">Task Expiration</Label>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Set when this task should automatically close if no tasker is assigned
                      </p>
                    </div>
                    <Input
                      id="expires_at"
                      type="datetime-local"
                      value={formData.expires_at}
                      onChange={(e) => handleFormChange({ expires_at: e.target.value })}
                      min={new Date().toISOString().slice(0, 16)}
                      className="max-w-xs"
                    />
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      You'll receive a reminder 24 hours before expiration
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="tools_provided">Tools Provided</Label>
                    <p className="text-sm text-muted-foreground">
                      Will you provide the necessary tools?
                    </p>
                  </div>
                  <Switch
                    id="tools_provided"
                    checked={formData.tools_provided}
                    onCheckedChange={(checked) => handleFormChange({ tools_provided: checked })}
                  />
                </div>

                {formData.tools_provided && (
                  <div className="space-y-2">
                    <Label htmlFor="tools_description">Tools Description</Label>
                    <Textarea
                      id="tools_description"
                      placeholder="List the tools you'll provide..."
                      value={formData.tools_description}
                      onChange={(e) => handleFormChange({ tools_description: e.target.value })}
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting || isSavingDraft}
                  className="flex-1"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Post Task
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting || isSavingDraft}
                  className="gap-2"
                >
                  {isSavingDraft ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  disabled={isSubmitting || isSavingDraft}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        )}
      </div>
      <Dialog open={showPhoneVerification} onOpenChange={setShowPhoneVerification}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify your phone to post</DialogTitle>
          </DialogHeader>
          {userId && (
            <PhoneVerification
              userId={userId}
              initialPhone={profilePhone || undefined}
              onVerified={(phone) => {
                setProfilePhone(phone);
                setShowPhoneVerification(false);
                toast({
                  title: "Phone verified",
                  description: "You can now post your task.",
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PostTask;
