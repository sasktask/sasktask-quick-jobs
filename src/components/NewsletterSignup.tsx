import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  honeypot: z.string().optional(),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export const NewsletterSignup = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
      honeypot: "",
    },
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true);

    try {
      const { data: result, error } = await supabase.functions.invoke(
        "subscribe-newsletter",
        {
          body: data,
        }
      );

      if (error) {
        console.error("Error subscribing to newsletter:", error);
        toast.error("Failed to subscribe. Please try again.");
        return;
      }

      if (result.alreadySubscribed) {
        toast.info(result.message);
      } else {
        toast.success(result.message);
      }
      
      reset();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        {/* Honeypot field - hidden from users */}
        <input
          {...register("honeypot")}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
        />

        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              {...register("email")}
              type="email"
              placeholder="Enter your email"
              disabled={isSubmitting}
              className="bg-background/50 border-border focus:border-primary"
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="shrink-0"
            size="default"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Subscribe
              </>
            )}
          </Button>
        </div>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </form>
      <p className="text-xs text-muted-foreground">
        Subscribe to get updates on new features, tips, and opportunities. Unsubscribe anytime.
      </p>
    </div>
  );
};
