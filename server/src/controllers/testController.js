import prisma from '../config/db.js';

export async function getTests(req, res) {
  try {
    const { courseId, topicId } = req.query;
    const where = {};
    if (courseId) where.courseId = courseId;
    if (topicId) where.topicId = topicId;

    if (req.user.role !== 'ADMIN' && req.user.role !== 'TEACHER') {
      where.published = true;
    }

    const tests = await prisma.test.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true } },
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tests);
  } catch (error) {
    console.error('getTests error:', error);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
}

export async function getTest(req, res) {
  try {
    const test = await prisma.test.findUnique({
      where: { id: req.params.id },
      include: {
        questions: {
          include: {
            options: { orderBy: { id: 'asc' } },
          },
          orderBy: { orderIndex: 'asc' },
        },
        creator: { select: { id: true, name: true } },
      },
    });

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    if (!test.published && req.user.role !== 'ADMIN' && req.user.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Test not available' });
    }

    const attempt = await prisma.testAttempt.findFirst({
      where: { testId: test.id, userId: req.user.id },
      orderBy: { startedAt: 'desc' },
      include: {
        answers: {
          include: { question: { include: { options: true } } },
        },
      },
    });

    res.json({ ...test, attempt });
  } catch (error) {
    console.error('getTest error:', error);
    res.status(500).json({ error: 'Failed to fetch test' });
  }
}

