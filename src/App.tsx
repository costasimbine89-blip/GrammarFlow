/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Trophy, 
  Zap, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  BarChart3, 
  BrainCircuit,
  Settings,
  User,
  ArrowLeft,
  Loader2,
  Twitter,
  Facebook,
  Share2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Markdown from 'react-markdown';

import { Level, Question, QuizSession, UserStats, QuizMode } from './types';
import { STATIC_QUESTIONS } from './constants';
import { explainGrammar, generateQuickQuiz } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [view, setView] = useState<'home' | 'quiz' | 'results' | 'stats' | 'settings' | 'profile'>('home');
  const [level, setLevel] = useState<Level>('Beginner');
  const [preferredLevel, setPreferredLevel] = useState<Level>('Beginner');
  const [aiQuizEnabled, setAiQuizEnabled] = useState(true);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Timer for Blitz mode
  useEffect(() => {
    let timer: any;
    if (view === 'quiz' && session?.mode === 'Blitz' && timeLeft !== null && timeLeft > 0 && !selectedOption) {
      timer = setInterval(() => {
        setTimeLeft(prev => (prev !== null && prev > 0) ? prev - 1 : 0);
      }, 1000);
    } else if (timeLeft === 0 && view === 'quiz' && !selectedOption) {
      handleAnswer(''); // Auto-submit empty answer when time runs out
    }
    return () => clearInterval(timer);
  }, [view, session, timeLeft, selectedOption]);

  // Mock initial stats
  const [stats, setStats] = useState<UserStats>({
    totalQuizzes: 12,
    averageScore: 85,
    streak: 5,
    levelProgress: { Beginner: 100, Intermediate: 45, Advanced: 10, Expert: 0 },
    topicStrengths: {
      'Tenses': 90,
      'Conditionals': 70,
      'Passive Voice': 65,
      'Articles': 85,
      'Prepositions': 75
    },
    recentScores: [
      { date: 'Feb 24', score: 70 },
      { date: 'Feb 25', score: 80 },
      { date: 'Feb 26', score: 75 },
      { date: 'Feb 27', score: 90 },
      { date: 'Feb 28', score: 85 },
      { date: 'Mar 01', score: 95 },
    ],
    achievements: [
      { id: '1', name: 'First Step', icon: 'Zap', unlocked: true, date: '2026-02-10', description: 'Complete your first quiz' },
      { id: '2', name: 'Perfect 10', icon: 'CheckCircle2', unlocked: true, date: '2026-02-15', description: 'Get 100% accuracy' },
      { id: '3', name: 'Blitz Runner', icon: 'Zap', unlocked: false, description: 'Complete a Blitz mode challenge' },
      { id: '4', name: 'Grammar Guru', icon: 'Trophy', unlocked: true, date: '2026-02-20', description: 'Complete 10 quizzes' },
      { id: '5', name: 'Expert Explorer', icon: 'BookOpen', unlocked: false, description: 'Try an Expert level quiz' },
      { id: '6', name: 'Fast Fingers', icon: 'Zap', unlocked: false, description: '80%+ accuracy in Blitz mode' },
    ],
    completedLevels: ['Beginner']
  });

  const startQuiz = async (selectedLevel: Level, useAI: boolean = false, mode: QuizMode = 'Standard') => {
    setLevel(selectedLevel);
    setIsGenerating(true);
    
    let questions: Question[] = [];
    if (useAI) {
      const aiQuiz = await generateQuickQuiz(selectedLevel);
      if (aiQuiz && aiQuiz.questions) {
        questions = aiQuiz.questions;
      } else {
        questions = STATIC_QUESTIONS[selectedLevel];
      }
    } else {
      questions = STATIC_QUESTIONS[selectedLevel];
    }

    // Shuffle questions for Blitz mode
    if (mode === 'Blitz') {
      questions = [...questions].sort(() => Math.random() - 0.5).slice(0, 15);
      setTimeLeft(20); // 20 seconds per question for Blitz
    } else {
      setTimeLeft(null);
    }

    setSession({
      id: Math.random().toString(36).substr(2, 9),
      level: selectedLevel,
      mode,
      questions,
      currentQuestionIndex: 0,
      answers: {},
      score: 0,
      startTime: Date.now(),
      timeLeft: mode === 'Blitz' ? 60 : undefined,
    });
    setView('quiz');
    setIsGenerating(false);
  };

  const handleAnswer = async (option: string) => {
    if (!session || selectedOption) return;
    
    setSelectedOption(option);
    const currentQuestion = session.questions[session.currentQuestionIndex];
    const isCorrect = option === currentQuestion.correctAnswer;

    if (isCorrect) {
      setSession(prev => prev ? { ...prev, score: prev.score + 1 } : null);
    } else {
      setIsExplaining(true);
      const aiExplanation = await explainGrammar(
        currentQuestion.text,
        option,
        currentQuestion.correctAnswer,
        currentQuestion.topic
      );
      setExplanation(aiExplanation || null);
      setIsExplaining(false);
    }
  };

  const nextQuestion = () => {
    if (!session) return;
    
    if (session.currentQuestionIndex < session.questions.length - 1) {
      setSession(prev => prev ? { ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 } : null);
      setSelectedOption(null);
      setExplanation(null);
      if (session.mode === 'Blitz') setTimeLeft(20);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    if (!session) return;
    
    const finalScore = Math.round((session.score / session.questions.length) * 100);
    const isPerfect = session.score === session.questions.length;
    const isBlitz = session.mode === 'Blitz';
    const isExpert = session.level === 'Expert';

    setStats(prev => {
      const newTotalQuizzes = prev.totalQuizzes + 1;
      const newCompletedLevels = prev.completedLevels.includes(session.level) 
        ? prev.completedLevels 
        : [...prev.completedLevels, session.level];

      const updatedAchievements = prev.achievements.map(achievement => {
        if (achievement.unlocked) return achievement;

        let shouldUnlock = false;
        if (achievement.id === '1' && newTotalQuizzes >= 1) shouldUnlock = true;
        if (achievement.id === '2' && isPerfect) shouldUnlock = true;
        if (achievement.id === '3' && isBlitz) shouldUnlock = true;
        if (achievement.id === '4' && newTotalQuizzes >= 10) shouldUnlock = true;
        if (achievement.id === '5' && isExpert) shouldUnlock = true;
        if (achievement.id === '6' && isBlitz && finalScore >= 80) shouldUnlock = true;

        if (shouldUnlock) {
          return { ...achievement, unlocked: true, date: new Date().toISOString().split('T')[0] };
        }
        return achievement;
      });

      return {
        ...prev,
        totalQuizzes: newTotalQuizzes,
        completedLevels: newCompletedLevels,
        achievements: updatedAchievements,
        recentScores: [...prev.recentScores.slice(-5), { 
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }), 
          score: finalScore 
        }]
      };
    });
    setView('results');
  };

  const shareOnTwitter = () => {
    if (!session) return;
    const score = Math.round((session.score / session.questions.length) * 100);
    const text = `I just scored ${score}% on Express Grammar AI! 🚀 Can you beat my score? #EnglishLearning #GrammarFlow`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareOnFacebook = () => {
    if (!session) return;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const getPlayerTitle = () => {
    if (stats.totalQuizzes > 50) return 'Grammar Legend';
    if (stats.totalQuizzes > 20) return 'Elite Grammarian';
    if (stats.totalQuizzes > 10) return 'Grammar Pro';
    return 'Grammar Novice';
  };

  const getPlayerRank = () => {
    const baseRank = 5000;
    const reduction = stats.totalQuizzes * 50 + stats.averageScore * 10;
    return Math.max(1, baseRank - reduction);
  };

  const radarData = useMemo(() => {
    return Object.entries(stats.topicStrengths).map(([subject, value]) => ({
      subject,
      A: value,
      fullMark: 100,
    }));
  }, [stats.topicStrengths]);

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-2xl relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight">GrammarFlow</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">AI Powered Learning</p>
          </div>
        </div>
        <button 
          onClick={() => setView('stats')}
          className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <BarChart3 size={18} />
        </button>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <section>
                <h2 className="text-3xl font-serif font-bold leading-tight mb-2">
                  Express <br />
                  <span className="text-indigo-600 italic">English.</span>
                </h2>
                <p className="text-slate-500 text-sm">Bite-sized grammar challenges to master English in minutes.</p>
              </section>

              <section className="p-5 bg-linear-to-br from-indigo-500 to-violet-600 rounded-3xl text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">Daily Goal</h3>
                      <p className="text-xs text-indigo-100">3/5 Quizzes completed</p>
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-white/20 flex items-center justify-center text-[10px] font-bold">
                      60%
                    </div>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '60%' }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                </div>
              </section>

              {/* Quick Action Cards */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => startQuiz(preferredLevel, aiQuizEnabled, 'Blitz')}
                  className="p-5 bg-indigo-600 rounded-3xl text-white text-left relative overflow-hidden group shadow-lg shadow-indigo-200"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:scale-125 transition-transform">
                    <Zap size={48} fill="currentColor" />
                  </div>
                  <Zap size={24} className="mb-3" fill="currentColor" />
                  <h3 className="font-bold text-lg">Blitz</h3>
                  <p className="text-[10px] text-indigo-100 font-medium uppercase tracking-wider">60s Challenge</p>
                </button>
                <button 
                  onClick={() => startQuiz(preferredLevel, aiQuizEnabled, 'Standard')}
                  className="p-5 bg-slate-900 rounded-3xl text-white text-left relative overflow-hidden group shadow-lg shadow-slate-200"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:scale-125 transition-transform">
                    <BookOpen size={48} fill="currentColor" />
                  </div>
                  <BookOpen size={24} className="mb-3" />
                  <h3 className="font-bold text-lg">Practice</h3>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Focused Study</p>
                </button>
              </div>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Learning Path</h3>
                  <button onClick={() => setView('settings')} className="text-[10px] font-bold text-indigo-600 uppercase">Change Level</button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {(['Beginner', 'Intermediate', 'Advanced', 'Expert'] as Level[]).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => startQuiz(lvl)}
                      className={cn(
                        "group relative p-4 bg-white border border-slate-100 rounded-2xl text-left transition-all duration-300",
                        preferredLevel === lvl && "border-indigo-200 bg-indigo-50/30"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "w-2 h-2 rounded-full",
                            lvl === 'Beginner' ? "bg-emerald-400" :
                            lvl === 'Intermediate' ? "bg-amber-400" :
                            lvl === 'Advanced' ? "bg-rose-400" :
                            "bg-violet-400"
                          )} />
                          <h3 className="font-bold text-slate-800 text-sm">{lvl}</h3>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{stats.levelProgress[lvl]}%</span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.levelProgress[lvl]}%` }}
                          className={cn(
                            "h-full rounded-full",
                            lvl === 'Beginner' ? "bg-emerald-400" :
                            lvl === 'Intermediate' ? "bg-amber-400" :
                            lvl === 'Advanced' ? "bg-rose-400" :
                            "bg-violet-400"
                          )}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {view === 'quiz' && session && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('home')}
                  className="p-2 -ml-2 text-slate-400 hover:text-slate-600"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {session.mode === 'Blitz' ? 'Time Left' : 'Question'}
                  </span>
                  <p className={cn(
                    "font-mono font-bold",
                    session.mode === 'Blitz' && timeLeft !== null && timeLeft < 10 ? "text-rose-500 animate-pulse" : "text-slate-800"
                  )}>
                    {session.mode === 'Blitz' ? `${timeLeft}s` : `${session.currentQuestionIndex + 1} / ${session.questions.length}`}
                  </p>
                </div>
                <div className="w-10" />
              </div>

              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((session.currentQuestionIndex + 1) / session.questions.length) * 100}%` }}
                  transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                  className="h-full bg-indigo-600 rounded-full shadow-[0_0_12px_rgba(79,70,229,0.4)] relative"
                >
                  <motion.div 
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 bg-white/20"
                  />
                </motion.div>
              </div>

              <div className="py-8">
                {session.mode === 'Blitz' && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        (timeLeft || 0) < 5 ? "text-rose-500 animate-pulse" : "text-slate-400"
                      )}>
                        {(timeLeft || 0) < 5 ? "Hurry Up!" : "Time Remaining"}
                      </span>
                      <span className={cn(
                        "font-mono font-bold text-xs",
                        (timeLeft || 0) < 5 ? "text-rose-500" : "text-slate-600"
                      )}>
                        {timeLeft}s
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: '100%' }}
                        animate={{ width: `${((timeLeft || 0) / 20) * 100}%` }}
                        transition={{ duration: 0.3, ease: "linear" }}
                        className={cn(
                          "h-full rounded-full transition-colors duration-300",
                          (timeLeft || 0) < 5 ? "bg-rose-500" : "bg-amber-400"
                        )}
                      />
                    </div>
                  </div>
                )}
                
                {selectedOption === '' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg flex items-center gap-2"
                  >
                    <Zap size={14} />
                    Time's Up! You missed this one.
                  </motion.div>
                )}

                <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2 block">
                  {session.questions[session.currentQuestionIndex].topic}
                </span>
                <h2 className="text-2xl font-serif font-bold leading-snug text-slate-800">
                  {session.questions[session.currentQuestionIndex].text.split('___').map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span className="inline-block min-w-[60px] border-b-2 border-indigo-200 mx-1 text-indigo-600">
                          {selectedOption || ''}
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </h2>
              </div>

              <div className="space-y-3">
                {session.questions[session.currentQuestionIndex].options.map((option) => {
                  const isSelected = selectedOption === option;
                  const isCorrect = option === session.questions[session.currentQuestionIndex].correctAnswer;
                  const showResult = selectedOption !== null;

                  return (
                    <button
                      key={option}
                      disabled={showResult}
                      onClick={() => handleAnswer(option)}
                      className={cn(
                        "w-full p-4 rounded-xl border text-left font-medium transition-all flex items-center justify-between group",
                        !showResult && "border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30",
                        showResult && isCorrect && "border-emerald-200 bg-emerald-50 text-emerald-700",
                        showResult && isSelected && !isCorrect && "border-rose-200 bg-rose-50 text-rose-700",
                        showResult && !isSelected && !isCorrect && "border-slate-50 opacity-50"
                      )}
                    >
                      <span>{option}</span>
                      {showResult && isCorrect && <CheckCircle2 size={18} className="text-emerald-500" />}
                      {showResult && isSelected && !isCorrect && <XCircle size={18} className="text-rose-500" />}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {explanation && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2"
                  >
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                      <BrainCircuit size={14} />
                      AI Explanation
                    </div>
                    <div className="text-sm text-slate-600 leading-relaxed italic">
                      <Markdown>{explanation}</Markdown>
                    </div>
                  </motion.div>
                )}
                {isExplaining && (
                  <div className="flex items-center justify-center py-4 gap-2 text-indigo-400 text-sm italic">
                    <Loader2 size={16} className="animate-spin" />
                    AI is thinking...
                  </div>
                )}
              </AnimatePresence>

              {selectedOption && (
                <button
                  onClick={nextQuestion}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  {session.currentQuestionIndex < session.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  <ChevronRight size={18} />
                </button>
              )}
            </motion.div>
          )}

          {view === 'results' && session && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8 py-10"
            >
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full border-8 border-slate-50 flex items-center justify-center">
                  <span className="text-4xl font-serif font-bold text-slate-800">
                    {Math.round((session.score / session.questions.length) * 100)}%
                  </span>
                </div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="absolute -bottom-2 -right-2 w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-white shadow-lg"
                >
                  <Trophy size={24} />
                </motion.div>
              </div>

              <div>
                <h2 className="text-2xl font-serif font-bold text-slate-800">
                  {session.mode === 'Blitz' ? 'Blitz Complete!' : 'Great effort!'}
                </h2>
                <p className="text-slate-500 mt-2">
                  You got {session.score} out of {session.questions.length} questions correct.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accuracy</span>
                  <p className="text-xl font-bold text-slate-800">{Math.round((session.score / session.questions.length) * 100)}%</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time Taken</span>
                  <p className="text-xl font-bold text-slate-800">
                    {Math.floor((Date.now() - session.startTime) / 1000)}s
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Share your score</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={shareOnTwitter}
                    className="w-12 h-12 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center shadow-lg shadow-blue-100 hover:scale-110 transition-transform"
                  >
                    <Twitter size={20} fill="currentColor" />
                  </button>
                  <button 
                    onClick={shareOnFacebook}
                    className="w-12 h-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-lg shadow-blue-100 hover:scale-110 transition-transform"
                  >
                    <Facebook size={20} fill="currentColor" />
                  </button>
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Express Grammar AI',
                          text: `I just scored ${Math.round((session.score / session.questions.length) * 100)}% on Express Grammar AI!`,
                          url: window.location.href,
                        });
                      }
                    }}
                    className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-lg shadow-slate-200 hover:scale-110 transition-transform"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => startQuiz(session.level)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} />
                  Try Again
                </button>
                <button
                  onClick={() => setView('home')}
                  className="w-full py-4 border border-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                >
                  Back to Home
                </button>
              </div>
            </motion.div>
          )}

          {view === 'stats' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('home')}
                  className="p-2 -ml-2 text-slate-400 hover:text-slate-600"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="font-serif text-xl font-bold">Your Progress</h2>
                <div className="w-10" />
              </div>

              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Performance Trend</h3>
                <div className="h-48 w-full bg-slate-50 rounded-2xl p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.recentScores}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#4F46E5" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Topic Strengths</h3>
                <div className="h-64 w-full bg-slate-50 rounded-2xl flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#E2E8F0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748B' }} />
                      <Radar
                        name="Strength"
                        dataKey="A"
                        stroke="#4F46E5"
                        fill="#4F46E5"
                        fillOpacity={0.2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <div className="grid grid-cols-2 gap-4 pb-10">
                <div className="p-5 bg-indigo-600 rounded-2xl text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Total Quizzes</span>
                  <p className="text-3xl font-serif font-bold mt-1">{stats.totalQuizzes}</p>
                </div>
                <div className="p-5 bg-slate-900 rounded-2xl text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Avg. Score</span>
                  <p className="text-3xl font-serif font-bold mt-1">{stats.averageScore}%</p>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 pb-10"
            >
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('home')}
                  className="p-2 -ml-2 text-slate-400 hover:text-slate-600"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="font-serif text-xl font-bold">Player Profile</h2>
                <div className="w-10" />
              </div>
              
              {/* Profile Header Card */}
              <section className="relative p-6 bg-slate-900 rounded-3xl text-white overflow-hidden shadow-xl shadow-indigo-500/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="flex items-center gap-5 relative z-10">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-linear-to-tr from-indigo-500 to-violet-500 p-0.5">
                      <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center overflow-hidden">
                        <img 
                          src="https://picsum.photos/seed/costa/200/200" 
                          alt="Profile" 
                          className="w-full h-full object-cover opacity-90"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg border-2 border-slate-900">
                      <Zap size={14} fill="currentColor" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Costa Simbine</h3>
                    <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mt-1">{getPlayerTitle()}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md">
                        <Zap size={12} className="text-amber-400" fill="currentColor" />
                        <span className="text-[10px] font-bold">{stats.streak} Day Streak</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md">
                        <Trophy size={12} className="text-indigo-400" />
                        <span className="text-[10px] font-bold">Rank #{getPlayerRank().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Stats Bento Grid */}
              <section className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg shadow-indigo-200">
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Accuracy</span>
                  <p className="text-2xl font-serif font-bold text-slate-800 mt-1">{stats.averageScore}%</p>
                </div>
                <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg shadow-emerald-200">
                    <Zap size={20} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Quizzes</span>
                  <p className="text-2xl font-serif font-bold text-slate-800 mt-1">{stats.totalQuizzes}</p>
                </div>
                <button 
                  onClick={() => setView('stats')}
                  className="col-span-2 p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-slate-100 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <BarChart3 size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-800">Advanced Analytics</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Topic Strengths & Trends</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </button>
              </section>

              {/* Achievements Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Achievements</h3>
                  <span className="text-[10px] font-bold text-indigo-600">{stats.achievements.filter(a => a.unlocked).length}/{stats.achievements.length} Unlocked</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {stats.achievements.map((achievement) => {
                    const IconComponent = achievement.icon === 'Trophy' ? Trophy : 
                                        achievement.icon === 'Zap' ? Zap : 
                                        achievement.icon === 'CheckCircle2' ? CheckCircle2 : 
                                        BookOpen;
                    return (
                      <motion.div 
                        key={achievement.id} 
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        initial={achievement.unlocked ? { scale: 0.9, opacity: 0 } : {}}
                        animate={achievement.unlocked ? { scale: 1, opacity: 1 } : {}}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all relative group",
                          achievement.unlocked 
                            ? "bg-white border border-slate-100 shadow-sm hover:shadow-indigo-100 hover:border-indigo-100" 
                            : "bg-slate-50 border border-dashed border-slate-200 opacity-40 grayscale"
                        )}
                      >
                        {achievement.unlocked && (
                          <motion.div 
                            animate={{ 
                              opacity: [0.3, 0.6, 0.3],
                              scale: [1, 1.1, 1],
                            }}
                            transition={{ 
                              duration: 3, 
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="absolute inset-0 bg-linear-to-tr from-indigo-500/5 to-violet-500/5 rounded-2xl pointer-events-none"
                          />
                        )}
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center relative z-10",
                          achievement.unlocked ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-400"
                        )}>
                          <motion.div
                            animate={achievement.unlocked ? {
                              rotate: [0, -5, 5, -5, 0],
                            } : {}}
                            transition={{
                              duration: 5,
                              repeat: Infinity,
                              repeatDelay: 2
                            }}
                          >
                            <IconComponent size={20} />
                          </motion.div>
                          
                          {achievement.unlocked && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm"
                            />
                          )}
                        </div>
                        <span className="text-[8px] font-bold text-slate-500 text-center leading-tight relative z-10">{achievement.name}</span>
                        
                        {/* Tooltip-like description on hover */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-32 p-2 bg-slate-800 text-white text-[8px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center shadow-xl">
                          <p className="font-bold mb-1">{achievement.name}</p>
                          <p className="text-slate-300">{achievement.description}</p>
                          {achievement.unlocked && <p className="text-emerald-400 mt-1">Unlocked: {achievement.date}</p>}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>

              {/* Recent Activity */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Recent Activity</h3>
                  <button className="text-[10px] font-bold text-indigo-600 uppercase">View All</button>
                </div>
                <div className="space-y-3">
                  {stats.recentScores.slice().reverse().map((item, i) => (
                    <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:shadow-md transition-shadow group">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center font-serif font-bold text-lg shadow-sm",
                          item.score >= 80 ? "bg-emerald-50 text-emerald-600" : 
                          item.score >= 50 ? "bg-amber-50 text-amber-600" : 
                          "bg-rose-50 text-rose-600"
                        )}>
                          {item.score}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">Grammar Challenge</h4>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{item.date} • {item.score >= 80 ? 'Mastery' : 'Improving'}</p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {view === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('home')}
                  className="p-2 -ml-2 text-slate-400 hover:text-slate-600"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="font-serif text-xl font-bold">Settings</h2>
                <div className="w-10" />
              </div>

              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Preferred Level</h3>
                <div className="grid grid-cols-1 gap-3">
                  {(['Beginner', 'Intermediate', 'Advanced', 'Expert'] as Level[]).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setPreferredLevel(lvl)}
                      className={cn(
                        "w-full p-4 rounded-xl border text-left font-medium transition-all flex items-center justify-between",
                        preferredLevel === lvl 
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm" 
                          : "border-slate-100 hover:border-slate-200 text-slate-600"
                      )}
                    >
                      <span>{lvl}</span>
                      {preferredLevel === lvl && <CheckCircle2 size={18} className="text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">AI Features</h3>
                <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800">AI Quiz Generation</h4>
                    <p className="text-xs text-slate-500">Enable Gemini to create unique questions.</p>
                  </div>
                  <button 
                    onClick={() => setAiQuizEnabled(!aiQuizEnabled)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      aiQuizEnabled ? "bg-indigo-600" : "bg-slate-300"
                    )}
                  >
                    <motion.div 
                      animate={{ x: aiQuizEnabled ? 24 : 2 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Account</h3>
                <div className="p-4 border border-slate-100 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <User size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Costa Simbine</h4>
                    <p className="text-xs text-slate-500">CostaSimbine89@gmail.com</p>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      <nav className="p-4 bg-white border-t border-slate-100 flex items-center justify-around">
        <button 
          onClick={() => setView('home')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            view === 'home' ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <BookOpen size={20} />
          <span className="text-[10px] font-bold uppercase">Learn</span>
        </button>
        <button 
          onClick={() => setView('stats')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            view === 'stats' ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <BarChart3 size={20} />
          <span className="text-[10px] font-bold uppercase">Stats</span>
        </button>
        <button 
          onClick={() => setView('profile')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            view === 'profile' ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <User size={20} />
          <span className="text-[10px] font-bold uppercase">Profile</span>
        </button>
        <button 
          onClick={() => setView('settings')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            view === 'settings' ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <Settings size={20} />
          <span className="text-[10px] font-bold uppercase">Settings</span>
        </button>
      </nav>
    </div>
  );
}
