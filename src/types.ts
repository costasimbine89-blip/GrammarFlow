export type Level = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

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
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  score: number;
  startTime: number;
  endTime?: number;
}

export interface UserStats {
  totalQuizzes: number;
  averageScore: number;
  streak: number;
  levelProgress: Record<Level, number>;
  topicStrengths: Record<string, number>;
  recentScores: { date: string; score: number }[];
  achievements: { id: string; name: string; icon: string; unlocked: boolean; date?: string }[];
}
