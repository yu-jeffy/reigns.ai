// Game.js
// Where the user plays the game

import React, { useState, useEffect, useRef } from 'react';
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
    updateGameState,
    recordTurn,
    previousTurns
  } = useGameContext();

  const [currentOptions, setCurrentOptions] = useState({ choices: [] })
  const [showOptions, setShowOptions] = useState(true);
  const [currentScenario, setCurrentScenario] = useState("Welcome! Game is initializing...")
  const [aftermath, setAftermath] = useState("")


  // Complete turn state
  const [currentTurn, setCurrentTurn] = useState({
    currentScenario: "",
    currentOptions: [],
    optionChosen: {
      index: null,
      description: "",
      categoryUpdates: {}
    },
    afterMath: ""
  });

  // Function to reset the turn
  const resetTurn = () => {
    setCurrentTurn({ currentScenario: "", currentOptions: [], optionChosen: null, afterMath: "" })
  };

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
    let oldYears = gameState.yearsInReign;

    updateGameState({yearsInReign: oldYears + 1});

    setCurrentScenario("Loading turn...");
    setAftermath("");
    console.log("generating scenario...");
    const promptMessages = [
      {
        "role": "system",
        "content": scenarioPrompt
      },
      {
        "role": "user",
        "content": `Generate a scenario for this turn. Return ONLY valid JSON.`
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

      setCurrentOptions({ choices: scenario.choices });
      setShowOptions(true);
      setCurrentScenario(scenario.scenario)
      setCurrentTurn({ currentScenario: scenario.scenario, currentOptions: scenario.choices, optionChosen: null, afterMath: "" })
      console.log(scenario)


    }
    catch (error) {
      console.error('Error generating scenario for this turn:', error);
      console.log('retrying generateScenario')

      let decrementYears = gameState.yearsInReign;

      updateGameState({yearsInReign: decrementYears - 1});
      generateScenario();
    }
  }


  // Run generateScenario when page loads
  const startGame = useRef(false);

  useEffect(() => {
    if (!startGame.current) {
      startGame.current = true;
      generateScenario();
    }
  }, []); // empty array to run only once on mount


  // Function to handle option selection and update scores
  const optionChosen = async (chosenOption) => {
    // Copy the current categories
    const updatedCategories = gameState.categories.map((category) => {
      // Check if this category has an update in the chosen option (should always have one)
      if (chosenOption.categoryUpdates.hasOwnProperty(category.categoryName)) {
        // Calculate the new score
        const change = chosenOption.categoryUpdates[category.categoryName];
        return {
          ...category,
          score: category.score + change
        };
      }
      // If there is no update for this category, return it unchanged
      return category;
    });

    setShowOptions(false);

    setCurrentScenario("Processing decision...");

    // Update the gameState with the new scores
    updateGameState({categories: updatedCategories});

    setCurrentTurn(prevTurn => ({
      ...prevTurn, // Preserve other properties of the currentTurn state
      optionChosen: chosenOption // Only update the optionChosen property
    }));

    await generateAftermath(chosenOption);



    // Construct the turn object based on the chosen option
    const turn = {
      scenario: currentTurn.currentScenario,
      options: currentTurn.currentOptions,
      chosenOption: chosenOption,
      afterMath: currentTurn.afterMath,
    };

    // Record the turn
    recordTurn(turn);

    setCurrentOptions({ choices: [] })

    setCurrentScenario("Loading turn...")

    await generateScenario()

  }


  const generateAftermath = async (chosenOption) => {
    const promptMessages = [
      {
        "role": "system",
        "content": `You are a game engine for a text based version of Reigns.\n

        The game setting is: ${settings.theme}.\n

        You are tasked with generating storytelling text based on the user decision in the past turn.
        `
      },
      {
        "role": "user",
        "content": `Generate a two storytelling sentences for the aftermath/consequences of the choice for this turn.

        Turn Scenario: ${currentScenario}\n

        User Choice: ${chosenOption.description}\n
        
        `
      }
    ];


    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-4-1106-preview",
        messages: promptMessages,
        temperature: 1,
        max_tokens: 100,
        seed: Math.floor(Math.random() * 10000000)
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const aftermathResponse = response.data.choices[0].message.content;

      setCurrentTurn(prevTurn => ({
        ...prevTurn, // Preserve other properties of the currentTurn state
        afterMath: aftermathResponse
      }));
      setAftermath(aftermathResponse)

    }
    catch (error) {
      console.error('Error generating aftermath for this turn:', error);
    }

  }

  return (
    <div className={styles.gameContainer}>
      <div className={styles.leftSidebar}>
        <br></br>
        Years in Reign: {gameState.yearsInReign}
        <br></br><br></br>
        {gameState.categories && gameState.categories.map((category, index) => (
          <div key={index}>
            {category.categoryName}
            <br />
            {category.score}
            <br /><br />
          </div>
        ))}
        <br></br><br></br>
      </div>
      <div className={styles.mainContent}>
        <div className={styles.currentTurnContainer}>
          <span>Scenario:<br></br> {currentScenario}</span>
          <div style={{ flexGrow: 1 }} />
          <span>Outcome of Last Move:<br></br> {aftermath}</span>
        </div>
        <div className={styles.options}>
          {showOptions && currentOptions.choices && currentOptions.choices.length > 0 &&
            currentOptions.choices.map((option) => (
              <div key={option.index} className={styles.option} onClick={() => optionChosen(option)} >
                <p>{option.description}</p>
                <div className={styles.categoryUpdates}>
                  {Object.entries(option.categoryUpdates).map(([categoryName, change], index) => {
                    // If the change is not zero, show it with a plus or minus sign
                    return (
                      change !== 0 && (
                        <span key={index}>
                          {`${categoryName}: ${change > 0 ? `+${change}` : change}`}
                          <br />
                        </span>
                      )
                    );
                  })}
                </div>
              </div>
            ))
          }
        </div>
        <div className={styles.footer}>
          {/* Footer buttons */}
          <button className={styles.gameButton} >Previous Turns</button>
          <button className={styles.gameButton} >Restart</button>
          {/*<button className={styles.gameButton} onClick={handleGenerateScenario}>Test Turn</button>*/}
        </div>
      </div>
    </div>
  );
};

export default Game;