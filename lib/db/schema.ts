import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Password is required
  createdAt: timestamp("created_at").defaultNow(),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  subjectId: integer("subject_id").references(() => subjects.id),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  timeLimit: integer("time_limit"), // in minutes
  isActive: boolean("is_active").default(false),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => quizzes.id, {
    onDelete: "cascade",
  }),
  text: text("text").notNull(),
  options: text("options").array().notNull(), // Array of 4 options
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation").notNull(),
  order: integer("order").notNull().default(0), // Order of question appearance
  createdAt: timestamp("created_at").defaultNow(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => quizzes.id, {
    onDelete: "cascade",
  }),
  studentName: text("student_name").notNull(),
  studentEmail: text("student_email").notNull(),
  rollNumber: text("roll_number").notNull(),
  faculty: text("faculty").notNull(), // e.g., BCT, BEI
  year: text("year").notNull(), // e.g., 1st, 2nd
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  isCheated: boolean("is_cheated").default(false),
  submissionType: text("submission_type").notNull(), // 'manual', 'timeout', 'blur'
  createdAt: timestamp("created_at").defaultNow(),
});
