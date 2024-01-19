// Settings.js
// Where the user can set the game settings

import React from 'react';
import { useGameContext } from '../Data';
import './Settings.module.css';

const Settings = () => {
    const {
        settings,
        updateSettings,
        updateApiKey,
    } = useGameContext();

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

    const handleFinish = () => {
        // TODO: Call GPT API to populate categories based on theme
        console.log('Finish setup and call GPT API');
    };

    return (
        <div className="settings-container">
            <h1>Game Settings</h1>
            <div className="settings-row">
                <label>OpenAI API Key:</label>
                <input type="text" value={settings.apiKey} onChange={handleApiKeyChange} />
            </div>
            <div className="settings-row">
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
            <div className="settings-row">
                <label>Difficulty:</label>
                <div className="radio-buttons">
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
            <div className="settings-row">
                <label>Theme:</label>
                <textarea value={settings.theme} onChange={handleThemeChange}></textarea>
            </div>
            <div className="settings-row">
                <button onClick={handleFinish}>Finish</button>
            </div>
        </div>
    );
};

export default Settings;