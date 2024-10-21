// app.js
const express = require('express');
const bodyParser = require('body-parser');
const predictionRoutes = require('./routes/predictionRoutes');
const competitionRoutes = require('./routes/competitionRoutes');

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api', predictionRoutes);
app.use('/api', competitionRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