export async function createTest(req, res) {
  try {
    const { title, description, timeLimit, passingScore, published, courseId, topicId, questions } = req.body;

    const test = await prisma.test.create({
      data: {
        title,
        description,
        timeLimit: timeLimit || 0,
        passingScore: passingScore || 60,
        published: published || false,
        courseId,
        topicId,
        createdBy: req.user.id,
        questions: questions ? {
          create: questions.map((q, idx) => ({
            text: q.text,
            type: q.type || 'SINGLE_CHOICE',
            points: q.points || 1,
            orderIndex: idx,
            options: q.options ? {
              create: q.options.map(o => ({
                text: o.text,
                isCorrect: o.isCorrect || false,
              })),
            } : undefined,
          })),
        } : undefined,
      },
      include: {
        questions: {
          include: { options: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    res.status(201).json(test);
  } catch (error) {
    console.error('createTest error:', error);
    res.status(500).json({ error: 'Failed to create test' });
  }
}

export async function updateTest(req, res) {
  try {
    const { title, description, timeLimit, passingScore, published } = req.body;

    const test = await prisma.test.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(timeLimit !== undefined && { timeLimit }),
        ...(passingScore !== undefined && { passingScore }),
        ...(published !== undefined && { published }),
      },
      include: {
        questions: {
          include: { options: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    res.json(test);
  } catch (error) {
    console.error('updateTest error:', error);
    res.status(500).json({ error: 'Failed to update test' });
  }
}

export async function deleteTest(req, res) {
  try {
    await prisma.test.delete({ where: { id: req.params.id } });
    res.json({ message: 'Test deleted' });
  } catch (error) {
    console.error('deleteTest error:', error);
    res.status(500).json({ error: 'Failed to delete test' });
  }
}

export async function addQuestion(req, res) {
  try {
    const { text, type, points, options } = req.body;

    const question = await prisma.testQuestion.create({
      data: {
        text,
        type: type || 'SINGLE_CHOICE',
        points: points || 1,
        testId: req.params.id,
        orderIndex: 0,
        options: options ? {
          create: options.map(o => ({
            text: o.text,
            isCorrect: o.isCorrect || false,
          })),
        } : undefined,
      },
      include: { options: true },
    });

    res.status(201).json(question);
  } catch (error) {
    console.error('addQuestion error:', error);
    res.status(500).json({ error: 'Failed to add question' });
  }
}

export async function updateQuestion(req, res) {
  try {
    const { text, type, points, options } = req.body;

    await prisma.testQuestionOption.deleteMany({ where: { questionId: req.params.questionId } });

    const question = await prisma.testQuestion.update({
      where: { id: req.params.questionId },
      data: {
        ...(text !== undefined && { text }),
        ...(type !== undefined && { type }),
        ...(points !== undefined && { points }),
        options: options ? {
          create: options.map(o => ({
            text: o.text,
            isCorrect: o.isCorrect || false,
          })),
        } : undefined,
      },
      include: { options: true },
    });

    res.json(question);
  } catch (error) {
    console.error('updateQuestion error:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
}

export async function deleteQuestion(req, res) {
  try {
    await prisma.testQuestion.delete({ where: { id: req.params.questionId } });
    res.json({ message: 'Question deleted' });
  } catch (error) {
    console.error('deleteQuestion error:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
}

export async function startAttempt(req, res) {
  try {
    const test = await prisma.test.findUnique({
      where: { id: req.params.id },
      include: { questions: true },
    });

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const existing = await prisma.testAttempt.findFirst({
      where: { testId: test.id, userId: req.user.id, status: 'IN_PROGRESS' },
    });

    if (existing) {
      return res.json(existing);
    }

    const maxScore = test.questions.reduce((sum, q) => sum + q.points, 0);

    const attempt = await prisma.testAttempt.create({
      data: {
        userId: req.user.id,
        testId: test.id,
        maxScore,
        status: 'IN_PROGRESS',
      },
    });

    res.status(201).json(attempt);
  } catch (error) {
    console.error('startAttempt error:', error);
    res.status(500).json({ error: 'Failed to start test attempt' });
  }
}

export async function submitAnswer(req, res) {
  try {
    const { questionId, value } = req.body;
    const attemptId = req.params.attemptId;

    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: { test: { include: { questions: { include: { options: true } } } } },
    });

    if (!attempt || attempt.userId !== req.user.id) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    if (attempt.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Attempt already completed' });
    }

    const question = attempt.test.questions.find(q => q.id === questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const answerValues = Array.isArray(value) ? value : [value];
    let isCorrect = false;

    if (question.type === 'SINGLE_CHOICE' || question.type === 'TRUE_FALSE') {
      const correctOption = question.options.find(o => o.isCorrect);
      isCorrect = correctOption ? answerValues[0] === correctOption.id : false;
    } else if (question.type === 'MULTIPLE_CHOICE') {
      const correctIds = question.options.filter(o => o.isCorrect).map(o => o.id).sort();
      const sortedAnswer = [...answerValues].sort();
      isCorrect = JSON.stringify(correctIds) === JSON.stringify(sortedAnswer);
    }

    const existing = await prisma.testAnswer.findFirst({
      where: { attemptId, questionId },
    });

    if (existing) {
      await prisma.testAnswer.update({
        where: { id: existing.id },
        data: { value: answerValues.join(','), isCorrect },
      });
    } else {
      await prisma.testAnswer.create({
        data: {
          value: answerValues.join(','),
          isCorrect,
          attemptId,
          questionId,
        },
      });
    }

    const answer = await prisma.testAnswer.findFirst({
      where: { attemptId, questionId },
    });

    res.json(answer);
  } catch (error) {
    console.error('submitAnswer error:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
}

export async function completeAttempt(req, res) {
  try {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: req.params.attemptId },
      include: {
        answers: true,
        test: { include: { questions: { include: { options: true } } } },
      },
    });

    if (!attempt || attempt.userId !== req.user.id) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    if (attempt.status === 'COMPLETED') {
      return res.json(attempt);
    }

    let score = 0;
    for (const answer of attempt.answers) {
      if (answer.isCorrect) {
        const question = attempt.test.questions.find(q => q.id === answer.questionId);
        if (question) score += question.points;
      }
    }

    const updated = await prisma.testAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'COMPLETED',
        score,
        completedAt: new Date(),
      },
      include: {
        answers: {
          include: { question: { include: { options: true } } },
        },
        test: {
          include: { questions: { include: { options: true } } },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('completeAttempt error:', error);
    res.status(500).json({ error: 'Failed to complete attempt' });
  }
}

export async function getMyAttempts(req, res) {
  try {
    const attempts = await prisma.testAttempt.findMany({
      where: { userId: req.user.id },
      include: {
        test: { select: { id: true, title: true, passingScore: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
    res.json(attempts);
  } catch (error) {
    console.error('getMyAttempts error:', error);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
}

export async function getAttemptsForTest(req, res) {
  try {
    const attempts = await prisma.testAttempt.findMany({
      where: { testId: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
    res.json(attempts);
  } catch (error) {
    console.error('getAttemptsForTest error:', error);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
}