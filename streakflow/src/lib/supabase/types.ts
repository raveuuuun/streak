// Database types - these should match your Supabase schema
export interface Database {
  public: {
    Tables: {
      goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          type: 'daily' | 'weekly' | 'monthly';
          status: 'active' | 'completed' | 'archived';
          streak_count: number;
          last_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          type: 'daily' | 'weekly' | 'monthly';
          status?: 'active' | 'completed' | 'archived';
          streak_count?: number;
          last_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          type?: 'daily' | 'weekly' | 'monthly';
          status?: 'active' | 'completed' | 'archived';
          streak_count?: number;
          last_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      streaks: {
        Row: {
          goal_id: string;
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_completed_date: string | null;
          start_date: string;
          updated_at: string;
        };
        Insert: {
          goal_id: string;
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_completed_date?: string | null;
          start_date?: string;
          updated_at?: string;
        };
        Update: {
          goal_id?: string;
          user_id?: string;
          current_streak?: number;
          longest_streak?: number;
          last_completed_date?: string | null;
          start_date?: string;
          updated_at?: string;
        };
      };
      focus_sessions: {
        Row: {
          id: string;
          goal_id: string;
          user_id: string;
          status: 'idle' | 'active' | 'paused' | 'completed';
          start_time: string;
          end_time: string | null;
          duration: number;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          user_id: string;
          status?: 'idle' | 'active' | 'paused' | 'completed';
          start_time: string;
          end_time?: string | null;
          duration?: number;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          goal_id?: string;
          user_id?: string;
          status?: 'idle' | 'active' | 'paused' | 'completed';
          start_time?: string;
          end_time?: string | null;
          duration?: number;
          completed?: boolean;
          created_at?: string;
        };
      };
    };
  };
}

