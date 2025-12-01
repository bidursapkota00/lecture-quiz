# Quiz App - Lecture Management System

A modern quiz application built with Next.js, Tailwind CSS, Shadcn UI, and Neon PostgreSQL. Perfect for teachers to create lecture-specific quizzes for active learning.

## Features

- **Lecture-Based Quizzes**: Create separate quizzes for each lecture topic
- **Question Management**: Add, edit, and delete questions
- **Interactive Quiz Interface**: One question at a time with instant feedback
- **Authentication**: Simple authentication for teachers (demo mode)
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Database Storage**: PostgreSQL database via Neon

## Prerequisites

- Node.js 18+ installed
- Neon Database account (free tier available)
- Your Neon database connection string

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# On Windows
copy .env.example .env.local

# On Mac/Linux
cp .env.example .env.local
```

Edit `.env.local` and add your Neon database connection string:

```env
DATABASE_URL=your_neon_database_connection_string_here
AUTH_SECRET=your-secret-key-change-this
```

**To get your Neon database connection string:**

1. Go to your [Neon Dashboard](https://console.neon.tech/)
2. Select your project
3. Click "Connection Details"
4. Copy the connection string (it should look like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`)

### 3. Push Database Schema

Run the following command to create the database tables:

```bash
npm run db:push
```

This will create the following tables:

- `users` - For authentication
- `quizzes` - Lecture quizzes
- `questions` - Quiz questions

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Login Credentials (Demo)

- **Email**: `bidursapkota00@gmail.com`
- **Password**: `demo123`

### Creating a Quiz

1. Login with the credentials above
2. Click "Create New Quiz"
3. Enter lecture title and description
4. Start adding questions

### Managing Questions

- **Add Questions**: Fill out the form with question text, 4 options, correct answer, and explanation
- **Edit Questions**: Click the edit icon on any existing question
- **Delete Questions**: Click the trash icon to remove a question
- **Delete Quiz**: Click "Delete Quiz" button to remove the entire lecture

### Taking a Quiz

- No authentication required to take quizzes
- Click "Start" on any lecture quiz
- Answer questions one by one
- Get instant feedback and explanations
- View your final score

## Project Structure

```
quiz/
├── app/
│   ├── api/
│   │   ├── quizzes/          # Quiz CRUD operations
│   │   └── questions/        # Question update/delete
│   ├── admin/[id]/           # Quiz management page
│   ├── quiz/[id]/            # Taking quiz page
│   ├── create/               # Create new quiz
│   ├── login/                # Login page
│   └── page.tsx              # Home page
├── components/ui/            # Shadcn UI components
├── lib/
│   ├── db/
│   │   ├── schema.ts         # Database schema
│   │   └── index.ts          # Database connection
│   ├── auth.ts               # Simple authentication
│   └── utils.ts              # Utility functions
└── data/                     # Legacy JSON storage (not used with DB)
```

## Database Schema

### Users Table

```sql
- id: serial PRIMARY KEY
- email: text NOT NULL UNIQUE
- password: text
- created_at: timestamp
```

### Quizzes Table

```sql
- id: serial PRIMARY KEY
- title: text NOT NULL
- description: text
- user_id: foreign key -> users(id)
- created_at: timestamp
```

### Questions Table

```sql
- id: serial PRIMARY KEY
- quiz_id: foreign key -> quizzes(id) ON DELETE CASCADE
- text: text NOT NULL
- options: text[] NOT NULL (4 options)
- correct_answer: text NOT NULL
- explanation: text NOT NULL
- created_at: timestamp
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Technologies Used

- **Framework**: Next.js 16
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **UI Components**: Shadcn UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: Sonner

## Future Enhancements

- [ ] Real authentication with NextAuth.js
- [ ] User registration
- [ ] Quiz analytics and student performance tracking
- [ ] Timer for quizzes
- [ ] Question categories/tags
- [ ] Export quiz results
- [ ] Multiple choice and other question types

## License

MIT

## Author

Created for educational purposes.
