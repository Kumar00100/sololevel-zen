import { useState } from "react";
import { Check, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: string;
  title: string;
  time: string;
  category: string;
  xp: number;
  completed: boolean;
}

const initialTasks: Task[] = [
  { id: "1", title: "Morning Meditation", time: "06:00", category: "wellness", xp: 20, completed: false },
  { id: "2", title: "Exercise & Workout", time: "06:30", category: "fitness", xp: 50, completed: false },
  { id: "3", title: "Healthy Breakfast", time: "08:00", category: "health", xp: 15, completed: false },
  { id: "4", title: "Deep Work Session", time: "09:00", category: "work", xp: 40, completed: false },
  { id: "5", title: "Learning Time", time: "12:00", category: "learning", xp: 30, completed: false },
  { id: "6", title: "Lunch Break", time: "13:00", category: "health", xp: 10, completed: false },
  { id: "7", title: "Creative Project", time: "14:30", category: "creativity", xp: 35, completed: false },
  { id: "8", title: "Evening Walk", time: "18:00", category: "wellness", xp: 25, completed: false },
  { id: "9", title: "Dinner", time: "19:30", category: "health", xp: 10, completed: false },
  { id: "10", title: "Reading & Relaxation", time: "21:00", category: "wellness", xp: 20, completed: false },
];

const categoryColors: Record<string, string> = {
  wellness: "bg-success/20 text-success",
  fitness: "bg-destructive/20 text-destructive",
  health: "bg-secondary/20 text-secondary",
  work: "bg-primary/20 text-primary",
  learning: "bg-warning/20 text-warning",
  creativity: "bg-accent/20 text-accent",
};

const DailyTaskTimeline = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const toggleTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalXP = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.xp, 0);

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Progress</span>
          <Badge variant="secondary" className="font-semibold">
            {completedCount}/{tasks.length}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-xp">
          <Zap className="w-4 h-4" />
          <span className="font-bold">{totalXP} XP</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative space-y-1">
        {/* Vertical Line */}
        <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-border" />

        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={cn(
              "relative flex items-center gap-3 p-2 rounded-xl transition-all",
              "hover:bg-muted/50 cursor-pointer group",
              task.completed && "opacity-60"
            )}
            onClick={() => toggleTask(task.id)}
          >
            {/* Time Indicator */}
            <div
              className={cn(
                "relative z-10 w-12 h-12 rounded-full flex flex-col items-center justify-center text-xs font-medium",
                "border-2 transition-all",
                task.completed
                  ? "bg-success border-success text-white"
                  : "bg-card border-border group-hover:border-primary"
              )}
            >
              {task.completed ? (
                <Check className="w-5 h-5" />
              ) : (
                <>
                  <Clock className="w-3 h-3 mb-0.5 text-muted-foreground" />
                  <span>{task.time}</span>
                </>
              )}
            </div>

            {/* Task Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4
                  className={cn(
                    "font-medium text-sm truncate",
                    task.completed && "line-through"
                  )}
                >
                  {task.title}
                </h4>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full capitalize",
                    categoryColors[task.category] || "bg-muted text-muted-foreground"
                  )}
                >
                  {task.category}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                  <Zap className="w-3 h-3 text-xp" />
                  +{task.xp}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyTaskTimeline;
