import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

// This is a one-time setup endpoint to create the demo user
export async function POST() {
  try {
    // Check if user already exists
    const existingUsers = await db.select().from(users);

    if (existingUsers.length > 0) {
      return NextResponse.json({ message: "User already exists" });
    }

    // Create the demo user
    const [newUser] = await db
      .insert(users)
      .values({
        email: "bidursapkota00@gmail.com",
        password: null, // No password for now
      })
      .returning();

    return NextResponse.json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
