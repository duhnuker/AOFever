import { useState, useEffect } from 'react';

interface PlayerStats {
  rank: string;
  points: string;
  date: string;
}

// CSV parsing handling quoted fields
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
};

export const useWtaPlayerData = () => {
  const [players, setPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        const response = await fetch('../../wta.csv');
        if (!response.ok) {
          throw new Error('Failed to fetch player data');
        }

        const csvText = await response.text();
        const lines = csvText.split('\n');

        const playerSet = new Set<string>();
        const parsedData: string[][] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line) {
            try {
              const columns = parseCSVLine(line);

              if (columns.length >= 9) {
                parsedData.push(columns);

                const player1 = columns[7]?.trim();
                const player2 = columns[8]?.trim();

                // Add players to set if they're valid
                if (player1 && player1 !== '-1' && player1 !== '' && player1 !== 'Player_1') {
                  playerSet.add(player1);
                }
                if (player2 && player2 !== '-1' && player2 !== '' && player2 !== 'Player_2') {
                  playerSet.add(player2);
                }
              }
            } catch (parseError) {
              console.warn(`Error parsing line ${i + 1}:`, line);
            }
          }
        }

        setCsvData(parsedData);

        // Convert set to sorted array
        const uniquePlayers = Array.from(playerSet).sort();
        console.log(`Loaded ${uniquePlayers.length} unique players`);
        setPlayers(uniquePlayers);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error loading player data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPlayerData();
  }, []);

  const getPlayerStats = (playerName: string): PlayerStats | null => {
    if (!csvData.length || !playerName) return null;

    // Find the most recent record for the player (search from end to beginning)
    for (let i = csvData.length - 1; i >= 0; i--) {
      const row = csvData[i];
      const player1 = row[7]?.trim();
      const player2 = row[8]?.trim();

      if (player1 === playerName || player2 === playerName) {
        const isPlayer1 = player1 === playerName;

        return {
          rank: isPlayer1 ? row[10] || "N/A" : row[11] || "N/A",
          points: isPlayer1 ? row[12] || "N/A" : row[13] || "N/A",
          date: row[1] || "N/A"
        };
      }
    }
    return null;
  };

  return {
    players,
    loading,
    error,
    getPlayerStats
  };
};
