/* eslint-disable react/no-unknown-property */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

const SanskritRing = () => {
    const groupRef = useRef();

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Slow rotation
            groupRef.current.rotation.y += delta * 0.1;
            groupRef.current.rotation.z += delta * 0.02;
        }
    });

    return (
        <group ref={groupRef} rotation={[Math.PI / 4, 0, 0]}>
            <Text
                position={[3.5, 0, 0]}
                fontSize={0.4}
                color="#00FFFF" // Cyan Neon
                anchorX="center"
                anchorY="middle"
                fillOpacity={0.9}
            >
                कार्य
            </Text>
            <Text
                position={[-1.75, 0, 3]} // Approx 120deg on circle
                fontSize={0.4}
                color="#00FFFF"
                anchorX="center"
                anchorY="middle"
                fillOpacity={0.9}
                rotation={[0, Math.PI * 0.66, 0]}
            >
                सिद्धि
            </Text>
            <Text
                position={[-1.75, 0, -3]} // Approx 240deg on circle
                fontSize={0.4}
                color="#00FFFF"
                anchorX="center"
                anchorY="middle"
                fillOpacity={0.9}
                rotation={[0, Math.PI * 1.33, 0]}
            >
                ध्यान
            </Text>
        </group>
    );
};

export default SanskritRing;
