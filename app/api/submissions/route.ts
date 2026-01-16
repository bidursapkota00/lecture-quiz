import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { submissions, quizzes, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      quizId,
      studentName,
      studentEmail,
      rollNumber,
      faculty,
      year,
      score,
      totalQuestions,
      isCheated,
      submissionType,
    } = body;

    if (
      !quizId ||
      !studentName ||
      !studentEmail ||
      !rollNumber ||
      !faculty ||
      !year ||
      score === undefined ||
      totalQuestions === undefined ||
      !submissionType
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [newSubmission] = await db
      .insert(submissions)
      .values({
        quizId,
        studentName,
        studentEmail,
        rollNumber,
        faculty,
        year,
        score,
        totalQuestions,
        isCheated: isCheated || false,
        submissionType,
      })
      .returning();

    return NextResponse.json(newSubmission, { status: 201 });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get("quizId");
    const faculty = searchParams.get("faculty");
    const year = searchParams.get("year");

    let query = db.select().from(submissions);
    const conditions = [];

    if (quizId) {
      conditions.push(eq(submissions.quizId, parseInt(quizId)));
    }
    if (faculty && faculty !== "all") {
      conditions.push(eq(submissions.faculty, faculty));
    }
    if (year && year !== "all") {
      conditions.push(eq(submissions.year, year));
    }

    const conditionsToApply =
      conditions.length > 0
        ? conditions.length === 1
          ? conditions[0]
          : and(...conditions)
        : undefined;

    // We need to handle the query construction properly with drizzle
    // Since we can't easily chain .where() conditionally on a base query object in all versions in a simple way
    // without using the dynamic query builder or just constructing the promise.
    // However, drizzle-orm query builder is mutable or chainable effectively.

    const results = await db
      .select({
        id: submissions.id,
        studentName: submissions.studentName,
        studentEmail: submissions.studentEmail,
        rollNumber: submissions.rollNumber,
        faculty: submissions.faculty,
        year: submissions.year,
        score: submissions.score,
        totalQuestions: submissions.totalQuestions,
        isCheated: submissions.isCheated,
        submissionType: submissions.submissionType,
        createdAt: submissions.createdAt,
        quizTitle: quizzes.title,
      })
      .from(submissions)
      .leftJoin(quizzes, eq(submissions.quizId, quizzes.id))
      .where(conditionsToApply)
      .orderBy(desc(submissions.createdAt));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
