import { useState, useEffect } from 'react';
import axios from 'axios';

export interface AtpMatch {
  surface: string;
  round: string;
  best_of: number;
}

export interface AtpFilters {
  surfaces: string[];
  rounds: string[];
  bestOfs: number[];
}

export const useAtpData = () => {
  const [filters, setFilters] = useState<AtpFilters>({
    surfaces: [],
    rounds: [],
    bestOfs: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAtpData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/matchhistory/atpdata`);
        
        const atpData: AtpMatch[] = response.data;
        
        const surfaceSet = new Set<string>();
        const roundSet = new Set<string>();
        const bestOfSet = new Set<number>();

        atpData.forEach((match) => {
          if (match.surface) surfaceSet.add(match.surface);
          if (match.round) roundSet.add(match.round);
          if (match.best_of) bestOfSet.add(match.best_of);
        })

        setFilters({
          surfaces: Array.from(surfaceSet).sort(),
          rounds: Array.from(roundSet).sort(),
          bestOfs: Array.from(bestOfSet).sort((a, b) => a - b)
        });
        
      } catch (err) {
        console.error('Error fetching ATP data:', err);
        setError('Failed to load ATP data');
      } finally {
        setLoading(false);
      }
    };

    fetchAtpData();
  }, []);

  return { filters, loading, error };
};
