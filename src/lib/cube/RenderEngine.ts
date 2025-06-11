import * as THREE from 'three';
import type { Position3D, Rotation3D, RenderConfig } from './types.js';
import { GridSystem } from './GridSystem.js';

export class RenderEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private cube: THREE.Mesh;
  private gridSystem: GridSystem;
  private animationId: number | null = null;

  constructor(canvas: HTMLCanvasElement, gridSystem: GridSystem, config?: Partial<RenderConfig>) {
    this.gridSystem = gridSystem;
    
    const renderConfig: RenderConfig = {
      canvasWidth: canvas.clientWidth,
      canvasHeight: canvas.clientHeight,
      antialias: config?.antialias ?? false,
      powerPreference: config?.powerPreference ?? 'high-performance'
    };

    this.scene = this.createScene();
    this.camera = this.createCamera(renderConfig);
    this.renderer = this.createRenderer(canvas, renderConfig);
    this.cube = this.createCube();
    
    this.setupGrid();
    this.setupEventListeners(canvas);
  }

  private createScene(): THREE.Scene {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    return scene;
  }

  private createCamera(config: RenderConfig): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(
      75,
      config.canvasWidth / config.canvasHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 0);
    camera.lookAt(0, 0, 0);
    return camera;
  }

  private createRenderer(canvas: HTMLCanvasElement, config: RenderConfig): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: config.antialias,
      powerPreference: config.powerPreference
    });
    renderer.setSize(config.canvasWidth, config.canvasHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    return renderer;
  }

  private createCube(): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshBasicMaterial({
      color: 0x0066cc,
      wireframe: false
    });
    
    const cube = new THREE.Mesh(geometry, material);
    
    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const wireframe = new THREE.LineSegments(edges, edgeMaterial);
    cube.add(wireframe);
    
    this.scene.add(cube);
    return cube;
  }

  private setupGrid(): void {
    const gridHelper = new THREE.Group();
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });
    const gridLines = this.gridSystem.createGridLines();
    
    gridLines.horizontal.forEach(line => {
      const geometry = new THREE.BufferGeometry();
      const points = line.map(p => new THREE.Vector3(p.x, p.y, p.z));
      geometry.setFromPoints(points);
      const lineSegment = new THREE.Line(geometry, lineMaterial);
      gridHelper.add(lineSegment);
    });
    
    gridLines.vertical.forEach(line => {
      const geometry = new THREE.BufferGeometry();
      const points = line.map(p => new THREE.Vector3(p.x, p.y, p.z));
      geometry.setFromPoints(points);
      const lineSegment = new THREE.Line(geometry, lineMaterial);
      gridHelper.add(lineSegment);
    });
    
    this.scene.add(gridHelper);
  }

  private setupEventListeners(canvas: HTMLCanvasElement): void {
    this.handleResize = () => {
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', this.handleResize);
  }

  private handleResize = () => {};

  updateCubePosition(position: Position3D): void {
    this.cube.position.set(position.x, position.y, position.z);
  }

  updateCubeRotation(rotation: Rotation3D): void {
    this.cube.rotation.set(rotation.x, rotation.y, rotation.z);
  }

  updateCube(position: Position3D, rotation: Rotation3D): void {
    this.updateCubePosition(position);
    this.updateCubeRotation(rotation);
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  startAnimationLoop(callback: () => void): void {
    const animate = () => {
      callback();
      this.render();
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }

  stopAnimationLoop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  dispose(): void {
    this.stopAnimationLoop();
    this.renderer.dispose();
    window.removeEventListener('resize', this.handleResize);
  }
}