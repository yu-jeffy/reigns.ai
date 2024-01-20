// Settings.js
// Where the user can set the game settings

import React, { useState, useEffect } from 'react';
import { useGameContext } from '../Data';
import axios from 'axios';
import styles from './Settings.module.css';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const navigate = useNavigate();
    const {
        settings,
        updateSettings,
        updateApiKey,
        setCategories,
        gameState,
        apiKey,
    } = useGameContext();

    const [isSaving, setIsSaving] = useState(false);

    const handleApiKeyChange = (event) => {
        updateApiKey(event.target.value);
    };

    const handleOptionsChange = (event) => {
        updateSettings({ numberOfOptions: event.target.value });
    };

    const handleDifficultyChange = (event) => {
        updateSettings({ difficulty: event.target.value });
    };

    const handleThemeChange = (event) => {
        updateSettings({ theme: event.target.value });
    };

    // State to control when to navigate to /play
    const [shouldNavigate, setShouldNavigate] = useState(false);

    useEffect(() => {
        // If categories are set and we should navigate, then navigate to /play
        if (shouldNavigate && gameState.categories.length > 0) {
            navigate('/play');
            setShouldNavigate(false); // Reset the flag after navigating
        }
    }, [gameState.categories, shouldNavigate, navigate]);

    const generateCategories = async () => {
        setIsSaving(true); // Start saving

        const promptMessages = [
            {
                "role": "system",
                "content": ""
            },
            {
                "role": "user",
                "content": `You are a game engine for Reigns. You are designing the game setup.\n
                The theme of this game will be: ${settings.theme}\n
                Generate ${settings.numberOfOptions} categories that the user will need to maintain in this format, default 50 score for each.\n
                Respond in this EXACT format: \n

              \`\`\`json
              [
                { "categoryName": "Name", "score": 50 },
                { "categoryName": "Name", "score": 50 },
                // ... additional categories
              ]
              \`\`\`
              
              Return ONLY JSON in your response.
              `
            }
        ];

        try {

            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-4-1106-preview",
                messages: promptMessages,
                temperature: 1
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
            });

            const rawResponse = response.data.choices[0].message.content;
            let categories;

            // Check if the response is surrounded by markdown
            if (rawResponse.startsWith("```json") && rawResponse.endsWith("```")) {
                // Extract the JSON string from the markdown
                const jsonStr = rawResponse.substring(7, rawResponse.length - 3).trim();
                categories = JSON.parse(jsonStr);
            } else {
                // Directly parse the response as JSON
                categories = JSON.parse(rawResponse.trim());
            }
            

            setCategories(categories);
            setIsSaving(false); // Saving finished
            setShouldNavigate(true); // Set the flag to trigger navigation in useEffect

            navigate('/play');
        } catch (error) {
            console.error('Error generating categories:', error);
            setIsSaving(false); // Saving failed
        }
        
    };

    const handleFinish = () => {
        generateCategories();
    };

    return (
        <div className="{styles.settingsContainer}">
            <h1>Game Settings</h1>
            <div className="{styles.settingsRow}">
                <label>OpenAI API Key:</label>
                <input type="text" value={settings.apiKey} onChange={handleApiKeyChange} />
            </div>
            <div className="{styles.settingsRow}">
                <label>Number of options per turn:</label>
                <div>
                    <input
                        type="range"
                        min="2"
                        max="8"
                        value={settings.numberOfOptions}
                        onChange={handleOptionsChange}
                    />
                    <span>{settings.numberOfOptions}</span>
                </div>
            </div>
            <div className="{styles.settingsRow}">
                <label>Difficulty:</label>
                <div className="{styles.radioButtons}">
                    {['easy', 'medium', 'hard', 'impossible'].map((difficulty) => (
                        <label key={difficulty}>
                            <input
                                type="radio"
                                value={difficulty}
                                checked={settings.difficulty === difficulty}
                                onChange={handleDifficultyChange}
                            />
                            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </label>
                    ))}
                </div>
            </div>
            <div className="{styles.settingsRow}">
                <label>Theme:</label>
                <textarea value={settings.theme} onChange={handleThemeChange}></textarea>
            </div>
            <div className="{styles.settingsRow}">
                <button onClick={handleFinish} disabled={isSaving}>Finish</button>
                {isSaving && <label className={styles.savingLabel}>Saving...</label>}
            </div>
        </div>
    );
};

export default Settings;