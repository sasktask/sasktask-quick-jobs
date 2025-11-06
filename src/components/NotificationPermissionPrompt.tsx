import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export const NotificationPermissionPrompt = () => {
  const { isSupported, isSubscribed, permission, subscribe, unsubscribe } = usePushNotifications();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Show prompt if supported, not subscribed, and permission not denied
    if (isSupported && !isSubscribed && permission !== "denied") {
      const hasSeenPrompt = localStorage.getItem("notification-prompt-dismissed");
      if (!hasSeenPrompt) {
        setTimeout(() => setShowPrompt(true), 3000); // Show after 3 seconds
      }
    }
  }, [isSupported, isSubscribed, permission]);

  const handleEnable = async () => {
    await subscribe();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("notification-prompt-dismissed", "true");
  };

  if (!showPrompt || !isSupported) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-lg z-50 animate-in slide-in-from-bottom">
      <CardContent className="pt-6">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-accent rounded-full"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Enable Notifications</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get instant alerts for new messages, even when the app is closed.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleEnable} size="sm" className="flex-1">
                Enable
              </Button>
              <Button onClick={handleDismiss} variant="outline" size="sm" className="flex-1">
                Not Now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
