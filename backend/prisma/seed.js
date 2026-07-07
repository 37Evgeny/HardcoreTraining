const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Наполнение базы гиревых комплексов...');

  // Очищаем БД
  await prisma.workoutSession.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.workout.deleteMany();

  // ================================================================
  // 1. МИНОТАВР 300
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Минотавр 300',
      description: 'Легендарный российский комплекс на выносливость. 300 повторений: 100 махов + 100 взятий + 100 жимов. Испытание духа и тела.',
      level: 'ADVANCED',
      durationMinutes: 30,
      exercises: {
        create: [
          {
            name: 'Мах гири двумя руками',
            sets: 5,
            reps: 20,
            restSeconds: 30,
            instructions: '100 махов. Мощное движение бёдрами, гиря летит до уровня глаз.',
            safetyTip: 'Не сгибай поясницу. Работают бёдра и ягодицы, а не спина.'
          },
          {
            name: 'Взятие на грудь (Clean)',
            sets: 5,
            reps: 20,
            restSeconds: 30,
            instructions: '100 взятий на грудь. Чередуй руки каждые 10 повторений.',
            safetyTip: 'Гиря должна мягко лечь на предплечье, не бей по запястью.'
          },
          {
            name: 'Жим гири стоя (Press)',
            sets: 5,
            reps: 20,
            restSeconds: 60,
            instructions: '100 жимов. Чередуй руки. Выдох на усилии.',
            safetyTip: 'Не прогибай поясницу. Сожми ягодицы и пресс.'
          }
        ]
      }
    }
  });

  // ================================================================
  // 2. ПРОСТО И ГРОЗНО (Simple & Sinister)
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Просто и Грозно (Simple & Sinister)',
      description: 'Базовая программа Павла Цацулина. Цель: 100 махов за 5 минут + 10 турецких подъёмов за 10 минут. Основа гиревого спорта.',
      level: 'BEGINNER',
      durationMinutes: 20,
      exercises: {
        create: [
          {
            name: 'Мах гири двумя руками',
            sets: 10,
            reps: 10,
            restSeconds: 30,
            instructions: '100 махов. Вдох внизу, мощный выдох в верхней точке. Хлыстовое движение тазом.',
            safetyTip: 'Представь, что ты хочешь захлопнуть дверцу шкафа ягодицами.'
          },
          {
            name: 'Турецкий подъём (Turkish Get-Up)',
            sets: 5,
            reps: 1,
            restSeconds: 60,
            instructions: 'По 1 повторению на сторону. Медленно, контролируемо. Глазами следи за гирей.',
            safetyTip: 'Если теряешь равновесие — брось гирю, а не ломай плечо.'
          }
        ]
      }
    }
  });

  // ================================================================
  // 3. БРОНЕВОЙ КОМПЛЕКС (Armor Building Complex / ABC)
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Броневой комплекс (ABC)',
      description: 'Классический силовой комплекс Дэна Джона и Джеффа Нойперта. 2 взятия → 1 жим → 3 приседа. Одно повторение = 6 движений.',
      level: 'INTERMEDIATE',
      durationMinutes: 30,
      exercises: {
        create: [
          {
            name: 'Взятие на грудь (Clean)',
            sets: 5,
            reps: 2,
            restSeconds: 0,
            instructions: '2 взятия на грудь. Резкое движение бёдрами, гиря встаёт на предплечье.',
            safetyTip: 'Не отбивай гирю о руку. Встречай её корпусом.'
          },
          {
            name: 'Жим гири стоя (Press)',
            sets: 5,
            reps: 1,
            restSeconds: 0,
            instructions: '1 жим после взятия. Мощный выдох в верхней точке.',
            safetyTip: 'Не заваливай корпус назад. Держи пресс в напряжении.'
          },
          {
            name: 'Фронтальный присед (Front Squat)',
            sets: 5,
            reps: 3,
            restSeconds: 60,
            instructions: '3 глубоких приседа с гирей на груди. Локти смотрят вниз-вперёд.',
            safetyTip: 'Колени не уходят внутрь. Пятки прижаты к полу.'
          }
        ]
      }
    }
  });

  // ================================================================
  // 4. СУХОЙ БОЕВОЙ ВЕС (Dry Fighting Weight / DFW)
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Сухой боевой вес (DFW)',
      description: 'Программа Джеффа Нойперта. Clean & Press + Front Squat. Каждую минуту — новый раунд. 30 минут ада.',
      level: 'INTERMEDIATE',
      durationMinutes: 30,
      exercises: {
        create: [
          {
            name: 'Clean & Press',
            sets: 15,
            reps: 1,
            restSeconds: 0,
            instructions: '1 Clean + 1 Press на каждую минуту. Чередуй руки. 30 минут = 30 повторений на руку.',
            safetyTip: 'Выбирай вес, с которым сможешь работать все 30 минут без остановки.'
          },
          {
            name: 'Фронтальный присед (Front Squat)',
            sets: 15,
            reps: 2,
            restSeconds: 0,
            instructions: '2 приседа после каждого Press. Глубоко, гиря на груди.',
            safetyTip: 'Не отрывай пятки. Держи грудь вверх.'
          }
        ]
      }
    }
  });

  // ================================================================
  // 5. ГИГАНТ (The Giant)
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Гигант (The Giant)',
      description: 'Программа Джеффа Нойперта только из Clean & Press. 30 минут. Цель — максимальное количество раундов.',
      level: 'ADVANCED',
      durationMinutes: 30,
      exercises: {
        create: [
          {
            name: 'Clean & Press (Гигант)',
            sets: 1,
            reps: 5,
            restSeconds: 0,
            instructions: '5 Clean & Press на каждую минуту. 30 минут без остановки. Считай общее количество повторений.',
            safetyTip: 'Не жертвуй техникой ради скорости. При усталости — снизь темп, но сохраняй форму.'
          }
        ]
      }
    }
  });

  // ================================================================
  // 6. КОНДИЦИОНИРОВАНИЕ ВИКИНГА (Viking Warrior Conditioning)
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Кондиционирование викинга',
      description: 'Интервальная программа Кеннета Джея на рывок. 15 сек работы / 15 сек отдыха. 20-40 минут чистого ада.',
      level: 'ADVANCED',
      durationMinutes: 30,
      exercises: {
        create: [
          {
            name: 'Рывок гири (Snatch)',
            sets: 60,
            reps: 1,
            restSeconds: 15,
            instructions: 'Рывок гири. 15 секунд работы — 15 секунд отдыха. Чередуй руки каждые 15 сек.',
            safetyTip: 'Рука в верхней точке прямая. Не делай рывок на согнутой руке — убьёшь трицепс.'
          }
        ]
      }
    }
  });

  // ================================================================
  // 7. ЧЕЛЛЕНДЖ 10 000 МАХОВ (10,000 Swing Challenge)
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Челлендж 10 000 махов',
      description: 'Программа Дэна Джона. 500 махов в день, 5 дней в неделю, 4 недели. Итого 10 000 махов. Проверка характера.',
      level: 'INTERMEDIATE',
      durationMinutes: 25,
      exercises: {
        create: [
          {
            name: 'Мах двумя руками',
            sets: 25,
            reps: 10,
            restSeconds: 30,
            instructions: '10 махов → 15 сек отдых → 10 махов. 25 раз = 250 махов. Потом ещё 250 одной рукой.',
            safetyTip: 'Если чувствуешь боль в пояснице — остановись. Техника превыше всего.'
          },
          {
            name: 'Мах одной рукой (левая)',
            sets: 25,
            reps: 5,
            restSeconds: 15,
            instructions: '5 махов левой рукой. Чередуй с правой. Всего 250 на каждую руку.',
            safetyTip: 'Не скручивай корпус. Гиря идёт строго по центру.'
          },
          {
            name: 'Мах одной рукой (правая)',
            sets: 25,
            reps: 5,
            restSeconds: 15,
            instructions: '5 махов правой рукой.',
            safetyTip: 'Плечо не поднимается к уху. Расслабь шею.'
          }
        ]
      }
    }
  });

  // ================================================================
  // 8. ОБРЯД ПОСВЯЩЕНИЯ (Right of Passage)
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Обряд посвящения (Right of Passage)',
      description: 'Программа Павла Цацулина для жима гири. Лестница 1-2-3-4-5 повторений + махи + подтягивания. Стань мужчиной.',
      level: 'ADVANCED',
      durationMinutes: 45,
      exercises: {
        create: [
          {
            name: 'Clean & Press (лестница)',
            sets: 5,
            reps: 5,
            restSeconds: 90,
            instructions: 'Лестница: 1-2-3-4-5 повторений. После 5 — сброс до 1. Всего 5 лестниц.',
            safetyTip: 'Не делай жим рывком. Контролируй гирю на каждом сантиметре пути.'
          },
          {
            name: 'Мах одной рукой',
            sets: 10,
            reps: 10,
            restSeconds: 30,
            instructions: '10 махов каждой рукой между подходами жима. 100 махов всего.',
            safetyTip: 'Дыши: вдох внизу, выдох в верхней точке.'
          }
        ]
      }
    }
  });

  // ================================================================
  // 9. ГИРЕВЫЕ МЫШЦЫ (Kettlebell Muscle)
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Гиревые мышцы (Kettlebell Muscle)',
      description: 'Программа Джеффа Нойперта для набора массы. Двойные Clean & Press + Front Squat + Snatch. 3 раза в неделю.',
      level: 'ADVANCED',
      durationMinutes: 40,
      exercises: {
        create: [
          {
            name: 'Двойное взятие и жим (Double Clean & Press)',
            sets: 5,
            reps: 5,
            restSeconds: 90,
            instructions: '5 Clean & Press с двумя гирями. Мощное движение бёдрами.',
            safetyTip: 'Не отбивай гири о предплечья. Используй ноги.'
          },
          {
            name: 'Двойной фронтальный присед (Double Front Squat)',
            sets: 5,
            reps: 5,
            restSeconds: 90,
            instructions: '5 приседов с двумя гирями на груди. Максимальная глубина.',
            safetyTip: 'Держи грудь вверх. Локти не падают вниз.'
          },
          {
            name: 'Рывок гири (Snatch)',
            sets: 5,
            reps: 10,
            restSeconds: 60,
            instructions: '10 рывков каждой рукой. Быстро, мощно, взрывно.',
            safetyTip: 'Расслабляй руку в верхней точке. Не держись за гирю мёртвой хваткой.'
          }
        ]
      }
    }
  });

  // ================================================================
  // 10. КОМПЛЕКС ПОЛНОГО НАПРЯЖЕНИЯ (Total Tension Complex)
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Комплекс полного напряжения',
      description: 'Комплекс Павла Цацулина. Тяга → Взятие → Присед → Жим → Присед → Взятие → Тяга. Всё тело в напряжении.',
      level: 'INTERMEDIATE',
      durationMinutes: 20,
      exercises: {
        create: [
          {
            name: 'Тяга гири (Deadlift)',
            sets: 5,
            reps: 1,
            restSeconds: 0,
            instructions: '1 тяга с пола. Напряги всё тело как струну.',
            safetyTip: 'Спина прямая. Начинай движение бёдрами.'
          },
          {
            name: 'Взятие на грудь (Clean)',
            sets: 5,
            reps: 1,
            restSeconds: 0,
            instructions: '1 взятие на грудь. Короткое, резкое движение.',
            safetyTip: 'Короткое, резкое движение бёдрами.'
          },
          {
            name: 'Фронтальный присед (Front Squat)',
            sets: 5,
            reps: 1,
            restSeconds: 0,
            instructions: '1 глубокий присед.',
            safetyTip: 'Глубоко, но без потери напряжения в корпусе.'
          },
          {
            name: 'Жим гири стоя (Press)',
            sets: 5,
            reps: 1,
            restSeconds: 0,
            instructions: '1 жим вверх. Выдох на усилии.',
            safetyTip: 'Не прогибайся в пояснице.'
          },
          {
            name: 'Фронтальный присед (Front Squat)',
            sets: 5,
            reps: 1,
            restSeconds: 0,
            instructions: '1 присед после жима.',
            safetyTip: 'Гиря на груди, локти вверх.'
          },
          {
            name: 'Взятие на грудь (Clean)',
            sets: 5,
            reps: 1,
            restSeconds: 0,
            instructions: '1 взятие (опускание на грудь).',
            safetyTip: 'Контролируй гирю на всём пути.'
          },
          {
            name: 'Тяга гири (Deadlift)',
            sets: 5,
            reps: 1,
            restSeconds: 90,
            instructions: '1 тяга (опускание на пол). Комплекс завершён.',
            safetyTip: 'Спина прямая до самого пола.'
          }
        ]
      }
    }
  });

  // ================================================================
  // 11. МИНИМАЛЬНАЯ ПРОГРАММА (Program Minimum)
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Минимальная программа (Program Minimum)',
      description: 'Минимальная программа Павла Цацулина. Махи + Турецкий подъём. Каждый день. 4-6 недель. Вход в мир гирь.',
      level: 'BEGINNER',
      durationMinutes: 15,
      exercises: {
        create: [
          {
            name: 'Мах одной рукой',
            sets: 10,
            reps: 10,
            restSeconds: 30,
            instructions: '100 махов (10×10) за 5 минут. Чередуй руки каждые 10 повторений.',
            safetyTip: 'Не гонись за скоростью. Качественные повторения важнее количества.'
          },
          {
            name: 'Турецкий подъём (TGU)',
            sets: 5,
            reps: 1,
            restSeconds: 60,
            instructions: '5 подъёмов на каждую сторону. Медленно, с паузами в каждой фазе.',
            safetyTip: 'Сначала потренируйся без гири, потом с лёгкой, потом с рабочей.'
          }
        ]
      }
    }
  });

  // ================================================================
  // 12. ВОЛК (The Wolf)
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Волк (The Wolf)',
      description: 'Комплекс Джеффа Нойперта. Clean → Press → Squat → Clean → Snatch. 5 раундов на время. Выживает сильнейший.',
      level: 'ADVANCED',
      durationMinutes: 25,
      exercises: {
        create: [
          {
            name: 'Clean',
            sets: 5,
            reps: 2,
            restSeconds: 0,
            instructions: '2 взятия на грудь. Начало комплекса.',
            safetyTip: 'Резкое движение бёдрами.'
          },
          {
            name: 'Press',
            sets: 5,
            reps: 1,
            restSeconds: 0,
            instructions: '1 жим. Мощно.',
            safetyTip: 'Не заваливайся назад.'
          },
          {
            name: 'Front Squat',
            sets: 5,
            reps: 2,
            restSeconds: 0,
            instructions: '2 приседа. Глубоко.',
            safetyTip: 'Колени не уходят внутрь.'
          },
          {
            name: 'Clean',
            sets: 5,
            reps: 1,
            restSeconds: 0,
            instructions: '1 взятие после приседа.',
            safetyTip: 'Не теряй напряжение.'
          },
          {
            name: 'Snatch',
            sets: 5,
            reps: 1,
            restSeconds: 90,
            instructions: '1 рывок. Завершение раунда. Всего 5 раундов.',
            safetyTip: 'Рука прямая в верхней точке.'
          }
        ]
      }
    }
  });

  // ================================================================
  // 13. КОРОЛЕВСКИЙ УБИЙЦА (King Sized Killer)
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Королевский убийца (King Sized Killer)',
      description: 'Экстремальный комплекс Джеффа Нойперта. 10 раундов: 2 Clean → 1 Press → 3 Squat. Вес — максимальный, отдых — минимальный.',
      level: 'ADVANCED',
      durationMinutes: 20,
      exercises: {
        create: [
          {
            name: 'Clean',
            sets: 10,
            reps: 2,
            restSeconds: 0,
            instructions: '2 взятия на грудь. Максимальный вес.',
            safetyTip: 'Используй пояс, если вес большой.'
          },
          {
            name: 'Press',
            sets: 10,
            reps: 1,
            restSeconds: 0,
            instructions: '1 жим. Выложись на полную.',
            safetyTip: 'Не помогай ногами — это жим, не толчок.'
          },
          {
            name: 'Front Squat',
            sets: 10,
            reps: 3,
            restSeconds: 30,
            instructions: '3 приседа. Глубоко. 10 раундов. Отдых между раундами — 30 секунд.',
            safetyTip: 'Если не можешь встать — брось гири в стороны.'
          }
        ]
      }
    }
  });

  // ================================================================
  // 14. СИБИРСКИЙ МОЛОТ
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Сибирский молот',
      description: 'Российский комплекс на силу и выносливость. Махи → Рывок → Присед → Жим. 10 раундов без отдыха.',
      level: 'INTERMEDIATE',
      durationMinutes: 25,
      exercises: {
        create: [
          {
            name: 'Мах гири',
            sets: 10,
            reps: 10,
            restSeconds: 0,
            instructions: '10 махов. Разогрев и зарядка.',
            safetyTip: 'Дыши ритмично.'
          },
          {
            name: 'Рывок гири (Snatch)',
            sets: 10,
            reps: 5,
            restSeconds: 0,
            instructions: '5 рывков каждой рукой.',
            safetyTip: 'Не перенапрягай кисть.'
          },
          {
            name: 'Присед с гирей на груди',
            sets: 10,
            reps: 5,
            restSeconds: 0,
            instructions: '5 глубоких приседов.',
            safetyTip: 'Колени не выходят за носки.'
          },
          {
            name: 'Жим гири стоя',
            sets: 10,
            reps: 5,
            restSeconds: 30,
            instructions: '5 жимов. 10 раундов. Отдых 30 сек между раундами.',
            safetyTip: 'Последние раунды — проверка характера.'
          }
        ]
      }
    }
  });

  // ================================================================
  // 15. РУССКИЙ БОГАТЫРЬ
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Русский богатырь',
      description: 'Комплекс для истинных витязей. Тяга → Мах → Взятие → Присед → Жим → Рывок. 5 раундов. Покажи свою силу.',
      level: 'INTERMEDIATE',
      durationMinutes: 30,
      exercises: {
        create: [
          {
            name: 'Тяга гири (Deadlift)',
            sets: 5,
            reps: 5,
            restSeconds: 0,
            instructions: '5 тяг с пола. Начало богатырского пути.',
            safetyTip: 'Спина прямая, взгляд вперёд.'
          },
          {
            name: 'Мах гири',
            sets: 5,
            reps: 10,
            restSeconds: 0,
            instructions: '10 махов. Набирай обороты.',
            safetyTip: 'Работают бёдра.'
          },
          {
            name: 'Взятие на грудь (Clean)',
            sets: 5,
            reps: 5,
            restSeconds: 0,
            instructions: '5 взятий на каждую руку.',
            safetyTip: 'Мягкая встреча гири.'
          },
          {
            name: 'Фронтальный присед',
            sets: 5,
            reps: 5,
            restSeconds: 0,
            instructions: '5 глубоких приседов.',
            safetyTip: 'Локти вверх.'
          },
          {
            name: 'Жим гири стоя',
            sets: 5,
            reps: 5,
            restSeconds: 0,
            instructions: '5 жимов. Выдох на каждом.',
            safetyTip: 'Пресс напряжён.'
          },
          {
            name: 'Рывок гири (Snatch)',
            sets: 5,
            reps: 5,
            restSeconds: 90,
            instructions: '5 рывков каждой рукой. 5 раундов. Отдых 90 сек.',
            safetyTip: 'Финиш — ты богатырь!'
          }
        ]
      }
    }
  });

  // ================================================================
  // 16. КРЕМЛЁВСКИЙ ЖИМ
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Кремлёвский жим',
      description: 'Российский комплекс на жим гири. Лестница 1-2-3-4-5-6-7-8-9-10 повторений. Сброс до 1. Кремль не сдаётся.',
      level: 'ADVANCED',
      durationMinutes: 40,
      exercises: {
        create: [
          {
            name: 'Жим гири стоя (лестница)',
            sets: 10,
            reps: 10,
            restSeconds: 60,
            instructions: 'Лестница: 1 жим → отдых → 2 жима → отдых → ... → 10 жимов. Потом сброс до 1. Повторить 3 раза.',
            safetyTip: 'Последние повторения — на ментальной силе. Не бросай гирю.'
          },
          {
            name: 'Мах гири (восстановление)',
            sets: 10,
            reps: 10,
            restSeconds: 0,
            instructions: '10 махов между подходами жима для восстановления дыхания.',
            safetyTip: 'Используй махи как активный отдых.'
          }
        ]
      }
    }
  });

  // ================================================================
  // 17. МЕДВЕЖИЙ КОМПЛЕКС (Bear Complex)
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Медвежий комплекс (Bear Complex)',
      description: 'Классический кроссфит-комплекс с гирей. Clean → Squat → Press → Squat → Clean. 5 раундов. Проснись и рычи.',
      level: 'INTERMEDIATE',
      durationMinutes: 20,
      exercises: {
        create: [
          {
            name: 'Clean',
            sets: 5,
            reps: 1,
            restSeconds: 0,
            instructions: '1 взятие на грудь.',
            safetyTip: 'Резко, мощно.'
          },
          {
            name: 'Front Squat',
            sets: 5,
            reps: 2,
            restSeconds: 0,
            instructions: '2 приседа.',
            safetyTip: 'Глубоко.'
          },
          {
            name: 'Press',
            sets: 5,
            reps: 1,
            restSeconds: 0,
            instructions: '1 жим.',
            safetyTip: 'Выдох.'
          },
          {
            name: 'Front Squat',
            sets: 5,
            reps: 2,
            restSeconds: 0,
            instructions: '2 приседа после жима.',
            safetyTip: 'Не падай.'
          },
          {
            name: 'Clean',
            sets: 5,
            reps: 1,
            restSeconds: 90,
            instructions: '1 взятие (опускание). 5 раундов. Отдых 90 сек.',
            safetyTip: 'Ты — медведь. Рычи!'
          }
        ]
      }
    }
  });

  // ================================================================
  // 18. ПИРАМИДА (The Pyramid)
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Пирамида (The Pyramid)',
      description: 'Классическая пирамида: 1-2-3-4-5-4-3-2-1 повторений. Clean & Press + Snatch. Восхождение на вершину.',
      level: 'INTERMEDIATE',
      durationMinutes: 25,
      exercises: {
        create: [
          {
            name: 'Clean & Press (пирамида)',
            sets: 9,
            reps: 5,
            restSeconds: 30,
            instructions: '1 Clean & Press → отдых → 2 → отдых → 3 → 4 → 5 → 4 → 3 → 2 → 1. Всего 25 повторений.',
            safetyTip: 'На пике (5 повторений) не форсируй. Контролируй технику.'
          },
          {
            name: 'Рывок гири (пирамида)',
            sets: 9,
            reps: 5,
            restSeconds: 30,
            instructions: 'Та же пирамида на рывок. 1-2-3-4-5-4-3-2-1 рывков каждой рукой.',
            safetyTip: 'На спуске пирамиды не расслабляйся. Концентрация до конца.'
          }
        ]
      }
    }
  });

  // ================================================================
  // 19. ТРОЙНОЙ УДАР (Triple Threat)
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Тройной удар (Triple Threat)',
      description: 'Три упражнения, три круга ада. Мах → Рывок → Присед. 3 раунда на максимальное количество повторений за 3 минуты.',
      level: 'INTERMEDIATE',
      durationMinutes: 15,
      exercises: {
        create: [
          {
            name: 'Мах гири',
            sets: 3,
            reps: 20,
            restSeconds: 0,
            instructions: 'Максимум махов за 1 минуту. Считай повторения.',
            safetyTip: 'Не жертвуй амплитудой ради скорости.'
          },
          {
            name: 'Рывок гири',
            sets: 3,
            reps: 10,
            restSeconds: 0,
            instructions: 'Максимум рывков за 1 минуту. Чередуй руки.',
            safetyTip: 'Дыши! Не задерживай дыхание.'
          },
          {
            name: 'Присед с гирей',
            sets: 3,
            reps: 15,
            restSeconds: 60,
            instructions: 'Максимум приседов за 1 минуту. 3 раунда. Отдых 1 минута между раундами.',
            safetyTip: 'Ноги горят — это нормально. Терпи.'
          }
        ]
      }
    }
  });

  // ================================================================
  // 20. ЯРОСЛАВСКИЙ РЫВОК
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Ярославский рывок',
      description: 'Российский комплекс из Ярославля. Только рывок. 10 минут одной рукой, 10 минут другой. Кто дольше — тот сильнее.',
      level: 'ADVANCED',
      durationMinutes: 20,
      exercises: {
        create: [
          {
            name: 'Рывок гири (левая рука)',
            sets: 1,
            reps: 100,
            restSeconds: 0,
            instructions: '10 минут непрерывных рывков левой рукой. Цель — 100+ повторений.',
            safetyTip: 'Меняй хват, если мозоли. Используй магнезию.'
          },
          {
            name: 'Рывок гири (правая рука)',
            sets: 1,
            reps: 100,
            restSeconds: 0,
            instructions: '10 минут непрерывных рывков правой рукой. Цель — 100+ повторений.',
            safetyTip: 'Не опускай гирю на пол до конца сета.'
          }
        ]
      }
    }
  });

  // ================================================================
  // 21. УРАЛЬСКИЙ МОЛОТ
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Уральский молот',
      description: 'Тяжёлый уральский комплекс. Тяга → Мах → Clean → Присед → Жим → Рывок → Мах. 7 упражнений, 3 раунда. Куй железо, пока горячо.',
      level: 'ADVANCED',
      durationMinutes: 35,
      exercises: {
        create: [
          {
            name: 'Тяга гири',
            sets: 3,
            reps: 5,
            restSeconds: 0,
            instructions: '5 тяг. Начало.',
            safetyTip: 'Спина.'
          },
          {
            name: 'Мах гири',
            sets: 3,
            reps: 10,
            restSeconds: 0,
            instructions: '10 махов.',
            safetyTip: 'Бёдра.'
          },
          {
            name: 'Clean',
            sets: 3,
            reps: 5,
            restSeconds: 0,
            instructions: '5 взятий.',
            safetyTip: 'Резко.'
          },
          {
            name: 'Front Squat',
            sets: 3,
            reps: 5,
            restSeconds: 0,
            instructions: '5 приседов.',
            safetyTip: 'Глубоко.'
          },
          {
            name: 'Press',
            sets: 3,
            reps: 5,
            restSeconds: 0,
            instructions: '5 жимов.',
            safetyTip: 'Выдох.'
          },
          {
            name: 'Snatch',
            sets: 3,
            reps: 5,
            restSeconds: 0,
            instructions: '5 рывков.',
            safetyTip: 'Рука прямая.'
          },
          {
            name: 'Мах гири',
            sets: 3,
            reps: 10,
            restSeconds: 120,
            instructions: '10 махов. Финиш раунда. 3 раунда. Отдых 2 минуты.',
            safetyTip: 'Урал — опора державы. Ты — опора своей семьи.'
          }
        ]
      }
    }
  });

  // ================================================================
  // 22. ГИРЕВАЯ КАРУСЕЛЬ
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Гиревая карусель',
      description: 'Круговой комплекс. 5 упражнений, 5 кругов. Мах → Clean → Press → Присед → Рывок. Крутись как белка в колесе.',
      level: 'BEGINNER',
      durationMinutes: 25,
      exercises: {
        create: [
          {
            name: 'Мах гири',
            sets: 5,
            reps: 15,
            restSeconds: 0,
            instructions: '15 махов. Разгоняем карусель.',
            safetyTip: 'Ритмичное дыхание.'
          },
          {
            name: 'Clean',
            sets: 5,
            reps: 5,
            restSeconds: 0,
            instructions: '5 взятий на каждую руку.',
            safetyTip: 'Не торопись.'
          },
          {
            name: 'Press',
            sets: 5,
            reps: 5,
            restSeconds: 0,
            instructions: '5 жимов.',
            safetyTip: 'Контроль.'
          },
          {
            name: 'Front Squat',
            sets: 5,
            reps: 5,
            restSeconds: 0,
            instructions: '5 приседов.',
            safetyTip: 'Глубина.'
          },
          {
            name: 'Snatch',
            sets: 5,
            reps: 5,
            restSeconds: 60,
            instructions: '5 рывков. 5 кругов. Отдых 1 минута.',
            safetyTip: 'Карусель остановилась — ты молодец!'
          }
        ]
      }
    }
  });

  // ================================================================
  // 23. БОГАТЫРСКИЕ ЗАБАВЫ
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Богатырские забавы',
      description: 'Игровой комплекс для разминки и тонуса. Лёгкие упражнения, высокое настроение. Для всей семьи.',
      level: 'BEGINNER',
      durationMinutes: 15,
      exercises: {
        create: [
          {
            name: 'Мах гири (игривый)',
            sets: 3,
            reps: 10,
            restSeconds: 30,
            instructions: '10 весёлых махов. Представь, что ты отбиваешь мяч.',
            safetyTip: 'Улыбайся! Это помогает расслабить шею.'
          },
          {
            name: 'Присед с гирей (гусиный шаг)',
            sets: 3,
            reps: 8,
            restSeconds: 30,
            instructions: '8 приседов. Представь, что ты гусак, который приседает.',
            safetyTip: 'Колени не болят, когда техника правильная.'
          },
          {
            name: 'Жим гири (царский)',
            sets: 3,
            reps: 8,
            restSeconds: 30,
            instructions: '8 жимов. Ты — царь, поднимающий скипетр.',
            safetyTip: 'Царская осанка — спина прямая.'
          }
        ]
      }
    }
  });

  // ================================================================
  // 24. СИБИРСКИЙ ЦИРКУЛЬ
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Сибирский циркуль',
      description: 'Комплекс на растяжку и мобильность с гирей. Круговые движения, наклоны, повороты. Готовит тело к тяжёлой работе.',
      level: 'BEGINNER',
      durationMinutes: 15,
      exercises: {
        create: [
          {
            name: 'Круговые махи гирей',
            sets: 3,
            reps: 10,
            restSeconds: 30,
            instructions: '10 круговых махов вокруг головы. Разогрев плечевого пояса.',
            safetyTip: 'Не бей себя гирей по голове. Шутка. Но будь осторожен.'
          },
          {
            name: 'Наклоны с гирей (мельница)',
            sets: 3,
            reps: 8,
            restSeconds: 30,
            instructions: '8 наклонов в стороны с гирей в вытянутой руке.',
            safetyTip: 'Не торопись. Чувствуй растяжение.'
          },
          {
            name: 'Повороты корпуса с гирей',
            sets: 3,
            reps: 10,
            restSeconds: 30,
            instructions: '10 поворотов корпуса с гирей на вытянутых руках.',
            safetyTip: 'Таз неподвижен. Работает только верх тела.'
          }
        ]
      }
    }
  });

  // ================================================================
  // 25. ГИРЕВОЙ БОЙ (Kettlebell Fight)
  // ================================================================
  await prisma.workout.create({
    data: {
      title: 'Гиревой бой',
      description: 'Интервальный комплекс на выносливость. 3 минуты работы — 1 минута отдыха. 5 раундов. Как бой в клетке.',
      level: 'ADVANCED',
      durationMinutes: 25,
      exercises: {
        create: [
          {
            name: 'Мах гири (раунд 1)',
            sets: 5,
            reps: 20,
            restSeconds: 0,
            instructions: '20 махов. Первый раунд. Разогрев перед боем.',
            safetyTip: 'Экономь силы. Бой только начинается.'
          },
          {
            name: 'Clean & Press (раунд 2)',
            sets: 5,
            reps: 10,
            restSeconds: 0,
            instructions: '10 Clean & Press. Второй раунд. Наращивай темп.',
            safetyTip: 'Дыши носом, выдыхай ртом.'
          },
          {
            name: 'Snatch (раунд 3)',
            sets: 5,
            reps: 10,
            restSeconds: 0,
            instructions: '10 рывков каждой рукой. Третий раунд. Кульминация.',
            safetyTip: 'Не сдавайся. Ты — воин.'
          },
          {
            name: 'Front Squat (раунд 4)',
            sets: 5,
            reps: 10,
            restSeconds: 0,
            instructions: '10 приседов. Четвёртый раунд. Ноги горят.',
            safetyTip: 'Терпи. Остался один раунд.'
          },
          {
            name: 'Мах гири (раунд 5)',
            sets: 5,
            reps: 20,
            restSeconds: 60,
            instructions: '20 махов. Финальный раунд. Выложись до конца!',
            safetyTip: 'Победа! Ты выжил в гиревом бою!'
          }
        ]
      }
    }
  });

  console.log('========================================');
  console.log('✅ База данных наполнена!');
  console.log('📊 Всего комплексов: 25');
  console.log('📊 Уровни сложности:');
  console.log('   🟢 BEGINNER   — 5 комплексов');
  console.log('   🟡 INTERMEDIATE — 9 комплексов');
  console.log('   🔴 ADVANCED   — 11 комплексов');
  console.log('========================================');
  console.log('🏆 Легендарные комплексы:');
  console.log('   1. Минотавр 300');
  console.log('   2. Просто и Грозно (Simple & Sinister)');
  console.log('   3. Броневой комплекс (ABC)');
  console.log('   4. Сухой боевой вес (DFW)');
  console.log('   5. Гигант (The Giant)');
  console.log('   6. Кондиционирование викинга');
  console.log('   7. Челлендж 10 000 махов');
  console.log('   8. Обряд посвящения (ROP)');
  console.log('   9. Гиревые мышцы');
  console.log('   10. Комплекс полного напряжения');
  console.log('   11. Минимальная программа');
  console.log('   12. Волк (The Wolf)');
  console.log('   13. Королевский убийца');
  console.log('   14. Сибирский молот');
  console.log('   15. Русский богатырь');
  console.log('   16. Кремлёвский жим');
  console.log('   17. Медвежий комплекс');
  console.log('   18. Пирамида');
  console.log('   19. Тройной удар');
  console.log('   20. Ярославский рывок');
  console.log('   21. Уральский молот');
  console.log('   22. Гиревая карусель');
  console.log('   23. Богатырские забавы');
  console.log('   24. Сибирский циркуль');
  console.log('   25. Гиревой бой');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка заполнения базы:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });