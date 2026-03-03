export type Level = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type QuizMode = 'Standard' | 'Blitz';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  topic: string;
}

export interface QuizSession {
  id: string;
  level: Level;
  mode: QuizMode;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  score: number;
  startTime: number;
  endTime?: number;
  timeLeft?: number; // For Blitz mode
}

export interface UserStats {
  totalQuizzes: number;
  averageScore: number;
  streak: number;
  levelProgress: Record<Level, number>;
  topicStrengths: Record<string, number>;
  recentScores: { date: string; score: number }[];
  achievements: { id: string; name: string; icon: string; unlocked: boolean; date?: string; description: string }[];
  completedLevels: Level[];
}
