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
import { Loader2, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [formData, setFormData] = useState({
    text: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctAnswerIndex: "0", // 0-3
    explanation: "",
  });

  useEffect(() => {
    // Fetch quiz details to show title
    fetch(`/api/quizzes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.title) setQuizTitle(data.title);
      })
      .catch((err) => console.error(err));
  }, [id]);

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
      } else {
        toast.error("Failed to add question");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center p-4 pt-10">
      <div className="w-full max-w-2xl mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </div>

      <Card className="w-full max-w-2xl bg-slate-900 border-slate-800 text-slate-200">
        <CardHeader>
          <CardTitle className="text-2xl text-cyan-400">
            Add Question to: {quizTitle}
          </CardTitle>
          <CardDescription className="text-slate-400">
            Add a new question to this lecture quiz.
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
                  setFormData((prev) => ({ ...prev, correctAnswerIndex: val }))
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
    </div>
  );
}
