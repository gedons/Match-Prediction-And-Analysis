// routes/predictionRoutes.js
const express = require('express');
const router = express.Router();
const getTopLeaguesCompetitions = require('../controllers/getTopLeaguesCompetitions');
const getUpcomingMatches = require('../controllers/getUpcomingMatches');

// POST route for getting match predictions
router.get('/competitions', getTopLeaguesCompetitions.getTopCompetitions);
router.get('/upcoming-matches', getUpcomingMatches.getUpcomingMatches);

module.exports = router;
