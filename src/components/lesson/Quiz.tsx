'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameStore } from '@/store/gameStore';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

interface QuizProps {
  questions: QuizQuestion[];
  xpPerQuestion?: number;
}

export function Quiz({ questions, xpPerQuestion = 5 }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { addXp } = useGameStore();

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correct;

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleCheck = () => {
    setShowResult(true);
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      addXp(xpPerQuestion);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
    }
  };

  if (isComplete) {
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    const totalXp = correctAnswers * xpPerQuestion;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="my-6"
      >
        <Card className="border-2 border-[var(--color-primary)] bg-[var(--color-surface)]">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">
              {percentage >= 80 ? '🎉' : percentage >= 50 ? '👍' : '💪'}
            </div>
            <h3 className="text-2xl font-bold text-[var(--color-text)] mb-2">
              Quiz Complete!
            </h3>
            <p className="text-[var(--color-text-muted)] mb-4">
              You got {correctAnswers} out of {questions.length} correct ({percentage}%)
            </p>
            <div className="text-lg font-bold text-[var(--color-accent)]">
              +{totalXp} XP earned!
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6"
    >
      <Card className="border-2 border-[var(--color-primary)] bg-[var(--color-surface)]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--color-text)]">
              <HelpCircle className="h-5 w-5 text-[var(--color-primary)]" />
              Quick Quiz!
            </div>
            <span className="text-sm text-[var(--color-text-muted)]">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-lg text-[var(--color-text)] font-medium">
            {question.question}
          </p>

          <div className="space-y-2">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={showResult}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  showResult
                    ? index === question.correct
                      ? 'bg-green-900/40 border-2 border-green-500'
                      : index === selectedAnswer
                      ? 'bg-red-900/40 border-2 border-red-500'
                      : 'bg-white/5 border-2 border-transparent'
                    : selectedAnswer === index
                    ? 'bg-[var(--color-primary)]/20 border-2 border-[var(--color-primary)]'
                    : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                }`}
                whileHover={!showResult ? { scale: 1.02 } : {}}
                whileTap={!showResult ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium text-[var(--color-text)]">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-[var(--color-text)]">{option}</span>
                  {showResult && index === question.correct && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
                  )}
                  {showResult &&
                    index === selectedAnswer &&
                    index !== question.correct && (
                      <XCircle className="h-5 w-5 text-red-500 ml-auto" />
                    )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Result explanation */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div
                  className={`p-3 rounded-lg ${
                    isCorrect
                      ? 'bg-green-900/20 border border-green-700'
                      : 'bg-red-900/20 border border-red-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span
                      className={`font-medium ${
                        isCorrect ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {isCorrect ? 'Correct!' : 'Not quite...'}
                    </span>
                    {isCorrect && (
                      <span className="text-[var(--color-accent)] ml-auto">
                        +{xpPerQuestion} XP
                      </span>
                    )}
                  </div>
                  {question.explanation && (
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {question.explanation}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-2">
            {!showResult ? (
              <Button
                onClick={handleCheck}
                disabled={selectedAnswer === null}
                className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)]"
              >
                Check Answer
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)]"
              >
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
