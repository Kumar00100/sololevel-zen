import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Play, Pause, RotateCcw, Timer, Trophy, FlipHorizontal2, Maximize2, Minimize2, Volume2, VolumeX, Grid3X3, Mic, MicOff, Loader2, Zap, ChevronLeft, Speech } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import CircularMenu from "@/components/CircularMenu";
import BottomNav from "@/components/BottomNav";
import { usePoseDetection, PoseLandmark, POSE_LANDMARKS } from "@/hooks/usePoseDetection";
import { useAudioCoaching } from "@/hooks/useAudioCoaching";
import { SkeletonOverlay } from "@/components/workout/SkeletonOverlay";
import { FormFeedback } from "@/components/workout/FormFeedback";
import { WorkoutModeSelector } from "@/components/workout/WorkoutModeSelector";
import { WorkoutSelectionDialog } from "@/components/workout/WorkoutSelectionDialog";
import { AlignmentGrid } from "@/components/workout/AlignmentGrid";
import { 
  ExerciseType, 
  detectSquat, 
  detectPushup, 
  detectLunge, 
  detectPlank, 
  detectJumpingJack,
  estimateCalories 
} from "@/lib/poseUtils";

// Motivational quotes
const QUOTES = [
  "Push yourself, because no one else is going to do it for you.",
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Don't limit your challenges. Challenge your limits.",
];

