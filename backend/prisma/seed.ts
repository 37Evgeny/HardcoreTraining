import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('Admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hardcoretraining.com' },
    update: {},
    create: {
      email: 'admin@hardcoretraining.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: hashedPassword,
      name: 'John Doe',
      role: 'USER',
    },
  });

  console.log(`✅ Users created: ${admin.email}, ${user.email}`);

  const foundation = await prisma.workout.upsert({
    where: { id: 'foundation-beginner-001' },
    update: {},
    create: {
      id: 'foundation-beginner-001',
      title: 'The Foundation (Beginner)',
      description: 'A beginner-friendly kettlebell workout focusing on foundational movements.',
      level: 'BEGINNER',
      durationMinutes: 25,
      exercises: {
        create: [
          { name: 'Kettlebell Deadlift', sets: 3, reps: 10, restSeconds: 60, instructions: 'Place kettlebell between feet. Hinge at hips, grip handle, drive through heels.', safetyTip: 'Keep your back neutral.' },
          { name: 'Goblet Squat', sets: 3, reps: 8, restSeconds: 60, instructions: 'Hold kettlebell at chest level. Squat down keeping chest up.', safetyTip: 'Keep heels on the ground.' },
          { name: 'Two-Handed Swing', sets: 3, reps: 10, restSeconds: 45, instructions: 'Hold kettlebell with both hands. Hike pass between legs, thrust hips forward.', safetyTip: 'Power comes from hips.' },
          { name: 'Overhead Press', sets: 3, reps: 5, restSeconds: 60, instructions: 'Clean kettlebell to rack position. Press overhead.', safetyTip: 'Brace core before pressing.' },
        ],
      },
    },
  });

  const flow = await prisma.workout.upsert({
    where: { id: 'flow-intermediate-002' },
    update: {},
    create: {
      id: 'flow-intermediate-002',
      title: 'The Flow (Intermediate)',
      description: 'An intermediate flow workout combining swings, cleans, and snatches.',
      level: 'INTERMEDIATE',
      durationMinutes: 35,
      exercises: {
        create: [
          { name: 'Single-Arm Swing', sets: 3, reps: 8, restSeconds: 45, instructions: 'Swing kettlebell with one hand.', safetyTip: 'Keep wrist straight.' },
          { name: 'Clean', sets: 3, reps: 6, restSeconds: 60, instructions: 'Pull kettlebell from swing into rack.', safetyTip: 'Keep bell close to body.' },
          { name: 'Front Rack Squat', sets: 3, reps: 6, restSeconds: 60, instructions: 'Hold kettlebell in rack position. Squat down.', safetyTip: 'Keep core tight.' },
          { name: 'Snatch', sets: 3, reps: 5, restSeconds: 60, instructions: 'Pull kettlebell from swing to overhead.', safetyTip: 'Punch through at the top.' },
        ],
      },
    },
  });

  const grinder = await prisma.workout.upsert({
    where: { id: 'grinder-advanced-003' },
    update: {},
    create: {
      id: 'grinder-advanced-003',
      title: 'The Grinder (Advanced)',
      description: 'An advanced high-volume workout for experienced kettlebell athletes.',
      level: 'ADVANCED',
      durationMinutes: 45,
      exercises: {
        create: [
          { name: 'Turkish Get-Up', sets: 3, reps: 3, restSeconds: 90, instructions: 'Lie down, press kettlebell up. Stand up step by step.', safetyTip: 'Keep eyes on the bell.' },
          { name: 'Double Clean & Press', sets: 4, reps: 5, restSeconds: 60, instructions: 'Clean two kettlebells to rack. Press both overhead.', safetyTip: 'Keep wrists straight.' },
          { name: 'Double Front Squat', sets: 4, reps: 5, restSeconds: 60, instructions: 'Two kettlebells in rack position. Squat deep.', safetyTip: 'Keep chest up.' },
          { name: 'High-Rep Snatch', sets: 3, reps: 15, restSeconds: 90, instructions: 'Snatch kettlebell overhead. Switch hands each rep.', safetyTip: 'Do not sacrifice form.' },
        ],
      },
    },
  });

  console.log(`✅ Workouts created: ${foundation.title}, ${flow.title}, ${grinder.title}`);

  await prisma.workoutSession.create({
    data: { userId: user.id, workoutId: foundation.id, completed: true, finishedAt: new Date() },
  });

  console.log(`✅ Test session created for ${user.name}`);
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });