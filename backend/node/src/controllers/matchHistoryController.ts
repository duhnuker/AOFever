import { Request, Response } from 'express';
import { fetchAtpData, fetchWtaData } from '../models/matchHistoryModel.js';

export const getAtpData = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await fetchAtpData();
        res.json(data);
    } catch (error: unknown) {
        console.error('Database error:', error);
        res.status(500).json({ error: "Error fetching atp match data"});
    }
}

export const getWtaData = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await fetchWtaData();
        res.json(data);
    } catch (error: unknown) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Error fetching wta match data"});
    }
}