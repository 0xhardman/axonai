import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useRef, useEffect } from "react";

export function MinecraftVillager() {
  const gltf = useGLTF("/assets/minecraft_villager/scene.gltf");
  const groupRef = useRef<THREE.Group>(null!);

  useEffect(() => {
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          // 如果是单个材质
          if (child.material instanceof THREE.Material) {
            child.material.transparent = false;
            child.material.opacity = 1;
            child.material.depthWrite = true;
          }
          // 如果是材质数组
          else if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat) {
                mat.transparent = false;
                mat.opacity = 1;
                mat.depthWrite = true;
              }
            });
          }
        }
      }
    });
  }, [gltf]);

  return (
    <group
      ref={groupRef}
      position={[0, 3, 0]}
      rotation={[0, Math.PI, 0]}
      scale={0.25}
    >
      <primitive object={gltf.scene} />
    </group>
  );
}
