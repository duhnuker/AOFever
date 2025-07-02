import axios from 'axios';

export interface PredictionResult {
    winner: string;
    confidence: number;
}

export interface PlayerStats {
    rank: string;
    points: string;
    date: string;
}

const FASTAPI_BASE_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export const predictMensWinner = async (
    player1: string,
    player2: string,
    surface: string,
    round: string,
    best_of: string,
    player1Odds: string,
    player2Odds: string,
    player1Stats: PlayerStats,
    player2Stats: PlayerStats
): Promise<PredictionResult> => {
    try {
        console.log(`Calling FastAPI for mens prediction: ${player1} vs ${player2}`);

        const requestData = {
            player1,
            player2,
            surface,
            round,
            best_of,
            player1Odds,
            player2Odds,
            player1Stats,
            player2Stats
        };

        console.log('Request data:', JSON.stringify(requestData, null, 2));

        const response = await axios.post(`${FASTAPI_BASE_URL}/predictmenswinner`, requestData, {
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('FastAPI response received:', response.data);

        if (!response.data || typeof response.data.winner !== 'string' || typeof response.data.confidence !== 'number') {
            throw new Error('Invalid response format from prediction service');
        }

        return {
            winner: response.data.winner,
            confidence: response.data.confidence
        };

    } catch (error) {
        console.error('Error calling FastAPI:', error);
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNREFUSED') {
                throw new Error('FastAPI service is not available. Please ensure it is running on port 8000.');
            }
            if (error.response?.status === 503) {
                throw new Error('ML model is not loaded. Please check the FastAPI service logs.');
            }
            if (error.response?.status === 400) {
                throw new Error(`Invalid input data: ${error.response.data?.detail || 'Unknown validation error'}`);
            }
            throw new Error(`Prediction service error: ${error.response?.data?.detail || error.message}`);
        }
        throw new Error('Unknown error occurred while calling prediction service');
    }
};

export const predictWomensWinner = async (
    player1: string,
    player2: string,
    surface: string,
    round: string,
    best_of: string,
    player1Odds: string,
    player2Odds: string,
    player1Stats: PlayerStats,
    player2Stats: PlayerStats
): Promise<PredictionResult> => {
    try {
        console.log(`Calling FastAPI for womens prediction: ${player1} vs ${player2}`);

        const requestData = {
            player1,
            player2,
            surface,
            round,
            best_of,
            player1Odds,
            player2Odds,
            player1Stats,
            player2Stats
        };

        console.log('Request data:', JSON.stringify(requestData, null, 2));

        const response = await axios.post(`${FASTAPI_BASE_URL}/predictwomenswinner`, requestData, {
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('FastAPI response received:', response.data);

        if (!response.data || typeof response.data.winner !== 'string' || typeof response.data.confidence !== 'number') {
            throw new Error('Invalid response format from prediction service');
        }

        return {
            winner: response.data.winner,
            confidence: response.data.confidence
        };

    } catch (error) {
        console.error('Error calling FastAPI:', error);
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNREFUSED') {
                throw new Error('FastAPI service is not available. Please ensure it is running on port 8000.');
            }
            if (error.response?.status === 503) {
                throw new Error('ML model is not loaded. Please check the FastAPI service logs.');
            }
            if (error.response?.status === 400) {
                throw new Error(`Invalid input data: ${error.response.data?.detail || 'Unknown validation error'}`);
            }
            throw new Error(`Prediction service error: ${error.response?.data?.detail || error.message}`);
        }
        throw new Error('Unknown error occurred while calling prediction service');
    }
};

export const validatePredictionInput = (data: any): { isValid: boolean; error?: string } => {
    const { player1, player2, surface, round, bestOf, player1Odds, player2Odds, player1Stats, player2Stats } = data;

    if (!player1 || !player2) {
        return { isValid: false, error: "Both players are required" };
    }

    if (player1 === player2) {
        return { isValid: false, error: "Players must be different" };
    }

    if (!surface || !round || !bestOf) {
        return { isValid: false, error: "Surface, round, and best of are required" };
    }

    if (!player1Odds || !player2Odds) {
        return { isValid: false, error: "Both player odds are required" };
    }

    const odds1 = parseFloat(player1Odds);
    const odds2 = parseFloat(player2Odds);

    if (isNaN(odds1) || isNaN(odds2) || odds1 <= 0 || odds2 <= 0) {
        return { isValid: false, error: "Odds must be positive numbers" };
    }

    if (!player1Stats || !player2Stats) {
        return { isValid: false, error: "Both player stats are required" };
    }

    const validateStats = (stats: any, playerName: string) => {
        if (!stats.rank || !stats.points || !stats.date) {
            return { isValid: false, error: `${playerName} stats must include rank, points, and date` };
        }

        const rank = parseFloat(stats.rank);
        const points = parseFloat(stats.points);

        if (isNaN(rank) || isNaN(points) || rank < 0 || points < 0) {
            return { isValid: false, error: `${playerName} rank and points must be non-negative numbers` };
        }

        return { isValid: true };
    };

    const stats1Validation = validateStats(player1Stats, player1);
    if (!stats1Validation.isValid) {
        return stats1Validation;
    }

    const stats2Validation = validateStats(player2Stats, player2);
    if (!stats2Validation.isValid) {
        return stats2Validation;
    }

    return { isValid: true };
};
