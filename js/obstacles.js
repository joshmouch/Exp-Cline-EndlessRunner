/**
 * Obstacles for the endless runner game
 */
class ObstacleManager {
    constructor(scene, textures) {
        this.scene = scene;
        this.textures = textures;
        this.activeObstacles = [];
        this.obstaclePool = [];
        this.obstacleTypes = ['rock', 'log', 'tree', 'puddle', 'barrier'];
        
        // Obstacle generation settings
        this.spawnDistance = 80; // Spawn further away for better visibility
        this.minSpawnInterval = 1.5;
        this.maxSpawnInterval = 3;
        this.nextSpawnTime = this.getRandomSpawnInterval();
        this.timeSinceLastSpawn = 0;
        
        // Game speed (affects how fast obstacles move)
        this.speed = 0.2;
        this.initialSpeed = 0.2;
        this.speedIncreaseRate = 0.00001;
        
        // Preload some obstacles
        this.preloadObstacles(10);
    }
    
    /**
     * Preload obstacles to improve performance
     * @param {number} count Number of obstacles to preload
     */
    preloadObstacles(count) {
        for (let i = 0; i < count; i++) {
            const type = this.getRandomObstacleType();
            const obstacle = this.createObstacle(type);
            this.obstaclePool.push(obstacle);
        }
    }
    
    /**
     * Get a random obstacle type
     * @returns {string} Random obstacle type
     */
    getRandomObstacleType() {
        const index = Math.floor(Math.random() * this.obstacleTypes.length);
        return this.obstacleTypes[index];
    }
    
    /**
     * Get a random spawn interval
     * @returns {number} Random spawn interval
     */
    getRandomSpawnInterval() {
        return Math.random() * (this.maxSpawnInterval - this.minSpawnInterval) + this.minSpawnInterval;
    }
    
    /**
     * Create a new obstacle
     * @param {string} type Obstacle type
     * @returns {Object} Obstacle object
     */
    createObstacle(type) {
        let mesh;
        let colliderScale = { x: 1, y: 1, z: 1 };
        
        switch (type) {
            case 'rock':
                mesh = this.createRock();
                colliderScale = { x: 0.9, y: 0.9, z: 0.9 };
                break;
            case 'log':
                mesh = this.createLog();
                colliderScale = { x: 0.9, y: 0.9, z: 1.2 };
                break;
            case 'tree':
                mesh = this.createTree();
                colliderScale = { x: 0.7, y: 0.9, z: 0.7 };
                break;
            case 'puddle':
                mesh = this.createPuddle();
                colliderScale = { x: 1.2, y: 0.5, z: 1.2 };
                break;
            case 'barrier':
                mesh = this.createBarrier();
                colliderScale = { x: 1.1, y: 0.9, z: 0.8 };
                break;
            default:
                mesh = this.createRock();
                break;
        }
        
        // Hide the mesh initially
        mesh.visible = false;
        this.scene.add(mesh);
        
        // Create obstacle object
        const obstacle = {
            type: type,
            mesh: mesh,
            collider: null,
            active: false,
            colliderScale: colliderScale
        };
        
        return obstacle;
    }
    
    /**
     * Create a rock obstacle
     * @returns {THREE.Mesh} Rock mesh
     */
    createRock() {
        const geometry = new THREE.DodecahedronGeometry(0.8, 1);
        const material = new THREE.MeshPhongMaterial({ 
            map: this.textures.rock
        });
        const rock = new THREE.Mesh(geometry, material);
        rock.position.set(0, 0.5, 0);
        return rock;
    }
    
    /**
     * Create a log obstacle
     * @returns {THREE.Mesh} Log mesh
     */
    createLog() {
        const group = new THREE.Group();
        
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 8);
        const material = new THREE.MeshPhongMaterial({ 
            map: this.textures.log
        });
        const log = new THREE.Mesh(geometry, material);
        log.rotation.z = Math.PI / 2;
        log.position.y = 0.5;
        
