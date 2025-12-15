import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { PaymentPanel } from "@/components/PaymentPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Shield, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Calendar,
  User,
  Briefcase,
  Lock
} from "lucide-react";

interface BookingDetails {
  id: string;
  task: {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    pay_amount: number;
    scheduled_date: string | null;
  };
  tasker: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    rating: number | null;
  };
}

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  
  const [user, setUser] = useState<any>(null);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCheckoutData();
  }, [bookingId]);

  const loadCheckoutData = async () => {
    try {
      // Check auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      if (!bookingId) {
        setError("No booking specified");
        setLoading(false);
        return;
      }

      // Fetch booking with task and tasker details
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select(`
          id,
          task_doer_id,
          task_id,
          status,
          tasks (
            id,
            title,
            description,
            category,
            location,
            pay_amount,
            scheduled_date,
            task_giver_id
          )
        `)
        .eq("id", bookingId)
        .single();

      if (bookingError) throw bookingError;
      if (!bookingData) throw new Error("Booking not found");

      // Verify user is the task giver
      if (bookingData.tasks.task_giver_id !== session.user.id) {
        setError("You are not authorized to make this payment");
        setLoading(false);
        return;
      }

      // Fetch tasker profile
      const { data: taskerData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, rating")
        .eq("id", bookingData.task_doer_id)
        .single();

      setBooking({
        id: bookingData.id,
        task: bookingData.tasks,
        tasker: taskerData || { id: bookingData.task_doer_id, full_name: "Tasker", avatar_url: null, rating: null }
      });
    } catch (err: any) {
      console.error("Checkout load error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    navigate(`/payment-success?booking_id=${bookingId}&amount=${booking?.task.pay_amount}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title="Checkout Error - SaskTask" description="Unable to process checkout" />
        <Navbar />
        <main className="container mx-auto px-4 py-16 pt-24 text-center">
          <div className="max-w-md mx-auto">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Checkout Error</h1>
            <p className="text-muted-foreground mb-6">{error || "Unable to load checkout"}</p>
            <Button onClick={() => navigate("/bookings")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bookings
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Secure Checkout - SaskTask"
        description="Complete your secure payment for task services"
      />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Secure Checkout</h1>
          <p className="text-muted-foreground mb-8">Complete your payment to confirm the booking</p>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Order Summary - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Task Info */}
                  <div className="space-y-3">
                    <div>
                      <Badge variant="secondary" className="mb-2">{booking.task.category}</Badge>
                      <h3 className="font-semibold text-lg">{booking.task.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {booking.task.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{booking.task.location}</span>
                    </div>

                    {booking.task.scheduled_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(booking.task.scheduled_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Tasker Info */}
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-2">Service Provider</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {booking.tasker.avatar_url ? (
                          <img 
                            src={booking.tasker.avatar_url} 
                            alt={booking.tasker.full_name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{booking.tasker.full_name}</p>
                        {booking.tasker.rating && (
                          <p className="text-sm text-muted-foreground">
                            ⭐ {booking.tasker.rating.toFixed(1)} rating
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Indicators */}
              <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                        <Shield className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Escrow Protection</p>
                        <p className="text-xs text-muted-foreground">
                          Your payment is held securely until you confirm task completion
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Lock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Secure Payment</p>
                        <p className="text-xs text-muted-foreground">
                          256-bit encryption via Stripe for all transactions
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Money-Back Guarantee</p>
                        <p className="text-xs text-muted-foreground">
                          Full refund if the task isn't completed satisfactorily
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Panel - Right Side */}
            <div className="lg:col-span-3">
              {user && (
                <PaymentPanel
                  bookingId={booking.id}
                  taskId={booking.task.id}
                  payerId={user.id}
                  payeeId={booking.tasker.id}
                  amount={booking.task.pay_amount}
                  payeeName={booking.tasker.full_name}
                  onPaymentComplete={handlePaymentComplete}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
