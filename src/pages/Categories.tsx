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
  Camera
} from "lucide-react";

export default function Categories() {
  const categories = [
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