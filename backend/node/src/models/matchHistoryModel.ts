import { pool } from '../config/database.js';

export interface MatchFilters {
    surface: string;
    round: string;
    best_of: number;
}

export interface PlayerStats {
    player: string;
    rank: number;
    points: number;
    date: string;
}

export const fetchAtpMatchFilters = async (): Promise<MatchFilters[]> => {
    const result = await pool.query("SELECT surface, round, best_of FROM atp");
    return result.rows;
}

export const fetchAtpPlayerStats = async (): Promise<PlayerStats[]> => {
    const result = await pool.query(`
        WITH all_players AS (
            SELECT player_1 AS player, rank_1 AS rank, pts_1 AS points, date
            FROM atp
            UNION ALL
            SELECT player_2 AS player, rank_2 AS rank, pts_2 AS points, date
            FROM atp
        )
        SELECT DISTINCT ON (player)
            player,
            rank,
            points,
            date
        FROM all_players
        WHERE rank IS NOT NULL AND rank != -1
        ORDER BY player, date DESC;
        `);
    return result.rows;
}

export const fetchWtaMatchFilters = async (): Promise<MatchFilters[]> => {
    const result = await pool.query("SELECT surface, round, best_of FROM wta");
    return result.rows;
}

export const fetchWtaPlayerStats = async (): Promise<PlayerStats[]> => {
    const result = await pool.query(`
        WITH all_players AS (
            SELECT player_1 AS player, rank_1 AS rank, pts_1 AS points, date
            FROM wta
            UNION ALL
            SELECT player_2 AS player, rank_2 AS rank, pts_2 AS points, date
            FROM wta
        )
        SELECT DISTINCT ON (player)
            player,
            rank,
            points,
            date
        FROM all_players
        WHERE rank IS NOT NULL AND rank != -1
        ORDER BY player, date DESC;
        `);
    return result.rows;
}