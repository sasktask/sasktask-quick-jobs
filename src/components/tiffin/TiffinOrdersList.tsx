import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Package, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Truck,
  ChefHat,
  Star,
  MessageSquare,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  providerName: string;
  providerImage?: string;
  menuName: string;
  quantity: number;
  totalAmount: number;
  status: "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";
  deliveryAddress: string;
  scheduledDate?: string;
  createdAt: string;
}

interface TiffinOrdersListProps {
  orders: Order[];
  onReorder?: (order: Order) => void;
  onReview?: (order: Order) => void;
  onCancel?: (orderId: string) => void;
}

export const TiffinOrdersList = ({
  orders,
  onReorder,
  onReview,
  onCancel
}: TiffinOrdersListProps) => {
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");

  const activeStatuses = ["pending", "confirmed", "preparing", "out_for_delivery"];
  const activeOrders = orders.filter(o => activeStatuses.includes(o.status));
  const pastOrders = orders.filter(o => !activeStatuses.includes(o.status));

  const statusConfig = {
    pending: { 
      label: "Order Placed", 
      color: "bg-yellow-500/10 text-yellow-600",
      icon: Clock 
    },
    confirmed: { 
      label: "Confirmed", 
      color: "bg-blue-500/10 text-blue-600",
      icon: CheckCircle2 
    },
    preparing: { 
      label: "Preparing", 
      color: "bg-purple-500/10 text-purple-600",
      icon: ChefHat 
    },
    out_for_delivery: { 
      label: "On The Way", 
      color: "bg-orange-500/10 text-orange-600",
      icon: Truck 
    },
    delivered: { 
      label: "Delivered", 
      color: "bg-green-500/10 text-green-600",
      icon: CheckCircle2 
    },
    cancelled: { 
      label: "Cancelled", 
      color: "bg-red-500/10 text-red-600",
      icon: XCircle 
    }
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const config = statusConfig[order.status];
    const StatusIcon = config.icon;

    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 rounded-lg">
              <AvatarImage src={order.providerImage} />
              <AvatarFallback className="rounded-lg bg-primary/10">
                <ChefHat className="h-6 w-6 text-primary" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="font-semibold truncate">{order.providerName}</h4>
                <Badge className={cn("shrink-0", config.color)}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-2">
                {order.quantity}x {order.menuName}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {order.deliveryAddress}
                </span>
                {order.scheduledDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(order.scheduledDate), "MMM d, h:mm a")}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="font-semibold text-primary">
                  ${order.totalAmount.toFixed(2)}
                </span>

                <div className="flex gap-2">
                  {order.status === "pending" && onCancel && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onCancel(order.id)}
                    >
                      Cancel
                    </Button>
                  )}
                  {order.status === "delivered" && (
                    <>
                      {onReview && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onReview(order)}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Review
                        </Button>
                      )}
                      {onReorder && (
                        <Button 
                          size="sm"
                          onClick={() => onReorder(order)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Reorder
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Progress indicator for active orders */}
          {activeStatuses.includes(order.status) && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between">
                {["pending", "confirmed", "preparing", "out_for_delivery", "delivered"].map((step, index) => {
                  const stepIndex = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"].indexOf(order.status);
                  const isComplete = index <= stepIndex;
                  const isCurrent = step === order.status;

                  return (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                        isComplete 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground",
                        isCurrent && "ring-2 ring-primary/30"
                      )}>
                        {index + 1}
                      </div>
                      <span className={cn(
                        "text-[10px] mt-1 text-center",
                        isComplete ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {step.replace("_", " ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-4">
            Start ordering delicious home-cooked meals
          </p>
          <Button>Browse Providers</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "active" | "past")}>
        <TabsList className="w-full">
          <TabsTrigger value="active" className="flex-1">
            Active ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            Past Orders ({pastOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-4">
          {activeOrders.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No active orders
              </CardContent>
            </Card>
          ) : (
            activeOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-4">
          {pastOrders.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No past orders
              </CardContent>
            </Card>
          ) : (
            pastOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
