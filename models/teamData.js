const axios = require('axios');
const config = require('../config/footballAPI');

exports.getTeamData = async (teamName, competition) => {
    try {
        console.log(`Fetching teams for competition: ${competition}`);

        // Fetch teams from the specific competition
        const teamsResponse = await axios.get(`${config.baseURL}/competitions/${competition}/teams`, {
            headers: { 'X-Auth-Token': config.apiKey },
        });

        const teamsArray = teamsResponse.data.teams || [];
        const team = teamsArray.find(t => t.name.toLowerCase() === teamName.toLowerCase());
        if (!team) {
            throw new Error('Team not found');
        }

        console.log(`Fetching matches for team: ${team.name}, ID: ${team.id}`);

        // Fetch matches for the team using the team ID (without date range)
        const matchesResponse = await axios.get(`${config.baseURL}/teams/${team.id}/matches`, {
            headers: { 'X-Auth-Token': config.apiKey }
        });

        return {
            name: team.name,
            matches: matchesResponse.data.matches || [] // No date filtering
        };
    } catch (error) {
        console.error("Error fetching team data:", error.message);
        console.error("Error Details:", error.response ? error.response.data : error); // Log more detailed error
        throw new Error("Could not fetch team data.");
    }
};
