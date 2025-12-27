import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Sparkles, Truck, Wrench, Leaf, Dog, Baby, Heart, Package, Plug, PaintBucket, 
  Hammer, Snowflake, ShoppingBag, MapPin, Monitor, Car, Camera, GraduationCap,
  Shirt, Recycle, Sofa, Wind, Dumbbell, Music, Gift, Fence, Construction,
  Flame, AirVent, TreeDeciduous, Axe, Stethoscope, Bath, CookingPot, Palette,
  Tv, ArrowRight, Shield, Star, CheckCircle2, Users, Scissors, Laptop, Phone,
  FileText, Briefcase, Home, Key, Lightbulb, ThermometerSun, Droplets, Bug,
  Armchair, Frame, Clock, Box, Brush, Footprints, Bone, Cat, Bird, Fish,
  BookOpen, PenTool, Mic, Video, Headphones, Gamepad, Wifi, HardDrive, Printer,
  Smartphone, Watch, Glasses, Wallet, Coffee, UtensilsCrossed, Cake, Wine,
  PartyPopper, Flower2, Gem, Ribbon, Anchor, Bike, Ship, Plane, Train, Bus,
  Fuel, Warehouse, Building2, Factory, Store, Church, School, Library, Hospital,
  Scale, Gavel, Calculator, Landmark, Globe, Languages, Flag, Megaphone,
  Target, TrendingUp, BarChart, ClipboardList, Calendar, Mail, MessageSquare,
  Search, Eye, Scan, Fingerprint, Lock, AlertTriangle, HelpCircle, Info,
  Award, Trophy, Medal, Crown, Zap, Rocket, Compass, Map
} from "lucide-react";

