import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/categories";
import { ArrowRight, Snowflake, Sun, Leaf, Flower2, Calendar } from "lucide-react";

type Season = 'winter' | 'spring' | 'summer' | 'fall';

interface SeasonConfig {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGradient: string;
  months: number[];
  categoryKeywords: string[];
}

const seasonConfigs: Record<Season, SeasonConfig> = {
  winter: {
    name: 'Winter',
    icon: Snowflake,
    color: 'text-blue-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
    months: [12, 1, 2],
    categoryKeywords: [
      'snow', 'ice', 'winter', 'heating', 'furnace', 'fireplace', 
      'chimney', 'insulation', 'holiday', 'christmas', 'light installation',
      'pipe', 'frozen', 'salt', 'driveway'
    ]
  },
  spring: {
    name: 'Spring',
    icon: Flower2,
    color: 'text-pink-500',
    bgGradient: 'from-pink-500/10 to-green-500/10',
    months: [3, 4, 5],
    categoryKeywords: [
      'yard', 'garden', 'lawn', 'landscaping', 'planting', 'spring cleaning',
      'gutter', 'power wash', 'deck', 'fence', 'painting', 'exterior',
      'window', 'screen', 'allergy', 'air duct', 'deep clean'
    ]
  },
  summer: {
    name: 'Summer',
    icon: Sun,
    color: 'text-yellow-500',
    bgGradient: 'from-yellow-500/10 to-orange-500/10',
    months: [6, 7, 8],
    categoryKeywords: [
      'pool', 'air conditioning', 'ac', 'cooling', 'bbq', 'patio',
      'outdoor', 'deck', 'fence', 'roofing', 'siding', 'driveway',
      'moving', 'painting', 'renovation', 'construction', 'tree'
    ]
  },
  fall: {
    name: 'Fall',
    icon: Leaf,
    color: 'text-orange-500',
    bgGradient: 'from-orange-500/10 to-amber-500/10',
    months: [9, 10, 11],
    categoryKeywords: [
      'leaf', 'gutter', 'rake', 'winterize', 'heating', 'furnace',
      'insulation', 'weather', 'seal', 'caulk', 'window', 'door',
      'chimney', 'fireplace', 'harvest', 'fall cleanup'
    ]
  }
};

function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1;
  
  for (const [season, config] of Object.entries(seasonConfigs)) {
    if (config.months.includes(month)) {
      return season as Season;
    }
  }
  return 'summer'; // Default
}

function getSeasonalCategories(season: Season) {
  const config = seasonConfigs[season];
  
  return categories.filter(category => {
    const titleLower = category.title.toLowerCase();
    const descLower = category.description.toLowerCase();
    
    return config.categoryKeywords.some(keyword => 
      titleLower.includes(keyword) || descLower.includes(keyword)
    );
  }).slice(0, 6);
}

export function SeasonalRecommendations() {
  const currentSeason = getCurrentSeason();
  const config = seasonConfigs[currentSeason];
  const seasonalCategories = getSeasonalCategories(currentSeason);
  const SeasonIcon = config.icon;

  if (seasonalCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <SeasonIcon className={`h-5 w-5 ${config.color}`} />
              <span className={`text-sm font-semibold uppercase tracking-wide ${config.color}`}>
                {config.name} Season
              </span>
            </div>
            <h2 className="text-3xl font-bold">Seasonal Services</h2>
            <p className="text-muted-foreground mt-1">
              Popular services for this time of year in Saskatchewan
            </p>
          </div>
          <Link to="/categories">
            <Button variant="outline" size="sm" className="gap-2">
              All Categories
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Card className={`bg-gradient-to-br ${config.bgGradient} border-0 mb-6`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Pro tip:</span> Book {config.name.toLowerCase()} services early to secure the best taskers and avoid the rush!
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {seasonalCategories.map((category, idx) => (
            <Link key={idx} to={`/browse?category=${encodeURIComponent(category.title)}`}>
              <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-border hover:border-primary/30 h-full">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                          {category.title}
                        </h3>
                        <Badge variant="secondary" className={`${config.color} bg-transparent border shrink-0`}>
                          <SeasonIcon className="h-3 w-3 mr-1" />
                          {config.name}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
