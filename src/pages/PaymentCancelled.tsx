import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, Home, RefreshCw, MessageCircle } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

export default function PaymentCancelled() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const bookingId = searchParams.get('booking_id');

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Payment Cancelled - SaskTask"
        description="Your payment was cancelled"
      />
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          {/* Cancelled Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto">
              <XCircle className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-3">Payment Cancelled</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Your payment was not processed. No charges have been made to your account.
          </p>

          {/* Info Card */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg text-left">
                  <p className="font-medium mb-2">Why was my payment cancelled?</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• You chose to cancel during checkout</li>
                    <li>• The payment session may have expired</li>
                    <li>• There might have been a technical issue</li>
                  </ul>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-left">
                  <p className="text-sm text-primary font-medium mb-1">Need help?</p>
                  <p className="text-sm text-muted-foreground">
                    If you're experiencing issues with payments, please contact our support team.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {bookingId && (
              <Button onClick={() => navigate(`/bookings`)} size="lg">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/bookings')} size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bookings
            </Button>
            <Button variant="ghost" onClick={() => navigate('/contact')} size="lg">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
