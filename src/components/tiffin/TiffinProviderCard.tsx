import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  MapPin, 
  Leaf, 
  Shield, 
  Heart,
  Clock,
  ChefHat,
  Flame,
  CheckCircle2,
  ArrowRight,
  Eye,
  Phone,
  MessageCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface TiffinProvider {
  id: string;
  businessName: string;
  cuisineType: string[];
  description: string;
  avgRating: number;
  totalOrders: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isHalal?: boolean;
  isGlutenFree?: boolean;
  hygienicRating: number;
  priceRange: string;
  deliveryAreas: string[];
  kitchenCertified: boolean;
  coverImage: string;
  deliveryTime?: string;
  spiceLevel?: number;
  specialties?: string[];
}

interface TiffinProviderCardProps {
  provider: TiffinProvider;
  onViewMenu: (provider: TiffinProvider) => void;
  onFavorite?: (providerId: string) => void;
  isFavorite?: boolean;
}

export function TiffinProviderCard({ 
  provider, 
  onViewMenu, 
  onFavorite,
  isFavorite = false 
}: TiffinProviderCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-2 hover:border-primary/30"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-52">
          <img 
            src={provider.coverImage} 
            alt={provider.businessName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {provider.kitchenCertified && (
              <Badge className="bg-green-500 text-white shadow-lg">
                <Shield className="h-3 w-3 mr-1" />
                Certified Kitchen
              </Badge>
            )}
            {provider.totalOrders > 100 && (
              <Badge className="bg-orange-500 text-white shadow-lg">
                <Flame className="h-3 w-3 mr-1" />
                Popular
              </Badge>
            )}
          </div>
          
          {/* Dietary Badges */}
          <div className="absolute top-3 right-3 flex gap-1">
            {provider.isVegetarian && (
              <Badge className="bg-green-100 text-green-700 border-green-300 shadow-sm">
                <Leaf className="h-3 w-3 mr-1" />
                Veg
              </Badge>
            )}
            {provider.isVegan && (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm">
                Vegan
              </Badge>
            )}
            {provider.isHalal && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-300 shadow-sm">
                Halal
              </Badge>
            )}
            {provider.isGlutenFree && (
              <Badge className="bg-blue-100 text-blue-700 border-blue-300 shadow-sm">
                GF
              </Badge>
            )}
          </div>
          
          {/* Favorite Button */}
          {onFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavorite(provider.id);
              }}
              className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
            >
              <Heart 
                className={`h-5 w-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
              />
            </button>
          )}
          
          {/* Bottom Info Overlay */}
          <div className="absolute bottom-3 left-3 right-12">
            <h3 className="font-bold text-lg text-white drop-shadow-md">{provider.businessName}</h3>
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <MapPin className="h-3 w-3" />
              <span>{provider.deliveryAreas.slice(0, 2).join(", ")}</span>
            </div>
          </div>
        </div>
        
        <CardContent className="p-4 space-y-3">
          {/* Rating & Orders */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="font-bold">{provider.avgRating}</span>
              </div>
              <span className="text-muted-foreground text-sm">({provider.totalOrders} orders)</span>
            </div>
            <span className="font-semibold text-primary text-lg">{provider.priceRange}</span>
          </div>
          
          {/* Cuisine Tags */}
          <div className="flex flex-wrap gap-1">
            {provider.cuisineType.map(cuisine => (
              <Badge key={cuisine} variant="secondary" className="text-xs">
                {cuisine}
              </Badge>
            ))}
          </div>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {provider.description}
          </p>
          
          {/* Specialties */}
          {provider.specialties && provider.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {provider.specialties.slice(0, 3).map(specialty => (
                <span 
                  key={specialty} 
                  className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}
          
          {/* Info Row */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{provider.deliveryTime || "30-45 min"}</span>
            </div>
            
            {/* Hygiene Rating */}
            <div className="flex items-center gap-1">
              <span className="text-xs">Hygiene:</span>
              {[...Array(5)].map((_, i) => (
                <CheckCircle2 
                  key={i} 
                  className={`h-3 w-3 ${i < provider.hygienicRating ? 'text-green-500' : 'text-muted'}`} 
                />
              ))}
            </div>
          </div>
          
          {/* Spice Level */}
          {provider.spiceLevel !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Spice:</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Flame 
                    key={i}
                    className={`h-3 w-3 ${i < provider.spiceLevel! ? 'text-red-500 fill-red-500' : 'text-muted'}`}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              className="flex-1" 
              onClick={() => onViewMenu(provider)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Menu
            </Button>
            <Button variant="outline" size="icon">
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
