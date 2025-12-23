import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  MapPin, 
  Leaf, 
  Shield, 
  Clock,
  Flame,
  CheckCircle2,
  Plus,
  Minus,
  ShoppingCart,
  Calendar,
  Info,
  ChefHat,
  Utensils
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  menuName: string;
  description: string;
  items: string[];
  pricePerMeal: number;
  mealType: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isHalal: boolean;
  isGlutenFree: boolean;
  spiceLevel: number;
  caloriesApprox: number;
  coverImageUrl?: string;
  cuisineOrigin?: string;
  preparationTimeMinutes: number;
}

interface TiffinProvider {
  id: string;
  businessName: string;
  cuisineType: string[];
  description: string;
  avgRating: number;
  totalOrders: number;
  isVegetarian?: boolean;
  isHalal?: boolean;
  hygienicRating: number;
  priceRange: string;
  deliveryAreas: string[];
  kitchenCertified: boolean;
  coverImage: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface TiffinMenuDialogProps {
  provider: TiffinProvider | null;
  isOpen: boolean;
  onClose: () => void;
  onOrder: (providerId: string, items: CartItem[]) => void;
}

export function TiffinMenuDialog({ provider, isOpen, onClose, onOrder }: TiffinMenuDialogProps) {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("lunch");

  useEffect(() => {
    if (provider && isOpen) {
      fetchMenus();
    }
  }, [provider, isOpen]);

  const fetchMenus = async () => {
    if (!provider) return;
    setLoading(true);
    
    // For demo, using mock data since we don't have real providers yet
    const mockMenus: MenuItem[] = [
      {
        id: "1",
        menuName: "Daily Thali Special",
        description: "A complete balanced meal with seasonal vegetables, dal, rice, rotis, and dessert",
        items: ["2 Rotis", "Rice", "Dal Tadka", "Seasonal Sabzi", "Salad", "Pickle", "Sweet"],
        pricePerMeal: 12,
        mealType: "lunch",
        isVegetarian: true,
        isVegan: false,
        isHalal: true,
        isGlutenFree: false,
        spiceLevel: 2,
        caloriesApprox: 650,
        preparationTimeMinutes: 45,
        cuisineOrigin: "North Indian"
      },
      {
        id: "2",
        menuName: "Protein Power Box",
        description: "High protein meal with paneer/chicken, lentils, and whole grains",
        items: ["Paneer/Chicken Curry", "Brown Rice", "Mixed Dal", "Roti", "Raita"],
        pricePerMeal: 15,
        mealType: "lunch",
        isVegetarian: false,
        isVegan: false,
        isHalal: true,
        isGlutenFree: false,
        spiceLevel: 3,
        caloriesApprox: 750,
        preparationTimeMinutes: 50,
        cuisineOrigin: "Fusion"
      },
      {
        id: "3",
        menuName: "Light Dinner Box",
        description: "Light and easy to digest dinner options",
        items: ["Khichdi", "Kadhi", "Papad", "Pickle", "Buttermilk"],
        pricePerMeal: 10,
        mealType: "dinner",
        isVegetarian: true,
        isVegan: false,
        isHalal: true,
        isGlutenFree: true,
        spiceLevel: 1,
        caloriesApprox: 450,
        preparationTimeMinutes: 30,
        cuisineOrigin: "Gujarati"
      },
      {
        id: "4",
        menuName: "South Indian Feast",
        description: "Authentic South Indian spread with sambhar, rasam, and more",
        items: ["Rice", "Sambhar", "Rasam", "Kootu", "Poriyal", "Curd", "Papad"],
        pricePerMeal: 14,
        mealType: "lunch",
        isVegetarian: true,
        isVegan: true,
        isHalal: true,
        isGlutenFree: true,
        spiceLevel: 2,
        caloriesApprox: 600,
        preparationTimeMinutes: 45,
        cuisineOrigin: "South Indian"
      }
    ];
    
    setMenus(mockMenus);
    setLoading(false);
  };

  const addToCart = (menu: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === menu.id);
      if (existing) {
        return prev.map(item => 
          item.id === menu.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...menu, quantity: 1 }];
    });
    toast.success(`Added ${menu.menuName} to cart`);
  };

  const updateQuantity = (menuId: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(item => {
        if (item.id === menuId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
      return updated;
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.pricePerMeal * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredMenus = menus.filter(menu => menu.mealType === selectedTab);

  if (!provider) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        {/* Header with Image */}
        <div className="relative h-48">
          <img 
            src={provider.coverImage} 
            alt={provider.businessName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-1">
              {provider.kitchenCertified && (
                <Badge className="bg-green-500/90">
                  <Shield className="h-3 w-3 mr-1" />
                  Certified
                </Badge>
              )}
            </div>
            <h2 className="text-2xl font-bold">{provider.businessName}</h2>
            <div className="flex items-center gap-4 mt-1 text-white/90 text-sm">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                {provider.avgRating} ({provider.totalOrders} orders)
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {provider.deliveryAreas[0]}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-12rem)]">
          {/* Menu Section */}
          <div className="flex-1 p-6 overflow-hidden">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="lunch" className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  Lunch
                </TabsTrigger>
                <TabsTrigger value="dinner" className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  Dinner
                </TabsTrigger>
                <TabsTrigger value="breakfast" className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  Breakfast
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[calc(100%-3rem)]">
                <div className="space-y-4 pr-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredMenus.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ChefHat className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No {selectedTab} menus available</p>
                    </div>
                  ) : (
                    filteredMenus.map(menu => (
                      <Card key={menu.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{menu.menuName}</h3>
                              {menu.cuisineOrigin && (
                                <span className="text-xs text-muted-foreground">{menu.cuisineOrigin}</span>
                              )}
                            </div>
                            <span className="text-xl font-bold text-primary">${menu.pricePerMeal}</span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">{menu.description}</p>
                          
                          {/* Menu Items */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {menu.items.map((item, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                          
                          {/* Info Row */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                            {menu.isVegetarian && (
                              <span className="flex items-center gap-1 text-green-600">
                                <Leaf className="h-3 w-3" /> Veg
                              </span>
                            )}
                            {menu.isVegan && (
                              <span className="flex items-center gap-1 text-emerald-600">
                                <Leaf className="h-3 w-3" /> Vegan
                              </span>
                            )}
                            {menu.isGlutenFree && (
                              <span className="text-blue-600">Gluten-Free</span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {menu.preparationTimeMinutes} min
                            </span>
                            <span>{menu.caloriesApprox} cal</span>
                            <span className="flex items-center gap-0.5">
                              Spice: {[...Array(5)].map((_, i) => (
                                <Flame key={i} className={`h-3 w-3 ${i < menu.spiceLevel ? 'text-red-500 fill-red-500' : 'text-muted'}`} />
                              ))}
                            </span>
                          </div>
                          
                          {/* Add Button */}
                          {cart.find(item => item.id === menu.id) ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateQuantity(menu.id, -1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="font-medium w-8 text-center">
                                {cart.find(item => item.id === menu.id)?.quantity}
                              </span>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateQuantity(menu.id, 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => addToCart(menu)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add to Cart
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Cart Sidebar */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l bg-muted/30 p-4">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="h-5 w-5" />
              <h3 className="font-semibold">Your Order</h3>
              {totalItems > 0 && (
                <Badge variant="secondary">{totalItems}</Badge>
              )}
            </div>
            
            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Your cart is empty</p>
                <p className="text-xs">Add items from the menu</p>
              </div>
            ) : (
              <>
                <ScrollArea className="h-48 lg:h-64">
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-background rounded-lg p-3">
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-1">{item.menuName}</p>
                          <p className="text-xs text-muted-foreground">${item.pricePerMeal} × {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <Separator className="my-4" />

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Delivery Fee</span>
                    <span>$3.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${(totalAmount + 3).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => onOrder(provider.id, cart)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Order Now
                  </Button>
                  <Button variant="outline" className="w-full">
                    Subscribe for Weekly
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
