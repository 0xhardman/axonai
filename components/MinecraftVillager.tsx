import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useRef } from "react";

export function MinecraftVillager() {
  const gltf = useGLTF("/assets/minecraft_villager/scene.gltf");
  const groupRef = useRef<THREE.Group>(null!);

  return (
    <group
      ref={groupRef}
      position={[0, 3, 0]}     // [x, y, z] 位置
      rotation={[0, Math.PI, 0]}  // [x, y, z] 旋转，使用弧度
      scale={0.3}             // 整体缩放
    >
      <primitive object={gltf.scene} />
    </group>
  );
}
