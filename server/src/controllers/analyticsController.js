import prisma from '../config/db.js';

export async function getUserProgress(req, res) {
  try {
    const progress = await prisma.progress.findMany({
      where: { userId: req.params.userId || req.user.id },
      include: {
        exercise: {
          select: { id: true, title: true, difficulty: true, topicId: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(progress);
  } catch (error) {
    console.error('getUserProgress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
}

export async function getCourseAnalytics(req, res) {
  try {
    const courseId = req.params.courseId;

    const topics = await prisma.topic.findMany({
      where: { courseId },
      include: {
        exercises: {
          include: {
            progress: true,
          },
        },
      },
    });

    const totalExercises = topics.reduce((sum, t) => sum + t.exercises.length, 0);
    const totalStudents = await prisma.progress.groupBy({
      by: ['userId'],
      _count: true,
    });

    const completedExercises = topics.reduce(
      (sum, t) =>
        sum +
        t.exercises.reduce(
          (s, e) => s + e.progress.filter(p => p.completed).length,
          0,
        ),
      0,
    );

    res.json({
      totalTopics: topics.length,
      totalExercises,
      totalStudents: totalStudents.length,
      completedExercises,
      topics: topics.map(t => ({
        id: t.id,
        title: t.title,
        exerciseCount: t.exercises.length,
        completedCount: t.exercises.reduce(
          (s, e) => s + e.progress.filter(p => p.completed).length,
          0,
        ),
      })),
    });
  } catch (error) {
    console.error('getCourseAnalytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

export async function getDashboardStats(req, res) {
  try {
    const totalCourses = await prisma.course.count();
    const totalUsers = await prisma.user.count();
    const totalExercises = await prisma.exercise.count();
    const totalSubmissions = await prisma.submission.count();

    const recentSubmissions = await prisma.submission.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        exercise: { select: { title: true } },
      },
    });

    const roleDistribution = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    res.json({
      totalCourses,
      totalUsers,
      totalExercises,
      totalSubmissions,
      recentSubmissions,
      roleDistribution,
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
}
