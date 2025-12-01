import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const quizzesDir = path.join(process.cwd(), "data", "quizzes");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const filePath = path.join(quizzesDir, `${id}.json`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const quiz = JSON.parse(content);
    return NextResponse.json(quiz);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const filePath = path.join(quizzesDir, `${id}.json`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { text, options, correctAnswer, explanation } = body;

    if (
      !text ||
      !options ||
      options.length !== 4 ||
      !correctAnswer ||
      !explanation
    ) {
      return NextResponse.json(
        { error: "Invalid question data" },
        { status: 400 }
      );
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const quiz = JSON.parse(content);

    const newQuestion = {
      id: Date.now().toString(),
      text,
      options,
      correctAnswer,
      explanation,
    };

    quiz.questions.push(newQuestion);
    fs.writeFileSync(filePath, JSON.stringify(quiz, null, 2));

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add question" },
      { status: 500 }
    );
  }
}
