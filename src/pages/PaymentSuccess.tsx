import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Home, Receipt } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showContent, setShowContent] = useState(false);
  
  const bookingId = searchParams.get('booking_id');
  const amount = searchParams.get('amount');

  useEffect(() => {
    // Show content with animation delay
    setTimeout(() => setShowContent(true), 300);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Payment Successful - SaskTask"
        description="Your payment has been processed successfully"
      />
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          {/* Success Animation */}
          <div className={`transform transition-all duration-700 ${showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <div className="relative mx-auto mb-8">
              <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto animate-pulse">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-4 border-green-500/20 animate-ping" />
            </div>

            <h1 className="text-3xl font-bold mb-3">Payment Successful!</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Your payment has been processed and the funds are now held in escrow.
            </p>
          </div>

          {/* Payment Details Card */}
          <Card className={`mb-8 transform transition-all duration-700 delay-300 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {amount && (
                  <div className="p-4 bg-green-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Amount Paid</p>
                    <p className="text-3xl font-bold text-green-600">${parseFloat(amount).toFixed(2)} CAD</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-semibold text-blue-600">In Escrow</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground">Protection</p>
                    <p className="font-semibold text-green-600">Buyer Protected</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg text-left">
                  <p className="text-sm text-blue-600 font-medium mb-1">What happens next?</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• The tasker will be notified of your payment</li>
                    <li>• Funds are held securely until task completion</li>
                    <li>• Release payment when you're satisfied with the work</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className={`flex flex-col sm:flex-row gap-3 justify-center transform transition-all duration-700 delay-500 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <Button onClick={() => navigate('/bookings')} size="lg">
              View Bookings
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/payments')} size="lg">
              <Receipt className="h-4 w-4 mr-2" />
              Payment History
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')} size="lg">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
