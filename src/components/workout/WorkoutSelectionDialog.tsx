import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Target, Flame, Clock, Trophy, Dumbbell, ArrowDownUp, PersonStanding, CircleDot, Zap } from 'lucide-react';
import type { ExerciseType } from '@/lib/poseUtils';
import { cn } from '@/lib/utils';

interface WorkoutInfo {
  id: ExerciseType;
  name: string;
  icon: React.ReactNode;
  description: string;
  defaultTarget: number;
  benefits: string[];
  instructions: string[];
  caloriesPerRep: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  muscleGroups: string[];
}

const WORKOUT_INFO: WorkoutInfo[] = [
  {
    id: 'squats',
    name: 'Squats',
    icon: <ArrowDownUp className="w-8 h-8" />,
    description: 'Build lower body strength and power',
    defaultTarget: 20,
    benefits: ['Strengthens legs & glutes', 'Improves core stability', 'Burns calories fast'],
    instructions: ['Stand with feet shoulder-width apart', 'Lower until thighs are parallel', 'Keep back straight, knees over toes'],
    caloriesPerRep: 0.32,
    difficulty: 'Medium',
    muscleGroups: ['Quadriceps', 'Glutes', 'Core'],
  },
  {
    id: 'pushups',
    name: 'Push-ups',
    icon: <Dumbbell className="w-8 h-8" />,
    description: 'Upper body and core strength builder',
    defaultTarget: 15,
    benefits: ['Builds chest & triceps', 'Strengthens core', 'No equipment needed'],
    instructions: ['Start in plank position', 'Lower chest to ground', 'Push back up with arms'],
    caloriesPerRep: 0.36,
    difficulty: 'Medium',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
  },
  {
    id: 'lunges',
    name: 'Lunges',
    icon: <PersonStanding className="w-8 h-8" />,
    description: 'Improve leg stability and balance',
    defaultTarget: 20,
    benefits: ['Improves balance', 'Strengthens each leg', 'Activates hip flexors'],
    instructions: ['Step forward with one leg', 'Lower until knee at 90°', 'Push back to start'],
    caloriesPerRep: 0.28,
    difficulty: 'Medium',
    muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
  },
  {
    id: 'planks',
    name: 'Plank Hold',
    icon: <CircleDot className="w-8 h-8" />,
    description: 'Ultimate core endurance challenge',
    defaultTarget: 60,
    benefits: ['Builds core endurance', 'Improves posture', 'Strengthens back'],
    instructions: ['Hold forearm plank position', 'Keep body in straight line', 'Engage core throughout'],
    caloriesPerRep: 0.05, // per second
    difficulty: 'Hard',
    muscleGroups: ['Core', 'Shoulders', 'Back'],
  },
  {
    id: 'jumpingJacks',
    name: 'Jumping Jacks',
    icon: <Zap className="w-8 h-8" />,
    description: 'Full body cardio and coordination',
    defaultTarget: 30,
    benefits: ['Elevates heart rate', 'Full body workout', 'Improves coordination'],
    instructions: ['Jump while spreading legs', 'Raise arms overhead', 'Return to start position'],
    caloriesPerRep: 0.2,
    difficulty: 'Easy',
    muscleGroups: ['Full Body', 'Cardio', 'Legs'],
  },
];

interface WorkoutSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedWorkout: ExerciseType | null;
  onStartWorkout: (exercise: ExerciseType, target: number) => void;
}

export const WorkoutSelectionDialog = ({
  open,
  onOpenChange,
  selectedWorkout,
  onStartWorkout,
}: WorkoutSelectionDialogProps) => {
  const workout = WORKOUT_INFO.find(w => w.id === selectedWorkout);
  const [target, setTarget] = useState(workout?.defaultTarget || 20);

  // Update target when workout changes
  if (workout && target !== workout.defaultTarget && !open) {
    setTarget(workout.defaultTarget);
  }

  if (!workout) return null;

  const isPlank = workout.id === 'planks';
  const estimatedCalories = Math.round(target * workout.caloriesPerRep);
  const estimatedTime = isPlank ? target : Math.round(target * 3); // ~3 seconds per rep

  const difficultyColor = {
    Easy: 'bg-success/20 text-success',
    Medium: 'bg-warning/20 text-warning',
    Hard: 'bg-destructive/20 text-destructive',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center text-white">
              {workout.icon}
            </div>
            <div>
              <span className="text-xl">{workout.name}</span>
              <DialogDescription className="text-left mt-1">
                {workout.description}
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className={cn("font-medium", difficultyColor[workout.difficulty])}>
              {workout.difficulty}
            </Badge>
            {workout.muscleGroups.map((muscle) => (
              <Badge key={muscle} variant="outline" className="bg-muted/50">
                {muscle}
              </Badge>
            ))}
          </div>

          {/* Benefits */}
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Benefits</h4>
            <ul className="space-y-1">
              {workout.benefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-success">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">How to perform</h4>
            <ol className="space-y-1">
              {workout.instructions.map((instruction, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="font-bold text-primary">{i + 1}.</span>
                  {instruction}
                </li>
              ))}
            </ol>
          </div>

          {/* Target Slider */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="font-semibold">Set Target</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                {target}{isPlank ? 's' : ''}
              </span>
            </div>
            <Slider
              value={[target]}
              onValueChange={([val]) => setTarget(val)}
              min={isPlank ? 10 : 5}
              max={isPlank ? 180 : 100}
              step={isPlank ? 5 : 5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{isPlank ? '10s' : '5 reps'}</span>
              <span>{isPlank ? '180s' : '100 reps'}</span>
            </div>
          </div>

          {/* Estimates */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-muted/30 rounded-xl">
              <Flame className="w-5 h-5 mx-auto text-warning mb-1" />
              <div className="text-lg font-bold">{estimatedCalories}</div>
              <div className="text-xs text-muted-foreground">calories</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-xl">
              <Clock className="w-5 h-5 mx-auto text-secondary mb-1" />
              <div className="text-lg font-bold">~{Math.ceil(estimatedTime / 60)}</div>
              <div className="text-xs text-muted-foreground">minutes</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-xl">
              <Trophy className="w-5 h-5 mx-auto text-xp mb-1" />
              <div className="text-lg font-bold">+{target * 2}</div>
              <div className="text-xs text-muted-foreground">XP</div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <Button
          size="lg"
          onClick={() => {
            onStartWorkout(workout.id, target);
            onOpenChange(false);
          }}
          className="w-full bg-gradient-primary shadow-glow text-white py-6 text-lg"
        >
          <Play className="w-6 h-6 mr-2" />
          Start {workout.name}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
