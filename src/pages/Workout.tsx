import { useState, useRef, useEffect } from "react";
import { Camera, Play, Pause, RotateCcw, Dumbbell, Zap, Timer, Trophy, FlipHorizontal2, Maximize2, Minimize2 } from "lucide-react";
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
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [timer, setTimer] = useState(0);
  const [isMirrored, setIsMirrored] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const startCamera = async (facing: "user" | "environment" = facingMode) => {
    setCameraLoading(true);
    setCameraError(null);
    
    try {
      // Stop existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser or context");
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
          setCameraActive(true);
          setCameraLoading(false);
        };
        
        setFacingMode(facing);
      }
    } catch (error: any) {
      console.error("Error accessing camera:", error);
      setCameraLoading(false);
      
      if (error.name === "NotAllowedError") {
        setCameraError("Camera permission denied. Please allow camera access.");
      } else if (error.name === "NotFoundError") {
        setCameraError("No camera found on this device.");
      } else if (error.name === "NotReadableError") {
        setCameraError("Camera is already in use by another app.");
      } else {
        setCameraError("Camera access blocked in preview. Try opening in new tab or on your phone.");
      }
    }
  };

  const flipCamera = () => {
    const newFacing = facingMode === "user" ? "environment" : "user";
    startCamera(newFacing);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

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
        {/* Camera Mirror Section */}
        <Card className={cn(
          "overflow-hidden transition-all duration-300",
          isFullscreen && "fixed inset-0 z-50 rounded-none"
        )}>
          <CardContent className="p-0">
            <div 
              ref={containerRef}
              className={cn(
                "relative bg-black flex items-center justify-center",
                isFullscreen ? "h-screen" : "aspect-[3/4] sm:aspect-video"
              )}
            >
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={cn(
                      "w-full h-full object-cover",
                      isMirrored && "scale-x-[-1]"
                    )}
                  />
                  
                  {/* Mirror Frame Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Decorative corner frames */}
                    <div className="absolute top-2 left-2 w-12 h-12 border-l-2 border-t-2 border-white/40 rounded-tl-lg" />
                    <div className="absolute top-2 right-2 w-12 h-12 border-r-2 border-t-2 border-white/40 rounded-tr-lg" />
                    <div className="absolute bottom-2 left-2 w-12 h-12 border-l-2 border-b-2 border-white/40 rounded-bl-lg" />
                    <div className="absolute bottom-2 right-2 w-12 h-12 border-r-2 border-b-2 border-white/40 rounded-br-lg" />
                  </div>

                  {/* Top Controls Bar */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    {/* Timer */}
                    <div className="bg-black/60 backdrop-blur-sm px-3 py-2 rounded-xl flex items-center gap-2">
                      <Timer className="w-4 h-4 text-primary" />
                      <span className="font-mono font-bold text-white">{formatTime(timer)}</span>
                    </div>

                    {/* Camera Controls */}
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-10 h-10 bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 rounded-xl"
                        onClick={() => setIsMirrored(!isMirrored)}
                      >
                        <FlipHorizontal2 className="w-5 h-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-10 h-10 bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 rounded-xl"
                        onClick={flipCamera}
                      >
                        <Camera className="w-5 h-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-10 h-10 bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 rounded-xl"
                        onClick={toggleFullscreen}
                      >
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>

                  {/* Exercise Counter - Large Display */}
                  {currentExercise && (
                    <div className="absolute top-20 right-4 bg-black/60 backdrop-blur-sm px-5 py-4 rounded-2xl text-center">
                      <div className="text-5xl font-bold text-white">
                        {currentExercise.count}
                      </div>
                      <div className="text-sm text-white/60">
                        of {currentExercise.target}
                      </div>
                      <Progress 
                        value={(currentExercise.count / currentExercise.target) * 100} 
                        className="h-1.5 mt-2 bg-white/20"
                      />
                    </div>
                  )}

                  {/* Current Exercise Badge */}
                  {currentExercise && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-5 py-3 rounded-full flex items-center gap-3">
                      <span className="text-2xl">{currentExercise.icon}</span>
                      <span className="font-semibold text-white text-lg">{currentExercise.name}</span>
                      {isTracking && (
                        <span className="flex items-center gap-1 bg-success/80 text-white text-sm px-2 py-1 rounded-full">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          LIVE
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bottom Controls - In Fullscreen */}
                  {isFullscreen && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={stopCamera}
                        className="rounded-full bg-black/60 border-white/20 text-white hover:bg-black/80"
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Stop
                      </Button>
                      <Button
                        size="lg"
                        onClick={toggleTracking}
                        disabled={!selectedExercise}
                        className={cn(
                          "rounded-full w-16 h-16",
                          isTracking
                            ? "bg-destructive hover:bg-destructive/90"
                            : "bg-gradient-primary"
                        )}
                      >
                        {isTracking ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={resetExercise}
                        className="rounded-full bg-black/60 border-white/20 text-white hover:bg-black/80"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center space-y-4 p-8">
                  {cameraLoading ? (
                    <>
                      <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center animate-pulse">
                        <Camera className="w-12 h-12 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-lg">Starting Camera...</p>
                        <p className="text-sm text-white/60">
                          Please allow camera access when prompted
                        </p>
                      </div>
                    </>
                  ) : cameraError ? (
                    <>
                      <div className="w-24 h-24 mx-auto bg-destructive/20 rounded-full flex items-center justify-center">
                        <Camera className="w-12 h-12 text-destructive" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-lg">Camera Error</p>
                        <p className="text-sm text-white/60 max-w-xs mx-auto">
                          {cameraError}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button onClick={() => startCamera()} className="bg-gradient-primary shadow-glow">
                          <Camera className="w-4 h-4 mr-2" />
                          Try Again
                        </Button>
                        <a 
                          href={window.location.href} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary underline"
                        >
                          Open in new tab for camera access
                        </a>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                        <Camera className="w-12 h-12 text-white/60" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-lg">Mirror Mode</p>
                        <p className="text-sm text-white/60">
                          See yourself while working out
                        </p>
                      </div>
                      <Button onClick={() => startCamera()} className="bg-gradient-primary shadow-glow">
                        <Camera className="w-4 h-4 mr-2" />
                        Start Mirror
                      </Button>
                    </>
                  )}
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
