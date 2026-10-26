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
  Info
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
    position: [2.5, 0.4, 1.8],
    description: 'White pebble beaches and crystal Ionian sea. Best reached with Vodafone or ONE eSIM pre-activated at Tirana airport.',
    officialTip: 'Rent beach umbrellas in Lek (ALL) for better rates than Euro. Cards accepted at beach clubs.',
  },
  {
    id: 'berat-citadel',
    name: 'Historic Citadel & Castle',
    subtitle: 'UNESCO Heritage & Etiquette',
    category: 'customs-etiquette',
    searchKeyword: 'Mosque',
    position: [-2.2, 1.3, -1.8],
    description: 'The city of a thousand windows with preserved stone castles, historic mosques, and Orthodox Byzantine churches.',
    officialTip: 'Modest dress required for places of worship. Shoes removed at mosque entrances; head coverings provided.',
  },
  {
    id: 'theth-alps',
    name: 'Theth & Accursed Mountains',
    subtitle: 'Private 4x4 Driver & High Passes',
    category: 'transit-transport',
    searchKeyword: 'Driver',
    position: [-1.8, 1.8, 2.2],
    description: 'Dramatic limestone peaks of the Albanian Alps with switchback roads requiring high-clearance 4x4 vehicles and experienced local drivers.',
    officialTip: 'Your private tour driver handles mountain terrain and Llogara pass switchbacks with zero deposit hassle.',
  },
  {
    id: 'tirana-hub',
    name: 'Tirana Central Hub',
    subtitle: 'Currency Exchange & ATMs',
    category: 'currency-budget',
    searchKeyword: 'Lek',
    position: [0.2, 0.7, -0.6],
    description: 'Bustling capital with currency exchange bureaus offering near-interbank rates without airport commission markups.',
    officialTip: 'Always withdraw in Albanian Lek (ALL) and reject dynamic currency conversion at Credins or BKT ATMs.',
  },
  {
    id: 'sos-concierge',
    name: 'Emergency & Maritime Coast',
    subtitle: '24/7 Concierge Hotline 112',
    category: 'safety-emergency',
    searchKeyword: 'Emergency',
    position: [1.2, 0.5, 3.1],
    description: 'Coastal patrol and direct 24/7 tour operator concierge hotline covering land and sea excursions across Albania.',
    officialTip: 'Universal emergency line 112 connects directly in English/Italian. Tour operations team is on call 24/7.',
  },
];

