import { 
  Snowflake, 
  Sparkles, 
  Truck, 
  Wrench, 
  Package, 
  Monitor, 
  Trees, 
  Home, 
  PaintBucket,
  Dog,
  Car,
  Laptop,
  ShoppingBag,
  Utensils,
  GraduationCap,
  Camera,
  Baby,
  Scissors,
  Shirt,
  Mail,
  Key,
  Recycle,
  Hammer,
  Sofa,
  Leaf,
  Droplet,
  Wind,
  Box,
  FileText,
  Gift,
  Music,
  Dumbbell,
  Clock,
  Users,
  Zap,
  Heart,
  Briefcase,
  LucideIcon
} from "lucide-react";

export type TimeEstimate = "quick" | "short" | "medium" | "long" | "flexible";
export type CategoryType = "indoor" | "outdoor" | "both";
export type SkillLevel = "beginner" | "intermediate" | "expert";

export interface Category {
  icon: LucideIcon;
  title: string;
  count: string;
  color: string;
  description: string;
  timeEstimate: TimeEstimate;
  categoryType: CategoryType;
  skillLevel: SkillLevel;
  featured?: boolean;
}

export const timeEstimateLabels: Record<TimeEstimate, { label: string; color: string }> = {
  quick: { label: "Quick (15-30 min)", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  short: { label: "Short (1-2 hrs)", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  medium: { label: "Medium (2-4 hrs)", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  long: { label: "Half Day+", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  flexible: { label: "Flexible", color: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
};

export const categoryTypeLabels: Record<CategoryType, string> = {
  indoor: "Indoor",
  outdoor: "Outdoor", 
  both: "Indoor/Outdoor",
};

export const skillLevelLabels: Record<SkillLevel, string> = {
  beginner: "No Experience Needed",
  intermediate: "Some Experience",
  expert: "Professional Skills",
};

export const categories: Category[] = [
  // Featured Quick Tasks
  {
    icon: Snowflake,
    title: "Snow Removal",
    count: "150+ tasks",
    color: "from-blue-500 to-cyan-500",
    description: "Driveways, walkways, and roofs",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "beginner",
    featured: true
  },
  {
    icon: Sparkles,
    title: "Cleaning",
    count: "200+ tasks",
    color: "from-purple-500 to-pink-500",
    description: "Home, office, and deep cleaning",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "beginner",
    featured: true
  },
  {
    icon: Truck,
    title: "Moving & Delivery",
    count: "180+ tasks",
    color: "from-orange-500 to-red-500",
    description: "Furniture, boxes, and pickups",
    timeEstimate: "medium",
    categoryType: "both",
    skillLevel: "beginner",
    featured: true
  },
  {
    icon: Package,
    title: "Assembly",
    count: "120+ tasks",
    color: "from-green-500 to-emerald-500",
    description: "Furniture, equipment, and installations",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "intermediate",
    featured: true
  },
  {
    icon: Monitor,
    title: "Mounting & Installation",
    count: "90+ tasks",
    color: "from-indigo-500 to-purple-500",
    description: "TVs, shelves, and fixtures",
    timeEstimate: "quick",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Trees,
    title: "Outdoor Help",
    count: "140+ tasks",
    color: "from-teal-500 to-cyan-500",
    description: "Lawn care, gardening, landscaping",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Home,
    title: "Home Repairs",
    count: "110+ tasks",
    color: "from-rose-500 to-pink-500",
    description: "Plumbing, electrical, general fixes",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: PaintBucket,
    title: "Painting",
    count: "85+ tasks",
    color: "from-amber-500 to-orange-500",
    description: "Interior, exterior, touch-ups",
    timeEstimate: "long",
    categoryType: "both",
    skillLevel: "intermediate"
  },
  {
    icon: Dog,
    title: "Pet Care",
    count: "95+ tasks",
    color: "from-pink-500 to-rose-500",
    description: "Walking, sitting, grooming",
    timeEstimate: "short",
    categoryType: "both",
    skillLevel: "beginner",
    featured: true
  },
  {
    icon: Car,
    title: "Auto Services",
    count: "70+ tasks",
    color: "from-slate-500 to-gray-500",
    description: "Detailing, minor repairs, oil changes",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Laptop,
    title: "Tech Support",
    count: "65+ tasks",
    color: "from-blue-500 to-indigo-500",
    description: "Setup, troubleshooting, repairs",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: ShoppingBag,
    title: "Shopping & Errands",
    count: "100+ tasks",
    color: "from-violet-500 to-purple-500",
    description: "Grocery, pickup, deliveries",
    timeEstimate: "quick",
    categoryType: "outdoor",
    skillLevel: "beginner",
    featured: true
  },
  {
    icon: Utensils,
    title: "Meal Prep",
    count: "45+ tasks",
    color: "from-orange-500 to-amber-500",
    description: "Cooking, meal planning, catering",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: GraduationCap,
    title: "Tutoring",
    count: "55+ tasks",
    color: "from-emerald-500 to-green-500",
    description: "Academic, music, language",
    timeEstimate: "short",
    categoryType: "both",
    skillLevel: "expert"
  },
  {
    icon: Camera,
    title: "Photography",
    count: "40+ tasks",
    color: "from-sky-500 to-blue-500",
    description: "Events, portraits, product photos",
    timeEstimate: "medium",
    categoryType: "both",
    skillLevel: "expert"
  },
  {
    icon: Wrench,
    title: "General Labor",
    count: "160+ tasks",
    color: "from-gray-500 to-slate-500",
    description: "Various odd jobs and assistance",
    timeEstimate: "flexible",
    categoryType: "both",
    skillLevel: "beginner"
  },
  // Additional Quick Gig Tasks
  {
    icon: Baby,
    title: "Babysitting",
    count: "80+ tasks",
    color: "from-pink-400 to-rose-400",
    description: "Childcare, pickup, supervision",
    timeEstimate: "flexible",
    categoryType: "indoor",
    skillLevel: "beginner"
  },
  {
    icon: Heart,
    title: "Senior Care",
    count: "60+ tasks",
    color: "from-red-400 to-pink-400",
    description: "Companionship, errands, light help",
    timeEstimate: "flexible",
    categoryType: "both",
    skillLevel: "beginner"
  },
  {
    icon: Scissors,
    title: "Sewing & Alterations",
    count: "35+ tasks",
    color: "from-fuchsia-500 to-pink-500",
    description: "Hemming, repairs, custom work",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Shirt,
    title: "Laundry Services",
    count: "50+ tasks",
    color: "from-cyan-500 to-blue-500",
    description: "Washing, ironing, folding",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "beginner"
  },
  {
    icon: Mail,
    title: "Mail & Package Pickup",
    count: "45+ tasks",
    color: "from-yellow-500 to-orange-500",
    description: "Post office runs, parcel collection",
    timeEstimate: "quick",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Key,
    title: "House Sitting",
    count: "40+ tasks",
    color: "from-amber-500 to-yellow-500",
    description: "Home watch, plant care, security",
    timeEstimate: "flexible",
    categoryType: "indoor",
    skillLevel: "beginner"
  },
  {
    icon: Recycle,
    title: "Junk Removal",
    count: "75+ tasks",
    color: "from-green-600 to-emerald-600",
    description: "Hauling, disposal, recycling",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Hammer,
    title: "Handyman Services",
    count: "130+ tasks",
    color: "from-stone-500 to-zinc-500",
    description: "Small repairs, installations, fixes",
    timeEstimate: "short",
    categoryType: "both",
    skillLevel: "intermediate",
    featured: true
  },
  {
    icon: Sofa,
    title: "Furniture Moving",
    count: "90+ tasks",
    color: "from-amber-600 to-orange-600",
    description: "Heavy lifting, rearranging, setup",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "beginner"
  },
  {
    icon: Leaf,
    title: "Yard Work",
    count: "120+ tasks",
    color: "from-lime-500 to-green-500",
    description: "Raking, weeding, trimming",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "beginner",
    featured: true
  },
  {
    icon: Droplet,
    title: "Pressure Washing",
    count: "55+ tasks",
    color: "from-blue-400 to-cyan-400",
    description: "Decks, driveways, siding",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Wind,
    title: "Window Cleaning",
    count: "65+ tasks",
    color: "from-sky-400 to-blue-400",
    description: "Interior, exterior, screens",
    timeEstimate: "short",
    categoryType: "both",
    skillLevel: "beginner"
  },
  {
    icon: Box,
    title: "Packing & Organizing",
    count: "70+ tasks",
    color: "from-indigo-400 to-violet-400",
    description: "Moving prep, closets, storage",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "beginner"
  },
  {
    icon: FileText,
    title: "Data Entry",
    count: "40+ tasks",
    color: "from-slate-400 to-gray-400",
    description: "Typing, spreadsheets, filing",
    timeEstimate: "flexible",
    categoryType: "indoor",
    skillLevel: "beginner"
  },
  {
    icon: Gift,
    title: "Event Help",
    count: "85+ tasks",
    color: "from-rose-400 to-red-400",
    description: "Setup, serving, cleanup",
    timeEstimate: "medium",
    categoryType: "both",
    skillLevel: "beginner"
  },
  {
    icon: Music,
    title: "Entertainment",
    count: "30+ tasks",
    color: "from-purple-400 to-indigo-400",
    description: "DJ, music, party hosting",
    timeEstimate: "long",
    categoryType: "both",
    skillLevel: "expert"
  },
  {
    icon: Dumbbell,
    title: "Personal Training",
    count: "35+ tasks",
    color: "from-red-500 to-orange-500",
    description: "Fitness coaching, workout help",
    timeEstimate: "short",
    categoryType: "both",
    skillLevel: "expert"
  },
  {
    icon: Clock,
    title: "Waiting in Line",
    count: "25+ tasks",
    color: "from-teal-400 to-emerald-400",
    description: "Queue holding, ticket pickup",
    timeEstimate: "flexible",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Users,
    title: "Virtual Assistant",
    count: "50+ tasks",
    color: "from-violet-400 to-purple-400",
    description: "Scheduling, calls, admin tasks",
    timeEstimate: "flexible",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Zap,
    title: "Quick Repairs",
    count: "95+ tasks",
    color: "from-yellow-400 to-amber-400",
    description: "Minor fixes under an hour",
    timeEstimate: "quick",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Briefcase,
    title: "Document Delivery",
    count: "40+ tasks",
    color: "from-neutral-500 to-stone-500",
    description: "Legal docs, contracts, papers",
    timeEstimate: "quick",
    categoryType: "outdoor",
    skillLevel: "beginner"
  }
];

export const getFeaturedCategories = () => categories.filter(c => c.featured);
export const getCategoryTitles = () => categories.map(c => c.title);
