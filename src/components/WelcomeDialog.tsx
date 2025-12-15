import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, Users, Shield, Clock, BadgeCheck } from "lucide-react";

interface WelcomeDialogProps {
  open: boolean;
  onClose: () => void;
  userName?: string;
}

const features = [
  {
    icon: Users,
    title: "Connect with Locals",
    description: "Find skilled taskers in Saskatchewan or offer your services",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "Verified profiles, secure payments, and dispute protection",
  },
  {
    icon: Clock,
    title: "Get Things Done",
    description: "From quick tasks to big projects, help is just a click away",
  },
  {
    icon: BadgeCheck,
    title: "Complete Verification",
    description: "Upload your ID and selfie to get fully verified and build trust",
  },
];

export function WelcomeDialog({ open, onClose, userName }: WelcomeDialogProps) {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setStep(0);
    }
  }, [open]);

  const handleNext = () => {
    if (step < features.length - 1) {
      setStep(step + 1);
    } else {
      // On last step, offer to go to verification
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleVerify = () => {
    onClose();
    navigate("/verification");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        
        <DialogHeader className="relative">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-scale-in">
                <Sparkles className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          
          <DialogTitle className="text-2xl text-center">
            {step === 0 ? (
              <>Welcome{userName ? `, ${userName}` : ""}! 🎉</>
            ) : (
              features[step].title
            )}
          </DialogTitle>
          
          <DialogDescription className="text-center text-base">
            {step === 0 ? (
              "You're all set to start using SaskTask. Here's what you can do:"
            ) : (
              features[step].description
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {step === 0 ? (
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-scale-in">
                {(() => {
                  const Icon = features[step].icon;
                  return <Icon className="w-12 h-12 text-primary" />;
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-4">
          {[0, ...features.map((_, i) => i)].slice(0, features.length).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === step 
                  ? "w-6 bg-primary" 
                  : index < step 
                    ? "bg-primary/50" 
                    : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleSkip} className="flex-1">
            Skip
          </Button>
          {step === features.length - 1 ? (
            <Button onClick={handleVerify} className="flex-1" variant="hero">
              <BadgeCheck className="w-4 h-4 mr-2" />
              Verify Now
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1" variant="hero">
              Next
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
