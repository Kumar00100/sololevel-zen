import { useRef, useState, useCallback, useEffect } from 'react';
import { Pose, Results, POSE_CONNECTIONS } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

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

export const usePoseDetection = (options: UsePoseDetectionOptions = {}) => {
  const {
    onResults,
    modelComplexity = 1,
    smoothLandmarks = true,
    minDetectionConfidence = 0.5,
    minTrackingConfidence = 0.5,
  } = options;

  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(0);
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  const initializePose = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const pose = new Pose({
        locateFile: (file) => {
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

      pose.onResults((results: Results) => {
        // Calculate FPS
        frameCountRef.current++;
        const now = performance.now();
        const elapsed = now - lastTimeRef.current;
        if (elapsed >= 1000) {
          setFps(Math.round((frameCountRef.current * 1000) / elapsed));
          frameCountRef.current = 0;
          lastTimeRef.current = now;
        }

        if (onResults) {
          onResults({
            landmarks: results.poseLandmarks || null,
            worldLandmarks: results.poseWorldLandmarks || null,
          });
        }
      });

      await pose.initialize();
      poseRef.current = pose;
      setIsReady(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to initialize pose detection:', err);
      setError('Failed to load AI model. Please refresh and try again.');
      setIsLoading(false);
    }
  }, [modelComplexity, smoothLandmarks, minDetectionConfidence, minTrackingConfidence, onResults]);

  const startCamera = useCallback(async (videoElement: HTMLVideoElement, facingMode: 'user' | 'environment' = 'user') => {
    if (!poseRef.current) {
      await initializePose();
    }

    if (!poseRef.current) return;

    try {
      const camera = new Camera(videoElement, {
        onFrame: async () => {
          if (poseRef.current) {
            await poseRef.current.send({ image: videoElement });
          }
        },
        facingMode,
        width: 1280,
        height: 720,
      });

      await camera.start();
      cameraRef.current = camera;
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
