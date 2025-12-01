import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "questions.json");

// Helper to read questions
function getQuestions() {
  if (!fs.existsSync(dataFilePath)) {
    return [];
  }
  const fileContent = fs.readFileSync(dataFilePath, "utf-8");
  try {
    return JSON.parse(fileContent);
  } catch (error) {
    return [];
  }
}

// Helper to write questions
function saveQuestions(questions: any[]) {
  fs.writeFileSync(dataFilePath, JSON.stringify(questions, null, 2));
}

export async function GET() {
  const questions = getQuestions();
  return NextResponse.json(questions);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject, text, options, correctAnswer, explanation } = body;

    if (
      !subject ||
      !text ||
      !options ||
      options.length !== 4 ||
      !correctAnswer ||
      !explanation
    ) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const questions = getQuestions();
    const newQuestion = {
      id: Date.now().toString(),
      subject,
      text,
      options,
      correctAnswer,
      explanation,
    };

    questions.push(newQuestion);
    saveQuestions(questions);

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save question" },
      { status: 500 }
    );
  }
}
