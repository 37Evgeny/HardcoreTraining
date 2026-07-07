const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ========== GET /workouts ==========
const getWorkouts = async (req, res, next) => {
  try {
    const { level } = req.query;
    const where = level ? { level } : {};
    const workouts = await prisma.workout.findMany({
      where,
      include: { exercises: true }
    });
    res.json({ success: true, data: workouts });
  } catch (error) {
    next(error);
  }
};

// ========== POST /workouts/start ==========
const startSession = async (req, res, next) => {
  try {
    const { workoutId, userId } = req.body;

    if (!workoutId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'workoutId and userId are required'
      });
    }

    const workout = await prisma.workout.findUnique({ where: { id: workoutId } });
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }

    const session = await prisma.workoutSession.create({
      data: {
        workoutId,
        userId,
        completed: false
      }
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

// ========== PUT /workouts/:sessionId/finish ==========
const finishSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.completed) {
      return res.status(400).json({ success: false, message: 'Session already completed' });
    }

    const updatedSession = await prisma.workoutSession.update({
      where: { id: sessionId },
      data: {
        completed: true,
        finishedAt: new Date()
      }
    });

    res.json({ success: true, data: updatedSession });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWorkouts, startSession, finishSession };