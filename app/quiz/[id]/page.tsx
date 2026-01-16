"use client";

import { useState, useEffect, use, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  ArrowLeft,
  Timer,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

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
  timeLimit: number | null; // in minutes
  isActive: boolean;
}

interface UserDetails {
  name: string;
  email: string;
  rollNumber: string;
  faculty: string;
  year: string;
}

type QuizState = "loading" | "inactive" | "entry_form" | "active" | "completed";

export default function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // Quiz Data & State
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [quizState, setQuizState] = useState<QuizState>("loading");
  const [isAdmin, setIsAdmin] = useState(false);

  // User Details
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: "",
    email: "",
    rollNumber: "",
    faculty: "",
    year: "",
  });

  // Quiz Progress
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  // Timer & Cheating
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const [isCheated, setIsCheated] = useState(false);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsAdmin(isAuthenticated());
    fetchQuiz();
  }, [id]);

  // Cheating detection
  useEffect(() => {
    if (quizState !== "active") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User left the tab
        toast.warning("Warning: Return to the quiz immediately!");
        blurTimeoutRef.current = setTimeout(() => {
          setIsCheated(true);
          submitQuiz("timeout"); // Using 'timeout' or we can add a new type 'cheating'
          toast.error("Quiz submitted automatically due to inactivity.");
        }, 5000);
      } else {
        // User returned
        if (blurTimeoutRef.current) {
          clearTimeout(blurTimeoutRef.current);
          blurTimeoutRef.current = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, [quizState]);

  // Timer
  useEffect(() => {
    if (quizState === "active" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            submitQuiz("timeout");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizState]);

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/quizzes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setQuiz(data);
        if (!data.isActive && !isAuthenticated()) {
          setQuizState("inactive");
        } else {
          setQuizState("entry_form");
        }
      } else {
        toast.error("Failed to load quiz");
        router.push("/");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const startQuiz = () => {
    if (!isAdmin) {
      if (
        !userDetails.name ||
        !userDetails.rollNumber ||
        !userDetails.faculty ||
        !userDetails.year
      ) {
        toast.error("Please fill in all details");
        return;
      }
    }

    setQuizState("active");
    if (quiz?.timeLimit && !isAdmin) {
      setTimeLeft(quiz.timeLimit * 60);
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
      submitQuiz("manual");
    }
  };

  const submitQuiz = async (type: "manual" | "timeout" = "manual") => {
    if (!quiz || quizState === "completed") return;

    // Clear timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);

    setQuizState("completed");

    if (isAdmin) {
      toast.info("Quiz completed (Admin Mode - No submission saved)");
      return;
    }

    try {
      await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: parseInt(id),
          studentName: userDetails.name,
          studentEmail: userDetails.email,
          rollNumber: userDetails.rollNumber,
          faculty: userDetails.faculty,
          year: userDetails.year,
          score: score,
          // Note: score state is updated by handleAnswerSubmit.
          // For manual submission, the user must have answered the last question (isAnswered=true) to see the Finish button.
          // For timeout, we take the score as is (unsubmitted answers rely on explicit submission).
          totalQuestions: quiz.questions.length,
          isCheated: isCheated || (type === "timeout" && document.hidden), // simplify check
          submissionType: type === "timeout" && document.hidden ? "blur" : type,
        }),
      });
      toast.success("Quiz submitted successfully!");
    } catch (error) {
      console.error("Submission error", error);
      toast.error("Failed to save submission");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (quizState === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (quizState === "inactive") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Wait for the instructor to start the quiz.
        </h2>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="border-cyan-600 text-cyan-400"
        >
          Refresh Page
        </Button>
        <Link href="/" className="mt-4 text-slate-400 hover:text-white">
          Back to Home
        </Link>
      </div>
    );
  }

  if (quizState === "entry_form") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-400">
              {isAdmin ? "Admin Preview" : "Enter Details"}
            </CardTitle>
            <CardDescription>
              {isAdmin
                ? "You are entering admin preview mode."
                : "Please provide your information to start the quiz."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAdmin ? (
              <div className="bg-cyan-950/50 border border-cyan-800 p-4 rounded-md text-cyan-200">
                <p className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Admin Mode Active
                </p>
                <p className="text-sm mt-1">
                  You can start this quiz immediately. No student details are
                  required, and no submission will be recorded.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={userDetails.name}
                    onChange={(e) =>
                      setUserDetails({ ...userDetails, name: e.target.value })
                    }
                    placeholder="John Doe"
                    className="bg-slate-950 border-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userDetails.email}
                    onChange={(e) =>
                      setUserDetails({ ...userDetails, email: e.target.value })
                    }
                    placeholder="john@example.com"
                    className="bg-slate-950 border-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roll">Roll Number</Label>
                  <Input
                    id="roll"
                    value={userDetails.rollNumber}
                    onChange={(e) =>
                      setUserDetails({
                        ...userDetails,
                        rollNumber: e.target.value,
                      })
                    }
                    placeholder="KAN077BCT001"
                    className="bg-slate-950 border-slate-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Faculty</Label>
                    <Select
                      onValueChange={(val) =>
                        setUserDetails({ ...userDetails, faculty: val })
                      }
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-700">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BCT">BCT</SelectItem>
                        <SelectItem value="BEI">BEI</SelectItem>
                        <SelectItem value="BCE">BCE</SelectItem>
                        <SelectItem value="BEL">BEL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year (Batch - BS)</Label>
                    <Select
                      value={userDetails.year}
                      onValueChange={(val) =>
                        setUserDetails({ ...userDetails, year: val })
                      }
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-700">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {Array.from({ length: 16 }, (_, i) => 2070 + i).map(
                          (year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={startQuiz}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {isAdmin ? "Start Preview" : "Start Quiz"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (quizState === "completed") {
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
              {score} / {quiz?.questions.length}
            </div>
            <p className="text-slate-400">
              You scored{" "}
              {quiz && Math.round((score / quiz.questions.length) * 100)}%
            </p>
            {isCheated && (
              <div className="flex items-center justify-center gap-2 text-red-500 font-bold bg-red-950/20 p-2 rounded">
                <AlertTriangle size={20} /> Flgged for suspicious activity
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Link href="/">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-800 hover:bg-slate-200"
              >
                Back to Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Active Quiz View
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center p-4 pt-10">
      <div className="w-full max-w-2xl mb-6 flex justify-between items-center bg-slate-900/50 p-4 rounded-lg border border-slate-800">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-cyan-400 truncate max-w-[200px]">
            {quiz?.title}
          </h2>
          <span className="text-sm text-slate-400">
            {userDetails.name} | {userDetails.rollNumber}
          </span>
        </div>
        {quiz?.timeLimit && !isAdmin && (
          <div
            className={`flex items-center gap-2 font-mono text-xl font-bold ${
              timeLeft < 60 ? "text-red-500 animate-pulse" : "text-white"
            }`}
          >
            <Timer className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        )}
        {isAdmin && (
          <div className="flex items-center gap-2 font-mono text-lg font-bold text-cyan-400">
            <CheckCircle2 className="w-5 h-5" />
            Preview Mode
          </div>
        )}
      </div>

      <Card className="w-full max-w-2xl bg-slate-900 border-slate-800 text-slate-200 shadow-xl shadow-cyan-900/10">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-cyan-500 uppercase tracking-wider">
              Question {currentQuestionIndex + 1} of {quiz?.questions.length}
            </span>
          </div>
          <CardTitle className="text-xl md:text-2xl leading-relaxed text-white">
            {quiz?.questions[currentQuestionIndex].text}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={selectedAnswer}
            onValueChange={setSelectedAnswer}
            disabled={isAnswered}
            className="space-y-3"
          >
            {quiz?.questions[currentQuestionIndex].options.map(
              (option, index) => {
                let itemClass =
                  "flex items-center space-x-3 p-4 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors";
                if (isAnswered) {
                  if (
                    option ===
                    quiz?.questions[currentQuestionIndex].correctAnswer
                  ) {
                    itemClass =
                      "flex items-center space-x-3 p-4 rounded-lg border border-green-500/50 bg-green-950/30 cursor-default";
                  } else if (
                    option === selectedAnswer &&
                    option !==
                      quiz?.questions[currentQuestionIndex].correctAnswer
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
                    {isAnswered &&
                      option ===
                        quiz?.questions[currentQuestionIndex].correctAnswer && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    {isAnswered &&
                      option === selectedAnswer &&
                      option !==
                        quiz?.questions[currentQuestionIndex].correctAnswer && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                  </div>
                );
              }
            )}
          </RadioGroup>

          {isAnswered && (
            <div className="mt-6 p-4 bg-slate-950/50 rounded-lg border border-slate-800 animate-in fade-in slide-in-from-top-2">
              <h4 className="font-semibold text-cyan-400 mb-1">Explanation:</h4>
              <p className="text-slate-300">
                {quiz?.questions[currentQuestionIndex].explanation}
              </p>
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
              {currentQuestionIndex < (quiz?.questions.length || 0) - 1 ? (
                <>
                  Next Question <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                "Finish Quiz"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
