/**
 * Score management for the endless runner game
 */
class ScoreManager {
    constructor() {
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.scoreElement = document.getElementById('current-score');
        this.highScoreElement = document.getElementById('high-score');
        this.finalScoreElement = document.getElementById('final-score');
        this.updateUI();
    }

    /**
     * Load high score from local storage
     */
    loadHighScore() {
        const savedHighScore = localStorage.getItem('endlessRunnerHighScore');
        return savedHighScore ? parseInt(savedHighScore) : 0;
    }

    /**
     * Save high score to local storage
     */
    saveHighScore() {
        localStorage.setItem('endlessRunnerHighScore', this.highScore.toString());
    }

    /**
     * Update score display in UI
     */
    updateUI() {
        this.scoreElement.textContent = `Score: ${Math.floor(this.score)}`;
        this.highScoreElement.textContent = `High Score: ${Math.floor(this.highScore)}`;
    }

    /**
     * Update final score on game over screen
     */
    updateFinalScore() {
        this.finalScoreElement.textContent = `Score: ${Math.floor(this.score)}`;
    }

    /**
     * Increment score by given amount
     */
    addScore(amount) {
        this.score += amount;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        this.updateUI();
    }

    /**
     * Reset score to zero
     */
    reset() {
        this.score = 0;
        this.updateUI();
    }
}
