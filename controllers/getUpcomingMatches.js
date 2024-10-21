const footballService = require('../services/footballService');

// New endpoint to fetch upcoming matches
exports.getUpcomingMatches = async (req, res) => {
    try {
        const { competition } = req.body; // Get competition from request body

        // Validate input
        if (!competition) {
            return res.status(400).json({ error: "Please provide a competition." });
        }

        // Fetch upcoming matches from Football-Data API
        const upcomingMatches = await footballService.getUpcomingMatches(competition);

        // Check if there are matches available
        if (upcomingMatches.length === 0) {
            return res.status(404).json({ message: "No upcoming matches found." });
        }

        return res.json(upcomingMatches); // Return the upcoming matches
    } catch (error) {
        console.error("Error fetching upcoming matches:", error.message);
        return res.status(500).json({ error: "Could not fetch upcoming matches." });
    }
};
