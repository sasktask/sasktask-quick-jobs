import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, Key, Eye, EyeOff, Check, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Strong password schema matching signup requirements
const passwordSchema = z.object({
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

// Password strength checker
const getPasswordStrength = (password: string): { score: number; label: string; color: string; percentage: number } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const percentage = (score / 6) * 100;
  if (score <= 2) return { score, label: "Weak", color: "bg-destructive", percentage };
  if (score <= 4) return { score, label: "Medium", color: "bg-yellow-500", percentage };
  return { score, label: "Strong", color: "bg-green-500", percentage };
};

interface SecuritySettingsProps {
  user: any;
}

export const SecuritySettings = ({ user }: SecuritySettingsProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const watchedPassword = watch("newPassword", "");
  const passwordStrength = getPasswordStrength(watchedPassword);

  // Password requirements check
  const requirements = [
    { label: "At least 8 characters", met: watchedPassword.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(watchedPassword) },
    { label: "One lowercase letter", met: /[a-z]/.test(watchedPassword) },
    { label: "One number", met: /[0-9]/.test(watchedPassword) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(watchedPassword) },
  ];

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setLoading(true);
    try {
      // First check if we have a valid session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        toast.error("Your session has expired. Please sign in again.");
        navigate("/auth");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes("same") || error.message.includes("different from the old")) {
          toast.error("New password must be different from your current password");
          return;
        }
        if (error.message.includes("weak") || error.message.includes("short")) {
          toast.error("Password is too weak. Please choose a stronger password.");
          return;
        }
        throw error;
      }

      toast.success("Password updated successfully!");
      reset();
      setPasswordValue("");
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Note: In production, implement a proper account deletion function
      // that handles cleanup of all related data (tasks, bookings, messages, etc.)
      
      // For now, we sign out and notify the user to contact support
      toast.info("Account deletion requested. Please contact support at support@sasktask.com to complete the deletion process. We'll help ensure all your data is properly removed.");
      
      // Sign out the user
      await supabase.auth.signOut();
      navigate("/");
    } catch (error: any) {
      console.error("Error during account deletion:", error);
      toast.error("Failed to process account deletion. Please contact support.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  {...register("newPassword")}
                  placeholder="Enter new password"
                  className={errors.newPassword ? "border-destructive pr-10" : "pr-10"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword.message}</p>
              )}
              
              {/* Password Strength Indicator */}
              {watchedPassword && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Progress value={passwordStrength.percentage} className="h-2 flex-1" />
                    <span className={`text-xs font-medium ${
                      passwordStrength.label === "Strong" ? "text-green-500" :
                      passwordStrength.label === "Medium" ? "text-yellow-500" : "text-destructive"
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  
                  {/* Requirements Checklist */}
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    {requirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-1">
                        {req.met ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={req.met ? "text-green-500" : "text-muted-foreground"}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="Confirm new password"
                  className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" disabled={loading || passwordStrength.label === "Weak"}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium mb-2">
                Warning: This action cannot be undone!
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>All your profile data will be permanently deleted</li>
                <li>Your tasks and bookings will be removed</li>
                <li>You will lose access to your account immediately</li>
                <li>This action is irreversible</li>
              </ul>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting}>
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete My Account
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and remove all your
                    data from our servers. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
