import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Dumbbell, ArrowDownUp, PersonStanding, CircleDot, Zap } from 'lucide-react';
import type { ExerciseType } from '@/lib/poseUtils';

interface WorkoutMode {
  id: ExerciseType;
  name: string;
  icon: React.ReactNode;
  description: string;
  target: number;
}

const WORKOUT_MODES: WorkoutMode[] = [
  {
    id: 'squats',
    name: 'Squats',
    icon: <ArrowDownUp className="w-6 h-6" />,
    description: 'Lower body strength',
    target: 20,
  },
  {
    id: 'pushups',
    name: 'Push-ups',
    icon: <Dumbbell className="w-6 h-6" />,
    description: 'Upper body & core',
    target: 15,
  },
  {
    id: 'lunges',
    name: 'Lunges',
    icon: <PersonStanding className="w-6 h-6" />,
    description: 'Leg stability',
    target: 20,
  },
  {
    id: 'planks',
    name: 'Plank',
    icon: <CircleDot className="w-6 h-6" />,
    description: 'Core endurance',
    target: 60, // seconds
  },
  {
    id: 'jumpingJacks',
    name: 'Jumping Jacks',
    icon: <Zap className="w-6 h-6" />,
    description: 'Full body cardio',
    target: 30,
  },
];

interface WorkoutModeSelectorProps {
  selectedMode: ExerciseType | null;
  onSelectMode: (mode: ExerciseType) => void;
}

export const WorkoutModeSelector = memo(({ selectedMode, onSelectMode }: WorkoutModeSelectorProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {WORKOUT_MODES.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onSelectMode(mode.id)}
          className={cn(
            "relative p-4 rounded-2xl border-2 transition-all duration-300 text-left group hover:scale-[1.02] active:scale-[0.98]",
            selectedMode === mode.id
              ? "border-primary bg-gradient-to-br from-primary/20 to-secondary/20 shadow-glow"
              : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors",
            selectedMode === mode.id
              ? "bg-gradient-primary text-white"
              : "bg-muted text-muted-foreground group-hover:text-primary"
          )}>
            {mode.icon}
          </div>
          <div className="font-semibold text-foreground">{mode.name}</div>
          <div className="text-xs text-muted-foreground mt-1">{mode.description}</div>
          <div className={cn(
            "absolute top-3 right-3 text-xs px-2 py-1 rounded-full",
            selectedMode === mode.id
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground"
          )}>
            {mode.id === 'planks' ? `${mode.target}s` : `${mode.target}x`}
          </div>
        </button>
      ))}
    </div>
  );
});

WorkoutModeSelector.displayName = 'WorkoutModeSelector';
