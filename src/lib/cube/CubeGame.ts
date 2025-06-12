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

// Chess notation for tiles
type ChessFile = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
type ChessRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type ChessNotation = `${ChessFile}${ChessRank}`;

// Tile colors configuration
const TILE_COLORS: Record<ChessNotation, number> = {
  'b7': 0x808080, // Gray
  'g3': 0x808080, // Gray
} as Record<ChessNotation, number>;

// Main game class - handles all game logic
export class CubeGame {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private cube!: CubeState;
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
    
    // Create distinct materials for each face (muted colors)
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0xcc6666 }), // Right - Muted Red
      new THREE.MeshBasicMaterial({ color: 0x66cc66 }), // Left - Muted Green  
      new THREE.MeshBasicMaterial({ color: 0x6666cc }), // Top - Muted Blue
      new THREE.MeshBasicMaterial({ color: 0xcccc66 }), // Bottom - Muted Yellow
      new THREE.MeshBasicMaterial({ color: 0xcc66cc }), // Front - Muted Magenta
      new THREE.MeshBasicMaterial({ color: 0x66cccc })  // Back - Muted Cyan
    ];
    
    const mesh = new THREE.Mesh(geometry, materials);
    
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
    // Create grid lines
    const gridHelper = new THREE.GridHelper(
      this.gridSize * 2, 
      this.gridSize, 
      0x222222,  // Darker color for better contrast
      0x666666   // Medium gray for subdivisions
    );
    this.scene.add(gridHelper);

    // Create colored tiles if grid is 8x8
    if (this.gridSize === 8) {
      this.createColoredTiles();
    }
  }

  private createColoredTiles() {
    const tileGeometry = new THREE.PlaneGeometry(2, 2);
    
    // Convert grid position to chess notation
    const getChessNotation = (x: number, z: number): ChessNotation | null => {
      if (x < 0 || x >= 8 || z < 0 || z >= 8) return null;
      const file = String.fromCharCode('a'.charCodeAt(0) + x) as ChessFile;
      const rank = (8 - z) as ChessRank; // Invert z to match chess board (rank 8 at top)
      return `${file}${rank}` as ChessNotation;
    };

    // Create tiles for colored squares
    for (let x = 0; x < 8; x++) {
      for (let z = 0; z < 8; z++) {
        const notation = getChessNotation(x, z);
        if (notation && TILE_COLORS[notation]) {
          const tileMaterial = new THREE.MeshBasicMaterial({
            color: TILE_COLORS[notation],
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
          });
          
          const tileMesh = new THREE.Mesh(tileGeometry, tileMaterial);
          const worldPos = this.gridToWorld({ x, z });
          tileMesh.position.set(worldPos.x, 0.01, worldPos.z); // Slightly above ground
          tileMesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
          
          this.scene.add(tileMesh);
        }
      }
    }
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
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        this.resetCube();
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
      : new THREE.Vector3(direction.z, 0, 0);   // Roll around X for up/down (reversed)
    
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
        
        // Dispatch position change event
        this.dispatchPositionChangeEvent();
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
  
  private resetCube() {
    // Reset grid position to center
    this.cube.gridPosition = { 
      x: Math.floor(this.gridSize / 2), 
      z: Math.floor(this.gridSize / 2) 
    };
    
    // Reset orientation to identity (no rotation)
    this.cube.orientation = new THREE.Quaternion();
    
    // Update the cube's visual position and rotation
    this.updateCubePosition();
    
    // Dispatch position change event
    this.dispatchPositionChangeEvent();
  }
  
  private getChessNotation(position: Position): ChessNotation | null {
    if (this.gridSize !== 8) return null;
    if (position.x < 0 || position.x >= 8 || position.z < 0 || position.z >= 8) return null;
    
    const file = String.fromCharCode('a'.charCodeAt(0) + position.x) as ChessFile;
    const rank = (8 - position.z) as ChessRank; // Invert z to match chess board (rank 8 at top)
    return `${file}${rank}` as ChessNotation;
  }
  
  private dispatchPositionChangeEvent() {
    const notation = this.getChessNotation(this.cube.gridPosition);
    const event = new CustomEvent('cubePositionChanged', {
      detail: {
        gridPosition: { ...this.cube.gridPosition },
        chessNotation: notation
      }
    });
    window.dispatchEvent(event);
  }
  
  render() {
    this.renderer.render(this.scene, this.camera);
  }
  
  startGameLoop() {
    // Dispatch initial position
    this.dispatchPositionChangeEvent();
    
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
