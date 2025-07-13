import { Request, Response } from 'express';
import { fetchAtpMatchFilters, fetchWtaMatchFilters, fetchAtpPlayerStats, fetchWtaPlayerStats } from '../models/matchHistoryModel.js';

export const getAtpMatchFilters = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await fetchAtpMatchFilters();
        res.json(data);
    } catch (error: unknown) {
        console.error('Database error:', error);
        res.status(500).json({ error: "Error fetching atp match data"});
    }
};

export const getAtpPlayerStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await fetchAtpPlayerStats();
        res.json(data);
    } catch (error: unknown) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Error fetching atp playerstats data"});
    }
};

export const getWtaPlayerStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await fetchWtaPlayerStats();
        res.json(data);
    } catch (error: unknown) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Error fetching wta playerstats data"});
    }
};

export const getWtaMatchFilters = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await fetchWtaMatchFilters();
        res.json(data);
    } catch (error: unknown) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Error fetching wta match data"});
    }
};