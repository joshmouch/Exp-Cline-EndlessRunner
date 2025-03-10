/**
 * Game logic for the endless runner game
 */
class Game {
    constructor() {
        // Game state
        this.state = 'start'; // start, playing, gameOver
        this.animationFrameId = null;
        this.lastTime = 0;
        
        // DOM elements
        this.gameContainer = document.getElementById('game-container');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over');
        this.startButton = document.getElementById('start-button');
        this.restartButton = document.getElementById('restart-button');
        
        // Event listeners
        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.restartGame());
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('resize', () => this.handleResize());
        
        // Textures
        this.textures = {};
        this.loadTextures();
        
        // Three.js setup
        this.setupThreeJS();
        
        // Game components
        this.scoreManager = new ScoreManager();
        this.player = new Player(this.scene, this.textures);
        this.obstacles = new ObstacleManager(this.scene, this.textures);
        this.environment = new Environment(this.scene, this.textures);
        this.collisionDetector = new CollisionDetector(this.player, this.obstacles);
        
        // Initial render
        this.handleResize();
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Load all textures used in the game
     */
    loadTextures() {
        const textureLoader = new THREE.TextureLoader();
        
        // Load all textures
        this.textures = {
            road: textureLoader.load('assets/images/road_texture-1.png'),
            grass: textureLoader.load('assets/images/grass_texture-1.png'),
            bark: textureLoader.load('assets/images/bark_texture-1.png'),
            leaves: textureLoader.load('assets/images/leaves_texture-1.png'),
            rock: textureLoader.load('assets/images/rock_texture-1.png'),
            log: textureLoader.load('assets/images/log_texture-1.png'),
            sky: textureLoader.load('assets/images/sky_texture-1.png')
        };
        
        // Set texture properties for all textures
        Object.values(this.textures).forEach(texture => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);
        });
    }
    
    /**
     * Set up Three.js scene, camera, renderer, and lighting
     */
    setupThreeJS() {
        // Create scene
        this.scene = new THREE.Scene();
        
        // Set sky background with texture
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            map: this.textures.sky,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, // Field of view
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        this.camera.position.set(0, 5, 15); // Position camera behind and above player
        this.camera.lookAt(0, 2, -30); // Look down the road
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.gameContainer.appendChild(this.renderer.domElement);
        
        // Add lighting
        this.setupLighting();
    }
    
    /**
     * Set up scene lighting
     */
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        
        // Configure shadow properties
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        
        this.scene.add(directionalLight);
    }
    
    /**
     * Start the game
     */
    startGame() {
        if (this.state !== 'playing') {
            this.state = 'playing';
            this.startScreen.classList.add('hidden');
            this.gameOverScreen.classList.add('hidden');
            this.scoreManager.reset();
            this.player.reset();
            this.obstacles.reset();
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }
    
    /**
     * Restart the game after game over
     */
    restartGame() {
        this.startGame();
    }
    
    /**
     * End the game
     */
    endGame() {
        this.state = 'gameOver';
        this.gameOverScreen.classList.remove('hidden');
        this.scoreManager.updateFinalScore();
        cancelAnimationFrame(this.animationFrameId);
    }
    
    /**
     * Main game loop
     */
    gameLoop() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;
        
        if (this.state === 'playing') {
            // Update score
            this.scoreManager.addScore(deltaTime);
            
            // Update player
            this.player.update();
            
            // Update obstacles
            this.obstacles.update(deltaTime, this.scoreManager.score);
            
            // Update environment
            this.environment.update(this.obstacles.speed);
            
            // Check for collisions
            if (this.collisionDetector.checkCollisions()) {
                this.endGame();
            }
            
            // Render scene
            this.renderer.render(this.scene, this.camera);
            
            // Continue game loop
            this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    /**
     * Handle keyboard input
     * @param {KeyboardEvent} event Keyboard event
     */
    handleKeyDown(event) {
        // Jump when space is pressed
        if (event.code === 'Space') {
            if (this.state === 'playing') {
                this.player.jump();
            } else if (this.state === 'start') {
                this.startGame();
            } else if (this.state === 'gameOver') {
                this.restartGame();
            }
            
            // Prevent default space bar behavior (page scrolling)
            event.preventDefault();
        }
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Update camera aspect ratio
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        
        // Update renderer size
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
