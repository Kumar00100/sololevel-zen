import { useRef, useState, useCallback, useEffect } from 'react';

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseResults {
  landmarks: PoseLandmark[] | null;
  worldLandmarks: PoseLandmark[] | null;
}

export interface UsePoseDetectionOptions {
  onResults?: (results: PoseResults) => void;
  modelComplexity?: 0 | 1 | 2;
  smoothLandmarks?: boolean;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
}

// MediaPipe Pose landmark indices
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

// Pose connections for skeleton drawing
export const POSE_CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28],
  [27, 29], [29, 31], [28, 30], [30, 32],
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
];

// Declare global types for dynamically loaded libraries
declare global {
  interface Window {
    Pose: any;
    Camera: any;
  }
}

// Helper to load script dynamically
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
};

export const usePoseDetection = (options: UsePoseDetectionOptions = {}) => {
  const {
    onResults,
    modelComplexity = 1,
    smoothLandmarks = true,
    minDetectionConfidence = 0.5,
    minTrackingConfidence = 0.5,
  } = options;

  const poseRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(0);
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);
  const onResultsRef = useRef(onResults);

  // Keep onResults ref updated
  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  const initializePose = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load MediaPipe scripts dynamically
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');

      // Wait for libraries to be available
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!window.Pose) {
        throw new Error('MediaPipe Pose library failed to load');
      }

      const pose = new window.Pose({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        },
      });

      pose.setOptions({
        modelComplexity,
        smoothLandmarks,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence,
        minTrackingConfidence,
      });

      pose.onResults((results: any) => {
        // Calculate FPS
        frameCountRef.current++;
        const now = performance.now();
        const elapsed = now - lastTimeRef.current;
        if (elapsed >= 1000) {
          setFps(Math.round((frameCountRef.current * 1000) / elapsed));
          frameCountRef.current = 0;
          lastTimeRef.current = now;
        }

        if (onResultsRef.current) {
          onResultsRef.current({
            landmarks: results.poseLandmarks || null,
            worldLandmarks: results.poseWorldLandmarks || null,
          });
        }
      });

      await pose.initialize();
      poseRef.current = pose;
      setIsReady(true);
      setIsLoading(false);
      console.log('MediaPipe Pose initialized successfully');
    } catch (err) {
      console.error('Failed to initialize pose detection:', err);
      setError('Failed to load AI model. Please refresh and try again.');
      setIsLoading(false);
    }
  }, [modelComplexity, smoothLandmarks, minDetectionConfidence, minTrackingConfidence]);

  const startCamera = useCallback(async (videoElement: HTMLVideoElement, facingMode: 'user' | 'environment' = 'user') => {
    if (!poseRef.current) {
      await initializePose();
    }

    if (!poseRef.current) {
      console.error('Pose model not ready');
      return;
    }

    try {
      // Ensure camera utils is loaded
      if (!window.Camera) {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (!window.Camera) {
        throw new Error('Camera utils failed to load');
      }

      const camera = new window.Camera(videoElement, {
        onFrame: async () => {
          if (poseRef.current && videoElement.readyState >= 2) {
            await poseRef.current.send({ image: videoElement });
          }
        },
        facingMode,
        width: 1280,
        height: 720,
      });

      await camera.start();
      cameraRef.current = camera;
      console.log('Camera started with pose detection');
    } catch (err) {
      console.error('Failed to start camera:', err);
      setError('Failed to access camera. Please allow camera permissions.');
    }
  }, [initializePose]);

  const stopCamera = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    stopCamera();
    if (poseRef.current) {
      poseRef.current.close();
      poseRef.current = null;
    }
    setIsReady(false);
  }, [stopCamera]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    initializePose,
    startCamera,
    stopCamera,
    cleanup,
    isLoading,
    isReady,
    error,
    fps,
    poseConnections: POSE_CONNECTIONS,
  };
};
