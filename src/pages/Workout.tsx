import { useState, useRef, useEffect } from "react";
import { Camera, Play, Pause, RotateCcw, Dumbbell, Zap, Timer, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import CircularMenu from "@/components/CircularMenu";
import BottomNav from "@/components/BottomNav";

type Exercise = {
  id: string;
  name: string;
  icon: string;
  count: number;
  target: number;
  xp: number;
};

const initialExercises: Exercise[] = [
  { id: "pushups", name: "Push-ups", icon: "💪", count: 0, target: 20, xp: 50 },
  { id: "jumps", name: "Jumping Jacks", icon: "🦘", count: 0, target: 30, xp: 40 },
  { id: "squats", name: "Squats", icon: "🏋️", count: 0, target: 25, xp: 45 },
  { id: "situps", name: "Sit-ups", icon: "🤸", count: 0, target: 20, xp: 40 },
  { id: "lunges", name: "Lunges", icon: "🦵", count: 0, target: 20, xp: 35 },
];

const Workout = () => {
  const [cameraActive, setCameraActive] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [timer, setTimer] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  // Simulated AI counting (in production, this would use pose detection)
  useEffect(() => {
    let countInterval: NodeJS.Timeout;
    if (isTracking && selectedExercise) {
      countInterval = setInterval(() => {
        setExercises(prev =>
          prev.map(ex =>
            ex.id === selectedExercise.id && ex.count < ex.target
              ? { ...ex, count: ex.count + 1 }
              : ex
          )
        );
      }, 1500 + Math.random() * 1000); // Simulate varied counting
    }
    return () => clearInterval(countInterval);
  }, [isTracking, selectedExercise]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setIsTracking(false);
  };

  const toggleTracking = () => {
    if (!selectedExercise) return;
    setIsTracking(!isTracking);
  };

  const resetExercise = () => {
    if (selectedExercise) {
      setExercises(prev =>
        prev.map(ex =>
          ex.id === selectedExercise.id ? { ...ex, count: 0 } : ex
        )
      );
    }
    setTimer(0);
    setIsTracking(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const totalXPEarned = exercises.reduce(
    (sum, ex) => sum + Math.floor((ex.count / ex.target) * ex.xp),
    0
  );

  const currentExercise = exercises.find(ex => ex.id === selectedExercise?.id);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Workout Monitor</h1>
            <p className="text-white/80 text-sm">AI-powered exercise tracking</p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-xl">
            <Trophy className="w-5 h-5 text-xp" />
            <span className="font-bold">{totalXPEarned} XP</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Camera Section */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-video bg-muted flex items-center justify-center">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay UI */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Timer */}
                    <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-xl flex items-center gap-2">
                      <Timer className="w-4 h-4 text-primary" />
                      <span className="font-mono font-bold">{formatTime(timer)}</span>
                    </div>

                    {/* Exercise Counter */}
                    {currentExercise && (
                      <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-4 py-3 rounded-xl text-center">
                        <div className="text-3xl font-bold text-primary">
                          {currentExercise.count}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          / {currentExercise.target}
                        </div>
                      </div>
                    )}

                    {/* Current Exercise */}
                    {currentExercise && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                        <span className="text-xl">{currentExercise.icon}</span>
                        <span className="font-medium">{currentExercise.name}</span>
                        {isTracking && (
                          <Badge className="bg-success text-white animate-pulse">
                            Tracking
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-muted-foreground/10 rounded-full flex items-center justify-center">
                    <Camera className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Camera not active</p>
                    <p className="text-sm text-muted-foreground">
                      Enable camera to start AI workout tracking
                    </p>
                  </div>
                  <Button onClick={startCamera} className="bg-gradient-primary">
                    <Camera className="w-4 h-4 mr-2" />
                    Enable Camera
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        {cameraActive && (
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={stopCamera}
              className="rounded-full"
            >
              <Camera className="w-5 h-5 mr-2" />
              Stop Camera
            </Button>
            <Button
              size="lg"
              onClick={toggleTracking}
              disabled={!selectedExercise}
              className={cn(
                "rounded-full",
                isTracking
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-gradient-primary"
              )}
            >
              {isTracking ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={resetExercise}
              className="rounded-full"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Exercise Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary" />
              Select Exercise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {exercises.map(exercise => {
              const progress = (exercise.count / exercise.target) * 100;
              const isSelected = selectedExercise?.id === exercise.id;
              const isComplete = exercise.count >= exercise.target;

              return (
                <button
                  key={exercise.id}
                  onClick={() => setSelectedExercise(exercise)}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 transition-all text-left",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{exercise.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{exercise.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {exercise.count}/{exercise.target}
                          </span>
                          {isComplete && (
                            <Badge className="bg-success">
                              <Zap className="w-3 h-3 mr-1" />
                              +{exercise.xp} XP
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-primary">
              {exercises.filter(ex => ex.count >= ex.target).length}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-secondary">
              {exercises.reduce((sum, ex) => sum + ex.count, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Reps</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-xp">{formatTime(timer)}</div>
            <div className="text-xs text-muted-foreground">Duration</div>
          </Card>
        </div>
      </div>

      <CircularMenu />
      <BottomNav />
    </div>
  );
};

export default Workout;
