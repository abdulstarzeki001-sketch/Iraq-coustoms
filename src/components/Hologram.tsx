import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { Group } from 'three';

function Core(){
 const ref=useRef<Group>(null);
 useFrame((state,dt)=>{
  if(ref.current){
   ref.current.rotation.y+=Math.min(dt,.04)*.13;
   ref.current.rotation.z=Math.sin(state.clock.elapsedTime*.35)*.11;
  }
 });
 const stars=useMemo(()=>{
  const data=new Float32Array(210*3);
  for(let i=0;i<210;i++){
   const angle=i*2.3999632,r=2.2+((i*37)%100)/115;
   data[i*3]=Math.cos(angle)*r;
   data[i*3+1]=Math.sin(angle)*r;
   data[i*3+2]=(((i*53)%100)/100-.5)*3;
  }
  return data;
 },[]);
 return <group ref={ref}>
  <mesh rotation={[.42,.25,.18]}>
   <torusGeometry args={[1.36,.012,8,160]}/>
   <meshBasicMaterial color="#66e6da" transparent opacity={.76}/>
  </mesh>
  <mesh rotation={[1.13,.2,.62]}>
   <torusGeometry args={[1.08,.016,8,128]}/>
   <meshBasicMaterial color="#dcb981" transparent opacity={.7}/>
  </mesh>
  <mesh rotation={[.14,.25,.15]}>
   <icosahedronGeometry args={[.86,1]}/>
   <meshBasicMaterial color="#58cbd9" wireframe transparent opacity={.65}/>
  </mesh>
  <mesh scale={.72}>
   <icosahedronGeometry args={[.87,1]}/>
   <meshStandardMaterial color="#09203a" emissive="#124c5d" emissiveIntensity={.4}
    metalness={.6} roughness={.2} transparent opacity={.85}/>
  </mesh>
  <points>
   <bufferGeometry><bufferAttribute attach="attributes-position" args={[stars,3]}/></bufferGeometry>
   <pointsMaterial size={.024} color="#89dddf" transparent opacity={.57} sizeAttenuation/>
  </points>
 </group>;
}
export default function Hologram(){
 return <div className="hologram" aria-hidden="true">
  <Canvas camera={{position:[0,0,5.5],fov:43}} dpr={[1,1.5]}
   gl={{alpha:true,antialias:false,powerPreference:'low-power'}} frameloop="always">
   <ambientLight intensity={1.1}/>
   <pointLight position={[4,3,3]} intensity={24} color="#53e7da"/>
   <Core/>
  </Canvas>
 </div>;
}
