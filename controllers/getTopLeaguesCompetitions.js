const axios = require('axios');
const config = require('../config/footballAPI');

// Function to get competitions based on specified areas
exports.getTopCompetitions = async (req, res) => {
    const areas = ['England', 'Germany', 'Spain', 'Italy', 'Portugal']; // Define the areas for the top leagues

    try {
        // Step 1: Fetch all areas to get their IDs
        const areasResponse = await axios.get(`${config.baseURL}/areas`, {
            headers: { 'X-Auth-Token': config.apiKey },
        });

        const areaIds = areasResponse.data.areas
            .filter(area => areas.includes(area.name)) // Filter areas to match our top leagues
            .map(area => area.id); // Get their IDs

        if (areaIds.length === 0) {
            return res.status(404).json({ error: "No areas found for the specified leagues." });
        }

        // Step 2: Fetch competitions using the area IDs
        const competitionsResponse = await axios.get(`${config.baseURL}/competitions`, {
            headers: { 'X-Auth-Token': config.apiKey },
            params: {
                areas: areaIds.join(','), // Pass the IDs as a comma-separated list
            },
        });

        return res.json(competitionsResponse.data);
    } catch (error) {
        console.error("Error fetching top leagues competitions:", error.message);
        return res.status(error.response ? error.response.status : 500).json({
            error: "Could not fetch competitions.",
            details: error.response ? error.response.data : "Server error",
        });
    }
};
