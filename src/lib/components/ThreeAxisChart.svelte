<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

  export let indicator;

  let container;
  let renderer, scene, camera, controls, labelRenderer;
  let animationFrameId;

  const scaleSize = 10; // On utilise une échelle plus grande et plus simple

  onMount(() => {
    // Initialisation de la scène
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Caméra
    camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(scaleSize * 1.2, scaleSize * 1.1, scaleSize * 1.2);
    
    // Renderer WebGL
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Renderer pour les étiquettes (CSS2D)
    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(container.clientWidth, container.clientHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none'; // Très important !
    container.appendChild(labelRenderer.domElement);
    
    // Contrôles
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(scaleSize / 2, scaleSize / 2, scaleSize / 2); // Cible au centre

    // Lumières
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);
    
    // Boucle de rendu
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();

    // Gestion du redimensionnement
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        labelRenderer.setSize(width, height);
      }
    });
    resizeObserver.observe(container);

    // Nettoyage à la destruction du composant
    onDestroy(() => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
      }
      if (labelRenderer && labelRenderer.domElement && container.contains(labelRenderer.domElement)) {
          container.removeChild(labelRenderer.domElement);
      }
      renderer.dispose();
    });
  });

  // Fonction pour mettre à jour la scène quand les données changent
  $: if (indicator && scene) {
    // 1. Vider la scène précédente en supprimant tous les objets de données
    const objectsToRemove = [];
    scene.traverse(child => {
        if (child.isMesh || child.isLine || child.isCSS2DObject || child.isGridHelper) {
            objectsToRemove.push(child);
        }
    });
    objectsToRemove.forEach(child => scene.remove(child));

    // 2. Normalisation des coordonnées de [-10, 10] vers [-scaleSize/2, scaleSize/2] 
    // pour que 0 soit au centre des axes
    const normalize = (value, min = -10, max = 10) => {
      return ((value - min) / (max - min) - 0.5) * scaleSize;
    };

    // 3. Créer les axes centrés
    const createAxis = (dir, color) => {
      const material = new THREE.LineBasicMaterial({ color, linewidth: 2 });
      const start = dir.clone().multiplyScalar(-scaleSize * 0.6);
      const end = dir.clone().multiplyScalar(scaleSize * 0.6);
      const points = [start, end];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(geometry, material);
    };
    scene.add(createAxis(new THREE.Vector3(1,0,0), 0xff4444)); // Axe X
    scene.add(createAxis(new THREE.Vector3(0,1,0), 0x44ff44)); // Axe Y
    scene.add(createAxis(new THREE.Vector3(0,0,1), 0x4444ff)); // Axe Z
    
    // 4. Créer les étiquettes d'axes
    const createLabel = (text, position, className = 'axis-label') => {
        const div = document.createElement('div');
        div.className = className;
        div.textContent = text;
        const label = new CSS2DObject(div);
        label.position.copy(position);
        return label;
    };
    // Labels des axes principaux
    scene.add(createLabel(indicator.axisX.label, new THREE.Vector3(scaleSize * 0.7, 0, 0)));
    scene.add(createLabel(indicator.axisY.label, new THREE.Vector3(0, scaleSize * 0.7, 0)));
    scene.add(createLabel(indicator.axisZ.label, new THREE.Vector3(0, 0, scaleSize * 0.7)));

    // Labels négatifs et positifs pour chaque axe
    if (indicator.axisX.labelNegative) {
      scene.add(createLabel(`− ${indicator.axisX.labelNegative}`, new THREE.Vector3(-scaleSize * 0.6, -0.5, 0), 'axis-label-negative'));
    }
    if (indicator.axisX.labelPositive) {
      scene.add(createLabel(`+ ${indicator.axisX.labelPositive}`, new THREE.Vector3(scaleSize * 0.6, -0.5, 0), 'axis-label-positive'));
    }
    
    if (indicator.axisY.labelNegative) {
      scene.add(createLabel(`− ${indicator.axisY.labelNegative}`, new THREE.Vector3(-0.5, -scaleSize * 0.6, 0), 'axis-label-negative'));
    }
    if (indicator.axisY.labelPositive) {
      scene.add(createLabel(`+ ${indicator.axisY.labelPositive}`, new THREE.Vector3(-0.5, scaleSize * 0.6, 0), 'axis-label-positive'));
    }
    
    if (indicator.axisZ.labelNegative) {
      scene.add(createLabel(`− ${indicator.axisZ.labelNegative}`, new THREE.Vector3(0, -0.5, -scaleSize * 0.6), 'axis-label-negative'));
    }
    if (indicator.axisZ.labelPositive) {
      scene.add(createLabel(`+ ${indicator.axisZ.labelPositive}`, new THREE.Vector3(0, -0.5, scaleSize * 0.6), 'axis-label-positive'));
    }


    // 5. Créer les points de données
    indicator.data.forEach(point => {
      const posX = normalize(point.x, indicator.axisX.min, indicator.axisX.max);
      const posY = normalize(point.y, indicator.axisY.min, indicator.axisY.max);
      const posZ = normalize(point.z, indicator.axisZ.min, indicator.axisZ.max);
      
      const geometry = new THREE.SphereGeometry(scaleSize * 0.025, 32, 32); // Points plus grands
      const material = new THREE.MeshStandardMaterial({ color: point.color, roughness: 0.5, metalness: 0.5 });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(posX, posY, posZ);
      scene.add(sphere);

      // Étiquette du point
      const pointDiv = document.createElement('div');
      pointDiv.className = 'point-label';
      pointDiv.textContent = point.label;
      const pointLabel = new CSS2DObject(pointDiv);
      pointLabel.position.set(posX, posY + scaleSize * 0.04, posZ);
      scene.add(pointLabel);

      // Lignes de projection pour aider à la perception
      const lineMaterial = new THREE.LineDashedMaterial({ color: 0xaaaaaa, dashSize: 0.1, gapSize: 0.1 });
      
      // Ligne verticale du point vers le "sol" (plan XZ)
      let points = [new THREE.Vector3(posX, posY, posZ), new THREE.Vector3(posX, 0, posZ)];
      let lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      let projectionLine = new THREE.Line(lineGeometry, lineMaterial);
      projectionLine.computeLineDistances(); // Nécessaire pour les pointillés
      scene.add(projectionLine);

    });

    // 6. Grille de référence centrée sur l'origine
    const gridHelper = new THREE.GridHelper(scaleSize, 10, 0xcccccc, 0xcccccc);
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    gridHelper.position.set(0, 0, 0); // Centrer la grille sur l'origine (0,0,0)
    scene.add(gridHelper);

    // 7. Recentrer la caméra et les contrôles sur l'origine
    controls.target.set(0, 0, 0);
    camera.lookAt(0, 0, 0);
    controls.update();
  }
