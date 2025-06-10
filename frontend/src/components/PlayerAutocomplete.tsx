import React, { useState, useEffect, useRef } from 'react';
import { TextArea, Box } from '@radix-ui/themes';

interface PlayerAutocompleteProps {
  placeholder: string;
  onPlayerSelect: (player: string) => void;
  players: string[];
}

const PlayerAutocomplete: React.FC<PlayerAutocompleteProps> = ({
  placeholder,
  onPlayerSelect,
  players
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputValue.length > 0) {
      const filteredSuggestions = players.filter(player =>
        player.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 10);
      
      setSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, players]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    setActiveSuggestion(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    onPlayerSelect(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[activeSuggestion]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  return (
    <Box style={{ position: 'relative', width: '100%' }}>
      <TextArea
        ref={inputRef}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        onFocus={() => inputValue && setShowSuggestions(suggestions.length > 0)}
      />
      
      {showSuggestions && (
        <Box
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {suggestions.map((suggestion, index) => (
            <Box
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                backgroundColor: index === activeSuggestion ? '#f0f0f0' : 'white',
                borderBottom: index < suggestions.length - 1 ? '1px solid #eee' : 'none'
              }}
              onMouseEnter={() => setActiveSuggestion(index)}
            >
              {suggestion}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PlayerAutocomplete;
