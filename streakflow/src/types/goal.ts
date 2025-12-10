export type GoalType = 'daily' | 'weekly' | 'monthly';

export type GoalStatus = 'active' | 'completed' | 'archived';

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: GoalType;
  status: GoalStatus;
  streakCount: number;
  lastCompletedAt?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CreateGoalInput {
  name: string;
  description?: string;
  type: GoalType;
}

export interface UpdateGoalInput {
  name?: string;
  description?: string;
  type?: GoalType;
  status?: GoalStatus;
}

