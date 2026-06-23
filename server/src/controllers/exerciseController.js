import prisma from '../config/db.js';

export async function getExercises(req, res) {
  try {
    const exercises = await prisma.exercise.findMany({
      where: { topicId: req.params.topicId },
      orderBy: { orderIndex: 'asc' },
    });
    res.json(exercises);
  } catch (error) {
    console.error('getExercises error:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
}

export async function getExercise(req, res) {
  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id: req.params.id },
      include: {
        hints: { orderBy: { orderIndex: 'asc' } },
      },
    });
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    const progress = await prisma.progress.findUnique({
      where: {
        userId_exerciseId: {
          userId: req.user.id,
          exerciseId: exercise.id,
        },
      },
    });

    res.json({ ...exercise, progress });
  } catch (error) {
    console.error('getExercise error:', error);
    res.status(500).json({ error: 'Failed to fetch exercise' });
  }
}

export async function createExercise(req, res) {
  try {
    const { title, description, type, difficulty, templateCode, testCode, solution, orderIndex, topicId } = req.body;
    const exercise = await prisma.exercise.create({
      data: { title, description, type, difficulty, templateCode, testCode, solution, orderIndex, topicId },
    });
    res.status(201).json(exercise);
  } catch (error) {
    console.error('createExercise error:', error);
    res.status(500).json({ error: 'Failed to create exercise' });
  }
}

export async function updateExercise(req, res) {
  try {
    const { title, description, type, difficulty, templateCode, testCode, solution, orderIndex } = req.body;
    const exercise = await prisma.exercise.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(difficulty !== undefined && { difficulty }),
        ...(templateCode !== undefined && { templateCode }),
        ...(testCode !== undefined && { testCode }),
        ...(solution !== undefined && { solution }),
        ...(orderIndex !== undefined && { orderIndex }),
      },
    });
    res.json(exercise);
  } catch (error) {
    console.error('updateExercise error:', error);
    res.status(500).json({ error: 'Failed to update exercise' });
  }
}

export async function deleteExercise(req, res) {
  try {
    await prisma.exercise.delete({ where: { id: req.params.id } });
    res.json({ message: 'Exercise deleted' });
  } catch (error) {
    console.error('deleteExercise error:', error);
    res.status(500).json({ error: 'Failed to delete exercise' });
  }
}

export async function submitSolution(req, res) {
  try {
    const { code } = req.body;
    const exerciseId = req.params.id;

    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    let status = 'PENDING';
    let score = 0;
    let feedback = '';

    if (exercise.testCode && exercise.solution) {
      const userFunc = extractFunction(code);
      const solutionFunc = extractFunction(exercise.solution);

      if (userFunc && solutionFunc) {
        const testsPassed = await runTests(code, exercise.testCode);
        const passRate = testsPassed.length > 0
          ? testsPassed.filter(Boolean).length / testsPassed.length
          : 0;

        status = passRate === 1 ? 'PASSED' : 'FAILED';
        score = Math.round(passRate * 100);
        const passed = testsPassed.filter(Boolean).length;
        feedback = `${passed}/${testsPassed.length} tests passed`;
        if (passed > 0 && passed < testsPassed.length) {
          feedback += ' — partial solution, keep trying!';
        }
      } else {
        status = 'ERROR';
        feedback = 'Could not parse function';
      }
    } else {
      status = 'PASSED';
      score = 100;
      feedback = 'Solution submitted successfully';
    }

    const submission = await prisma.submission.create({
      data: {
        code,
        status,
        score,
        feedback,
        userId: req.user.id,
        exerciseId,
      },
    });

    await prisma.progress.upsert({
      where: {
        userId_exerciseId: {
          userId: req.user.id,
          exerciseId,
        },
      },
      update: {
        completed: status === 'PASSED',
        score,
        attempts: { increment: 1 },
      },
      create: {
        userId: req.user.id,
        exerciseId,
        completed: status === 'PASSED',
        score,
        attempts: 1,
      },
    });

    res.json(submission);
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ error: 'Failed to submit solution' });
  }
}

function extractFunction(code) {
  try {
    const funcMatch = code.match(/(?:async\s+)?function\s+\w+\s*\([^)]*\)\s*{[\s\S]*}/);
    if (funcMatch) return funcMatch[0];
    const arrowMatch = code.match(/(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)|\w+)\s*=>\s*{[\s\S]*}/);
    if (arrowMatch) return arrowMatch[0];
    return code.trim();
  } catch {
    return null;
  }
}

function runTests(code, testCode) {
  const testLines = testCode.split('\n').filter(line => line.trim());
  const results = [];

  for (const line of testLines) {
    try {
      const combinedCode = `${code}\n\n${line}`;
      const logs = [];
      const mockConsole = { log: (...args) => logs.push(args.join(' ')) };

      const vm = { console: mockConsole };
      const params = Object.keys(vm).join(', ');
      const args = Object.values(vm);
      const fn = new Function(params, combinedCode);
      fn(...args);

      const passed = logs.some(log => log.includes('PASS'));
      results.push(passed);
    } catch {
      results.push(false);
    }
  }

  return results;
}
