import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryFilters } from "@/components/CategoryFilters";
import { 
  categories, 
  timeEstimateLabels, 
  categoryTypeLabels,
  skillLevelLabels,
  TimeEstimate,
  CategoryType,
  SkillLevel
} from "@/lib/categories";
import { Clock, MapPin, Award, Search, Star, TrendingUp } from "lucide-react";

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTime, setSelectedTime] = useState<TimeEstimate | "all">("all");
  const [selectedType, setSelectedType] = useState<CategoryType | "all">("all");
  const [selectedSkill, setSelectedSkill] = useState<SkillLevel | "all">("all");

  const filteredCategories = useMemo(() => {
    return categories.filter(category => {
      // Search filter
      if (searchTerm && !category.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !category.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // Time filter
      if (selectedTime !== "all" && category.timeEstimate !== selectedTime) {
        return false;
      }
      // Type filter
      if (selectedType !== "all" && category.categoryType !== selectedType) {
        return false;
      }
      // Skill filter
      if (selectedSkill !== "all" && category.skillLevel !== selectedSkill) {
        return false;
      }
      return true;
    });
  }, [searchTerm, selectedTime, selectedType, selectedSkill]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTime("all");
    setSelectedType("all");
    setSelectedSkill("all");
  };

  const quickCategories = categories.filter(c => c.timeEstimate === "quick");
  const featuredCategories = categories.filter(c => c.featured);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">
            Browse by <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Category</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find the perfect task or offer your expertise in any category
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card className="border-border bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{quickCategories.length}</p>
                <p className="text-sm text-muted-foreground">Quick Tasks (15-30 min)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-gradient-to-br from-primary/10 to-secondary/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{featuredCategories.length}</p>
                <p className="text-sm text-muted-foreground">Featured Categories</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-sm text-muted-foreground">Total Categories</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 shrink-0">
            <CategoryFilters
              selectedTime={selectedTime}
              selectedType={selectedType}
              selectedSkill={selectedSkill}
              onTimeChange={setSelectedTime}
              onTypeChange={setSelectedType}
              onSkillChange={setSelectedSkill}
              onClear={clearFilters}
            />
          </div>

          {/* Categories Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredCategories.length} of {categories.length} categories
              </p>
              {(selectedTime !== "all" || selectedType !== "all" || selectedSkill !== "all" || searchTerm) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>

            {filteredCategories.length === 0 ? (
              <Card className="border-border">
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No categories found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your filters or search term</p>
                  <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCategories.map((category, idx) => {
                  const timeInfo = timeEstimateLabels[category.timeEstimate];
                  return (
                    <Link key={idx} to={`/browse?category=${encodeURIComponent(category.title)}`}>
                      <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-border hover:border-primary/50 h-full relative overflow-hidden">
                        {/* Featured badge */}
                        {category.featured && (
                          <div className="absolute top-3 right-3">
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              Featured
                            </Badge>
                          </div>
                        )}
                        
                        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                          <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                            <category.icon className="h-10 w-10 text-white" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                              {category.title}
                            </h3>
                            <p className="text-sm text-primary font-semibold">{category.count}</p>
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          </div>
                          
                          {/* Badges */}
                          <div className="flex flex-wrap justify-center gap-2 pt-2">
                            <Badge variant="outline" className={`${timeInfo.color} text-xs`}>
                              <Clock className="h-3 w-3 mr-1" />
                              {timeInfo.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {categoryTypeLabels[category.categoryType]}
                            </Badge>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            {skillLevelLabels[category.skillLevel]}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center py-12 px-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl">
          <h2 className="text-3xl font-bold mb-4">Don't See Your Category?</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            We're always expanding! Post your task anyway, and our Taskers will let you know if they can help.
          </p>
          <Link to="/post-task">
            <Button size="lg" className="px-8 bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg transition-all">
              Post a Task
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
