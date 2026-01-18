import { useState } from "react";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, Clock, Target, Trash2, Zap } from "lucide-react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import CircularMenu from "@/components/CircularMenu";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  category: string;
  xpReward: number;
  completed: boolean;
}

const categories = [
  { value: "study", label: "Study", color: "bg-secondary" },
  { value: "workout", label: "Workout", color: "bg-success" },
  { value: "health", label: "Health", color: "bg-accent" },
  { value: "work", label: "Work", color: "bg-primary" },
  { value: "personal", label: "Personal", color: "bg-warning" },
];

const Planning = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    time: "09:00",
    category: "personal",
    xpReward: 10,
  });

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Task title required",
        description: "Please enter a task title",
        variant: "destructive",
      });
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      date: selectedDate,
      time: newTask.time,
      category: newTask.category,
      xpReward: newTask.xpReward,
      completed: false,
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: "",
      description: "",
      time: "09:00",
      category: "personal",
      xpReward: 10,
    });

    toast({
      title: "Task added!",
      description: `"${task.title}" scheduled for ${format(selectedDate, "MMM dd")}`,
    });
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
    toast({
      title: "Task removed",
      description: "Task has been deleted",
    });
  };

  const tasksForSelectedDate = tasks.filter(
    (task) => format(task.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar onOpenAuthModal={() => {}} user={{ name: "User" }} />

      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Plan Your Day</h1>
              <p className="text-muted-foreground">Schedule tasks and earn XP</p>
            </div>
            <Badge className="bg-gradient-primary text-white px-4 py-2">
              <Zap className="w-4 h-4 mr-1" />
              {tasks.reduce((acc, t) => acc + t.xpReward, 0)} XP Planned
            </Badge>
          </div>

          {/* Date Picker */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "EEEE, MMMM dd, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          {/* Add Task Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-success" />
                Add New Task
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Task title..."
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <Textarea
                placeholder="Description (optional)..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                rows={2}
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Time
                  </label>
                  <Input
                    type="time"
                    value={newTask.time}
                    onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Target className="w-4 h-4" /> Category
                  </label>
                  <Select
                    value={newTask.category}
                    onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Zap className="w-4 h-4" /> XP Reward
                  </label>
                  <Select
                    value={newTask.xpReward.toString()}
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, xpReward: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 XP</SelectItem>
                      <SelectItem value="10">10 XP</SelectItem>
                      <SelectItem value="20">20 XP</SelectItem>
                      <SelectItem value="50">50 XP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    className="w-full bg-gradient-primary hover:opacity-90"
                    onClick={handleAddTask}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks for Selected Date */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Tasks for {format(selectedDate, "MMMM dd")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasksForSelectedDate.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No tasks scheduled for this date</p>
                  <p className="text-sm">Add tasks above to plan your day</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasksForSelectedDate
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((task) => {
                      const category = categories.find((c) => c.value === task.category);
                      return (
                        <div
                          key={task.id}
                          className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
                        >
                          <div className={cn("w-2 h-12 rounded-full", category?.color)} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{task.title}</span>
                              <Badge variant="secondary" className="text-xs">
                                {task.time}
                              </Badge>
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground truncate">
                                {task.description}
                              </p>
                            )}
                          </div>
                          <Badge className="bg-xp text-xp-foreground">
                            +{task.xpReward} XP
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CircularMenu />
      <BottomNav />
    </div>
  );
};

export default Planning;
