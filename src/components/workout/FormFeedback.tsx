import { memo, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, Flame } from 'lucide-react';

interface FormFeedbackProps {
  formScore: number;
  feedback: string[];
  repCount: number;
  exerciseName: string;
  calories: number;
}

export const FormFeedback = memo(({ 
  formScore, 
  feedback, 
  repCount, 
  exerciseName,
  calories 
}: FormFeedbackProps) => {
  const [showRepAnimation, setShowRepAnimation] = useState(false);
  const [lastRepCount, setLastRepCount] = useState(repCount);

  useEffect(() => {
    if (repCount > lastRepCount) {
      setShowRepAnimation(true);
      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      const timer = setTimeout(() => setShowRepAnimation(false), 500);
      setLastRepCount(repCount);
      return () => clearTimeout(timer);
    }
  }, [repCount, lastRepCount]);

  const getScoreColor = () => {
    if (formScore >= 80) return 'text-success';
    if (formScore >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBg = () => {
    if (formScore >= 80) return 'bg-success/20 border-success/40';
    if (formScore >= 60) return 'bg-warning/20 border-warning/40';
    return 'bg-destructive/20 border-destructive/40';
  };

  return (
    <div className="absolute top-4 left-4 space-y-3 max-w-xs">
      {/* Form Score */}
      <div className={cn(
        "backdrop-blur-md rounded-2xl px-4 py-3 border",
        getScoreBg()
      )}>
        <div className="flex items-center gap-3">
          {formScore >= 80 ? (
            <CheckCircle2 className="w-6 h-6 text-success" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-warning" />
          )}
          <div>
            <div className="text-xs text-white/70">Form Score</div>
            <div className={cn("text-2xl font-bold", getScoreColor())}>
              {formScore}%
            </div>
          </div>
        </div>
      </div>

      {/* Rep Counter with Animation */}
      <div className={cn(
        "backdrop-blur-md bg-black/60 rounded-2xl px-4 py-3 border border-white/20 transition-all duration-300",
        showRepAnimation && "scale-110 border-primary shadow-glow"
      )}>
        <div className="text-xs text-white/70">{exerciseName}</div>
        <div className="text-4xl font-bold text-white">
          {repCount}
          <span className="text-lg text-white/50 ml-1">reps</span>
        </div>
      </div>

      {/* Calories */}
      <div className="backdrop-blur-md bg-black/60 rounded-2xl px-4 py-3 border border-white/20">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-warning" />
          <div>
            <div className="text-xs text-white/70">Calories</div>
            <div className="text-lg font-bold text-warning">
              {Math.round(calories)} kcal
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {feedback.length > 0 && (
        <div className="space-y-2">
          {feedback.slice(0, 2).map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "backdrop-blur-md rounded-xl px-3 py-2 text-sm font-medium animate-fade-in",
                msg.includes("Great") || msg.includes("Keep") 
                  ? "bg-success/20 text-success border border-success/40"
                  : "bg-warning/20 text-warning border border-warning/40"
              )}
            >
              {msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

FormFeedback.displayName = 'FormFeedback';
