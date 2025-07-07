import { useState, useEffect } from 'react';
import axios from 'axios';

export interface WtaMatch {
  Surface: string;
  Round: string;
  'Best of': string;
}

export interface WtaFilters {
  surfaces: string[];
  rounds: string[];
  bestOfs: string[];
}

export const useWtaData = () => {
  const [filters, setFilters] = useState<WtaFilters>({
    surfaces: [],
    rounds: [],
    bestOfs: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWtaData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('../../wta.csv');
        
        // Parse CSV data
        const csvData = response.data;
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');
        
        const surfaceSet = new Set<string>();
        const roundSet = new Set<string>();
        const bestOfSet = new Set<string>();

        // Skip header row and process data
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line) {
            const values = line.split(',');
            if (values.length >= headers.length) {
              const surface = values[3]?.trim();
              const round = values[4]?.trim();
              const bestOf = values[5]?.trim();

              if (surface) surfaceSet.add(surface);
              if (round) roundSet.add(round);
              if (bestOf) bestOfSet.add(bestOf);
            }
          }
        }

        setFilters({
          surfaces: Array.from(surfaceSet).sort(),
          rounds: Array.from(roundSet).sort(),
          bestOfs: Array.from(bestOfSet).sort()
        });
      } catch (err) {
        console.error('Error fetching WTA data:', err);
        setError('Failed to load WTA data');
      } finally {
        setLoading(false);
      }
    };

    fetchWtaData();
  }, []);

  return { filters, loading, error };
};
