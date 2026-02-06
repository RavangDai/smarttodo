/* eslint-disable react/no-unknown-property */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float } from '@react-three/drei';

const AmbientOrb = ({ state = 'idle', color }) => {
    const orbRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (orbRef.current) {
            // Very slow, heavy rotation
            orbRef.current.rotation.x = t * 0.1;
            orbRef.current.rotation.y = t * 0.15;
        }
    });

    // Liquid Metal State Logic
    // Processing = Fast "boil"
    // Idle = Slow "ooze"
    const isProcessing = state === 'processing' || state === 'speaking';

    return (
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <Sphere
                ref={orbRef}
                args={[1, 128, 128]} // High poly for smooth liquid reflection
                scale={1.6}
            >
                <MeshDistortMaterial
                    color="#ffffff"  // Pure chrome base
                    attach="material"
                    distort={isProcessing ? 0.8 : 0.3} // High distort on active
                    speed={isProcessing ? 4 : 1}     // Fast boil on active
                    roughness={0}    // Mirror 
                    metalness={1}    // Full metal
                    clearcoat={1}
                    clearcoatRoughness={0}
                    reflectivity={1}
                />
            </Sphere>
        </Float>
    );
};

export default AmbientOrb;
