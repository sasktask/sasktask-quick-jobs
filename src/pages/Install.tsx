import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Check } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

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
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Install SaskTask App</h1>
            <p className="text-xl text-muted-foreground">
              Get the best experience with our mobile app
            </p>
          </div>

          {isInstalled ? (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Check className="w-6 h-6 text-green-600" />
                  <CardTitle className="text-green-900 dark:text-green-100">App Installed!</CardTitle>
                </div>
                <CardDescription className="text-green-700 dark:text-green-300">
                  SaskTask is now installed on your device. You can find it on your home screen.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <>
              {deferredPrompt && !isIOS && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Install</CardTitle>
                    <CardDescription>
                      Click the button below to install SaskTask on your device
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={handleInstallClick}
                      className="w-full"
                      size="lg"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Install App
                    </Button>
                  </CardContent>
                </Card>
              )}

              {isIOS && (
                <Card>
                  <CardHeader>
                    <CardTitle>Install on iPhone/iPad</CardTitle>
                    <CardDescription>
                      Follow these steps to install SaskTask on your iOS device
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          1
                        </div>
                        <div>
                          <p className="font-medium">Tap the Share button</p>
                          <p className="text-sm text-muted-foreground">
                            Look for the share icon at the bottom of Safari browser
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          2
                        </div>
                        <div>
                          <p className="font-medium">Select "Add to Home Screen"</p>
                          <p className="text-sm text-muted-foreground">
                            Scroll down in the share menu and tap this option
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          3
                        </div>
                        <div>
                          <p className="font-medium">Tap "Add"</p>
                          <p className="text-sm text-muted-foreground">
                            Confirm by tapping "Add" in the top right corner
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!isIOS && !deferredPrompt && (
                <Card>
                  <CardHeader>
                    <CardTitle>Install on Android</CardTitle>
                    <CardDescription>
                      Follow these steps to install SaskTask on your Android device
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          1
                        </div>
                        <div>
                          <p className="font-medium">Tap the menu button</p>
                          <p className="text-sm text-muted-foreground">
                            Look for the three dots in the top right of Chrome browser
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          2
                        </div>
                        <div>
                          <p className="font-medium">Select "Install app" or "Add to Home screen"</p>
                          <p className="text-sm text-muted-foreground">
                            This option should appear in the menu
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          3
                        </div>
                        <div>
                          <p className="font-medium">Tap "Install"</p>
                          <p className="text-sm text-muted-foreground">
                            Confirm the installation
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Why Install?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Quick access from your home screen</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Works offline - browse tasks without internet</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Faster loading and better performance</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Full-screen experience without browser bars</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Stay updated with instant notifications</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Install;