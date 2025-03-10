/**
 * Collision detection for the endless runner game
 */
class CollisionDetector {
    constructor(player, obstacles) {
        this.player = player;
        this.obstacles = obstacles;
        this.collisionThreshold = 0.8; // Adjust for collision sensitivity
    }

    /**
     * Check for collisions between player and all obstacles
     * @returns {boolean} True if collision detected
     */
    checkCollisions() {
        if (!this.player.mesh || !this.player.collider) {
            return false;
        }

        // Update player collider position
        this.player.updateCollider();

        // Check collision with each obstacle
        for (const obstacle of this.obstacles.activeObstacles) {
            if (this.checkObstacleCollision(obstacle)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check collision between player and a specific obstacle
     * @param {Object} obstacle The obstacle to check
     * @returns {boolean} True if collision detected
     */
    checkObstacleCollision(obstacle) {
        if (!obstacle.collider) {
            return false;
        }

        // Get player bounding box
        const playerBox = this.player.collider.clone();
        
        // Get obstacle bounding box
        const obstacleBox = obstacle.collider.clone();
        
        // Check for intersection
        return playerBox.intersectsBox(obstacleBox);
    }

    /**
     * Create a bounding box for collision detection
     * @param {THREE.Mesh} mesh The mesh to create a bounding box for
     * @param {number} scaleX X scale factor for the box
     * @param {number} scaleY Y scale factor for the box
     * @param {number} scaleZ Z scale factor for the box
     * @returns {THREE.Box3} The bounding box
     */
    createBoundingBox(mesh, scaleX = 1, scaleY = 1, scaleZ = 1) {
        const box = new THREE.Box3().setFromObject(mesh);
        
        // Scale the box dimensions
        const size = new THREE.Vector3();
        box.getSize(size);
        
        const center = new THREE.Vector3();
        box.getCenter(center);
        
        // Create a new box with scaled dimensions
        const scaledBox = new THREE.Box3(
            new THREE.Vector3(
                center.x - (size.x * scaleX) / 2,
                center.y - (size.y * scaleY) / 2,
                center.z - (size.z * scaleZ) / 2
            ),
            new THREE.Vector3(
                center.x + (size.x * scaleX) / 2,
                center.y + (size.y * scaleY) / 2,
                center.z + (size.z * scaleZ) / 2
            )
        );
        
        return scaledBox;
    }
}
