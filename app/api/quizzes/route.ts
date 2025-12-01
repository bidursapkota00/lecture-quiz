import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const quizzesDir = path.join(process.cwd(), "data", "quizzes");

// Ensure directory exists
if (!fs.existsSync(quizzesDir)) {
  fs.mkdirSync(quizzesDir, { recursive: true });
}

export async function GET() {
  try {
    const files = fs.readdirSync(quizzesDir);
    const quizzes = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        const content = fs.readFileSync(path.join(quizzesDir, file), "utf-8");
        const quiz = JSON.parse(content);
        return {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          questionCount: quiz.questions.length,
        };
      })
      .sort((a, b) => b.id - a.id); // Newest first

    return NextResponse.json(quizzes);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const id = Date.now().toString();
    const newQuiz = {
      id,
      title,
      description: description || "",
      questions: [],
    };

    const filePath = path.join(quizzesDir, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(newQuiz, null, 2));

    return NextResponse.json(newQuiz, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}
