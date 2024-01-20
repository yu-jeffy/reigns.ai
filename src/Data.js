// Data.js
// Stores our game state in useContext

import React, { createContext, useState, useContext } from 'react';

// Initial state for the game status with dynamic categories
const initialGameState = {
  categories: [],
  yearsInReign: 1,
  effects: [],
  keyEvents: [],
};

// Create a context for the game
const GameContext = createContext();

// Custom hook to use the game context
export const useGameContext = () => useContext(GameContext);

// Provider component
export const GameProvider = ({ children }) => {
  // State for the game settings
  const [settings, setSettings] = useState({
    numberOfOptions: 4,
    difficulty: 'medium',
    theme: 'cyberpunk, William Gibson\'s Sprawl',
  });

  // State for the game status
  const [gameState, setGameState] = useState(initialGameState);

  // State for previous turns
  const [previousTurns, setPreviousTurns] = useState([]);

  // State for the OpenAI API Key
  const [apiKey, setApiKey] = useState('');

  // Function to update the game state
  const updateGameState = (updates) => {
    setGameState((prev) => ({ ...prev, ...updates }));
  };

  // Function to record a new turn
  const recordTurn = (turn) => {
    setPreviousTurns((prevTurns) => [...prevTurns, turn]);
  };

  // Function to update the API Key
  const updateApiKey = (key) => {
    setApiKey(key);
  };

  // Function to update the game settings
  const updateSettings = (newSettings) => {
    setSettings((prevSettings) => ({ ...prevSettings, ...newSettings }));
  };

  // Function to set the categories based on the theme
  const setCategories = (themeCategories) => {
    setGameState((prevGameState) => ({
      ...prevGameState,
      categories: themeCategories,
    }));
  };

  // The value provided to the context consumers
  const value = {
    settings,
    updateSettings,
    gameState,
    updateGameState,
    previousTurns,
    recordTurn,
    apiKey,
    updateApiKey,
    setCategories,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

