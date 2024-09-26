# CMPG 323 GROUP PROJECT

Members of the team:

- Jacob Swati - 35164050
- Katlego Lefenya - 21403325
- Markus Marais - 34906258

Project name:

## Share2Teach

This README provides instructions on how to set up and run this Next.js project locally.

- Node.js (version 20 or later)
- npm (usually comes with Node.js)
- A PostgreSQL database (or any other database supported by Prisma)

## Local Setup

1. Clone the repository:

   ```cmd
   git clone https://github.com/MrMarxz/effective-disco.git
   cd effective-disco
   ```

2. Install dependencies:

   ```cmd
   npm install
   ```

3. Set up environment variables:
   - Copy the `.env.example` file to `.env`
   - Fill in the necessary environment variables, especially the `DATABASE_URL`

4. Set up the database:

   ```cmd
   npx prisma generate
   npx prisma db push
   ```

   **Important:** Make sure you've added your database URL to the `.env` file before running any Prisma commands.

5. Run the development server:

   ```cmd
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Available Scripts

- `npm run dev`: Runs the app in development mode
- `npm run build`: Builds the app for production
- `npm start`: Runs the built app in production mode
- `npm run lint`: Runs the linter to check for code style issues

## Prisma Commands

Remember to add your database URL to the `.env` file before running these commands:

- `npx prisma generate`: Generates Prisma Client. This is read from the `schema.prisma` file
- `npx prisma db push`: Pushes the Prisma schema to your database
- `npx prisma studio`: Opens Prisma Studio to manage your data

## Learn More

To learn more about the technologies used in this project, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
