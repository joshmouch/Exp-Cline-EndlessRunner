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
        this.maxTrees = 15;
        this.maxClouds = 10;
        
        // Initialize environment
        this.createGround();
        this.createTrees();
        this.createClouds();
    }
    
    /**
     * Create the ground
     */
    createGround() {
        // Create ground segments
        for (let i = 0; i < this.numGroundSegments; i++) {
            // Create a group for this ground segment
            const segmentGroup = new THREE.Group();
            
            // Main grass area with texture
            const grassMaterial = new THREE.MeshPhongMaterial({ 
                map: this.textures.grass,
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
        
        // Tree trunk with bark texture
        const trunkGeometry = new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 1.5 * scale, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({ 
            map: this.textures.bark
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 0.75 * scale;
        
        // Tree top (1-3 layers) with leaves texture
        const numLayers = Math.floor(Math.random() * 3) + 1;
        const topMaterial = new THREE.MeshPhongMaterial({ 
            map: this.textures.leaves
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
        
        // Add a small mound of dirt/grass at the base of the tree
        const moundGeometry = new THREE.SphereGeometry(0.4 * scale, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
        const moundMaterial = new THREE.MeshPhongMaterial({ 
            map: this.textures.grass
        });
        const mound = new THREE.Mesh(moundGeometry, moundMaterial);
        mound.position.y = 0.05;
        group.add(mound);
        
        return group;
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
    }
}
