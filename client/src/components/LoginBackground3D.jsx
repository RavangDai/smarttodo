import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

// Simple Sri Yantra inspired geometry (Interlocking Triangles)
const SriYantra = () => {
    const groupRef = useRef();

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.z -= delta * 0.05;
        }
    });

    const Triangle = ({ rotation, scale, color }) => (
        <lineLoop rotation={[0, 0, rotation]} scale={scale}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={4} // 3 points + 1 to close loop
                    array={new Float32Array([
                        0, 1, 0,
                        -0.866, -0.5, 0,
                        0.866, -0.5, 0,
                        0, 1, 0
                    ])}
                    itemSize={3}
                />
            </bufferGeometry>
            <lineBasicMaterial color={color} transparent opacity={0.3} />
        </lineLoop>
    );

    return (
        <group ref={groupRef} position={[0, 0, -5]}>
            {/* Downward Triangles (Shakti) */}
            <Triangle rotation={0} scale={3} color="#FF6B35" />
            <Triangle rotation={0} scale={2.5} color="#FF9F1C" />
            <Triangle rotation={0} scale={2} color="#FF6B35" />
            <Triangle rotation={0} scale={1.5} color="#FF9F1C" />

            {/* Upward Triangles (Shiva) */}
            <Triangle rotation={Math.PI} scale={2.8} color="#FF9F1C" />
            <Triangle rotation={Math.PI} scale={2.3} color="#FF6B35" />
            <Triangle rotation={Math.PI} scale={1.8} color="#FF9F1C" />
            <Triangle rotation={Math.PI} scale={1.3} color="#FF6B35" />

            {/* Center Point (Bindu) */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={1} />
            </mesh>
        </group>
    );
};

const LoginBackground3D = () => {
    return (
        <div className="absolute inset-0 z-[1] opacity-80 pointer-events-none overflow-hidden">
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} color="#FF6B35" intensity={1} />
                <pointLight position={[-10, -10, -10]} color="#FF9F1C" intensity={0.5} />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <SriYantra />

                <Sparkles count={50} scale={10} size={6} speed={0.4} opacity={0.8} color="#FF9F1C" />

                <fog attach="fog" args={['#050505', 5, 20]} />
            </Canvas>
        </div>
    );
};

export default LoginBackground3D;
