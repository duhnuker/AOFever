import { Request, Response } from 'express';
import { fetchAoMensSingles, fetchAoMensDoubles, fetchAoWomensSingles, fetchAoWomensDoubles } from '../models/ausOpenFinalsModel.js';

export const getAoMensSinglesFinals = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await fetchAoMensSingles();
        res.json(data);
    } catch (error: unknown) {
        console.error('Database error:', error);
        res.status(500).json({ error: "Error fetching aus open mens singles finals data" });
    }
};

export const getAoMensDoublesFinals = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await fetchAoMensDoubles();
        res.json(data);
    } catch (error: unknown) {
        console.error('Database error:', error);
        res.status(500).json({ error: "Error fetching aus open mens doubles finals data" });
    }
};

export const getAoWomensSinglesFinals = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await fetchAoWomensSingles();
        res.json(data);
    } catch (error: unknown) {
        console.error('Database error:', error);
        res.status(500).json({ error: "Error fetching aus open womens singles finals data" });
    }
};

export const getAoWomensDoublesFinals = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await fetchAoWomensDoubles();
        res.json(data);
    } catch (error: unknown) {
        console.error('Database error:', error);
        res.status(500).json({ error: "Error fetching aus open womens doubles finals data" });
    }
};
