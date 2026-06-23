import prisma from '../config/db.js';

export async function getTopics(req, res) {
  try {
    const topics = await prisma.topic.findMany({
      where: { courseId: req.params.courseId },
      include: {
        _count: { select: { exercises: true } },
      },
      orderBy: { orderIndex: 'asc' },
    });
    res.json(topics);
  } catch (error) {
    console.error('getTopics error:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
}

export async function getTopic(req, res) {
  try {
    const topic = await prisma.topic.findUnique({
      where: { id: req.params.id },
      include: {
        exercises: {
          include: {
            hints: { orderBy: { orderIndex: 'asc' } },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    res.json(topic);
  } catch (error) {
    console.error('getTopic error:', error);
    res.status(500).json({ error: 'Failed to fetch topic' });
  }
}

export async function createTopic(req, res) {
  try {
    const { title, content, orderIndex, courseId } = req.body;
    const topic = await prisma.topic.create({
      data: { title, content, orderIndex, courseId },
    });
    res.status(201).json(topic);
  } catch (error) {
    console.error('createTopic error:', error);
    res.status(500).json({ error: 'Failed to create topic' });
  }
}

export async function updateTopic(req, res) {
  try {
    const { title, content, orderIndex } = req.body;
    const topic = await prisma.topic.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(orderIndex !== undefined && { orderIndex }),
      },
    });
    res.json(topic);
  } catch (error) {
    console.error('updateTopic error:', error);
    res.status(500).json({ error: 'Failed to update topic' });
  }
}

export async function deleteTopic(req, res) {
  try {
    await prisma.topic.delete({ where: { id: req.params.id } });
    res.json({ message: 'Topic deleted' });
  } catch (error) {
    console.error('deleteTopic error:', error);
    res.status(500).json({ error: 'Failed to delete topic' });
  }
}
