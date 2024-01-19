// Game.js
// Where the user plays the game

import React, { useState } from 'react';
import { useGameContext } from '../Data';
import axios from 'axios';
import './Game.module.css';
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

    //console.log(gameState.categories);

    return (
        <div className="gameContainer">
            <h1>Game</h1>
            <div>
                Theme: {settings.theme} <br />
                Difficulty: {settings.difficulty} <br />
                Number of Options: {settings.numberOfOptions} <br />
                API Key: {apiKey} <br />
                Categories: 
                {gameState.categories && gameState.categories.map((category, index) => (
                    <div key={index}>
                        Category Name: {category.categoryName} <br />
                        Score: {category.score}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Game;