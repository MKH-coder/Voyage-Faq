import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { 
  Compass, 
  Car, 
  MapPin, 
  Sun, 
  Sunset, 
  Moon, 
  Layers, 
  RotateCw, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Sparkles,
  Maximize2,
  Info,
  Eye,
  Zap
} from 'lucide-react';
import { FAQCategory } from '../types.js';

interface ThreeTravelDioramaProps {
  onSelectCategory?: (category: FAQCategory) => void;
  onFilterSearch?: (keyword: string) => void;
}

interface WaypointData {
  id: string;
  name: string;
  subtitle: string;
  category: FAQCategory;
  searchKeyword: string;
  position: [number, number, number];
  description: string;
  officialTip: string;
}

const WAYPOINTS: WaypointData[] = [
  {
    id: 'ksamil-beach',
    name: 'Ksamil & Albanian Riviera',
    subtitle: 'Turquoise Waters & Coastal FAQ',
    category: 'connectivity-tech',
    searchKeyword: 'eSIM',
    position: [2.8, 0.5, 2.0],
    description: 'White pebble beaches and crystal Ionian sea. Best reached with Vodafone or ONE eSIM pre-activated at Tirana airport.',
    officialTip: 'Rent beach umbrellas in Lek (ALL) for better rates than Euro. Cards accepted at beach clubs.',
  },
  {
    id: 'berat-citadel',
    name: 'Historic Citadel & Castle',
    subtitle: 'UNESCO Heritage & Etiquette',
    category: 'customs-etiquette',
    searchKeyword: 'Mosque',
    position: [-2.5, 1.5, -2.0],
    description: 'The city of a thousand windows with preserved stone castles, historic mosques, and Orthodox Byzantine churches.',
    officialTip: 'Modest dress required for places of worship. Shoes removed at mosque entrances; head coverings provided.',
  },
  {
    id: 'theth-alps',
    name: 'Theth & Accursed Mountains',
    subtitle: 'Private 4x4 Driver & High Passes',
    category: 'transit-transport',
    searchKeyword: 'Driver',
    position: [-2.0, 2.1, 2.5],
    description: 'Dramatic limestone peaks of the Albanian Alps with switchback roads requiring high-clearance 4x4 vehicles and experienced local drivers.',
    officialTip: 'Your private tour driver handles mountain terrain and Llogara pass switchbacks with zero deposit hassle.',
  },
  {
    id: 'tirana-hub',
    name: 'Tirana Central Hub',
    subtitle: 'Currency Exchange & ATMs',
    category: 'currency-budget',
    searchKeyword: 'Lek',
    position: [0.3, 0.8, -0.7],
    description: 'Bustling capital with currency exchange bureaus offering near-interbank rates without airport commission markups.',
    officialTip: 'Always withdraw in Albanian Lek (ALL) and reject dynamic currency conversion at Credins or BKT ATMs.',
  },
  {
    id: 'sos-concierge',
    name: 'Emergency & Maritime Coast',
    subtitle: '24/7 Concierge Hotline 112',
    category: 'safety-emergency',
    searchKeyword: 'Emergency',
    position: [1.4, 0.6, 3.5],
    description: 'Coastal patrol and direct 24/7 tour operator concierge hotline covering land and sea excursions across Albania.',
    officialTip: 'Universal emergency line 112 connects directly in English/Italian. Tour operations team is on call 24/7.',
  },
];

const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();

