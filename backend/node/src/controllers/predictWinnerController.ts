import { Request, Response } from 'express';
import axios from 'axios';
import { predictMensWinner, validatePredictionInput } from '../models/predictWinnerModel.js';

export interface PlayerInput {
    player1: string;
    player2: string;
    surface: string;
    round: string;
    bestOf: string;
    player1Odds: string;
    player2Odds: string;
    player1Stats: {
        rank: string;
        points: string;
        date: string;
    };
    player2Stats: {
        rank: string;
        points: string;
        date: string;
    };
}

export const predictMensWinnerController = async (req: Request, res: Response): Promise<void> => {
    try {
        const requestData: PlayerInput = req.body;
        
        console.log('Received prediction request:', JSON.stringify(requestData, null, 2));

        const validation = validatePredictionInput(requestData);
        if (!validation.isValid) {
            res.status(400).json({ 
                error: validation.error,
                code: 'VALIDATION_ERROR'
            });
            return;
        }

        const { 
            player1, 
            player2, 
            surface, 
            round, 
            bestOf, 
            player1Odds, 
            player2Odds,
            player1Stats,
            player2Stats
        } = requestData;

        console.log(`Processing mens prediction request for ${player1} vs ${player2}`);
        console.log(`Match details: ${surface} surface, ${round} round, best of ${bestOf}`);
        console.log(`Odds: ${player1} (${player1Odds}), ${player2} (${player2Odds})`);
        console.log('Player 1 stats:', player1Stats);
        console.log('Player 2 stats:', player2Stats);

        const prediction = await predictMensWinner(
            player1, 
            player2, 
            surface, 
            round, 
            bestOf, 
            player1Odds, 
            player2Odds,
            player1Stats,
            player2Stats
        );

        console.log('Sending prediction response to frontend:', prediction);
        
        res.json({
            success: true,
            prediction: {
                winner: prediction.winner,
                confidence: prediction.confidence,
                confidencePercentage: Math.round(prediction.confidence * 100)
            },
            matchDetails: {
                player1,
                player2,
                surface,
                round,
                bestOf
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Error in predictmenswinner route:", error);

        if (axios.isAxiosError(error)) {
            const status = error.response?.status || 500;
            const message = error.response?.data?.detail || error.message;

            res.status(status).json({
                success: false,
                error: "Failed to get prediction from ML service",
                details: message,
                code: 'FASTAPI_ERROR',
                timestamp: new Date().toISOString()
            });
            return;
        }

        if (error instanceof Error) {
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'PREDICTION_ERROR',
                timestamp: new Date().toISOString()
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: "Internal server error",
            code: 'INTERNAL_ERROR',
            timestamp: new Date().toISOString()
        });
    }
};
