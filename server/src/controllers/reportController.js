import prisma from '../config/db.js';

export async function getStudentReport(req, res) {
  try {
    const userId = req.params.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const progress = await prisma.progress.findMany({
      where: { userId },
      include: {
        exercise: {
          select: { id: true, title: true, difficulty: true, topicId: true },
        },
      },
    });

    const submissions = await prisma.submission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const aiInteractions = await prisma.aiInteraction.count({
      where: { userId },
    });

    const completedExercises = progress.filter(p => p.completed).length;
    const totalExercises = await prisma.exercise.count();
    const avgScore = progress.reduce((sum, p) => sum + (p.score || 0), 0) / (progress.length || 1);

    res.json({
      user,
      summary: {
        completedExercises,
        totalExercises,
        avgScore: Math.round(avgScore),
        totalAttempts: progress.reduce((sum, p) => sum + p.attempts, 0),
        aiInteractions,
      },
      progress,
      submissions,
    });
  } catch (error) {
    console.error('getStudentReport error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
}

export async function exportReport(req, res) {
  try {
    const userId = req.params.userId;
    const format = req.query.format || 'json';

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const progress = await prisma.progress.findMany({
      where: { userId },
      include: {
        exercise: { select: { title: true, difficulty: true } },
      },
    });

    const submissions = await prisma.submission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const report = {
      generatedAt: new Date().toISOString(),
      user,
      summary: {
        completedExercises: progress.filter(p => p.completed).length,
        avgScore: Math.round(progress.reduce((sum, p) => sum + (p.score || 0), 0) / (progress.length || 1)),
        totalSubmissions: submissions.length,
      },
      progress,
      submissions,
    };

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=report-${userId}.json`);
      return res.json(report);
    }

    const csvRows = [];
    csvRows.push('Exercise,Status,Score,Attempts,LastAttempt');
    progress.forEach(p => {
      csvRows.push(`${p.exercise.title},${p.completed ? 'Completed' : 'In Progress'},${p.score || 0},${p.attempts},${p.updatedAt}`);
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=report-${userId}.csv`);
    res.send(csvRows.join('\n'));
  } catch (error) {
    console.error('exportReport error:', error);
    res.status(500).json({ error: 'Failed to export report' });
  }
}