// Pre-allocate reusable math helpers outside render loop
const _vec3 = new THREE.Vector3();
const _targetPos = new THREE.Vector3();
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

  // Scene mutable refs for animation and camera
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
    explodedParts: [],
    targetCameraPos: new THREE.Vector3(7, 6, 8),
    targetLookAt: new THREE.Vector3(0, 0.5, 0),
    isTransitioningCamera: false,
  });

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Deep slate-900 night/sea tone
    scene.fog = new THREE.FogExp2(0x0f172a, 0.038);

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 80);
    camera.position.set(7.5, 5.8, 8.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    // Studio Environment map (procedural via RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera clipping below ground
    controls.minDistance = 3.5;
    controls.maxDistance = 18;
    controls.target.set(0, 0.5, 0);

    // Lighting rig
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 1.2);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.8);
    keyLight.position.set(8, 12, 6);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 28;
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    fillLight.position.set(-6, 5, -5);
    scene.add(fillLight);

    // Procedural Textures (HTML5 Canvas)
    const createCompassTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      
      // Dial background
      const grad = ctx.createRadialGradient(256, 256, 10, 256, 256, 250);
      grad.addColorStop(0, '#fffbf0');
      grad.addColorStop(0.75, '#fef3c7');
      grad.addColorStop(1, '#d97706');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Outer rings
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(256, 256, 235, 0, Math.PI * 2);
      ctx.stroke();

      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(256, 256, 215, 0, Math.PI * 2);
      ctx.stroke();

      // Degree tick marks
      for (let i = 0; i < 360; i += 5) {
        const rad = (i * Math.PI) / 180;
        const isMajor = i % 30 === 0;
        const isMed = i % 15 === 0;
        const innerR = isMajor ? 190 : isMed ? 200 : 208;
        const x1 = 256 + Math.cos(rad) * innerR;
        const y1 = 256 + Math.sin(rad) * innerR;
        const x2 = 256 + Math.cos(rad) * 215;
        const y2 = 256 + Math.sin(rad) * 215;

        ctx.strokeStyle = isMajor ? '#78350f' : '#b45309';
        ctx.lineWidth = isMajor ? 3 : 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Compass Rose Cardinal letters
      ctx.fillStyle = '#991b1b';
      ctx.font = 'bold 36px "DM Sans", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('N', 256, 75);

      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 30px "DM Sans", serif';
      ctx.fillText('S', 256, 437);
      ctx.fillText('E', 437, 256);
      ctx.fillText('W', 75, 256);

      // Voyage insignia in center
      ctx.fillStyle = '#92400e';
      ctx.font = 'italic 18px "DM Sans", sans-serif';
      ctx.fillText('VOYAGE · ALBANIA', 256, 230);
      ctx.font = '12px "DM Sans", sans-serif';
      ctx.fillText('TOUR EXPEDITION', 256, 280);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return texture;
    };

    const createLuggageDecalTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;

      // Leather suitcase texture
      ctx.fillStyle = '#92400e';
      ctx.fillRect(0, 0, 256, 256);

      // Travel stickers
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(80, 80, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TIRANA', 80, 84);

      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(170, 160, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText('SARANDË', 170, 164);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    // Shared PBR Materials
    const terrainMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569, // Limestone rock
      roughness: 0.9,
      metalness: 0.05,
      flatShading: true,
    });

    const grassMaterial = new THREE.MeshStandardMaterial({
      color: 0x335c3d, // Mediterranean olive greens
      roughness: 0.85,
      metalness: 0.0,
      flatShading: true,
    });

    const sandMaterial = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.95,
      metalness: 0.0,
    });

    const seaMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9, // Turquoise Ionian waters
      roughness: 0.1,
      metalness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.6,
      transparent: true,
      opacity: 0.85,
      ior: 1.33,
    });

    const stoneFortressMaterial = new THREE.MeshStandardMaterial({
      color: 0xd6d3d1, // Albanian limestone castles (Berat/Rozafa)
      roughness: 0.8,
      metalness: 0.1,
      flatShading: true,
    });

    const goldBrassMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.92,
      roughness: 0.22,
    });

    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.15,
    });

    const rubberMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
      metalness: 0.05,
    });

    const safariCarMaterial = new THREE.MeshStandardMaterial({
      color: 0xb45309, // Amber tour safari vehicle
      roughness: 0.35,
      metalness: 0.4,
    });

    const glassCarMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xbae6fd,
      roughness: 0.05,
      metalness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.8,
      transparent: true,
      opacity: 0.65,
    });

    // DIORAMA ROOT GROUP
    const dioramaGroup = new THREE.Group();
    scene.add(dioramaGroup);

    // 1. DIORAMA BASE ISLAND & GEOLOGICAL STRATA
    // Floating stepped hexagon pedestal
    const islandBaseGeo = new THREE.CylinderGeometry(5.2, 4.6, 1.2, 7);
    const islandBaseMesh = new THREE.Mesh(islandBaseGeo, terrainMaterial);
    islandBaseMesh.position.y = -0.6;
    islandBaseMesh.receiveShadow = !isSoftwareGl;
    islandBaseMesh.castShadow = !isSoftwareGl;
    dioramaGroup.add(islandBaseMesh);

    // Terraced Mountain Ridge on the North-East side (Accursed Mountains / Theth)
    const mountainGroup = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const mGeo = new THREE.ConeGeometry(0.9 + Math.random() * 0.7, 1.6 + Math.random() * 1.2, 5);
      const mMesh = new THREE.Mesh(mGeo, terrainMaterial);
      const angle = (i / 6) * Math.PI * 0.9 + 2.4;
      const radius = 2.4 + (i % 2) * 0.6;
      mMesh.position.set(Math.cos(angle) * radius, 0.7 + (i % 3) * 0.3, Math.sin(angle) * radius);
      mMesh.rotation.y = i * 0.5;
      mMesh.castShadow = !isSoftwareGl;
      mMesh.receiveShadow = !isSoftwareGl;
      mountainGroup.add(mMesh);
    }
    dioramaGroup.add(mountainGroup);

    // Upper grass plateau
    const plateauGeo = new THREE.CylinderGeometry(4.7, 5.0, 0.3, 7);
    const plateauMesh = new THREE.Mesh(plateauGeo, grassMaterial);
    plateauMesh.position.y = 0.05;
    plateauMesh.receiveShadow = !isSoftwareGl;
    dioramaGroup.add(plateauMesh);

    // Coastal Beach Shelf & Sea Water (Ksamil / Sarandë Bay)
    const beachGeo = new THREE.BoxGeometry(3.6, 0.28, 2.8);
    const beachMesh = new THREE.Mesh(beachGeo, sandMaterial);
    beachMesh.position.set(2.4, 0.08, 1.8);
    beachMesh.rotation.y = 0.35;
    beachMesh.receiveShadow = !isSoftwareGl;
    dioramaGroup.add(beachMesh);

    const waterGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.18, 24);
    const waterMesh = new THREE.Mesh(waterGeo, seaMaterial);
    waterMesh.position.set(2.7, 0.12, 2.1);
    dioramaGroup.add(waterMesh);
    sceneStateRef.current.waterMesh = waterMesh;

    // Contact shadow grounding plane
    const shadowGeo = new THREE.PlaneGeometry(12, 12);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.65,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.22;
    dioramaGroup.add(shadowMesh);

    // 2. PROCEDURAL 3D SUBJECT A: VINTAGE 4X4 TOUR EXPEDITION VEHICLE (8 distinct parts)
    const carGroup = new THREE.Group();
    carGroup.position.set(-0.6, 0.2, 0.8);
    carGroup.rotation.y = -0.45;

    // A1: Chassis Body
    const carChassisGeo = new THREE.BoxGeometry(1.6, 0.5, 0.9);
    const carChassis = new THREE.Mesh(carChassisGeo, safariCarMaterial);
    carChassis.position.y = 0.42;
    carChassis.castShadow = !isSoftwareGl;
    carChassis.receiveShadow = !isSoftwareGl;
    carGroup.add(carChassis);

    // A2: Cabin & Roof with Windows
    const carCabinGeo = new THREE.BoxGeometry(0.9, 0.45, 0.84);
    const carCabin = new THREE.Mesh(carCabinGeo, safariCarMaterial);
    carCabin.position.set(-0.15, 0.8, 0);
    carCabin.castShadow = !isSoftwareGl;
    carGroup.add(carCabin);

    // A3: Windshield & Windows
    const carWindowGeo = new THREE.BoxGeometry(0.86, 0.36, 0.86);
    const carWindow = new THREE.Mesh(carWindowGeo, glassCarMaterial);
    carWindow.position.set(-0.15, 0.8, 0);
    carGroup.add(carWindow);

    // A4: Heavy Duty Bull Bar Front
    const bumperGeo = new THREE.BoxGeometry(0.12, 0.22, 0.88);
    const bumperMesh = new THREE.Mesh(bumperGeo, chromeMaterial);
    bumperMesh.position.set(0.85, 0.32, 0);
    carGroup.add(bumperMesh);

    // A5: Roof Expedition Luggage Rack
    const rackGeo = new THREE.BoxGeometry(0.85, 0.08, 0.78);
    const rackMesh = new THREE.Mesh(rackGeo, chromeMaterial);
    rackMesh.position.set(-0.15, 1.06, 0);
    carGroup.add(rackMesh);

    // A6: Packed Suitcase Trunk on Roof
    const luggageDecalTex = createLuggageDecalTexture();
    const suitcaseMat = new THREE.MeshStandardMaterial({
      map: luggageDecalTex,
      roughness: 0.6,
      metalness: 0.1,
    });
    const suitcaseGeo = new THREE.BoxGeometry(0.45, 0.22, 0.38);
    const suitcaseMesh = new THREE.Mesh(suitcaseGeo, suitcaseMat);
    suitcaseMesh.position.set(-0.25, 1.2, 0.12);
    suitcaseMesh.rotation.y = 0.12;
    suitcaseMesh.castShadow = !isSoftwareGl;
    carGroup.add(suitcaseMesh);

    // A7: Rolled Expedition Canvas Tent
    const tentGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.45, 12);
    const tentMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.9 });
    const tentMesh = new THREE.Mesh(tentGeo, tentMat);
    tentMesh.rotation.z = Math.PI / 2;
    tentMesh.position.set(-0.1, 1.18, -0.2);
    carGroup.add(tentMesh);

    // A8: 4 All-Terrain Wheels with Silver Alloy Hubs
    const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.16, 16);
    wheelGeo.rotateX(Math.PI / 2);
    const rimGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.18, 12);
    rimGeo.rotateX(Math.PI / 2);

    const wheelPositions = [
      [0.55, 0.24, 0.46],
      [0.55, 0.24, -0.46],
      [-0.55, 0.24, 0.46],
      [-0.55, 0.24, -0.46],
    ];
    wheelPositions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeo, rubberMaterial);
      wheel.position.set(pos[0], pos[1], pos[2]);
      wheel.castShadow = !isSoftwareGl;
      const rim = new THREE.Mesh(rimGeo, chromeMaterial);
      wheel.add(rim);
      carGroup.add(wheel);
    });

    // A9: Glowing Headlights
    const headlightGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.06, 12);
    headlightGeo.rotateZ(Math.PI / 2);
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xffedd5,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.5,
    });
    const hlLeft = new THREE.Mesh(headlightGeo, headlightMat);
    hlLeft.position.set(0.82, 0.44, 0.28);
    const hlRight = hlLeft.clone();
    hlRight.position.set(0.82, 0.44, -0.28);
    carGroup.add(hlLeft, hlRight);

    dioramaGroup.add(carGroup);
    sceneStateRef.current.carGroup = carGroup;

    // 3. PROCEDURAL 3D SUBJECT B: VINTAGE TRAVEL COMPASS & ASTROLABE (7 distinct parts)
    const compassGroup = new THREE.Group();
    compassGroup.position.set(1.4, 0.35, -1.6);
    compassGroup.scale.set(0.9, 0.9, 0.9);

    // B1: Brass Beveled Outer Bowl (LatheGeometry)
    const points: THREE.Vector2[] = [];
    points.push(new THREE.Vector2(0, 0));
    points.push(new THREE.Vector2(1.1, 0));
    points.push(new THREE.Vector2(1.2, 0.15));
    points.push(new THREE.Vector2(1.18, 0.35));
    points.push(new THREE.Vector2(1.08, 0.4));
    points.push(new THREE.Vector2(0.98, 0.2));
    const compassBowlGeo = new THREE.LatheGeometry(points, 32);
    const compassBowl = new THREE.Mesh(compassBowlGeo, goldBrassMaterial);
    compassBowl.castShadow = !isSoftwareGl;
    compassGroup.add(compassBowl);

    // B2: Dial Face with Compass Rose
    const compassTexture = createCompassTexture();
    const dialGeo = new THREE.CircleGeometry(0.96, 32);
    const dialMat = new THREE.MeshStandardMaterial({
      map: compassTexture,
      roughness: 0.35,
      metalness: 0.15,
    });
    const dialMesh = new THREE.Mesh(dialGeo, dialMat);
    dialMesh.rotation.x = -Math.PI / 2;
    dialMesh.position.y = 0.21;
    compassGroup.add(dialMesh);

    // B3: Rotating Magnetic Needle Assembly
    const needleAssembly = new THREE.Group();
    needleAssembly.position.y = 0.26;

    // North Needle (Ruby Red Pointer)
    const needleNorthGeo = new THREE.ConeGeometry(0.14, 0.78, 4);
    needleNorthGeo.rotateX(Math.PI / 2);
    const needleNorthMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.3,
      metalness: 0.6,
    });
    const needleNorth = new THREE.Mesh(needleNorthGeo, needleNorthMat);
    needleNorth.position.z = -0.38;
    needleAssembly.add(needleNorth);

    // South Needle (Silver Pointer)
    const needleSouthGeo = new THREE.ConeGeometry(0.14, 0.78, 4);
    needleSouthGeo.rotateX(-Math.PI / 2);
    const needleSouth = new THREE.Mesh(needleSouthGeo, chromeMaterial);
    needleSouth.position.z = 0.38;
    needleAssembly.add(needleSouth);

    // Needle Central Pivot Cap
    const pivotCapGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const pivotCap = new THREE.Mesh(pivotCapGeo, goldBrassMaterial);
    needleAssembly.add(pivotCap);

    compassGroup.add(needleAssembly);
    sceneStateRef.current.compassNeedle = needleAssembly;

    // B4: Glass Dome Cover
    const glassDomeGeo = new THREE.SphereGeometry(1.05, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.38);
    const glassDomeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.05,
      metalness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.9,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const glassDome = new THREE.Mesh(glassDomeGeo, glassDomeMat);
    glassDome.position.y = 0.22;
    compassGroup.add(glassDome);

    // B5: Brass Crown and Lanyard Loop
    const crownGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.25, 12);
    const crown = new THREE.Mesh(crownGeo, goldBrassMaterial);
    crown.position.set(0, 0.25, -1.25);
    crown.rotation.x = Math.PI / 2;
    const loopGeo = new THREE.TorusGeometry(0.2, 0.04, 12, 24);
    const loop = new THREE.Mesh(loopGeo, goldBrassMaterial);
    loop.position.set(0, 0.25, -1.45);
    loop.rotation.x = Math.PI / 2;
    compassGroup.add(crown, loop);

    dioramaGroup.add(compassGroup);

    // 4. PROCEDURAL 3D SUBJECT C: ALBANIAN HISTORIC CASTLE TOWER (Rozafa / Berat Citadel)
    const castleGroup = new THREE.Group();
    castleGroup.position.set(-2.4, 0.2, -1.9);

    // Tower Main Stone Drum
    const towerGeo = new THREE.CylinderGeometry(0.65, 0.8, 1.8, 14);
    const towerMesh = new THREE.Mesh(towerGeo, stoneFortressMaterial);
    towerMesh.position.y = 0.9;
    towerMesh.castShadow = !isSoftwareGl;
    towerMesh.receiveShadow = !isSoftwareGl;
    castleGroup.add(towerMesh);

    // Battlements & Crenellations Ring
    const battlementPlatformGeo = new THREE.CylinderGeometry(0.78, 0.72, 0.18, 14);
    const battlementPlatform = new THREE.Mesh(battlementPlatformGeo, stoneFortressMaterial);
    battlementPlatform.position.y = 1.85;
    castleGroup.add(battlementPlatform);

    // 6 Crenellation teeth
    for (let i = 0; i < 6; i++) {
      const toothGeo = new THREE.BoxGeometry(0.16, 0.22, 0.16);
      const tooth = new THREE.Mesh(toothGeo, stoneFortressMaterial);
      const angle = (i / 6) * Math.PI * 2;
      tooth.position.set(Math.cos(angle) * 0.7, 1.98, Math.sin(angle) * 0.7);
      tooth.castShadow = !isSoftwareGl;
      castleGroup.add(tooth);
    }

    // Albanian Tour Red Flag on Staff
    const staffGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.9, 8);
    const staff = new THREE.Mesh(staffGeo, chromeMaterial);
    staff.position.set(0, 2.35, 0);
    const flagGeo = new THREE.BoxGeometry(0.35, 0.22, 0.02);
    const flagMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Red Albanian emblem flag
      roughness: 0.6,
      metalness: 0.1,
    });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(0.18, 2.65, 0);
    castleGroup.add(staff, flag);

    dioramaGroup.add(castleGroup);

    // 5. PROCEDURAL 3D SUBJECT D: COASTAL LIGHTHOUSE WITH ROTATING BEACON (Ksamil / Vlorë)
    const lighthouseGroup = new THREE.Group();
    lighthouseGroup.position.set(3.4, 0.2, 1.4);

    // Lighthouse Conical Shaft
    const lhBaseGeo = new THREE.CylinderGeometry(0.3, 0.45, 1.7, 14);
    const lhMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.5,
    });
    const lhBase = new THREE.Mesh(lhBaseGeo, lhMat);
    lhBase.position.y = 0.85;
    lhBase.castShadow = !isSoftwareGl;
    lighthouseGroup.add(lhBase);

    // Red striped band
    const bandGeo = new THREE.CylinderGeometry(0.36, 0.39, 0.35, 14);
    const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
    const redBand = new THREE.Mesh(bandGeo, redMat);
    redBand.position.y = 0.88;
    lighthouseGroup.add(redBand);

    // Lantern room & dome
    const lanternGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.32, 12);
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.0,
      roughness: 0.2,
    });
    const lanternMesh = new THREE.Mesh(lanternGeo, lanternMat);
    lanternMesh.position.y = 1.82;
    lighthouseGroup.add(lanternMesh);

    const lhRoofGeo = new THREE.ConeGeometry(0.32, 0.24, 12);
    const lhRoof = new THREE.Mesh(lhRoofGeo, chromeMaterial);
    lhRoof.position.y = 2.08;
    lighthouseGroup.add(lhRoof);

    // Rotating SpotLight Beam
    const lhLight = new THREE.SpotLight(0xffedd5, 4.0, 12, Math.PI / 6, 0.3, 1.2);
    lhLight.position.set(0, 1.85, 0);
    lhLight.target.position.set(4, 0, 0);
    lighthouseGroup.add(lhLight);
    lighthouseGroup.add(lhLight.target);
    sceneStateRef.current.lighthouseBeam = lhLight;

    dioramaGroup.add(lighthouseGroup);

    // 6. PROCEDURAL TREES (Mediterranean Pines and Cypress cones)
    const treeGroup = new THREE.Group();
    const treePositions = [
      [-1.2, 0.1, -1.0],
      [-0.8, 0.1, -1.8],
      [0.6, 0.1, 1.4],
      [1.6, 0.1, 0.5],
      [-2.8, 0.1, 0.2],
      [-1.9, 0.1, 1.5],
    ];
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8, flatShading: true });

    treePositions.forEach((pos, idx) => {
      const singleTree = new THREE.Group();
      const heightScale = 0.8 + (idx % 3) * 0.25;
      
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.4 * heightScale, 8), trunkMat);
      trunk.position.y = 0.2 * heightScale;
      trunk.castShadow = !isSoftwareGl;
      singleTree.add(trunk);

      // Layered pine cones
      for (let c = 0; c < 3; c++) {
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry((0.45 - c * 0.1) * heightScale, (0.5 - c * 0.08) * heightScale, 7),
          foliageMat
        );
        cone.position.y = (0.4 + c * 0.28) * heightScale;
        cone.castShadow = !isSoftwareGl;
        singleTree.add(cone);
      }
      singleTree.position.set(pos[0], pos[1], pos[2]);
      treeGroup.add(singleTree);
    });
    dioramaGroup.add(treeGroup);

    // 7. INTERACTIVE 3D WAYPOINT MARKER PINS (5 locations)
    const waypointMarkers: { group: THREE.Group; data: WaypointData; pulseRing: THREE.Mesh }[] = [];
    const pinStemGeo = new THREE.CylinderGeometry(0.04, 0.015, 0.55, 8);
    const pinHeadGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const ringGeo = new THREE.RingGeometry(0.18, 0.32, 24);
    ringGeo.rotateX(-Math.PI / 2);

    WAYPOINTS.forEach((wp) => {
      const pinGroup = new THREE.Group();
      pinGroup.position.set(wp.position[0], wp.position[1], wp.position[2]);
      pinGroup.userData = { waypointData: wp };

      // Pin stem
      const stem = new THREE.Mesh(pinStemGeo, goldBrassMaterial);
      stem.position.y = 0.28;
      pinGroup.add(stem);

      // Gem Head with Amber/Red glow
      const headMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 1.2,
        roughness: 0.15,
        metalness: 0.4,
      });
      const head = new THREE.Mesh(pinHeadGeo, headMat);
      head.position.y = 0.58;
      pinGroup.add(head);

      // Ground pulsing ripple ring
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
      });
      const pulseRing = new THREE.Mesh(ringGeo, ringMat);
      pulseRing.position.y = 0.02;
      pinGroup.add(pulseRing);

      dioramaGroup.add(pinGroup);
      waypointMarkers.push({ group: pinGroup, data: wp, pulseRing });
    });
    sceneStateRef.current.waypointMarkers = waypointMarkers;

    // Track parts for exploded view
    sceneStateRef.current.explodedParts = [
      { object: suitcaseMesh, originalY: 1.2, targetOffset: 0.8 },
      { object: tentMesh, originalY: 1.18, targetOffset: 0.6 },
      { object: needleAssembly, originalY: 0.26, targetOffset: 0.7 },
      { object: glassDome, originalY: 0.22, targetOffset: 0.9 },
      { object: battlementPlatform, originalY: 1.85, targetOffset: 0.5 },
      { object: lhRoof, originalY: 2.08, targetOffset: 0.6 },
    ];

    // Save refs
    sceneStateRef.current.scene = scene;
    sceneStateRef.current.camera = camera;
    sceneStateRef.current.renderer = renderer;
    sceneStateRef.current.controls = controls;
    sceneStateRef.current.keyLight = keyLight;
    sceneStateRef.current.hemiLight = hemiLight;

    // Raycasting for interactive clicks
    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      _raycaster.setFromCamera(_mouse, camera);
      const markerMeshes = waypointMarkers.map((m) => m.group);
      const intersects = _raycaster.intersectObjects(markerMeshes, true);

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

    // Continuous Animation & Pacing Loop
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

      // Gentle water ripple
      if (sceneStateRef.current.waterMesh) {
        sceneStateRef.current.waterMesh.rotation.y = elapsedTime * 0.15;
      }

      // Compass magnetic needle wobble (dynamic simulation)
      if (sceneStateRef.current.compassNeedle) {
        sceneStateRef.current.compassNeedle.rotation.y = Math.sin(elapsedTime * 1.8) * 0.12;
      }

      // Rotating lighthouse beam
      if (sceneStateRef.current.lighthouseBeam) {
        const angle = elapsedTime * 1.2;
        sceneStateRef.current.lighthouseBeam.target.position.set(
          3.4 + Math.cos(angle) * 6,
          0.5,
          1.4 + Math.sin(angle) * 6
        );
      }

      // Waypoint pulse animations
      waypointMarkers.forEach((marker, idx) => {
        const offset = idx * 0.7;
        const scale = 1.0 + Math.sin(elapsedTime * 3 + offset) * 0.25;
        marker.pulseRing.scale.set(scale, scale, scale);
        // Float pin head gently
        marker.group.position.y = marker.data.position[1] + Math.sin(elapsedTime * 2.5 + offset) * 0.08;
      });

      // Smooth camera transition using exponential damping
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

      // Exploded view transition
      sceneStateRef.current.explodedParts.forEach((part) => {
        const targetY = isExploded ? part.originalY + part.targetOffset : part.originalY;
        part.object.position.y = THREE.MathUtils.damp(part.object.position.y, targetY, 6.0, delta);
      });

      // Auto-rotation when not inspecting
      if (autoRotate && !sceneStateRef.current.isTransitioningCamera) {
        dioramaGroup.rotation.y += delta * 0.22;
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    }

    tick();

    // Window Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      controls.dispose();
      renderer.dispose();
    };
  }, [isExploded]);

  // Camera focus transitions
  const focusOnCoordinates = (x: number, y: number, z: number, dist = 4.8) => {
    const s = sceneStateRef.current;
    if (!s.camera || !s.controls) return;
    s.targetLookAt.set(x, y + 0.3, z);
    s.targetCameraPos.set(x + dist * 0.7, y + 2.8, z + dist * 0.7);
    s.isTransitioningCamera = true;
    setAutoRotate(false);
  };

  const handleCameraPreset = (preset: 'overview' | 'vehicle' | 'compass' | 'fortress') => {
    setActiveCameraView(preset);
    const s = sceneStateRef.current;
    if (!s.camera || !s.controls) return;

    if (preset === 'overview') {
      s.targetLookAt.set(0, 0.5, 0);
      s.targetCameraPos.set(7.5, 5.8, 8.5);
      s.isTransitioningCamera = true;
    } else if (preset === 'vehicle') {
      focusOnCoordinates(-0.6, 0.6, 0.8, 3.4);
    } else if (preset === 'compass') {
      focusOnCoordinates(1.4, 0.5, -1.6, 3.2);
    } else if (preset === 'fortress') {
      focusOnCoordinates(-2.4, 1.2, -1.9, 3.8);
    }
  };

  // Lighting shift handler
  const handleLightingChange = (preset: 'noon' | 'golden' | 'twilight') => {
    setLightingPreset(preset);
    const s = sceneStateRef.current;
    if (!s.scene || !s.keyLight || !s.hemiLight) return;

    if (preset === 'noon') {
      s.scene.background = new THREE.Color(0x0f172a);
      s.keyLight.color.setHex(0xfffbeb);
      s.keyLight.intensity = 2.8;
      s.hemiLight.color.setHex(0xe0f2fe);
      s.hemiLight.groundColor.setHex(0x1e293b);
      s.hemiLight.intensity = 1.2;
    } else if (preset === 'golden') {
      s.scene.background = new THREE.Color(0x27130a);
      s.keyLight.color.setHex(0xfb923c); // Warm amber sunset
      s.keyLight.intensity = 3.6;
      s.hemiLight.color.setHex(0xfed7aa);
      s.hemiLight.groundColor.setHex(0x451a03);
      s.hemiLight.intensity = 1.0;
    } else if (preset === 'twilight') {
      s.scene.background = new THREE.Color(0x030712); // Deep midnight blue
      s.keyLight.color.setHex(0x38bdf8); // Moonlight
      s.keyLight.intensity = 1.2;
      s.hemiLight.color.setHex(0x1e1b4b);
      s.hemiLight.groundColor.setHex(0x020617);
      s.hemiLight.intensity = 0.8;
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl">
      
      {/* 3D WebGL Canvas Mount Container (Zero React HUD children inside canvas ref) */}
      <div 
        ref={mountRef} 
        className="w-full h-[540px] sm:h-[620px] cursor-grab active:cursor-grabbing bg-slate-950" 
      />

      {/* Top Banner Overlay: Title & Interactive Hint */}
      <div className="absolute top-4 left-4 right-4 pointer-events-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white pointer-events-auto shadow-lg backdrop-blur-none max-w-md">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Interactive 3D Albania Tour Diorama</span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full border border-amber-400/30">
              Live WebGL
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Drag to rotate, pinch/scroll to zoom. Click on 3D pins to inspect tour regions & jump directly to verified FAQs.
          </p>
        </div>

        {/* Quick Reset / Full Diorama View */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => handleCameraPreset('overview')}
            className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 rounded-lg shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset Camera to Overview"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* Selected Waypoint Spotlight Flyout Card */}
      {selectedWaypoint && (
        <div className="absolute top-20 right-4 max-w-xs sm:max-w-sm w-full bg-slate-900/95 border border-slate-700/90 rounded-2xl p-4 text-white shadow-2xl pointer-events-auto animate-fade-in">
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

      {/* SECTION 5 MANDATORY ERGONOMIC UI: Collapsible Bottom Dock (Zero Viewport Occlusion) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[94%] max-w-[920px] pointer-events-auto transition-transform duration-300">
        
        {/* Dock Collapse Toggle Button */}
        <div className="flex justify-center mb-1.5">
          <button
            onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
            className="px-3.5 py-1 bg-slate-900/95 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isControlsCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Show 3D Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Hide Controls (Zen View)</span>
              </>
            )}
          </button>
        </div>

        {/* Collapsible Dock Container */}
        {!isControlsCollapsed && (
          <div className="bg-slate-900/95 border border-slate-700/90 rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white">
            
            {/* Group 1: Camera Focus Points */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider mr-1 hidden sm:inline">
                Inspect:
              </span>
              <button
                onClick={() => handleCameraPreset('overview')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  activeCameraView === 'overview'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🌍 Whole Tour
              </button>
              <button
                onClick={() => handleCameraPreset('vehicle')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  activeCameraView === 'vehicle'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Car className="w-3.5 h-3.5 text-amber-400" />
                <span>4x4 Tour Rig</span>
              </button>
              <button
                onClick={() => handleCameraPreset('compass')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  activeCameraView === 'compass'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Astrolabe</span>
              </button>
              <button
                onClick={() => handleCameraPreset('fortress')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  activeCameraView === 'fortress'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🏰 Citadel
              </button>
            </div>

            {/* Group 2: Lighting & Sun Atmosphere */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider mr-1 hidden sm:inline">
                Lighting:
              </span>
              <button
                onClick={() => handleLightingChange('noon')}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  lightingPreset === 'noon'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title="Mediterranean Noon"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleLightingChange('golden')}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  lightingPreset === 'golden'
                    ? 'bg-orange-500/20 border-orange-400 text-orange-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title="Golden Hour Sunset"
              >
                <Sunset className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleLightingChange('twilight')}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  lightingPreset === 'twilight'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title="Blue Hour Twilight"
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>

            {/* Group 3: Kinematic Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExploded(!isExploded)}
                className={`px-3 py-1.5 rounded-lg font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isExploded
                    ? 'bg-amber-600 border-amber-500 text-white shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
                title="Disassemble luggage, compass needle, and tower roofs"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>{isExploded ? 'Assemble' : 'Explode View'}</span>
              </button>

              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  autoRotate
                    ? 'bg-amber-600 border-amber-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title={autoRotate ? 'Pause Orbit' : 'Resume Auto-Rotate'}
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
