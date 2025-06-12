// CubeGame.ts - Main game controller with clear separation of concerns

import * as THREE from 'three';

// Simple data structures
interface Position { x: number; z: number; }
interface CubeState {
  gridPosition: Position;
  mesh: THREE.Mesh;
  isAnimating: boolean;
  orientation: THREE.Quaternion; // Track orientation separately
}

// Main game class - handles all game logic
export class CubeGame {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private cube: CubeState;
  private gridSize: number;
  private animationQueue: Animation[] = [];
  
  constructor(canvas: HTMLCanvasElement, gridSize: number = 3) {
    this.gridSize = gridSize;
    this.setupThreeJS(canvas);
    this.setupCube();
    this.setupGrid();
    this.setupControls();
  }
  
  private setupThreeJS(canvas: HTMLCanvasElement) {
    // Basic Three.js setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);
    
    // Use client dimensions for proper sizing
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    
    this.camera = new THREE.PerspectiveCamera(
      75, 
      width / height, 
      0.1, 
      1000
    );
    this.camera.position.set(0, 15, 0);  // Directly above, higher up for better view
    this.camera.lookAt(0, 0, 0);
    
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }
  
  private setupCube() {
    // Create cube mesh
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshNormalMaterial(); // Shows rotation clearly
    const mesh = new THREE.Mesh(geometry, material);
    
    // Add edges for clarity
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(
      edges, 
      new THREE.LineBasicMaterial({ color: 0x000000 })
    );
    mesh.add(line);
    
    this.cube = {
      gridPosition: { x: Math.floor(this.gridSize / 2), z: Math.floor(this.gridSize / 2) },
      mesh: mesh,
      isAnimating: false,
      orientation: new THREE.Quaternion() // Start with identity quaternion
    };
    
    this.scene.add(mesh);
    this.updateCubePosition();
  }
  
  private setupGrid() {
    const gridHelper = new THREE.GridHelper(
      this.gridSize * 2, 
      this.gridSize, 
      0x222222,  // Darker color for better contrast
      0x666666   // Medium gray for subdivisions
    );
    this.scene.add(gridHelper);
  }
  
  private setupControls() {
    window.addEventListener('keydown', (e) => {
      if (this.cube.isAnimating) return;
      
      const moves: Record<string, Position> = {
        'ArrowUp': { x: 0, z: -1 },
        'ArrowDown': { x: 0, z: 1 },
        'ArrowLeft': { x: -1, z: 0 },
        'ArrowRight': { x: 1, z: 0 }
      };
      
      const move = moves[e.key];
      if (move) {
        e.preventDefault();
        this.tryMove(move);
      }
    });
  }
  
  private tryMove(direction: Position) {
    const newPos = {
      x: this.cube.gridPosition.x + direction.x,
      z: this.cube.gridPosition.z + direction.z
    };
    
    // Check bounds
    if (newPos.x < 0 || newPos.x >= this.gridSize || 
        newPos.z < 0 || newPos.z >= this.gridSize) {
      return;
    }
    
    // Start roll animation
    this.rollCube(direction);
  }
  
  private rollCube(direction: Position) {
    this.cube.isAnimating = true;
    
    // Calculate roll axis and angle
    const axis = direction.x !== 0 
      ? new THREE.Vector3(0, 0, -direction.x)  // Roll around Z for left/right
      : new THREE.Vector3(-direction.z, 0, 0); // Roll around X for up/down
    
    const angle = Math.PI / 2;
    
    // Animate the roll
    this.animateRoll(axis, angle, direction);
  }
  
  private animateRoll(axis: THREE.Vector3, angle: number, direction: Position) {
    const duration = 300; // milliseconds
    const startTime = Date.now();
    const startOrientation = this.cube.orientation.clone();
    const startPosition = this.cube.mesh.position.clone();
    
    // Calculate pivot point - the edge of the cube in the direction of movement
    const pivotOffset = new THREE.Vector3(direction.x, -1, direction.z);
    const pivotPoint = startPosition.clone().add(pivotOffset);
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing
      const t = this.easeInOutCubic(progress);
      
      // Calculate rotation for this frame
      const frameAngle = angle * t;
      const frameRotation = new THREE.Quaternion().setFromAxisAngle(axis, frameAngle);
      
      // Apply rotation to orientation (in world space)
      const newOrientation = startOrientation.clone();
      newOrientation.premultiply(frameRotation); // premultiply for world space rotation
      this.cube.orientation.copy(newOrientation);
      this.cube.mesh.quaternion.copy(newOrientation);
      
      // Calculate position using pivot point rotation
      // Vector from pivot to cube center
      const pivotToCube = startPosition.clone().sub(pivotPoint);
      
      // Rotate this vector
      pivotToCube.applyQuaternion(frameRotation);
      
      // New position is pivot + rotated vector
      const newPosition = pivotPoint.clone().add(pivotToCube);
      
      this.cube.mesh.position.x = newPosition.x;
      this.cube.mesh.position.y = newPosition.y;
      this.cube.mesh.position.z = newPosition.z;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        this.cube.gridPosition.x += direction.x;
        this.cube.gridPosition.z += direction.z;
        this.cube.isAnimating = false;
        
        // Ensure final position is exact
        this.updateCubePosition();
        
        // Store final orientation
        this.cube.mesh.quaternion.copy(this.cube.orientation);
      }
    };
    
    animate();
  }
  
  private gridToWorld(gridPos: Position): THREE.Vector3 {
    const offset = (this.gridSize - 1) / 2;
    return new THREE.Vector3(
      (gridPos.x - offset) * 2,
      1,
      (gridPos.z - offset) * 2
    );
  }
  
  private updateCubePosition() {
    const worldPos = this.gridToWorld(this.cube.gridPosition);
    this.cube.mesh.position.copy(worldPos);
    // Apply stored orientation
    this.cube.mesh.quaternion.copy(this.cube.orientation);
  }
  
  private easeInOutCubic(t: number): number {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  render() {
    this.renderer.render(this.scene, this.camera);
  }
  
  startGameLoop() {
    const animate = () => {
      requestAnimationFrame(animate);
      this.render();
    };
    animate();
  }
  
  resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }
}
