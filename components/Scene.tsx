"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, Stats } from "@react-three/drei";
import { MinecraftVillager } from "./MinecraftVillager";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

function CameraSetup() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, -10);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

export function Scene() {
  const [cameraInfo, setCameraInfo] = useState({
    position: [0, 0, -10],
    rotation: [0, 0, 0]
  });
  const controlsRef = useRef();

  return (
    <div className="flex">
      <div className="relative w-[500px] h-[500px]">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border rounded-full bg-gray-400"></div>
        <div className="w-[500px] h-[500px]">
          <Canvas style={{ width: "500px", height: "500px" }}>
            <CameraSetup />
            <OrbitControls
              ref={controlsRef}

            // enableZoom={true}
            // enablePan={true}
            // enableRotate={true}
            // target={[0, 0, 0]}
            // onChange={(e) => {
            //   const camera = e.target.object;
            //   setCameraInfo({
            //     position: [
            //       Number(camera.position.x.toFixed(2)),
            //       Number(camera.position.y.toFixed(2)),
            //       Number(camera.position.z.toFixed(2))
            //     ],
            //     rotation: [
            //       Number(camera.rotation.x.toFixed(2)),
            //       Number(camera.rotation.y.toFixed(2)),
            //       Number(camera.rotation.z.toFixed(2))
            //     ]
            //   });
            // }}
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
            {/* <Stats /> */}
          </Canvas>
        </div>
      </div>
      {/* <div className="absolute top-0 left-0 bg-black/50 text-white p-2 rounded m-2 font-mono text-xs">
        <div>Position: [{cameraInfo.position.join(', ')}]</div>
        <div>Rotation: [{cameraInfo.rotation.join(', ')}]</div>
      </div> */}
    </div>
  );
}
