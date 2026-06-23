import prisma from '../config/db.js';

export async function getCourses(req, res) {
  try {
    const courses = await prisma.course.findMany({
      where: req.user.role === 'ADMIN' || req.user.role === 'TEACHER'
        ? {}
        : { published: true },
      include: {
        teacher: { select: { id: true, name: true } },
        _count: { select: { topics: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(courses);
  } catch (error) {
    console.error('getCourses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
}

export async function getCourse(req, res) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        teacher: { select: { id: true, name: true } },
        topics: {
          include: {
            _count: { select: { exercises: true } },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    console.error('getCourse error:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
}

export async function createCourse(req, res) {
  try {
    const { title, description, imageUrl } = req.body;
    const course = await prisma.course.create({
      data: {
        title,
        description,
        imageUrl,
        teacherId: req.user.id,
      },
    });
    res.status(201).json(course);
  } catch (error) {
    console.error('createCourse error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
}

export async function updateCourse(req, res) {
  try {
    const { title, description, imageUrl, published } = req.body;
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(published !== undefined && { published }),
      },
    });
    res.json(course);
  } catch (error) {
    console.error('updateCourse error:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
}

export async function deleteCourse(req, res) {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    res.json({ message: 'Course deleted' });
  } catch (error) {
    console.error('deleteCourse error:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
}
