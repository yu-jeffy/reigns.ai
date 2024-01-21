// Landing page
// Title, description, and play button. Navigates to Settings.js
import React from 'react';
import styles from './Landing.module.css'
import {useNavigate} from 'react-router-dom';

const Landing = () => {
    const navigate = useNavigate();

    const handlePlay = () => {
        navigate('/settings');
    }

return (
    <div className = {styles.landingContainer}>
            <h1 className={styles.landingHeader}>
                reigns.ai
            </h1>
            <span className={styles.landingText}>
                An LLM enchanced version of the popular mobile game where you make decisions that affect four different aspects of your world.
            </span>
            <span className={styles.landingText}>
                Try to keep all four aspects in balance for as long as possible.
            </span>
            <span className={styles.landingText}>
                How long will you reign?
            </span>
            <div style={{ flexGrow: 1 }} />
            <p className={styles.asciiArt}>
                <pre>
            .<br/>
                  .       |         .    .<br/>
            .  *         -*-          *<br/>
                 \        |         /   .<br/>
.    .            .      /^\     .              .    .<br/>
   *    |\   /\    /\  / / \ \  /\    /\   /|    *<br/>
 .   .  |  \ \/ /\ \ / /     \ \ / /\ \/ /  | .     .<br/>
         \ | _ _\/_ _ \_\_ _ /_/_ _\/_ _ \_/<br/>
           \  *  *  *   \ \/ /  *  *  *  /<br/>
            ` ~ ~ ~ ~ ~  ~\/~ ~ ~ ~ ~ ~ '<br/>
            </pre>
            </p>
            <span className={styles.landingText}>
                design your world and play!
            </span>
            <button className={styles.playButton} onClick={handlePlay}> Enter </button>


    </div>
)};

export default Landing;