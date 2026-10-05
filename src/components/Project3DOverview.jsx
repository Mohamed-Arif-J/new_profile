import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Layers, ArrowUpRight, Compass } from 'lucide-react';

/**
 * Project3DOverview
 * Interactive 3D Perspective Grid & Project Cubes
 * Inspired by Skiper UI (skiper36) and architectural editorial design:
 *
 * 1. Perspective 3D Grid: Horizontal plane extending into depth with converging lines
 * 2. 12 3D Cubes/Blocks: Mapped to the 12 projects in portfolio.projects
 * 3. Directional Lighting: Creates clear top, front, and side face contrast (authentic 3D)
 * 4. Subtle Parallax Interaction: Mouse movement tilts scene 1-4 degrees smoothly
 * 5. Hover & Selection: Cubes elevate, highlight, and display an architectural HUD badge
 * 6. Dark & Light Theme: Seamless neutral color adaptation without WebGL remounting
 * 7. Layering: 100% transparent canvas allowing existing background stroke to flow behind
 */
export default function Project3DOverview({
  projects = [],
  onSelectProject,
  theme = 'light',
  isMobile = false,
}) {
  const mountRef = useRef(null);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [hudPos, setHudPos] = useState({ x: 0, y: 0 });

  // References for Three.js state
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const cubeMeshesRef = useRef([]);
  const gridHelperRef = useRef(null);
  const gridLinesRef = useRef(null);
  const lightsRef = useRef({});
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseNormRef = useRef({ x: 0, y: 0 });
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const mouseCurrentRef = useRef({ x: 0, y: 0 });
  const hoveredCubeIndexRef = useRef(-1);
  const animFrameIdRef = useRef(null);
  const prefersReducedMotionRef = useRef(false);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotionRef.current = mq.matches;
      const handler = (e) => {
        prefersReducedMotionRef.current = e.matches;
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);

  // Carefully arranged 12 cube positions inspired by Skiper 36 (spread across a 12x12 grid)
  const cubeLayouts = useMemo(() => {
    return [
      { gridX: -3.5, gridZ: -2.5, h: 1.3, w: 1.3, d: 1.3 }, // 01 AI Image Detector
      { gridX: -1.2, gridZ: -3.2, h: 1.5, w: 1.4, d: 1.4 }, // 02 Counselling App
      { gridX: 1.8,  gridZ: -3.0, h: 1.2, w: 1.3, d: 1.3 }, // 03 Caught in 4K
      { gridX: 3.6,  gridZ: -1.8, h: 1.4, w: 1.4, d: 1.4 }, // 04 RageWare OS
      { gridX: -4.0, gridZ: 0.2,  h: 1.2, w: 1.3, d: 1.3 }, // 05 NOBROWSE
      { gridX: -1.8, gridZ: -0.5, h: 1.6, w: 1.5, d: 1.5 }, // 06 NaaS
      { gridX: 0.8,  gridZ: -0.8, h: 1.3, w: 1.3, d: 1.3 }, // 07 Fake Review Detector
      { gridX: 2.9,  gridZ: 0.5,  h: 1.5, w: 1.4, d: 1.4 }, // 08 Savoria
      { gridX: -3.0, gridZ: 2.4,  h: 1.4, w: 1.4, d: 1.4 }, // 09 Screen Addiction
      { gridX: -0.8, gridZ: 2.0,  h: 1.2, w: 1.3, d: 1.3 }, // 10 Smart Hostel
      { gridX: 1.6,  gridZ: 2.2,  h: 1.5, w: 1.4, d: 1.4 }, // 11 Portfolio
      { gridX: 3.8,  gridZ: 2.6,  h: 1.3, w: 1.3, d: 1.3 }, // 12 Smart Mirror
    ];
  }, []);

  // Theme-aware colors palette (Strictly neutral architectural tones: NO RED / NO PINK / NO NEON)
  const getThemePalette = useCallback((isDark) => {
    if (isDark) {
      return {
        gridMain: 0x334155, // Subtle slate line
        gridSub: 0x1e293b,  // Dark slate line
        cubeBody: 0x94a3b8, // Light muted slate
        cubeEdges: 0xe2e8f0, // Crisp off-white edges
        cubeHover: 0xf1f5f9, // Bright off-white hover
        lightAmbient: 0xffffff,
        ambientIntensity: 0.75,
        lightDir: 0xffffff,
        dirIntensity: 1.2,
      };
    }
    // Light mode
    return {
      gridMain: 0x94a3b8, // Subtle cool gray
      gridSub: 0xe2e8f0,  // Soft crisp line
      cubeBody: 0x1e293b, // Deep dark slate / charcoal
      cubeEdges: 0x0f172a, // Near-black crisp edges
      cubeHover: 0x0284c7, // Accent slate/cyan highlight
      lightAmbient: 0xffffff,
      ambientIntensity: 0.9,
      lightDir: 0xffffff,
      dirIntensity: 1.35,
    };
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 650;
    const isDark = theme === 'dark' || document.documentElement.getAttribute('data-theme') === 'dark';
    const palette = getThemePalette(isDark);

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera with isometric perspective
    // Looking down at the grid plane at ~32 degrees angle
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 11, 15);
    camera.lookAt(0, 0, -0.5);
    cameraRef.current = camera;

    // 3. Renderer with transparent background so background stroke flows behind
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0); // 100% transparent
    renderer.shadowMap.enabled = false;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(palette.lightAmbient, palette.ambientIntensity);
    scene.add(ambientLight);

    // Directional light positioned top-left for crisp face shading (highlight top face, mid front, shaded side)
    const dirLight = new THREE.DirectionalLight(palette.lightDir, palette.dirIntensity);
    dirLight.position.set(-12, 18, 12);
    scene.add(dirLight);

    // Fill light from opposite side
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(10, 8, -6);
    scene.add(fillLight);

    lightsRef.current = { ambient: ambientLight, dir: dirLight, fill: fillLight };

    // 5. 3D Perspective Grid
    // We create custom grid lines converging naturally into depth
    const gridGroup = new THREE.Group();
    const GRID_SIZE = 14;
    const GRID_DIVISIONS = 14;
    const STEP = GRID_SIZE / GRID_DIVISIONS;
    const HALF = GRID_SIZE / 2;

    const linePoints = [];
    for (let i = 0; i <= GRID_DIVISIONS; i++) {
      const pos = -HALF + i * STEP;
      // Z-parallel lines (converging in perspective toward depth)
      linePoints.push(new THREE.Vector3(pos, 0, -HALF));
      linePoints.push(new THREE.Vector3(pos, 0, HALF));
      // X-parallel lines
      linePoints.push(new THREE.Vector3(-HALF, 0, pos));
      linePoints.push(new THREE.Vector3(HALF, 0, pos));
    }

    const gridGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    const gridMaterial = new THREE.LineBasicMaterial({
      color: palette.gridMain,
      transparent: true,
      opacity: isDark ? 0.38 : 0.42,
      depthWrite: false,
    });
    const gridLines = new THREE.LineSegments(gridGeometry, gridMaterial);
    gridGroup.add(gridLines);
    scene.add(gridGroup);
    gridLinesRef.current = gridLines;
    gridHelperRef.current = gridGroup;

    // 6. Interactive 3D Cubes
    const cubeMeshes = [];
    cubeMeshesRef.current = cubeMeshes;

    const count = Math.min(projects.length, cubeLayouts.length);
    for (let i = 0; i < count; i++) {
      const layout = cubeLayouts[i];
      const project = projects[i];

      // Cube geometry
      const geometry = new THREE.BoxGeometry(layout.w, layout.h, layout.d);

      // Cube material with slight metalness and smooth roughness for realistic light response
      const material = new THREE.MeshStandardMaterial({
        color: palette.cubeBody,
        roughness: 0.38,
        metalness: 0.15,
        flatShading: false,
      });

      const mesh = new THREE.Mesh(geometry, material);
      const baseY = layout.h / 2;
      mesh.position.set(layout.gridX, baseY, layout.gridZ);

      // Edge outline for architectural wireframe touch
      const edgesGeom = new THREE.EdgesGeometry(geometry);
      const edgesMat = new THREE.LineBasicMaterial({
        color: palette.cubeEdges,
        transparent: true,
        opacity: isDark ? 0.45 : 0.35,
      });
      const edgesLine = new THREE.LineSegments(edgesGeom, edgesMat);
      mesh.add(edgesLine);

      // Metadata for animations
      mesh.userData = {
        index: i,
        project,
        baseY,
        targetY: baseY,
        baseScale: 1,
        targetScale: 1,
        targetRotY: 0,
        edgesLine,
        material,
      };

      scene.add(mesh);
      cubeMeshes.push(mesh);
    }

    // 7. Resize Observer for smooth responsiveness
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 650;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 8. Continuous Render Loop with smooth lerp
    let lastTime = performance.now();

    const animate = (time) => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Parallax rotation & camera motion
      if (!prefersReducedMotionRef.current && !isMobile) {
        // Lerp mouse coordinates smoothly
        mouseCurrentRef.current.x += (mouseTargetRef.current.x - mouseCurrentRef.current.x) * 0.06;
        mouseCurrentRef.current.y += (mouseTargetRef.current.y - mouseCurrentRef.current.y) * 0.06;

        // Subtle camera and scene tilt (1.5 - 3.5 degrees)
        gridGroup.rotation.y = mouseCurrentRef.current.x * 0.07;
        gridGroup.rotation.x = mouseCurrentRef.current.y * 0.04;

        camera.position.x = mouseCurrentRef.current.x * 1.4;
        camera.position.y = 11 + mouseCurrentRef.current.y * 1.0;
        camera.lookAt(0, 0, -0.5);
      }

      // Smoothly animate cube elevations and hover transforms
      for (let i = 0; i < cubeMeshes.length; i++) {
        const mesh = cubeMeshes[i];
        const ud = mesh.userData;

        // Gentle breathing float when idle
        const idleFloat = prefersReducedMotionRef.current ? 0 : Math.sin(time * 0.0016 + i * 0.7) * 0.06;

        // Elevate on hover
        mesh.position.y += (ud.targetY + idleFloat - mesh.position.y) * 0.12;

        // Scale on hover
        const curScale = mesh.scale.x;
        const nextScale = curScale + (ud.targetScale - curScale) * 0.12;
        mesh.scale.set(nextScale, nextScale, nextScale);

        // Rotation
        mesh.rotation.y += (ud.targetRotY - mesh.rotation.y) * 0.1;
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Cleanup on unmount
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();

      // Dispose Three.js objects
      cubeMeshes.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
        if (mesh.userData.edgesLine) {
          mesh.userData.edgesLine.geometry.dispose();
          mesh.userData.edgesLine.material.dispose();
        }
      });
      gridGeometry.dispose();
      gridMaterial.dispose();
      renderer.dispose();
    };
  }, [projects, cubeLayouts, getThemePalette, isMobile]);

  // Update theme colors seamlessly without reloading the WebGL canvas
  useEffect(() => {
    const isDark = theme === 'dark' || document.documentElement.getAttribute('data-theme') === 'dark';
    const palette = getThemePalette(isDark);

    if (gridLinesRef.current) {
      gridLinesRef.current.material.color.setHex(palette.gridMain);
      gridLinesRef.current.material.opacity = isDark ? 0.38 : 0.42;
    }

    if (lightsRef.current.ambient) {
      lightsRef.current.ambient.color.setHex(palette.lightAmbient);
      lightsRef.current.ambient.intensity = palette.ambientIntensity;
    }
    if (lightsRef.current.dir) {
      lightsRef.current.dir.color.setHex(palette.lightDir);
      lightsRef.current.dir.intensity = palette.dirIntensity;
    }

    cubeMeshesRef.current.forEach((mesh) => {
      if (mesh.userData?.material) {
        mesh.userData.material.color.setHex(palette.cubeBody);
      }
      if (mesh.userData?.edgesLine?.material) {
        mesh.userData.edgesLine.material.color.setHex(palette.cubeEdges);
        mesh.userData.edgesLine.material.opacity = isDark ? 0.45 : 0.35;
      }
    });
  }, [theme, getThemePalette]);

  // Pointer move handler on container
  const handlePointerMove = useCallback(
    (e) => {
      const container = mountRef.current;
      if (!container || isMobile) return;

      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      mouseTargetRef.current = {
        x: Math.max(-1, Math.min(1, nx)),
        y: Math.max(-1, Math.min(1, ny)),
      };

      mouseNormRef.current = { x: nx, y: ny };

      // Raycast against cubes
      if (cameraRef.current && cubeMeshesRef.current.length > 0) {
        const raycaster = raycasterRef.current;
        raycaster.setFromCamera({ x: nx, y: ny }, cameraRef.current);
        const intersects = raycaster.intersectObjects(cubeMeshesRef.current, false);

        if (intersects.length > 0) {
          const hitMesh = intersects[0].object;
          const hitIdx = hitMesh.userData.index;

          if (hoveredCubeIndexRef.current !== hitIdx) {
            // Unhover previous
            if (hoveredCubeIndexRef.current >= 0) {
              const prev = cubeMeshesRef.current[hoveredCubeIndexRef.current];
              if (prev) {
                prev.userData.targetY = prev.userData.baseY;
                prev.userData.targetScale = 1;
                prev.userData.targetRotY = 0;
                prev.userData.material.emissive?.setHex(0x000000);
              }
            }

            // Hover new
            hoveredCubeIndexRef.current = hitIdx;
            hitMesh.userData.targetY = hitMesh.userData.baseY + 0.55;
            hitMesh.userData.targetScale = 1.08;
            hitMesh.userData.targetRotY = 0.08;

            const isDark = theme === 'dark' || document.documentElement.getAttribute('data-theme') === 'dark';
            hitMesh.userData.material.emissive?.setHex(isDark ? 0x222a36 : 0x0f172a);

            setHoveredProject(hitMesh.userData.project);
            container.style.cursor = 'pointer';
          }

          // Update HUD position
          setHudPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        } else {
          // No cubes hit
          if (hoveredCubeIndexRef.current >= 0) {
            const prev = cubeMeshesRef.current[hoveredCubeIndexRef.current];
            if (prev) {
              prev.userData.targetY = prev.userData.baseY;
              prev.userData.targetScale = 1;
              prev.userData.targetRotY = 0;
              prev.userData.material.emissive?.setHex(0x000000);
            }
            hoveredCubeIndexRef.current = -1;
            setHoveredProject(null);
            container.style.cursor = 'default';
          }
        }
      }
    },
    [isMobile, theme]
  );

  const handlePointerLeave = useCallback(() => {
    mouseTargetRef.current = { x: 0, y: 0 };
    if (hoveredCubeIndexRef.current >= 0) {
      const prev = cubeMeshesRef.current[hoveredCubeIndexRef.current];
      if (prev) {
        prev.userData.targetY = prev.userData.baseY;
        prev.userData.targetScale = 1;
        prev.userData.targetRotY = 0;
        prev.userData.material.emissive?.setHex(0x000000);
      }
      hoveredCubeIndexRef.current = -1;
      setHoveredProject(null);
    }
    if (mountRef.current) mountRef.current.style.cursor = 'default';
  }, []);

  // Click cube to select project
  const handleClick = useCallback(
    (e) => {
      const container = mountRef.current;
      if (!container || !cameraRef.current) return;

      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      const raycaster = raycasterRef.current;
      raycaster.setFromCamera({ x: nx, y: ny }, cameraRef.current);
      const intersects = raycaster.intersectObjects(cubeMeshesRef.current, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const project = hit.userData?.project;
        if (project && onSelectProject) {
          onSelectProject(project.id);
        }
      }
    },
    [onSelectProject]
  );

  return (
    <motion.div
      className="project-3d-overview-root"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, filter: 'blur(6px)' }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      aria-label="Interactive 3D overview of projects"
    >
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={mountRef} className="project-3d-canvas-mount" />

      {/* Subtle Top Architectural Coordinates Tag */}
      <div className="overview-hud-header" aria-hidden="true">
        <div className="overview-hud-pill">
          <Compass size={13} className="overview-hud-icon" />
          <span>3D PERSPECTIVE OVERVIEW · 12 ARCHITECTURES</span>
        </div>
        <div className="overview-hud-coords">
          <span>PLANE: 14×14</span>
          <span className="overview-hud-sep">/</span>
          <span>ELEVATION: 32°</span>
        </div>
      </div>

      {/* Floating HUD Tooltip when hovering over a 3D block */}
      <AnimatePresence>
        {hoveredProject && (
          <motion.div
            className="overview-cube-tooltip"
            initial={{ opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            style={{
              left: `${hudPos.x}px`,
              top: `${hudPos.y - 18}px`,
            }}
          >
            <div className="cube-tooltip-header">
              <span className="cube-tooltip-cat">{hoveredProject.category}</span>
              <span className="cube-tooltip-action">
                <span>View</span>
                <ArrowUpRight size={11} />
              </span>
            </div>
            <h4 className="cube-tooltip-title">{hoveredProject.title}</h4>
            <p className="cube-tooltip-tagline">{hoveredProject.tagline}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Architectural Prompt / Instruction Badge */}
      <div className="overview-bottom-prompt" aria-hidden="true">
        <div className="overview-prompt-pill">
          <span className="overview-prompt-pulse" />
          <span className="overview-prompt-text">
            Click any block or select from the index to explore architecture
          </span>
        </div>
      </div>

      {/* Corner Registration Reticles */}
      <div className="overview-corner tl">+</div>
      <div className="overview-corner tr">+</div>
      <div className="overview-corner bl">+</div>
      <div className="overview-corner br">+</div>
    </motion.div>
  );
}
