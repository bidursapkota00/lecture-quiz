import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subjects, quizzes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const subjectId = parseInt(id);

  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const [updatedSubject] = await db
      .update(subjects)
      .set({ name, description })
      .where(eq(subjects.id, subjectId))
      .returning();

    if (!updatedSubject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json(updatedSubject);
  } catch (error) {
    console.error("Error updating subject:", error);
    return NextResponse.json(
      { error: "Failed to update subject" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const subjectId = parseInt(id);

  try {
    // First, verify the subject exists
    const [existingSubject] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, subjectId));

    if (!existingSubject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Uncategorize associated quizzes (set subjectId to null)
    await db
      .update(quizzes)
      .set({ subjectId: null })
      .where(eq(quizzes.subjectId, subjectId));

    // Delete the subject
    await db.delete(subjects).where(eq(subjects.id, subjectId));

    return NextResponse.json({
      message: "Subject deleted and quizzes uncategorized",
    });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { error: "Failed to delete subject" },
      { status: 500 }
    );
  }
}
