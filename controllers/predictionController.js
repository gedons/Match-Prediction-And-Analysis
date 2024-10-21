const footballService = require('../services/footballService');
const bettingService = require('../services/bettingService');

// Cache to store team names after fetching from Football-Data API
let teamNameCache = {};

// Fetch and cache team names dynamically
async function fetchAndCacheTeamNames(competition) {
    if (teamNameCache[competition]) {
        return teamNameCache[competition]; // Return cached teams if available
    }

    try {
        const teams = await footballService.getCompetitionTeams(competition); // Fetch teams from API
        const teamMap = {};

        // Log the available teams for debugging
        console.log("Available teams for competition:", competition, teams.map(team => team.name));

        teams.forEach(team => {
            teamMap[team.name.toLowerCase()] = team.name; // Store names in lowercase for easier matching
        });

        teamNameCache[competition] = teamMap; // Cache the result
        return teamMap;
    } catch (error) {
        console.error("Error fetching team names:", error.message);
        throw new Error("Could not fetch team names.");
    }
}

// Normalize team names based on fetched data
async function normalizeTeamName(team, competition) {
    const teamMap = await fetchAndCacheTeamNames(competition);

    // First, try direct match
    const normalizedTeam = teamMap[team.toLowerCase()];
    if (normalizedTeam) return normalizedTeam;

    // Fallback: attempt partial matching (ignoring "FC", spacing, etc.)
    const matchedTeam = Object.keys(teamMap).find(apiTeamName => {
        return apiTeamName.replace(/fc/i, '').trim() === team.toLowerCase().replace(/fc/i, '').trim();
    });

    if (matchedTeam) {
        return teamMap[matchedTeam];
    } else {
        console.error(`No match found for team: ${team}`);
        throw new Error("Team not found");
    }
}

exports.getPrediction = async (req, res) => {
    try {
        let { competition, teamA, teamB } = req.body;

        // Validate input
        if (!competition || !teamA || !teamB) {
            return res.status(400).json({ error: "Please provide competition and teams." });
        }

        // Normalize team names for Football-Data API using dynamic fetching
        teamA = await normalizeTeamName(teamA, competition);
        teamB = await normalizeTeamName(teamB, competition);

        console.log(`Normalized teams: ${teamA} vs ${teamB}`);

        // Fetch data for both teams
        const teamAData = await footballService.getTeamData(teamA, competition);
        const teamBData = await footballService.getTeamData(teamB, competition);

        // Fetch competition standings
        const standings = await footballService.getCompetitionStandings(competition);

        // Fetch recent head-to-head matches between the two teams
        const recentMatches = await footballService.getRecentMatches(teamAData.id, teamBData.id);
        let headToHeadData = [];
        if (recentMatches.length > 0) {
            const lastMatchId = recentMatches[0].id;
            headToHeadData = await footballService.getHeadToHeadData(lastMatchId);
        }

        // Generate a smarter prediction based on the collected data
        const { prediction, confidenceScore } = ruleBasedPrediction(teamAData, teamBData, standings, headToHeadData);

        // Get betting odds using the team names
        const bettingOdds = await bettingService.getBettingOdds(teamAData.name, teamBData.name);
        
        return res.json({
            prediction: prediction,
            confidenceScore: confidenceScore, // Include the confidence score in the response
            teamA: teamAData.name,
            teamB: teamBData.name,
            standings,
            headToHead: headToHeadData,
            bettingOdds // Include the odds in the response
        });
    } catch (error) {
        console.error("Error in getPrediction:", error.message);
        return res.status(500).json({ error: "Could not generate prediction." });
    }
};


// function to demonstrate prediction logic 
function ruleBasedPrediction(teamAData, teamBData, standings, headToHeadData) {
    // Prediction logic based on various factors (form, standings, head-to-head, etc.)
    const teamAForm = calculateForm(teamAData.matches);
    const teamBForm = calculateForm(teamBData.matches);

    let confidenceScore = 0; // Initialize confidence score

    //  head-to-head logic
    if (headToHeadData.length > 0) {
        const lastMatch = headToHeadData[0];
        if (lastMatch.score.fullTime.homeTeam > lastMatch.score.fullTime.awayTeam) {
            confidenceScore += 1;
            return { prediction: `${lastMatch.homeTeam.name} has a slight advantage based on recent encounters!`, confidenceScore };
        } else if (lastMatch.score.fullTime.awayTeam > lastMatch.score.fullTime.homeTeam) {
            confidenceScore += 1;
            return { prediction: `${lastMatch.awayTeam.name} has a slight advantage based on recent encounters!`, confidenceScore };
        }
    }

    //  form-based logic
    if (teamAForm > teamBForm) {
        confidenceScore += 2;
        return { prediction: `${teamAData.name} is more likely to win based on current form!`, confidenceScore };
    } else if (teamBForm > teamAForm) {
        confidenceScore += 2;
        return { prediction: `${teamBData.name} is more likely to win based on current form!`, confidenceScore };
    } else {
        return { prediction: "It's going to be a close game, likely a draw!", confidenceScore };
    }
}

// Simple form calculation based on recent match results ()
function calculateForm(matches) {
    let points = 0;
    matches.forEach(match => {
        if (match.score.fullTime.homeTeam > match.score.fullTime.awayTeam) {
            points += (match.homeTeam.id === match.team.id) ? 3 : 0;
        } else if (match.score.fullTime.awayTeam > match.score.fullTime.homeTeam) {
            points += (match.awayTeam.id === match.team.id) ? 3 : 0;
        } else {
            points += 1; // Draw
        }
    });
    return points;
}
