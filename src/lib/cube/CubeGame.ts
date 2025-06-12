// CubeGame.ts - Main game controller with clear separation of concerns

import * as THREE from 'three';

// Simple data structures
interface Position { x: number; z: number; }
interface Position3D { x: number; y: number; z: number; }
interface CubeState {
  gridPosition: Position;
  gridLevel: number; // Track which grid level the cube is on
  mesh: THREE.Mesh;
  isAnimating: boolean;
  orientation: THREE.Quaternion; // Track orientation separately
}

// Grid class for managing individual grids
class Grid {
  public mesh: THREE.Group;
  public gridHelper!: THREE.GridHelper;
  public groundPlane!: THREE.Mesh;
  public coloredTiles: THREE.Mesh[] = [];
  public level: number;
  public position: Position3D;
  public size: number;
  public tileColors: Partial<Record<ChessNotation, number>>;

  constructor(
    size: number, 
    level: number, 
    yPosition: number,
    tileColors: Partial<Record<ChessNotation, number>> = {}
  ) {
    this.size = size;
    this.level = level;
    this.position = { x: 0, y: yPosition, z: 0 };
    this.tileColors = tileColors;
    this.mesh = new THREE.Group();
    
    this.createGridHelper();
    this.createGroundPlane();
    this.createColoredTiles();
    
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);
  }

  private createGridHelper() {
    this.gridHelper = new THREE.GridHelper(
      this.size * 2, 
      this.size, 
      0x333333,
      0x777777
    );
    this.gridHelper.position.y = 0;
    this.mesh.add(this.gridHelper);
  }

  private createGroundPlane() {
    const groundGeometry = new THREE.PlaneGeometry(this.size * 2.2, this.size * 2.2);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xf8f8f8,
      transparent: true,
      opacity: 0.1 
    });
    this.groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
    this.groundPlane.rotation.x = -Math.PI / 2;
    this.groundPlane.position.y = -0.01;
    this.groundPlane.receiveShadow = true;
    this.mesh.add(this.groundPlane);
  }

  private createColoredTiles() {
    if (this.size !== 8) return; // Only create tiles for 8x8 grids

    const tileGeometry = new THREE.PlaneGeometry(2, 2);
    
    // Convert grid position to chess notation
    const getChessNotation = (x: number, z: number): ChessNotation | null => {
      if (x < 0 || x >= 8 || z < 0 || z >= 8) return null;
      const file = String.fromCharCode('a'.charCodeAt(0) + x) as ChessFile;
      const rank = (8 - z) as ChessRank;
      return `${file}${rank}` as ChessNotation;
    };

    // Create tiles for colored squares
    for (let x = 0; x < 8; x++) {
      for (let z = 0; z < 8; z++) {
        const notation = getChessNotation(x, z);
        if (notation && this.tileColors[notation]) {
          const tileMaterial = new THREE.MeshLambertMaterial({
            color: this.tileColors[notation],
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
          });
          
          const tileMesh = new THREE.Mesh(tileGeometry, tileMaterial);
          const worldPos = this.gridToWorld({ x, z });
          tileMesh.position.set(worldPos.x, 0.01, worldPos.z);
          tileMesh.rotation.x = -Math.PI / 2;
          
          this.coloredTiles.push(tileMesh);
          this.mesh.add(tileMesh);
        }
      }
    }
  }

  private gridToWorld(gridPos: Position): THREE.Vector3 {
    const offset = (this.size - 1) / 2;
    return new THREE.Vector3(
      (gridPos.x - offset) * 2,
      0,
      (gridPos.z - offset) * 2
    );
  }

  public getChessNotation(position: Position): ChessNotation | null {
    if (this.size !== 8) return null;
    if (position.x < 0 || position.x >= 8 || position.z < 0 || position.z >= 8) return null;
    
    const file = String.fromCharCode('a'.charCodeAt(0) + position.x) as ChessFile;
    const rank = (8 - position.z) as ChessRank;
    return `${file}${rank}` as ChessNotation;
  }

  public hasColoredTile(position: Position): boolean {
    const notation = this.getChessNotation(position);
    return notation ? !!this.tileColors[notation] : false;
  }
}