const Workout = () => {
  // Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isMirrored, setIsMirrored] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  
  // Workout states
  const [isTracking, setIsTracking] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(null);
  const [dialogExercise, setDialogExercise] = useState<ExerciseType | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [exerciseTarget, setExerciseTarget] = useState(20);
  const [timer, setTimer] = useState(0);
  const [repCount, setRepCount] = useState(0);
  const [formScore, setFormScore] = useState(100);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [calories, setCalories] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [exercisePhase, setExercisePhase] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [plankHoldTime, setPlankHoldTime] = useState(0);
  
  // Audio/Voice states
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [audioCoachingEnabled, setAudioCoachingEnabled] = useState(true);
  
  // Pose detection states
  const [landmarks, setLandmarks] = useState<PoseLandmark[] | null>(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });
  const prevLandmarksRef = useRef<PoseLandmark[] | null>(null);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);
  
  // Quote
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  
  // Pose detection hook
  const { 
    startCamera: startPoseCamera, 
    stopCamera: stopPoseCamera,
    isLoading: poseLoading, 
    isReady: poseReady, 
    error: poseError, 
    fps 
  } = usePoseDetection({
    onResults: useCallback((results) => {
      if (results.landmarks) {
        setLandmarks(results.landmarks);
      }
    }, []),
    modelComplexity: 1,
    smoothLandmarks: true,
  });

  // Audio coaching hook
  const audioCoaching = useAudioCoaching({
    enabled: audioCoachingEnabled,
    rate: 1.15,
    pitch: 1.0,
  });

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

  // Workout completion effect
  useEffect(() => {
    if (!isTracking || !selectedExercise) return;
    
    const isComplete = selectedExercise === 'planks' 
      ? plankHoldTime >= exerciseTarget 
      : repCount >= exerciseTarget;
    
    if (isComplete && exerciseTarget > 0) {
      audioCoaching.announceWorkoutComplete(
        selectedExercise === 'planks' ? plankHoldTime : repCount,
        getExerciseName()
      );
      // Optionally pause tracking on completion
      setIsTracking(false);
    }
  }, [repCount, plankHoldTime, exerciseTarget, selectedExercise, isTracking, audioCoaching]);

  // Exercise detection effect
  useEffect(() => {
    if (!isTracking || !landmarks || !selectedExercise) return;

    let result;
    
    switch (selectedExercise) {
      case 'squats':
        result = detectSquat(landmarks, exercisePhase);
        break;
      case 'pushups':
        result = detectPushup(landmarks, exercisePhase);
        break;
      case 'lunges':
        result = detectLunge(landmarks, exercisePhase);
        break;
      case 'planks':
        const plankResult = detectPlank(landmarks);
        setFormScore(plankResult.formScore);
        setFeedback(plankResult.feedback);
        if (plankResult.isHolding) {
          setPlankHoldTime(prev => {
            const newTime = prev + 1;
            // Announce plank milestones
            audioCoaching.announcePlankTime(newTime);
            return newTime;
          });
        }
        // Announce form corrections for plank
        audioCoaching.announceFormCorrection(plankResult.feedback);
        return;
      case 'jumpingJacks':
        result = detectJumpingJack(landmarks, exercisePhase);
        break;
      default:
        return;
    }

    if (result) {
      setExercisePhase(result.phase);
      setFormScore(result.formScore);
      setFeedback(result.feedback);
      
      // Announce form corrections
      audioCoaching.announceFormCorrection(result.feedback);
      
      if (result.isRep) {
        setRepCount(prev => {
          const newCount = prev + 1;
          // Play beep sound
          if (soundEnabled && audioRef.current) {
            playBeep(440, 100);
          }
          // Announce rep count with audio coaching
          audioCoaching.announceRepCount(newCount, getExerciseName());
          // Award XP based on form
          const xpEarned = Math.round(result.formScore / 20);
          setTotalXP(xp => xp + xpEarned);
          return newCount;
        });
      }
    }

    // Calculate calories
    const caloriesBurned = estimateCalories(landmarks, prevLandmarksRef.current, 1);
    setCalories(prev => prev + caloriesBurned);
    prevLandmarksRef.current = landmarks;
  }, [landmarks, isTracking, selectedExercise, exercisePhase, soundEnabled, audioCoaching]);

  // Initialize audio context
  useEffect(() => {
    audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioRef.current?.close();
    };
  }, []);

  // Play beep sound
  const playBeep = (frequency: number, duration: number) => {
    if (!audioRef.current) return;
    const oscillator = audioRef.current.createOscillator();
    const gainNode = audioRef.current.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioRef.current.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.1;
    oscillator.start();
    oscillator.stop(audioRef.current.currentTime + duration / 1000);
  };

  // Voice commands
  useEffect(() => {
    if (!voiceEnabled) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
      
      if (command.includes('start squats')) {
        setSelectedExercise('squats');
        setIsTracking(true);
      } else if (command.includes('start push')) {
        setSelectedExercise('pushups');
        setIsTracking(true);
      } else if (command.includes('stop')) {
        setIsTracking(false);
      } else if (command.includes('reset')) {
        resetWorkout();
      }
    };

    recognition.start();
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [voiceEnabled]);

  // Camera functions
  const startCamera = async (facing: "user" | "environment" = facingMode) => {
    setCameraLoading(true);
    setCameraError(null);
    
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported");
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
        const video = videoRef.current;
        video.srcObject = stream;
        streamRef.current = stream;

        // Mark active immediately so the <video> is visible; don't wait on metadata in some iframe contexts.
        setCameraActive(true);

        video.onloadedmetadata = () => {
          setVideoDimensions({ width: video.videoWidth || 1280, height: video.videoHeight || 720 });
        };

        try {
          await video.play();
        } catch (e) {
          // Autoplay can still be blocked in embedded previews; user gesture in a new tab usually resolves it.
          console.warn("video.play() failed:", e);
        }

        setCameraLoading(false);
        setFacingMode(facing);

        // Start pose detection on the video element
        startPoseCamera(video, facing);
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
        setCameraError("Camera access blocked in preview. Open in new tab for full experience.");
      }
    }
  };

  const stopCamera = () => {
    stopPoseCamera();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setIsTracking(false);
    setLandmarks(null);
  };

  const flipCamera = () => {
    const newFacing = facingMode === "user" ? "environment" : "user";
    stopCamera();
    setTimeout(() => startCamera(newFacing), 100);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleTracking = () => {
    if (!selectedExercise) return;
    const newTrackingState = !isTracking;
    setIsTracking(newTrackingState);
    
    if (!newTrackingState) {
      audioCoaching.announceWorkoutPause();
    }
  };

  const resetWorkout = () => {
    setRepCount(0);
    setPlankHoldTime(0);
    setTimer(0);
    setCalories(0);
    setFormScore(100);
    setFeedback([]);
    setExercisePhase('neutral');
    setIsTracking(false);
    prevLandmarksRef.current = null;
    audioCoaching.reset();
  };

  const openWorkoutDialog = (exercise: ExerciseType) => {
    setDialogExercise(exercise);
    setShowDialog(true);
  };

  const startWorkout = (exercise: ExerciseType, target: number) => {
    setSelectedExercise(exercise);
    setExerciseTarget(target);
    resetWorkout();
    // Announce workout start after a short delay
    const exerciseNames: Record<ExerciseType, string> = {
      squats: 'Squats',
      pushups: 'Push-ups',
      lunges: 'Lunges',
      planks: 'Plank',
      jumpingJacks: 'Jumping Jacks',
    };
    setTimeout(() => {
      audioCoaching.announceWorkoutStart(exerciseNames[exercise], target);
    }, 500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getExerciseName = () => {
    const names: Record<ExerciseType, string> = {
      squats: 'Squats',
      pushups: 'Push-ups',
      lunges: 'Lunges',
      planks: 'Plank',
      jumpingJacks: 'Jumping Jacks',
    };
    return selectedExercise ? names[selectedExercise] : 'Select Exercise';
  };

  const getProgress = () => {
    if (selectedExercise === 'planks') {
      return Math.min((plankHoldTime / exerciseTarget) * 100, 100);
    }
    return Math.min((repCount / exerciseTarget) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - hidden in fullscreen */}
      {!isFullscreen && (
        <div className="bg-gradient-primary text-white p-6 rounded-b-3xl">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-3xl">🪞</span> MirrorFit
              </h1>
              <p className="text-white/80 text-sm">AI-Powered Workout Camera</p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-xl">
              <Trophy className="w-5 h-5 text-xp" />
              <span className="font-bold">{totalXP} XP</span>
            </div>
          </div>
          <p className="text-xs text-white/60 italic text-center mt-4">"{quote}"</p>
        </div>
      )}

      <div className={cn("container mx-auto px-4 py-6 space-y-6", isFullscreen && "p-0")}>
        {/* Main Camera/Mirror View */}
        <Card className={cn(
          "overflow-hidden transition-all duration-300",
          isFullscreen && "fixed inset-0 z-50 rounded-none"
        )}>
          <CardContent className="p-0">
            <div 
              ref={containerRef}
              className={cn(
                "relative bg-gradient-to-br from-background via-background to-muted flex items-center justify-center overflow-hidden",
                isFullscreen ? "h-screen" : "aspect-[3/4] sm:aspect-video"
              )}
            >
              {/* Video element must stay mounted so startCamera can attach stream while loading */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  "w-full h-full object-cover",
                  isMirrored && "scale-x-[-1]",
                  cameraActive ? "opacity-100" : "opacity-0"
                )}
              />

              {cameraActive ? (
                <>
                  {/* Alignment Grid */}
                  {showGrid && <AlignmentGrid showGrid={true} showFloorLine={true} />}

                  {/* Skeleton Overlay */}
                  <SkeletonOverlay
                    landmarks={landmarks}
                    width={videoDimensions.width}
                    height={videoDimensions.height}
                    isMirrored={isMirrored}
                  />

                  {/* Top Controls Bar */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    {/* Timer */}
                    <div className="bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg border border-white/10">
                      <Timer className="w-4 h-4 text-primary" />
                      <span className="font-mono font-bold text-white text-lg">{formatTime(timer)}</span>
                    </div>

                    {/* FPS Counter */}
                    {poseReady && (
                      <div className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-xs text-white/70">
                        {fps} FPS
                      </div>
                    )}

                    {/* AI Status */}
                    <div
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2",
                        poseLoading
                          ? "bg-warning/20 text-warning"
                          : poseReady
                            ? "bg-success/20 text-success"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      {poseLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Loading AI...
                        </>
                      ) : poseReady ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                          AI Active
                        </>
                      ) : (
                        "AI Standby"
                      )}
                    </div>
                  </div>

                  {/* Camera Controls - Top Center */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
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
                      className={cn(
                        "w-10 h-10 backdrop-blur-sm rounded-xl",
                        showGrid ? "bg-primary/60 text-white" : "bg-black/60 text-white hover:bg-black/80"
                      )}
                      onClick={() => setShowGrid(!showGrid)}
                    >
                      <Grid3X3 className="w-5 h-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className={cn(
                        "w-10 h-10 backdrop-blur-sm rounded-xl",
                        soundEnabled ? "bg-primary/60 text-white" : "bg-black/60 text-white hover:bg-black/80"
                      )}
                      onClick={() => setSoundEnabled(!soundEnabled)}
                    >
                      {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className={cn(
                        "w-10 h-10 backdrop-blur-sm rounded-xl",
                        audioCoachingEnabled ? "bg-success/60 text-white" : "bg-black/60 text-white hover:bg-black/80"
                      )}
                      onClick={() => setAudioCoachingEnabled(!audioCoachingEnabled)}
                      title="Audio Coach"
                    >
                      <Speech className="w-5 h-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className={cn(
                        "w-10 h-10 backdrop-blur-sm rounded-xl",
                        voiceEnabled ? "bg-accent/60 text-white" : "bg-black/60 text-white hover:bg-black/80"
                      )}
                      onClick={() => setVoiceEnabled(!voiceEnabled)}
                    >
                      {voiceEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
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

                  {/* Form Feedback Panel - Left Side */}
                  {isTracking && selectedExercise && (
                    <FormFeedback
                      formScore={formScore}
                      feedback={feedback}
                      repCount={selectedExercise === "planks" ? plankHoldTime : repCount}
                      exerciseName={getExerciseName()}
                      calories={calories}
                    />
                  )}

                  {/* Progress Bar - Bottom */}
                  {selectedExercise && (
                    <div className="absolute bottom-24 left-4 right-4">
                      <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-semibold">{getExerciseName()}</span>
                          <span className="text-white/70 text-sm">
                            {selectedExercise === "planks"
                              ? `${plankHoldTime}s / ${exerciseTarget}s`
                              : `${repCount} / ${exerciseTarget}`}
                          </span>
                        </div>
                        <Progress value={getProgress()} className="h-3 bg-muted/40" />
                        {getProgress() >= 100 && (
                          <div className="mt-2 text-center animate-pulse">
                            <Badge className="bg-gradient-primary text-white">
                              <Zap className="w-4 h-4 mr-1" />
                              Target Complete! +{Math.round(exerciseTarget * 2)} XP
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Main Controls - Bottom Center */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={stopCamera}
                      className="rounded-full bg-black/60 border-white/20 text-white hover:bg-black/80"
                    >
                      <ChevronLeft className="w-5 h-5 mr-1" />
                      Exit
                    </Button>
                    <Button
                      size="lg"
                      onClick={toggleTracking}
                      disabled={!selectedExercise || poseLoading}
                      className={cn(
                        "rounded-full w-20 h-20 text-white shadow-lg",
                        isTracking
                          ? "bg-destructive hover:bg-destructive/90 animate-pulse"
                          : "bg-gradient-primary hover:opacity-90 shadow-glow"
                      )}
                    >
                      {isTracking ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={resetWorkout}
                      className="rounded-full bg-black/60 border-white/20 text-white hover:bg-black/80"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    {cameraLoading ? (
                      <>
                        <div className="w-28 h-28 mx-auto bg-gradient-primary/20 rounded-full flex items-center justify-center animate-pulse">
                          <Loader2 className="w-14 h-14 text-primary animate-spin" />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-xl">Initializing MirrorFit...</p>
                          <p className="text-sm text-white/60 mt-2">
                            Please allow camera access when prompted
                          </p>
                        </div>
                      </>
                    ) : cameraError ? (
                      <>
                        <div className="w-28 h-28 mx-auto bg-destructive/20 rounded-full flex items-center justify-center">
                          <Camera className="w-14 h-14 text-destructive" />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-xl">Camera Error</p>
                          <p className="text-sm text-white/60 max-w-xs mx-auto mt-2">{cameraError}</p>
                        </div>
                        <div className="flex flex-col gap-3 items-center">
                          <Button onClick={() => startCamera()} className="bg-gradient-primary shadow-glow">
                            <Camera className="w-4 h-4 mr-2" />
                            Try Again
                          </Button>
                          <a
                            href={window.location.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Open in new tab for full experience →
                          </a>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-32 h-32 mx-auto bg-gradient-primary/20 rounded-full flex items-center justify-center relative">
                          <div className="absolute inset-0 bg-gradient-primary/10 rounded-full animate-ping" />
                          <span className="text-6xl">🪞</span>
                        </div>
                        <div>
                          <p className="font-bold text-white text-2xl">MirrorFit</p>
                          <p className="text-sm text-white/60 mt-2">
                            AI-powered workout mirror with real-time pose detection
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto mt-4">
                          <Badge variant="outline" className="bg-white/10 text-white/80 border-white/20">
                            🦴 Skeleton Tracking
                          </Badge>
                          <Badge variant="outline" className="bg-white/10 text-white/80 border-white/20">
                            📊 Form Analysis
                          </Badge>
                          <Badge variant="outline" className="bg-white/10 text-white/80 border-white/20">
                            🔢 Rep Counting
                          </Badge>
                          <Badge variant="outline" className="bg-white/10 text-white/80 border-white/20">
                            🎯 Real-time Feedback
                          </Badge>
                        </div>
                        <Button
                          size="lg"
                          onClick={() => startCamera()}
                          className="bg-gradient-primary shadow-glow mt-4 px-8"
                        >
                          <Camera className="w-5 h-5 mr-2" />
                          Start MirrorFit
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Workout Mode Selection */}
        {!isFullscreen && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Select Workout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WorkoutModeSelector
                  selectedMode={selectedExercise}
                  onSelectMode={openWorkoutDialog}
                />
              </CardContent>
            </Card>

            {/* Stats Summary */}
            <div className="grid grid-cols-4 gap-3">
              <Card className="text-center p-3 bg-gradient-card">
                <div className="text-2xl font-bold text-primary">{repCount}</div>
                <div className="text-xs text-muted-foreground">Reps</div>
              </Card>
              <Card className="text-center p-3 bg-gradient-card">
                <div className="text-2xl font-bold text-secondary">{formatTime(timer)}</div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </Card>
              <Card className="text-center p-3 bg-gradient-card">
                <div className="text-2xl font-bold text-warning">{Math.round(calories)}</div>
                <div className="text-xs text-muted-foreground">Calories</div>
              </Card>
              <Card className="text-center p-3 bg-gradient-card">
                <div className="text-2xl font-bold text-xp">{totalXP}</div>
                <div className="text-xs text-muted-foreground">XP</div>
              </Card>
            </div>

            {/* Audio Coaching Help */}
            {audioCoachingEnabled && (
              <Card className="bg-success/10 border-success/30">
                <CardContent className="p-4">
                  <p className="text-sm text-success font-medium mb-2">🔊 Audio Coach Active</p>
                  <p className="text-xs text-muted-foreground">
                    Voice announcements for rep counts, form corrections, and workout milestones
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Voice Commands Help */}
            {voiceEnabled && (
              <Card className="bg-accent/10 border-accent/30">
                <CardContent className="p-4">
                  <p className="text-sm text-accent font-medium mb-2">🎤 Voice Commands Active</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">"Start squats"</Badge>
                    <Badge variant="outline" className="text-xs">"Start push-ups"</Badge>
                    <Badge variant="outline" className="text-xs">"Stop"</Badge>
                    <Badge variant="outline" className="text-xs">"Reset"</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Workout Selection Dialog */}
      <WorkoutSelectionDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        selectedWorkout={dialogExercise}
        onStartWorkout={startWorkout}
      />

      {!isFullscreen && (
        <>
          <div className="pb-24" />
          <CircularMenu />
          <BottomNav />
        </>
      )}
    </div>
  );
};

export default Workout;
