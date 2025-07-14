import { pool } from '../config/database.js';

export interface MatchFilters {
    surfaces: string[];
    rounds: string[];
    best_ofs: number[];
};

export interface PlayerStats {
    player: string;
    rank: number;
    points: number;
    date: string;
};

const mapMatchFilters = (surfaces: { surface: string}[], rounds: { round: string}[], best_ofs: { best_of: number}[]): MatchFilters => ({
    surfaces: surfaces.map(row => row.surface),
    rounds: rounds.map(row => row.round),
    best_ofs: best_ofs.map(row => row.best_of)
});

export const fetchAtpMatchFilters = async (): Promise<MatchFilters> => {
    const surfaces = await pool.query("SELECT DISTINCT surface FROM atp");
    const rounds = await pool.query("SELECT DISTINCT round FROM atp");
    const bestOf = await pool.query("SELECT DISTINCT best_of FROM atp");
    
    return mapMatchFilters(surfaces.rows, rounds.rows, bestOf.rows);
};

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
};

export const fetchWtaMatchFilters = async (): Promise<MatchFilters> => {
    const surfaces = await pool.query("SELECT DISTINCT surface FROM wta");
    const rounds = await pool.query("SELECT DISTINCT round FROM wta");
    const bestOf = await pool.query("SELECT DISTINCT best_of FROM wta");
    
    return mapMatchFilters(surfaces.rows, rounds.rows, bestOf.rows);
};

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
};