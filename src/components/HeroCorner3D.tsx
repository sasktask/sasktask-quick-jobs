import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Box } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedShapes() {
  const torusRef = useRef<THREE.Mesh>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const boxRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (torusRef.current) {
      torusRef.current.rotation.x = time * 0.3;
      torusRef.current.rotation.y = time * 0.4;
    }
    
    if (sphereRef.current) {
      sphereRef.current.rotation.y = time * 0.2;
    }
    
    if (boxRef.current) {
      boxRef.current.rotation.x = time * 0.25;
      boxRef.current.rotation.z = time * 0.15;
    }
  });

  return (
    <>
      {/* Floating Torus */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Torus ref={torusRef} args={[1, 0.3, 16, 32]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color="#0EA5E9"
            attach="material"
            distort={0.3}
            speed={2}
            metalness={0.8}
            roughness={0.2}
          />
        </Torus>
      </Float>

      {/* Floating Sphere */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5}>
        <Sphere ref={sphereRef} args={[0.6, 32, 32]} position={[-1.5, 1, 0.5]}>
          <MeshDistortMaterial
            color="#10B981"
            attach="material"
            distort={0.4}
            speed={1.5}
            metalness={0.9}
            roughness={0.1}
          />
        </Sphere>
      </Float>

      {/* Floating Box */}
      <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1.8}>
        <Box ref={boxRef} args={[0.8, 0.8, 0.8]} position={[1.5, -0.5, -0.5]}>
          <MeshDistortMaterial
            color="#8B5CF6"
            attach="material"
            distort={0.2}
            speed={2.5}
            metalness={0.7}
            roughness={0.3}
          />
        </Box>
      </Float>

      {/* Ambient Light */}
      <ambientLight intensity={0.5} />
      
      {/* Directional Lights */}
      <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#0EA5E9" />
      
      {/* Point Lights for glow effect */}
      <pointLight position={[0, 0, 2]} intensity={2} color="#10B981" />
      <pointLight position={[2, 2, 0]} intensity={1.5} color="#8B5CF6" />
    </>
  );
}

interface HeroCorner3DProps {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const HeroCorner3D = ({ position }: HeroCorner3DProps) => {
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
  };

  return (
    <div 
      className={`absolute ${positionClasses[position]} w-64 h-64 md:w-96 md:h-96 pointer-events-none opacity-70`}
      style={{ zIndex: 0 }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <AnimatedShapes />
      </Canvas>
    </div>
  );
};