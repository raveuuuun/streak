export type FocusSessionStatus = 'idle' | 'active' | 'paused' | 'completed';

export interface FocusSession {
  id: string;
  goalId: string;
  userId: string;
  status: FocusSessionStatus;
  startTime: string; // ISO date string
  endTime?: string; // ISO date string
  duration: number; // Duration in seconds
  completed: boolean;
}

export interface FocusTimer {
  elapsed: number; // Elapsed time in seconds
  isRunning: boolean;
  isPaused: boolean;
}

export interface FocusSessionComplete {
  sessionId: string;
  goalId: string;
  duration: number;
  completed: boolean;
}

