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

function AnatomicalModel({ onMetrics }) {
  const { scene } = useGLTF('/models/body.glb', true, false, loader => loader.setDecoderPath('/draco/'));
  useEffect(() => {
    const bounds = new THREE.Box3().setFromObject(scene);
    onMetrics({ min: bounds.min.clone(), max: bounds.max.clone(), size: bounds.getSize(new THREE.Vector3()) });
  }, [onMetrics, scene]);
  return <primitive object={scene}/>;
}

function ProceduralModel() {
  const material = { color: '#b8c9ce', roughness: 0.7 };
  return <group><mesh position={[0, 1.72, 0]}><meshStandardMaterial {...material}/><sphereGeometry args={[0.17, 18, 14]}/></mesh><mesh position={[0, 1.28, 0]}><meshStandardMaterial {...material}/><capsuleGeometry args={[0.28, 0.62, 8, 16]}/></mesh><mesh position={[0, 0.66, 0]}><meshStandardMaterial {...material}/><capsuleGeometry args={[0.2, 0.58, 8, 16]}/></mesh><mesh position={[-0.22, 0.9, 0]} rotation={[0, 0, -0.18]}><meshStandardMaterial {...material}/><capsuleGeometry args={[0.08, 0.72, 8, 12]}/></mesh><mesh position={[0.22, 0.9, 0]} rotation={[0, 0, 0.18]}><meshStandardMaterial {...material}/><capsuleGeometry args={[0.08, 0.72, 8, 12]}/></mesh><mesh position={[-0.12, 0.14, 0]}><meshStandardMaterial {...material}/><capsuleGeometry args={[0.1, 0.78, 8, 12]}/></mesh><mesh position={[0.12, 0.14, 0]}><meshStandardMaterial {...material}/><capsuleGeometry args={[0.1, 0.78, 8, 12]}/></mesh></group>;
}

const defaultMetrics = { min: new THREE.Vector3(-0.93133, -0.10735, -0.30843), size: new THREE.Vector3(1.87894, 2.04999, 0.505) };

function getHotspotPosition(metrics, organ) {
  if (!metrics) return [0, 1.2, 0.22];
  const { min, size } = metrics;
  const point = (x, y, z = 1) => [min.x + size.x * x, min.y + size.y * y, min.z + size.z * z + 0.035];
  const positions = { BRAIN: [0.5, 0.88], HEART: [0.5, 0.7], LUNGS: [0.5, 0.74], LIVER: [0.56, 0.58], KIDNEYS: [0.5, 0.48], STOMACH: [0.48, 0.56], SPINE: [0.5, 0.55, 0.15], KNEE: [0.44, 0.18], SHOULDER: [0.35, 0.71] };
  return point(...(positions[organ] || [0.5, 0.55]));
}

function getVolumeScale(organ) {
  if (organ === 'KNEE' || organ === 'SHOULDER') return [0.2, 0.16, 0.18];
  if (organ === 'HEART' || organ === 'LIVER' || organ === 'STOMACH') return [0.3, 0.22, 0.16];
  if (organ === 'LUNGS') return [0.42, 0.28, 0.16];
  if (organ === 'BRAIN') return [0.22, 0.18, 0.18];
  if (organ === 'SPINE') return [0.16, 0.4, 0.14];
  return [0.24, 0.22, 0.16];
}

function AnatomyVolume({ organ, position, color }) {
  return <mesh position={position} scale={getVolumeScale(organ)}><sphereGeometry args={[1, 24, 18]}/><meshBasicMaterial color={color} transparent opacity={0.22} depthWrite={false}/></mesh>;
}

export default function AnatomyViewer({ diagnosis, icdCode, procedure, bodySite, specialty, anatomyTarget, status }) {
  const controlsRef = useRef();
  const [autoRotate, setAutoRotate] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const mapped = mapDiagnosisToAnatomy({ diagnosis, icdCode, procedure, bodySite, specialty, anatomyTarget });
  const statusText = String(status || '').toLowerCase();
  const hotspotColor = statusText.includes('review') || statusText.includes('critical') || statusText.includes('urgent') ? '#b84a4a' : '#2e70ad';
  const hotspotPosition = getHotspotPosition(metrics || defaultMetrics, mapped.organ);
  const resetCamera = () => controlsRef.current?.reset();

  return <div className="card"><div className="section-title"><div><p className="eyebrow">ANATOMY CONTEXT</p><h3>{mapped.displayName}</h3></div><span className="badge blue">View only</span></div><div style={{height:260, background:'#f4f8fa', borderRadius:8, overflow:'hidden'}}><Canvas gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }} camera={{position:[0, 0.95, 3.2], fov:45}}><color attach="background" args={['#f4f8fa']}/><ambientLight intensity={0.5}/><directionalLight position={[3, 4, 5]} intensity={1} castShadow/><directionalLight position={[-4, 2, -3]} intensity={0.35} color="#bcdcff"/><Environment preset="studio" intensity={0.3}/><Suspense fallback={null}><group><ModelErrorBoundary key={mapped.organ} fallback={<ProceduralModel/>}><AnatomicalModel onMetrics={setMetrics}/></ModelErrorBoundary><AnatomyVolume organ={mapped.organ} position={hotspotPosition} color={hotspotColor}/></group><ContactShadows position={[0, -0.1, 0]} opacity={0.2} scale={2.4} blur={2.5} far={3}/></Suspense><OrbitControls ref={controlsRef} enableRotate enableZoom enablePan autoRotate={autoRotate} autoRotateSpeed={1.2}/></Canvas></div><div style={{display:'flex', alignItems:'center', gap:8, marginTop:10}}><button className="button compact" type="button" onClick={() => setAutoRotate(value => !value)}>{autoRotate ? 'Stop auto-rotate' : 'Auto-rotate'}</button><button className="button compact" type="button" onClick={resetCamera}>Reset camera</button></div><p className="login-notice">Visualization based on submitted clinical information.</p></div>;
}

useGLTF.preload('/models/body.glb');
