import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../config/db.js';
import env from '../config/env.js';

const genAI = env.geminiApiKey ? new GoogleGenerativeAI(env.geminiApiKey) : null;
let lastGeminiError = null;

function getGeminiModel() {
  if (!genAI) return null;
  return genAI.getGenerativeModel({ model: env.geminiModel });
}

export function getAiStatus(req, res) {
  res.json({
    provider: 'gemini',
    configured: Boolean(env.geminiApiKey),
    model: env.geminiModel,
    fallbackEnabled: true,
    lastError: lastGeminiError,
  });
}

async function askGemini({ systemPrompt, userPrompt, maxTokens = 1000, temperature = 0.6 }) {
  const model = getGeminiModel();
  if (!model) {
    return { text: null, provider: 'fallback', error: 'GEMINI_API_KEY is not configured' };
  }

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature,
      },
    });

    const text = result.response.text().trim();
    lastGeminiError = null;
    return { text, provider: 'gemini', error: null };
  } catch (error) {
    console.error('Gemini API error:', error.message);
    lastGeminiError = error.message;
    return { text: null, provider: 'fallback', error: error.message };
  }
}

async function getExerciseContext(exerciseId) {
  if (!exerciseId) return null;

  return prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: {
      hints: { orderBy: { orderIndex: 'asc' } },
      topic: {
        select: {
          title: true,
          content: true,
          course: { select: { title: true } },
        },
      },
    },
  });
}

function formatExerciseContext(exercise) {
  if (!exercise) return '';

  const hints = exercise.hints?.length
    ? exercise.hints.map((hint, index) => `${index + 1}. ${hint.content}`).join('\n')
    : 'Немає збережених підказок.';

  return `
Контекст вправи:
Курс: ${exercise.topic?.course?.title || 'невідомо'}
Тема: ${exercise.topic?.title || 'невідомо'}
Назва вправи: ${exercise.title}
Опис: ${exercise.description}
Складність: ${exercise.difficulty}
Шаблон коду:
${exercise.templateCode || 'Немає шаблону'}
Тести:
${exercise.testCode || 'Немає тестів'}
Збережені підказки:
${hints}
`.trim();
}

function programmingTutorPrompt() {
  return `
Ти AI-помічник у навчальному застосунку LearnProgrammer.
Відповідай українською мовою, коротко і практично.
Допомагай студенту зрозуміти ідею, помилку або наступний крок.
Не давай повне готове рішення одразу, якщо студент прямо про це не просить.
Коли доречно, показуй маленькі фрагменти коду, але пояснюй логіку словами.
`.trim();
}

function hintPrompt() {
  return `
Ти AI-наставник з програмування.
Дай одну коротку підказку українською мовою у 2-3 речення.
Не показуй повне рішення і не переписуй всю функцію.
Сфокусуйся на наступному кроці, який студент може зробити сам.
`.trim();
}

function codeReviewPrompt() {
  return `
Ти AI-рецензент коду для навчальної вправи.
Відповідай українською мовою.
Знайди ймовірні помилки, поясни причину і запропонуй напрям виправлення.
Не будь багатослівним і не переписуй усе рішення без потреби.
`.trim();
}

async function saveInteraction({ prompt, response, type, userId, exerciseId, provider }) {
  await prisma.aiInteraction.create({
    data: {
      prompt,
      response: `[${provider}] ${response}`,
      type,
      userId,
      exerciseId: exerciseId || null,
    },
  });
}

