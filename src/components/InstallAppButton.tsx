import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallAppButtonProps {
  variant?: "default" | "outline" | "ghost" | "hero";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showOnDesktop?: boolean;
}

export const InstallAppButton = ({ 
  variant = "outline", 
  size = "lg",
  className = "",
  showOnDesktop = false
}: InstallAppButtonProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if mobile
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstalled(true);
      }
    } else {
      // Fallback: navigate to install page with instructions
      navigate('/install');
    }
  };

  // Don't show if already installed
  if (isInstalled) return null;

  // Only show on mobile unless showOnDesktop is true
  if (!isMobile && !showOnDesktop) return null;

  return (
    <Button 
      onClick={handleInstallClick}
      variant={variant}
      size={size}
      className={className}
    >
      {isMobile ? <Smartphone className="mr-2 h-5 w-5" /> : <Download className="mr-2 h-5 w-5" />}
      Install App
    </Button>
  );
};