import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryFilters } from "@/components/CategoryFilters";
import { 
  categories, 
  localTrends,
  timeEstimateLabels, 
  categoryTypeLabels,
  skillLevelLabels,
  TimeEstimate,
  CategoryType,
  SkillLevel,
  Category
} from "@/lib/categories";
import { 
  Clock, 
  MapPin, 
  Award, 
  Search, 
  Star, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp,
  Flame,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTime, setSelectedTime] = useState<TimeEstimate | "all">("all");
  const [selectedType, setSelectedType] = useState<CategoryType | "all">("all");
  const [selectedSkill, setSelectedSkill] = useState<SkillLevel | "all">("all");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const filteredCategories = useMemo(() => {
    return categories.filter(category => {
      // Search filter - also search in subcategories
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesMain = category.title.toLowerCase().includes(searchLower) ||
                          category.description.toLowerCase().includes(searchLower);
        const matchesSubcategory = category.subcategories?.some(
          sub => sub.title.toLowerCase().includes(searchLower) || 
                 sub.description.toLowerCase().includes(searchLower)
        );
        if (!matchesMain && !matchesSubcategory) {
          return false;
        }
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

  const toggleCategory = (categoryTitle: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryTitle)) {
        newSet.delete(categoryTitle);
      } else {
        newSet.add(categoryTitle);
      }
      return newSet;
    });
  };

  const quickCategories = categories.filter(c => c.timeEstimate === "quick");
  const featuredCategories = categories.filter(c => c.featured);
  const totalSubcategories = categories.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0);

  // Get high demand trends
  const highDemandTrends = localTrends.filter(t => t.demand === "high").slice(0, 6);

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

        {/* Local Trends Section */}
        <Card className="mb-8 border-border bg-gradient-to-br from-orange-500/5 via-red-500/5 to-pink-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="h-5 w-5 text-orange-500" />
              Trending in Your Area
              <Badge variant="secondary" className="ml-2 bg-orange-500/10 text-orange-600 border-orange-500/20">
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {highDemandTrends.map((trend, idx) => (
                <Link 
                  key={idx} 
                  to={`/browse?category=${encodeURIComponent(trend.category)}&search=${encodeURIComponent(trend.subcategory)}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background/60 border border-border hover:border-primary/50 hover:bg-background transition-all group">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                        {trend.subcategory}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{trend.category}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs shrink-0 ${
                          trend.demand === "high" 
                            ? "bg-red-500/10 text-red-600 border-red-500/20" 
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        }`}
                      >
                        {trend.demand === "high" ? "High Demand" : "Rising"}
                      </Badge>
                      <div className="flex items-center text-green-600 text-xs font-medium shrink-0">
                        <ArrowUp className="h-3 w-3" />
                        {trend.change}%
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Based on task demand in Saskatchewan • Updated weekly
            </p>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <Card className="border-border bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{quickCategories.length}</p>
                <p className="text-xs text-muted-foreground">Quick Tasks</p>
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
                <p className="text-xs text-muted-foreground">Featured</p>
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
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSubcategories}</p>
                <p className="text-xs text-muted-foreground">Subcategories</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search categories or services..."
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
              <div className="space-y-4">
                {filteredCategories.map((category, idx) => {
                  const timeInfo = timeEstimateLabels[category.timeEstimate];
                  const isExpanded = expandedCategories.has(category.title);
                  const hasSubcategories = category.subcategories && category.subcategories.length > 0;
                  
                  return (
                    <Card 
                      key={idx} 
                      className="border-border hover:border-primary/50 transition-all duration-300 overflow-hidden"
                    >
                      <Collapsible open={isExpanded} onOpenChange={() => hasSubcategories && toggleCategory(category.title)}>
                        <div className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <Link to={`/browse?category=${encodeURIComponent(category.title)}`}>
                              <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shrink-0 hover:scale-105 transition-transform shadow-lg`}>
                                <category.icon className="h-8 w-8 text-white" />
                              </div>
                            </Link>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <Link 
                                    to={`/browse?category=${encodeURIComponent(category.title)}`}
                                    className="hover:text-primary transition-colors"
                                  >
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                      {category.title}
                                      {category.featured && (
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                                          <Star className="h-3 w-3 mr-1 fill-current" />
                                          Featured
                                        </Badge>
                                      )}
                                    </h3>
                                  </Link>
                                  <p className="text-sm text-primary font-medium">{category.count}</p>
                                </div>
                                
                                {hasSubcategories && (
                                  <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="shrink-0">
                                      {isExpanded ? (
                                        <>
                                          <ChevronUp className="h-4 w-4 mr-1" />
                                          Hide
                                        </>
                                      ) : (
                                        <>
                                          <ChevronDown className="h-4 w-4 mr-1" />
                                          {category.subcategories?.length} services
                                        </>
                                      )}
                                    </Button>
                                  </CollapsibleTrigger>
                                )}
                              </div>
                              
                              <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                              
                              {/* Badges */}
                              <div className="flex flex-wrap gap-2 mt-3">
                                <Badge variant="outline" className={`${timeInfo.color} text-xs`}>
                                  <Clock className="h-3 w-3 mr-1" />
                                  {timeInfo.label}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {categoryTypeLabels[category.categoryType]}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  <Award className="h-3 w-3 mr-1" />
                                  {skillLevelLabels[category.skillLevel]}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Subcategories */}
                        {hasSubcategories && (
                          <CollapsibleContent>
                            <div className="px-4 pb-4">
                              <div className="border-t border-border pt-4">
                                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                                  Popular Services
                                </p>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {category.subcategories?.map((sub, subIdx) => (
                                    <Link
                                      key={subIdx}
                                      to={`/browse?category=${encodeURIComponent(category.title)}&search=${encodeURIComponent(sub.title)}`}
                                      className="block"
                                    >
                                      <div className="p-3 rounded-lg bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/30 transition-all group">
                                        <div className="flex items-start justify-between">
                                          <p className="font-medium text-sm group-hover:text-primary transition-colors">
                                            {sub.title}
                                          </p>
                                          {sub.trending && (
                                            <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs shrink-0 ml-2">
                                              <TrendingUp className="h-3 w-3 mr-1" />
                                              Hot
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">{sub.description}</p>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    </Card>
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