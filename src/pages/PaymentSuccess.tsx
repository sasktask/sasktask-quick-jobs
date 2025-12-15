import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Home, Receipt, MessageSquare, Download, Share2, Sparkles } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [showContent, setShowContent] = useState(false);
  
  const bookingId = searchParams.get('booking_id');
  const amount = searchParams.get('amount');

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#22c55e', '#3b82f6', '#8b5cf6']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#22c55e', '#3b82f6', '#8b5cf6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Show content with animation delay
    setTimeout(() => setShowContent(true), 300);
  }, []);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Task Payment Confirmed',
        text: 'I just made a secure payment on SaskTask!',
        url: window.location.origin
      });
    } catch (err) {
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard"
      });
      navigator.clipboard.writeText(window.location.origin);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Payment Successful - SaskTask"
        description="Your payment has been processed successfully"
      />
      <Navbar />
      
      <main className="container mx-auto px-4 py-16 pt-24">
        <div className="max-w-lg mx-auto text-center">
          {/* Success Animation */}
          <div className={`transform transition-all duration-700 ${showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <div className="relative mx-auto mb-8">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
              </div>
            </div>

            <Badge variant="secondary" className="mb-4 text-sm px-4 py-1.5">
              Payment Confirmed
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Payment Successful!</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Your payment is now secured in escrow. The tasker has been notified.
            </p>
          </div>

          {/* Payment Details Card */}
          <Card className={`mb-8 border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent transform transition-all duration-700 delay-300 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {amount && (
                  <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                    <p className="text-sm text-muted-foreground mb-1">Amount Paid</p>
                    <p className="text-4xl font-bold text-green-600">${parseFloat(amount).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground mt-1">CAD</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                    <p className="text-muted-foreground text-xs mb-1">Payment Status</p>
                    <p className="font-semibold text-blue-600 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                      In Escrow
                    </p>
                  </div>
                  <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                    <p className="text-muted-foreground text-xs mb-1">Protection</p>
                    <p className="font-semibold text-green-600">Buyer Protected</p>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-xl text-left">
                  <p className="text-sm font-medium mb-2">What happens next?</p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>The tasker has been notified of your payment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Funds are held securely until task completion</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Release payment when you're satisfied with the work</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className={`space-y-4 transform transition-all duration-700 delay-500 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/bookings')} size="lg" className="gap-2">
                View Booking
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => navigate('/messages')} size="lg" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Message Tasker
              </Button>
            </div>
            
            <div className="flex justify-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/payments')} size="sm" className="gap-2">
                <Receipt className="h-4 w-4" />
                View Receipt
              </Button>
              <Button variant="ghost" onClick={handleShare} size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="ghost" onClick={() => navigate('/')} size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
