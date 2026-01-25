import { useRef, useCallback, useEffect } from 'react';

interface UseAudioCoachingOptions {
  enabled: boolean;
  voice?: string;
  rate?: number;
  pitch?: number;
}

export const useAudioCoaching = (options: UseAudioCoachingOptions) => {
  const { enabled, voice, rate = 1.1, pitch = 1.0 } = options;
  const lastFeedbackRef = useRef<string>('');
  const lastFeedbackTimeRef = useRef<number>(0);
  const lastRepCountRef = useRef<number>(0);
  const feedbackCooldownMs = 3000; // Don't repeat same feedback within 3 seconds
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  // Cancel any pending speech on unmount
  useEffect(() => {
    return () => {
      synth?.cancel();
    };
  }, [synth]);

  const speak = useCallback((text: string, priority: 'high' | 'low' = 'low') => {
    if (!enabled || !synth) return;

    // For high priority (rep counts), interrupt current speech
    if (priority === 'high') {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 0.9;

    // Try to find a good voice
    const voices = synth.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Samantha') || 
      v.name.includes('Google') || 
      v.name.includes('English') ||
      v.lang.startsWith('en')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    synth.speak(utterance);
  }, [enabled, synth, rate, pitch]);

  const announceRepCount = useCallback((count: number, exerciseName: string) => {
    if (!enabled || count === lastRepCountRef.current) return;
    
    lastRepCountRef.current = count;

    // Milestone announcements
    if (count === 1) {
      speak(`First ${exerciseName}! Keep going!`, 'high');
    } else if (count === 5) {
      speak(`5 reps! Great start!`, 'high');
    } else if (count === 10) {
      speak(`10! Halfway there!`, 'high');
    } else if (count === 15) {
      speak(`15! Almost done!`, 'high');
    } else if (count === 20) {
      speak(`20 reps! Excellent work!`, 'high');
    } else if (count % 10 === 0) {
      speak(`${count}! Amazing!`, 'high');
    } else if (count % 5 === 0) {
      speak(`${count}`, 'high');
    } else {
      // Just the number for regular reps
      speak(`${count}`, 'high');
    }
  }, [enabled, speak]);

  const announceFormCorrection = useCallback((feedback: string[]) => {
    if (!enabled || feedback.length === 0) return;

    const now = Date.now();
    const mainFeedback = feedback[0];

    // Skip if it's positive feedback or same feedback within cooldown
    if (mainFeedback.includes('Great') || mainFeedback.includes('Keep')) {
      return;
    }

    // Check cooldown for same feedback
    if (
      mainFeedback === lastFeedbackRef.current && 
      now - lastFeedbackTimeRef.current < feedbackCooldownMs
    ) {
      return;
    }

    lastFeedbackRef.current = mainFeedback;
    lastFeedbackTimeRef.current = now;
    speak(mainFeedback, 'low');
  }, [enabled, speak]);

  const announceWorkoutStart = useCallback((exerciseName: string, target: number) => {
    if (!enabled) return;
    synth?.cancel();
    speak(`Starting ${exerciseName}. Target: ${target}. Let's go!`, 'high');
  }, [enabled, speak, synth]);

  const announceWorkoutPause = useCallback(() => {
    if (!enabled) return;
    speak('Workout paused', 'high');
  }, [enabled, speak]);

  const announceWorkoutComplete = useCallback((repCount: number, exerciseName: string) => {
    if (!enabled) return;
    synth?.cancel();
    speak(`Congratulations! You completed ${repCount} ${exerciseName}! Great workout!`, 'high');
  }, [enabled, speak, synth]);

  const announcePlankTime = useCallback((seconds: number) => {
    if (!enabled) return;

    if (seconds === 10) {
      speak('10 seconds!', 'high');
    } else if (seconds === 30) {
      speak('30 seconds! Keep holding!', 'high');
    } else if (seconds === 60) {
      speak('One minute! Amazing!', 'high');
    } else if (seconds === 90) {
      speak('90 seconds! Incredible!', 'high');
    } else if (seconds === 120) {
      speak('Two minutes! You are a champion!', 'high');
    }
  }, [enabled, speak]);

  const reset = useCallback(() => {
    lastRepCountRef.current = 0;
    lastFeedbackRef.current = '';
    lastFeedbackTimeRef.current = 0;
    synth?.cancel();
  }, [synth]);

  return {
    speak,
    announceRepCount,
    announceFormCorrection,
    announceWorkoutStart,
    announceWorkoutPause,
    announceWorkoutComplete,
    announcePlankTime,
    reset,
  };
};
