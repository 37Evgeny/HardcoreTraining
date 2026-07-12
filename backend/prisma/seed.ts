import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Массив из 30 тренировок с гирей.
 * 10 BEGINNER + 10 INTERMEDIATE + 10 ADVANCED
 */
const workouts = [
  // ==================== BEGINNER (10) ====================
  {
    id: 'foundation-beginner-001',
    title: 'Основы маха гирей',
    description: 'Идеальная тренировка для новичков. Освоение базового движения — маха гирей двумя руками. Развивает взрывную силу бедер и выносливость.',
    level: 'BEGINNER',
    durationMinutes: 20,
    exercises: [
      { name: 'Махи гирей двумя руками', sets: 5, reps: 15, restSeconds: 60, instructions: 'Встаньте прямо, ноги на ширине плеч. Возьмите гирю двумя руками. Отведите таз назад, слегка согните колени. Взрывным движением бедер вытолкните гирю вперед и вверх до уровня груди. Контролируйте опускание.', safetyTip: 'Держите спину прямой на протяжении всего движения. Не округляйте поясницу.' },
      { name: 'Приседания с гирей у груди', sets: 3, reps: 12, restSeconds: 60, instructions: 'Держите гирю у груди обеими руками. Выполните приседание, сохраняя спину прямой. Колени не должны выходить за носки.', safetyTip: 'Держите пятки прижатыми к полу.' },
      { name: 'Тяга гири в наклоне', sets: 3, reps: 10, restSeconds: 45, instructions: 'Поставьте гирю перед собой. Наклонитесь, сохраняя спину прямой. Одной рукой тяните гирю к поясу, локоть идет вдоль корпуса.', safetyTip: 'Не скручивайте корпус во время тяги.' },
    ],
  },
  {
    id: 'beginner-flow-002',
    title: 'Поток для начинающих',
    description: 'Плавный переход между упражнениями для развития координации и общей физической подготовки.',
    level: 'BEGINNER',
    durationMinutes: 25,
    exercises: [
      { name: 'Махи гирей одной рукой', sets: 4, reps: 10, restSeconds: 45, instructions: 'Возьмите гирю одной рукой. Выполните мах, гиря поднимается до уровня груди. Меняйте руку после каждого подхода.', safetyTip: 'Контролируйте гирю на всем протяжении движения.' },
      { name: 'Мельница с гирей', sets: 3, reps: 8, restSeconds: 60, instructions: 'Гиря в вытянутой руке над головой. Наклонитесь в сторону, противоположную гире. Свободная рука скользит по ноге вниз.', safetyTip: 'Начинайте с легкого веса. Не форсируйте глубину наклона.' },
      { name: 'Подъем гири на грудь', sets: 4, reps: 8, restSeconds: 45, instructions: 'Из положения стоя гиря между ног. Рывковым движением поднимите гирю к плечу, локоть прижат к корпусу.', safetyTip: 'Не используйте инерцию спины — работайте ногами и бедрами.' },
      { name: 'Казачьи приседания с гирей', sets: 3, reps: 8, restSeconds: 60, instructions: 'Гиря перед грудью. Сделайте широкий шаг в сторону и присядьте на одну ногу, другая прямая. Вернитесь в исходное положение.', safetyTip: 'Держите гирю близко к груди для баланса.' },
    ],
  },
  {
    id: 'beginner-strength-003',
    title: 'Силовая база',
    description: 'Базовые силовые упражнения с гирей для укрепления всего тела. Фокус на правильную технику.',
    level: 'BEGINNER',
    durationMinutes: 30,
    exercises: [
      { name: 'Приседания с гирей на груди', sets: 4, reps: 12, restSeconds: 60, instructions: 'Гиря на уровне груди, локти прижаты к корпусу. Выполните глубокое приседание. Вставая, напрягите ягодицы.', safetyTip: 'Не отрывайте пятки от пола.' },
      { name: 'Румынская тяга с гирей', sets: 4, reps: 12, restSeconds: 60, instructions: 'Гиря в опущенных руках перед собой. Наклонитесь вперед, отводя таз назад, гиря скользит по ногам вниз. Вернитесь в исходное.', safetyTip: 'Держите спину прямой, не округляйте поясницу.' },
      { name: 'Жим гири стоя', sets: 3, reps: 8, restSeconds: 60, instructions: 'Гиря на уровне плеча. Выжмите гирю вверх над головой, локоть полностью выпрямлен. Опустите контролируемо.', safetyTip: 'Напрягите пресс и ягодицы для устойчивости.' },
      { name: 'Тяга гири в наклоне', sets: 3, reps: 10, restSeconds: 45, instructions: 'Наклоните корпус, гиря в опущенной руке. Тяните гирю к поясу, локоть идет назад. Опустите контролируемо.', safetyTip: 'Не скручивайте корпус.' },
    ],
  },
  {
    id: 'beginner-cardio-004',
    title: 'Кардио-взрыв',
    description: 'Динамичная тренировка для сжигания калорий и улучшения работы сердечно-сосудистой системы.',
    level: 'BEGINNER',
    durationMinutes: 20,
    exercises: [
      { name: 'Махи гирей двумя руками', sets: 5, reps: 20, restSeconds: 30, instructions: 'Быстрые махи гирей двумя руками. Работайте бедрами взрывно. Гиря поднимается до уровня груди.', safetyTip: 'Следите за дыханием: выдох на усилии.' },
      { name: 'Дровосек с гирей', sets: 3, reps: 12, restSeconds: 30, instructions: 'Гиря в обеих руках. Из положения стоя поднимите гирю по диагонали над плечом, скручивая корпус. Опустите по той же траектории.', safetyTip: 'Работайте через ноги, а не через поясницу.' },
      { name: 'Берпи с махом гири', sets: 3, reps: 8, restSeconds: 45, instructions: 'Выполните берпи, в прыжке возьмите гирю и сделайте мах двумя руками. Опустите гирю и повторите.', safetyTip: 'При берпи мягко приземляйтесь на полную стопу.' },
    ],
  },
  {
    id: 'beginner-mobility-005',
    title: 'Мобильность и растяжка',
    description: 'Тренировка для улучшения подвижности суставов и растяжки с использованием гири как отягощения.',
    level: 'BEGINNER',
    durationMinutes: 25,
    exercises: [
      { name: 'Глубокие приседания с гирей', sets: 3, reps: 10, restSeconds: 45, instructions: 'Гиря перед собой на вытянутых руках. Медленно присядьте как можно ниже, удерживая гирю перед собой.', safetyTip: 'Пятки на полу, колени следуют за носками.' },
      { name: 'Выпады с гирей над головой', sets: 3, reps: 8, restSeconds: 45, instructions: 'Гиря над головой в вытянутой руке. Выполните выпад вперед, удерживая гирю стабильно над головой.', safetyTip: 'Начните с легкой гири для привыкания.' },
      { name: 'Круговые движения гирей', sets: 3, reps: 10, restSeconds: 30, instructions: 'Гиря в опущенной руке. Делайте круговые движения гирей вокруг корпуса, перекладывая из руки в руку.', safetyTip: 'Держите корпус неподвижным, работают только руки.' },
      { name: 'Растяжка с гирей в выпаде', sets: 2, reps: 8, restSeconds: 45, instructions: 'В положении выпада гиря в опущенной руке со стороны задней ноги. Медленно опускайте таз вниз для растяжки.', safetyTip: 'Не пружиньте — держите статическое напряжение.' },
    ],
  },
  {
    id: 'beginner-circuit-006',
    title: 'Круговая для новичков',
    description: 'Круговая тренировка из 5 упражнений. Выполняйте одно за другим без отдыха. Отдых только после завершения круга.',
    level: 'BEGINNER',
    durationMinutes: 25,
    exercises: [
      { name: 'Махи гирей двумя руками', sets: 3, reps: 15, restSeconds: 0, instructions: 'Взрывные махи гирей. Работа бедрами, не руками.', safetyTip: 'Держите спину прямой.' },
      { name: 'Приседания с гирей', sets: 3, reps: 12, restSeconds: 0, instructions: 'Гиря на груди. Глубокие приседания.', safetyTip: 'Колени за носками не выходят.' },
      { name: 'Тяга гири в наклоне', sets: 3, reps: 10, restSeconds: 0, instructions: 'Поочередно каждой рукой.', safetyTip: 'Локоть вдоль корпуса.' },
      { name: 'Жим гири стоя', sets: 3, reps: 8, restSeconds: 0, instructions: 'Поочередно каждой рукой.', safetyTip: 'Пресс напряжен.' },
      { name: 'Планка с касанием гири', sets: 3, reps: 10, restSeconds: 90, instructions: 'В планке на прямых руках. Касайтесь гири поочередно каждой рукой.', safetyTip: 'Таз не провисает.' },
    ],
  },
  {
    id: 'beginner-swing-007',
    title: 'Махи на выносливость',
    description: 'Тренировка, полностью посвященная королю упражнений с гирей — махам. Разные вариации для всестороннего развития.',
    level: 'BEGINNER',
    durationMinutes: 20,
    exercises: [
      { name: 'Махи двумя руками', sets: 5, reps: 20, restSeconds: 30, instructions: 'Классические махи. Фокус на взрывной работе бедер.', safetyTip: 'Выдох на подъеме гири.' },
      { name: 'Махи одной рукой', sets: 4, reps: 12, restSeconds: 30, instructions: 'По 12 каждой рукой. Контролируйте гирю на спуске.', safetyTip: 'Стопы плотно на полу.' },
      { name: 'Чередование рук', sets: 4, reps: 10, restSeconds: 30, instructions: 'Один мах правой, следующий — левой. Плавная смена рук.', safetyTip: 'Не торопитесь, сохраняйте ритм.' },
      { name: 'Махи с паузой вверху', sets: 3, reps: 8, restSeconds: 45, instructions: 'Задержите гирю на секунду в верхней точке. Контролируемое опускание.', safetyTip: 'Не запрокидывайте голову назад.' },
    ],
  },
  {
    id: 'beginner-core-008',
    title: 'Кор и стабильность',
    description: 'Укрепление мышц кора с использованием гири. Баланс и стабильность — ключ к прогрессу в гиревом спорте.',
    level: 'BEGINNER',
    durationMinutes: 25,
    exercises: [
      { name: 'Русский твист с гирей', sets: 3, reps: 12, restSeconds: 45, instructions: 'Сидя на полу, ноги согнуты. Гиря в руках, поворачивайте корпус в стороны, касаясь гирей пола.', safetyTip: 'Держите спину прямой, не округляйтесь.' },
      { name: 'Подъем ног с гирей', sets: 3, reps: 10, restSeconds: 45, instructions: 'Лежа на спине, гиря за головой в вытянутых руках. Поднимите ноги до угла 90 градусов и опустите.', safetyTip: 'Поясница прижата к полу.' },
      { name: 'Боковая планка с тягой', sets: 3, reps: 8, restSeconds: 45, instructions: 'В боковой планке на предплечье. Свободной рукой тяните гирю к корпусу.', safetyTip: 'Держите таз поднятым.' },
      { name: 'Ситапы с гирей', sets: 3, reps: 10, restSeconds: 45, instructions: 'Гиря на груди. Выполните скручивание корпуса вверх.', safetyTip: 'Шея расслаблена, взгляд в потолок.' },
    ],
  },
  {
    id: 'beginner-press-009',
    title: 'Жимовой день',
    description: 'Тренировка с фокусом на жимовые движения. Укрепление плечевого пояса и рук.',
    level: 'BEGINNER',
    durationMinutes: 25,
    exercises: [
      { name: 'Жим гири стоя', sets: 4, reps: 8, restSeconds: 60, instructions: 'Гиря на уровне плеча. Выжмите вверх, локоть полностью выпрямлен.', safetyTip: 'Не прогибайтесь в пояснице.' },
      { name: 'Жим гири сидя', sets: 3, reps: 8, restSeconds: 60, instructions: 'Сидя на скамье, гиря на плече. Жим вверх с полной амплитудой.', safetyTip: 'Ступни плотно на полу.' },
      { name: 'Армейский жим с гирей', sets: 3, reps: 8, restSeconds: 60, instructions: 'Две гири на плечах. Одновременный жим вверх.', safetyTip: 'Напрягите ягодицы для устойчивости.' },
      { name: 'Жим толчковый', sets: 3, reps: 6, restSeconds: 60, instructions: 'Слегка подсядьте под гирю и вытолкните ее вверх за счет ног. Выпрямите руку.', safetyTip: 'Ноги работают синхронно с руками.' },
    ],
  },
  {
    id: 'beginner-finisher-010',
    title: 'Финальный аккорд',
    description: 'Интенсивная завершающая тренировка для начинающих. Проверьте свои силы перед переходом на средний уровень.',
    level: 'BEGINNER',
    durationMinutes: 20,
    exercises: [
      { name: 'Махи двумя руками', sets: 3, reps: 20, restSeconds: 20, instructions: 'Максимально быстрые махи. Работа на выносливость.', safetyTip: 'Дышите ритмично.' },
      { name: 'Берпи без отжимания', sets: 3, reps: 10, restSeconds: 20, instructions: 'Из положения стоя — упор присев — прыжок вверх.', safetyTip: 'Мягкое приземление.' },
      { name: 'Приседания с гирей', sets: 3, reps: 15, restSeconds: 20, instructions: 'Быстрые приседания с гирей на груди.', safetyTip: 'Колени не сводите.' },
      { name: 'Планка', sets: 3, reps: 30, restSeconds: 30, instructions: 'Удерживайте планку на прямых руках 30 секунд.', safetyTip: 'Тело — прямая линия.' },
    ],
  },

  // ==================== INTERMEDIATE (10) ====================
  {
    id: 'flow-intermediate-001',
    title: 'Поток среднего уровня',
    description: 'Динамичная связка упражнений для развития координации, силы и выносливости. Переходы между движениями без пауз.',
    level: 'INTERMEDIATE',
    durationMinutes: 30,
    exercises: [
      { name: 'Махи гирей одной рукой', sets: 5, reps: 15, restSeconds: 30, instructions: 'По 15 каждой рукой. Взрывные махи с полной амплитудой.', safetyTip: 'Стабилизируйте корпус.' },
      { name: 'Рывок гири', sets: 4, reps: 10, restSeconds: 45, instructions: 'Из положения между ног одним движением поднимите гирю над головой. Локоть блокируется в верхней точке.', safetyTip: 'Не форсируйте вес — техника важнее.' },
      { name: 'Приседания с гирей над головой', sets: 3, reps: 8, restSeconds: 60, instructions: 'Гиря над головой в вытянутой руке. Выполните глубокое приседание, удерживая гирю стабильно.', safetyTip: 'Плечо заблокировано, локоть прямой.' },
      { name: 'Толчок гири', sets: 4, reps: 8, restSeconds: 45, instructions: 'Гиря на груди. Подсядьте и вытолкните гирю вверх. Выпрямите ноги и руку одновременно.', safetyTip: 'Используйте ноги для толчка.' },
    ],
  },
  {
    id: 'intermediate-strength-002',
    title: 'Силовой микс',
    description: 'Комбинация базовых и продвинутых силовых упражнений для развития функциональной силы.',
    level: 'INTERMEDIATE',
    durationMinutes: 35,
    exercises: [
      { name: 'Толчок двух гирь', sets: 4, reps: 8, restSeconds: 60, instructions: 'Две гири на груди. Толчком выжмите их вверх. Опустите контролируемо.', safetyTip: 'Держите локти близко к корпусу.' },
      { name: 'Рывок гири', sets: 4, reps: 12, restSeconds: 45, instructions: 'По 12 каждой рукой. Рывок с полной амплитудой.', safetyTip: 'Не запрокидывайте гирю за голову.' },
      { name: 'Приседания с двумя гирями', sets: 3, reps: 10, restSeconds: 60, instructions: 'Две гири на плечах. Глубокие приседания.', safetyTip: 'Грудь колесом, спина прямая.' },
      { name: 'Тяга гири в наклоне двумя руками', sets: 3, reps: 10, restSeconds: 45, instructions: 'Две гири в опущенных руках. Тяните к животу, сводя лопатки.', safetyTip: 'Не используйте инерцию корпуса.' },
    ],
  },
  {
    id: 'intermediate-cardio-003',
    title: 'Кардио-удар',
    description: 'Высокоинтенсивная тренировка для максимального жиросжигания и развития взрывной выносливости.',
    level: 'INTERMEDIATE',
    durationMinutes: 25,
    exercises: [
      { name: 'Махи гирей двумя руками', sets: 5, reps: 25, restSeconds: 20, instructions: 'Максимально быстрые махи. 25 повторений на время.', safetyTip: 'Сохраняйте технику даже в ускорении.' },
      { name: 'Берпи с рывком гири', sets: 4, reps: 8, restSeconds: 30, instructions: 'Берпи + рывок гири одной рукой. Чередуйте руки.', safetyTip: 'При берпи не касайтесь гирей пола.' },
      { name: 'Толчок гири в темпе', sets: 4, reps: 12, restSeconds: 20, instructions: 'Толчок гири в максимальном темпе. 12 повторений каждой рукой.', safetyTip: 'Следите за дыханием.' },
      { name: 'Махи с прыжком', sets: 3, reps: 10, restSeconds: 30, instructions: 'Мах гирей + прыжок вверх в конце движения. Приземляйтесь мягко.', safetyTip: 'Приземляйтесь на полную стопу.' },
    ],
  },
  {
    id: 'intermediate-technique-004',
    title: 'Технический день',
    description: 'Тренировка с фокусом на отработку сложных элементов гиревого спорта: рывок, толчок, взятие на грудь.',
    level: 'INTERMEDIATE',
    durationMinutes: 35,
    exercises: [
      { name: 'Взятие гири на грудь', sets: 5, reps: 8, restSeconds: 45, instructions: 'Из положения стоя гиря между ног. Рывковым движением возьмите гирю на грудь. Локоть прижат.', safetyTip: 'Работайте бедрами, а не спиной.' },
      { name: 'Рывок гири с паузой', sets: 4, reps: 6, restSeconds: 60, instructions: 'Рывок гири с фиксацией в верхней точке на 2 секунды. Медленное опускание.', safetyTip: 'Плечо заблокировано в верхней точке.' },
      { name: 'Толчок гири с паузой', sets: 4, reps: 6, restSeconds: 60, instructions: 'Толчок с паузой в полуприседе перед фиксацией вверху.', safetyTip: 'Держите гирю близко к корпусу.' },
      { name: 'Опускание гири с груди в мах', sets: 4, reps: 8, restSeconds: 45, instructions: 'С груди опустите гирю между ног и выполните мах. Плавный переход.', safetyTip: 'Контролируйте гирю на всем пути.' },
    ],
  },
  {
    id: 'intermediate-circuit-005',
    title: 'Круговая на выносливость',
    description: 'Интенсивная круговая тренировка. 6 упражнений, 3 круга. Минимум отдыха — максимум работы.',
    level: 'INTERMEDIATE',
    durationMinutes: 30,
    exercises: [
      { name: 'Рывок гири', sets: 3, reps: 10, restSeconds: 0, instructions: '10 рывков каждой рукой.', safetyTip: 'Меняйте руку без отдыха.' },
      { name: 'Приседания с гирей над головой', sets: 3, reps: 8, restSeconds: 0, instructions: 'Гиря над головой, глубокие приседания.', safetyTip: 'Плечо заблокировано.' },
      { name: 'Толчок гири', sets: 3, reps: 10, restSeconds: 0, instructions: '10 толчков каждой рукой.', safetyTip: 'Работа ногами.' },
      { name: 'Тяга гири в наклоне', sets: 3, reps: 10, restSeconds: 0, instructions: 'По 10 каждой рукой.', safetyTip: 'Спина прямая.' },
      { name: 'Махи гирей одной рукой', sets: 3, reps: 15, restSeconds: 0, instructions: 'По 15 каждой рукой.', safetyTip: 'Взрывная работа бедер.' },
      { name: 'Планка с перетаскиванием гири', sets: 3, reps: 6, restSeconds: 90, instructions: 'В планке перетаскивайте гирю из стороны в сторону.', safetyTip: 'Таз не провисает.' },
    ],
  },
  {
    id: 'intermediate-double-006',
    title: 'Работа с двумя гирями',
    description: 'Тренировка с двумя гирями одновременно. Развивает координацию, силу хвата и симметрию развития.',
    level: 'INTERMEDIATE',
    durationMinutes: 30,
    exercises: [
      { name: 'Махи двумя гирями', sets: 4, reps: 12, restSeconds: 45, instructions: 'Две гири между ног. Одновременный мах двумя руками.', safetyTip: 'Держите гири близко друг к другу.' },
      { name: 'Толчок двух гирь', sets: 4, reps: 8, restSeconds: 60, instructions: 'Две гири на груди. Одновременный толчок вверх.', safetyTip: 'Локти прижаты к корпусу.' },
      { name: 'Приседания с двумя гирями на плечах', sets: 3, reps: 8, restSeconds: 60, instructions: 'Гири на плечах. Глубокие приседания.', safetyTip: 'Не наклоняйтесь вперед.' },
      { name: 'Жим двух гирь стоя', sets: 3, reps: 8, restSeconds: 60, instructions: 'Гири на уровне плеч. Одновременный жим вверх.', safetyTip: 'Напрягите пресс.' },
    ],
  },
  {
    id: 'intermediate-ladder-007',
    title: 'Лестница',
    description: 'Тренировка по принципу лестницы: увеличиваете количество повторений с каждым раундом. Проверка характера.',
    level: 'INTERMEDIATE',
    durationMinutes: 30,
    exercises: [
      { name: 'Рывок гири', sets: 5, reps: 5, restSeconds: 30, instructions: 'Раунд 1: 5 повторений. Раунд 2: 6. Раунд 3: 7. Раунд 4: 8. Раунд 5: 9. Каждый раунд +1 повтор.', safetyTip: 'Увеличивайте нагрузку постепенно.' },
      { name: 'Толчок гири', sets: 5, reps: 5, restSeconds: 30, instructions: 'Та же схема лестницы: 5-6-7-8-9 повторений по раундам.', safetyTip: 'Следите за техникой при усталости.' },
      { name: 'Махи гирей', sets: 5, reps: 10, restSeconds: 30, instructions: 'Лестница 10-12-14-16-18 повторений.', safetyTip: 'Дышите ритмично.' },
      { name: 'Приседания с гирей', sets: 5, reps: 5, restSeconds: 30, instructions: 'Лестница 5-6-7-8-9 повторений.', safetyTip: 'Колени не сводите.' },
    ],
  },
  {
    id: 'intermediate-snatch-008',
    title: 'Рывковый марафон',
    description: 'Тренировка, посвященная королевскому упражнению — рывку гири. Различные вариации для мастерства.',
    level: 'INTERMEDIATE',
    durationMinutes: 30,
    exercises: [
      { name: 'Рывок гири', sets: 5, reps: 10, restSeconds: 45, instructions: 'Классический рывок. 10 повторений каждой рукой.', safetyTip: 'Плавное опускание гири.' },
      { name: 'Рывок с паузой внизу', sets: 4, reps: 6, restSeconds: 45, instructions: 'Рывок с фиксацией на 2 секунды в положении между ног перед следующим повторением.', safetyTip: 'Сохраняйте напряжение в корпусе.' },
      { name: 'Рывок с переменой рук', sets: 4, reps: 8, restSeconds: 30, instructions: 'Рывок правой — опускание — перехват — рывок левой. Без остановки.', safetyTip: 'Перехватывайте гирю плавно.' },
      { name: 'Длинный цикл (рывок+толчок)', sets: 3, reps: 6, restSeconds: 60, instructions: 'Рывок + опускание на грудь + толчок. Одно повторение.', safetyTip: 'Сложное движение — будьте внимательны.' },
    ],
  },
  {
    id: 'intermediate-tabata-009',
    title: 'Табата с гирей',
    description: 'Тренировка по протоколу Табата: 20 секунд работы, 10 секунд отдыха. 8 раундов. Максимальная интенсивность.',
    level: 'INTERMEDIATE',
    durationMinutes: 20,
    exercises: [
      { name: 'Махи гирей двумя руками', sets: 8, reps: 8, restSeconds: 10, instructions: 'Табата 20/10. Максимум повторений за 20 секунд.', safetyTip: 'Не жертвуйте техникой ради скорости.' },
      { name: 'Толчок гири', sets: 8, reps: 6, restSeconds: 10, instructions: 'Табата 20/10. Толчок гири одной рукой, чередуйте каждые 2 раунда.', safetyTip: 'Дышите: вдох — опускание, выдох — толчок.' },
      { name: 'Приседания с гирей', sets: 8, reps: 8, restSeconds: 10, instructions: 'Табата 20/10. Быстрые приседания с гирей на груди.', safetyTip: 'Колени следуют за носками.' },
      { name: 'Рывок гири', sets: 8, reps: 6, restSeconds: 10, instructions: 'Табата 20/10. Рывок одной рукой, смена через раунд.', safetyTip: 'Последние раунды — проверка характера.' },
    ],
  },
  {
    id: 'intermediate-finisher-010',
    title: 'Финальный рубеж',
    description: 'Завершающая тренировка среднего уровня перед переходом на продвинутый. Проверка всех навыков.',
    level: 'INTERMEDIATE',
    durationMinutes: 30,
    exercises: [
      { name: 'Рывок гири', sets: 4, reps: 15, restSeconds: 30, instructions: '15 рывков каждой рукой. Работа на количество.', safetyTip: 'Экономьте силы.' },
      { name: 'Толчок двух гирь', sets: 4, reps: 10, restSeconds: 45, instructions: '10 толчков. Полная амплитуда.', safetyTip: 'Фиксируйте гири вверху.' },
      { name: 'Приседания с гирей над головой', sets: 3, reps: 10, restSeconds: 45, instructions: '10 приседаний каждой рукой.', safetyTip: 'Плечо заблокировано.' },
      { name: 'Махи гирей одной рукой', sets: 4, reps: 20, restSeconds: 30, instructions: '20 махов каждой рукой. Закончите тренировку взрывом.', safetyTip: 'Последнее усилие — выложитесь.' },
    ],
  },

  // ==================== ADVANCED (10) ====================
  {
    id: 'grinder-advanced-001',
    title: 'Грайндр — силовая выносливость',
    description: 'Экстремальная силовая тренировка для продвинутых. Минимум отдыха, максимум интенсивности. Проверка на прочность.',
    level: 'ADVANCED',
    durationMinutes: 40,
    exercises: [
      { name: 'Толчок двух гирь', sets: 5, reps: 12, restSeconds: 30, instructions: '12 толчков двумя гирями. Взрывная работа ног.', safetyTip: 'Держите корпус напряженным.' },
      { name: 'Рывок гири', sets: 5, reps: 15, restSeconds: 30, instructions: '15 рывков каждой рукой. Максимальная концентрация.', safetyTip: 'Не форсируйте — сохраняйте технику.' },
      { name: 'Приседания с двумя гирями на груди', sets: 4, reps: 12, restSeconds: 30, instructions: 'Глубокие приседания с двумя гирями на груди.', safetyTip: 'Пятки на полу.' },
      { name: 'Жим двух гирь стоя', sets: 4, reps: 10, restSeconds: 30, instructions: 'Жим двух гирь над головой. Полная амплитуда.', safetyTip: 'Напрягите ягодицы.' },
      { name: 'Махи гирей одной рукой', sets: 5, reps: 20, restSeconds: 20, instructions: '20 махов каждой рукой. Финальный аккорд.', safetyTip: 'Выдох на каждом махе.' },
    ],
  },
  {
    id: 'advanced-long-cycle-002',
    title: 'Длинный цикл',
    description: 'Классическое гиревое двоеборье: толчок и рывок в длинных подходах. Развитие специальной выносливости.',
    level: 'ADVANCED',
    durationMinutes: 40,
    exercises: [
      { name: 'Толчок двух гирь (длинный подход)', sets: 3, reps: 20, restSeconds: 90, instructions: '20 толчков без остановки. Работа на выносливость.', safetyTip: 'Распределяйте силы.' },
      { name: 'Рывок гири (длинный подход)', sets: 3, reps: 25, restSeconds: 90, instructions: '25 рывков каждой рукой без остановки.', safetyTip: 'Меняйте руку, когда чувствуете усталость.' },
      { name: 'Длинный цикл (толчок+рывок)', sets: 3, reps: 10, restSeconds: 120, instructions: '10 циклов: толчок двух гирь + рывок каждой рукой. Одно повторение.', safetyTip: 'Сложнейшее упражнение — будьте готовы.' },
    ],
  },
  {
    id: 'advanced-jerk-003',
    title: 'Толчковый монстр',
    description: 'Тренировка с фокусом на толчок гирь. Различные вариации для увеличения силовых показателей.',
    level: 'ADVANCED',
    durationMinutes: 35,
    exercises: [
      { name: 'Толчок двух гирь', sets: 5, reps: 15, restSeconds: 45, instructions: '15 толчков. Полная амплитуда, фиксация вверху.', safetyTip: 'Локти заблокированы вверху.' },
      { name: 'Толчок с паузой в полуприседе', sets: 4, reps: 8, restSeconds: 60, instructions: 'Задержитесь на 2 секунды в полуприседе перед фиксацией гирь вверху.', safetyTip: 'Контролируйте паузу.' },
      { name: 'Толчок одной гири', sets: 4, reps: 15, restSeconds: 30, instructions: '15 толчков каждой рукой. Более легкая гиря, но быстрее.', safetyTip: 'Работайте на скорость.' },
      { name: 'Толчок с опусканием в мах', sets: 3, reps: 10, restSeconds: 60, instructions: 'Толчок — опускание гири между ног — мах — взятие на грудь — следующий толчок.', safetyTip: 'Плавный переход между движениями.' },
    ],
  },
  {
    id: 'advanced-snatch-004',
    title: 'Рывковая мощь',
    description: 'Продвинутая тренировка рывка. Увеличение взрывной силы и выносливости в королевском упражнении.',
    level: 'ADVANCED',
    durationMinutes: 35,
    exercises: [
      { name: 'Рывок гири', sets: 5, reps: 20, restSeconds: 45, instructions: '20 рывков каждой рукой. Работа на выносливость.', safetyTip: 'Экономьте силы, расслабляйте руку в верхней точке.' },
      { name: 'Рывок с фиксацией', sets: 4, reps: 10, restSeconds: 45, instructions: 'Задержите гирю на 3 секунды над головой. Медленное опускание.', safetyTip: 'Плечо заблокировано.' },
      { name: 'Рывок с переменой рук в воздухе', sets: 4, reps: 8, restSeconds: 45, instructions: 'В верхней точке перехватите гирю другой рукой и опустите. Без касания пола.', safetyTip: 'Ловите гирю аккуратно.' },
      { name: 'Рывок + мах + рывок', sets: 3, reps: 6, restSeconds: 60, instructions: 'Рывок — опускание в мах — мах — следующий рывок. Без остановки.', safetyTip: 'Держите ритм.' },
    ],
  },
  {
    id: 'advanced-squat-005',
    title: 'Приседательный ад',
    description: 'Тренировка с фокусом на приседания с гирями. Различные вариации для развития силы ног.',
    level: 'ADVANCED',
    durationMinutes: 35,
    exercises: [
      { name: 'Приседания с двумя гирями на плечах', sets: 5, reps: 12, restSeconds: 45, instructions: 'Глубокие приседания с двумя гирями на плечах. Полная амплитуда.', safetyTip: 'Грудь вперед, спина прямая.' },
      { name: 'Приседания с гирей над головой', sets: 4, reps: 10, restSeconds: 45, instructions: 'Гиря над головой. Медленные глубокие приседания.', safetyTip: 'Плечо заблокировано, взгляд прямо.' },
      { name: 'Болгарские выпады с гирей', sets: 4, reps: 10, restSeconds: 45, instructions: 'Задняя нога на возвышении. Гиря на груди. Выпады каждой ногой.', safetyTip: 'Переднее колено не выходит за носок.' },
      { name: 'Приседания-пистолетик с гирей', sets: 3, reps: 6, restSeconds: 60, instructions: 'Приседание на одной ноге с гирей перед собой. Другая нога вытянута вперед.', safetyTip: 'Используйте опору при необходимости.' },
    ],
  },
  {
    id: 'advanced-press-006',
    title: 'Жимовой предел',
    description: 'Максимальная жимовая тренировка. Развитие силы плечевого пояса и трицепса.',
    level: 'ADVANCED',
    durationMinutes: 35,
    exercises: [
      { name: 'Жим двух гирь стоя', sets: 5, reps: 10, restSeconds: 60, instructions: 'Жим двух гирь над головой. Полная амплитуда.', safetyTip: 'Не прогибайтесь в пояснице.' },
      { name: 'Жим гири сидя с наклоном', sets: 4, reps: 8, restSeconds: 60, instructions: 'Сидя на скамье под углом 45 градусов. Жим гири вверх.', safetyTip: 'Лопатки прижаты к скамье.' },
      { name: 'Жим гири одной рукой с наклоном в сторону', sets: 4, reps: 8, restSeconds: 45, instructions: 'Гиря в одной руке. Наклонитесь в противоположную сторону и выжмите гирю вверх.', safetyTip: 'Контролируйте баланс.' },
      { name: 'Отжимания на гирях', sets: 4, reps: 12, restSeconds: 45, instructions: 'Упор на две гири. Отжимания с полной амплитудой.', safetyTip: 'Корпус — прямая линия.' },
    ],
  },
  {
    id: 'advanced-circuit-007',
    title: 'Круговая экстрим',
    description: 'Экстремальная круговая тренировка для продвинутых. 8 упражнений, 4 круга. Выживают сильнейшие.',
    level: 'ADVANCED',
    durationMinutes: 40,
    exercises: [
      { name: 'Толчок двух гирь', sets: 4, reps: 15, restSeconds: 0, instructions: '15 толчков.', safetyTip: 'Работайте ногами.' },
      { name: 'Рывок гири', sets: 4, reps: 15, restSeconds: 0, instructions: '15 рывков каждой рукой.', safetyTip: 'Меняйте руку по необходимости.' },
      { name: 'Приседания с двумя гирями', sets: 4, reps: 15, restSeconds: 0, instructions: '15 глубоких приседаний.', safetyTip: 'Колени не сводите.' },
      { name: 'Жим двух гирь', sets: 4, reps: 10, restSeconds: 0, instructions: '10 жимов.', safetyTip: 'Локти полностью выпрямлены.' },
      { name: 'Махи гирей одной рукой', sets: 4, reps: 20, restSeconds: 0, instructions: '20 махов каждой рукой.', safetyTip: 'Взрывная работа бедер.' },
      { name: 'Тяга гири в наклоне', sets: 4, reps: 12, restSeconds: 0, instructions: '12 тяг каждой рукой.', safetyTip: 'Спина прямая.' },
      { name: 'Берпи с гирей', sets: 4, reps: 10, restSeconds: 0, instructions: '10 берпи, гиря в руках.', safetyTip: 'Мягкое приземление.' },
      { name: 'Планка с перетаскиванием гири', sets: 4, reps: 8, restSeconds: 120, instructions: '8 перетаскиваний в каждую сторону.', safetyTip: 'Таз не провисает.' },
    ],
  },
  {
    id: 'advanced-marathon-008',
    title: 'Марафон',
    description: 'Длительная тренировка на выносливость. Проверка физической и ментальной подготовки.',
    level: 'ADVANCED',
    durationMinutes: 50,
    exercises: [
      { name: 'Длинный цикл', sets: 5, reps: 15, restSeconds: 60, instructions: '15 длинных циклов (толчок + рывок). Работа на выносливость.', safetyTip: 'Распределите силы на все подходы.' },
      { name: 'Рывок гири', sets: 5, reps: 25, restSeconds: 45, instructions: '25 рывков каждой рукой. Длинные подходы.', safetyTip: 'Расслабляйте кисть в верхней точке.' },
      { name: 'Толчок двух гирь', sets: 5, reps: 20, restSeconds: 45, instructions: '20 толчков. Держите темп.', safetyTip: 'Дышите глубоко.' },
      { name: 'Махи гирей одной рукой', sets: 5, reps: 30, restSeconds: 30, instructions: '30 махов каждой рукой. Финальный отрезок.', safetyTip: 'Последние усилия — выложитесь.' },
    ],
  },
  {
    id: 'advanced-strength-009',
    title: 'Силовой максимум',
    description: 'Тренировка на максимальную силу. Работа с тяжелыми гирями на малое количество повторений.',
    level: 'ADVANCED',
    durationMinutes: 40,
    exercises: [
      { name: 'Толчок тяжелых гирь', sets: 5, reps: 5, restSeconds: 120, instructions: '5 мощных толчков с максимальным весом. Полная амплитуда.', safetyTip: 'Используйте страховку при необходимости.' },
      { name: 'Рывок тяжелой гири', sets: 5, reps: 5, restSeconds: 120, instructions: '5 рывков каждой рукой с максимальным весом.', safetyTip: 'Разминка перед подходом обязательна.' },
      { name: 'Приседания с максимальным весом', sets: 4, reps: 5, restSeconds: 120, instructions: '5 глубоких приседаний с двумя тяжелыми гирями.', safetyTip: 'Партнер для страховки.' },
      { name: 'Жим тяжелых гирь', sets: 4, reps: 5, restSeconds: 120, instructions: '5 жимов двумя гирями. Медленно и контролируемо.', safetyTip: 'Не блокируйте локти резко.' },
    ],
  },
  {
    id: 'advanced-finisher-010',
    title: 'Финальный босс',
    description: 'Самая сложная тренировка в программе. 10 упражнений, 100 повторений каждого. Финальная проверка.',
    level: 'ADVANCED',
    durationMinutes: 45,
    exercises: [
      { name: 'Махи гирей двумя руками', sets: 10, reps: 10, restSeconds: 15, instructions: '10 подходов по 10 махов. Отдых 15 секунд между подходами.', safetyTip: 'Считайте повторения вслух.' },
      { name: 'Толчок гири', sets: 10, reps: 10, restSeconds: 15, instructions: '10×10 толчков каждой рукой.', safetyTip: 'Меняйте руку каждый подход.' },
      { name: 'Рывок гири', sets: 10, reps: 10, restSeconds: 15, instructions: '10×10 рывков каждой рукой.', safetyTip: 'Последние подходы — терпение.' },
      { name: 'Приседания с гирей', sets: 10, reps: 10, restSeconds: 15, instructions: '10×10 приседаний с гирей на груди.', safetyTip: 'Колени не сводите.' },
      { name: 'Жим гири стоя', sets: 10, reps: 10, restSeconds: 15, instructions: '10×10 жимов каждой рукой.', safetyTip: 'Пресс напряжен.' },
      { name: 'Тяга гири в наклоне', sets: 10, reps: 10, restSeconds: 15, instructions: '10×10 тяг каждой рукой.', safetyTip: 'Спина прямая.' },
      { name: 'Махи гирей одной рукой', sets: 10, reps: 10, restSeconds: 15, instructions: '10×10 махов каждой рукой.', safetyTip: 'Взрывная работа.' },
      { name: 'Берпи с гирей', sets: 10, reps: 10, restSeconds: 15, instructions: '10×10 берпи с гирей в руках.', safetyTip: 'Дышите.' },
      { name: 'Выпады с гирей', sets: 10, reps: 10, restSeconds: 15, instructions: '10×10 выпадов каждой ногой.', safetyTip: 'Колено не касается пола.' },
      { name: 'Планка с гирей', sets: 10, reps: 30, restSeconds: 15, instructions: '10 подходов планки по 30 секунд с гирей на спине.', safetyTip: 'Финальное испытание.' },
    ],
  },
];

/**
 * Seed-функция: очищает БД и заполняет 30 тренировками.
 */
async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');
  console.log(`📊 Всего тренировок: ${workouts.length}`);

  // Считаем по уровням
  const levels = { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0 };
  workouts.forEach((w) => levels[w.level as keyof typeof levels]++);
  console.log(`📈 BEGINNER: ${levels.BEGINNER}, INTERMEDIATE: ${levels.INTERMEDIATE}, ADVANCED: ${levels.ADVANCED}`);

  // Очищаем существующие данные (в правильном порядке из-за внешних ключей)
  console.log('🧹 Очищаем старые данные...');
  await prisma.exercise.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.workout.deleteMany();

  // Создаем тренировки с упражнениями
  for (const workout of workouts) {
    const { exercises, ...workoutData } = workout;

    await prisma.workout.create({
      data: {
        ...workoutData,
        exercises: {
          create: exercises,
        },
      },
    });

    console.log(`  ✅ ${workout.title} (${workout.level}) — ${exercises.length} упражнений`);
  }

  console.log('\n🎉 База данных успешно заполнена!');
  console.log(`📊 Итого: ${workouts.length} тренировок`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });