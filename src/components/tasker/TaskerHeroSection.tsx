import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, Search, Sparkles, Shield, Star, Clock,
  ArrowRight, Zap
} from "lucide-react";
import { motion } from "framer-motion";

interface TaskerHeroSectionProps {
  stats: {
    totalTaskers: number;
    verifiedTaskers: number;
    averageRating: number;
    totalTasksCompleted: number;
  };
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onQuickFilter: (filter: string) => void;
}

export const TaskerHeroSection = ({
  stats,
  searchQuery,
  onSearchChange,
  onQuickFilter,
}: TaskerHeroSectionProps) => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Badge variant="secondary" className="px-4 py-2 text-sm bg-primary/10 border-primary/20">
              <Zap className="h-4 w-4 mr-2 text-primary" />
              TaskRabbit-Style Marketplace
            </Badge>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
          >
            Find Your Perfect{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Tasker
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Browse skilled professionals, compare rates, read reviews, and hire instantly
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
              <div className="relative flex items-center bg-background/80 backdrop-blur-sm border-2 border-border hover:border-primary/50 rounded-2xl p-2 transition-all shadow-lg">
                <Search className="h-5 w-5 text-muted-foreground ml-4" />
                <Input
                  placeholder="Search by skill, name, or service..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0 text-lg placeholder:text-muted-foreground/60"
                />
                <Button size="lg" className="rounded-xl gap-2 px-6">
                  Search
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Quick Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuickFilter("verified")}
              className="rounded-full gap-2 hover:bg-primary/10 hover:border-primary"
            >
              <Shield className="h-4 w-4 text-green-500" />
              Verified Only
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuickFilter("available")}
              className="rounded-full gap-2 hover:bg-primary/10 hover:border-primary"
            >
              <Clock className="h-4 w-4 text-blue-500" />
              Available Now
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuickFilter("topRated")}
              className="rounded-full gap-2 hover:bg-primary/10 hover:border-primary"
            >
              <Star className="h-4 w-4 text-yellow-500" />
              Top Rated
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto"
        >
          {[
            { icon: Users, value: stats.totalTaskers, label: "Active Taskers", color: "text-primary" },
            { icon: Shield, value: stats.verifiedTaskers, label: "Verified Pros", color: "text-green-500" },
            { icon: Star, value: stats.averageRating.toFixed(1), label: "Avg Rating", color: "text-yellow-500" },
            { icon: Sparkles, value: stats.totalTasksCompleted.toLocaleString(), label: "Tasks Done", color: "text-blue-500" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="group"
            >
              <div className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/30 rounded-2xl p-5 text-center transition-all hover:shadow-lg hover:-translate-y-1">
                <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color} group-hover:scale-110 transition-transform`} />
                <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
