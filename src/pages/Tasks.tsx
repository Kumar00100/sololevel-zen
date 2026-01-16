import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  Trash2,
  Zap,
  Filter,
  ListTodo,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  category: string;
  xpReward: number;
  completed: boolean;
  createdAt: Date;
}

const categoryColors: Record<string, string> = {
  study: "bg-secondary",
  workout: "bg-success",
  health: "bg-accent",
  work: "bg-primary",
  personal: "bg-warning",
};

const initialTasks: Task[] = [
  { id: "1", title: "Complete React tutorial", category: "study", xpReward: 20, completed: false, createdAt: new Date() },
  { id: "2", title: "30 min cardio", category: "workout", xpReward: 15, completed: true, createdAt: new Date() },
  { id: "3", title: "Drink 8 glasses of water", category: "health", xpReward: 10, completed: false, createdAt: new Date() },
  { id: "4", title: "Review project docs", category: "work", xpReward: 25, completed: false, createdAt: new Date() },
  { id: "5", title: "Meditate 10 minutes", category: "health", xpReward: 10, completed: true, createdAt: new Date() },
];

const Tasks = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [filter, setFilter] = useState("all");

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      category: "personal",
      xpReward: 10,
      completed: false,
      createdAt: new Date(),
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle("");
    toast({
      title: "Task added!",
      description: `"${newTaskTitle}" added to your list`,
    });
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          const newCompleted = !task.completed;
          if (newCompleted) {
            toast({
              title: "Task completed! 🎉",
              description: `+${task.xpReward} XP earned`,
            });
          }
          return { ...task, completed: newCompleted };
        }
        return task;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
    toast({
      title: "Task deleted",
      description: "Task has been removed",
    });
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalXpEarned = tasks.filter((t) => t.completed).reduce((acc, t) => acc + t.xpReward, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar onOpenAuthModal={() => {}} user={{ name: "User" }} />

      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ListTodo className="w-6 h-6 text-primary" />
                All Tasks
              </h1>
              <p className="text-muted-foreground">
                {completedCount}/{tasks.length} completed
              </p>
            </div>
            <Badge className="bg-xp text-xp-foreground px-4 py-2">
              <Zap className="w-4 h-4 mr-1" />
              {totalXpEarned} XP Earned
            </Badge>
          </div>

          {/* Quick Add */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a quick task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddTask}
                  disabled={!newTaskTitle.trim()}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({tasks.length - completedCount})</TabsTrigger>
              <TabsTrigger value="completed">Done ({completedCount})</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Task List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                {filter === "all" ? "All Tasks" : filter === "active" ? "Active Tasks" : "Completed Tasks"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Circle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No tasks found</p>
                  <p className="text-sm">Add a task above to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg transition-all group",
                        task.completed ? "bg-success/10" : "bg-muted/50 hover:bg-muted"
                      )}
                    >
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="w-5 h-5"
                      />
                      <div
                        className={cn(
                          "w-2 h-8 rounded-full",
                          categoryColors[task.category] || "bg-muted"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <span
                          className={cn(
                            "font-medium",
                            task.completed && "line-through text-muted-foreground"
                          )}
                        >
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {task.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Today
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          task.completed && "bg-success/20 border-success text-success"
                        )}
                      >
                        {task.completed ? "✓" : "+"}{task.xpReward} XP
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Tasks;