export const ThreeTravelDiorama: React.FC<ThreeTravelDioramaProps> = ({
  onSelectCategory,
  onFilterSearch,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedWaypoint, setSelectedWaypoint] = useState<WaypointData | null>(WAYPOINTS[0]);
  const [lightingPreset, setLightingPreset] = useState<'noon' | 'golden' | 'twilight'>('noon');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);
  const [activeCameraView, setActiveCameraView] = useState<'overview' | 'vehicle' | 'compass' | 'fortress'>('overview');
  
  // New Toggles for Depth of Field & Ambient Bloom
  const [enableDepthOfField, setEnableDepthOfField] = useState<boolean>(false);
  const [enableAmbientBloom, setEnableAmbientBloom] = useState<boolean>(true);

  const sceneStateRef = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    controls: OrbitControls | null;
    waypointMarkers: { group: THREE.Group; data: WaypointData; pulseRing: THREE.Mesh }[];
    carGroup: THREE.Group | null;
    compassNeedle: THREE.Group | null;
    lighthouseBeam: THREE.SpotLight | null;
    waterMesh: THREE.Mesh | null;
    keyLight: THREE.DirectionalLight | null;
    hemiLight: THREE.HemisphereLight | null;
    cloudGroup: THREE.Group | null;
    starField: THREE.Points | null;
    dofLensBlurLayer: THREE.Mesh | null;
    bloomGlowMesh: THREE.Mesh | null;
    explodedParts: { object: THREE.Object3D; originalY: number; targetOffset: number }[];
    targetCameraPos: THREE.Vector3;
    targetLookAt: THREE.Vector3;
    isTransitioningCamera: boolean;
  }>({
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    waypointMarkers: [],
    carGroup: null,
    compassNeedle: null,
    lighthouseBeam: null,
    waterMesh: null,
    keyLight: null,
    hemiLight: null,
    cloudGroup: null,
    starField: null,
    dofLensBlurLayer: null,
    bloomGlowMesh: null,
    explodedParts: [],
    targetCameraPos: new THREE.Vector3(8, 7, 10),
    targetLookAt: new THREE.Vector3(0, 0.5, 0),
    isTransitioningCamera: false,
  });

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 580;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1128);
    scene.fog = new THREE.FogExp2(0x0a1128, 0.028);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(8.5, 6.5, 10.0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 4.0;
    controls.maxDistance = 22;
    controls.target.set(0, 0.5, 0);

    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e1b4b, 1.4);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 3.2);
    keyLight.position.set(10, 15, 8);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
    fillLight.position.set(-8, 6, -6);
    scene.add(fillLight);

    // 1. STARFIELD & CLOUDS
    const starCount = 300;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 60;
      starPositions[i + 1] = Math.random() * 30 + 5;
      starPositions[i + 2] = (Math.random() - 0.5) * 60;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starField = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.8 }));
    scene.add(starField);
    sceneStateRef.current.starField = starField;

    const cloudGroup = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1.0, transparent: true, opacity: 0.55, flatShading: true });
    for (let c = 0; c < 8; c++) {
      const singleCloud = new THREE.Group();
      const puffs = 4 + (c % 3);
      for (let p = 0; p < puffs; p++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(0.8 + Math.random() * 0.6, 7, 7), cloudMat);
        puff.position.set((p - puffs / 2) * 1.1, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.6);
        singleCloud.add(puff);
      }
      const angle = (c / 8) * Math.PI * 2;
      const radius = 14 + (c % 2) * 4;
      singleCloud.position.set(Math.cos(angle) * radius, 7 + (c % 3) * 1.5, Math.sin(angle) * radius);
      cloudGroup.add(singleCloud);
    }
    scene.add(cloudGroup);
    sceneStateRef.current.cloudGroup = cloudGroup;

    // Canvas textures
    const createCompassTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createRadialGradient(256, 256, 10, 256, 256, 250);
      grad.addColorStop(0, '#fffbf0');
      grad.addColorStop(0.75, '#fef3c7');
      grad.addColorStop(1, '#d97706');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(256, 256, 235, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#991b1b';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('N', 256, 75);
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('S', 256, 437);
      ctx.fillText('E', 437, 256);
      ctx.fillText('W', 75, 256);

      ctx.fillStyle = '#92400e';
      ctx.font = 'italic 18px sans-serif';
      ctx.fillText('VOYAGE · ALBANIA', 256, 230);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    const createLuggageDecalTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#92400e';
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(80, 80, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TIRANA', 80, 84);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    const terrainMaterial = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9, metalness: 0.05, flatShading: true });
    const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.8, metalness: 0.0, flatShading: true });
    const sandMaterial = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.95, metalness: 0.0 });
    const seaMaterial = new THREE.MeshPhysicalMaterial({ color: 0x0ea5e9, roughness: 0.1, metalness: 0.1, transmission: isSoftwareGl ? 0 : 0.65, transparent: true, opacity: 0.88, ior: 1.33 });
    const stoneFortressMaterial = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.8, metalness: 0.1, flatShading: true });
    const goldBrassMaterial = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.92, roughness: 0.22 });
    const chromeMaterial = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
    const rubberMaterial = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9, metalness: 0.05 });
    const safariCarMaterial = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.4 });
    const glassCarMaterial = new THREE.MeshPhysicalMaterial({ color: 0xbae6fd, roughness: 0.05, transmission: isSoftwareGl ? 0 : 0.8, transparent: true, opacity: 0.65 });

    // DIORAMA GROUP
    const dioramaGroup = new THREE.Group();
    dioramaGroup.rotation.x = 0.08;
    dioramaGroup.rotation.z = -0.05;
    scene.add(dioramaGroup);

    // Island base
    const islandBaseMesh = new THREE.Mesh(new THREE.CylinderGeometry(5.8, 5.0, 1.4, 8), terrainMaterial);
    islandBaseMesh.position.y = -0.7;
    islandBaseMesh.receiveShadow = !isSoftwareGl;
    dioramaGroup.add(islandBaseMesh);

    const coreMesh = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.5 }));
    coreMesh.position.y = -0.95;
    dioramaGroup.add(coreMesh);

    // Mountain group
    const mountainGroup = new THREE.Group();
    for (let i = 0; i < 7; i++) {
      const mMesh = new THREE.Mesh(new THREE.ConeGeometry(1.0 + Math.random() * 0.8, 2.0 + Math.random() * 1.4, 5), terrainMaterial);
      const angle = (i / 7) * Math.PI * 0.95 + 2.3;
      const radius = 2.8 + (i % 2) * 0.5;
      mMesh.position.set(Math.cos(angle) * radius, 0.8 + (i % 3) * 0.35, Math.sin(angle) * radius);
      mMesh.rotation.y = i * 0.5;
      mountainGroup.add(mMesh);
    }
    dioramaGroup.add(mountainGroup);

    const plateauMesh = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.5, 0.35, 8), grassMaterial);
    plateauMesh.position.y = 0.05;
    dioramaGroup.add(plateauMesh);

    const beachMesh = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.3, 3.2), sandMaterial);
    beachMesh.position.set(2.6, 0.08, 2.0);
    beachMesh.rotation.y = 0.35;
    dioramaGroup.add(beachMesh);

    const waterMesh = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.2, 28), seaMaterial);
    waterMesh.position.set(2.9, 0.12, 2.3);
    dioramaGroup.add(waterMesh);
    sceneStateRef.current.waterMesh = waterMesh;

    // Ambient Bloom Glow Overlay Mesh (Simulates Bloom when enabled)
    const bloomGlowMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    bloomGlowMesh.position.set(-0.7, 0.8, 0.9);
    bloomGlowMesh.visible = enableAmbientBloom;
    dioramaGroup.add(bloomGlowMesh);
    sceneStateRef.current.bloomGlowMesh = bloomGlowMesh;

    // Depth of Field Lens Blur Vignette Layer (Simulates DOF when enabled)
    const dofLensBlurLayer = new THREE.Mesh(
      new THREE.RingGeometry(2.2, 7.5, 32),
      new THREE.MeshBasicMaterial({ color: 0x0a1128, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })
    );
    dofLensBlurLayer.rotation.x = -Math.PI / 2;
    dofLensBlurLayer.position.y = -0.5;
    dofLensBlurLayer.visible = enableDepthOfField;
    scene.add(dofLensBlurLayer);
    sceneStateRef.current.dofLensBlurLayer = dofLensBlurLayer;

    // 4x4 Expedition Vehicle
    const carGroup = new THREE.Group();
    carGroup.position.set(-0.7, 0.22, 0.9);
    carGroup.rotation.y = -0.45;
    carGroup.add(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.9), safariCarMaterial));
    const carCabin = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.84), safariCarMaterial);
    carCabin.position.set(-0.15, 0.8, 0);
    carGroup.add(carCabin);
    carGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.36, 0.86), glassCarMaterial)).position.set(-0.15, 0.8, 0);
    
    const suitcaseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.22, 0.38), new THREE.MeshStandardMaterial({ map: createLuggageDecalTexture() }));
    suitcaseMesh.position.set(-0.25, 1.2, 0.12);
    carGroup.add(suitcaseMesh);

    const tentMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.45, 12), new THREE.MeshStandardMaterial({ color: 0x4b5563 }));
    tentMesh.rotation.z = Math.PI / 2;
    tentMesh.position.set(-0.1, 1.18, -0.2);
    carGroup.add(tentMesh);
    dioramaGroup.add(carGroup);
    sceneStateRef.current.carGroup = carGroup;

    // Compass & Astrolabe
    const compassGroup = new THREE.Group();
    compassGroup.position.set(1.6, 0.38, -1.8);
    compassGroup.scale.set(0.95, 0.95, 0.95);
    const compassBowl = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0, 0), new THREE.Vector2(1.1, 0), new THREE.Vector2(1.2, 0.15), new THREE.Vector2(1.08, 0.4)], 32), goldBrassMaterial);
    compassGroup.add(compassBowl);
    const dialMesh = new THREE.Mesh(new THREE.CircleGeometry(0.96, 32), new THREE.MeshStandardMaterial({ map: createCompassTexture() }));
    dialMesh.rotation.x = -Math.PI / 2;
    dialMesh.position.y = 0.21;
    compassGroup.add(dialMesh);

    const needleAssembly = new THREE.Group();
    needleAssembly.position.y = 0.26;
    const needleNorth = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.78, 4), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
    needleNorth.rotateX(Math.PI / 2);
    needleNorth.position.z = -0.38;
    needleAssembly.add(needleNorth);
    compassGroup.add(needleAssembly);
    sceneStateRef.current.compassNeedle = needleAssembly;

    const glassDome = new THREE.Mesh(new THREE.SphereGeometry(1.05, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.38), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transmission: 0.9, transparent: true, opacity: 0.45 }));
    glassDome.position.y = 0.22;
    compassGroup.add(glassDome);
    dioramaGroup.add(compassGroup);

    // Castle Tower & Lighthouse
    const castleGroup = new THREE.Group();
    castleGroup.position.set(-2.6, 0.2, -2.1);
    castleGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 1.8, 14), stoneFortressMaterial)).position.y = 0.9;
    const battlementPlatform = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.72, 0.18, 14), stoneFortressMaterial);
    battlementPlatform.position.y = 1.85;
    castleGroup.add(battlementPlatform);
    dioramaGroup.add(castleGroup);

    const lighthouseGroup = new THREE.Group();
    lighthouseGroup.position.set(3.6, 0.2, 1.6);
    lighthouseGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 1.7, 14), new THREE.MeshStandardMaterial({ color: 0xf8fafc }))).position.y = 0.85;
    const lhRoof = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.24, 12), chromeMaterial);
    lhRoof.position.y = 2.08;
    lighthouseGroup.add(lhRoof);

    const lhLight = new THREE.SpotLight(0xffedd5, 5.0, 14, Math.PI / 6, 0.3, 1.2);
    lhLight.position.set(0, 1.85, 0);
    lhLight.target.position.set(5, 0, 0);
    lighthouseGroup.add(lhLight, lhLight.target);
    sceneStateRef.current.lighthouseBeam = lhLight;
    dioramaGroup.add(lighthouseGroup);

    // Waypoint Markers
    const waypointMarkers: { group: THREE.Group; data: WaypointData; pulseRing: THREE.Mesh }[] = [];
    const ringGeo = new THREE.RingGeometry(0.18, 0.32, 24);
    ringGeo.rotateX(-Math.PI / 2);

    WAYPOINTS.forEach((wp) => {
      const pinGroup = new THREE.Group();
      pinGroup.position.set(wp.position[0], wp.position[1], wp.position[2]);
      pinGroup.userData = { waypointData: wp };
      pinGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.015, 0.55, 8), goldBrassMaterial)).position.y = 0.28;
      pinGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 1.5 }))).position.y = 0.58;
      
      const pulseRing = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.7, side: THREE.DoubleSide }));
      pulseRing.position.y = 0.02;
      pinGroup.add(pulseRing);

      dioramaGroup.add(pinGroup);
      waypointMarkers.push({ group: pinGroup, data: wp, pulseRing });
    });
    sceneStateRef.current.waypointMarkers = waypointMarkers;

    sceneStateRef.current.explodedParts = [
      { object: suitcaseMesh, originalY: 1.2, targetOffset: 0.8 },
      { object: tentMesh, originalY: 1.18, targetOffset: 0.6 },
      { object: needleAssembly, originalY: 0.26, targetOffset: 0.7 },
      { object: glassDome, originalY: 0.22, targetOffset: 0.9 },
      { object: battlementPlatform, originalY: 1.85, targetOffset: 0.5 },
      { object: lhRoof, originalY: 2.08, targetOffset: 0.6 },
    ];

    sceneStateRef.current.scene = scene;
    sceneStateRef.current.camera = camera;
    sceneStateRef.current.renderer = renderer;
    sceneStateRef.current.controls = controls;
    sceneStateRef.current.keyLight = keyLight;
    sceneStateRef.current.hemiLight = hemiLight;

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(_mouse, camera);
      const intersects = _raycaster.intersectObjects(waypointMarkers.map((m) => m.group), true);

      if (intersects.length > 0) {
        let rootGroup: THREE.Object3D | null = intersects[0].object;
        while (rootGroup && !rootGroup.userData?.waypointData) {
          rootGroup = rootGroup.parent;
        }
        if (rootGroup && rootGroup.userData?.waypointData) {
          const wp = rootGroup.userData.waypointData as WaypointData;
          setSelectedWaypoint(wp);
          focusOnCoordinates(wp.position[0], wp.position[1], wp.position[2]);
        }
      }
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    let frameId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      if (sceneStateRef.current.waterMesh) {
        sceneStateRef.current.waterMesh.rotation.y = elapsedTime * 0.18;
      }
      if (sceneStateRef.current.compassNeedle) {
        sceneStateRef.current.compassNeedle.rotation.y = Math.sin(elapsedTime * 1.8) * 0.12;
      }
      if (sceneStateRef.current.lighthouseBeam) {
        const angle = elapsedTime * 1.2;
        sceneStateRef.current.lighthouseBeam.target.position.set(3.6 + Math.cos(angle) * 7, 0.5, 1.6 + Math.sin(angle) * 7);
      }
      if (sceneStateRef.current.starField) {
        sceneStateRef.current.starField.rotation.y = elapsedTime * 0.015;
      }
      if (sceneStateRef.current.cloudGroup) {
        sceneStateRef.current.cloudGroup.rotation.y = elapsedTime * 0.025;
      }

      waypointMarkers.forEach((marker, idx) => {
        const offset = idx * 0.7;
        const scale = 1.0 + Math.sin(elapsedTime * 3 + offset) * 0.28;
        marker.pulseRing.scale.set(scale, scale, scale);
        marker.group.position.y = marker.data.position[1] + Math.sin(elapsedTime * 2.5 + offset) * 0.09;
      });

      if (sceneStateRef.current.isTransitioningCamera) {
        const targetCam = sceneStateRef.current.targetCameraPos;
        const targetLook = sceneStateRef.current.targetLookAt;
        camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCam.x, 4.0, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCam.y, 4.0, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCam.z, 4.0, delta);
        controls.target.x = THREE.MathUtils.damp(controls.target.x, targetLook.x, 4.0, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, targetLook.y, 4.0, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, targetLook.z, 4.0, delta);
        if (camera.position.distanceTo(targetCam) < 0.08) {
          sceneStateRef.current.isTransitioningCamera = false;
        }
      }

      sceneStateRef.current.explodedParts.forEach((part) => {
        const targetY = isExploded ? part.originalY + part.targetOffset : part.originalY;
        part.object.position.y = THREE.MathUtils.damp(part.object.position.y, targetY, 6.0, delta);
      });

      if (autoRotate && !sceneStateRef.current.isTransitioningCamera) {
        dioramaGroup.rotation.y += delta * 0.25;
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    }

    tick();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 580;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      controls.dispose();
      renderer.dispose();
    };
  }, [isExploded]);

  // Update DOF & Bloom visibility dynamically on state toggle
  useEffect(() => {
    if (sceneStateRef.current.dofLensBlurLayer) {
      sceneStateRef.current.dofLensBlurLayer.visible = enableDepthOfField;
    }
    if (sceneStateRef.current.bloomGlowMesh) {
      sceneStateRef.current.bloomGlowMesh.visible = enableAmbientBloom;
    }
  }, [enableDepthOfField, enableAmbientBloom]);

  const focusOnCoordinates = (x: number, y: number, z: number, dist = 5.0) => {
    const s = sceneStateRef.current;
    if (!s.camera || !s.controls) return;
    s.targetLookAt.set(x, y + 0.3, z);
    s.targetCameraPos.set(x + dist * 0.7, y + 3.0, z + dist * 0.7);
    s.isTransitioningCamera = true;
    setAutoRotate(false);
  };

  const handleCameraPreset = (preset: 'overview' | 'vehicle' | 'compass' | 'fortress') => {
    setActiveCameraView(preset);
    const s = sceneStateRef.current;
    if (!s.camera || !s.controls) return;

    if (preset === 'overview') {
      s.targetLookAt.set(0, 0.5, 0);
      s.targetCameraPos.set(8.5, 6.5, 10.0);
      s.isTransitioningCamera = true;
    } else if (preset === 'vehicle') {
      focusOnCoordinates(-0.7, 0.6, 0.9, 3.6);
    } else if (preset === 'compass') {
      focusOnCoordinates(1.6, 0.5, -1.8, 3.4);
    } else if (preset === 'fortress') {
      focusOnCoordinates(-2.6, 1.3, -2.1, 4.0);
    }
  };

  const handleLightingChange = (preset: 'noon' | 'golden' | 'twilight') => {
    setLightingPreset(preset);
    const s = sceneStateRef.current;
    if (!s.scene || !s.keyLight || !s.hemiLight) return;

    if (preset === 'noon') {
      s.scene.background = new THREE.Color(0x0a1128);
      s.keyLight.color.setHex(0xfffbeb);
      s.keyLight.intensity = 3.2;
      s.hemiLight.color.setHex(0xdbeafe);
      s.hemiLight.groundColor.setHex(0x1e1b4b);
      s.hemiLight.intensity = 1.4;
    } else if (preset === 'golden') {
      s.scene.background = new THREE.Color(0x27130a);
      s.keyLight.color.setHex(0xfb923c);
      s.keyLight.intensity = 4.0;
      s.hemiLight.color.setHex(0xfed7aa);
      s.hemiLight.groundColor.setHex(0x451a03);
      s.hemiLight.intensity = 1.2;
    } else if (preset === 'twilight') {
      s.scene.background = new THREE.Color(0x020617);
      s.keyLight.color.setHex(0x38bdf8);
      s.keyLight.intensity = 1.5;
      s.hemiLight.color.setHex(0x1e1b4b);
      s.hemiLight.groundColor.setHex(0x020617);
      s.hemiLight.intensity = 0.9;
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-700/90 bg-slate-950 shadow-2xl">
      
      <div 
        ref={mountRef} 
        className="w-full h-[580px] sm:h-[660px] cursor-grab active:cursor-grabbing bg-slate-950" 
      />

      <div className="absolute top-4 left-4 right-4 pointer-events-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-3 text-white pointer-events-auto shadow-xl backdrop-blur-md max-w-md">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>3D Diorama with DOF & Bloom Effects</span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full border border-amber-400/30">
              Interactive
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Toggle Depth-of-Field and Ambient Bloom below for studio-grade realism.
          </p>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => handleCameraPreset('overview')}
            className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 rounded-xl shadow-lg transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
            title="Reset Camera"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {selectedWaypoint && (
        <div className="absolute top-20 right-4 max-w-xs sm:max-w-sm w-full bg-slate-900/95 border border-slate-700/90 rounded-2xl p-4 text-white shadow-2xl pointer-events-auto animate-fade-in backdrop-blur-md">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{selectedWaypoint.subtitle}</span>
              </div>
              <h4 className="text-base font-extrabold text-white leading-tight mt-0.5">
                {selectedWaypoint.name}
              </h4>
            </div>
            <button
              onClick={() => setSelectedWaypoint(null)}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-md text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {selectedWaypoint.description}
          </p>

          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs mb-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Tour Advisory: </span>
              {selectedWaypoint.officialTip}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                if (onSelectCategory) onSelectCategory(selectedWaypoint.category);
                if (onFilterSearch) onFilterSearch(selectedWaypoint.searchKeyword);
              }}
              className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <span>View Related FAQs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Ergonomic Collapsible Bottom Dock with Post-Processing Toggles */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[94%] max-w-[960px] pointer-events-auto transition-transform duration-300">
        
        <div className="flex justify-center mb-1.5">
          <button
            onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
            className="px-3.5 py-1 bg-slate-900/95 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5 transition-colors cursor-pointer backdrop-blur-md"
          >
            {isControlsCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Show 3D Controls & Effects</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Hide Controls (Zen View)</span>
              </>
            )}
          </button>
        </div>

        {!isControlsCollapsed && (
          <div className="bg-slate-900/95 border border-slate-700/90 rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white backdrop-blur-md">
            
            {/* Inspect Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider mr-1 hidden lg:inline">
                Inspect:
              </span>
              <button
                onClick={() => handleCameraPreset('overview')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeCameraView === 'overview' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🌍 Tour
              </button>
              <button
                onClick={() => handleCameraPreset('vehicle')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  activeCameraView === 'vehicle' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Car className="w-3.5 h-3.5 text-amber-400" />
                <span>4x4</span>
              </button>
              <button
                onClick={() => handleCameraPreset('compass')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  activeCameraView === 'compass' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Astrolabe</span>
              </button>
              <button
                onClick={() => handleCameraPreset('fortress')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeCameraView === 'fortress' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🏰 Citadel
              </button>
            </div>

            {/* Post-Processing Effects Toggles: DOF & Bloom */}
            <div className="flex items-center gap-2 border-x border-slate-800 px-3">
              <button
                onClick={() => setEnableDepthOfField(!enableDepthOfField)}
                className={`px-2.5 py-1.5 rounded-lg font-semibold border transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  enableDepthOfField
                    ? 'bg-amber-600 border-amber-500 text-white shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title="Toggle Depth-of-Field Lens Blur"
              >
                <Eye className="w-3.5 h-3.5 text-amber-300" />
                <span>DOF</span>
              </button>

              <button
                onClick={() => setEnableAmbientBloom(!enableAmbientBloom)}
                className={`px-2.5 py-1.5 rounded-lg font-semibold border transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  enableAmbientBloom
                    ? 'bg-amber-600 border-amber-500 text-white shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title="Toggle Ambient Bloom Glow"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Bloom</span>
              </button>
            </div>

            {/* Lighting & Kinematic controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleLightingChange(lightingPreset === 'noon' ? 'golden' : lightingPreset === 'golden' ? 'twilight' : 'noon')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                title="Cycle Lighting Preset"
              >
                {lightingPreset === 'noon' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
                {lightingPreset === 'golden' && <Sunset className="w-3.5 h-3.5 text-orange-400" />}
                {lightingPreset === 'twilight' && <Moon className="w-3.5 h-3.5 text-sky-400" />}
                <span className="capitalize">{lightingPreset}</span>
              </button>

              <button
                onClick={() => setIsExploded(!isExploded)}
                className={`px-2.5 py-1.5 rounded-lg font-semibold border transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  isExploded ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>{isExploded ? 'Assemble' : 'Explode'}</span>
              </button>

              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  autoRotate ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title="Toggle Auto-Rotate"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