const allServices = [
  // ===== QUICK TASKS (15-30 mins) =====
  { id: "lightbulb", icon: Lightbulb, title: "Light Bulb Change", desc: "Replace bulbs, fixtures", color: "from-yellow-400 to-amber-400", category: "quick", popular: false },
  { id: "hang-picture", icon: Frame, title: "Hang Pictures/Mirrors", desc: "Wall mounting, leveling", color: "from-stone-400 to-zinc-400", category: "quick" },
  { id: "doorbell", icon: Home, title: "Doorbell Installation", desc: "Wired or smart doorbell", color: "from-blue-400 to-sky-400", category: "quick" },
  { id: "lock-change", icon: Key, title: "Lock Change", desc: "Replace door locks, rekey", color: "from-gray-500 to-slate-500", category: "quick" },
  { id: "caulking", icon: Droplets, title: "Caulking & Sealing", desc: "Bathroom, kitchen, windows", color: "from-cyan-400 to-blue-400", category: "quick" },
  { id: "shelf-install", icon: Box, title: "Shelf Installation", desc: "Floating shelves, brackets", color: "from-amber-400 to-orange-400", category: "quick" },
  { id: "curtain-rods", icon: Home, title: "Curtain Rod Install", desc: "Rods, blinds, drapes", color: "from-purple-400 to-pink-400", category: "quick" },
  { id: "smoke-detector", icon: AlertTriangle, title: "Smoke Detector Install", desc: "Install, replace batteries", color: "from-red-400 to-orange-400", category: "quick" },
  { id: "weather-strip", icon: Wind, title: "Weather Stripping", desc: "Doors, windows insulation", color: "from-sky-400 to-blue-400", category: "quick" },
  { id: "toilet-repair", icon: Bath, title: "Toilet Repair", desc: "Running toilet, flush fix", color: "from-blue-400 to-cyan-400", category: "quick" },
  { id: "garbage-disposal", icon: Recycle, title: "Garbage Disposal Fix", desc: "Repair, unclog, replace", color: "from-green-400 to-emerald-400", category: "quick" },
  { id: "faucet-repair", icon: Droplets, title: "Faucet Repair", desc: "Leaky faucets, handles", color: "from-blue-500 to-indigo-500", category: "quick" },
  
  // ===== SMALL TASKS (30 mins - 2 hours) =====
  { id: "cleaning", icon: Sparkles, title: "House Cleaning", desc: "Regular, deep clean, move-out", color: "from-purple-500 to-pink-500", category: "small", popular: true },
  { id: "assembly", icon: Package, title: "Furniture Assembly", desc: "IKEA, beds, desks, shelving", color: "from-green-500 to-emerald-500", category: "small", popular: true },
  { id: "tv-mounting", icon: Tv, title: "TV Mounting", desc: "Wall mount, cable management", color: "from-slate-500 to-gray-600", category: "small", popular: true },
  { id: "yard", icon: Leaf, title: "Yard Work", desc: "Mowing, raking, weeding", color: "from-lime-500 to-green-500", category: "small", popular: true },
  { id: "pet-care", icon: Dog, title: "Dog Walking", desc: "Walks, exercise, playtime", color: "from-pink-500 to-rose-500", category: "small", popular: true },
  { id: "grocery-shopping", icon: ShoppingBag, title: "Grocery Shopping", desc: "Shop, pickup, delivery", color: "from-green-500 to-teal-500", category: "small", popular: true },
  { id: "car-wash", icon: Car, title: "Car Wash & Detail", desc: "Exterior, interior, wax", color: "from-blue-400 to-cyan-400", category: "small" },
  { id: "laundry", icon: Shirt, title: "Laundry & Ironing", desc: "Wash, fold, iron, pickup", color: "from-blue-400 to-indigo-400", category: "small" },
  { id: "window-cleaning", icon: Sparkles, title: "Window Cleaning", desc: "Interior, exterior windows", color: "from-cyan-400 to-blue-400", category: "small" },
  { id: "carpet-cleaning", icon: Brush, title: "Carpet Cleaning", desc: "Vacuum, shampoo, stain removal", color: "from-amber-500 to-orange-500", category: "small" },
  { id: "oven-cleaning", icon: Flame, title: "Oven/Appliance Cleaning", desc: "Deep clean appliances", color: "from-orange-500 to-red-500", category: "small" },
  { id: "closet-organize", icon: Sofa, title: "Closet Organization", desc: "Sort, organize, declutter", color: "from-purple-500 to-pink-500", category: "small" },
  { id: "garage-organize", icon: Warehouse, title: "Garage Organization", desc: "Clean, organize, shelving", color: "from-gray-500 to-slate-500", category: "small" },
  { id: "plant-watering", icon: Flower2, title: "Plant Care & Watering", desc: "Indoor/outdoor plant care", color: "from-green-400 to-emerald-400", category: "small" },
  { id: "mail-packages", icon: Mail, title: "Mail & Package Pickup", desc: "Collect, sort, organize", color: "from-blue-500 to-indigo-500", category: "small" },
  { id: "pet-sitting", icon: Cat, title: "Pet Sitting", desc: "In-home pet care", color: "from-orange-400 to-amber-400", category: "small" },
  { id: "dog-grooming", icon: Scissors, title: "Pet Grooming", desc: "Bath, brush, nail trim", color: "from-pink-400 to-rose-400", category: "small" },
  { id: "bird-care", icon: Bird, title: "Bird & Small Pet Care", desc: "Feeding, cage cleaning", color: "from-yellow-400 to-orange-400", category: "small" },
  { id: "fish-aquarium", icon: Fish, title: "Aquarium Maintenance", desc: "Clean, water change, care", color: "from-blue-400 to-cyan-400", category: "small" },
  { id: "bike-repair", icon: Bike, title: "Bike Repair & Tune-up", desc: "Fix, adjust, maintain", color: "from-red-500 to-orange-500", category: "small" },
  { id: "phone-repair", icon: Smartphone, title: "Phone Screen Repair", desc: "Screen, battery replacement", color: "from-gray-500 to-slate-500", category: "small" },
  { id: "computer-help", icon: Laptop, title: "Computer Help", desc: "Setup, troubleshoot, speed up", color: "from-blue-500 to-indigo-500", category: "small" },
  { id: "printer-setup", icon: Printer, title: "Printer Setup", desc: "Install, connect, fix", color: "from-gray-400 to-slate-400", category: "small" },
  { id: "wifi-setup", icon: Wifi, title: "WiFi & Router Setup", desc: "Install, optimize, secure", color: "from-green-500 to-teal-500", category: "small" },
  { id: "data-backup", icon: HardDrive, title: "Data Backup", desc: "Backup, transfer, recover", color: "from-blue-600 to-indigo-600", category: "small" },
  
  // ===== MEDIUM TASKS (2-4 hours) =====
  { id: "handyman", icon: Hammer, title: "Handyman Services", desc: "Repairs, fixes, installations", color: "from-stone-500 to-zinc-500", category: "medium", popular: true },
  { id: "moving", icon: Truck, title: "Moving Help", desc: "Load, unload, heavy lifting", color: "from-orange-500 to-red-500", category: "medium", popular: true },
  { id: "snow", icon: Snowflake, title: "Snow Removal", desc: "Driveways, walkways, salting", color: "from-blue-400 to-cyan-400", category: "medium", popular: true },
  { id: "painting", icon: PaintBucket, title: "Painting", desc: "Interior walls, touch-ups", color: "from-indigo-500 to-blue-500", category: "medium", popular: true },
  { id: "pressure-washing", icon: Wind, title: "Pressure Washing", desc: "Decks, driveways, siding", color: "from-blue-500 to-indigo-500", category: "medium" },
  { id: "gutter", icon: Construction, title: "Gutter Cleaning", desc: "Clean, repair, guards", color: "from-gray-500 to-slate-500", category: "medium" },
  { id: "junk-removal", icon: Recycle, title: "Junk Removal", desc: "Haul, dispose, donate", color: "from-green-600 to-emerald-600", category: "medium" },
  { id: "appliance-install", icon: Plug, title: "Appliance Install", desc: "Washer, dryer, dishwasher", color: "from-blue-500 to-cyan-500", category: "medium" },
  { id: "ceiling-fan", icon: AirVent, title: "Ceiling Fan Install", desc: "Install, replace, repair", color: "from-sky-500 to-blue-500", category: "medium" },
  { id: "smart-home", icon: Monitor, title: "Smart Home Setup", desc: "Devices, automation, hubs", color: "from-indigo-500 to-purple-500", category: "medium" },
  { id: "security-camera", icon: Eye, title: "Security Camera Install", desc: "Cameras, monitoring setup", color: "from-gray-600 to-slate-600", category: "medium" },
  { id: "thermostat", icon: ThermometerSun, title: "Smart Thermostat", desc: "Install, program, optimize", color: "from-orange-500 to-red-500", category: "medium" },
  { id: "outlet-switch", icon: Plug, title: "Outlet & Switch Install", desc: "Replace, add, upgrade", color: "from-yellow-500 to-amber-500", category: "medium" },
  { id: "door-repair", icon: Home, title: "Door Repair", desc: "Fix, adjust, weatherize", color: "from-amber-500 to-orange-500", category: "medium" },
  { id: "drywall", icon: Construction, title: "Drywall Repair", desc: "Patch holes, cracks, finish", color: "from-stone-500 to-zinc-500", category: "medium" },
  { id: "tile-repair", icon: Construction, title: "Tile Repair", desc: "Replace, regrout, fix", color: "from-blue-500 to-indigo-500", category: "medium" },
  { id: "babysitting", icon: Baby, title: "Babysitting", desc: "Childcare, supervision", color: "from-pink-400 to-rose-400", category: "medium" },
  { id: "senior-care", icon: Heart, title: "Senior Companion", desc: "Companionship, errands", color: "from-red-400 to-pink-400", category: "medium" },
  { id: "meal-prep", icon: CookingPot, title: "Meal Prep", desc: "Cook, portion, store", color: "from-orange-500 to-amber-500", category: "medium" },
  { id: "personal-chef", icon: UtensilsCrossed, title: "Personal Chef", desc: "Cook meals at home", color: "from-red-500 to-orange-500", category: "medium" },
  { id: "tutoring", icon: GraduationCap, title: "Tutoring", desc: "Academic help, test prep", color: "from-blue-500 to-indigo-500", category: "medium" },
  { id: "music-lessons", icon: Music, title: "Music Lessons", desc: "Piano, guitar, vocals", color: "from-violet-500 to-purple-500", category: "medium" },
  { id: "language-lessons", icon: Languages, title: "Language Lessons", desc: "ESL, French, Spanish", color: "from-emerald-500 to-teal-500", category: "medium" },
  { id: "fitness-training", icon: Dumbbell, title: "Personal Training", desc: "Home workouts, coaching", color: "from-red-500 to-orange-500", category: "medium" },
  { id: "yoga-instructor", icon: Heart, title: "Yoga & Meditation", desc: "Private sessions, classes", color: "from-teal-500 to-green-500", category: "medium" },
  { id: "photography", icon: Camera, title: "Photography", desc: "Portraits, events, products", color: "from-rose-500 to-pink-500", category: "medium" },
  { id: "videography", icon: Video, title: "Videography", desc: "Events, social content", color: "from-red-500 to-rose-500", category: "medium" },
  { id: "event-setup", icon: PartyPopper, title: "Event Setup", desc: "Decor, tables, cleanup", color: "from-pink-500 to-rose-500", category: "medium" },
  
  // ===== LARGE TASKS (Half day - Full day) =====
  { id: "deep-cleaning", icon: Sparkles, title: "Deep House Cleaning", desc: "Top to bottom cleaning", color: "from-purple-500 to-pink-500", category: "large" },
  { id: "move-out-clean", icon: Home, title: "Move-out Cleaning", desc: "Security deposit ready", color: "from-blue-500 to-purple-500", category: "large" },
  { id: "landscaping", icon: TreeDeciduous, title: "Landscaping", desc: "Design, planting, mulching", color: "from-green-600 to-emerald-600", category: "large" },
  { id: "tree-service", icon: Axe, title: "Tree Trimming", desc: "Trim, prune, shape", color: "from-emerald-600 to-green-700", category: "large" },
  { id: "fence-repair", icon: Fence, title: "Fence Repair", desc: "Fix, replace panels, gates", color: "from-stone-600 to-neutral-600", category: "large" },
  { id: "deck-staining", icon: Construction, title: "Deck Staining", desc: "Clean, stain, seal", color: "from-amber-600 to-orange-600", category: "large" },
  { id: "pool-service", icon: Bath, title: "Pool Service", desc: "Clean, maintain, chemicals", color: "from-cyan-500 to-blue-500", category: "large" },
  { id: "garage-floor", icon: Warehouse, title: "Garage Floor Coating", desc: "Epoxy, paint, seal", color: "from-gray-600 to-slate-600", category: "large" },
  { id: "furniture-moving", icon: Sofa, title: "Furniture Moving", desc: "Heavy items, rearrange", color: "from-orange-600 to-red-600", category: "large" },
  { id: "estate-cleanout", icon: Warehouse, title: "Estate Cleanout", desc: "Full property clearing", color: "from-gray-500 to-slate-500", category: "large" },
  { id: "office-organize", icon: Briefcase, title: "Office Organization", desc: "Desk, files, systems", color: "from-blue-500 to-indigo-500", category: "large" },
  { id: "event-planning", icon: Calendar, title: "Event Planning Help", desc: "Coordinate, setup, manage", color: "from-pink-500 to-purple-500", category: "large" },
  { id: "catering", icon: CookingPot, title: "Catering", desc: "Party food, setup, serve", color: "from-orange-500 to-amber-500", category: "large" },
  { id: "bartending", icon: Wine, title: "Bartending", desc: "Events, parties, service", color: "from-purple-500 to-pink-500", category: "large" },
  { id: "dj-service", icon: Headphones, title: "DJ Services", desc: "Music, MC, events", color: "from-purple-600 to-indigo-600", category: "large" },
  
  // ===== MAJOR PROJECTS (Multiple days) =====
  { id: "full-paint", icon: PaintBucket, title: "Full House Painting", desc: "Interior or exterior", color: "from-indigo-600 to-blue-600", category: "major" },
  { id: "fence-install", icon: Fence, title: "Fence Installation", desc: "Wood, vinyl, chain link", color: "from-stone-600 to-neutral-600", category: "major" },
  { id: "deck-build", icon: Construction, title: "Deck Building", desc: "Design, build, finish", color: "from-amber-600 to-orange-600", category: "major" },
  { id: "bathroom-remodel", icon: Bath, title: "Bathroom Updates", desc: "Fixtures, vanity, tile", color: "from-blue-600 to-cyan-600", category: "major" },
  { id: "kitchen-update", icon: UtensilsCrossed, title: "Kitchen Updates", desc: "Cabinets, counters, fixtures", color: "from-amber-600 to-orange-600", category: "major" },
  { id: "flooring", icon: Construction, title: "Flooring Installation", desc: "Hardwood, laminate, tile", color: "from-amber-500 to-stone-500", category: "major" },
  { id: "basement-finish", icon: Home, title: "Basement Finishing", desc: "Walls, flooring, ceiling", color: "from-gray-600 to-slate-600", category: "major" },
  { id: "electrical", icon: Plug, title: "Electrical Work", desc: "Panel, wiring, upgrades", color: "from-yellow-500 to-amber-500", category: "major" },
  { id: "plumbing", icon: Droplets, title: "Plumbing Work", desc: "Pipes, fixtures, drains", color: "from-blue-500 to-cyan-500", category: "major" },
  { id: "hvac", icon: AirVent, title: "HVAC Services", desc: "Install, repair, maintain", color: "from-sky-500 to-blue-500", category: "major" },
  { id: "roofing", icon: Home, title: "Roofing Repair", desc: "Shingles, leaks, gutters", color: "from-gray-600 to-slate-600", category: "major" },
  { id: "siding", icon: Building2, title: "Siding Repair", desc: "Replace, repair, paint", color: "from-stone-500 to-gray-500", category: "major" },
  { id: "concrete", icon: Construction, title: "Concrete Work", desc: "Patios, walkways, repair", color: "from-gray-500 to-slate-500", category: "major" },
  { id: "home-staging", icon: Armchair, title: "Home Staging", desc: "Prepare home for sale", color: "from-pink-500 to-rose-500", category: "major" },
  { id: "full-move", icon: Truck, title: "Full Home Move", desc: "Pack, move, unpack", color: "from-orange-600 to-red-600", category: "major" },
  
  // ===== BUSINESS & PROFESSIONAL =====
  { id: "office-cleaning", icon: Building2, title: "Office Cleaning", desc: "Commercial cleaning", color: "from-blue-500 to-indigo-500", category: "business" },
  { id: "restaurant-clean", icon: Store, title: "Restaurant Cleaning", desc: "Kitchen, dining deep clean", color: "from-green-500 to-teal-500", category: "business" },
  { id: "retail-help", icon: Store, title: "Retail Help", desc: "Stocking, displays, sales", color: "from-purple-500 to-pink-500", category: "business" },
  { id: "inventory", icon: ClipboardList, title: "Inventory Count", desc: "Count, organize, report", color: "from-blue-400 to-indigo-400", category: "business" },
  { id: "data-entry", icon: FileText, title: "Data Entry", desc: "Input, organize, verify", color: "from-gray-500 to-slate-500", category: "business" },
  { id: "admin-assist", icon: Briefcase, title: "Admin Assistant", desc: "Schedule, calls, organize", color: "from-violet-500 to-purple-500", category: "business" },
  { id: "bookkeeping", icon: Calculator, title: "Bookkeeping", desc: "Records, invoices, reports", color: "from-green-600 to-emerald-600", category: "business" },
  { id: "social-media", icon: Megaphone, title: "Social Media Help", desc: "Posts, content, manage", color: "from-pink-500 to-rose-500", category: "business" },
  { id: "graphic-design", icon: Palette, title: "Graphic Design", desc: "Logos, marketing, social", color: "from-pink-500 to-purple-500", category: "business" },
  { id: "web-updates", icon: Globe, title: "Website Updates", desc: "Content, images, fixes", color: "from-blue-600 to-indigo-600", category: "business" },
  { id: "marketing-help", icon: Target, title: "Marketing Help", desc: "Flyers, campaigns, promos", color: "from-orange-500 to-red-500", category: "business" },
  { id: "translation", icon: Languages, title: "Translation", desc: "Documents, content, verbal", color: "from-teal-500 to-cyan-500", category: "business" },
  { id: "transcription", icon: FileText, title: "Transcription", desc: "Audio, video to text", color: "from-gray-500 to-slate-500", category: "business" },
  { id: "research", icon: Search, title: "Research Assistance", desc: "Find info, compile data", color: "from-blue-500 to-indigo-500", category: "business" },
  
  // ===== SPECIALTY & SEASONAL =====
  { id: "christmas-lights", icon: Sparkles, title: "Christmas Light Install", desc: "Hang, setup, takedown", color: "from-red-500 to-green-500", category: "seasonal" },
  { id: "holiday-decor", icon: Gift, title: "Holiday Decorating", desc: "Indoor/outdoor decor", color: "from-red-400 to-pink-400", category: "seasonal" },
  { id: "spring-cleanup", icon: Flower2, title: "Spring Cleanup", desc: "Yard, garden, refresh", color: "from-green-500 to-lime-500", category: "seasonal" },
  { id: "fall-cleanup", icon: Leaf, title: "Fall Cleanup", desc: "Leaves, winterize, prep", color: "from-orange-500 to-amber-500", category: "seasonal" },
  { id: "winterize-home", icon: Snowflake, title: "Winterize Home", desc: "Pipes, insulation, prep", color: "from-blue-500 to-cyan-500", category: "seasonal" },
  { id: "ac-service", icon: ThermometerSun, title: "AC Service", desc: "Clean, check, maintain", color: "from-cyan-500 to-blue-500", category: "seasonal" },
  { id: "fireplace-clean", icon: Flame, title: "Fireplace Cleaning", desc: "Chimney sweep, inspect", color: "from-orange-600 to-red-600", category: "seasonal" },
  { id: "pest-control", icon: Bug, title: "Pest Control Help", desc: "Treatment, prevention", color: "from-gray-600 to-slate-600", category: "seasonal" },
  { id: "firewood", icon: Axe, title: "Firewood Services", desc: "Deliver, stack, split", color: "from-amber-600 to-orange-600", category: "seasonal" },
  { id: "gift-wrapping", icon: Gift, title: "Gift Wrapping", desc: "Wrap, package, ship", color: "from-pink-500 to-rose-500", category: "seasonal" },
  { id: "party-cleanup", icon: PartyPopper, title: "Party Cleanup", desc: "After-event cleaning", color: "from-purple-500 to-pink-500", category: "seasonal" },
  
  // ===== TRANSPORT & DELIVERY =====
  { id: "airport-ride", icon: Plane, title: "Airport Pickup/Drop", desc: "Reliable transport", color: "from-blue-600 to-indigo-600", category: "transport" },
  { id: "medical-transport", icon: Hospital, title: "Medical Transport", desc: "Appointments, hospital", color: "from-red-500 to-pink-500", category: "transport" },
  { id: "courier", icon: Truck, title: "Courier Service", desc: "Same-day delivery", color: "from-blue-500 to-indigo-500", category: "transport" },
  { id: "furniture-delivery", icon: Sofa, title: "Furniture Pickup", desc: "Buy, transport, deliver", color: "from-amber-500 to-orange-500", category: "transport" },
  { id: "returns", icon: Package, title: "Returns & Exchanges", desc: "Return items for you", color: "from-gray-500 to-slate-500", category: "transport" },
  { id: "wait-in-line", icon: Clock, title: "Wait in Line", desc: "Queue for services", color: "from-blue-400 to-indigo-400", category: "transport" },
  { id: "prescription-pickup", icon: Stethoscope, title: "Prescription Pickup", desc: "Pharmacy runs", color: "from-green-500 to-teal-500", category: "transport" },
  { id: "vehicle-transport", icon: Car, title: "Vehicle Transport", desc: "Drive car to location", color: "from-gray-600 to-slate-600", category: "transport" },
  
  // ===== TIFFIN & FOOD =====
  { id: "tiffin", icon: CookingPot, title: "Tiffin Service", desc: "Daily home-cooked meals", color: "from-orange-500 to-amber-500", category: "food", popular: true },
  { id: "baking", icon: Cake, title: "Custom Baking", desc: "Cakes, cookies, pastries", color: "from-pink-400 to-rose-400", category: "food" },
  { id: "bbq-chef", icon: Flame, title: "BBQ Chef", desc: "Grill master for events", color: "from-red-500 to-orange-500", category: "food" },
  { id: "dietary-meals", icon: Heart, title: "Special Diet Meals", desc: "Keto, vegan, allergy-safe", color: "from-green-500 to-teal-500", category: "food" },
];

