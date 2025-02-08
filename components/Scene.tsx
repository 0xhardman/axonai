"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, Stats } from "@react-three/drei";
import { MinecraftVillager } from "./MinecraftVillager";
import { useRef, useState, useEffect, Suspense } from "react";
import * as THREE from "three";
import dynamic from 'next/dynamic';

function CameraSetup() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, -10);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

// Create a dynamic version of the Scene that only loads on the client
const SceneContent = () => {
  const [cameraInfo, setCameraInfo] = useState({
    position: [0, 0, -10],
    rotation: [0, 0, 0]
  });
  const controlsRef = useRef(null);

  return (
    <div className="flex">
      <div className="relative w-[500px] h-[500px]">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border rounded-full bg-gray-400"></div>
        <div className="w-[500px] h-[500px]">
          <Canvas style={{ width: "500px", height: "500px" }}>
            <Suspense fallback={null}>
              <CameraSetup />
              <OrbitControls
                ref={controlsRef}
                enableZoom={false}
              />
              <ambientLight intensity={0.7} />
              <directionalLight
                intensity={2}
                position={[3, 3, 3]}
                castShadow
              />
              <directionalLight
                intensity={1.5}
                position={[-3, -3, -3]}
              />
              <MinecraftVillager />
              <ContactShadows
                opacity={0.8}
                scale={10}
                blur={2}
                far={10}
                resolution={256}
                color="#000000"
              />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </div>
  );
};

// Export a dynamic component that only renders on client side
export const Scene = dynamic(() => Promise.resolve(SceneContent), {
  ssr: false,
  loading: () => (
    <div className="flex">
      <div className="relative w-[500px] h-[500px] flex items-center justify-center">
        <div className="text-gray-500">Loading 3D Scene...</div>
      </div>
    </div>
  )
});
