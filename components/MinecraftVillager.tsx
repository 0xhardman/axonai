import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";

export function MinecraftVillager() {
  const gltf = useGLTF("/assets/minecraft_villager/scene.gltf");
  const groupRef = useRef<THREE.Group>(null!);
  const modelRef = useRef<THREE.Mesh>(null!);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.set(0, Math.PI, 0);
      groupRef.current.position.set(0, 3, 0);  // 向上移动2个单位
    }
  }, []);

  return (
    <group ref={groupRef} scale={0.25}>
      <mesh ref={modelRef}>
        <primitive object={gltf.scene} />
      </mesh>
    </group>
  );
}
