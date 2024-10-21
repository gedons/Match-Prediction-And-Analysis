const axios = require('axios');
const config = require('../config/footballAPI');

// Fetch team data for a specific team in a competition
exports.getTeamData = async (teamName, competition) => {
    try {
        const teamsResponse = await axios.get(`${config.baseURL}/competitions/${competition}/teams`, {
            headers: { 'X-Auth-Token': config.apiKey },
        });

        const teamsArray = teamsResponse.data.teams || [];
        const team = teamsArray.find(t => t.name.toLowerCase() === teamName.toLowerCase());
        if (!team) {
            throw new Error('Team not found');
        }

        const matchesResponse = await axios.get(`${config.baseURL}/teams/${team.id}/matches`, {
            headers: { 'X-Auth-Token': config.apiKey }
        });

        return {
            id: team.id,  // Include team ID for other uses
            name: team.name,
            matches: matchesResponse.data.matches
        };
    } catch (error) {
        handleAxiosError("Error fetching team data", error);
        throw new Error("Could not fetch team data.");
    }
};

// Fetch competition standings
exports.getCompetitionStandings = async (competitionId) => {
    try {
        const standingsResponse = await axios.get(`${config.baseURL}/competitions/${competitionId}/standings`, {
            headers: { 'X-Auth-Token': config.apiKey }
        });

        return standingsResponse.data.standings || [];
    } catch (error) {
        handleAxiosError("Error fetching competition standings", error);
        throw new Error("Could not fetch competition standings.");
    }
};

// Fetch head-to-head data between two teams
exports.getHeadToHeadData = async (matchId) => {
    try {
        const h2hResponse = await axios.get(`${config.baseURL}/matches/${matchId}/head2head`, {
            headers: { 'X-Auth-Token': config.apiKey }
        });

        return h2hResponse.data.matches || [];
    } catch (error) {
        handleAxiosError("Error fetching head-to-head data", error);
        throw new Error("Could not fetch head-to-head data.");
    }
};

// Fetch recent matches between two teams
exports.getRecentMatches = async (teamAId, teamBId) => {
    try {
        const recentMatchesResponse = await axios.get(`${config.baseURL}/teams/${teamAId}/matches`, {
            headers: { 'X-Auth-Token': config.apiKey },
            params: {
                opponents: teamBId
            }
        });

        return recentMatchesResponse.data.matches || [];
    } catch (error) {
        handleAxiosError("Error fetching recent matches", error);
        throw new Error("Could not fetch recent matches.");
    }
};

// Fetch competition teams from Football-Data API
exports.getCompetitionTeams = async (competitionId) => {
    try {
        const response = await axios.get(`${config.baseURL}/competitions/${competitionId}/teams`, {
            headers: { 'X-Auth-Token': config.apiKey }
        });
        return response.data.teams || [];
    } catch (error) {
        console.error("Error fetching competition teams:", error.message);
        throw new Error("Could not fetch competition teams.");
    }
};


// Helper function for enhanced error logging
function handleAxiosError(contextMessage, error) {
    if (error.response) {
        // Server responded with a status code outside the 2xx range
        console.error(`${contextMessage}:`, {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
        });
    } else if (error.request) {
        // No response received from server
        console.error(`${contextMessage}: No response received`, {
            request: error.request
        });
    } else {
        // Something else happened while setting up the request
        console.error(`${contextMessage}:`, {
            message: error.message
        });
    }
}


// Fetch upcoming matches
exports.getUpcomingMatches = async (competition) => {
    try {
        const response = await axios.get(`${config.baseURL}/competitions/${competition}/matches`, {
            headers: { 'X-Auth-Token': config.apiKey }
        });

        // Return matches from response or an empty array if none found
        return response.data.matches || [];
    } catch (error) {
        console.error("Error fetching upcoming matches:", error.message);
        throw new Error("Could not fetch upcoming matches.");
    }
};