export async function askAssistant(req, res) {
  try {
    const { prompt, exerciseId } = req.body;

    if (!prompt?.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const exercise = await getExerciseContext(exerciseId);
    const context = formatExerciseContext(exercise);
    const userPrompt = `${context}\n\nПитання студента:\n${prompt}`.trim();

    const ai = await askGemini({
      systemPrompt: programmingTutorPrompt(),
      userPrompt,
      maxTokens: 1000,
    });

    const response = ai.text || generateFallbackResponse(prompt, exercise);

    await saveInteraction({
      prompt,
      response,
      type: exerciseId ? 'exercise_help' : 'general',
      userId: req.user.id,
      exerciseId,
      provider: ai.provider,
    });

    res.json({ response, provider: ai.provider });
  } catch (error) {
    console.error('AI error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
}

export async function getHint(req, res) {
  try {
    const exerciseId = req.params.exerciseId;
    const exercise = await getExerciseContext(exerciseId);

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    const savedHint = exercise.hints?.[0];
    if (savedHint) {
      await saveInteraction({
        prompt: `Підказка для вправи: ${exercise.title}`,
        response: savedHint.content,
        type: 'hint',
        userId: req.user.id,
        exerciseId,
        provider: 'database',
      });
      return res.json({ hint: savedHint.content, provider: 'database' });
    }

    const ai = await askGemini({
      systemPrompt: hintPrompt(),
      userPrompt: formatExerciseContext(exercise),
      maxTokens: 250,
      temperature: 0.5,
    });

    const hint = ai.text || generateFallbackHint(exercise);

    await saveInteraction({
      prompt: `AI-підказка для вправи: ${exercise.title}`,
      response: hint,
      type: 'hint',
      userId: req.user.id,
      exerciseId,
      provider: ai.provider,
    });

    res.json({ hint, provider: ai.provider });
  } catch (error) {
    console.error('getHint error:', error);
    res.status(500).json({ error: 'Failed to get hint' });
  }
}

export async function analyzeCode(req, res) {
  try {
    const { code, exerciseId } = req.body;

    if (!code?.trim()) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const exercise = await getExerciseContext(exerciseId);
    const ai = await askGemini({
      systemPrompt: codeReviewPrompt(),
      userPrompt: `${formatExerciseContext(exercise)}\n\nКод студента:\n${code}`.trim(),
      maxTokens: 700,
      temperature: 0.4,
    });

    const analysis = ai.text || analyzeCodeLocally(code);

    await saveInteraction({
      prompt: `Аналіз коду для вправи ${exerciseId || 'без вправи'}`,
      response: analysis,
      type: 'code_review',
      userId: req.user.id,
      exerciseId,
      provider: ai.provider,
    });

    res.json({ analysis, provider: ai.provider });
  } catch (error) {
    console.error('analyzeCode error:', error);
    res.status(500).json({ error: 'Failed to analyze code' });
  }
}

function generateFallbackResponse(prompt, exercise) {
  const lower = prompt.toLowerCase();

  if (lower.includes('помил') || lower.includes('error') || lower.includes('не працю')) {
    return 'Почни з повідомлення про помилку або результату тестів. Перевір назви функцій, чи є `return`, чи збігається кількість аргументів, і чи всі дужки закриті.';
  }

  if (lower.includes('функц') || lower.includes('function')) {
    return 'Функція - це іменований блок коду, який можна викликати багато разів. У цій вправі зверни увагу, що функція має прийняти параметри, обчислити результат і повернути його через `return`.';
  }

  if (lower.includes('підказ') || lower.includes('hint')) {
    return generateFallbackHint(exercise);
  }

  if (exercise) {
    return `Для вправи "${exercise.title}" спочатку визнач, які вхідні дані має функція і що вона повинна повернути. Потім реалізуй найменший крок і перевір його на прикладах з умови.`;
  }

  return 'Сформулюй задачу як: які дані є на вході, який результат потрібен на виході, і які кроки перетворюють перше на друге. Якщо покажеш код або помилку, я зможу підказати точніше.';
}

function generateFallbackHint(exercise) {
  if (!exercise) {
    return 'Розбий задачу на маленькі кроки: вхідні дані, дія, очікуваний результат.';
  }

  if (exercise.templateCode?.includes('function') && !exercise.templateCode.includes('return')) {
    return 'Подумай, яке значення має повернути функція. У JavaScript для цього використовується ключове слово `return`.';
  }

  return `Подивись на назву й опис вправи "${exercise.title}". Спробуй реалізувати тільки один основний крок, а потім перевір його тестами.`;
}

function analyzeCodeLocally(code) {
  const issues = [];

  if (code.includes('var ')) {
    issues.push('Замість `var` краще використовувати `let` або `const`.');
  }

  if (code.includes('function') && !code.includes('return')) {
    issues.push('Функція не повертає значення. Для більшості вправ потрібно використати `return`.');
  }

  const opens = (code.match(/\{/g) || []).length;
  const closes = (code.match(/\}/g) || []).length;
  if (opens !== closes) {
    issues.push('Кількість відкритих і закритих фігурних дужок не збігається.');
  }

  if (issues.length === 0) {
    return 'На швидкій локальній перевірці явних проблем не видно. Якщо тести падають, звір назву функції, аргументи і точне очікуване значення.';
  }

  return `Знайдені можливі проблеми:\n${issues.map((issue) => `- ${issue}`).join('\n')}`;
}
