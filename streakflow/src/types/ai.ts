export type AIMessageRole = 'user' | 'assistant' | 'system';

export interface AIMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  timestamp: string; // ISO date string
}

export interface AISuggestion {
  id: string;
  type: 'goal' | 'breakdown' | 'focus' | 'motivation';
  title: string;
  content: string;
  goalId?: string;
  createdAt: string; // ISO date string
}

export interface AIChatContext {
  goals: Array<{ id: string; name: string; type: string }>;
  currentStreaks: Array<{ goalId: string; count: number }>;
  recentActivity: Array<{ goalId: string; date: string }>;
}

export interface AIPrompt {
  type: 'suggest_goal' | 'breakdown_goal' | 'suggest_focus' | 'motivate';
  context?: AIChatContext;
  input?: string;
}

