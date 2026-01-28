import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Target, 
  TrendingUp, 
  Trophy,
  Flame,
  Edit2,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

interface WeeklyEarningsGoalProps {
  currentWeekEarnings: number;
  weeklyGoal: number;
  onUpdateGoal: (newGoal: number) => void;
  streakDays: number;
  daysLeftInWeek: number;
}

export function WeeklyEarningsGoal({ 
  currentWeekEarnings, 
  weeklyGoal, 
  onUpdateGoal,
  streakDays,
  daysLeftInWeek
}: WeeklyEarningsGoalProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newGoal, setNewGoal] = useState(weeklyGoal.toString());
  
  const progress = Math.min((currentWeekEarnings / weeklyGoal) * 100, 100);
  const remaining = Math.max(weeklyGoal - currentWeekEarnings, 0);
  const dailyNeeded = daysLeftInWeek > 0 ? remaining / daysLeftInWeek : 0;
  const isGoalMet = currentWeekEarnings >= weeklyGoal;

  const handleSaveGoal = () => {
    const goal = parseFloat(newGoal);
    if (goal > 0) {
      onUpdateGoal(goal);
      setIsEditOpen(false);
    }
  };

  const getMotivationalMessage = () => {
    if (isGoalMet) return "🎉 Goal achieved! Amazing work!";
    if (progress >= 75) return "Almost there! Keep pushing!";
    if (progress >= 50) return "Halfway there! You've got this!";
    if (progress >= 25) return "Great start! Keep the momentum!";
    return "Let's crush this week's goal!";
  };

  return (
    <Card className="border-primary/20 overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  Weekly Goal
                  {isGoalMet && <Trophy className="h-4 w-4 text-amber-500" />}
                </CardTitle>
                <CardDescription>{getMotivationalMessage()}</CardDescription>
              </div>
            </div>
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Weekly Earnings Goal</DialogTitle>
                  <DialogDescription>
                    Set a realistic goal to stay motivated and track your progress
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      className="pl-7 text-lg"
                      placeholder="500"
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    {[250, 500, 750, 1000].map((amount) => (
                      <Button
                        key={amount}
                        variant={newGoal === amount.toString() ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewGoal(amount.toString())}
                        className="flex-1"
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveGoal}>Save Goal</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </div>

      <CardContent className="space-y-4 pt-4">
        {/* Progress Display */}
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold text-foreground">
              ${currentWeekEarnings.toFixed(0)}
            </span>
            <span className="text-lg text-muted-foreground">
              / ${weeklyGoal.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progress.toFixed(0)}% complete</span>
            <span>${remaining.toFixed(0)} to go</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-lg font-bold">{streakDays}</span>
            </div>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-lg font-bold">{daysLeftInWeek}</span>
            </div>
            <p className="text-xs text-muted-foreground">Days Left</p>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold">${dailyNeeded.toFixed(0)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Per Day</p>
          </div>
        </div>

        {/* Achievement Badge */}
        {isGoalMet && (
          <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                Goal Achieved!
              </p>
              <p className="text-xs text-green-600 dark:text-green-500">
                You've exceeded your weekly target
              </p>
            </div>
            <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
              +{((currentWeekEarnings / weeklyGoal - 1) * 100).toFixed(0)}%
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
