import { PoseLandmark, POSE_LANDMARKS } from '@/hooks/usePoseDetection';

// Calculate angle between three points
export const calculateAngle = (
  a: PoseLandmark,
  b: PoseLandmark,
  c: PoseLandmark
): number => {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) {
    angle = 360 - angle;
  }
  return angle;
};

// Get distance between two landmarks
export const getDistance = (a: PoseLandmark, b: PoseLandmark): number => {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
};

// Exercise detection types
export type ExerciseType = 'squats' | 'pushups' | 'lunges' | 'planks' | 'jumpingJacks';

export interface ExerciseState {
  phase: 'up' | 'down' | 'neutral';
  repCount: number;
  formScore: number;
  feedback: string[];
  isCorrectForm: boolean;
}

// Detect squat phase and form
export const detectSquat = (
  landmarks: PoseLandmark[],
  prevPhase: 'up' | 'down' | 'neutral'
): { phase: 'up' | 'down' | 'neutral'; isRep: boolean; formScore: number; feedback: string[] } => {
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
  const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
  const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
  const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];
  
  // Calculate knee angles
  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
  const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
  
  // Calculate hip angle for back straightness
  const hipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
  
  const feedback: string[] = [];
  let formScore = 100;
  
  // Check form issues
  if (hipAngle < 70) {
    feedback.push("Keep your back straight!");
    formScore -= 20;
  }
  
  // Check knee valgus (knees caving in)
  const kneeDistance = getDistance(leftKnee, rightKnee);
  const ankleDistance = getDistance(leftAnkle, rightAnkle);
  if (kneeDistance < ankleDistance * 0.8) {
    feedback.push("Knees over toes!");
    formScore -= 15;
  }
  
  // Determine phase
  let phase: 'up' | 'down' | 'neutral' = 'neutral';
  let isRep = false;
  
  if (avgKneeAngle < 100) {
    phase = 'down';
  } else if (avgKneeAngle > 160) {
    phase = 'up';
    if (prevPhase === 'down') {
      isRep = true;
    }
  }
  
  return { phase, isRep, formScore: Math.max(0, formScore), feedback };
};

// Detect pushup phase and form
export const detectPushup = (
  landmarks: PoseLandmark[],
  prevPhase: 'up' | 'down' | 'neutral'
): { phase: 'up' | 'down' | 'neutral'; isRep: boolean; formScore: number; feedback: string[] } => {
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
  const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
  
  // Calculate elbow angle
  const elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  
  // Check body alignment (should be straight)
  const bodyAngle = calculateAngle(leftShoulder, leftHip, leftAnkle);
  
  const feedback: string[] = [];
  let formScore = 100;
  
  // Check if hips are sagging or too high
  if (bodyAngle < 150) {
    feedback.push("Keep hips in line!");
    formScore -= 20;
  }
  if (bodyAngle > 190) {
    feedback.push("Don't let hips sag!");
    formScore -= 25;
  }
  
  let phase: 'up' | 'down' | 'neutral' = 'neutral';
  let isRep = false;
  
  if (elbowAngle < 100) {
    phase = 'down';
  } else if (elbowAngle > 150) {
    phase = 'up';
    if (prevPhase === 'down') {
      isRep = true;
    }
  }
  
  return { phase, isRep, formScore: Math.max(0, formScore), feedback };
};

// Detect lunge phase and form
export const detectLunge = (
  landmarks: PoseLandmark[],
  prevPhase: 'up' | 'down' | 'neutral'
): { phase: 'up' | 'down' | 'neutral'; isRep: boolean; formScore: number; feedback: string[] } => {
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
  const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
  const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
  
  const frontKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  
  const feedback: string[] = [];
  let formScore = 100;
  
  // Check if front knee goes past toes
  if (leftKnee.x > leftAnkle.x + 0.05) {
    feedback.push("Front knee behind toes!");
    formScore -= 20;
  }
  
  let phase: 'up' | 'down' | 'neutral' = 'neutral';
  let isRep = false;
  
  if (frontKneeAngle < 110) {
    phase = 'down';
  } else if (frontKneeAngle > 160) {
    phase = 'up';
    if (prevPhase === 'down') {
      isRep = true;
    }
  }
  
  return { phase, isRep, formScore: Math.max(0, formScore), feedback };
};

