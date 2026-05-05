# Metrix - Personal Workout Tracker

A full-stack workout tracking web application inspired by Hevy. Built with Next.js, PostgreSQL, Prisma, and Tailwind CSS.

## Features

- **Exercise Library**: 100+ pre-defined exercises with muscle group and category filtering
- **Routines**: Create, edit, and delete custom workout routines
- **Active Workout Session**: Real-time timer, set tracking, rest timer, and PR notifications
- **Body Weight Tracking**: Log and visualize weight progress with charts
- **Workout History**: View past workouts with volume, duration, and PR highlights
- **Responsive Design**: Desktop sidebar navigation + mobile bottom navigation bar
- **Dark Theme**: Sleek dark UI with emerald accents

## Tech Stack

- **Frontend & Backend**: Next.js 16 (App Router, TypeScript)
- **Database**: PostgreSQL (Prisma ORM v7)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (radix-ui)
- **Icons**: lucide-react
- **State Management**: Zustand
- **Charts**: recharts
- **Notifications**: sonner

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- PostgreSQL 15+
- npm or pnpm

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a PostgreSQL database:

```sql
CREATE DATABASE metrix;
```

Update the `.env` file with your connection string:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/metrix?schema=public"
```

### 3. Run Database Migration

```bash
npm run db:push
```

### 4. Seed the Database

```bash
npm run seed
```

This will populate the database with 100+ exercises.

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── bodyweight/         # Body weight CRUD
│   │   ├── exercises/          # Exercise filtering
│   │   ├── finish-workout/     # Finish & save workout
│   │   ├── routines/           # Routine CRUD
│   │   ├── start-workout/      # Start new session
│   │   └── workouts/           # Fetch history
│   ├── exercises/page.tsx      # Exercise library page
│   ├── history/page.tsx        # Workout history page
│   ├── workout/page.tsx        # Workout page (routines + active)
│   ├── layout.tsx              # Root layout with nav
│   └── page.tsx                # Dashboard page
├── components/
│   ├── dashboard/              # Dashboard components
│   ├── exercises/              # Exercise components
│   ├── navigation/             # Sidebar & BottomNav
│   ├── workout/                # Workout components
│   └── ui/                     # shadcn/ui components
└── lib/
    ├── prisma.ts               # Prisma client singleton
    ├── utils.ts                # Utility functions
    └── workout-store.ts        # Zustand store
prisma/
├── schema.prisma               # Database schema
└── seed.ts                     # Exercise seed data
```

## Database Schema

- **Exercise**: Predefined exercises with muscle group and category
- **Routine**: Custom workout routines
- **RoutineExercise**: Many-to-many relationship between routines and exercises
- **WorkoutSession**: Individual workout sessions
- **WorkoutSet**: Sets within a workout session (with PR tracking)
- **BodyWeightLog**: Body weight entries over time

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exercises` | List/filter exercises |
| GET | `/api/routines` | List all routines |
| POST | `/api/routines` | Create a routine |
| PUT | `/api/routines/[id]` | Update a routine |
| DELETE | `/api/routines/[id]` | Delete a routine |
| POST | `/api/start-workout` | Start a new workout session |
| POST | `/api/finish-workout` | Finish and save a workout |
| GET | `/api/workouts` | Fetch workout history |
| GET | `/api/bodyweight` | Get weight logs |
| POST | `/api/bodyweight` | Log body weight |

## Development Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run seed         # Seed the database
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `NEXT_PUBLIC_APP_URL` | App base URL | `http://localhost:3000` |

## License

MIT
