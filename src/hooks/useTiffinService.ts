import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TiffinProvider {
  id: string;
  businessName: string;
  description: string;
  cuisineType: string[];
  avgRating: number;
  totalOrders: number;
  isVegetarian: boolean;
  isVegan?: boolean;
  isHalal?: boolean;
  isGlutenFree?: boolean;
  priceRange: string;
  deliveryAreas: string[];
  deliveryTime: string;
  coverImage?: string;
  kitchenCertified: boolean;
  spiceLevel: number;
  specialties: string[];
}

interface TiffinOrder {
  id: string;
  menuId: string;
  quantity: number;
  totalAmount: number;
  deliveryAddress: string;
  status: string;
  scheduledDate?: string;
}

export const useTiffinService = (userId: string | null) => {
  const [providers, setProviders] = useState<TiffinProvider[]>([]);
  const [orders, setOrders] = useState<TiffinOrder[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  const fetchProviders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("tiffin_providers")
        .select(`
          *,
          tiffin_menus (*)
        `)
        .eq("is_active", true);

      if (error) throw error;

      const transformed = (data || []).map((p: any) => ({
        id: p.id,
        businessName: p.business_name,
        description: p.description,
        cuisineType: p.cuisine_type || [],
        avgRating: p.avg_rating || 0,
        totalOrders: p.total_orders || 0,
        isVegetarian: p.is_vegetarian,
        isVegan: p.is_vegan,
        isHalal: p.is_halal,
        isGlutenFree: p.is_gluten_free,
        priceRange: p.price_range || "$10-20",
        deliveryAreas: p.delivery_areas || [],
        deliveryTime: p.delivery_time || "30-45 min",
        coverImage: p.cover_image_url,
        kitchenCertified: p.is_certified,
        spiceLevel: p.default_spice_level || 2,
        specialties: p.specialties || []
      }));

      setProviders(transformed);
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("tiffin_orders")
        .select(`
          *,
          tiffin_menus (*),
          tiffin_providers (business_name)
        `)
        .eq("customer_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders((data || []).map((o: any) => ({
        id: o.id,
        menuId: o.menu_id,
        quantity: o.quantity,
        totalAmount: o.total_amount,
        deliveryAddress: o.delivery_address,
        status: o.status,
        scheduledDate: o.scheduled_date
      })));
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }, [userId]);

  const fetchSubscriptions = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("tiffin_subscriptions")
        .select(`
          *,
          tiffin_providers (business_name)
        `)
        .eq("customer_id", userId)
        .eq("is_active", true);

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  }, [userId]);

  const createOrder = async (orderData: {
    providerId: string;
    menuId: string;
    quantity: number;
    totalAmount: number;
    deliveryAddress: string;
    deliveryInstructions?: string;
    specialRequests?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    orderType: "single" | "subscription";
  }): Promise<boolean> => {
    if (!userId) {
      toast.error("Please sign in to place an order");
      return false;
    }

    try {
      const { error } = await supabase
        .from("tiffin_orders")
        .insert({
          customer_id: userId,
          provider_id: orderData.providerId,
          menu_id: orderData.menuId,
          quantity: orderData.quantity,
          total_amount: orderData.totalAmount,
          delivery_address: orderData.deliveryAddress,
          delivery_instructions: orderData.deliveryInstructions,
          special_requests: orderData.specialRequests,
          scheduled_date: orderData.scheduledDate,
          scheduled_time: orderData.scheduledTime,
          order_type: orderData.orderType,
          status: "pending",
          payment_status: "pending"
        });

      if (error) throw error;

      toast.success("Order placed successfully!");
      fetchOrders();
      return true;
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error("Failed to place order");
      return false;
    }
  };

  const createSubscription = async (subData: {
    providerId: string;
    planType: string;
    mealsPerWeek: number;
    pricePerWeek: number;
    deliveryAddress: string;
    menuId: string;
  }): Promise<boolean> => {
    if (!userId) {
      toast.error("Please sign in to subscribe");
      return false;
    }

    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const { error } = await supabase
        .from("tiffin_subscriptions")
        .insert({
          customer_id: userId,
          provider_id: subData.providerId,
          menu_id: subData.menuId,
          subscription_type: subData.planType || 'weekly',
          price_per_meal: subData.pricePerWeek ? subData.pricePerWeek / (subData.mealsPerWeek || 7) : 10,
          delivery_address: subData.deliveryAddress,
          start_date: startDate.toISOString().split('T')[0],
          is_active: true
        });

      if (error) throw error;

      toast.success("Subscription created!");
      fetchSubscriptions();
      return true;
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      toast.error("Failed to create subscription");
      return false;
    }
  };

  const cancelSubscription = async (subscriptionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("tiffin_subscriptions")
        .update({ 
          is_active: false,
          cancelled_at: new Date().toISOString()
        })
        .eq("id", subscriptionId);

      if (error) throw error;

      toast.success("Subscription cancelled");
      fetchSubscriptions();
      return true;
    } catch (error) {
      toast.error("Failed to cancel subscription");
      return false;
    }
  };

  const submitReview = async (reviewData: {
    orderId: string;
    providerId: string;
    tasteRating: number;
    hygieneRating: number;
    packagingRating: number;
    deliveryRating: number;
    comment?: string;
    photoUrls?: string[];
  }): Promise<boolean> => {
    if (!userId) return false;

    try {
      const overallRating = (
        reviewData.tasteRating + 
        reviewData.hygieneRating + 
        reviewData.packagingRating + 
        reviewData.deliveryRating
      ) / 4;

      const { error } = await supabase
        .from("tiffin_reviews")
        .insert({
          order_id: reviewData.orderId,
          customer_id: userId,
          provider_id: reviewData.providerId,
          taste_rating: reviewData.tasteRating,
          hygiene_rating: reviewData.hygieneRating,
          packaging_rating: reviewData.packagingRating,
          delivery_rating: reviewData.deliveryRating,
          overall_rating: overallRating,
          comment: reviewData.comment,
          photo_urls: reviewData.photoUrls
        });

      if (error) throw error;

      toast.success("Review submitted!");
      return true;
    } catch (error) {
      toast.error("Failed to submit review");
      return false;
    }
  };

  const toggleFavorite = async (providerId: string) => {
    if (favorites.includes(providerId)) {
      setFavorites(prev => prev.filter(id => id !== providerId));
    } else {
      setFavorites(prev => [...prev, providerId]);
    }
    // Could persist to database if needed
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchProviders();
      if (userId) {
        await Promise.all([fetchOrders(), fetchSubscriptions()]);
      }
      setIsLoading(false);
    };

    loadData();
  }, [userId, fetchProviders, fetchOrders, fetchSubscriptions]);

  // Real-time order updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("tiffin-orders")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tiffin_orders",
          filter: `customer_id=eq.${userId}`
        },
        (payload) => {
          const newStatus = (payload.new as any).status;
          const statusMessages: Record<string, string> = {
            confirmed: "Your order has been confirmed! 🎉",
            preparing: "Your meal is being prepared 👨‍🍳",
            out_for_delivery: "Your order is on the way! 🚗",
            delivered: "Your order has been delivered! ✅"
          };

          if (statusMessages[newStatus]) {
            toast.info(statusMessages[newStatus]);
          }

          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchOrders]);

  return {
    providers,
    orders,
    subscriptions,
    favorites,
    isLoading,
    createOrder,
    createSubscription,
    cancelSubscription,
    submitReview,
    toggleFavorite,
    refreshProviders: fetchProviders,
    refreshOrders: fetchOrders
  };
};
