import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizzes, questions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, parseInt(id)));

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const quizQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, parseInt(id)));

    return NextResponse.json({
      ...quiz,
      questions: quizQuestions,
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);
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

    const [newQuestion] = await db
      .insert(questions)
      .values({
        quizId: parseInt(id),
        text,
        options,
        correctAnswer,
        explanation,
      })
      .returning();

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error("Error adding question:", error);
    return NextResponse.json(
      { error: "Failed to add question" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await db.delete(quizzes).where(eq(quizzes.id, parseInt(id)));
    return NextResponse.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { error: "Failed to delete quiz" },
      { status: 500 }
    );
  }
}
