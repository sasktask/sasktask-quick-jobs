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
  MapPin,
  Fence,
  Construction,
  Plug,
  Flame,
  ThermometerSun,
  AirVent,
  Warehouse,
  Shovel,
  TreeDeciduous,
  Flower2,
  Axe,
  Mountain,
  Anchor,
  Ship,
  Bike,
  Footprints,
  Accessibility,
  Stethoscope,
  Pill,
  Syringe,
  Bed,
  Bath,
  CookingPot,
  Soup,
  Coffee,
  Wine,
  Cake,
  IceCream,
  Pizza,
  Apple,
  Carrot,
  Fish,
  Beef,
  Egg,
  Milk,
  Wheat,
  Glasses,
  Watch,
  Gem,
  Crown,
  Palette,
  PenTool,
  Paintbrush,
  Ruler,
  Compass,
  Armchair,
  Lamp,
  Fan,
  Refrigerator,
  WashingMachine,
  Microwave,
  Tv,
  Radio,
  Speaker,
  Headphones,
  Gamepad2,
  Tent,
  Backpack,
  Umbrella,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Thermometer,
  Gauge,
  Wrench as Tool,
  Cog,
  Settings,
  Shield,
  Lock,
  Unlock,
  Eye,
  Ear,
  Hand,
  Fingerprint,
  Scan,
  QrCode,
  Barcode,
  Tag,
  Bookmark,
  Flag,
  Trophy,
  Medal,
  Award,
  Target,
  Crosshair,
  Navigation,
  Map,
  Route,
  Signpost,
  Building,
  Building2,
  Store,
  Factory,
  Church,
  Hospital,
  School,
  Library,
  Landmark,
  Castle,
  Plane,
  TrainFront,
  Bus,
  Ambulance,
  FireExtinguisher,
  HardHat,
  Drill,
  Pipette,
  TestTube,
  Microscope,
  Telescope,
  Satellite,
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
  // ========== FEATURED - TOP CATEGORIES ==========
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
    icon: MapPin,
    title: "Rides & Transport",
    count: "85+ tasks",
    color: "from-emerald-500 to-teal-500",
    description: "Pick up, drop off, rural & remote areas",
    timeEstimate: "flexible",
    categoryType: "outdoor",
    skillLevel: "beginner",
    featured: true
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
    icon: Heart,
    title: "Senior Care",
    count: "60+ tasks",
    color: "from-red-400 to-pink-400",
    description: "Companionship, errands, light help",
    timeEstimate: "flexible",
    categoryType: "both",
    skillLevel: "beginner",
    featured: true
  },
  {
    icon: Baby,
    title: "Babysitting",
    count: "80+ tasks",
    color: "from-pink-400 to-rose-400",
    description: "Childcare, pickup, supervision",
    timeEstimate: "flexible",
    categoryType: "indoor",
    skillLevel: "beginner",
    featured: true
  },
  {
    icon: Plug,
    title: "Electrical Work",
    count: "75+ tasks",
    color: "from-yellow-500 to-amber-500",
    description: "Outlets, switches, lighting, wiring",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "expert",
    featured: true
  },

  // ========== HOME & PROPERTY ==========
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
    icon: Fence,
    title: "Fence Building & Repair",
    count: "55+ tasks",
    color: "from-amber-600 to-yellow-600",
    description: "Wood, chain-link, vinyl fencing",
    timeEstimate: "long",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Construction,
    title: "Deck & Patio Work",
    count: "45+ tasks",
    color: "from-orange-600 to-amber-600",
    description: "Building, repairs, staining",
    timeEstimate: "long",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Droplet,
    title: "Plumbing",
    count: "65+ tasks",
    color: "from-blue-600 to-cyan-600",
    description: "Leaks, drains, fixtures, pipes",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "expert"
  },
  {
    icon: ThermometerSun,
    title: "HVAC Services",
    count: "40+ tasks",
    color: "from-red-500 to-orange-500",
    description: "Heating, cooling, ventilation",
    timeEstimate: "medium",
    categoryType: "both",
    skillLevel: "expert"
  },
  {
    icon: AirVent,
    title: "Duct Cleaning",
    count: "35+ tasks",
    color: "from-slate-500 to-gray-500",
    description: "Air ducts, vents, dryer vents",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Warehouse,
    title: "Garage Organization",
    count: "50+ tasks",
    color: "from-zinc-500 to-stone-500",
    description: "Shelving, storage, cleanup",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "beginner"
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
    icon: Lock,
    title: "Locksmith Services",
    count: "30+ tasks",
    color: "from-gray-600 to-slate-600",
    description: "Lock changes, key cutting, lockouts",
    timeEstimate: "quick",
    categoryType: "both",
    skillLevel: "expert"
  },
  {
    icon: Shield,
    title: "Security Installation",
    count: "35+ tasks",
    color: "from-blue-700 to-indigo-700",
    description: "Cameras, alarms, smart locks",
    timeEstimate: "medium",
    categoryType: "both",
    skillLevel: "intermediate"
  },
  {
    icon: Flame,
    title: "Fireplace & Chimney",
    count: "25+ tasks",
    color: "from-orange-700 to-red-700",
    description: "Cleaning, inspection, repairs",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "expert"
  },

  // ========== LANDSCAPING & OUTDOOR ==========
  {
    icon: Shovel,
    title: "Digging & Excavation",
    count: "40+ tasks",
    color: "from-amber-700 to-yellow-700",
    description: "Trenches, post holes, grading",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: TreeDeciduous,
    title: "Tree Services",
    count: "60+ tasks",
    color: "from-green-700 to-emerald-700",
    description: "Trimming, removal, stump grinding",
    timeEstimate: "long",
    categoryType: "outdoor",
    skillLevel: "expert"
  },
  {
    icon: Flower2,
    title: "Gardening & Planting",
    count: "70+ tasks",
    color: "from-pink-500 to-rose-500",
    description: "Flowers, vegetables, landscaping",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Axe,
    title: "Firewood & Splitting",
    count: "35+ tasks",
    color: "from-stone-600 to-zinc-600",
    description: "Cutting, splitting, stacking wood",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Droplet,
    title: "Irrigation & Sprinklers",
    count: "30+ tasks",
    color: "from-cyan-500 to-blue-500",
    description: "Installation, repairs, winterizing",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Mountain,
    title: "Retaining Walls",
    count: "25+ tasks",
    color: "from-stone-500 to-amber-500",
    description: "Stone, block, timber walls",
    timeEstimate: "long",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Sun,
    title: "Solar Panel Cleaning",
    count: "20+ tasks",
    color: "from-yellow-400 to-orange-400",
    description: "Panel cleaning, inspection",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Anchor,
    title: "Dock & Marina Work",
    count: "25+ tasks",
    color: "from-blue-700 to-cyan-700",
    description: "Dock installation, maintenance",
    timeEstimate: "long",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },

  // ========== AUTOMOTIVE ==========
  {
    icon: Car,
    title: "Auto Detailing",
    count: "70+ tasks",
    color: "from-slate-500 to-gray-500",
    description: "Washing, waxing, interior cleaning",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Wrench,
    title: "Auto Repairs",
    count: "50+ tasks",
    color: "from-gray-600 to-slate-600",
    description: "Oil changes, brakes, minor repairs",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "expert"
  },
  {
    icon: Car,
    title: "Tire Services",
    count: "45+ tasks",
    color: "from-zinc-600 to-stone-600",
    description: "Changes, rotation, seasonal swap",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Bike,
    title: "Bike Repair",
    count: "35+ tasks",
    color: "from-green-600 to-teal-600",
    description: "Tune-ups, flat fixes, assembly",
    timeEstimate: "short",
    categoryType: "both",
    skillLevel: "intermediate"
  },
  {
    icon: Ship,
    title: "Boat Services",
    count: "30+ tasks",
    color: "from-blue-600 to-indigo-600",
    description: "Cleaning, winterizing, maintenance",
    timeEstimate: "long",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Car,
    title: "RV & Camper Services",
    count: "25+ tasks",
    color: "from-amber-600 to-orange-600",
    description: "Cleaning, repairs, winterizing",
    timeEstimate: "long",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },

  // ========== PERSONAL CARE & WELLNESS ==========
  {
    icon: Scissors,
    title: "Hair Styling",
    count: "40+ tasks",
    color: "from-purple-500 to-pink-500",
    description: "Cuts, styling, home visits",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "expert"
  },
  {
    icon: Hand,
    title: "Massage Therapy",
    count: "35+ tasks",
    color: "from-teal-500 to-cyan-500",
    description: "Relaxation, sports, therapeutic",
    timeEstimate: "short",
    categoryType: "indoor",
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
    icon: Footprints,
    title: "Walking Partner",
    count: "30+ tasks",
    color: "from-green-500 to-lime-500",
    description: "Exercise companion, motivation",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Accessibility,
    title: "Mobility Assistance",
    count: "45+ tasks",
    color: "from-blue-500 to-indigo-500",
    description: "Wheelchair help, transfers, support",
    timeEstimate: "flexible",
    categoryType: "both",
    skillLevel: "beginner"
  },
  {
    icon: Stethoscope,
    title: "Home Healthcare",
    count: "40+ tasks",
    color: "from-red-500 to-pink-500",
    description: "Medical assistance, monitoring",
    timeEstimate: "flexible",
    categoryType: "indoor",
    skillLevel: "expert"
  },
  {
    icon: Pill,
    title: "Medication Reminders",
    count: "25+ tasks",
    color: "from-blue-400 to-cyan-400",
    description: "Pill management, reminders",
    timeEstimate: "quick",
    categoryType: "indoor",
    skillLevel: "beginner"
  },

  // ========== FOOD & COOKING ==========
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
    icon: CookingPot,
    title: "Personal Chef",
    count: "30+ tasks",
    color: "from-red-600 to-orange-600",
    description: "Home-cooked meals, special diets",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "expert"
  },
  {
    icon: Cake,
    title: "Baking & Pastry",
    count: "35+ tasks",
    color: "from-pink-400 to-rose-400",
    description: "Cakes, bread, custom orders",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Coffee,
    title: "Barista Services",
    count: "20+ tasks",
    color: "from-amber-700 to-yellow-700",
    description: "Coffee service for events",
    timeEstimate: "medium",
    categoryType: "both",
    skillLevel: "intermediate"
  },
  {
    icon: Wine,
    title: "Bartending",
    count: "40+ tasks",
    color: "from-purple-600 to-indigo-600",
    description: "Event bartending, cocktails",
    timeEstimate: "long",
    categoryType: "both",
    skillLevel: "intermediate"
  },
  {
    icon: Fish,
    title: "Fish Processing",
    count: "20+ tasks",
    color: "from-blue-500 to-teal-500",
    description: "Cleaning, filleting, smoking",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Beef,
    title: "Meat Processing",
    count: "25+ tasks",
    color: "from-red-700 to-rose-700",
    description: "Butchering, wrapping, smoking",
    timeEstimate: "long",
    categoryType: "outdoor",
    skillLevel: "expert"
  },

  // ========== CLOTHING & TEXTILES ==========
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
    icon: Sparkles,
    title: "Dry Cleaning Pickup",
    count: "25+ tasks",
    color: "from-indigo-400 to-purple-400",
    description: "Pick up, drop off dry cleaning",
    timeEstimate: "quick",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Shirt,
    title: "Closet Organization",
    count: "40+ tasks",
    color: "from-pink-500 to-fuchsia-500",
    description: "Wardrobe sorting, seasonal rotation",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "beginner"
  },

  // ========== EVENTS & ENTERTAINMENT ==========
  {
    icon: Gift,
    title: "Event Setup",
    count: "85+ tasks",
    color: "from-rose-400 to-red-400",
    description: "Setup, decorating, cleanup",
    timeEstimate: "medium",
    categoryType: "both",
    skillLevel: "beginner"
  },
  {
    icon: Music,
    title: "DJ & Music",
    count: "30+ tasks",
    color: "from-purple-400 to-indigo-400",
    description: "DJ, live music, party hosting",
    timeEstimate: "long",
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
    icon: Tv,
    title: "Videography",
    count: "25+ tasks",
    color: "from-indigo-500 to-violet-500",
    description: "Event videos, editing, drone",
    timeEstimate: "long",
    categoryType: "both",
    skillLevel: "expert"
  },
  {
    icon: Users,
    title: "Event Staffing",
    count: "50+ tasks",
    color: "from-teal-500 to-cyan-500",
    description: "Servers, hosts, coordinators",
    timeEstimate: "long",
    categoryType: "both",
    skillLevel: "beginner"
  },
  {
    icon: Tent,
    title: "Tent & Canopy Setup",
    count: "30+ tasks",
    color: "from-green-600 to-emerald-600",
    description: "Event tents, canopies, teardown",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Gamepad2,
    title: "Party Entertainment",
    count: "25+ tasks",
    color: "from-violet-500 to-purple-500",
    description: "Games, activities, hosts",
    timeEstimate: "medium",
    categoryType: "both",
    skillLevel: "beginner"
  },

  // ========== EDUCATION & TUTORING ==========
  {
    icon: GraduationCap,
    title: "Academic Tutoring",
    count: "55+ tasks",
    color: "from-emerald-500 to-green-500",
    description: "Math, science, languages",
    timeEstimate: "short",
    categoryType: "both",
    skillLevel: "expert"
  },
  {
    icon: Music,
    title: "Music Lessons",
    count: "40+ tasks",
    color: "from-purple-500 to-pink-500",
    description: "Piano, guitar, voice, drums",
    timeEstimate: "short",
    categoryType: "both",
    skillLevel: "expert"
  },
  {
    icon: Palette,
    title: "Art Lessons",
    count: "30+ tasks",
    color: "from-rose-500 to-pink-500",
    description: "Drawing, painting, crafts",
    timeEstimate: "short",
    categoryType: "both",
    skillLevel: "intermediate"
  },
  {
    icon: Dumbbell,
    title: "Sports Coaching",
    count: "35+ tasks",
    color: "from-orange-500 to-red-500",
    description: "Hockey, soccer, basketball",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Car,
    title: "Driving Lessons",
    count: "25+ tasks",
    color: "from-blue-500 to-indigo-500",
    description: "Beginner, refresher, winter driving",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "expert"
  },

  // ========== TECH & ELECTRONICS ==========
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
    icon: Tv,
    title: "TV & Audio Setup",
    count: "45+ tasks",
    color: "from-indigo-500 to-purple-500",
    description: "Home theater, sound systems",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Cog,
    title: "Smart Home Setup",
    count: "40+ tasks",
    color: "from-cyan-500 to-blue-500",
    description: "Alexa, Google Home, automation",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Laptop,
    title: "Computer Repair",
    count: "50+ tasks",
    color: "from-gray-500 to-slate-500",
    description: "Hardware, software, upgrades",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "expert"
  },
  {
    icon: Refrigerator,
    title: "Appliance Repair",
    count: "55+ tasks",
    color: "from-slate-600 to-zinc-600",
    description: "Washers, dryers, refrigerators",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "expert"
  },

  // ========== DELIVERIES & ERRANDS ==========
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
    icon: Briefcase,
    title: "Document Delivery",
    count: "40+ tasks",
    color: "from-neutral-500 to-stone-500",
    description: "Legal docs, contracts, papers",
    timeEstimate: "quick",
    categoryType: "outdoor",
    skillLevel: "beginner"
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
    icon: Apple,
    title: "Grocery Delivery",
    count: "60+ tasks",
    color: "from-green-500 to-lime-500",
    description: "Shopping and home delivery",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Pill,
    title: "Pharmacy Pickup",
    count: "35+ tasks",
    color: "from-blue-500 to-cyan-500",
    description: "Prescription pickup, delivery",
    timeEstimate: "quick",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },

  // ========== ORGANIZATION & ADMIN ==========
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
    icon: FileText,
    title: "Bookkeeping",
    count: "30+ tasks",
    color: "from-green-600 to-emerald-600",
    description: "Invoices, receipts, records",
    timeEstimate: "flexible",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },

  // ========== SPECIALTY TRADES ==========
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
    icon: HardHat,
    title: "Construction Help",
    count: "45+ tasks",
    color: "from-orange-600 to-amber-600",
    description: "Site cleanup, material moving",
    timeEstimate: "long",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Ruler,
    title: "Carpentry",
    count: "50+ tasks",
    color: "from-amber-700 to-yellow-700",
    description: "Custom builds, repairs, trim",
    timeEstimate: "long",
    categoryType: "both",
    skillLevel: "expert"
  },
  {
    icon: Drill,
    title: "Drywall Work",
    count: "40+ tasks",
    color: "from-stone-500 to-zinc-500",
    description: "Installation, patching, taping",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Compass,
    title: "Flooring",
    count: "45+ tasks",
    color: "from-amber-600 to-orange-600",
    description: "Tile, hardwood, laminate, vinyl",
    timeEstimate: "long",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Construction,
    title: "Roofing",
    count: "35+ tasks",
    color: "from-gray-700 to-slate-700",
    description: "Repairs, shingles, inspections",
    timeEstimate: "long",
    categoryType: "outdoor",
    skillLevel: "expert"
  },
  {
    icon: Droplet,
    title: "Gutter Services",
    count: "50+ tasks",
    color: "from-blue-600 to-indigo-600",
    description: "Cleaning, repairs, installation",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Paintbrush,
    title: "Wallpaper",
    count: "30+ tasks",
    color: "from-pink-500 to-rose-500",
    description: "Installation, removal, repairs",
    timeEstimate: "long",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Gem,
    title: "Tile Work",
    count: "35+ tasks",
    color: "from-cyan-600 to-blue-600",
    description: "Backsplash, flooring, showers",
    timeEstimate: "long",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },

  // ========== SEASONAL & RURAL ==========
  {
    icon: Thermometer,
    title: "Winterizing",
    count: "40+ tasks",
    color: "from-blue-600 to-cyan-600",
    description: "Pipes, sprinklers, boats, RVs",
    timeEstimate: "medium",
    categoryType: "both",
    skillLevel: "intermediate"
  },
  {
    icon: Sun,
    title: "Spring Cleanup",
    count: "55+ tasks",
    color: "from-green-500 to-lime-500",
    description: "Yard debris, garden prep",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Leaf,
    title: "Fall Cleanup",
    count: "65+ tasks",
    color: "from-orange-500 to-amber-500",
    description: "Leaves, garden closeout",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Wheat,
    title: "Farm Help",
    count: "40+ tasks",
    color: "from-yellow-600 to-amber-600",
    description: "Harvest, feeding, fencing",
    timeEstimate: "long",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Beef,
    title: "Livestock Care",
    count: "30+ tasks",
    color: "from-amber-700 to-orange-700",
    description: "Feeding, watering, monitoring",
    timeEstimate: "flexible",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Egg,
    title: "Poultry Care",
    count: "25+ tasks",
    color: "from-yellow-500 to-orange-500",
    description: "Chicken, duck, egg collection",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Carrot,
    title: "Vegetable Gardening",
    count: "35+ tasks",
    color: "from-orange-500 to-green-500",
    description: "Planting, weeding, harvesting",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "beginner"
  }
];

export const getFeaturedCategories = () => categories.filter(c => c.featured);
export const getCategoryTitles = () => categories.map(c => c.title);
