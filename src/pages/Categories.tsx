import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
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
  Briefcase
} from "lucide-react";

export default function Categories() {
  const categories = [
    // Quick Tasks (15-60 minutes)
    {
      icon: Snowflake,
      title: "Snow Removal",
      count: "150+ tasks",
      color: "from-blue-500 to-cyan-500",
      description: "Driveways, walkways, and roofs"
    },
    {
      icon: Sparkles,
      title: "Cleaning",
      count: "200+ tasks",
      color: "from-purple-500 to-pink-500",
      description: "Home, office, and deep cleaning"
    },
    {
      icon: Truck,
      title: "Moving & Delivery",
      count: "180+ tasks",
      color: "from-orange-500 to-red-500",
      description: "Furniture, boxes, and pickups"
    },
    {
      icon: Package,
      title: "Assembly",
      count: "120+ tasks",
      color: "from-green-500 to-emerald-500",
      description: "Furniture, equipment, and installations"
    },
    {
      icon: Monitor,
      title: "Mounting & Installation",
      count: "90+ tasks",
      color: "from-indigo-500 to-purple-500",
      description: "TVs, shelves, and fixtures"
    },
    {
      icon: Trees,
      title: "Outdoor Help",
      count: "140+ tasks",
      color: "from-teal-500 to-cyan-500",
      description: "Lawn care, gardening, landscaping"
    },
    {
      icon: Home,
      title: "Home Repairs",
      count: "110+ tasks",
      color: "from-rose-500 to-pink-500",
      description: "Plumbing, electrical, general fixes"
    },
    {
      icon: PaintBucket,
      title: "Painting",
      count: "85+ tasks",
      color: "from-amber-500 to-orange-500",
      description: "Interior, exterior, touch-ups"
    },
    {
      icon: Dog,
      title: "Pet Care",
      count: "95+ tasks",
      color: "from-pink-500 to-rose-500",
      description: "Walking, sitting, grooming"
    },
    {
      icon: Car,
      title: "Auto Services",
      count: "70+ tasks",
      color: "from-slate-500 to-gray-500",
      description: "Detailing, minor repairs, oil changes"
    },
    {
      icon: Laptop,
      title: "Tech Support",
      count: "65+ tasks",
      color: "from-blue-500 to-indigo-500",
      description: "Setup, troubleshooting, repairs"
    },
    {
      icon: ShoppingBag,
      title: "Shopping & Errands",
      count: "100+ tasks",
      color: "from-violet-500 to-purple-500",
      description: "Grocery, pickup, deliveries"
    },
    {
      icon: Utensils,
      title: "Meal Prep",
      count: "45+ tasks",
      color: "from-orange-500 to-amber-500",
      description: "Cooking, meal planning, catering"
    },
    {
      icon: GraduationCap,
      title: "Tutoring",
      count: "55+ tasks",
      color: "from-emerald-500 to-green-500",
      description: "Academic, music, language"
    },
    {
      icon: Camera,
      title: "Photography",
      count: "40+ tasks",
      color: "from-sky-500 to-blue-500",
      description: "Events, portraits, product photos"
    },
    {
      icon: Wrench,
      title: "General Labor",
      count: "160+ tasks",
      color: "from-gray-500 to-slate-500",
      description: "Various odd jobs and assistance"
    },
    // Additional Quick Gig Tasks
    {
      icon: Baby,
      title: "Babysitting",
      count: "80+ tasks",
      color: "from-pink-400 to-rose-400",
      description: "Childcare, pickup, supervision"
    },
    {
      icon: Heart,
      title: "Senior Care",
      count: "60+ tasks",
      color: "from-red-400 to-pink-400",
      description: "Companionship, errands, light help"
    },
    {
      icon: Scissors,
      title: "Sewing & Alterations",
      count: "35+ tasks",
      color: "from-fuchsia-500 to-pink-500",
      description: "Hemming, repairs, custom work"
    },
    {
      icon: Shirt,
      title: "Laundry Services",
      count: "50+ tasks",
      color: "from-cyan-500 to-blue-500",
      description: "Washing, ironing, folding"
    },
    {
      icon: Mail,
      title: "Mail & Package Pickup",
      count: "45+ tasks",
      color: "from-yellow-500 to-orange-500",
      description: "Post office runs, parcel collection"
    },
    {
      icon: Key,
      title: "House Sitting",
      count: "40+ tasks",
      color: "from-amber-500 to-yellow-500",
      description: "Home watch, plant care, security"
    },
    {
      icon: Recycle,
      title: "Junk Removal",
      count: "75+ tasks",
      color: "from-green-600 to-emerald-600",
      description: "Hauling, disposal, recycling"
    },
    {
      icon: Hammer,
      title: "Handyman Services",
      count: "130+ tasks",
      color: "from-stone-500 to-zinc-500",
      description: "Small repairs, installations, fixes"
    },
    {
      icon: Sofa,
      title: "Furniture Moving",
      count: "90+ tasks",
      color: "from-amber-600 to-orange-600",
      description: "Heavy lifting, rearranging, setup"
    },
    {
      icon: Leaf,
      title: "Yard Work",
      count: "120+ tasks",
      color: "from-lime-500 to-green-500",
      description: "Raking, weeding, trimming"
    },
    {
      icon: Droplet,
      title: "Pressure Washing",
      count: "55+ tasks",
      color: "from-blue-400 to-cyan-400",
      description: "Decks, driveways, siding"
    },
    {
      icon: Wind,
      title: "Window Cleaning",
      count: "65+ tasks",
      color: "from-sky-400 to-blue-400",
      description: "Interior, exterior, screens"
    },
    {
      icon: Box,
      title: "Packing & Organizing",
      count: "70+ tasks",
      color: "from-indigo-400 to-violet-400",
      description: "Moving prep, closets, storage"
    },
    {
      icon: FileText,
      title: "Data Entry",
      count: "40+ tasks",
      color: "from-slate-400 to-gray-400",
      description: "Typing, spreadsheets, filing"
    },
    {
      icon: Gift,
      title: "Event Help",
      count: "85+ tasks",
      color: "from-rose-400 to-red-400",
      description: "Setup, serving, cleanup"
    },
    {
      icon: Music,
      title: "Entertainment",
      count: "30+ tasks",
      color: "from-purple-400 to-indigo-400",
      description: "DJ, music, party hosting"
    },
    {
      icon: Dumbbell,
      title: "Personal Training",
      count: "35+ tasks",
      color: "from-red-500 to-orange-500",
      description: "Fitness coaching, workout help"
    },
    {
      icon: Clock,
      title: "Waiting in Line",
      count: "25+ tasks",
      color: "from-teal-400 to-emerald-400",
      description: "Queue holding, ticket pickup"
    },
    {
      icon: Users,
      title: "Virtual Assistant",
      count: "50+ tasks",
      color: "from-violet-400 to-purple-400",
      description: "Scheduling, calls, admin tasks"
    },
    {
      icon: Zap,
      title: "Quick Repairs",
      count: "95+ tasks",
      color: "from-yellow-400 to-amber-400",
      description: "Minor fixes under an hour"
    },
    {
      icon: Briefcase,
      title: "Document Delivery",
      count: "40+ tasks",
      color: "from-neutral-500 to-stone-500",
      description: "Legal docs, contracts, papers"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Browse by <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Category</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find the perfect task or offer your expertise in any category
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, idx) => (
            <Link key={idx} to={`/browse?category=${encodeURIComponent(category.title)}`}>
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-border hover:border-primary/50 h-full">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                    <category.icon className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-sm text-primary font-semibold mb-2">{category.count}</p>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center py-12 px-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl">
          <h2 className="text-3xl font-bold mb-4">Don't See Your Category?</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            We're always expanding! Post your task anyway, and our Taskers will let you know if they can help.
          </p>
          <Link to="/post-task">
            <button className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-lg transition-all">
              Post a Task
            </button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}