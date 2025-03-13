/**
 * Player character for the endless runner game
 */
class Player {
    constructor(scene, textures) {
        this.scene = scene;
        this.textures = textures;
        this.mesh = null;
        this.collider = null;
        
        // Player state
        this.isJumping = false;
        this.isFalling = false;
        this.runningSpeed = 0.2;
        this.jumpForce = 0.15;
        this.gravity = 0.005;
        this.jumpHeight = 2;
        this.lateralSpeed = 0.3;
        this.maxLateralPosition = 3; // Maximum distance from center
        
        // Player position
        this.position = {
            x: 0,
            y: 0,
            z: 5 // Position player a bit forward so it's visible from the camera
        };
        
        // Animation properties
        this.legRotationSpeed = 0.1;
        this.maxLegRotation = Math.PI / 4;
        this.legRotationDirection = 1;
        this.currentLegRotation = 0;
        
        // Player parts
        this.body = null;
        this.head = null;
        this.leftLeg = null;
        this.rightLeg = null;
        this.leftArm = null;
        this.rightArm = null;
        
        this.createPlayer();
    }
    
    /**
     * Create the player character
     */
    createPlayer() {
        // Create a group for the player
        this.mesh = new THREE.Group();
        
        // Create materials
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x3498db });
        const headMaterial = new THREE.MeshPhongMaterial({ color: 0xecf0f1 });
        const limbMaterial = new THREE.MeshPhongMaterial({ color: 0x2980b9 });
        
        // Create body parts
        this.body = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1.5, 0.5),
            bodyMaterial
        );
        this.body.position.y = 1.5;
        
        this.head = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.8, 0.8),
            headMaterial
        );
        this.head.position.y = 2.4;
        
        // Create legs
        this.leftLeg = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 1, 0.4),
            limbMaterial
        );
        this.leftLeg.position.set(-0.3, 0.5, 0);
        
        this.rightLeg = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 1, 0.4),
            limbMaterial
        );
        this.rightLeg.position.set(0.3, 0.5, 0);
        
        // Create arms
        this.leftArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 1, 0.4),
            limbMaterial
        );
        this.leftArm.position.set(-0.7, 1.5, 0);
        
        this.rightArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 1, 0.4),
            limbMaterial
        );
        this.rightArm.position.set(0.7, 1.5, 0);
        
        // Add all parts to the player mesh
        this.mesh.add(this.body);
        this.mesh.add(this.head);
        this.mesh.add(this.leftLeg);
        this.mesh.add(this.rightLeg);
        this.mesh.add(this.leftArm);
        this.mesh.add(this.rightArm);
        
        // Set initial position
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        
        // Add to scene
        this.scene.add(this.mesh);
        
        // Create collider
        this.updateCollider();
    }
    
    /**
     * Update the player's collider box
     */
    updateCollider() {
        this.collider = new THREE.Box3().setFromObject(this.mesh);
        
        // Make the collider slightly smaller than the actual mesh for better gameplay
        const size = new THREE.Vector3();
        this.collider.getSize(size);
        
        const center = new THREE.Vector3();
        this.collider.getCenter(center);
        
        this.collider = new THREE.Box3(
            new THREE.Vector3(
                center.x - size.x * 0.8 / 2,
                center.y - size.y * 0.8 / 2,
                center.z - size.z * 0.8 / 2
            ),
            new THREE.Vector3(
                center.x + size.x * 0.8 / 2,
                center.y + size.y * 0.8 / 2,
                center.z + size.z * 0.8 / 2
            )
        );
    }
    
    /**
     * Make the player jump
     */
    jump() {
        if (!this.isJumping && !this.isFalling) {
            this.isJumping = true;
            this.jumpVelocity = this.jumpForce;
        }
    }
    
    /**
     * Update player animation and position
     */
    update() {
        // Handle jumping and falling
        if (this.isJumping || this.isFalling) {
            // Apply gravity to jump velocity
            this.jumpVelocity -= this.gravity;
            
            // Update position
            this.mesh.position.y += this.jumpVelocity;
            
            // Check if reached max height
            if (this.isJumping && this.jumpVelocity <= 0) {
                this.isJumping = false;
                this.isFalling = true;
            }
            
            // Check if landed
            if (this.isFalling && this.mesh.position.y <= this.position.y) {
                this.mesh.position.y = this.position.y;
                this.isFalling = false;
            }
        } else {
            // Running animation - leg movement
            this.animateRunning();
        }
        
        // Gradually return to center when not actively moving
        this.returnToCenter();
        
        // Update collider
        this.updateCollider();
    }
    
    /**
     * Gradually return player to center and upright position
     */
    returnToCenter() {
        // Return rotation to neutral
        if (this.mesh.rotation.z > 0.01) {
            this.mesh.rotation.z -= 0.01;
        } else if (this.mesh.rotation.z < -0.01) {
            this.mesh.rotation.z += 0.01;
        } else {
            this.mesh.rotation.z = 0;
        }
    }
    
    /**
     * Animate the running motion
     */
    animateRunning() {
        // Update leg rotation
        this.currentLegRotation += this.legRotationSpeed * this.legRotationDirection;
        
        // Reverse direction if reached max rotation
        if (Math.abs(this.currentLegRotation) >= this.maxLegRotation) {
            this.legRotationDirection *= -1;
        }
        
        // Apply rotation to legs
        this.leftLeg.rotation.x = this.currentLegRotation;
        this.rightLeg.rotation.x = -this.currentLegRotation;
        
        // Also animate arms opposite to legs
        this.leftArm.rotation.x = -this.currentLegRotation * 0.5;
        this.rightArm.rotation.x = this.currentLegRotation * 0.5;
    }
    
    /**
     * Move player to the left
     */
    moveLeft() {
        // Only move if not at the left edge
        if (this.mesh.position.x > -this.maxLateralPosition) {
            this.mesh.position.x -= this.lateralSpeed;
            // Tilt the player slightly when moving
            this.mesh.rotation.z = Math.min(this.mesh.rotation.z + 0.05, 0.2);
            this.updateCollider();
        }
    }
    
    /**
     * Move player to the right
     */
    moveRight() {
        // Only move if not at the right edge
        if (this.mesh.position.x < this.maxLateralPosition) {
            this.mesh.position.x += this.lateralSpeed;
            // Tilt the player slightly when moving
            this.mesh.rotation.z = Math.max(this.mesh.rotation.z - 0.05, -0.2);
            this.updateCollider();
        }
    }
    
    /**
     * Reset player to initial state
     */
    reset() {
        this.isJumping = false;
        this.isFalling = false;
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.mesh.rotation.z = 0; // Reset rotation
        this.updateCollider();
    }
}
