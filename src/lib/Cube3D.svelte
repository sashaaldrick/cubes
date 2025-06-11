<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';

  let canvas: HTMLCanvasElement;
  let mouseDown = false;
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;
  let rotationX = 0;
  let rotationY = 0;
  let animationId: number;
  let isAnimating = false;
  let startAnimation: () => void;

  onMount(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: false,
      powerPreference: "high-performance"
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshBasicMaterial({
      color: 0x0066cc,
      wireframe: false
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const wireframe = new THREE.LineSegments(edges, edgeMaterial);
    cube.add(wireframe);

    const handleResize = () => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      cube.rotation.x = rotationX;
      cube.rotation.y = rotationY;
      renderer.render(scene, camera);
    };

    const animate = () => {
      const deltaX = Math.abs(targetRotationX - rotationX);
      const deltaY = Math.abs(targetRotationY - rotationY);
      
      if (deltaX > 0.001 || deltaY > 0.001) {
        rotationX += (targetRotationX - rotationX) * 0.1;
        rotationY += (targetRotationY - rotationY) * 0.1;
        render();
        animationId = requestAnimationFrame(animate);
      } else {
        isAnimating = false;
        rotationX = targetRotationX;
        rotationY = targetRotationY;
        render();
      }
    };

    startAnimation = () => {
      if (!isAnimating) {
        isAnimating = true;
        animate();
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  });

  function handleMouseDown(event: MouseEvent) {
    mouseDown = true;
    mouseX = event.clientX;
    mouseY = event.clientY;
  }

  function handleMouseUp() {
    mouseDown = false;
  }

  function handleMouseMove(event: MouseEvent) {
    if (!mouseDown) return;

    const deltaX = event.clientX - mouseX;
    const deltaY = event.clientY - mouseY;

    targetRotationY += deltaX * 0.01;
    targetRotationX += deltaY * 0.01;

    mouseX = event.clientX;
    mouseY = event.clientY;
    
    if (startAnimation) startAnimation();
  }
</script>

<canvas
  bind:this={canvas}
  on:mousedown={handleMouseDown}
  on:mouseup={handleMouseUp}
  on:mousemove={handleMouseMove}
  on:mouseleave={handleMouseUp}
  class="cube-canvas"
></canvas>

<style>
  .cube-canvas {
    width: 100%;
    height: 100%;
    display: block;
    cursor: grab;
  }

  .cube-canvas:active {
    cursor: grabbing;
  }
</style>