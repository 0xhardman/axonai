import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useRef } from "react";

export function MinecraftVillager() {
  const gltf = useGLTF("/assets/minecraft_villager/scene.gltf");
  const groupRef = useRef<THREE.Group>(null!);

  return (
    <group
      ref={groupRef}
      position={[0, 3, 0]}     // [x, y, z] 
      rotation={[0, Math.PI, 0]}  // [x, y, z] ，
      scale={0.3}             // 
    >
      <primitive object={gltf.scene} />
    </group>
  );
}