// GridStack class for managing multiple stacked grids
class GridStack {
  public grids: Grid[] = [];
  public gridSpacing: number = 8; // Increased vertical spacing between grids
  public scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public addGrid(size: number, tileColors: Partial<Record<ChessNotation, number>> = {}): Grid {
    const level = this.grids.length;
    // Invert Y positioning: higher levels should be visually higher
    // We'll calculate final position after all grids are added
    const grid = new Grid(size, level, 0, tileColors); // temp Y position
    
    this.grids.push(grid);
    this.scene.add(grid.mesh);
    
    // Update positions for all grids
    this.updateGridPositions();
    
    return grid;
  }

  public getGrid(level: number): Grid | null {
    return this.grids[level] || null;
  }

  public getCurrentGrid(cubeState: CubeState): Grid | null {
    return this.getGrid(cubeState.gridLevel);
  }

  private updateGridPositions() {
    const maxLevel = this.grids.length - 1;
    this.grids.forEach((grid, index) => {
      // Invert positioning: level 0 should be at the top
      const yPosition = (maxLevel - index) * this.gridSpacing;
      grid.position.y = yPosition;
      grid.mesh.position.y = yPosition;
    });
  }

  public getGridWorldPosition(level: number, gridPos: Position): THREE.Vector3 {
    const grid = this.getGrid(level);
    if (!grid) return new THREE.Vector3(0, 0, 0);

    const offset = (grid.size - 1) / 2;
    // Use the actual grid Y position plus cube height
    return new THREE.Vector3(
      (gridPos.x - offset) * 2,
      grid.position.y + 1, // +1 for cube height above grid
      (gridPos.z - offset) * 2
    );
  }

  public getMaxLevel(): number {
    return this.grids.length - 1;
  }

  // Define which tiles move up vs down
  public isUpwardTile(notation: ChessNotation): boolean {
    const upwardTiles: ChessNotation[] = ['a8', 'h1']; // Bright gold tiles
    return upwardTiles.includes(notation);
  }
}

// Chess notation for tiles
type ChessFile = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
type ChessRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type ChessNotation = `${ChessFile}${ChessRank}`;

// Tile colors configuration
const TILE_COLORS: Partial<Record<ChessNotation, number>> = {
  'b7': 0x808080, // Gray
  'g3': 0x808080, // Gray
};

// Main game class - handles all game logic
export class CubeGame {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private cube!: CubeState;
  private gridStack!: GridStack;
  private gridSize: number;
  private animationQueue: Animation[] = [];
  
  constructor(canvas: HTMLCanvasElement, gridSize: number = 3) {
    this.gridSize = gridSize;
    this.setupThreeJS(canvas);
    this.setupGridStack();
    this.setupCube();
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
      35, // Reduced FOV for better framing of multiple grids
      width / height, 
      0.1, 
      1000
    );
    // Isometric angle: positioned further back to see all grids
    this.camera.position.set(24, 18, 24);
    this.camera.lookAt(0, 6, 0); // Look at middle height of grid stack
    
