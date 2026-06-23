import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@learnprog.com' },
    update: {},
    create: {
      email: 'admin@learnprog.com',
      passwordHash: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@learnprog.com' },
    update: {},
    create: {
      email: 'teacher@learnprog.com',
      passwordHash: teacherPassword,
      name: 'John Teacher',
      role: 'TEACHER',
    },
  });

  await prisma.user.upsert({
    where: { email: 'student@learnprog.com' },
    update: {},
    create: {
      email: 'student@learnprog.com',
      passwordHash: studentPassword,
      name: 'Jane Student',
      role: 'STUDENT',
    },
  });

  const jsCourse = await prisma.course.upsert({
    where: { id: 'course-js' },
    update: {},
    create: {
      id: 'course-js',
      title: 'JavaScript Fundamentals',
      description: 'Learn JavaScript from scratch. Master variables, functions, objects, arrays, and more.',
      imageUrl: '/courses/javascript.svg',
      published: true,
      teacherId: teacher.id,
    },
  });

  const pyCourse = await prisma.course.upsert({
    where: { id: 'course-py' },
    update: {},
    create: {
      id: 'course-py',
      title: 'Python для початківців',
      description: 'Вивчіть Python з нуля. Змінні, цикли, функції, списки, словники.',
      imageUrl: '/courses/python.svg',
      published: true,
      teacherId: teacher.id,
    },
  });

  const jsTopic1 = await prisma.topic.upsert({
    where: { id: 'topic-js-1' },
    update: {},
    create: {
      id: 'topic-js-1',
      title: 'Змінні та типи даних',
      content: '# Змінні та типи даних в JavaScript\n\nJavaScript має динамічну типізацію...\n\n## Оголошення змінних\n\n```js\nlet name = "John";\nconst age = 25;\nvar oldWay = "avoid";\n```\n\n## Типи даних\n- `number` - числа\n- `string` - рядки\n- `boolean` - true/false\n- `null` - пусте значення\n- `undefined` - невизначено\n- `object` - об\'єкти\n- `array` - масиви',
      orderIndex: 0,
      courseId: jsCourse.id,
    },
  });

  await prisma.topic.upsert({
    where: { id: 'topic-js-2' },
    update: {},
    create: {
      id: 'topic-js-2',
      title: 'Функції',
      content: '# Функції в JavaScript\n\nФункції - це блоки коду, які можна викликати багаторазово.\n\n```js\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconst arrowGreet = (name) => `Hello, ${name}!`;\n```',
      orderIndex: 1,
      courseId: jsCourse.id,
    },
  });

  await prisma.exercise.upsert({
    where: { id: 'ex-js-1' },
    update: {},
    create: {
      id: 'ex-js-1',
      title: 'Сума двох чисел',
      description: 'Напишіть функцію `add(a, b)`, яка повертає суму двох чисел.',
      type: 'CODE',
      difficulty: 'BEGINNER',
      templateCode: 'function add(a, b) {\n  // your code here\n}\n',
      testCode: 'console.log(add(2, 3) === 5 ? "PASS" : "FAIL");\nconsole.log(add(-1, 1) === 0 ? "PASS" : "FAIL");\nconsole.log(add(0, 0) === 0 ? "PASS" : "FAIL");\n',
      solution: 'function add(a, b) {\n  return a + b;\n}\n',
      orderIndex: 0,
      topicId: jsTopic1.id,
    },
  });

  await prisma.hint.createMany({
    data: [
      { content: 'Використайте ключове слово `return`', orderIndex: 0, exerciseId: 'ex-js-1' },
      { content: 'Оператор додавання в JS: `+`', orderIndex: 1, exerciseId: 'ex-js-1' },
      { content: 'Функція має виглядати так: `function add(a, b) { return a + b; }`', orderIndex: 2, exerciseId: 'ex-js-1' },
    ],
    skipDuplicates: true,
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
