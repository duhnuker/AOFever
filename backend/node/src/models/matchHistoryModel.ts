import { pool } from '../config/database.js';

export interface MatchFilters {
    surface: string;
    round: string;
    best_of: number;
}

export const fetchAtpMatchFilters = async (): Promise<MatchFilters[]> => {
    const result = await pool.query("SELECT surface, round, best_of FROM atp");
    return result.rows;
}

export const fetchWtaMatchFilters = async (): Promise<MatchFilters[]> => {
    const result = await pool.query("SELECT surface, round, best_of FROM wta");
    return result.rows;
}