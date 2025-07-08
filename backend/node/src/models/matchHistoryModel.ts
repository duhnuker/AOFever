import { pool } from '../config/database.js';

export interface MatchData {
    id: number;
    tournament: string;
    date: string;
    series?: string;
    court: string;
    surface: string;
    round: string;
    best_of: number;
    player_1: string;
    player_2: string;
    winner: string;
    rank_1: number;
    rank_2: number;
    pts_1: number;
    pts_2: number;
    odd_1: number;
    odd_2: number;
    score: string;
}

export const fetchAtpData = async (): Promise<MatchData[]> => {
    const result = await pool.query("SELECT * FROM atp");
    return result.rows;
}

export const fetchWtaData = async (): Promise<MatchData[]> => {
    const result = await pool.query("SELECT * FROM wta");
    return result.rows;
}