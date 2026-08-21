import { Suspense, Component, useEffect, useRef, useState } from 'react';
import { ContactShadows, Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { mapDiagnosisToAnatomy } from '../../utils/anatomyMapper';

class ModelErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

// Injects a radial skin-blend into a cloned material's shader: fragments near
// `hotspot.position` (within `hotspot.radius`) are smoothly tinted toward
// `hotspot.color`, blended into the base albedo before lighting so it reads
// as part of the skin rather than an overlay sitting on top of it.
// The current hotspot values are baked in as the initial uniform values (not
// left at a placeholder default) so the very first compiled frame is already
// correct — onBeforeCompile only fires once the renderer actually compiles
// the material, which happens after mount, so this closure is guaranteed to
// see up-to-date props rather than racing a separate "sync after" effect.
function attachHotspotShader(material, hotspot) {
  const cloned = material.clone();
  cloned.onBeforeCompile = shader => {
    shader.uniforms.uHotspotWorldPos = { value: new THREE.Vector3(...hotspot.position) };
    shader.uniforms.uHotspotRadius = { value: hotspot.radius };
    shader.uniforms.uHotspotColor = { value: new THREE.Color(hotspot.color) };
    shader.uniforms.uHotspotStrength = { value: 0.42 };

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vAppWorldPosition;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvAppWorldPosition = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;');

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vAppWorldPosition;\nuniform vec3 uHotspotWorldPos;\nuniform float uHotspotRadius;\nuniform vec3 uHotspotColor;\nuniform float uHotspotStrength;')
      .replace('#include <map_fragment>', '#include <map_fragment>\n{\n  float appDist = distance( vAppWorldPosition, uHotspotWorldPos );\n  float appBlend = 1.0 - smoothstep( 0.0, uHotspotRadius, appDist );\n  diffuseColor.rgb = mix( diffuseColor.rgb, uHotspotColor, appBlend * uHotspotStrength );\n}');

    cloned.userData.hotspotShader = shader;
  };
  cloned.needsUpdate = true;
  return cloned;
}

function AnatomicalModel({ onMetrics, hotspotPosition, hotspotColor, hotspotRadius }) {
  const { scene } = useGLTF('/models/body.glb', '/draco/', false);
  const shaderMaterialsRef = useRef([]);

  // Always-current hotspot values, readable from the mount-only effect below
  // without needing them in its dependency array (which must stay empty).
  const hotspotRef = useRef();
  hotspotRef.current = { position: hotspotPosition, color: hotspotColor, radius: hotspotRadius };

  useEffect(() => {
    const bounds = new THREE.Box3().setFromObject(scene);
    const size = bounds.getSize(new THREE.Vector3());
    onMetrics({ min: bounds.min.clone(), max: bounds.max.clone(), size });

    // Clone (never mutate) each distinct material once, extended with the hotspot shader.
    // The current hotspot values (via hotspotRef) are captured here for the initial compile.
    const cloneCache = new Map();
    const shaderMaterials = [];
    const withHotspotShader = original => {
      if (cloneCache.has(original)) return cloneCache.get(original);
      const cloned = attachHotspotShader(original, hotspotRef.current);
      cloneCache.set(original, cloned);
      shaderMaterials.push(cloned);
      return cloned;
    };
    scene.traverse(node => {
      if (!node.isMesh || !node.material) return;
      node.material = Array.isArray(node.material) ? node.material.map(withHotspotShader) : withHotspotShader(node.material);
    });
    shaderMaterialsRef.current = shaderMaterials;

    if (import.meta.env.DEV) {
      console.log('[AnatomyViewer] model bounds', { min: bounds.min.toArray(), max: bounds.max.toArray(), size: size.toArray() });
    }
    // Intentionally mount-only: `scene` is a stable cached GLTF resource and this setup
    // (bounds report + material cloning) must run exactly once, never re-triggered by
    // prop/reference churn — hotspotRef supplies the current values when it does run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keeps the shader in sync if the hotspot changes without a remount (e.g. status
  // updates). Safe to skip on the very first frame since attachHotspotShader already
  // seeded the correct starting values.
  useEffect(() => {
    shaderMaterialsRef.current.forEach(material => {
      const shader = material.userData.hotspotShader;
      if (!shader) return;
      shader.uniforms.uHotspotWorldPos.value.set(...hotspotPosition);
      shader.uniforms.uHotspotRadius.value = hotspotRadius;
      shader.uniforms.uHotspotColor.value.set(hotspotColor);
    });
  }, [hotspotPosition, hotspotColor, hotspotRadius]);

  return <primitive object={scene}/>;
}

function ProceduralModel() {
  const material = { color: '#b8c9ce', roughness: 0.7 };
  return <group><mesh position={[0, 1.72, 0]}><meshStandardMaterial {...material}/><sphereGeometry args={[0.17, 18, 14]}/></mesh><mesh position={[0, 1.28, 0]}><meshStandardMaterial {...material}/><capsuleGeometry args={[0.28, 0.62, 8, 16]}/></mesh><mesh position={[0, 0.66, 0]}><meshStandardMaterial {...material}/><capsuleGeometry args={[0.2, 0.58, 8, 16]}/></mesh><mesh position={[-0.22, 0.9, 0]} rotation={[0, 0, -0.18]}><meshStandardMaterial {...material}/><capsuleGeometry args={[0.08, 0.72, 8, 12]}/></mesh><mesh position={[0.22, 0.9, 0]} rotation={[0, 0, 0.18]}><meshStandardMaterial {...material}/><capsuleGeometry args={[0.08, 0.72, 8, 12]}/></mesh><mesh position={[-0.12, 0.14, 0]}><meshStandardMaterial {...material}/><capsuleGeometry args={[0.1, 0.78, 8, 12]}/></mesh><mesh position={[0.12, 0.14, 0]}><meshStandardMaterial {...material}/><capsuleGeometry args={[0.1, 0.78, 8, 12]}/></mesh></group>;
}

const defaultMetrics = { min: new THREE.Vector3(-0.93133, -0.10735, -0.30843), size: new THREE.Vector3(1.87894, 2.04999, 0.505) };

// Fractional (x, y, z) position of each region's surface hotspot within the model's
// bounding box. Unlike a simple "front face at z≈1" guess, these were measured against
// the real loaded mesh (nearest actual surface vertex to each anatomical target, sampled
// via a dense vertex scan) so the shader hotspot lands on the skin rather than floating
// in space near it. SPINE intentionally resolves to the back surface (low z), everything
// else to the front.
function getHotspotPosition(metrics, organ) {
  if (!metrics) return [0, 1.35, 0.15];
  const { min, size } = metrics;
  const point = (x, y, z) => [min.x + size.x * x, min.y + size.y * y, min.z + size.z * z];
  const positions = {
    BRAIN: [0.494, 0.933, 0.641],
    HEART: [0.479, 0.696, 0.768],
    LUNGS: [0.512, 0.725, 0.763],
    LIVER: [0.522, 0.605, 0.749],
    KIDNEYS: [0.493, 0.539, 0.746],
    STOMACH: [0.494, 0.564, 0.769],
    SPINE: [0.466, 0.553, 0.297],
    KNEE: [0.381, 0.307, 0.448],
    SHOULDER: [0.260, 0.810, 0.556]
  };
  return point(...(positions[organ] || [0.5, 0.55, 0.75]));
}

// Falloff radius per region (model units) — smaller for compact joints, larger for the chest/torso.
function getHotspotRadius(organ) {
  const radii = { KNEE: 0.14, SHOULDER: 0.16, BRAIN: 0.16, HEART: 0.22, LIVER: 0.18, KIDNEYS: 0.18, STOMACH: 0.18, SPINE: 0.22, LUNGS: 0.32 };
  return radii[organ] || 0.2;
}

export default function AnatomyViewer({ diagnosis, icdCode, procedure, bodySite, specialty, anatomyTarget, status }) {
  const controlsRef = useRef();
  const [autoRotate, setAutoRotate] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const mapped = mapDiagnosisToAnatomy({ diagnosis, icdCode, procedure, bodySite, specialty, anatomyTarget });
  const statusText = String(status || '').toLowerCase();
  // Red only for an explicit "needs review"/"critical"/"urgent" flag — NOT a bare match on
  // "review" alone, which would incorrectly fire for the routine "Pending review" status that
  // most in-progress requests have. Blue is the default for everything else.
  const hotspotColor = statusText.includes('needs review') || statusText.includes('critical') || statusText.includes('urgent') ? '#b84a4a' : '#2e70ad';
  const hotspotPosition = getHotspotPosition(metrics || defaultMetrics, mapped.organ);
  const hotspotRadius = getHotspotRadius(mapped.organ);
  const resetCamera = () => controlsRef.current?.reset();

  return <div className="card"><div className="section-title"><div><p className="eyebrow">ANATOMY CONTEXT</p><h3>{mapped.displayName}</h3></div><span className="badge blue">View only</span></div><div style={{height:260, background:'#f4f8fa', borderRadius:8, overflow:'hidden'}}><Canvas gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }} camera={{position:[0, 0.95, 3.2], fov:45}}><color attach="background" args={['#f4f8fa']}/><ambientLight intensity={0.5}/><directionalLight position={[3, 4, 5]} intensity={1} castShadow/><directionalLight position={[-4, 2, -3]} intensity={0.35} color="#bcdcff"/><Environment preset="studio" intensity={0.3}/><Suspense fallback={null}><group><ModelErrorBoundary key={mapped.organ} fallback={<ProceduralModel/>}><AnatomicalModel onMetrics={setMetrics} hotspotPosition={hotspotPosition} hotspotColor={hotspotColor} hotspotRadius={hotspotRadius}/></ModelErrorBoundary></group><ContactShadows position={[0, -0.1, 0]} opacity={0.2} scale={2.4} blur={2.5} far={3}/></Suspense><OrbitControls ref={controlsRef} enableRotate enableZoom enablePan autoRotate={autoRotate} autoRotateSpeed={1.2}/></Canvas></div><div style={{display:'flex', alignItems:'center', gap:8, marginTop:10}}><button className="button compact" type="button" onClick={() => setAutoRotate(value => !value)}>{autoRotate ? 'Stop auto-rotate' : 'Auto-rotate'}</button><button className="button compact" type="button" onClick={resetCamera}>Reset camera</button></div><p className="login-notice">Visualization based on submitted clinical information.</p></div>;
}

useGLTF.preload('/models/body.glb', '/draco/', false);
