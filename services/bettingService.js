const axios = require('axios');
const config = require('../config/oddsAPI');

// Get betting odds for a specific match between two teams
exports.getBettingOdds = async (teamA, teamB) => {
    try {
        const oddsResponse = await axios.get(`${config.baseURL}/sports/soccer_epl/odds`, {
            params: {
                regions: 'uk',
                oddsFormat: 'american',
                apiKey: config.apiKey,
            }
        });

        const oddsData = oddsResponse.data;

        // Strip "FC", "SC", and other suffixes to normalize team names for comparison
        const normalizeName = (teamName) => {
            return teamName.replace(/( FC| SC| AFC|United)$/i, '').trim();
        };

        const normalizedTeamA = normalizeName(teamA);
        const normalizedTeamB = normalizeName(teamB);

        console.log(`Searching for match data for teams: ${normalizedTeamA} ${normalizedTeamB}`);

        // Find the relevant match
        const match = oddsData.find(match => {
            const homeTeam = normalizeName(match.home_team);
            const awayTeam = normalizeName(match.away_team);

            return (homeTeam === normalizedTeamA && awayTeam === normalizedTeamB) ||
                   (homeTeam === normalizedTeamB && awayTeam === normalizedTeamA);
        });

        if (!match) {
            console.error("No match data found for the specified teams.");
            throw new Error("No match data found for the specified teams.");
        }

        return match;
    } catch (error) {
        console.error("Error fetching betting odds:", error.message || error);
        throw new Error("Could not fetch betting odds.");
    }
};

