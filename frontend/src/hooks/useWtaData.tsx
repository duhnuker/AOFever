import { useState, useEffect } from 'react';
import axios from 'axios';

export interface WtaMatch {
  surface: string;
  round: string;
  best_of: number;
}

export interface WtaFilters {
  surfaces: string[];
  rounds: string[];
  bestOfs: number[];
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
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/matchhistory/wtadata`);

        const wtaData: WtaMatch[] = response.data;

        const surfaceSet = new Set<string>();
        const roundSet = new Set<string>();
        const bestofSet = new Set<number>();
        
        wtaData.forEach((match) => {
          if (match.surface) surfaceSet.add(match.surface);
          if (match.round) roundSet.add(match.round);
          if (match.best_of) bestofSet.add(match.best_of);
        })

        setFilters({
          surfaces: Array.from(surfaceSet).sort(),
          rounds: Array.from(roundSet).sort(),
          bestOfs: Array.from(bestofSet).sort((a, b) => a - b)
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
