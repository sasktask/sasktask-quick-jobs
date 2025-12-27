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
  Tv, ArrowRight, Shield, Star, CheckCircle2, Users
} from "lucide-react";

const allServices = [
  // Home Services
  { id: "cleaning", icon: Sparkles, title: "Cleaning", desc: "House cleaning, deep clean, move-out cleaning", color: "from-purple-500 to-pink-500", popular: true },
  { id: "handyman", icon: Hammer, title: "Handyman", desc: "Repairs, installations, general fixes", color: "from-stone-500 to-zinc-500", popular: true },
  { id: "assembly", icon: Package, title: "Furniture Assembly", desc: "IKEA, beds, desks, shelving", color: "from-green-500 to-emerald-500", popular: true },
  { id: "moving", icon: Truck, title: "Moving & Delivery", desc: "Local moves, furniture delivery, hauling", color: "from-orange-500 to-red-500", popular: true },
  { id: "painting", icon: PaintBucket, title: "Painting", desc: "Interior, exterior, touch-ups", color: "from-indigo-500 to-blue-500" },
  { id: "electrical", icon: Plug, title: "Electrical", desc: "Outlets, lighting, fan installation", color: "from-yellow-500 to-amber-500" },
  { id: "plumbing", icon: Bath, title: "Plumbing", desc: "Faucets, toilets, drain cleaning", color: "from-blue-500 to-cyan-500" },
  { id: "hvac", icon: AirVent, title: "HVAC Services", desc: "AC repair, furnace maintenance", color: "from-sky-500 to-blue-500" },
  { id: "carpentry", icon: Construction, title: "Carpentry", desc: "Custom builds, repairs, decks", color: "from-amber-600 to-orange-600" },
  { id: "fencing", icon: Fence, title: "Fencing", desc: "Installation, repair, gates", color: "from-stone-600 to-neutral-600" },
  
  // Outdoor Services
  { id: "snow", icon: Snowflake, title: "Snow Removal", desc: "Driveways, walkways, salting", color: "from-blue-400 to-cyan-400", popular: true },
  { id: "yard", icon: Leaf, title: "Yard Work", desc: "Mowing, raking, gardening", color: "from-lime-500 to-green-500", popular: true },
  { id: "landscaping", icon: TreeDeciduous, title: "Landscaping", desc: "Garden design, planting, mulching", color: "from-green-600 to-emerald-600" },
  { id: "tree", icon: Axe, title: "Tree Services", desc: "Trimming, removal, stump grinding", color: "from-emerald-600 to-green-700" },
  { id: "pressure-washing", icon: Wind, title: "Pressure Washing", desc: "Decks, driveways, siding", color: "from-blue-500 to-indigo-500" },
  { id: "gutter", icon: Construction, title: "Gutter Cleaning", desc: "Clean and repair gutters", color: "from-gray-500 to-slate-500" },
  { id: "pool", icon: Bath, title: "Pool Services", desc: "Cleaning, maintenance, opening/closing", color: "from-cyan-500 to-blue-500" },
  { id: "firewood", icon: Flame, title: "Firewood Services", desc: "Delivery, stacking, splitting", color: "from-orange-600 to-red-600" },
  
  // Personal Services
  { id: "pet-care", icon: Dog, title: "Pet Care", desc: "Dog walking, pet sitting, grooming", color: "from-pink-500 to-rose-500", popular: true },
  { id: "babysitting", icon: Baby, title: "Babysitting", desc: "Childcare, pickup, supervision", color: "from-pink-400 to-rose-400" },
  { id: "senior-care", icon: Heart, title: "Senior Care", desc: "Companionship, errands, assistance", color: "from-red-400 to-pink-400" },
  { id: "personal-assistant", icon: Users, title: "Personal Assistant", desc: "Scheduling, organizing, tasks", color: "from-violet-500 to-purple-500" },
  { id: "fitness", icon: Dumbbell, title: "Personal Training", desc: "Home workouts, fitness coaching", color: "from-red-500 to-orange-500" },
  { id: "wellness", icon: Stethoscope, title: "Wellness Services", desc: "Massage, therapy, health coaching", color: "from-teal-500 to-green-500" },
  
  // Errands & Delivery
  { id: "shopping", icon: ShoppingBag, title: "Shopping & Errands", desc: "Grocery, pharmacy, returns", color: "from-violet-500 to-purple-500", popular: true },
  { id: "transport", icon: MapPin, title: "Rides & Transport", desc: "Airport, appointments, events", color: "from-emerald-500 to-teal-500" },
  { id: "courier", icon: Truck, title: "Courier Services", desc: "Same-day delivery, documents", color: "from-blue-500 to-indigo-500" },
  { id: "wait-in-line", icon: Users, title: "Wait in Line", desc: "Queue for tickets, services", color: "from-gray-500 to-slate-500" },
  
  // Tech & Creative
  { id: "tech-support", icon: Monitor, title: "Tech Support", desc: "Computer help, setup, troubleshooting", color: "from-blue-500 to-indigo-500" },
  { id: "tv-mounting", icon: Tv, title: "TV Mounting", desc: "Wall mount installation, cable management", color: "from-slate-500 to-gray-600" },
  { id: "smart-home", icon: Monitor, title: "Smart Home Setup", desc: "Devices, automation, security", color: "from-indigo-500 to-purple-500" },
  { id: "photography", icon: Camera, title: "Photography", desc: "Events, portraits, products", color: "from-rose-500 to-pink-500" },
  { id: "videography", icon: Camera, title: "Videography", desc: "Events, social media, editing", color: "from-red-500 to-rose-500" },
  { id: "graphic-design", icon: Palette, title: "Graphic Design", desc: "Logos, marketing, social media", color: "from-pink-500 to-purple-500" },
  { id: "music", icon: Music, title: "Music Services", desc: "Lessons, DJ, live performance", color: "from-purple-500 to-indigo-500" },
  
  // Auto & Vehicle
  { id: "auto-detail", icon: Car, title: "Auto Detailing", desc: "Interior, exterior, waxing", color: "from-gray-500 to-slate-600" },
  { id: "car-wash", icon: Car, title: "Car Wash", desc: "Mobile wash, cleaning", color: "from-blue-400 to-cyan-400" },
  { id: "tire-change", icon: Car, title: "Tire Services", desc: "Seasonal change, rotation", color: "from-gray-600 to-zinc-600" },
  
  // Education & Tutoring
  { id: "tutoring", icon: GraduationCap, title: "Tutoring", desc: "Math, science, languages, test prep", color: "from-blue-500 to-indigo-500" },
  { id: "music-lessons", icon: Music, title: "Music Lessons", desc: "Piano, guitar, voice", color: "from-violet-500 to-purple-500" },
  { id: "language", icon: GraduationCap, title: "Language Lessons", desc: "ESL, French, Spanish", color: "from-emerald-500 to-teal-500" },
  
  // Events & Special
  { id: "event-help", icon: Gift, title: "Event Help", desc: "Setup, serving, cleanup", color: "from-pink-500 to-rose-500" },
  { id: "catering", icon: CookingPot, title: "Catering", desc: "Party food, meal prep", color: "from-orange-500 to-amber-500" },
  { id: "tiffin", icon: CookingPot, title: "Tiffin Services", desc: "Home-cooked meals, meal plans", color: "from-orange-500 to-amber-500" },
  { id: "bartending", icon: Gift, title: "Bartending", desc: "Events, parties, mixology", color: "from-purple-500 to-pink-500" },
  
  // Specialty Services
  { id: "organization", icon: Sofa, title: "Home Organization", desc: "Declutter, closets, garage", color: "from-teal-500 to-cyan-500" },
  { id: "laundry", icon: Shirt, title: "Laundry Services", desc: "Wash, fold, dry cleaning pickup", color: "from-blue-400 to-indigo-400" },
  { id: "junk-removal", icon: Recycle, title: "Junk Removal", desc: "Hauling, disposal, donations", color: "from-green-600 to-emerald-600" },
  { id: "storage", icon: Package, title: "Storage Help", desc: "Packing, organizing, moving to storage", color: "from-amber-500 to-orange-500" },
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
  const homeServices = allServices.filter(s => ['cleaning', 'handyman', 'assembly', 'moving', 'painting', 'electrical', 'plumbing', 'hvac', 'carpentry', 'fencing'].includes(s.id));
  const outdoorServices = allServices.filter(s => ['snow', 'yard', 'landscaping', 'tree', 'pressure-washing', 'gutter', 'pool', 'firewood'].includes(s.id));
  const personalServices = allServices.filter(s => ['pet-care', 'babysitting', 'senior-care', 'personal-assistant', 'fitness', 'wellness'].includes(s.id));
  const errandServices = allServices.filter(s => ['shopping', 'transport', 'courier', 'wait-in-line'].includes(s.id));
  const techServices = allServices.filter(s => ['tech-support', 'tv-mounting', 'smart-home', 'photography', 'videography', 'graphic-design', 'music'].includes(s.id));
  const specialtyServices = allServices.filter(s => ['organization', 'laundry', 'junk-removal', 'storage', 'event-help', 'catering', 'tiffin', 'bartending'].includes(s.id));

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
          <Badge className="mb-6" variant="secondary">60+ Service Categories</Badge>
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

      {/* Home Services */}
      <section id="home-services" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <SectionHeader 
            title="Home Services" 
            description="Everything to keep your home running smoothly"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {homeServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Outdoor Services */}
      <section id="outdoor-services" className="py-16 px-4">
        <div className="container mx-auto">
          <SectionHeader 
            title="Outdoor & Seasonal" 
            description="Yard work, snow removal, and outdoor maintenance"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {outdoorServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Personal Services */}
      <section id="personal-services" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <SectionHeader 
            title="Personal Care" 
            description="Pet care, childcare, and personal assistance"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Errands & Delivery */}
      <section id="errands" className="py-16 px-4">
        <div className="container mx-auto">
          <SectionHeader 
            title="Errands & Delivery" 
            description="Shopping, transport, and courier services"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {errandServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Tech & Creative */}
      <section id="tech" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <SectionHeader 
            title="Tech & Creative" 
            description="Technology help, photography, and creative services"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Specialty Services */}
      <section id="specialty" className="py-16 px-4">
        <div className="container mx-auto">
          <SectionHeader 
            title="Specialty Services" 
            description="Organization, events, and specialty tasks"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialtyServices.map(service => (
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