        group.add(log);
        return group;
    }
    
    /**
     * Create a tree obstacle
     * @returns {THREE.Group} Tree mesh group
     */
    createTree() {
        const group = new THREE.Group();
        
        // Tree trunk with bark texture
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({ 
            map: this.textures.bark
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        
        // Tree top with leaves texture
        const topGeometry = new THREE.ConeGeometry(1.2, 3, 8);
        const topMaterial = new THREE.MeshPhongMaterial({ 
            map: this.textures.leaves
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 3;
        
        group.add(trunk);
        group.add(top);
        
        return group;
    }
    
    /**
     * Create a puddle obstacle
     * @returns {THREE.Mesh} Puddle mesh
     */
    createPuddle() {
        const geometry = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 16);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x3498db,
            transparent: true,
            opacity: 0.7
        });
        const puddle = new THREE.Mesh(geometry, material);
        puddle.position.y = 0.05;
        return puddle;
    }
    
    /**
     * Create a barrier obstacle
     * @returns {THREE.Group} Barrier mesh group
     */
    createBarrier() {
        const group = new THREE.Group();
        
        // Horizontal bar
        const barGeometry = new THREE.BoxGeometry(3, 0.3, 0.3);
        const barMaterial = new THREE.MeshPhongMaterial({ color: 0xe74c3c });
        const bar = new THREE.Mesh(barGeometry, barMaterial);
        bar.position.y = 1.5;
        
        // Left post
        const leftPostGeometry = new THREE.BoxGeometry(0.3, 3, 0.3);
        const leftPost = new THREE.Mesh(leftPostGeometry, barMaterial);
        leftPost.position.set(-1.35, 0, 0);
        
        // Right post
        const rightPostGeometry = new THREE.BoxGeometry(0.3, 3, 0.3);
        const rightPost = new THREE.Mesh(rightPostGeometry, barMaterial);
        rightPost.position.set(1.35, 0, 0);
        
        group.add(bar);
        group.add(leftPost);
        group.add(rightPost);
        
        return group;
    }
    
    /**
     * Spawn a new obstacle
     */
    spawnObstacle() {
        let obstacle;
        
        // Get obstacle from pool or create new one
        if (this.obstaclePool.length > 0) {
            obstacle = this.obstaclePool.pop();
        } else {
            const type = this.getRandomObstacleType();
            obstacle = this.createObstacle(type);
        }
        
        // Position the obstacle in front of the player
        obstacle.mesh.position.z = -this.spawnDistance;
        
        // Random x position (3 lanes)
        const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        obstacle.mesh.position.x = lane * 2;
        
        // Make obstacle visible
        obstacle.mesh.visible = true;
        obstacle.active = true;
        
        // Create collider
        this.updateObstacleCollider(obstacle);
        
        // Add to active obstacles
        this.activeObstacles.push(obstacle);
    }
    
    /**
     * Update obstacle collider
     * @param {Object} obstacle Obstacle to update
     */
    updateObstacleCollider(obstacle) {
        obstacle.collider = new THREE.Box3().setFromObject(obstacle.mesh);
        
        // Scale the collider based on obstacle type
        const size = new THREE.Vector3();
        obstacle.collider.getSize(size);
        
        const center = new THREE.Vector3();
        obstacle.collider.getCenter(center);
        
        obstacle.collider = new THREE.Box3(
            new THREE.Vector3(
                center.x - size.x * obstacle.colliderScale.x / 2,
                center.y - size.y * obstacle.colliderScale.y / 2,
                center.z - size.z * obstacle.colliderScale.z / 2
            ),
            new THREE.Vector3(
                center.x + size.x * obstacle.colliderScale.x / 2,
                center.y + size.y * obstacle.colliderScale.y / 2,
                center.z + size.z * obstacle.colliderScale.z / 2
            )
        );
    }
    
    /**
     * Update obstacles
     * @param {number} deltaTime Time since last update
     * @param {number} score Current score
     */
    update(deltaTime, score) {
        // Increase speed over time
        this.speed = this.initialSpeed + score * this.speedIncreaseRate;
        
        // Update spawn timer
        this.timeSinceLastSpawn += deltaTime;
        
        // Spawn new obstacle if needed
        if (this.timeSinceLastSpawn >= this.nextSpawnTime) {
            this.spawnObstacle();
            this.timeSinceLastSpawn = 0;
            this.nextSpawnTime = this.getRandomSpawnInterval();
        }
        
        // Update active obstacles
        for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
            const obstacle = this.activeObstacles[i];
            
            // Move obstacle toward player (positive z direction)
            obstacle.mesh.position.z += this.speed;
            
            // Update collider
            this.updateObstacleCollider(obstacle);
            
            // Remove if passed player
            if (obstacle.mesh.position.z > 10) {
                // Hide mesh
                obstacle.mesh.visible = false;
                obstacle.active = false;
                
                // Remove from active obstacles
                this.activeObstacles.splice(i, 1);
                
                // Add back to pool
                this.obstaclePool.push(obstacle);
            }
        }
    }
    
    /**
     * Reset all obstacles
     */
    reset() {
        // Return all active obstacles to pool
        for (const obstacle of this.activeObstacles) {
            obstacle.mesh.visible = false;
            obstacle.active = false;
            this.obstaclePool.push(obstacle);
        }
        
        // Clear active obstacles
        this.activeObstacles = [];
        
        // Reset speed
        this.speed = this.initialSpeed;
        
        // Reset spawn timer
        this.timeSinceLastSpawn = 0;
        this.nextSpawnTime = this.getRandomSpawnInterval();
    }
}
