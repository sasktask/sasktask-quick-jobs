import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CalendarIcon, 
  MapPin, 
  Clock,
  CreditCard,
  Wallet,
  Truck,
  Package,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CartItem {
  id: string;
  menuName: string;
  pricePerMeal: number;
  quantity: number;
}

interface TiffinOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  providerName: string;
  cartItems: CartItem[];
}

export function TiffinOrderForm({ 
  isOpen, 
  onClose, 
  providerId, 
  providerName,
  cartItems 
}: TiffinOrderFormProps) {
  const [orderType, setOrderType] = useState<"one-time" | "subscription">("one-time");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet">("card");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.pricePerMeal * item.quantity), 0);
  const deliveryFee = 3.00;
  const total = subtotal + deliveryFee;

  const timeSlots = [
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "18:00", "18:30", "19:00", "19:30", "20:00"
  ];

  const handleSubmit = async () => {
    if (!deliveryAddress.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }
    if (!scheduledDate) {
      toast.error("Please select a delivery date");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please login to place an order");
        setIsSubmitting(false);
        return;
      }

      // Create order for each cart item
      for (const item of cartItems) {
        const { error } = await supabase.from("tiffin_orders").insert({
          customer_id: session.user.id,
          provider_id: providerId,
          menu_id: item.id,
          quantity: item.quantity,
          total_amount: item.pricePerMeal * item.quantity,
          order_type: orderType,
          delivery_address: deliveryAddress,
          delivery_instructions: deliveryInstructions || null,
          scheduled_date: format(scheduledDate, "yyyy-MM-dd"),
          scheduled_time: scheduledTime,
          status: "pending",
          payment_status: "pending"
        });

        if (error) throw error;
      }

      toast.success("Order placed successfully!");
      onClose();
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Your Order</DialogTitle>
          <DialogDescription>
            Order from {providerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Order Summary</h4>
            <div className="space-y-2">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.menuName} × {item.quantity}</span>
                  <span>${(item.pricePerMeal * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order Type */}
          <div className="space-y-3">
            <Label>Order Type</Label>
            <RadioGroup 
              value={orderType} 
              onValueChange={(v) => setOrderType(v as "one-time" | "subscription")}
              className="grid grid-cols-2 gap-4"
            >
              <Label 
                htmlFor="one-time" 
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                  orderType === "one-time" ? "border-primary bg-primary/5" : "border-muted"
                )}
              >
                <RadioGroupItem value="one-time" id="one-time" className="sr-only" />
                <Package className="h-6 w-6 mb-2" />
                <span className="font-medium">One-Time</span>
                <span className="text-xs text-muted-foreground">Single delivery</span>
              </Label>
              <Label 
                htmlFor="subscription" 
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                  orderType === "subscription" ? "border-primary bg-primary/5" : "border-muted"
                )}
              >
                <RadioGroupItem value="subscription" id="subscription" className="sr-only" />
                <Truck className="h-6 w-6 mb-2" />
                <span className="font-medium">Subscribe</span>
                <span className="text-xs text-muted-foreground">Weekly delivery</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Delivery Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="address"
                placeholder="Enter your full address"
                className="pl-10"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Delivery Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
            <Textarea 
              id="instructions"
              placeholder="Gate code, apartment number, special instructions..."
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              rows={2}
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Delivery Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduledDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Delivery Time *</Label>
              <select 
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={(v) => setPaymentMethod(v as "card" | "wallet")}
              className="space-y-2"
            >
              <Label 
                htmlFor="card" 
                className={cn(
                  "flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                  paymentMethod === "card" ? "border-primary bg-primary/5" : "border-muted"
                )}
              >
                <RadioGroupItem value="card" id="card" />
                <CreditCard className="h-5 w-5" />
                <div>
                  <span className="font-medium">Credit/Debit Card</span>
                  <p className="text-xs text-muted-foreground">Pay securely with card</p>
                </div>
              </Label>
              <Label 
                htmlFor="wallet" 
                className={cn(
                  "flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                  paymentMethod === "wallet" ? "border-primary bg-primary/5" : "border-muted"
                )}
              >
                <RadioGroupItem value="wallet" id="wallet" />
                <Wallet className="h-5 w-5" />
                <div>
                  <span className="font-medium">Wallet Balance</span>
                  <p className="text-xs text-muted-foreground">Use your SaskTask wallet</p>
                </div>
              </Label>
            </RadioGroup>
          </div>

          {/* Safety Notice */}
          <div className="flex items-start gap-3 bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-green-700 dark:text-green-400">Safe & Hygienic</p>
              <p className="text-green-600 dark:text-green-500 text-xs">
                All our home chefs are verified with certified kitchens and follow strict hygiene protocols.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                Processing...
              </>
            ) : (
              <>
                Place Order - ${total.toFixed(2)}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
