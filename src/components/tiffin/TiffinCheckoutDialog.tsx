import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, CalendarDays, Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface TiffinCheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  provider: {
    id: string;
    businessName: string;
    deliveryTime: string;
    deliveryAreas: string[];
  };
  cartItems: CartItem[];
  onOrderComplete: () => void;
}

export const TiffinCheckoutDialog = ({
  open,
  onClose,
  provider,
  cartItems,
  onOrderComplete
}: TiffinCheckoutDialogProps) => {
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<CartItem[]>(cartItems);

  const deliveryFee = 3.99;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + deliveryFee;

  const timeSlots = [
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "1:00 PM", "1:30 PM", "6:00 PM", "6:30 PM",
    "7:00 PM", "7:30 PM", "8:00 PM"
  ];

  const updateQuantity = (itemId: string, delta: number) => {
    setItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const handleSubmit = async () => {
    if (!deliveryAddress.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate order creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Order placed successfully!", {
        description: "You'll receive a confirmation shortly"
      });
      
      onOrderComplete();
      onClose();
    } catch (error) {
      toast.error("Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Checkout
          </DialogTitle>
          <DialogDescription>
            Complete your order from {provider.businessName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h4 className="font-semibold">Order Summary</h4>
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="pt-3 border-t space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Delivery Address
            </Label>
            <Input
              id="address"
              placeholder="Enter your full address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
            <div className="flex flex-wrap gap-1">
              {provider.deliveryAreas.slice(0, 3).map(area => (
                <Badge 
                  key={area} 
                  variant="outline" 
                  className="text-xs cursor-pointer hover:bg-primary/10"
                  onClick={() => setDeliveryAddress(area)}
                >
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          {/* Schedule Delivery */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduledDate && "text-muted-foreground"
                    )}
                  >
                    {scheduledDate ? format(scheduledDate, "PPP") : "Today"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
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
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time
              </Label>
              <Select value={scheduledTime} onValueChange={setScheduledTime}>
                <SelectTrigger>
                  <SelectValue placeholder="ASAP" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asap">ASAP ({provider.deliveryTime})</SelectItem>
                  {timeSlots.map(slot => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              placeholder="Gate code, building instructions, etc."
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="special">Special Requests (Optional)</Label>
            <Textarea
              id="special"
              placeholder="Allergies, extra spicy, etc."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={2}
            />
          </div>

          {/* Submit Button */}
          <Button
            className="w-full h-12 text-lg"
            onClick={handleSubmit}
            disabled={isSubmitting || items.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>Place Order • ${total.toFixed(2)}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