</script>

<div class="chart-container">
  <div class="chart-header">
    <h2>{indicator.title}</h2>
  </div>
  
  <div class="chart-3d" bind:this={container}>
    <!-- Le canvas three.js sera injecté ici -->
  </div>
  
  <div class="data-legend">
    <div class="controls-info">
      <small>🖱️ Clic gauche: rotation | Molette: zoom | Clic droit: déplacement</small>
    </div>
    <hr/>
    {#each indicator.data as point}
      <div class="legend-item">
        <div class="color-dot" style="background-color: {point.color}"></div>
        <span>{point.label}</span>
        <span class="coordinates">({point.x}, {point.y}, {point.z})</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .chart-container {
    width: 100%;
    height: 80vh; /* 80% de la hauteur de la fenêtre */
    min-height: 500px; /* Hauteur minimale */
    max-height: 1000px; /* Hauteur maximale */
    border: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
    position: relative;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .chart-header {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #eee;
    background: #f9f9f9;
    border-radius: 8px 8px 0 0;
  }
  
  .chart-header h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .chart-3d {
    flex-grow: 1;
    overflow: hidden; /* Empêche les débordements */
  }

  .data-legend {
    padding: 0.75rem 1rem;
    border-top: 1px solid #eee;
    background: #f9f9f9;
    max-height: 120px;
    overflow-y: auto;
    border-radius: 0 0 8px 8px;
  }
  
  .controls-info {
    font-size: 0.75rem;
    color: #888;
    font-style: italic;
    margin-bottom: 0.4rem;
  }

  hr {
    border: none;
    border-top: 1px solid #eee;
    margin: 0.5rem 0;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .coordinates {
    color: #666;
    font-size: 0.8rem;
  }

  /* Styles pour les étiquettes 3D */
  :global(.axis-label) {
    color: #333;
    font-family: sans-serif;
    font-size: 12px;
    font-weight: bold;
    background: rgba(255, 255, 255, 0.9);
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid #ddd;
  }

  :global(.axis-label-negative) {
    color: #dc3545;
    font-family: sans-serif;
    font-size: 10px;
    background: rgba(220, 53, 69, 0.1);
    padding: 1px 4px;
    border-radius: 2px;
    border: 1px solid #dc3545;
  }

  :global(.axis-label-positive) {
    color: #28a745;
    font-family: sans-serif;
    font-size: 10px;
    background: rgba(40, 167, 69, 0.1);
    padding: 1px 4px;
    border-radius: 2px;
    border: 1px solid #28a745;
  }
  
  :global(.point-label) {
    color: #000;
    font-family: sans-serif;
    font-size: 11px;
    background: rgba(255, 255, 255, 0.8);
    padding: 1px 3px;
    border-radius: 2px;
    white-space: nowrap;
  }
</style>
