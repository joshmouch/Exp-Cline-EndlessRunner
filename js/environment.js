/**
 * Environment for the endless runner game
 */
class Environment {
    constructor(scene, textures) {
        this.scene = scene;
        this.textures = textures;
        
        // Ground segments
        this.groundSegments = [];
        this.groundSegmentSize = 20;
        this.numGroundSegments = 3;
        this.groundSpeed = 0.2;
        
        // Decorative elements
        this.trees = [];
        this.clouds = [];
        this.flyingObjects = [];
        this.maxTrees = 15;
        this.maxClouds = 10;
        this.maxFlyingObjects = 5;
        
        // Flying object spawn timer
        this.flyingObjectTimer = 0;
        this.flyingObjectSpawnRate = 5; // Seconds between spawns
        
        // Initialize environment
        this.createGround();
        this.createTrees();
        this.createClouds();
        this.createFlyingObjects();
    }
    
    /**
     * Create the ground
     */
    createGround() {
        // Create ground segments
        for (let i = 0; i < this.numGroundSegments; i++) {
            // Create a group for this ground segment
            const segmentGroup = new THREE.Group();
            
            // Main grass area with texture - randomly select from available textures
            const grassTexture = Array.isArray(this.textures.grass) 
                ? this.textures.grass[Math.floor(Math.random() * this.textures.grass.length)]
                : this.textures.grass;
                
            const grassMaterial = new THREE.MeshPhongMaterial({ 
                map: grassTexture,
                flatShading: true
            });
            
            // Road material with texture
            const roadMaterial = new THREE.MeshPhongMaterial({ 
                map: this.textures.road,
                flatShading: true
            });
            
            // Create the main ground plane
            const groundGeometry = new THREE.PlaneGeometry(
                20, // width (wider to accommodate road and grass)
                this.groundSegmentSize, // height
                20, // width segments
                20 // height segments
            );
            
            // Add some random variation to the ground
            const vertices = groundGeometry.attributes.position.array;
            for (let j = 0; j < vertices.length; j += 3) {
                // Only modify y values (height) and only for non-edge vertices
                // and avoid modifying the center road area
                const x = vertices[j];
                if (j % 3 === 1 && Math.random() > 0.6 && Math.abs(x) > 2) {
                    vertices[j] += (Math.random() - 0.5) * 0.2;
                }
            }
            
            // Create grass mesh
            const groundMesh = new THREE.Mesh(groundGeometry, grassMaterial);
            
            // Create road
            const roadGeometry = new THREE.PlaneGeometry(
                6, // width
                this.groundSegmentSize, // height
                6, // width segments
                20 // height segments
            );
            
            // Add some subtle variation to the road
            const roadVertices = roadGeometry.attributes.position.array;
            for (let j = 0; j < roadVertices.length; j += 3) {
                if (j % 3 === 1 && Math.random() > 0.8) {
                    roadVertices[j] += (Math.random() - 0.5) * 0.05;
                }
            }
            
            const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
            roadMesh.position.y = 0.01; // Slightly above the grass to avoid z-fighting
            
            // Add road markings
            this.addRoadMarkings(segmentGroup, this.groundSegmentSize);
            
            // Rotate and position
            groundMesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
            roadMesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
            
            segmentGroup.add(groundMesh);
            segmentGroup.add(roadMesh);
            
            // Position the segment
            segmentGroup.position.z = i * this.groundSegmentSize - this.groundSegmentSize;
            
            // Add to scene and array
            this.scene.add(segmentGroup);
            this.groundSegments.push(segmentGroup);
        }
    }
    
