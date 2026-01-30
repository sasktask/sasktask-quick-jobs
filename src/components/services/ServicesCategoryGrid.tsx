import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Truck, Wrench, Leaf, Dog, Baby, Heart, Package, Plug, PaintBucket,
  Hammer, Snowflake, ShoppingBag, Monitor, Car, Camera, GraduationCap,
  Zap, ArrowRight, TrendingUp
} from "lucide-react";

interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  taskCount?: number;
  trending?: boolean;
}

const categories: ServiceCategory[] = [
  { id: "cleaning", title: "Cleaning", description: "House, office, deep clean", icon: Sparkles, color: "from-purple-500 to-pink-500", taskCount: 45, trending: true },
  { id: "moving", title: "Moving Help", description: "Load, unload, heavy lifting", icon: Truck, color: "from-orange-500 to-red-500", taskCount: 28 },
  { id: "handyman", title: "Handyman", description: "Repairs & installations", icon: Hammer, color: "from-stone-500 to-zinc-500", taskCount: 62, trending: true },
  { id: "yard", title: "Yard & Garden", description: "Mowing, landscaping", icon: Leaf, color: "from-lime-500 to-green-500", taskCount: 34 },
  { id: "assembly", title: "Furniture Assembly", description: "IKEA, desks, shelving", icon: Package, color: "from-green-500 to-emerald-500", taskCount: 19 },
  { id: "electrical", title: "Electrical", description: "Wiring, outlets, lights", icon: Plug, color: "from-yellow-500 to-amber-500", taskCount: 15 },
  { id: "painting", title: "Painting", description: "Interior & exterior", icon: PaintBucket, color: "from-indigo-500 to-blue-500", taskCount: 22 },
  { id: "snow", title: "Snow Removal", description: "Driveways, walkways", icon: Snowflake, color: "from-blue-400 to-cyan-400", taskCount: 8 },
  { id: "pet-care", title: "Pet Care", description: "Walking, sitting, grooming", icon: Dog, color: "from-pink-500 to-rose-500", taskCount: 31 },
  { id: "childcare", title: "Childcare", description: "Babysitting, tutoring", icon: Baby, color: "from-pink-400 to-rose-400", taskCount: 12 },
  { id: "errands", title: "Errands", description: "Shopping, pickup, delivery", icon: ShoppingBag, color: "from-green-500 to-teal-500", taskCount: 41 },
  { id: "tech", title: "Tech Help", description: "Setup, repair, troubleshoot", icon: Monitor, color: "from-indigo-500 to-purple-500", taskCount: 18 },
  { id: "auto", title: "Auto Services", description: "Wash, detail, minor repairs", icon: Car, color: "from-blue-400 to-cyan-400", taskCount: 14 },
  { id: "plumbing", title: "Plumbing", description: "Leaks, installations", icon: Wrench, color: "from-blue-500 to-indigo-500", taskCount: 21 },
  { id: "photography", title: "Photography", description: "Events, portraits", icon: Camera, color: "from-rose-500 to-pink-500", taskCount: 9 },
  { id: "tutoring", title: "Tutoring", description: "Academic, test prep", icon: GraduationCap, color: "from-blue-500 to-indigo-500", taskCount: 16 },
];

interface ServicesCategoryGridProps {
  onCategorySelect?: (categoryId: string) => void;
  showCounts?: boolean;
}

export function ServicesCategoryGrid({ onCategorySelect, showCounts = true }: ServicesCategoryGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {categories.map((category, index) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Link 
            to={`/browse?category=${category.id}`}
            onClick={() => onCategorySelect?.(category.id)}
          >
            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden h-full">
              <CardContent className="p-4 relative">
                {/* Trending badge */}
                {category.trending && (
                  <Badge 
                    variant="secondary" 
                    className="absolute top-2 right-2 text-xs bg-primary/10 text-primary"
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Hot
                  </Badge>
                )}
                
                {/* Icon with gradient background */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                
                {/* Title and description */}
                <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                  {category.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {category.description}
                </p>
                
                {/* Task count */}
                {showCounts && category.taskCount && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Zap className="w-3 h-3 text-primary" />
                    <span>{category.taskCount} tasks available</span>
                  </div>
                )}
                
                {/* Arrow indicator */}
                <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
