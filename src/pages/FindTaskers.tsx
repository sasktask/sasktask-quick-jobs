import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Star, MapPin, Shield } from "lucide-react";

export default function FindTaskers() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for taskers
  const taskers = [
    {
      id: 1,
      name: "John Smith",
      rating: 4.9,
      reviews: 127,
      skills: ["Snow Removal", "Lawn Care", "Cleaning"],
      location: "Saskatoon, SK",
      verified: true,
      hourlyRate: "$25-35",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      rating: 4.8,
      reviews: 95,
      skills: ["Moving", "Assembly", "Painting"],
      location: "Regina, SK",
      verified: true,
      hourlyRate: "$30-40",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    {
      id: 3,
      name: "Mike Davis",
      rating: 5.0,
      reviews: 163,
      skills: ["Home Repairs", "Electrical", "Plumbing"],
      location: "Saskatoon, SK",
      verified: true,
      hourlyRate: "$40-60",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike"
    },
    {
      id: 4,
      name: "Emma Wilson",
      rating: 4.7,
      reviews: 78,
      skills: ["Cleaning", "Organization", "Pet Care"],
      location: "Prince Albert, SK",
      verified: true,
      hourlyRate: "$20-30",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Find <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Verified Taskers</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse skilled professionals in Saskatchewan ready to help with your tasks
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by skill, location, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg"
            />
            <Button className="absolute right-2 top-2 h-10" variant="hero">
              Search
            </Button>
          </div>
        </div>

        {/* Taskers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {taskers.map((tasker) => (
            <Card key={tasker.id} className="hover:shadow-lg transition-all duration-300 border-border group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={tasker.image}
                    alt={tasker.name}
                    className="w-20 h-20 rounded-full border-2 border-primary/20 group-hover:border-primary/50 transition-colors"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold">{tasker.name}</h3>
                      {tasker.verified && (
                        <Shield className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{tasker.rating}</span>
                      <span className="text-muted-foreground">({tasker.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {tasker.location}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {tasker.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground">Hourly Rate</span>
                    <span className="font-bold text-lg text-primary">{tasker.hourlyRate}</span>
                  </div>

                  <Button className="w-full" variant="hero">
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}