    /**
     * Add road markings to a ground segment
     * @param {THREE.Group} segmentGroup The ground segment group
     * @param {number} segmentLength Length of the segment
     */
    addRoadMarkings(segmentGroup, segmentLength) {
        const markingMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFFFFF
        });
        
        // Create dashed line in the middle of the road
        const numDashes = 10;
        const dashLength = segmentLength / (numDashes * 2);
        
        for (let i = 0; i < numDashes; i++) {
            const dashGeometry = new THREE.PlaneGeometry(0.2, dashLength);
            const dash = new THREE.Mesh(dashGeometry, markingMaterial);
            
            dash.rotation.x = -Math.PI / 2;
            dash.position.z = -segmentLength / 2 + (i * 2 + 1) * dashLength;
            dash.position.y = 0.02; // Slightly above the road
            
            segmentGroup.add(dash);
        }
        
        // Add some random rocks and details along the sides
        const numDetails = 8;
        const detailMaterials = [
            new THREE.MeshPhongMaterial({ color: 0x7f8c8d }), // Gray
            new THREE.MeshPhongMaterial({ color: 0x95a5a6 })  // Light gray
        ];
        
        for (let i = 0; i < numDetails; i++) {
            // Left side details
            if (Math.random() > 0.5) {
                const size = Math.random() * 0.3 + 0.1;
                const detailGeometry = new THREE.DodecahedronGeometry(size, 0);
                const detail = new THREE.Mesh(
                    detailGeometry, 
                    detailMaterials[Math.floor(Math.random() * detailMaterials.length)]
                );
                
                const xPos = -3 - Math.random() * 2;
                const zPos = -segmentLength / 2 + Math.random() * segmentLength;
                detail.position.set(xPos, size / 2, zPos);
                
                segmentGroup.add(detail);
            }
            
            // Right side details
            if (Math.random() > 0.5) {
                const size = Math.random() * 0.3 + 0.1;
                const detailGeometry = new THREE.DodecahedronGeometry(size, 0);
                const detail = new THREE.Mesh(
                    detailGeometry, 
                    detailMaterials[Math.floor(Math.random() * detailMaterials.length)]
                );
                
                const xPos = 3 + Math.random() * 2;
                const zPos = -segmentLength / 2 + Math.random() * segmentLength;
                detail.position.set(xPos, size / 2, zPos);
                
                segmentGroup.add(detail);
            }
        }
    }
    
    /**
     * Create decorative trees
     */
    createTrees() {
        for (let i = 0; i < this.maxTrees; i++) {
            const tree = this.createTree();
            
            // Position randomly on sides of the path
            const side = Math.random() > 0.5 ? 1 : -1;
            const distance = Math.random() * 5 + 5; // 5-10 units from center
            const z = Math.random() * 100 - 50; // -50 to 50
            
            tree.position.set(side * distance, 0, z);
            
            // Add to scene and array
            this.scene.add(tree);
            this.trees.push(tree);
        }
    }
    
    /**
     * Create a single decorative tree
     * @returns {THREE.Group} Tree mesh group
     */
    createTree() {
        const group = new THREE.Group();
        
        // Random tree size
        const scale = Math.random() * 0.5 + 0.7; // 0.7-1.2
        
        // Choose a random tree type
        const treeType = Math.floor(Math.random() * 4); // 0-3 (4 types of trees)
        
        switch (treeType) {
            case 0:
                // Pine tree (original conical tree)
                this.createPineTree(group, scale);
                break;
            case 1:
                // Oak tree (rounded top)
                this.createOakTree(group, scale);
                break;
            case 2:
                // Palm tree
                this.createPalmTree(group, scale);
                break;
            case 3:
                // Dead tree
                this.createDeadTree(group, scale);
                break;
        }
        
        // Add a small mound of dirt/grass at the base of the tree
        const moundGeometry = new THREE.SphereGeometry(0.4 * scale, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
        const grassTexture = Array.isArray(this.textures.grass) 
            ? this.textures.grass[Math.floor(Math.random() * this.textures.grass.length)]
            : this.textures.grass;
            
        const moundMaterial = new THREE.MeshPhongMaterial({ 
            map: grassTexture
        });
        const mound = new THREE.Mesh(moundGeometry, moundMaterial);
        mound.position.y = 0.05;
        group.add(mound);
        
        return group;
    }
    
    /**
     * Create a pine tree (conical shape with multiple layers)
     * @param {THREE.Group} group The group to add the tree to
     * @param {number} scale The scale of the tree
     */
    createPineTree(group, scale) {
        // Tree trunk with bark texture - randomly select from available textures
        const trunkGeometry = new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 1.5 * scale, 8);
        const barkTexture = Array.isArray(this.textures.bark) 
            ? this.textures.bark[Math.floor(Math.random() * this.textures.bark.length)]
            : this.textures.bark;
            
        const trunkMaterial = new THREE.MeshPhongMaterial({ 
            map: barkTexture
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 0.75 * scale;
        
        // Tree top (1-3 layers) with leaves texture - randomly select from available textures
        const numLayers = Math.floor(Math.random() * 3) + 1;
        const leavesTexture = Array.isArray(this.textures.leaves) 
            ? this.textures.leaves[Math.floor(Math.random() * this.textures.leaves.length)]
            : this.textures.leaves;
            
        const topMaterial = new THREE.MeshPhongMaterial({ 
            map: leavesTexture,
            color: 0x2ecc71 // Slightly green tint
        });
        
        for (let i = 0; i < numLayers; i++) {
            const layerSize = (numLayers - i) * 0.5 * scale;
            const layerHeight = 0.7 * scale;
            const topGeometry = new THREE.ConeGeometry(layerSize, layerHeight, 8);
            const top = new THREE.Mesh(topGeometry, topMaterial);
            top.position.y = 1.5 * scale + i * 0.5 * scale;
            group.add(top);
        }
        
        group.add(trunk);
    }
    
    /**
     * Create an oak tree (rounded top)
     * @param {THREE.Group} group The group to add the tree to
     * @param {number} scale The scale of the tree
     */
    createOakTree(group, scale) {
        // Tree trunk with bark texture - randomly select from available textures
        const trunkGeometry = new THREE.CylinderGeometry(0.25 * scale, 0.35 * scale, 2 * scale, 8);
        const barkTexture = Array.isArray(this.textures.bark) 
            ? this.textures.bark[Math.floor(Math.random() * this.textures.bark.length)]
            : this.textures.bark;
            
        const trunkMaterial = new THREE.MeshPhongMaterial({ 
            map: barkTexture,
            color: 0x8B4513 // Brown tint
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1 * scale;
        
        // Tree top (rounded) with leaves texture - randomly select from available textures
        const leavesTexture = Array.isArray(this.textures.leaves) 
            ? this.textures.leaves[Math.floor(Math.random() * this.textures.leaves.length)]
            : this.textures.leaves;
            
        const topMaterial = new THREE.MeshPhongMaterial({ 
            map: leavesTexture,
            color: 0x27ae60 // Darker green tint
        });
        
        // Create a rounded top using multiple spheres
        const numSpheres = 5;
        for (let i = 0; i < numSpheres; i++) {
            const size = 0.8 * scale + Math.random() * 0.4 * scale;
            const topGeometry = new THREE.SphereGeometry(size, 8, 8);
            const top = new THREE.Mesh(topGeometry, topMaterial);
            
            // Position randomly within the crown area
            const xOffset = (Math.random() - 0.5) * scale;
            const yOffset = 2.5 * scale + (Math.random() - 0.5) * 0.5 * scale;
            const zOffset = (Math.random() - 0.5) * scale;
            
            top.position.set(xOffset, yOffset, zOffset);
            group.add(top);
        }
        
        group.add(trunk);
    }
    
    /**
     * Create a palm tree
     * @param {THREE.Group} group The group to add the tree to
     * @param {number} scale The scale of the tree
     */
    createPalmTree(group, scale) {
        // Curved trunk
        const trunkHeight = 3 * scale;
        const trunkSegments = 8;
        const trunkCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0.3 * scale, trunkHeight * 0.3, 0),
            new THREE.Vector3(0.5 * scale, trunkHeight * 0.6, 0),
            new THREE.Vector3(0.3 * scale, trunkHeight * 0.9, 0),
            new THREE.Vector3(0, trunkHeight, 0)
        ]);
        
        const trunkGeometry = new THREE.TubeGeometry(trunkCurve, 20, 0.2 * scale, 8, false);
        const barkTexture = Array.isArray(this.textures.bark) 
            ? this.textures.bark[Math.floor(Math.random() * this.textures.bark.length)]
            : this.textures.bark;
            
        const trunkMaterial = new THREE.MeshPhongMaterial({ 
            map: barkTexture,
            color: 0xA0522D // Reddish brown
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        
        // Palm leaves
        const numLeaves = 6 + Math.floor(Math.random() * 3);
        const leavesTexture = Array.isArray(this.textures.leaves) 
            ? this.textures.leaves[Math.floor(Math.random() * this.textures.leaves.length)]
            : this.textures.leaves;
            
        const leafMaterial = new THREE.MeshPhongMaterial({ 
            map: leavesTexture,
            color: 0x7CFC00, // Bright green
            side: THREE.DoubleSide
        });
        
        for (let i = 0; i < numLeaves; i++) {
            // Create a leaf shape
            const leafShape = new THREE.Shape();
            leafShape.moveTo(0, 0);
            leafShape.bezierCurveTo(0.5 * scale, 0.5 * scale, 1 * scale, 0.5 * scale, 2 * scale, 0);
            leafShape.bezierCurveTo(1 * scale, -0.5 * scale, 0.5 * scale, -0.5 * scale, 0, 0);
            
            const leafGeometry = new THREE.ShapeGeometry(leafShape);
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            
            // Position and rotate the leaf
            leaf.position.set(0, trunkHeight, 0);
            leaf.rotation.x = Math.PI / 2;
            leaf.rotation.y = (i / numLeaves) * Math.PI * 2;
            leaf.rotation.z = -Math.PI / 6; // Tilt leaves downward
            
            group.add(leaf);
        }
        
        group.add(trunk);
    }
    
    /**
     * Create a dead tree (bare branches)
     * @param {THREE.Group} group The group to add the tree to
     * @param {number} scale The scale of the tree
     */
    createDeadTree(group, scale) {
        // Main trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 2 * scale, 8);
        const barkTexture = Array.isArray(this.textures.bark) 
            ? this.textures.bark[Math.floor(Math.random() * this.textures.bark.length)]
            : this.textures.bark;
            
        const trunkMaterial = new THREE.MeshPhongMaterial({ 
            map: barkTexture,
            color: 0x4d4d4d // Gray tint
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1 * scale;
        
        // Add branches
        const numBranches = 4 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < numBranches; i++) {
            const branchLength = (0.5 + Math.random() * 1) * scale;
            const branchGeometry = new THREE.CylinderGeometry(0.05 * scale, 0.1 * scale, branchLength, 5);
            const branch = new THREE.Mesh(branchGeometry, trunkMaterial);
            
            // Position at a random height on the trunk
            const height = (0.5 + Math.random() * 1.5) * scale;
            
            // Rotate to point in a random direction
            const angle = (i / numBranches) * Math.PI * 2;
            branch.rotation.z = Math.PI / 3; // Angle upward
            branch.rotation.y = angle;
            
            // Position at the edge of the trunk
            branch.position.set(
                0.2 * scale * Math.sin(angle),
                height,
                0.2 * scale * Math.cos(angle)
            );
            
            // Move branch origin to end so it connects to trunk properly
            branch.geometry.translate(0, branchLength / 2, 0);
            
            group.add(branch);
            
            // Add some smaller branches to each main branch
            if (Math.random() > 0.5) {
                const twigGeometry = new THREE.CylinderGeometry(0.02 * scale, 0.05 * scale, branchLength * 0.7, 4);
                const twig = new THREE.Mesh(twigGeometry, trunkMaterial);
                
                twig.rotation.z = Math.PI / 4;
                twig.rotation.y = Math.random() * Math.PI;
                twig.position.set(0, branchLength * 0.7, 0);
                
                // Move twig origin to end so it connects properly
                twig.geometry.translate(0, branchLength * 0.35, 0);
                
                branch.add(twig);
            }
        }
        
        group.add(trunk);
    }
    
    /**
     * Create decorative clouds
     */
    createClouds() {
        for (let i = 0; i < this.maxClouds; i++) {
            const cloud = this.createCloud();
            
            // Position randomly in the sky
            const x = Math.random() * 40 - 20; // -20 to 20
            const y = Math.random() * 5 + 10; // 10 to 15
            const z = Math.random() * 100 - 50; // -50 to 50
            
            cloud.position.set(x, y, z);
            
            // Add to scene and array
            this.scene.add(cloud);
            this.clouds.push(cloud);
        }
    }
    
    /**
     * Create a single cloud
     * @returns {THREE.Group} Cloud mesh group
     */
    createCloud() {
        const group = new THREE.Group();
        
        // Cloud material
        const cloudMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            flatShading: true
        });
        
        // Create 3-5 spheres for the cloud
        const numSpheres = Math.floor(Math.random() * 3) + 3;
        
        for (let i = 0; i < numSpheres; i++) {
            const size = Math.random() * 1 + 0.5; // 0.5-1.5
            const cloudGeometry = new THREE.SphereGeometry(size, 7, 7);
            const cloudPiece = new THREE.Mesh(cloudGeometry, cloudMaterial);
            
            // Position randomly within the cloud
            const x = Math.random() * 2 - 1; // -1 to 1
            const y = Math.random() * 0.5; // 0 to 0.5
            const z = Math.random() * 2 - 1; // -1 to 1
            
            cloudPiece.position.set(x, y, z);
            group.add(cloudPiece);
        }
        
        return group;
    }
    
    /**
     * Create flying objects (airplanes, birds)
     */
    createFlyingObjects() {
        // Pre-create a pool of flying objects
        for (let i = 0; i < this.maxFlyingObjects; i++) {
            const flyingObject = this.createFlyingObject();
            
            // Position off-screen initially
            flyingObject.position.set(100, 100, 100);
            flyingObject.visible = false;
            
            // Add to scene and array
            this.scene.add(flyingObject);
            this.flyingObjects.push({
                mesh: flyingObject,
                active: false,
                speed: 0,
                type: ''
            });
        }
    }
    
    /**
     * Create a single flying object (airplane or bird)
     * @returns {THREE.Group} Flying object mesh group
     */
    createFlyingObject() {
        const group = new THREE.Group();
        
        // We'll create both airplane and bird models in the same group
        // and toggle visibility based on which one we want to show
        
        // Create airplane
        const airplane = new THREE.Group();
        
        // Airplane body
        const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.5, 3, 8);
        bodyGeometry.rotateZ(Math.PI / 2);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xf5f5f5 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        
        // Wings
        const wingGeometry = new THREE.BoxGeometry(4, 0.1, 0.8);
        const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x3498db });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.y = 0.2;
        
        // Tail
        const tailGeometry = new THREE.BoxGeometry(1, 0.1, 0.5);
        const tail = new THREE.Mesh(tailGeometry, wingMaterial);
        tail.position.set(-1.2, 0.3, 0);
        
        // Vertical stabilizer
        const stabilizerGeometry = new THREE.BoxGeometry(0.5, 0.6, 0.1);
        const stabilizer = new THREE.Mesh(stabilizerGeometry, wingMaterial);
        stabilizer.position.set(-1.2, 0.5, 0);
        
        airplane.add(body);
        airplane.add(wings);
        airplane.add(tail);
        airplane.add(stabilizer);
        
        // Create bird
        const bird = new THREE.Group();
        
        // Bird body
        const birdBodyGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const birdBodyMaterial = new THREE.MeshPhongMaterial({ color: 0x3498db });
        const birdBody = new THREE.Mesh(birdBodyGeometry, birdBodyMaterial);
        
        // Bird head
        const birdHeadGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const birdHeadMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
        const birdHead = new THREE.Mesh(birdHeadGeometry, birdHeadMaterial);
        birdHead.position.set(0.3, 0.1, 0);
        
        // Bird wings
        const birdWingGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.3);
        const birdWingMaterial = new THREE.MeshPhongMaterial({ color: 0x3498db });
        
        const leftWing = new THREE.Mesh(birdWingGeometry, birdWingMaterial);
        leftWing.position.set(0, 0.1, -0.3);
        
        const rightWing = new THREE.Mesh(birdWingGeometry, birdWingMaterial);
        rightWing.position.set(0, 0.1, 0.3);
        
        // Bird tail
        const birdTailGeometry = new THREE.BoxGeometry(0.4, 0.05, 0.2);
        const birdTail = new THREE.Mesh(birdTailGeometry, birdWingMaterial);
        birdTail.position.set(-0.4, 0, 0);
        
        bird.add(birdBody);
        bird.add(birdHead);
        bird.add(leftWing);
        bird.add(rightWing);
        bird.add(birdTail);
        
        // Add both models to the group
        group.add(airplane);
        group.add(bird);
        
        // Store references to toggle visibility
        group.userData = {
            airplane: airplane,
            bird: bird
        };
        
        return group;
    }
    
    /**
     * Spawn a new flying object
     */
    spawnFlyingObject() {
        // Find an inactive flying object
        const inactiveFlyingObjects = this.flyingObjects.filter(obj => !obj.active);
        if (inactiveFlyingObjects.length === 0) return;
        
        const flyingObject = inactiveFlyingObjects[Math.floor(Math.random() * inactiveFlyingObjects.length)];
        
        // Determine type (airplane or bird)
        const type = Math.random() > 0.5 ? 'airplane' : 'bird';
        flyingObject.type = type;
        
        // Set visibility based on type
        flyingObject.mesh.userData.airplane.visible = (type === 'airplane');
        flyingObject.mesh.userData.bird.visible = (type === 'bird');
        
        // Set position (start from one side of the screen)
        const side = Math.random() > 0.5 ? 1 : -1;
        const y = Math.random() * 5 + 8; // 8-13 units high
        const z = Math.random() * 20 - 60; // -60 to -40 (ahead of player)
        
        flyingObject.mesh.position.set(side * 30, y, z);
        flyingObject.mesh.rotation.y = (side > 0) ? Math.PI : 0; // Face the correct direction
        
        // Set speed based on type
        flyingObject.speed = (type === 'airplane') ? 0.5 + Math.random() * 0.3 : 0.2 + Math.random() * 0.2;
        
        // Activate
        flyingObject.active = true;
        flyingObject.mesh.visible = true;
    }
    
    /**
     * Update environment
     * @param {number} speed Current game speed
     */
    update(speed) {
        // Update ground segments
        for (let i = 0; i < this.groundSegments.length; i++) {
            const segment = this.groundSegments[i];
            
            // Move segment forward
            segment.position.z += speed;
            
            // If segment is behind camera, move it to the front
            if (segment.position.z > this.groundSegmentSize) {
                segment.position.z = -this.groundSegmentSize * (this.numGroundSegments - 1);
            }
        }
        
        // Update decorative trees
        for (const tree of this.trees) {
            tree.position.z += speed;
            
            // If tree is behind camera, move it to the front
            if (tree.position.z > 20) {
                tree.position.z = -80;
                
                // Randomize x position again
                const side = Math.random() > 0.5 ? 1 : -1;
                const distance = Math.random() * 5 + 5;
                tree.position.x = side * distance;
            }
        }
        
        // Update clouds (slower movement for parallax effect)
        for (const cloud of this.clouds) {
            cloud.position.z += speed * 0.5;
            
            // If cloud is behind camera, move it to the front
            if (cloud.position.z > 20) {
                cloud.position.z = -80;
                
                // Randomize position again
                cloud.position.x = Math.random() * 40 - 20;
                cloud.position.y = Math.random() * 5 + 10;
            }
        }
        
        // Update flying objects
        this.updateFlyingObjects(speed);
    }
    
    /**
     * Update flying objects
     * @param {number} gameSpeed Current game speed
     */
    updateFlyingObjects(gameSpeed) {
        // Update flying object timer
        this.flyingObjectTimer += 0.016; // Approximately 60fps
        
        // Check if it's time to spawn a new flying object
        if (this.flyingObjectTimer >= this.flyingObjectSpawnRate) {
            this.spawnFlyingObject();
            this.flyingObjectTimer = 0;
            
            // Randomize next spawn time
            this.flyingObjectSpawnRate = 3 + Math.random() * 5; // 3-8 seconds
        }
        
        // Update active flying objects
        for (const flyingObject of this.flyingObjects) {
            if (!flyingObject.active) continue;
            
            // Move flying object
            const direction = flyingObject.mesh.position.x > 0 ? -1 : 1;
            flyingObject.mesh.position.x += direction * flyingObject.speed;
            flyingObject.mesh.position.z += gameSpeed * 0.5;
            
            // Animate bird wings if it's a bird
            if (flyingObject.type === 'bird') {
                const wings = [
                    flyingObject.mesh.userData.bird.children[2], // left wing
                    flyingObject.mesh.userData.bird.children[3]  // right wing
                ];
                
                // Simple wing flapping animation
                const flapSpeed = 0.1;
                wings.forEach(wing => {
                    wing.rotation.z = Math.sin(Date.now() * flapSpeed) * 0.5;
                });
            }
            
            // Check if flying object has passed the screen
            if ((direction > 0 && flyingObject.mesh.position.x > 30) || 
                (direction < 0 && flyingObject.mesh.position.x < -30) ||
                flyingObject.mesh.position.z > 20) {
                
                // Deactivate
                flyingObject.active = false;
                flyingObject.mesh.visible = false;
            }
        }
    }
}
