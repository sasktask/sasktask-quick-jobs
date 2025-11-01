import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ExternalLink } from "lucide-react";

export const StripeSetupGuide = () => {
  const hasStripeKey = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  if (hasStripeKey) {
    return null;
  }

  return (
    <Alert className="mb-6 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        <div className="space-y-3">
          <p className="font-semibold">Stripe Setup Required</p>
          <p className="text-sm">
            To enable payment processing, you need to add your Stripe publishable key to the environment variables.
          </p>
          <div className="text-sm space-y-2">
            <p className="font-medium">Quick Setup:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>Get your Stripe publishable key from the <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">Stripe Dashboard <ExternalLink className="h-3 w-3" /></a></li>
              <li>Add it to your <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">.env</code> file as: <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...</code></li>
              <li>Restart your development server</li>
            </ol>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-amber-600 text-amber-700 hover:bg-amber-100"
            onClick={() => window.open("https://dashboard.stripe.com/apikeys", "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Stripe Dashboard
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
