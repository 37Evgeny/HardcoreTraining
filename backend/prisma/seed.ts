import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with kettlebell complexes...')

  // --- Complex 1: Beginner ---
  const beginner = await prisma.workout.create({
    data: {
      name: 'The Foundation (Beginner)',
      description: 'Ideal for learning proper form and building a base of strength.',
      level: 'BEGINNER',
      durationMinutes: 30,
      exercises: {
        create: [
          {
            name: 'Goblet Squat',
            sets: 3,
            reps: 12,
            restSeconds: 60,
            instructions: 'Hold the KB at chest height. Squat down keeping your back straight. Drive up through heels.',
            safetyTip: 'Keep your chest up and don\'t let your knees cave inward.'
          },
          {
            name: 'Two-Handed Swing',
            sets: 3,
            reps: 15,
            restSeconds: 60,
            instructions: 'Hinge at the hips and swing the bell to eye level. Use your hips, not your arms.',
            safetyTip: 'Do not use your lower back to swing. Snap your hips forward.'
          },
          {
            name: 'Overhead Press',
            sets: 3,
            reps: 10,
            restSeconds: 60,
            instructions: 'Press the bell from shoulder to full extension. Squeeze glutes.',
            safetyTip: 'Don\'t arch your lower back. Keep your core tight.'
          }
        ]
      }
    }
  })

  // --- Complex 2: Intermediate ---
  const intermediate = await prisma.workout.create({
    data: {
      name: 'The Flow (Intermediate)',
      description: 'Focus on coordination, endurance, and fluid movement.',
      level: 'INTERMEDIATE',
      durationMinutes: 45,
      exercises: {
        create: [
          {
            name: 'Turkish Get-Up',
            sets: 3,
            reps: 5, // per side
            restSeconds: 90,
            instructions: 'Lie on back, press bell up, and stand up while keeping eyes on the bell.',
            safetyTip: 'Move slowly. If you lose balance, drop the bell, not your form.'
          },
          {
            name: 'Clean and Press',
            sets: 4,
            reps: 8, // per side
            restSeconds: 60,
            instructions: 'Clean the bell to rack position, then press overhead.',
            safetyTip: 'Catch the bell on your forearm, not just your wrist.'
          },
          {
            name: 'Snatch',
            sets: 4,
            reps: 5, // per side
            restSeconds: 60,
            instructions: 'Swing the bell and catch it overhead in one fluid motion.',
            safetyTip: 'Keep the bell close to your body. Snap hips and pull down with the arm.'
          }
        ]
      }
    }
  })

  // --- Complex 3: Advanced ---
  const advanced = await prisma.workout.create({
    data: {
      name: 'The Grinder (Advanced)',
      description: 'High intensity, heavy loads, and mental toughness.',
      level: 'ADVANCED',
      durationMinutes: 60,
      exercises: {
        create: [
          {
            name: 'Long Cycle (Bent Press)',
            sets: 3,
            reps: 6, // per side
            restSeconds: 120,
            instructions: 'Bend sideways to touch the floor, return to center, press overhead.',
            safetyTip: 'Keep the arm holding the bell straight. Rotate from the hips.'
          },
          {
            name: 'Windmills',
            sets: 3,
            reps: 10, // per side
            restSeconds: 60,
            instructions: 'Press bell up, hinge sideways to touch opposite hand to floor.',
            safetyTip: 'Look at the bell the entire time. Keep the pressing arm vertical.'
          },
          {
            name: 'Pistol Squat (with KB)',
            sets: 3,
            reps: 5, // per side
            restSeconds: 90,
            instructions: 'Squat on one leg while holding a KB for counterbalance.',
            safetyTip: 'Use a box for depth assistance if needed. Keep the heel flat.'
          }
        ]
      }
    }
  })

  console.log(`✅ Seeded ${3} workouts with ${3 * 3} exercises.`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
