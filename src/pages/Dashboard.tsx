import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Clock,
  Target,
  Zap,
  TrendingUp,
  Calendar,
  Award,
  Flame,
  Brain,
  Heart,
  Sparkles,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import CircularMenu from "@/components/CircularMenu";

// Mock data - in real app this would come from backend
const mockStats = {
  level: 12,
  xp: 2450,
  xpToNextLevel: 3000,
  streak: 7,
  totalTasksCompleted: 156,
  stats: {
    focus: 45,
    health: 38,
    creativity: 52,
  },
};

const mockTasks = {
  today: [
    { id: "1", title: "Morning meditation", completed: true, xp: 10, category: "health" },
    { id: "2", title: "Study React hooks", completed: true, xp: 20, category: "study" },
    { id: "3", title: "Workout session", completed: false, xp: 15, category: "workout" },
    { id: "4", title: "Read 30 minutes", completed: false, xp: 10, category: "personal" },
  ],
  week: {
    completed: 24,
    total: 35,
    xpEarned: 380,
  },
  month: {
    completed: 98,
    total: 120,
    xpEarned: 1560,
  },
};

const categoryColors: Record<string, string> = {
  study: "bg-secondary",
  workout: "bg-success",
  health: "bg-accent",
  work: "bg-primary",
  personal: "bg-warning",
};

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState("day");

  const completedToday = mockTasks.today.filter((t) => t.completed).length;
  const totalToday = mockTasks.today.length;
  const xpProgress = (mockStats.xp / mockStats.xpToNextLevel) * 100;

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar onOpenAuthModal={() => {}} user={{ name: "User" }} />

      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Level & XP Card */}
          <Card className="bg-gradient-card overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                    <span className="text-2xl font-bold text-white">{mockStats.level}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Level {mockStats.level}</h2>
                    <p className="text-muted-foreground">Keep leveling up!</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-warning" />
                  <span className="text-2xl font-bold">{mockStats.streak}</span>
                  <span className="text-sm text-muted-foreground">day streak</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-xp" />
                    {mockStats.xp} XP
                  </span>
                  <span className="text-muted-foreground">{mockStats.xpToNextLevel} XP</span>
                </div>
                <Progress value={xpProgress} className="h-3" />
                <p className="text-xs text-muted-foreground text-center">
                  {mockStats.xpToNextLevel - mockStats.xp} XP to next level
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Brain className="w-5 h-5 text-secondary" />
                </div>
                <div className="text-2xl font-bold">{mockStats.stats.focus}</div>
                <div className="text-xs text-muted-foreground">Focus</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-5 h-5 text-success" />
                </div>
                <div className="text-2xl font-bold">{mockStats.stats.health}</div>
                <div className="text-xs text-muted-foreground">Health</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <div className="text-2xl font-bold">{mockStats.stats.creativity}</div>
                <div className="text-xs text-muted-foreground">Creativity</div>
              </CardContent>
            </Card>
          </div>

          {/* Time Range Tabs */}
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="day">Today</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>

            <TabsContent value="day" className="space-y-4 mt-4">
              {/* Today's Progress */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Today's Tasks
                    </span>
                    <Badge className="bg-gradient-success text-white">
                      {completedToday}/{totalToday} Done
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockTasks.today.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        task.completed ? "bg-success/10" : "bg-muted/50"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          task.completed
                            ? "bg-success text-white"
                            : "border-2 border-muted-foreground"
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                          {task.title}
                        </span>
                      </div>
                      <div className={`w-2 h-6 rounded-full ${categoryColors[task.category]}`} />
                      <Badge variant="outline" className="text-xs">
                        +{task.xp} XP
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="week" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    This Week
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <div className="text-3xl font-bold text-primary">
                        {mockTasks.week.completed}
                      </div>
                      <div className="text-sm text-muted-foreground">Tasks Completed</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <div className="text-3xl font-bold text-xp">{mockTasks.week.xpEarned}</div>
                      <div className="text-sm text-muted-foreground">XP Earned</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {mockTasks.week.completed}/{mockTasks.week.total} tasks
                      </span>
                    </div>
                    <Progress
                      value={(mockTasks.week.completed / mockTasks.week.total) * 100}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="month" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">
                        {mockTasks.month.completed}
                      </div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-xp">{mockTasks.month.xpEarned}</div>
                      <div className="text-xs text-muted-foreground">XP Earned</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-success">
                        {Math.round((mockTasks.month.completed / mockTasks.month.total) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="year" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    This Year
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-gradient-primary rounded-lg text-center text-white">
                      <div className="text-4xl font-bold">{mockStats.totalTasksCompleted}</div>
                      <div className="text-sm opacity-80">Total Tasks Completed</div>
                    </div>
                    <div className="p-6 bg-gradient-success rounded-lg text-center text-white">
                      <div className="text-4xl font-bold">{mockStats.level}</div>
                      <div className="text-sm opacity-80">Levels Gained</div>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Annual Goal</span>
                      <span className="text-muted-foreground">500 tasks</span>
                    </div>
                    <Progress value={(mockStats.totalTasksCompleted / 500) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      {500 - mockStats.totalTasksCompleted} tasks to reach your annual goal
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CircularMenu />
      <BottomNav />
    </div>
  );
};

export default Dashboard;
