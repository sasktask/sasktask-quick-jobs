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

export interface Subcategory {
  title: string;
  description: string;
  trending?: boolean;
}

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
  subcategories?: Subcategory[];
}

export interface LocalTrend {
  category: string;
  subcategory: string;
  demand: "high" | "medium" | "low";
  change: number; // percentage change
  region: string;
}

export const localTrends: LocalTrend[] = [
  { category: "Snow Removal", subcategory: "Driveway Clearing", demand: "high", change: 45, region: "Saskatchewan" },
  { category: "Snow Removal", subcategory: "Roof Snow Removal", demand: "high", change: 38, region: "Saskatchewan" },
  { category: "Cleaning", subcategory: "Move-out Cleaning", demand: "high", change: 32, region: "Urban Areas" },
  { category: "Yard Work", subcategory: "Fall Leaf Cleanup", demand: "medium", change: 28, region: "Saskatchewan" },
  { category: "Handyman Services", subcategory: "Weatherproofing", demand: "high", change: 55, region: "Rural Areas" },
  { category: "Moving & Delivery", subcategory: "Furniture Delivery", demand: "medium", change: 22, region: "Saskatoon" },
  { category: "Pet Care", subcategory: "Dog Walking", demand: "medium", change: 18, region: "Urban Areas" },
  { category: "Senior Care", subcategory: "Grocery Shopping", demand: "high", change: 40, region: "All Regions" },
  { category: "Electrical Work", subcategory: "Holiday Lighting", demand: "high", change: 65, region: "Saskatchewan" },
  { category: "Plumbing", subcategory: "Pipe Winterization", demand: "high", change: 50, region: "Rural Areas" },
  { category: "HVAC Services", subcategory: "Furnace Maintenance", demand: "high", change: 42, region: "Saskatchewan" },
  { category: "Firewood Services", subcategory: "Firewood Delivery", demand: "high", change: 35, region: "Rural Areas" },
];

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
    featured: true,
    subcategories: [
      { title: "Driveway Clearing", description: "Shovel or plow residential driveways", trending: true },
      { title: "Walkway & Sidewalk", description: "Clear paths and sidewalks safely" },
      { title: "Roof Snow Removal", description: "Prevent ice dams and roof damage", trending: true },
      { title: "Commercial Lots", description: "Parking lots and business areas" },
      { title: "Ice Control & Salting", description: "De-icing and salt application" },
      { title: "Snow Blowing", description: "Machine-assisted snow removal" },
      { title: "Emergency Snow Service", description: "Urgent same-day clearing" },
      { title: "Seasonal Contracts", description: "Regular winter maintenance" }
    ]
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
    featured: true,
    subcategories: [
      { title: "Regular House Cleaning", description: "Weekly or bi-weekly home cleaning" },
      { title: "Deep Cleaning", description: "Thorough top-to-bottom cleaning", trending: true },
      { title: "Move-out Cleaning", description: "End of lease cleaning service", trending: true },
      { title: "Move-in Cleaning", description: "Prepare new home for occupancy" },
      { title: "Post-Construction", description: "Clean up after renovations" },
      { title: "Office Cleaning", description: "Commercial and office spaces" },
      { title: "Carpet Cleaning", description: "Steam and spot cleaning" },
      { title: "Window Cleaning", description: "Interior and exterior windows" },
      { title: "Kitchen Deep Clean", description: "Appliances, cabinets, surfaces" },
      { title: "Bathroom Sanitization", description: "Deep clean and disinfect" }
    ]
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
    featured: true,
    subcategories: [
      { title: "Local Moving", description: "Same city residential moves" },
      { title: "Furniture Delivery", description: "Pickup and deliver large items", trending: true },
      { title: "Appliance Moving", description: "Safely move heavy appliances" },
      { title: "Loading/Unloading", description: "Help with truck loading" },
      { title: "Packing Services", description: "Professional packing assistance" },
      { title: "Storage Moving", description: "To/from storage units" },
      { title: "Marketplace Pickup", description: "Facebook, Kijiji item pickup" },
      { title: "Donation Drop-off", description: "Deliver items to charity" },
      { title: "Rural Delivery", description: "Remote area deliveries" }
    ]
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
    featured: true,
    subcategories: [
      { title: "General Repairs", description: "Fix various household issues" },
      { title: "Door & Window Repair", description: "Hinges, locks, weatherstripping" },
      { title: "Drywall Repair", description: "Patch holes and cracks" },
      { title: "Caulking & Sealing", description: "Bathroom, kitchen, windows" },
      { title: "Weatherproofing", description: "Prepare home for winter", trending: true },
      { title: "Shelf Installation", description: "Mount shelves and brackets" },
      { title: "Picture Hanging", description: "Artwork and mirror mounting" },
      { title: "Furniture Repair", description: "Fix wobbly or broken pieces" },
      { title: "Lock Replacement", description: "Change door locks" },
      { title: "Minor Plumbing", description: "Faucet, toilet fixes" }
    ]
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
    featured: true,
    subcategories: [
      { title: "Lawn Mowing", description: "Regular grass cutting service" },
      { title: "Fall Leaf Cleanup", description: "Rake and bag fallen leaves", trending: true },
      { title: "Garden Weeding", description: "Remove weeds from beds" },
      { title: "Hedge Trimming", description: "Shape and trim hedges" },
      { title: "Garden Bed Prep", description: "Spring planting preparation" },
      { title: "Mulching", description: "Spread mulch in garden beds" },
      { title: "Tree Branch Pickup", description: "Collect fallen branches" },
      { title: "Flower Planting", description: "Plant seasonal flowers" },
      { title: "Vegetable Garden", description: "Start or maintain veggie garden" },
      { title: "Lawn Aeration", description: "Improve lawn health" }
    ]
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
    featured: true,
    subcategories: [
      { title: "Dog Walking", description: "Daily walks and exercise", trending: true },
      { title: "Pet Sitting", description: "In-home pet care" },
      { title: "Pet Boarding", description: "Overnight stays at sitter's home" },
      { title: "Pet Grooming", description: "Bathing, brushing, nail trim" },
      { title: "Cat Sitting", description: "Check-ins and care for cats" },
      { title: "Pet Transport", description: "Vet visits, groomer trips" },
      { title: "Farm Animal Care", description: "Feeding livestock, chickens" },
      { title: "Fish & Reptile Care", description: "Specialized pet care" },
      { title: "Pet Waste Cleanup", description: "Yard poop scooping" }
    ]
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
    featured: true,
    subcategories: [
      { title: "Airport Rides", description: "To/from airport transport" },
      { title: "Medical Appointments", description: "Doctor, hospital visits" },
      { title: "Senior Transportation", description: "Errands for elderly" },
      { title: "Rural Area Rides", description: "Remote location transport" },
      { title: "Kid Pickup/Drop-off", description: "School, activities transport" },
      { title: "Event Transportation", description: "Weddings, parties" },
      { title: "Long Distance Rides", description: "Inter-city transport" },
      { title: "Package Courier", description: "Document and parcel delivery" }
    ]
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
    featured: true,
    subcategories: [
      { title: "Grocery Shopping", description: "Buy and deliver groceries", trending: true },
      { title: "Prescription Pickup", description: "Pharmacy runs" },
      { title: "Gift Shopping", description: "Shop for presents" },
      { title: "Return Items", description: "Handle store returns" },
      { title: "Wait in Line", description: "Queue for tickets, releases" },
      { title: "Personal Shopping", description: "Shop for clothing, items" },
      { title: "Costco Runs", description: "Bulk shopping trips" },
      { title: "Restaurant Pickup", description: "Pick up food orders" }
    ]
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
    featured: true,
    subcategories: [
      { title: "IKEA Furniture", description: "Assemble IKEA products" },
      { title: "Bed Frame Assembly", description: "Set up beds and headboards" },
      { title: "Office Furniture", description: "Desks, chairs, cabinets" },
      { title: "Outdoor Furniture", description: "Patio sets, gazebos" },
      { title: "Kids Furniture", description: "Cribs, bunk beds, toy storage" },
      { title: "Exercise Equipment", description: "Treadmills, home gyms" },
      { title: "Shelving Units", description: "Bookcases, storage shelves" },
      { title: "BBQ & Grills", description: "Assemble outdoor grills" }
    ]
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
    featured: true,
    subcategories: [
      { title: "Companionship Visits", description: "Social visits and conversation" },
      { title: "Grocery Shopping", description: "Shop for elderly clients", trending: true },
      { title: "Meal Preparation", description: "Cook nutritious meals" },
      { title: "Light Housekeeping", description: "Tidy up and organize" },
      { title: "Medication Reminders", description: "Help track medications" },
      { title: "Escort to Appointments", description: "Accompany to doctors" },
      { title: "Technology Help", description: "Phone, computer assistance" },
      { title: "Reading & Games", description: "Entertainment and activities" }
    ]
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
    featured: true,
    subcategories: [
      { title: "Evening Babysitting", description: "Date night childcare" },
      { title: "Daytime Care", description: "Full day supervision" },
      { title: "After School Care", description: "Pickup and supervision" },
      { title: "Weekend Babysitting", description: "Weekend childcare" },
      { title: "Newborn Care", description: "Infant specialized care" },
      { title: "Homework Help", description: "Tutoring while babysitting" },
      { title: "Nanny Services", description: "Regular scheduled care" },
      { title: "Special Needs Care", description: "Care for special needs kids" }
    ]
  },
  {
    icon: CookingPot,
    title: "Tiffin Services",
    count: "50+ providers",
    color: "from-orange-500 to-amber-500",
    description: "Home-cooked meals by cuisine & region",
    timeEstimate: "flexible",
    categoryType: "indoor",
    skillLevel: "intermediate",
    featured: true,
    subcategories: [
      { title: "Indian Cuisine", description: "North & South Indian home cooking", trending: true },
      { title: "Chinese Cuisine", description: "Cantonese, Sichuan home meals" },
      { title: "Middle Eastern", description: "Lebanese, Turkish, Persian food" },
      { title: "African Cuisine", description: "Ethiopian, Nigerian home cooking" },
      { title: "Weekly Meal Plans", description: "Subscribe to daily meals", trending: true },
      { title: "Vegetarian Tiffin", description: "Pure vegetarian home meals" },
      { title: "Halal Meals", description: "Certified halal home cooking" },
      { title: "Special Diet", description: "Vegan, gluten-free options" }
    ]
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
    featured: true,
    subcategories: [
      { title: "Outlet Installation", description: "Add or replace outlets" },
      { title: "Light Fixture Install", description: "Chandeliers, ceiling lights" },
      { title: "Dimmer Switches", description: "Install dimmer controls" },
      { title: "Ceiling Fan Install", description: "Mount and wire fans" },
      { title: "Holiday Lighting", description: "Install Christmas lights", trending: true },
      { title: "Outdoor Lighting", description: "Landscape, security lights" },
      { title: "Smart Home Wiring", description: "Smart switches, outlets" },
      { title: "Panel Upgrades", description: "Electrical panel work" },
      { title: "Troubleshooting", description: "Fix electrical issues" }
    ]
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
  },

  // ========== ADDITIONAL TRADES & SERVICES ==========
  {
    icon: Thermometer,
    title: "Insulation Installation",
    count: "30+ tasks",
    color: "from-pink-600 to-rose-600",
    description: "Attic, walls, basement insulation",
    timeEstimate: "long",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Droplet,
    title: "Well & Pump Services",
    count: "20+ tasks",
    color: "from-blue-800 to-indigo-800",
    description: "Well maintenance, pump repairs",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "expert"
  },
  {
    icon: Flame,
    title: "Furnace Maintenance",
    count: "35+ tasks",
    color: "from-red-600 to-orange-600",
    description: "Cleaning, filters, tune-ups",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Bath,
    title: "Bathroom Renovation",
    count: "40+ tasks",
    color: "from-cyan-500 to-teal-500",
    description: "Fixtures, tiling, plumbing",
    timeEstimate: "long",
    categoryType: "indoor",
    skillLevel: "expert"
  },
  {
    icon: CookingPot,
    title: "Kitchen Renovation",
    count: "35+ tasks",
    color: "from-amber-500 to-orange-500",
    description: "Cabinets, counters, appliances",
    timeEstimate: "long",
    categoryType: "indoor",
    skillLevel: "expert"
  },
  {
    icon: Armchair,
    title: "Upholstery Repair",
    count: "25+ tasks",
    color: "from-purple-600 to-indigo-600",
    description: "Furniture fabric, cushions, springs",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Lamp,
    title: "Lamp & Light Repair",
    count: "30+ tasks",
    color: "from-yellow-400 to-amber-400",
    description: "Rewiring, fixtures, antiques",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Fan,
    title: "Ceiling Fan Installation",
    count: "40+ tasks",
    color: "from-sky-500 to-blue-500",
    description: "Installation, balancing, repairs",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: WashingMachine,
    title: "Washer/Dryer Hookup",
    count: "35+ tasks",
    color: "from-slate-500 to-gray-500",
    description: "Installation, venting, connections",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Microwave,
    title: "Appliance Installation",
    count: "45+ tasks",
    color: "from-zinc-500 to-stone-500",
    description: "Microwaves, dishwashers, ranges",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },

  // ========== OUTDOOR RECREATION & EQUIPMENT ==========
  {
    icon: Tent,
    title: "Camping Equipment Setup",
    count: "20+ tasks",
    color: "from-green-700 to-emerald-700",
    description: "Tents, campers, gear assembly",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Backpack,
    title: "Outdoor Guide",
    count: "25+ tasks",
    color: "from-teal-600 to-green-600",
    description: "Hiking, fishing, hunting spots",
    timeEstimate: "long",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Target,
    title: "Archery & Shooting Range",
    count: "15+ tasks",
    color: "from-red-700 to-rose-700",
    description: "Target setup, instruction",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "expert"
  },
  {
    icon: Fish,
    title: "Fishing Guide",
    count: "25+ tasks",
    color: "from-blue-600 to-cyan-600",
    description: "Lake, river, ice fishing",
    timeEstimate: "long",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Mountain,
    title: "Trail Maintenance",
    count: "20+ tasks",
    color: "from-stone-600 to-amber-600",
    description: "Clearing, marking, repairs",
    timeEstimate: "long",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Snowflake,
    title: "Ice Rink Maintenance",
    count: "20+ tasks",
    color: "from-cyan-400 to-blue-400",
    description: "Flooding, cleaning, repairs",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Gamepad2,
    title: "Pool Table Services",
    count: "15+ tasks",
    color: "from-green-800 to-emerald-800",
    description: "Moving, leveling, refelting",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "expert"
  },
  {
    icon: Trophy,
    title: "Sports Field Setup",
    count: "30+ tasks",
    color: "from-lime-500 to-green-500",
    description: "Lines, nets, goals, equipment",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },

  // ========== SPECIALTY CLEANING ==========
  {
    icon: Sparkles,
    title: "Post-Construction Cleanup",
    count: "40+ tasks",
    color: "from-amber-500 to-yellow-500",
    description: "Debris removal, deep cleaning",
    timeEstimate: "long",
    categoryType: "indoor",
    skillLevel: "beginner"
  },
  {
    icon: Sparkles,
    title: "Move-Out Cleaning",
    count: "55+ tasks",
    color: "from-cyan-500 to-teal-500",
    description: "Deep clean for rentals, homes",
    timeEstimate: "long",
    categoryType: "indoor",
    skillLevel: "beginner"
  },
  {
    icon: Sparkles,
    title: "Hoarding Cleanup",
    count: "20+ tasks",
    color: "from-gray-600 to-slate-600",
    description: "Sorting, cleaning, disposal",
    timeEstimate: "long",
    categoryType: "indoor",
    skillLevel: "beginner"
  },
  {
    icon: Sofa,
    title: "Carpet Cleaning",
    count: "45+ tasks",
    color: "from-blue-500 to-indigo-500",
    description: "Steam cleaning, stain removal",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Bed,
    title: "Mattress Cleaning",
    count: "25+ tasks",
    color: "from-purple-400 to-pink-400",
    description: "Sanitizing, stain removal",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "beginner"
  },
  {
    icon: Armchair,
    title: "Upholstery Cleaning",
    count: "35+ tasks",
    color: "from-rose-500 to-pink-500",
    description: "Couches, chairs, fabric care",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Sparkles,
    title: "Grout Cleaning",
    count: "30+ tasks",
    color: "from-stone-400 to-zinc-400",
    description: "Tile grout, sealing, restoration",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "beginner"
  },
  {
    icon: Car,
    title: "Garage Floor Coating",
    count: "20+ tasks",
    color: "from-gray-500 to-zinc-500",
    description: "Epoxy, sealing, prep work",
    timeEstimate: "long",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },

  // ========== WELLNESS & CARE ==========
  {
    icon: Heart,
    title: "Respite Care",
    count: "30+ tasks",
    color: "from-pink-500 to-rose-500",
    description: "Caregiver relief, supervision",
    timeEstimate: "flexible",
    categoryType: "indoor",
    skillLevel: "beginner"
  },
  {
    icon: Stethoscope,
    title: "Post-Surgery Help",
    count: "25+ tasks",
    color: "from-red-400 to-pink-400",
    description: "Recovery assistance, errands",
    timeEstimate: "flexible",
    categoryType: "indoor",
    skillLevel: "beginner"
  },
  {
    icon: Accessibility,
    title: "Disability Assistance",
    count: "35+ tasks",
    color: "from-blue-400 to-indigo-400",
    description: "Daily tasks, transportation",
    timeEstimate: "flexible",
    categoryType: "both",
    skillLevel: "beginner"
  },
  {
    icon: Eye,
    title: "Vision Assistance",
    count: "20+ tasks",
    color: "from-indigo-500 to-purple-500",
    description: "Reading, navigation, errands",
    timeEstimate: "flexible",
    categoryType: "both",
    skillLevel: "beginner"
  },
  {
    icon: Ear,
    title: "Hearing Assistance",
    count: "15+ tasks",
    color: "from-teal-400 to-cyan-400",
    description: "Communication support, errands",
    timeEstimate: "flexible",
    categoryType: "both",
    skillLevel: "beginner"
  },
  {
    icon: Soup,
    title: "Meal Delivery",
    count: "40+ tasks",
    color: "from-orange-400 to-amber-400",
    description: "Hot meals, special diets",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },

  // ========== ANIMAL & PET SERVICES ==========
  {
    icon: Dog,
    title: "Dog Training",
    count: "30+ tasks",
    color: "from-amber-500 to-orange-500",
    description: "Basic commands, behavior",
    timeEstimate: "short",
    categoryType: "both",
    skillLevel: "expert"
  },
  {
    icon: Dog,
    title: "Pet Bathing",
    count: "35+ tasks",
    color: "from-cyan-400 to-blue-400",
    description: "Washing, drying, brushing",
    timeEstimate: "short",
    categoryType: "both",
    skillLevel: "beginner"
  },
  {
    icon: Home,
    title: "Pet Fence Installation",
    count: "25+ tasks",
    color: "from-green-600 to-teal-600",
    description: "Invisible fence, kennel runs",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Syringe,
    title: "Pet Medication",
    count: "20+ tasks",
    color: "from-blue-500 to-indigo-500",
    description: "Administering meds, injections",
    timeEstimate: "quick",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Car,
    title: "Pet Transport",
    count: "35+ tasks",
    color: "from-purple-500 to-pink-500",
    description: "Vet visits, groomer, boarding",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Milk,
    title: "Farm Animal Feeding",
    count: "25+ tasks",
    color: "from-amber-600 to-yellow-600",
    description: "Cattle, horses, goats, pigs",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Fence,
    title: "Livestock Fencing",
    count: "30+ tasks",
    color: "from-stone-600 to-amber-600",
    description: "Electric, barbed wire, panels",
    timeEstimate: "long",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },

  // ========== EQUIPMENT & MACHINERY ==========
  {
    icon: Cog,
    title: "Small Engine Repair",
    count: "35+ tasks",
    color: "from-gray-600 to-slate-600",
    description: "Mowers, trimmers, chainsaws",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "expert"
  },
  {
    icon: Shovel,
    title: "Equipment Operation",
    count: "25+ tasks",
    color: "from-yellow-600 to-amber-600",
    description: "Bobcat, tractor, excavator",
    timeEstimate: "long",
    categoryType: "outdoor",
    skillLevel: "expert"
  },
  {
    icon: Wrench,
    title: "Lawn Mower Service",
    count: "40+ tasks",
    color: "from-green-600 to-lime-600",
    description: "Tune-ups, blade sharpening",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Axe,
    title: "Chainsaw Services",
    count: "30+ tasks",
    color: "from-orange-700 to-red-700",
    description: "Sharpening, repairs, tree work",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "expert"
  },
  {
    icon: Settings,
    title: "Generator Maintenance",
    count: "25+ tasks",
    color: "from-zinc-600 to-gray-600",
    description: "Service, testing, fuel systems",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Gauge,
    title: "Pressure Washer Repair",
    count: "20+ tasks",
    color: "from-blue-600 to-cyan-600",
    description: "Pumps, hoses, engines",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },

  // ========== CREATIVE & ARTISAN ==========
  {
    icon: Paintbrush,
    title: "Mural Painting",
    count: "20+ tasks",
    color: "from-pink-500 to-purple-500",
    description: "Wall art, custom murals",
    timeEstimate: "long",
    categoryType: "both",
    skillLevel: "expert"
  },
  {
    icon: PenTool,
    title: "Sign Making",
    count: "25+ tasks",
    color: "from-blue-500 to-indigo-500",
    description: "Custom signs, lettering",
    timeEstimate: "medium",
    categoryType: "both",
    skillLevel: "intermediate"
  },
  {
    icon: Gem,
    title: "Jewelry Repair",
    count: "20+ tasks",
    color: "from-yellow-400 to-amber-400",
    description: "Ring sizing, chain repair",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "expert"
  },
  {
    icon: Watch,
    title: "Watch Repair",
    count: "15+ tasks",
    color: "from-gray-500 to-slate-500",
    description: "Battery, bands, movement",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "expert"
  },
  {
    icon: Glasses,
    title: "Eyeglass Repair",
    count: "15+ tasks",
    color: "from-indigo-400 to-purple-400",
    description: "Frame adjustments, repairs",
    timeEstimate: "quick",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Crown,
    title: "Antique Restoration",
    count: "25+ tasks",
    color: "from-amber-600 to-yellow-600",
    description: "Furniture, decor, refinishing",
    timeEstimate: "long",
    categoryType: "indoor",
    skillLevel: "expert"
  },
  {
    icon: Paintbrush,
    title: "Furniture Refinishing",
    count: "30+ tasks",
    color: "from-amber-700 to-orange-700",
    description: "Stripping, staining, finishing",
    timeEstimate: "long",
    categoryType: "both",
    skillLevel: "intermediate"
  },
  {
    icon: Scissors,
    title: "Custom Curtains",
    count: "20+ tasks",
    color: "from-purple-400 to-pink-400",
    description: "Measuring, sewing, installation",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },

  // ========== TRANSPORTATION & LOGISTICS ==========
  {
    icon: Truck,
    title: "Trailer Moving",
    count: "30+ tasks",
    color: "from-orange-600 to-red-600",
    description: "Boat, utility, RV trailers",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Plane,
    title: "Airport Pickup",
    count: "40+ tasks",
    color: "from-sky-500 to-blue-500",
    description: "Arrivals, departures, luggage",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Bus,
    title: "Group Transport",
    count: "25+ tasks",
    color: "from-yellow-500 to-amber-500",
    description: "Events, tours, shuttles",
    timeEstimate: "long",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: TrainFront,
    title: "Station Pickup",
    count: "20+ tasks",
    color: "from-teal-500 to-cyan-500",
    description: "Train, bus station transfers",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Ambulance,
    title: "Medical Transport",
    count: "30+ tasks",
    color: "from-red-500 to-pink-500",
    description: "Appointments, dialysis, therapy",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },

  // ========== SPECIALTY INSTALLATIONS ==========
  {
    icon: Radio,
    title: "Antenna Installation",
    count: "20+ tasks",
    color: "from-gray-500 to-slate-500",
    description: "TV, radio, satellite dishes",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Satellite,
    title: "Satellite Dish Setup",
    count: "25+ tasks",
    color: "from-blue-600 to-indigo-600",
    description: "Installation, alignment, cables",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Speaker,
    title: "Surround Sound Install",
    count: "30+ tasks",
    color: "from-purple-500 to-indigo-500",
    description: "Speakers, wiring, calibration",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Headphones,
    title: "Home Studio Setup",
    count: "15+ tasks",
    color: "from-violet-500 to-purple-500",
    description: "Recording, acoustic treatment",
    timeEstimate: "long",
    categoryType: "indoor",
    skillLevel: "expert"
  },
  {
    icon: Scan,
    title: "Home Network Setup",
    count: "35+ tasks",
    color: "from-cyan-500 to-blue-500",
    description: "WiFi, ethernet, mesh systems",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: QrCode,
    title: "Intercom Installation",
    count: "20+ tasks",
    color: "from-gray-600 to-zinc-600",
    description: "Video doorbells, intercoms",
    timeEstimate: "short",
    categoryType: "both",
    skillLevel: "intermediate"
  },

  // ========== BUILDING & GROUNDS ==========
  {
    icon: Building,
    title: "Commercial Cleaning",
    count: "45+ tasks",
    color: "from-blue-500 to-cyan-500",
    description: "Offices, retail, warehouses",
    timeEstimate: "long",
    categoryType: "indoor",
    skillLevel: "beginner"
  },
  {
    icon: Building2,
    title: "Office Setup",
    count: "30+ tasks",
    color: "from-indigo-500 to-purple-500",
    description: "Desks, chairs, equipment",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "beginner"
  },
  {
    icon: Store,
    title: "Retail Display Setup",
    count: "25+ tasks",
    color: "from-pink-500 to-rose-500",
    description: "Shelving, displays, signage",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "beginner"
  },
  {
    icon: Factory,
    title: "Warehouse Organization",
    count: "35+ tasks",
    color: "from-gray-600 to-slate-600",
    description: "Racking, inventory, cleanup",
    timeEstimate: "long",
    categoryType: "indoor",
    skillLevel: "beginner"
  },
  {
    icon: Church,
    title: "Church Maintenance",
    count: "20+ tasks",
    color: "from-purple-600 to-indigo-600",
    description: "Cleaning, repairs, grounds",
    timeEstimate: "medium",
    categoryType: "both",
    skillLevel: "beginner"
  },
  {
    icon: School,
    title: "School Event Help",
    count: "30+ tasks",
    color: "from-green-500 to-teal-500",
    description: "Setup, decorating, cleanup",
    timeEstimate: "medium",
    categoryType: "both",
    skillLevel: "beginner"
  },
  {
    icon: Library,
    title: "Library Organization",
    count: "20+ tasks",
    color: "from-amber-500 to-orange-500",
    description: "Sorting, shelving, cataloging",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "beginner"
  },

  // ========== SAFETY & EMERGENCY ==========
  {
    icon: FireExtinguisher,
    title: "Fire Safety Check",
    count: "25+ tasks",
    color: "from-red-600 to-orange-600",
    description: "Extinguishers, alarms, exits",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: HardHat,
    title: "Safety Inspection",
    count: "20+ tasks",
    color: "from-yellow-500 to-amber-500",
    description: "Home, workplace safety audit",
    timeEstimate: "medium",
    categoryType: "both",
    skillLevel: "intermediate"
  },
  {
    icon: Shield,
    title: "Emergency Prep",
    count: "25+ tasks",
    color: "from-red-500 to-pink-500",
    description: "Kits, supplies, planning",
    timeEstimate: "medium",
    categoryType: "both",
    skillLevel: "beginner"
  },
  {
    icon: Thermometer,
    title: "Water Damage Cleanup",
    count: "30+ tasks",
    color: "from-blue-700 to-cyan-700",
    description: "Extraction, drying, repairs",
    timeEstimate: "long",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Wind,
    title: "Storm Cleanup",
    count: "45+ tasks",
    color: "from-gray-500 to-slate-500",
    description: "Debris, branches, damage",
    timeEstimate: "long",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },

  // ========== SEASONAL SPECIALTY ==========
  {
    icon: Gift,
    title: "Holiday Decorating",
    count: "50+ tasks",
    color: "from-red-500 to-green-500",
    description: "Christmas, Halloween, seasonal",
    timeEstimate: "medium",
    categoryType: "both",
    skillLevel: "beginner"
  },
  {
    icon: Sparkles,
    title: "Christmas Light Install",
    count: "40+ tasks",
    color: "from-red-500 to-yellow-500",
    description: "Outdoor lights, trees, displays",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Umbrella,
    title: "Rain Gutter Guards",
    count: "25+ tasks",
    color: "from-gray-500 to-blue-500",
    description: "Installation, cleaning, repairs",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: CloudRain,
    title: "Sump Pump Service",
    count: "25+ tasks",
    color: "from-blue-600 to-indigo-600",
    description: "Testing, repairs, installation",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Moon,
    title: "Outdoor Lighting",
    count: "30+ tasks",
    color: "from-amber-400 to-yellow-400",
    description: "Path lights, security, solar",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },

  // ========== MISCELLANEOUS SERVICES ==========
  {
    icon: Bookmark,
    title: "Estate Sale Help",
    count: "25+ tasks",
    color: "from-purple-500 to-pink-500",
    description: "Pricing, setup, sales",
    timeEstimate: "long",
    categoryType: "indoor",
    skillLevel: "beginner"
  },
  {
    icon: Tag,
    title: "Garage Sale Setup",
    count: "35+ tasks",
    color: "from-green-500 to-lime-500",
    description: "Organizing, pricing, display",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Flag,
    title: "Flag Pole Services",
    count: "15+ tasks",
    color: "from-blue-500 to-red-500",
    description: "Installation, repairs, flags",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Medal,
    title: "Trophy Engraving",
    count: "15+ tasks",
    color: "from-yellow-500 to-amber-500",
    description: "Awards, plaques, personalization",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Award,
    title: "Certificate Framing",
    count: "20+ tasks",
    color: "from-amber-600 to-yellow-600",
    description: "Custom frames, matting",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Map,
    title: "Property Survey Help",
    count: "20+ tasks",
    color: "from-green-600 to-teal-600",
    description: "Boundary marking, clearing",
    timeEstimate: "medium",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Signpost,
    title: "Mailbox Installation",
    count: "25+ tasks",
    color: "from-blue-500 to-indigo-500",
    description: "Posts, boxes, house numbers",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Castle,
    title: "Playground Equipment",
    count: "20+ tasks",
    color: "from-pink-500 to-purple-500",
    description: "Assembly, repairs, safety",
    timeEstimate: "long",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: Landmark,
    title: "Cemetery Cleanup",
    count: "20+ tasks",
    color: "from-gray-500 to-stone-500",
    description: "Grave cleaning, flowers, care",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Navigation,
    title: "GPS Installation",
    count: "20+ tasks",
    color: "from-blue-500 to-cyan-500",
    description: "Vehicle trackers, dashcams",
    timeEstimate: "short",
    categoryType: "both",
    skillLevel: "intermediate"
  },
  {
    icon: Route,
    title: "Delivery Route Help",
    count: "25+ tasks",
    color: "from-green-500 to-emerald-500",
    description: "Package delivery, routes",
    timeEstimate: "flexible",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Crosshair,
    title: "Pest Control Help",
    count: "30+ tasks",
    color: "from-red-600 to-orange-600",
    description: "Traps, spraying, prevention",
    timeEstimate: "short",
    categoryType: "both",
    skillLevel: "intermediate"
  },
  {
    icon: Fingerprint,
    title: "Access Control Setup",
    count: "20+ tasks",
    color: "from-indigo-500 to-purple-500",
    description: "Keypads, card readers, biometric",
    timeEstimate: "medium",
    categoryType: "both",
    skillLevel: "intermediate"
  },
  {
    icon: Barcode,
    title: "Inventory Management",
    count: "30+ tasks",
    color: "from-slate-500 to-gray-500",
    description: "Counting, organizing, tagging",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "beginner"
  },
  {
    icon: Unlock,
    title: "Safe Installation",
    count: "20+ tasks",
    color: "from-gray-700 to-zinc-700",
    description: "Home safes, gun safes, bolting",
    timeEstimate: "short",
    categoryType: "indoor",
    skillLevel: "intermediate"
  },
  {
    icon: Telescope,
    title: "Home Observatory",
    count: "10+ tasks",
    color: "from-indigo-700 to-purple-700",
    description: "Telescope setup, dome assembly",
    timeEstimate: "long",
    categoryType: "outdoor",
    skillLevel: "expert"
  },
  {
    icon: Microscope,
    title: "Lab Equipment Setup",
    count: "15+ tasks",
    color: "from-cyan-600 to-teal-600",
    description: "Scientific equipment assembly",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "expert"
  },
  {
    icon: TestTube,
    title: "Water Testing",
    count: "20+ tasks",
    color: "from-blue-500 to-cyan-500",
    description: "Well, pool, aquarium testing",
    timeEstimate: "short",
    categoryType: "both",
    skillLevel: "intermediate"
  },
  {
    icon: Pipette,
    title: "Pool Chemical Balance",
    count: "35+ tasks",
    color: "from-cyan-400 to-blue-400",
    description: "Testing, balancing, maintenance",
    timeEstimate: "short",
    categoryType: "outdoor",
    skillLevel: "intermediate"
  },
  {
    icon: IceCream,
    title: "Ice Cream Cart",
    count: "15+ tasks",
    color: "from-pink-400 to-purple-400",
    description: "Event service, cart rental",
    timeEstimate: "long",
    categoryType: "outdoor",
    skillLevel: "beginner"
  },
  {
    icon: Pizza,
    title: "Pizza Party Setup",
    count: "25+ tasks",
    color: "from-red-500 to-orange-500",
    description: "Oven setup, serving, cleanup",
    timeEstimate: "medium",
    categoryType: "both",
    skillLevel: "beginner"
  },
  {
    icon: Hospital,
    title: "Medical Equipment Setup",
    count: "20+ tasks",
    color: "from-blue-500 to-indigo-500",
    description: "Home medical devices, beds",
    timeEstimate: "medium",
    categoryType: "indoor",
    skillLevel: "intermediate"
  }
];

export const getFeaturedCategories = () => categories.filter(c => c.featured);
export const getCategoryTitles = () => categories.map(c => c.title);
