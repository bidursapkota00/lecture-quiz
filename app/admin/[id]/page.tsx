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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  ArrowLeft,
  Trash2,
  Edit2,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  Settings,
  Users,
  AlertTriangle,
  PlayCircle,
  StopCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface Subject {
  id: number;
  name: string;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface Submission {
  id: number;
  studentName: string;
  studentEmail: string;
  rollNumber: string;
  faculty: string;
  year: string;
  score: number;
  totalQuestions: number;
  isCheated: boolean;
  submissionType: string;
  createdAt: string;
}

export default function AdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Quiz Meta
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizSubjectId, setQuizSubjectId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeLimit, setTimeLimit] = useState<string>("0"); // in minutes

  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Submission Filter
  const [viewFilterFaculty, setViewFilterFaculty] = useState<string>("all");
  const [viewFilterYear, setViewFilterYear] = useState<string>("all");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingQuizMeta, setEditingQuizMeta] = useState(false);
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
    fetchSubjects();
    fetchSubmissions();
  }, [id]);

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/subjects");
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error("Failed to load subjects");
    }
  };

  const fetchQuizData = async () => {
    try {
      const res = await fetch(`/api/quizzes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setQuizTitle(data.title);
        setQuizDescription(data.description || "");
        setQuizSubjectId(data.subjectId ? data.subjectId.toString() : "none");
        setQuestions(data.questions);
        setIsActive(data.isActive || false);
        setTimeLimit(data.timeLimit ? data.timeLimit.toString() : "0");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const query = new URLSearchParams({ quizId: id });
      if (viewFilterFaculty !== "all")
        query.append("faculty", viewFilterFaculty);
      if (viewFilterYear !== "all") query.append("year", viewFilterYear);

      const res = await fetch(`/api/submissions?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error("Failed to load submissions");
    }
  };

  // Re-fetch submissions when filters change
  useEffect(() => {
    fetchSubmissions();
  }, [viewFilterFaculty, viewFilterYear]);

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

  const handleUpdateQuizMeta = async () => {
    try {
      const res = await fetch(`/api/quizzes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quizTitle,
          description: quizDescription,
          subjectId:
            quizSubjectId && quizSubjectId !== "none"
              ? parseInt(quizSubjectId)
              : null,
          isActive: isActive,
          timeLimit: parseInt(timeLimit) || 0,
        }),
      });

      if (res.ok) {
        toast.success("Quiz settings updated successfully!");
        setEditingQuizMeta(false);
        fetchQuizData();
      } else {
        toast.error("Failed to update quiz settings");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const toggleActive = async () => {
    const newState = !isActive;
    setIsActive(newState); // Optimistic active
    try {
      const res = await fetch(`/api/quizzes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quizTitle,
          isActive: newState,
        }),
      });
      if (!res.ok) {
        setIsActive(!newState); // Revert
        toast.error("Failed to update status");
      } else {
        if (newState) toast.success("Quiz is now ACTIVE");
        else toast.info("Quiz is now INACTIVE");
      }
    } catch (e) {
      setIsActive(!newState);
      toast.error("Error updating status");
    }
  };

  const handleReorder = async (
    questionId: number,
    direction: "up" | "down"
  ) => {
    try {
      const res = await fetch(`/api/questions/${questionId}/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });

      if (res.ok) {
        toast.success(`Question moved ${direction}!`);
        fetchQuizData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to reorder question");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1.5 px-3">
            <span
              className={`text-sm font-bold ${
                isActive ? "text-green-500" : "text-slate-400"
              }`}
            >
              {isActive ? "LIVE" : "OFFLINE"}
            </span>
            <Switch
              checked={isActive}
              onCheckedChange={toggleActive}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          <Button
            onClick={handleDeleteQuiz}
            variant="outline"
            className="border-red-600 text-red-400 hover:bg-red-950"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete Quiz
          </Button>
        </div>
      </div>

      <div className="w-full max-w-4xl space-y-6">
        <Tabs defaultValue="questions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900 border-slate-800">
            <TabsTrigger value="questions">Questions & Settings</TabsTrigger>
            <TabsTrigger value="submissions">
              Submissions {submissions.length > 0 && `(${submissions.length})`}
            </TabsTrigger>
          </TabsList>

          {/* QUESTIONS TAB */}
          <TabsContent value="questions" className="space-y-6 mt-6">
            <Card className="bg-slate-900 border-slate-800 text-slate-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    {editingQuizMeta ? (
                      <div className="space-y-3">
                        <div>
                          <Label
                            htmlFor="quiz-title"
                            className="text-slate-400"
                          >
                            Quiz Title
                          </Label>
                          <Input
                            id="quiz-title"
                            value={quizTitle}
                            onChange={(e) => setQuizTitle(e.target.value)}
                            className="bg-slate-950 border-slate-700 text-white mt-1"
                            placeholder="Enter quiz title"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label
                              htmlFor="quiz-subject"
                              className="text-slate-400"
                            >
                              Subject
                            </Label>
                            <Select
                              value={quizSubjectId || "none"}
                              onValueChange={(value) => setQuizSubjectId(value)}
                            >
                              <SelectTrigger className="w-full bg-slate-950 border-slate-700 text-slate-200 mt-1">
                                <SelectValue placeholder="Uncategorized" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-950 border-slate-700 text-slate-200">
                                <SelectItem value="none">
                                  Uncategorized
                                </SelectItem>
                                {subjects.map((subject) => (
                                  <SelectItem
                                    key={subject.id}
                                    value={subject.id.toString()}
                                  >
                                    {subject.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label
                              htmlFor="time-limit"
                              className="text-slate-400"
                            >
                              Time Limit (Minutes)
                            </Label>
                            <Input
                              id="time-limit"
                              type="number"
                              min="0"
                              value={timeLimit}
                              onChange={(e) => setTimeLimit(e.target.value)}
                              className="bg-slate-950 border-slate-700 text-white mt-1"
                              placeholder="0 for no limit"
                            />
                            <span className="text-xs text-slate-500">
                              Set 0 for no limit
                            </span>
                          </div>
                        </div>
                        <div>
                          <Label
                            htmlFor="quiz-description"
                            className="text-slate-400"
                          >
                            Description
                          </Label>
                          <Input
                            id="quiz-description"
                            value={quizDescription}
                            onChange={(e) => setQuizDescription(e.target.value)}
                            className="bg-slate-950 border-slate-700 text-white mt-1"
                            placeholder="Enter quiz description (optional)"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleUpdateQuizMeta}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="mr-2 h-4 w-4" /> Save Settings
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingQuizMeta(false);
                              fetchQuizData();
                            }}
                            size="sm"
                            variant="outline"
                            className="border-slate-700 text-slate-800 hover:bg-slate-200"
                          >
                            <X className="mr-2 h-4 w-4" /> Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-2xl text-cyan-400">
                            {quizTitle}
                          </CardTitle>
                          {parseInt(timeLimit) > 0 && (
                            <span className="text-xs border border-cyan-800 text-cyan-600 px-2 py-0.5 rounded-full">
                              {timeLimit} mins
                            </span>
                          )}
                        </div>
                        {quizDescription && (
                          <CardDescription className="text-slate-400 mt-2">
                            {quizDescription}
                          </CardDescription>
                        )}
                        {!quizDescription && (
                          <CardDescription className="text-slate-500 mt-2 italic">
                            No description set. Click edit to add one.
                          </CardDescription>
                        )}
                      </>
                    )}
                  </div>
                  {!editingQuizMeta && (
                    <Button
                      onClick={() => setEditingQuizMeta(true)}
                      size="sm"
                      variant="outline"
                      className="border-cyan-600 text-cyan-400 hover:bg-cyan-950"
                    >
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </Button>
                  )}
                </div>
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
                          value={
                            formData[`option${num}` as keyof typeof formData]
                          }
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
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
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

                  <div className="space-y-2 mb-6">
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
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Adding...
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
                                formData[
                                  `option${num}` as keyof typeof formData
                                ]
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
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
                                <RadioGroupItem
                                  value={index.toString()}
                                  id={`edit-correct-${index}`}
                                  className="border-slate-500 text-cyan-500"
                                />
                                <Label htmlFor={`edit-correct-${index}`}>
                                  Option {index + 1}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
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
                            className="border-slate-700 text-slate-800 hover:bg-slate-200"
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
                              <p className="text-slate-300 mt-2">
                                {question.text}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleReorder(question.id, "up")}
                                variant="outline"
                                disabled={index === 0}
                                className="border-slate-600 text-slate-400 hover:bg-slate-800 disabled:opacity-30"
                                title="Move up"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleReorder(question.id, "down")
                                }
                                variant="outline"
                                disabled={index === questions.length - 1}
                                className="border-slate-600 text-slate-400 hover:bg-slate-800 disabled:opacity-30"
                                title="Move down"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
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
                                {option}{" "}
                                {option === question.correctAnswer && "✓"}
                              </div>
                            ))}
                            <div className="mt-4 p-3 bg-cyan-950/20 rounded border border-cyan-800/30">
                              <p className="text-sm text-slate-400">
                                <strong>Explanation:</strong>{" "}
                                {question.explanation}
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
          </TabsContent>

          {/* SUBMISSIONS TAB */}
          <TabsContent value="submissions">
            <Card className="bg-slate-900 border-slate-800 text-slate-200">
              <CardHeader>
                <CardTitle className="mb-4">Student Submissions</CardTitle>
                <div className="flex gap-4">
                  <div className="space-y-2 w-40">
                    <Label>Faculty</Label>
                    <Select
                      value={viewFilterFaculty}
                      onValueChange={setViewFilterFaculty}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-700">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="BCT">BCT</SelectItem>
                        <SelectItem value="BEI">BEI</SelectItem>
                        <SelectItem value="BCE">BCE</SelectItem>
                        <SelectItem value="BEL">BEL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 w-40">
                    <Label>Year (Batch - BS)</Label>
                    <Select
                      value={viewFilterYear}
                      onValueChange={setViewFilterYear}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-700">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        <SelectItem value="all">All</SelectItem>
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
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-slate-800">
                  <Table>
                    <TableHeader className="bg-slate-950">
                      <TableRow className="border-slate-800">
                        <TableHead className="text-slate-400">
                          Student
                        </TableHead>
                        <TableHead className="text-slate-400">
                          Roll No
                        </TableHead>
                        <TableHead className="text-slate-400">
                          Faculty/Year
                        </TableHead>
                        <TableHead className="text-slate-400">Score</TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                        <TableHead className="text-slate-400">
                          Submitted
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center h-24 text-slate-500"
                          >
                            No submissions found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        submissions.map((sub) => (
                          <TableRow key={sub.id} className="border-slate-800">
                            <TableCell>
                              <div className="font-medium text-slate-200">
                                {sub.studentName}
                              </div>
                              <div className="text-xs text-slate-500">
                                {sub.studentEmail}
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {sub.rollNumber}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {sub.faculty} / {sub.year}
                            </TableCell>
                            <TableCell className="font-bold text-cyan-400">
                              {sub.score} / {sub.totalQuestions}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {sub.isCheated && (
                                  <div className="flex items-center text-xs text-red-500 font-bold bg-red-950/20 px-2 py-1 rounded w-fit">
                                    <AlertTriangle className="w-3 h-3 mr-1" />{" "}
                                    FLAGGED
                                  </div>
                                )}
                                <div className="text-xs text-slate-500 capitalize">
                                  Type: {sub.submissionType}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-400 text-sm">
                              {new Date(sub.createdAt).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
