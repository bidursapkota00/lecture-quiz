"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2, Plus, ArrowLeft, Trash2, Edit2, Save, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function AdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    text: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctAnswerIndex: "0",
    explanation: "",
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchQuizData();
  }, [id]);

  const fetchQuizData = async () => {
    try {
      const res = await fetch(`/api/quizzes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setQuizTitle(data.title);
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const options = [
      formData.option1,
      formData.option2,
      formData.option3,
      formData.option4,
    ];
    const correctAnswer = options[parseInt(formData.correctAnswerIndex)];

    const payload = {
      text: formData.text,
      options,
      correctAnswer,
      explanation: formData.explanation,
    };

    try {
      const res = await fetch(`/api/quizzes/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Question added successfully!");
        setFormData({
          text: "",
          option1: "",
          option2: "",
          option3: "",
          option4: "",
          correctAnswerIndex: "0",
          explanation: "",
        });
        fetchQuizData();
      } else {
        toast.error("Failed to add question");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const res = await fetch(`/api/questions/${questionId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Question deleted successfully!");
        fetchQuizData();
      } else {
        toast.error("Failed to delete question");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDeleteQuiz = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this entire quiz? This action cannot be undone."
      )
    )
      return;

    try {
      const res = await fetch(`/api/quizzes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Quiz deleted successfully!");
        router.push("/");
      } else {
        toast.error("Failed to delete quiz");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const startEdit = (question: Question) => {
    setEditingId(question.id);
    const correctIndex = question.options.indexOf(question.correctAnswer);
    setFormData({
      text: question.text,
      option1: question.options[0] || "",
      option2: question.options[1] || "",
      option3: question.options[2] || "",
      option4: question.options[3] || "",
      correctAnswerIndex: correctIndex.toString(),
      explanation: question.explanation,
    });
  };

  const handleUpdate = async (questionId: number) => {
    const options = [
      formData.option1,
      formData.option2,
      formData.option3,
      formData.option4,
    ];
    const correctAnswer = options[parseInt(formData.correctAnswerIndex)];

    const payload = {
      text: formData.text,
      options,
      correctAnswer,
      explanation: formData.explanation,
    };

    try {
      const res = await fetch(`/api/questions/${questionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Question updated successfully!");
        setEditingId(null);
        setFormData({
          text: "",
          option1: "",
          option2: "",
          option3: "",
          option4: "",
          correctAnswerIndex: "0",
          explanation: "",
        });
        fetchQuizData();
      } else {
        toast.error("Failed to update question");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      text: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correctAnswerIndex: "0",
      explanation: "",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center p-4 pt-10">
      <div className="w-full max-w-4xl mb-6 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
        <Button
          onClick={handleDeleteQuiz}
          variant="outline"
          className="border-red-600 text-red-400 hover:bg-red-950"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete Quiz
        </Button>
      </div>

      <div className="w-full max-w-4xl space-y-6">
        <Card className="bg-slate-900 border-slate-800 text-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-400">
              Manage: {quizTitle}
            </CardTitle>
            <CardDescription className="text-slate-400">
              Add, edit, or remove questions from this lecture quiz.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="text">Question Text</Label>
                <Input
                  id="text"
                  name="text"
                  placeholder="Enter the question here..."
                  value={formData.text}
                  onChange={handleChange}
                  required
                  className="bg-slate-950 border-slate-700 focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="space-y-2">
                    <Label htmlFor={`option${num}`}>Option {num}</Label>
                    <Input
                      id={`option${num}`}
                      name={`option${num}`}
                      placeholder={`Option ${num}`}
                      value={formData[`option${num}` as keyof typeof formData]}
                      onChange={handleChange}
                      required
                      className="bg-slate-950 border-slate-700 focus:border-cyan-500"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <RadioGroup
                  value={formData.correctAnswerIndex}
                  onValueChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      correctAnswerIndex: val,
                    }))
                  }
                  className="flex gap-4"
                >
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={index.toString()}
                        id={`correct-${index}`}
                        className="border-slate-500 text-cyan-500"
                      />
                      <Label htmlFor={`correct-${index}`}>
                        Option {index + 1}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation</Label>
                <Input
                  id="explanation"
                  name="explanation"
                  placeholder="Explain why this answer is correct..."
                  value={formData.explanation}
                  onChange={handleChange}
                  required
                  className="bg-slate-950 border-slate-700 focus:border-cyan-500"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> Add Question
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Existing Questions */}
        {questions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-cyan-400">
              Existing Questions ({questions.length})
            </h3>
            {questions.map((question, index) => (
              <Card
                key={question.id}
                className="bg-slate-900 border-slate-800 text-slate-200"
              >
                {editingId === question.id ? (
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label>Edit Question</Label>
                      <Input
                        value={formData.text}
                        onChange={(e) =>
                          setFormData({ ...formData, text: e.target.value })
                        }
                        className="bg-slate-950 border-slate-700"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[1, 2, 3, 4].map((num) => (
                        <Input
                          key={num}
                          placeholder={`Option ${num}`}
                          value={
                            formData[`option${num}` as keyof typeof formData]
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [`option${num}`]: e.target.value,
                            })
                          }
                          className="bg-slate-950 border-slate-700"
                        />
                      ))}
                    </div>
                    <Input
                      placeholder="Explanation"
                      value={formData.explanation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          explanation: e.target.value,
                        })
                      }
                      className="bg-slate-950 border-slate-700"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUpdate(question.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="mr-2 h-4 w-4" /> Save
                      </Button>
                      <Button
                        onClick={cancelEdit}
                        variant="outline"
                        className="border-slate-700"
                      >
                        <X className="mr-2 h-4 w-4" /> Cancel
                      </Button>
                    </div>
                  </CardContent>
                ) : (
                  <>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-grow">
                          <CardTitle className="text-lg">
                            Question {index + 1}
                          </CardTitle>
                          <p className="text-slate-300 mt-2">{question.text}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => startEdit(question)}
                            variant="outline"
                            className="border-cyan-600 text-cyan-400 hover:bg-cyan-950"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDelete(question.id)}
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-950"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {question.options.map((option, i) => (
                          <div
                            key={i}
                            className={`p-2 rounded ${
                              option === question.correctAnswer
                                ? "bg-green-950/30 border border-green-500/50"
                                : "bg-slate-950/50"
                            }`}
                          >
                            {option} {option === question.correctAnswer && "✓"}
                          </div>
                        ))}
                        <div className="mt-4 p-3 bg-cyan-950/20 rounded border border-cyan-800/30">
                          <p className="text-sm text-slate-400">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
