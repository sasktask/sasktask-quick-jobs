import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Sparkles, Check, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MagicLinkButtonProps {
  mode?: "signin" | "signup";
  onSuccess?: () => void;
}

export const MagicLinkButton: React.FC<MagicLinkButtonProps> = ({ 
  mode = "signin",
  onSuccess 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { toast } = useToast();

  const handleSendMagicLink = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      setIsSent(true);
      toast({
        title: "Magic link sent!",
        description: `Check your inbox at ${email} for a login link.`,
      });
      onSuccess?.();
    } catch (error: any) {
      console.error("Magic link error:", error);
      toast({
        title: "Failed to send magic link",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsSent(false);
    setEmail("");
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center gap-3 h-12 border-border/60 hover:bg-muted/50 group"
        onClick={() => setIsExpanded(true)}
      >
        <div className="relative">
          <Mail className="h-5 w-5 text-primary" />
          <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <span className="font-medium">
          {mode === "signin" ? "Sign in with Magic Link" : "Sign up with Magic Link"}
        </span>
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="w-full space-y-3 p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20"
    >
      <AnimatePresence mode="wait">
        {!isSent ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <Label className="text-sm font-medium">Passwordless Login</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              We'll send you a magic link to sign in instantly - no password needed!
            </p>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                type="button"
                onClick={handleSendMagicLink}
                disabled={isLoading || !email.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Magic Link
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-3 py-2"
          >
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">Check your inbox!</p>
              <p className="text-sm text-muted-foreground">
                We sent a login link to <strong>{email}</strong>
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              Use different email
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
