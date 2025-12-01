"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/quizzes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setQuiz(data);
      } else {
        toast.error("Failed to load quiz");
        router.push("/");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = () => {
    if (!selectedAnswer || !quiz) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(score + 1);
      toast.success("Correct Answer!");
    } else {
      toast.error("Incorrect Answer");
    }

    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (!quiz) return;
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setIsAnswered(false);
      setSelectedAnswer("");
    } else {
      setShowScore(true);
    }
  };

  const restartQuiz = () => {
    setScore(0);
    setCurrentQuestionIndex(0);
    setShowScore(false);
    setIsAnswered(false);
    setSelectedAnswer("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <h2 className="text-2xl font-bold mb-4">
          No questions available for this lecture.
        </h2>
        <Link href={`/admin/${id}`}>
          <Button variant="outline" className="border-cyan-600 text-cyan-400">
            Add Questions
          </Button>
        </Link>
        <Link href="/" className="mt-4 text-slate-400 hover:text-white">
          Back to Home
        </Link>
      </div>
    );
  }

  if (showScore) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-200">
          <CardHeader>
            <CardTitle className="text-3xl text-center text-cyan-400">
              Quiz Completed!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-6xl font-bold text-white">
              {score} / {quiz.questions.length}
            </div>
            <p className="text-slate-400">
              You scored {Math.round((score / quiz.questions.length) * 100)}%
            </p>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button
              onClick={restartQuiz}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Restart
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center p-4 pt-10">
      <div className="w-full max-w-2xl mb-6 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Link>
        <h2 className="text-xl font-bold text-cyan-400 truncate max-w-[200px] md:max-w-md">
          {quiz.title}
        </h2>
      </div>

      <Card className="w-full max-w-2xl bg-slate-900 border-slate-800 text-slate-200 shadow-xl shadow-cyan-900/10">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-cyan-500 uppercase tracking-wider">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
          </div>
          <CardTitle className="text-xl md:text-2xl leading-relaxed text-white">
            {currentQuestion.text}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={selectedAnswer}
            onValueChange={setSelectedAnswer}
            disabled={isAnswered}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => {
              let itemClass =
                "flex items-center space-x-3 p-4 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors";
              if (isAnswered) {
                if (option === currentQuestion.correctAnswer) {
                  itemClass =
                    "flex items-center space-x-3 p-4 rounded-lg border border-green-500/50 bg-green-950/30 cursor-default";
                } else if (
                  option === selectedAnswer &&
                  option !== currentQuestion.correctAnswer
                ) {
                  itemClass =
                    "flex items-center space-x-3 p-4 rounded-lg border border-red-500/50 bg-red-950/30 cursor-default";
                } else {
                  itemClass =
                    "flex items-center space-x-3 p-4 rounded-lg border border-slate-800 opacity-50 cursor-default";
                }
              } else if (selectedAnswer === option) {
                itemClass =
                  "flex items-center space-x-3 p-4 rounded-lg border border-cyan-500 bg-cyan-950/30 cursor-pointer";
              }

              return (
                <div
                  key={index}
                  className={itemClass}
                  onClick={() => !isAnswered && setSelectedAnswer(option)}
                >
                  <RadioGroupItem
                    value={option}
                    id={`option-${index}`}
                    className="border-slate-500 text-cyan-500"
                  />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-grow cursor-pointer text-base"
                  >
                    {option}
                  </Label>
                  {isAnswered && option === currentQuestion.correctAnswer && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {isAnswered &&
                    option === selectedAnswer &&
                    option !== currentQuestion.correctAnswer && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                </div>
              );
            })}
          </RadioGroup>

          {isAnswered && (
            <div className="mt-6 p-4 bg-slate-950/50 rounded-lg border border-slate-800 animate-in fade-in slide-in-from-top-2">
              <h4 className="font-semibold text-cyan-400 mb-1">Explanation:</h4>
              <p className="text-slate-300">{currentQuestion.explanation}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end pt-2">
          {!isAnswered ? (
            <Button
              onClick={handleAnswerSubmit}
              disabled={!selectedAnswer}
              className="bg-cyan-600 hover:bg-cyan-700 text-white w-full md:w-auto"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              className="bg-slate-100 hover:bg-white text-slate-900 w-full md:w-auto font-bold"
            >
              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <>
                  Next Question <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                "See Results"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
