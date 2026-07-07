
const express = require('express');
const router = express.Router();
const { getWorkouts, startSession, finishSession } = require('../controllers/workoutController');

router.get('/', getWorkouts);
router.post('/start', startSession);
router.put('/:sessionId/finish', finishSession);

module.exports = router;
