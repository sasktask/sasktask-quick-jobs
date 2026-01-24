import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Compass,
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Users,
  Zap,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Filter,
  BarChart3,
  Layers,
  Route,
  Target,
  Building2,
  Coffee,
  ShoppingBag,
  Fuel,
  ParkingCircle,
  Hospital,
  Utensils,
  X,
  Search,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateDistance } from '@/lib/distance';

interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  pay_amount: number;
  category: string;
  latitude?: number;
  longitude?: number;
  estimated_duration?: number;
  priority?: string;
  created_at?: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface SavedLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'home' | 'work' | 'favorite';
}

interface MapExplorerPanelProps {
  tasks: Task[];
  userLocation?: UserLocation | null;
  onTaskSelect: (task: Task) => void;
  onLocationSelect?: (lat: number, lng: number, zoom?: number) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const POI_TYPES = [
  { id: 'coffee', label: 'Coffee', icon: Coffee },
  { id: 'restaurant', label: 'Food', icon: Utensils },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'gas', label: 'Gas', icon: Fuel },
  { id: 'parking', label: 'Parking', icon: ParkingCircle },
  { id: 'hospital', label: 'Hospital', icon: Hospital },
];

export function MapExplorerPanel({
  tasks,
  userLocation,
  onTaskSelect,
  onLocationSelect,
  isOpen,
  onOpenChange,
}: MapExplorerPanelProps) {
  const [activeTab, setActiveTab] = useState('nearby');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([
    { id: '1', name: 'Home', latitude: 52.1332, longitude: -106.6700, type: 'home' },
    { id: '2', name: 'Work', latitude: 52.1268, longitude: -106.6300, type: 'work' },
  ]);
  const [showPOIs, setShowPOIs] = useState<string[]>([]);

  // Calculate task analytics
  const analytics = useMemo(() => {
    const tasksWithLocation = tasks.filter(t => t.latitude && t.longitude);
    const urgentTasks = tasksWithLocation.filter(t => t.priority === 'urgent');
    const totalValue = tasksWithLocation.reduce((sum, t) => sum + t.pay_amount, 0);
    const avgPay = tasksWithLocation.length > 0 ? totalValue / tasksWithLocation.length : 0;
    
    // Category breakdown
    const categoryBreakdown = tasksWithLocation.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Top categories
    const topCategories = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    // Hourly distribution (mock data for now)
    const hourlyDistribution = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: Math.floor(Math.random() * 10) + 1,
    }));
    
    return {
      totalTasks: tasksWithLocation.length,
      urgentCount: urgentTasks.length,
      totalValue,
      avgPay,
      topCategories,
      hourlyDistribution,
      highPayTasks: tasksWithLocation.filter(t => t.pay_amount >= 100).length,
    };
  }, [tasks]);

  // Nearby tasks sorted by distance
  const nearbyTasks = useMemo(() => {
    if (!userLocation) return tasks.slice(0, 10);
    
    return tasks
      .filter(t => t.latitude && t.longitude)
      .map(task => ({
        ...task,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          task.latitude!,
          task.longitude!
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 15);
  }, [tasks, userLocation]);

  // High value tasks
  const highValueTasks = useMemo(() => {
    return [...tasks]
      .filter(t => t.latitude && t.longitude)
      .sort((a, b) => b.pay_amount - a.pay_amount)
      .slice(0, 10);
  }, [tasks]);

  // Filtered tasks by search
  const filteredTasks = useMemo(() => {
    if (!searchQuery) return nearbyTasks;
    const query = searchQuery.toLowerCase();
    return nearbyTasks.filter(
      t => t.title.toLowerCase().includes(query) || 
           t.location.toLowerCase().includes(query) ||
           t.category.toLowerCase().includes(query)
    );
  }, [nearbyTasks, searchQuery]);

  const togglePOI = (poiId: string) => {
    setShowPOIs(prev => 
      prev.includes(poiId) 
        ? prev.filter(id => id !== poiId)
        : [...prev, poiId]
    );
  };

  const toggleSaveLocation = (task: Task) => {
    if (!task.latitude || !task.longitude) return;
    
    const exists = savedLocations.find(
      loc => loc.latitude === task.latitude && loc.longitude === task.longitude
    );
    
    if (exists) {
      setSavedLocations(prev => prev.filter(loc => loc.id !== exists.id));
    } else {
      setSavedLocations(prev => [
        ...prev,
        {
          id: task.id,
          name: task.title.slice(0, 20),
          latitude: task.latitude!,
          longitude: task.longitude!,
          type: 'favorite',
        },
      ]);
    }
  };

  const isSaved = (task: Task) => {
    return savedLocations.some(
      loc => loc.latitude === task.latitude && loc.longitude === task.longitude
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[420px] p-0">
        <SheetHeader className="p-4 pb-2 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            Map Explorer
          </SheetTitle>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-[calc(100vh-80px)]">
          <TabsList className="grid grid-cols-4 mx-4 mt-2">
            <TabsTrigger value="nearby" className="gap-1 text-xs">
              <MapPin className="h-3 w-3" />
              Nearby
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1 text-xs">
              <BarChart3 className="h-3 w-3" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-1 text-xs">
              <Bookmark className="h-3 w-3" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="layers" className="gap-1 text-xs">
              <Layers className="h-3 w-3" />
              Layers
            </TabsTrigger>
          </TabsList>

          {/* Search */}
          <div className="px-4 pt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            {/* Nearby Tab */}
            <TabsContent value="nearby" className="mt-0 space-y-3">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Card className="p-2 text-center">
                  <p className="text-xl font-bold text-primary">{analytics.totalTasks}</p>
                  <p className="text-[10px] text-muted-foreground">Tasks</p>
                </Card>
                <Card className="p-2 text-center">
                  <p className="text-xl font-bold text-orange-500">{analytics.urgentCount}</p>
                  <p className="text-[10px] text-muted-foreground">Urgent</p>
                </Card>
                <Card className="p-2 text-center">
                  <p className="text-xl font-bold text-green-500">${Math.round(analytics.avgPay)}</p>
                  <p className="text-[10px] text-muted-foreground">Avg Pay</p>
                </Card>
              </div>

              {/* Task List */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Nearby Tasks
                  <Badge variant="secondary" className="ml-auto">{filteredTasks.length}</Badge>
                </h4>
                
                <AnimatePresence mode="popLayout">
                  {filteredTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Card 
                        className="p-3 cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                        onClick={() => onTaskSelect(task)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-sm truncate">{task.title}</h5>
                              {task.priority === 'urgent' && (
                                <Badge variant="destructive" className="h-5 text-[10px]">
                                  <Zap className="h-2 w-2 mr-0.5" />
                                  Urgent
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{task.location}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="default" className="h-5 text-[10px]">
                                <DollarSign className="h-2 w-2" />{task.pay_amount}
                              </Badge>
                              <Badge variant="outline" className="h-5 text-[10px]">{task.category}</Badge>
                              {'distance' in task && (
                                <span className="text-[10px] text-muted-foreground ml-auto">
                                  {(task.distance as number).toFixed(1)} km
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSaveLocation(task);
                              }}
                            >
                              {isSaved(task) ? (
                                <BookmarkCheck className="h-4 w-4 text-primary" />
                              ) : (
                                <Bookmark className="h-4 w-4" />
                              )}
                            </Button>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* High Value Section */}
              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Highest Paying
                </h4>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {highValueTasks.slice(0, 5).map((task) => (
                    <Card 
                      key={task.id}
                      className="p-2 min-w-[140px] shrink-0 cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => onTaskSelect(task)}
                    >
                      <p className="text-lg font-bold text-green-500">${task.pay_amount}</p>
                      <p className="text-xs truncate">{task.title}</p>
                      <Badge variant="secondary" className="text-[10px] mt-1">{task.category}</Badge>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-0 space-y-4">
              <Card className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Task Distribution
                </h4>
                <div className="space-y-2">
                  {analytics.topCategories.map(([category, count], index) => (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{category}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <Progress 
                        value={(count / analytics.totalTasks) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4 text-center">
                  <DollarSign className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <p className="text-2xl font-bold">${Math.round(analytics.totalValue)}</p>
                  <p className="text-xs text-muted-foreground">Total Value</p>
                </Card>
                <Card className="p-4 text-center">
                  <Star className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                  <p className="text-2xl font-bold">{analytics.highPayTasks}</p>
                  <p className="text-xs text-muted-foreground">Premium Tasks</p>
                </Card>
              </div>

              <Card className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Peak Hours
                </h4>
                <div className="flex items-end gap-1 h-20">
                  {analytics.hourlyDistribution.slice(6, 22).map((item) => (
                    <div 
                      key={item.hour}
                      className="flex-1 bg-primary/20 rounded-t hover:bg-primary/40 transition-colors"
                      style={{ height: `${(item.count / 10) * 100}%` }}
                      title={`${item.hour}:00 - ${item.count} tasks`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>6am</span>
                  <span>12pm</span>
                  <span>6pm</span>
                  <span>10pm</span>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  Task Density
                </h4>
                <p className="text-sm text-muted-foreground">
                  Average of <span className="font-bold text-foreground">{(analytics.totalTasks / 10).toFixed(1)}</span> tasks per km² in your area
                </p>
              </Card>
            </TabsContent>

            {/* Saved Locations Tab */}
            <TabsContent value="saved" className="mt-0 space-y-3">
              <div className="space-y-2">
                {savedLocations.map((location) => (
                  <Card 
                    key={location.id} 
                    className="p-3 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => onLocationSelect?.(location.latitude, location.longitude, 14)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        location.type === 'home' ? 'bg-blue-500/10' :
                        location.type === 'work' ? 'bg-green-500/10' : 'bg-primary/10'
                      }`}>
                        {location.type === 'home' ? (
                          <Building2 className="h-5 w-5 text-blue-500" />
                        ) : location.type === 'work' ? (
                          <Building2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Star className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{location.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Card>
                ))}
              </div>

              {savedLocations.length === 0 && (
                <div className="text-center py-8">
                  <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No saved locations yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click the bookmark icon on tasks to save them
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Layers Tab */}
            <TabsContent value="layers" className="mt-0 space-y-4">
              <Card className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Map Overlays
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span className="text-sm">3D Buildings</span>
                    </div>
                    <Badge variant="outline">Coming soon</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4" />
                      <span className="text-sm">Traffic Layer</span>
                    </div>
                    <Badge variant="outline">Coming soon</Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Points of Interest
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {POI_TYPES.map((poi) => (
                    <Button
                      key={poi.id}
                      variant={showPOIs.includes(poi.id) ? 'default' : 'outline'}
                      size="sm"
                      className="flex-col h-auto py-3 gap-1"
                      onClick={() => togglePOI(poi.id)}
                    >
                      <poi.icon className="h-4 w-4" />
                      <span className="text-[10px]">{poi.label}</span>
                    </Button>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Visibility
                </h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                    <Eye className="h-4 w-4" />
                    Show all markers
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                    <EyeOff className="h-4 w-4" />
                    Hide completed
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
