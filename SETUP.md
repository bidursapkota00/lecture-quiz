# Database Setup Instructions

## Step 1: Create .env.local File

Since `.env.local` is in gitignore, you need to create it manually:

1. In the root of your project (`C:\Users\dell\Desktop\quiz\`), create a new file called `.env.local`
2. Add the following content:

```env
DATABASE_URL=your_neon_database_connection_string_goes_here
AUTH_SECRET=my-secret-key-123
```

## Step 2: Add Your Neon Database Connection String

Replace `your_neon_database_connection_string_goes_here` with your actual Neon database connection string.

Your connection string should look something like this:

```
postgresql://username:password@ep-xxxxxx.region.aws.neon.tech/databasename?sslmode=require
```

## Step 3: Push the Schema to Your Database

After you've added the DATABASE_URL, run:

```bash
npm run db:push
```

This will create all necessary tables in your Neon database:

- users
- quizzes
- questions

## Step 4: Verify the Setup

You can verify the tables were created by running:

```bash
npm run db:studio
```

This opens Drizzle Studio where you can see your database tables and data.

## Note About Authentication

Currently, the app uses a simple client-side authentication with hardcoded credentials:

- Email: bidursapkota00@gmail.com
- Password: demo123

This is just for demo purposes. The user table in the database is set up but not actively used yet.

## Next Steps

Once the database is set up, you can:

1. Run the development server: `npm run dev`
2. Login at `/login` with the credentials above
3. Create quizzes and add questions
4. All data will be stored in your Neon database