const Services = () => {
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Scroll to section if hash present
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.hash]);

  const popularServices = allServices.filter(s => s.popular);
  const quickTasks = allServices.filter(s => s.category === 'quick');
  const smallTasks = allServices.filter(s => s.category === 'small');
  const mediumTasks = allServices.filter(s => s.category === 'medium');
  const largeTasks = allServices.filter(s => s.category === 'large');
  const majorProjects = allServices.filter(s => s.category === 'major');
  const businessServices = allServices.filter(s => s.category === 'business');
  const seasonalServices = allServices.filter(s => s.category === 'seasonal');
  const transportServices = allServices.filter(s => s.category === 'transport');
  const foodServices = allServices.filter(s => s.category === 'food');

  const ServiceCard = ({ service }: { service: typeof allServices[0] }) => (
    <Card 
      id={service.id}
      className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 hover:-translate-y-1 cursor-pointer"
      onClick={() => user ? window.location.href = `/browse?category=${encodeURIComponent(service.title)}` : window.location.href = '/auth?tab=signup'}
    >
      <CardContent className="p-6 space-y-4">
        <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <service.icon className="h-7 w-7 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            {service.title}
            {service.popular && <Badge variant="secondary" className="text-xs">Popular</Badge>}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{service.desc}</p>
        </div>
        <Button variant="ghost" size="sm" className="w-full gap-2 group-hover:bg-primary/10">
          {user ? 'Browse Tasks' : 'Get Started'} <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );

  const SectionHeader = ({ title, description }: { title: string; description: string }) => (
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold mb-3">{title}</h2>
      <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="All Services | SaskTask"
        description="Browse all services available on SaskTask - from cleaning and handyman to pet care and delivery. Find trusted local professionals in Saskatchewan."
        url="/services"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto text-center">
          <Badge className="mb-6" variant="secondary">130+ Service Categories</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Every Service You Need,
            <span className="block text-gradient-hero">One Platform</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            From home repairs to pet care, find verified professionals for any task in Saskatchewan
          </p>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-5 w-5 text-primary" />
              <span>Verified Professionals</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>4.9 Average Rating</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Secure Payments</span>
            </div>
          </div>

          {!user && (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/auth?tab=signup">
                <Button size="lg" variant="premium" className="gap-2">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/become-tasker">
                <Button size="lg" variant="outline">
                  Become a Tasker
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <SectionHeader 
            title="Most Popular Services" 
            description="Our most requested services by Saskatchewan residents"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Quick Tasks */}
      <section id="quick-tasks" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <SectionHeader 
            title="⚡ Quick Tasks (15-30 mins)" 
            description="Small fixes and installations that take less than an hour"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickTasks.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Small Tasks */}
      <section id="small-tasks" className="py-16 px-4">
        <div className="container mx-auto">
          <SectionHeader 
            title="🏠 Small Tasks (30 mins - 2 hours)" 
            description="Regular home maintenance and personal services"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {smallTasks.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Medium Tasks */}
      <section id="medium-tasks" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <SectionHeader 
            title="🔧 Medium Tasks (2-4 hours)" 
            description="Projects requiring more time and expertise"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mediumTasks.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Large Tasks */}
      <section id="large-tasks" className="py-16 px-4">
        <div className="container mx-auto">
          <SectionHeader 
            title="📅 Large Tasks (Half day - Full day)" 
            description="Bigger projects that need dedicated time"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {largeTasks.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Major Projects */}
      <section id="major-projects" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <SectionHeader 
            title="🏗️ Major Projects (Multiple days)" 
            description="Big renovations and construction work"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {majorProjects.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Business Services */}
      <section id="business" className="py-16 px-4">
        <div className="container mx-auto">
          <SectionHeader 
            title="💼 Business & Professional" 
            description="Commercial cleaning, admin support, and business help"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Seasonal Services */}
      <section id="seasonal" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <SectionHeader 
            title="🎄 Seasonal & Specialty" 
            description="Holiday, seasonal, and specialty services"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {seasonalServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Transport Services */}
      <section id="transport" className="py-16 px-4">
        <div className="container mx-auto">
          <SectionHeader 
            title="🚗 Transport & Delivery" 
            description="Rides, courier services, and pickup/delivery"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {transportServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Food Services */}
      <section id="food" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <SectionHeader 
            title="🍱 Tiffin & Food Services" 
            description="Home-cooked meals, catering, and personal chefs"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {foodServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <Card className="bg-gradient-to-br from-primary via-primary/90 to-secondary border-0">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                  Join thousands of Saskatchewan residents who trust SaskTask for their everyday needs
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link to="/auth?tab=signup">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2">
                      Create Free Account <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/become-tasker">
                    <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                      Earn Money as a Tasker
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Services;
