"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { PlusCircle, BookOpen, Edit, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { isAuthenticated, clearAuth } from "@/lib/auth";

interface QuizSummary {
  id: string;
  title: string;
  description: string;
  questionCount: number;
}

export default function Home() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const authStatus = isAuthenticated();
    setIsAuth(authStatus);
    fetchQuizzes();
  }, []);

  const handleLogout = () => {
    clearAuth();
    setIsAuth(false);
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const fetchQuizzes = async () => {
    try {
      const res = await fetch("/api/quizzes");
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
      } else {
        toast.error("Failed to load quizzes");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
              Lecture Quizzes
            </h1>
            <p className="text-slate-400 mt-2">
              Select a lecture to start the quiz or create a new one.
            </p>
          </div>
          <div className="flex gap-3">
            {isAuth ? (
              <>
                <Link href="/create">
                  <Button
                    size="lg"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create New Quiz
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  size="lg"
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-950"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-slate-800">
            <h3 className="text-xl text-slate-300 font-semibold">
              No quizzes found
            </h3>
            <p className="text-slate-500 mt-2">
              Create your first lecture quiz to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="bg-slate-900 border-slate-800 text-slate-200 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-900/20 flex flex-col"
              >
                <CardHeader>
                  <CardTitle className="text-xl text-cyan-400 line-clamp-1">
                    {quiz.title}
                  </CardTitle>
                  <CardDescription className="text-slate-400 line-clamp-2 min-h-[2.5rem]">
                    {quiz.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-sm text-slate-500 font-medium bg-slate-950 inline-block px-3 py-1 rounded-full border border-slate-800">
                    {quiz.questionCount} Questions
                  </div>
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-3">
                  <Link href={`/quiz/${quiz.id}`} className="w-full">
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                      <BookOpen className="mr-2 h-4 w-4" /> Start
                    </Button>
                  </Link>
                  <Link href={`/admin/${quiz.id}`} className="w-full">
                    <Button
                      variant="outline"
                      className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