// Detect plank form (no reps, just form check)
export const detectPlank = (
  landmarks: PoseLandmark[]
): { formScore: number; feedback: string[]; isHolding: boolean } => {
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
  
  const bodyAngle = calculateAngle(leftShoulder, leftHip, leftAnkle);
  
  const feedback: string[] = [];
  let formScore = 100;
  let isHolding = true;
  
  // Check body alignment
  if (bodyAngle < 160) {
    feedback.push("Hips too high!");
    formScore -= 20;
    isHolding = false;
  }
  if (bodyAngle > 190) {
    feedback.push("Don't let hips sag!");
    formScore -= 25;
    isHolding = false;
  }
  
  // Check if in plank position (horizontal)
  const shoulderY = leftShoulder.y;
  const hipY = leftHip.y;
  if (Math.abs(shoulderY - hipY) > 0.15) {
    isHolding = false;
  }
  
  if (feedback.length === 0 && isHolding) {
    feedback.push("Great form! Keep it up!");
  }
  
  return { formScore: Math.max(0, formScore), feedback, isHolding };
};

// Detect jumping jack phase
export const detectJumpingJack = (
  landmarks: PoseLandmark[],
  prevPhase: 'up' | 'down' | 'neutral'
): { phase: 'up' | 'down' | 'neutral'; isRep: boolean; formScore: number; feedback: string[] } => {
  const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
  const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
  const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
  const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
  const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
  const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];
  
  // Check arm position - arms are up when wrists/elbows are above shoulders
  // In normalized coordinates, lower y = higher on screen
  const leftArmUp = leftWrist.y < leftShoulder.y || leftElbow.y < leftShoulder.y;
  const rightArmUp = rightWrist.y < rightShoulder.y || rightElbow.y < rightShoulder.y;
  const armsUp = leftArmUp && rightArmUp;
  
  // Check leg spread - compare ankle distance to hip distance
  const legSpread = getDistance(leftAnkle, rightAnkle);
  const hipWidth = getDistance(leftHip, rightHip);
  const shoulderWidth = getDistance(leftShoulder, rightShoulder);
  
  // Legs apart when spread is greater than 1.2x hip width (more lenient)
  const legsApart = legSpread > hipWidth * 1.2;
  // Legs together when spread is less than 1.0x shoulder width
  const legsTogether = legSpread < shoulderWidth * 1.1;
  
  // Arms down when both wrists are below shoulders
  const armsDown = leftWrist.y > leftShoulder.y && rightWrist.y > rightShoulder.y;
  
  const feedback: string[] = [];
  let formScore = 100;
  
  // Provide real-time feedback
  if (armsUp && !legsApart) {
    feedback.push("Spread your legs wider!");
    formScore -= 10;
  } else if (legsApart && !armsUp) {
    feedback.push("Raise your arms higher!");
    formScore -= 10;
  } else if (armsUp && legsApart) {
    feedback.push("Great form! Keep going!");
  }
  
  let phase: 'up' | 'down' | 'neutral' = prevPhase;
  let isRep = false;
  
  // "Up" phase: arms raised AND legs spread
  if (armsUp && legsApart) {
    phase = 'up';
  } 
  // "Down" phase: arms down AND legs together
  else if (armsDown && legsTogether) {
    phase = 'down';
    // Count rep when transitioning from up to down
    if (prevPhase === 'up') {
      isRep = true;
      feedback.length = 0;
      feedback.push("Rep counted! Keep it up!");
    }
  }
  
  return { phase, isRep, formScore: Math.max(0, formScore), feedback };
};

// Estimate calories burned based on movement velocity
export const estimateCalories = (
  landmarks: PoseLandmark[],
  prevLandmarks: PoseLandmark[] | null,
  elapsedSeconds: number,
  weight: number = 70 // kg
): number => {
  if (!prevLandmarks || elapsedSeconds === 0) return 0;
  
  // Calculate average movement velocity
  let totalMovement = 0;
  for (let i = 0; i < Math.min(landmarks.length, prevLandmarks.length); i++) {
    totalMovement += getDistance(landmarks[i], prevLandmarks[i]);
  }
  
  const avgVelocity = totalMovement / landmarks.length;
  
  // Rough MET estimation based on movement intensity
  // Low intensity: 3 MET, Medium: 6 MET, High: 9 MET
  const met = avgVelocity < 0.01 ? 3 : avgVelocity < 0.03 ? 6 : 9;
  
  // Calories per minute = (MET * weight * 3.5) / 200
  const caloriesPerMinute = (met * weight * 3.5) / 200;
  
  return (caloriesPerMinute * elapsedSeconds) / 60;
};
