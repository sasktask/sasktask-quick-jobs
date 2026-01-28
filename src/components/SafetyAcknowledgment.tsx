import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Users, 
  Camera,
  CheckCircle2,
  ExternalLink,
  Lock
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface SafetyAcknowledgmentProps {
  onComplete: () => void;
  isTaskDoer?: boolean;
  taskCategory?: string;
  requiresInPersonMeeting?: boolean;
}

export function SafetyAcknowledgment({ 
  onComplete, 
  isTaskDoer = false,
  taskCategory,
  requiresInPersonMeeting = true
}: SafetyAcknowledgmentProps) {
  const [acknowledgments, setAcknowledgments] = useState({
    readSafetyGuidelines: false,
    shareLocation: false,
    verifiedProfile: false,
    emergencyPlan: false,
    platformCommunication: false,
    reportConcerns: false,
  });

  const allAcknowledged = Object.values(acknowledgments).every(v => v);
  const completedCount = Object.values(acknowledgments).filter(v => v).length;
  const totalCount = Object.values(acknowledgments).length;

  const handleComplete = () => {
    if (!allAcknowledged) {
      toast.error("Please acknowledge all safety items");
      return;
    }
    toast.success("Safety acknowledgment complete");
    onComplete();
  };

  const isHighRisk = ["construction", "electrical", "plumbing", "roofing", "moving", "heavy lifting"].includes(
    taskCategory?.toLowerCase() || ""
  );

  return (
    <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Shield className="h-5 w-5" />
            Safety Acknowledgment Required
          </div>
          <Badge variant="outline" className="text-amber-600 border-amber-300">
            {completedCount}/{totalCount}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Warning for high-risk tasks */}
        {isHighRisk && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700 dark:text-red-400 text-sm">
                  High-Risk Task Category
                </p>
                <p className="text-xs text-red-600 dark:text-red-500">
                  This task may involve physical risks. Extra precautions are recommended.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Acknowledgment Items */}
        <div className="space-y-3">
          <div 
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
              acknowledgments.readSafetyGuidelines 
                ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                : "bg-background border-border hover:border-amber-300"
            }`}
            onClick={() => setAcknowledgments(a => ({...a, readSafetyGuidelines: !a.readSafetyGuidelines}))}
          >
            <Checkbox 
              checked={acknowledgments.readSafetyGuidelines}
              onCheckedChange={(checked) => setAcknowledgments(a => ({...a, readSafetyGuidelines: checked === true}))}
            />
            <div className="flex-1">
              <p className="text-sm font-medium">I have read the Safety Guidelines</p>
              <Link 
                to="/safety" 
                target="_blank" 
                className="text-xs text-primary hover:underline flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                Read Safety Guidelines <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            {acknowledgments.readSafetyGuidelines && <CheckCircle2 className="h-5 w-5 text-green-600" />}
          </div>

          {requiresInPersonMeeting && (
            <div 
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                acknowledgments.shareLocation 
                  ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                  : "bg-background border-border hover:border-amber-300"
              }`}
              onClick={() => setAcknowledgments(a => ({...a, shareLocation: !a.shareLocation}))}
            >
              <Checkbox 
                checked={acknowledgments.shareLocation}
                onCheckedChange={(checked) => setAcknowledgments(a => ({...a, shareLocation: checked === true}))}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">I will share my location with a trusted contact</p>
                </div>
                <p className="text-xs text-muted-foreground">Let someone know where you'll be</p>
              </div>
              {acknowledgments.shareLocation && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            </div>
          )}

          <div 
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
              acknowledgments.verifiedProfile 
                ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                : "bg-background border-border hover:border-amber-300"
            }`}
            onClick={() => setAcknowledgments(a => ({...a, verifiedProfile: !a.verifiedProfile}))}
          >
            <Checkbox 
              checked={acknowledgments.verifiedProfile}
              onCheckedChange={(checked) => setAcknowledgments(a => ({...a, verifiedProfile: checked === true}))}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">
                  I have reviewed the {isTaskDoer ? "Task Giver's" : "Task Doer's"} profile
                </p>
              </div>
              <p className="text-xs text-muted-foreground">Check reviews, ratings, and verifications</p>
            </div>
            {acknowledgments.verifiedProfile && <CheckCircle2 className="h-5 w-5 text-green-600" />}
          </div>

          <div 
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
              acknowledgments.emergencyPlan 
                ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                : "bg-background border-border hover:border-amber-300"
            }`}
            onClick={() => setAcknowledgments(a => ({...a, emergencyPlan: !a.emergencyPlan}))}
          >
            <Checkbox 
              checked={acknowledgments.emergencyPlan}
              onCheckedChange={(checked) => setAcknowledgments(a => ({...a, emergencyPlan: checked === true}))}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">I have an emergency plan</p>
              </div>
              <p className="text-xs text-muted-foreground">Know how to contact emergency services (911)</p>
            </div>
            {acknowledgments.emergencyPlan && <CheckCircle2 className="h-5 w-5 text-green-600" />}
          </div>

          <div 
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
              acknowledgments.platformCommunication 
                ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                : "bg-background border-border hover:border-amber-300"
            }`}
            onClick={() => setAcknowledgments(a => ({...a, platformCommunication: !a.platformCommunication}))}
          >
            <Checkbox 
              checked={acknowledgments.platformCommunication}
              onCheckedChange={(checked) => setAcknowledgments(a => ({...a, platformCommunication: checked === true}))}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">I will communicate through SaskTask</p>
              </div>
              <p className="text-xs text-muted-foreground">Keep all messages on the platform for safety</p>
            </div>
            {acknowledgments.platformCommunication && <CheckCircle2 className="h-5 w-5 text-green-600" />}
          </div>

          <div 
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
              acknowledgments.reportConcerns 
                ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                : "bg-background border-border hover:border-amber-300"
            }`}
            onClick={() => setAcknowledgments(a => ({...a, reportConcerns: !a.reportConcerns}))}
          >
            <Checkbox 
              checked={acknowledgments.reportConcerns}
              onCheckedChange={(checked) => setAcknowledgments(a => ({...a, reportConcerns: checked === true}))}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">I will report any safety concerns immediately</p>
              </div>
              <p className="text-xs text-muted-foreground">Contact safety@sasktask.com for urgent issues</p>
            </div>
            {acknowledgments.reportConcerns && <CheckCircle2 className="h-5 w-5 text-green-600" />}
          </div>
        </div>

        {/* Legal Notice */}
        <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
          <p>
            <strong>Important:</strong> SaskTask is a platform that connects users. We do not guarantee 
            the safety of any task. You are responsible for your own safety decisions. In case of 
            emergency, call 911 immediately.
          </p>
        </div>

        <Button 
          onClick={handleComplete}
          disabled={!allAcknowledged}
          className="w-full"
        >
          <Shield className="w-4 h-4 mr-2" />
          Confirm Safety Acknowledgment
        </Button>
      </CardContent>
    </Card>
  );
}