    // Add lighting for better 3D perception
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4); // Soft ambient light
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
    
    // Additional fill light from opposite direction
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, -5);
    this.scene.add(fillLight);
    
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  private setupGridStack() {
    this.gridStack = new GridStack(this.scene);
    
    // Create multiple grids - for now, just create 3 levels
    // Level 0 (top): Main grid with current tile colors (no up tiles since it's top)
    this.gridStack.addGrid(this.gridSize, TILE_COLORS);
    
    // Level 1: Another grid with different colored tiles + upward navigation
    this.gridStack.addGrid(this.gridSize, {
      'e4': 0xffcc00, // Gold - down to next level
      'f2': 0xff6b6b, // Light red - down to next level
      'a8': 0xffd700, // Bright gold - UP to previous level
    });
    
    // Level 2: Bottom grid with more tiles + upward navigation
    this.gridStack.addGrid(this.gridSize, {
      'd5': 0x4ecdc4, // Teal - can't go down (bottom level)
      'a1': 0x95e1d3, // Mint - can't go down (bottom level)
      'h8': 0xc7ceea, // Lavender - can't go down (bottom level)
      'c3': 0xfeca57, // Orange - can't go down (bottom level)
      'h1': 0xffd700, // Bright gold - UP to previous level
    });
  }
  
  private setupCube() {
    // Create cube mesh
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    
    // Create distinct materials for each face (muted colors) - using Lambert for lighting
    const materials = [
      new THREE.MeshLambertMaterial({ color: 0xcc6666 }), // Right - Muted Red
      new THREE.MeshLambertMaterial({ color: 0x66cc66 }), // Left - Muted Green  
      new THREE.MeshLambertMaterial({ color: 0x6666cc }), // Top - Muted Blue
      new THREE.MeshLambertMaterial({ color: 0xcccc66 }), // Bottom - Muted Yellow
      new THREE.MeshLambertMaterial({ color: 0xcc66cc }), // Front - Muted Magenta
      new THREE.MeshLambertMaterial({ color: 0x66cccc })  // Back - Muted Cyan
    ];
    
    const mesh = new THREE.Mesh(geometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Add edges for clarity
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(
      edges, 
      new THREE.LineBasicMaterial({ color: 0x000000 })
    );
    mesh.add(line);
    
    this.cube = {
      gridPosition: { x: Math.floor(this.gridSize / 2), z: Math.floor(this.gridSize / 2) },
      gridLevel: 0, // Start at the top grid
      mesh: mesh,
      isAnimating: false,
      orientation: new THREE.Quaternion() // Start with identity quaternion
    };
    
    this.scene.add(mesh);
    this.updateCubePosition();
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
        
        // Check for grid transition on colored tiles
        this.checkGridTransition();
        
        // Dispatch position change event
        this.dispatchPositionChangeEvent();
      }
    };
    
    animate();
  }
  
  private checkGridTransition() {
    const currentGrid = this.gridStack.getCurrentGrid(this.cube);
    if (!currentGrid) return;

    // Check if we're on a colored tile
    if (currentGrid.hasColoredTile(this.cube.gridPosition)) {
      const notation = currentGrid.getChessNotation(this.cube.gridPosition);
      if (!notation) return;

      // Check if it's an upward or downward tile
      if (this.gridStack.isUpwardTile(notation)) {
        // Move up one level if possible
        const nextLevel = this.cube.gridLevel - 1;
        if (nextLevel >= 0) {
          this.transitionToGrid(nextLevel);
        }
      } else {
        // Move down one level if possible (default behavior)
        const nextLevel = this.cube.gridLevel + 1;
        if (nextLevel <= this.gridStack.getMaxLevel()) {
          this.transitionToGrid(nextLevel);
        }
      }
    }
  }

  private transitionToGrid(targetLevel: number) {
    if (targetLevel < 0 || targetLevel > this.gridStack.getMaxLevel()) return;
    
    this.cube.isAnimating = true;
    const startLevel = this.cube.gridLevel;
    const startPosition = this.cube.mesh.position.clone();
    const targetPosition = this.gridStack.getGridWorldPosition(targetLevel, this.cube.gridPosition);
    
    const duration = 800; // milliseconds for grid transition
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const t = this.easeInOutCubic(progress);
      
      // Interpolate position
      const currentPos = startPosition.clone().lerp(targetPosition, t);
      this.cube.mesh.position.copy(currentPos);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Transition complete
        this.cube.gridLevel = targetLevel;
        this.cube.isAnimating = false;
        this.updateCubePosition();
        this.dispatchPositionChangeEvent();
      }
    };
    
    animate();
  }

  private updateCubePosition() {
    const worldPos = this.gridStack.getGridWorldPosition(this.cube.gridLevel, this.cube.gridPosition);
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
    
    // Reset to top grid level
    this.cube.gridLevel = 0;
    
    // Reset orientation to identity (no rotation)
    this.cube.orientation = new THREE.Quaternion();
    
    // Update the cube's visual position and rotation
    this.updateCubePosition();
    
    // Dispatch position change event
    this.dispatchPositionChangeEvent();
  }
  
  private getChessNotation(position: Position, gridLevel: number): ChessNotation | null {
    const grid = this.gridStack.getGrid(gridLevel);
    return grid ? grid.getChessNotation(position) : null;
  }
  
  private dispatchPositionChangeEvent() {
    const notation = this.getChessNotation(this.cube.gridPosition, this.cube.gridLevel);
    const event = new CustomEvent('cubePositionChanged', {
      detail: {
        gridPosition: { ...this.cube.gridPosition },
        gridLevel: this.cube.gridLevel,
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
