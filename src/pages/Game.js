// Game.js
// Where the user plays the game

import React, { useState } from 'react';
import { useGameContext } from '../Data';
import axios from 'axios';
import styles from './Game.module.css';
import { useNavigate } from 'react-router-dom';

const Game = () => {
  const navigate = useNavigate();
  const {
    settings,
    updateSettings,
    updateApiKey,
    setCategories,
    gameState,
    apiKey,
  } = useGameContext();

  // Placeholder data until fetched from context or API
  const currentTurnDescription = "The neon lights flicker as you ponder your next decision...";
  const numberOfOptions = 4; // Replace with actual number from settings
  const options = new Array(settings.numberOfOptions).fill(0).map((_, i) => ({
    index: i,
    description: `Option ${i + 1}`
  }));

  // Function to format categories
  const formatCategories = () => {
    return gameState.categories
      .map(category => `- ${category.categoryName}`)
      .join('\n');
  };

  // Create the game prompt using the gameState and settings
  const systemPrompt = `
        You are a game engine for a text based version of Reigns.

        The game setting is: ${settings.theme}.

        Keep track of the following every turn:
        - Categories: ${formatCategories()}
        - Years in reign
        - Effects or stats (permanent or years remaining)
        - Key events

        Create unique, novel, challenging scenarios every turn. Present ${settings.numberOfOptions} options every turn.

        Occasionally, rarely present options that will provide the user an effect or stat, positive or negative, permanent or temporary, that will be factored into their scoring while it is in effect. These effects should be uncommon, most turns should have options that have no effect.

        Extremely rarely present scenarios, called "key events", with severe, high stakes outcomes, extraordinarily challenging, that affect the game going forward. These should only occur on a minuscule chance.

        Use the decision made in key events to modify the storytelling once they occur.
        `;

  const scenarioPrompt = `
        You are a game engine for a text-based version of Reigns. \n
        The theme of the game is "${settings.theme}".\n
        There are ${settings.numberOfOptions} choices to be made this turn, affecting the following categories: ${formatCategories()}.\n
        The difficulty level is set to "${settings.difficulty}".\n
        Generate a scenario for this turn, followed by ${settings.numberOfOptions} choices.\n
        Each choice should include the index, a description, and the effects on each category in the form of increments or decrements.\n
        \n
        Use the EXACT following response format:\n
    
        {
        "scenario": "A description of the current situation in the game...",
        "choices": [
            {
            "index": 0,
            "description": "Choice 1 description.",
            "categoryUpdates": {
                "CategoryName1": 0,
                "CategoryName2": -5,
                "CategoryName3": 0,
                "CategoryName4": 10
            }
            },
            {
            "index": 1,
            "description": "Choice 2 description.",
            "categoryUpdates": {
                "CategoryName1": 5,
                "CategoryName2": 0,
                "CategoryName3": -10,
                "CategoryName4": 0
            }
            }
            // ...additional choices
        ]
        }
        \n
        Return ONLY the scenario and choices. Return ONLY JSON, nothing else.
    `;

  const handleGenerateScenario = () => {
    generateScenario();
  };

  // Function to generate a scenario
  const generateScenario = async () => {
    const promptMessages = [
      {
        "role": "system",
        "content": scenarioPrompt
      },
      {
        "role": "user",
        "content": `Generate a scenario for this turn.`
      }
    ];

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-4-1106-preview",
        messages: promptMessages,
        temperature: 1,
        seed: Math.floor(Math.random() * 10000000)
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const rawResponse = response.data.choices[0].message.content;
      let scenario;

      // Check if the response is surrounded by markdown
      if (rawResponse.startsWith("```json") && rawResponse.endsWith("```")) {
        // Extract the JSON string from the markdown
        const jsonStr = rawResponse.substring(7, rawResponse.length - 3).trim();
        scenario = JSON.parse(jsonStr);
      } else {
        // Directly parse the response as JSON
        scenario = JSON.parse(rawResponse.trim());
      }

      console.log(scenario)


    }
    catch (error) {
      console.error('Error generating scenario for this turn:', error);
    }
  }

  return (
    <div className={styles.gameContainer}>
      <div className={styles.leftSidebar}>
        Theme: {settings.theme} <br />
        Difficulty: {settings.difficulty} <br />
        Number of Options: {settings.numberOfOptions} <br />
        API Key: {apiKey} <br />
        Categories:
        {gameState.categories && gameState.categories.map((category, index) => (
          <div key={index}>
            {category.categoryName}
            <br/>
            {category.score}
            <br/>
          </div>
        ))}

      </div>
      <div className={styles.mainContent}>
        <div className={styles.currentTurn}>
          <p>{currentTurnDescription}</p>
        </div>
        <div className={styles.options}>
          {options.map((option) => (
            <div key={option.index} className={styles.option}>
              <p>{option.description}</p>
            </div>
          ))}
        </div>
        <div className={styles.footer}>
          {/* Footer buttons */}
          <button>Previous Turns</button>
          <button>Settings</button>
          <button onClick={handleGenerateScenario}>Test Turn</button>
        </div>
      </div>
    </div>
  );
};

export default Game;