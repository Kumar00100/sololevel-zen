import { useEffect, useRef, memo } from 'react';
import { PoseLandmark, POSE_LANDMARKS } from '@/hooks/usePoseDetection';

interface SkeletonOverlayProps {
  landmarks: PoseLandmark[] | null;
  width: number;
  height: number;
  isMirrored?: boolean;
  formFeedback?: { jointIndex: number; isCorrect: boolean }[];
}

// Define skeleton connections with colors
const SKELETON_CONNECTIONS: [number, number, string][] = [
  // Face
  [POSE_LANDMARKS.LEFT_EAR, POSE_LANDMARKS.LEFT_EYE, '#00ff88'],
  [POSE_LANDMARKS.LEFT_EYE, POSE_LANDMARKS.NOSE, '#00ff88'],
  [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.RIGHT_EYE, '#00ff88'],
  [POSE_LANDMARKS.RIGHT_EYE, POSE_LANDMARKS.RIGHT_EAR, '#00ff88'],
  
  // Torso
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER, '#00ffff'],
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP, '#00ffff'],
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP, '#00ffff'],
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP, '#00ffff'],
  
  // Left arm
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, '#ff00ff'],
  [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST, '#ff00ff'],
  [POSE_LANDMARKS.LEFT_WRIST, POSE_LANDMARKS.LEFT_PINKY, '#ff00ff'],
  [POSE_LANDMARKS.LEFT_WRIST, POSE_LANDMARKS.LEFT_INDEX, '#ff00ff'],
  [POSE_LANDMARKS.LEFT_WRIST, POSE_LANDMARKS.LEFT_THUMB, '#ff00ff'],
  
  // Right arm
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, '#ff00ff'],
  [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST, '#ff00ff'],
  [POSE_LANDMARKS.RIGHT_WRIST, POSE_LANDMARKS.RIGHT_PINKY, '#ff00ff'],
  [POSE_LANDMARKS.RIGHT_WRIST, POSE_LANDMARKS.RIGHT_INDEX, '#ff00ff'],
  [POSE_LANDMARKS.RIGHT_WRIST, POSE_LANDMARKS.RIGHT_THUMB, '#ff00ff'],
  
  // Left leg
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE, '#ffff00'],
  [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE, '#ffff00'],
  [POSE_LANDMARKS.LEFT_ANKLE, POSE_LANDMARKS.LEFT_HEEL, '#ffff00'],
  [POSE_LANDMARKS.LEFT_HEEL, POSE_LANDMARKS.LEFT_FOOT_INDEX, '#ffff00'],
  [POSE_LANDMARKS.LEFT_ANKLE, POSE_LANDMARKS.LEFT_FOOT_INDEX, '#ffff00'],
  
  // Right leg
  [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE, '#ffff00'],
  [POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE, '#ffff00'],
  [POSE_LANDMARKS.RIGHT_ANKLE, POSE_LANDMARKS.RIGHT_HEEL, '#ffff00'],
  [POSE_LANDMARKS.RIGHT_HEEL, POSE_LANDMARKS.RIGHT_FOOT_INDEX, '#ffff00'],
  [POSE_LANDMARKS.RIGHT_ANKLE, POSE_LANDMARKS.RIGHT_FOOT_INDEX, '#ffff00'],
];

// Key joints to highlight
const KEY_JOINTS = [
  POSE_LANDMARKS.NOSE,
  POSE_LANDMARKS.LEFT_SHOULDER,
  POSE_LANDMARKS.RIGHT_SHOULDER,
  POSE_LANDMARKS.LEFT_ELBOW,
  POSE_LANDMARKS.RIGHT_ELBOW,
  POSE_LANDMARKS.LEFT_WRIST,
  POSE_LANDMARKS.RIGHT_WRIST,
  POSE_LANDMARKS.LEFT_HIP,
  POSE_LANDMARKS.RIGHT_HIP,
  POSE_LANDMARKS.LEFT_KNEE,
  POSE_LANDMARKS.RIGHT_KNEE,
  POSE_LANDMARKS.LEFT_ANKLE,
  POSE_LANDMARKS.RIGHT_ANKLE,
];

export const SkeletonOverlay = memo(({ 
  landmarks, 
  width, 
  height, 
  isMirrored = true,
  formFeedback = []
}: SkeletonOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !landmarks) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Transform coordinates
    const transformX = (x: number) => {
      const tx = x * width;
      return isMirrored ? width - tx : tx;
    };
    const transformY = (y: number) => y * height;

    // Create form feedback map
    const feedbackMap = new Map(formFeedback.map(f => [f.jointIndex, f.isCorrect]));

    // Draw connections with glow effect
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    SKELETON_CONNECTIONS.forEach(([startIdx, endIdx, color]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];

      if (start && end && (start.visibility ?? 1) > 0.5 && (end.visibility ?? 1) > 0.5) {
        const startX = transformX(start.x);
        const startY = transformY(start.y);
        const endX = transformX(end.x);
        const endY = transformY(end.y);

        // Check if either joint has form issues
        const hasIssue = feedbackMap.get(startIdx) === false || feedbackMap.get(endIdx) === false;
        const lineColor = hasIssue ? '#ff4444' : color;

        // Outer glow
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 8;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Inner line
        ctx.lineWidth = 4;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    });

    // Draw key joints with glow
    KEY_JOINTS.forEach((jointIdx) => {
      const landmark = landmarks[jointIdx];
      if (landmark && (landmark.visibility ?? 1) > 0.5) {
        const x = transformX(landmark.x);
        const y = transformY(landmark.y);

        const isCorrect = feedbackMap.get(jointIdx) !== false;
        const color = isCorrect ? '#00ff88' : '#ff4444';

        // Outer glow
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.3;
        ctx.fill();

        // Inner circle
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 1;
        ctx.fill();

        // White center
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    });

  }, [landmarks, width, height, isMirrored, formFeedback]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
});

SkeletonOverlay.displayName = 'SkeletonOverlay';
