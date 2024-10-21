// routes/predictionRoutes.js
const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');

// POST route for getting match predictions
router.post('/predict', predictionController.getPrediction);

module.exports = router;
