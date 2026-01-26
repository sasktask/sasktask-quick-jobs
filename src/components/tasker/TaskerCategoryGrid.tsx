import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categories } from "@/lib/categories";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";

interface TaskerCategoryGridProps {
  onCategorySelect: (category: string) => void;
  selectedCategory?: string;
}

export const TaskerCategoryGrid = ({ 
  onCategorySelect, 
  selectedCategory 
}: TaskerCategoryGridProps) => {
  const featuredCategories = categories.filter(c => c.featured).slice(0, 8);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Browse by Category</h2>
            <p className="text-sm text-muted-foreground">Find specialists in any field</p>
          </div>
        </div>
        <Badge variant="outline" className="hidden md:flex gap-1">
          {categories.length}+ Categories
        </Badge>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {/* All Categories Card */}
        <motion.div variants={item}>
          <Card
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden group ${
              selectedCategory === "all" || !selectedCategory
                ? "ring-2 ring-primary border-primary"
                : "hover:border-primary/50"
            }`}
            onClick={() => onCategorySelect("all")}
          >
            <CardContent className="p-0">
              <div className="relative h-32 bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative text-center text-white">
                  <div className="text-4xl mb-2">🌟</div>
                  <h3 className="font-bold">All Taskers</h3>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between bg-card">
                <span className="text-sm text-muted-foreground">Browse all</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Cards */}
        {featuredCategories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.title;
          
          return (
            <motion.div key={category.title} variants={item}>
              <Card
                className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden group ${
                  isSelected
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-primary/50"
                }`}
                onClick={() => onCategorySelect(category.title)}
              >
                <CardContent className="p-0">
                  <div 
                    className="relative h-32 flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ 
                        background: `linear-gradient(135deg, ${category.color}30, transparent)` 
                      }}
                    />
                    <div className="relative text-center">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Icon 
                          className="h-7 w-7" 
                          style={{ color: category.color }} 
                        />
                      </div>
                      <h3 className="font-semibold text-sm">{category.title}</h3>
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between bg-card">
                    <span className="text-xs text-muted-foreground">{category.description?.slice(0, 20)}...</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
