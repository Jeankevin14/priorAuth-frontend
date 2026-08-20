import { useRef } from 'react';
import { ContactShadows, Float, RoundedBox, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const paperColor = '#fbfcfc';
const paperEdge = '#d7e1e4';
const inkColor = '#27485a';
const mutedInk = '#8ba0aa';
const accentColor = '#4b9b95';

function DocumentPage({ position, rotation, front = false }) {
  return <group position={position} rotation={rotation}><RoundedBox args={[1.55, 2.05, 0.075]} radius={0.045} smoothness={3} castShadow receiveShadow><meshStandardMaterial color={front ? paperColor : '#eef3f4'} roughness={0.78}/></RoundedBox>{front && <><mesh position={[-0.48, 0.72, 0.055]}><planeGeometry args={[0.34, 0.055]}/><meshBasicMaterial color={accentColor}/></mesh><Text position={[-0.48, 0.55, 0.06]} anchorX="left" anchorY="middle" fontSize={0.095} color={inkColor} characters="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ·"><meshBasicMaterial color={inkColor}/></Text><Text position={[-0.48, 0.41, 0.06]} anchorX="left" anchorY="middle" fontSize={0.055} color={mutedInk} maxWidth={0.8}><meshBasicMaterial color={mutedInk}/></Text><Text position={[-0.48, 0.31, 0.06]} anchorX="left" anchorY="middle" fontSize={0.055} color={mutedInk} maxWidth={0.8}><meshBasicMaterial color={mutedInk}/></Text><mesh position={[-0.35, -0.22, 0.06]}><planeGeometry args={[0.6, 0.035]}/><meshBasicMaterial color="#cbd8dc"/></mesh><mesh position={[-0.35, -0.34, 0.06]}><planeGeometry args={[0.6, 0.035]}/><meshBasicMaterial color="#d6e1e4"/></mesh><mesh position={[-0.35, -0.46, 0.06]}><planeGeometry args={[0.6, 0.035]}/><meshBasicMaterial color="#d6e1e4"/></mesh><group position={[0.38, -0.54, 0.08]}><mesh rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.25, 0.25, 0.025]}/><meshStandardMaterial color={accentColor} roughness={0.65}/></mesh><mesh position={[0, 0, 0.02]}><boxGeometry args={[0.13, 0.035, 0.03]}/><meshStandardMaterial color={paperColor}/></mesh><mesh position={[0, 0, 0.02]}><boxGeometry args={[0.035, 0.13, 0.03]}/><meshStandardMaterial color={paperColor}/></mesh></group></>}</group>;
}

function PolicyDocument() {
  const groupRef = useRef();
  useFrame((state, delta) => {
    const targetX = state.pointer.y * 0.08;
    const targetY = state.pointer.x * 0.12;
    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetX, 4, delta);
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetY, 4, delta);
  });

  return <Float speed={0.8} rotationIntensity={0.03} floatIntensity={0.08}><group ref={groupRef} rotation={[0.04, -0.12, -0.04]}><DocumentPage position={[-0.11, 0.08, -0.16]} rotation={[0, 0, -0.04]}/><DocumentPage position={[-0.05, 0.04, -0.08]} rotation={[0, 0, -0.02]}/><DocumentPage position={[0, 0, 0]} rotation={[0, 0, 0]} front/></group></Float>;
}

function PolicyLabels() {
  return <div style={{position:'absolute', inset:0, pointerEvents:'none', fontSize:11, color:'var(--muted)'}}><span style={{position:'absolute', top:'17%', left:'5%'}}>Policy Verified</span><span style={{position:'absolute', top:'42%', right:'4%'}}>Coverage Rules</span><span style={{position:'absolute', bottom:'15%', left:'7%'}}>Evidence Retrieved</span></div>;
}

export default function PolicyDocument3D() {
  return <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:16, alignItems:'center'}}><div style={{position:'relative', minHeight:240, height:'min(29vw, 270px)', minWidth:0}}><Canvas dpr={[1, 1.5]} camera={{position:[0, 0, 4.4], fov:35}} shadows><color attach="background" args={['#f4f8fa']}/><ambientLight intensity={0.7}/><directionalLight position={[3, 4, 5]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]}/><directionalLight position={[-3, 1, 2]} intensity={0.25} color="#d8eef0"/><PolicyDocument/><ContactShadows position={[0, -1.12, 0]} opacity={0.2} scale={2.3} blur={2.6} far={3}/></Canvas><PolicyLabels/></div><div style={{display:'grid', gap:12}}><div><small>Policy Status</small><strong style={{display:'block', color:'var(--green)', marginTop:3}}>Active</strong></div><div><small>Evidence Retrieved</small><strong style={{display:'block', color:'var(--ink)', marginTop:3}}>12</strong></div><div><small>Coverage Match</small><strong style={{display:'block', color:'var(--ink)', marginTop:3}}>94%</strong></div><div style={{display:'flex', flexWrap:'wrap', gap:6, marginTop:3}}><span className="badge green">Policy Coverage</span><span className="badge blue">Evidence</span><span className="badge amber">Medical Necessity</span></div></div></div>;
}