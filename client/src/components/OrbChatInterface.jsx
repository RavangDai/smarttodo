/* eslint-disable react/no-unknown-property */
import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Text, Float, Sparkles, Environment, Html } from '@react-three/drei';
import { Vector3 } from 'three';
import AmbientOrb from './AmbientOrb';
import SanskritRing from './SanskritRing';
import BudgetChart from './BudgetChart';
import SchedulerWidget from './SchedulerWidget';
import axios from 'axios';
import { FaPaperPlane } from 'react-icons/fa';
import './ChatPanel.css';

// Component for floating text that fades out
const FloatingMessage = ({ content, position, role, isLatest }) => {
    const [opacity, setOpacity] = useState(0);
    const textRef = useRef();

    useFrame((state, delta) => {
        if (isLatest) {
            // Fade in
            if (opacity < 1) setOpacity(o => Math.min(o + delta * 2, 1));
        } else {
            // Fade out/dissolve
            if (opacity > 0) setOpacity(o => Math.max(o - delta * 0.5, 0));
        }
    });

    if (opacity <= 0.01 && !isLatest) return null;

    return (
        <Float speed={isLatest ? 1 : 0.5} rotationIntensity={0.1} floatIntensity={0.2}>
            <Text
                ref={textRef}
                position={position}
                fontSize={role === 'user' ? 0.25 : 0.3}
                letterSpacing={0.05}
                color={role === 'user' ? '#a0a0a0' : '#ffffff'}
                maxWidth={5}
                textAlign="center"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.01}
                outlineColor="#000000"
                fillOpacity={opacity}
                outlineOpacity={opacity}
            >
                {content}
            </Text>
        </Float>
    );
};

// Parallax Camera Rig
const Rig = () => {
    const { camera, mouse } = useThree();
    const vec = new Vector3();

    useFrame(() => {
        // Smoothly interpolate camera position based on mouse coordinates
        // Mouse x-y are between -1 and 1
        camera.position.lerp(vec.set(mouse.x * 2, mouse.y * 2, 8), 0.05);
        camera.lookAt(0, 0, 0);
    });
    return null;
};

const OrbChatInterface = ({ tasks, user, onClose }) => {
    const [messages, setMessages] = useState([
        { id: 1, role: 'ai', content: `Hello ${user?.name || 'Chief'}! I'm online.` }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [orbState, setOrbState] = useState('idle');

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = { id: Date.now(), role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setOrbState('processing');

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const res = await axios.post('/api/ai/chat', {
                message: userMsg.content,
                history: history,
                tasks: tasks,
                userContext: { currentTime: new Date().toLocaleTimeString() }
            }, { headers: { 'x-auth-token': localStorage.getItem('token') } });

            let aiContent = res.data.reply;
            let msgType = 'text';
            let msgData = null;

            // Try parsing as JSON for Generative UI
            try {
                // Heuristic: if it looks like JSON and has "type"
                if (aiContent.trim().startsWith('{') && aiContent.includes('"type"')) {
                    const parsed = JSON.parse(aiContent);
                    if (parsed.type && parsed.data) {
                        msgType = parsed.type;
                        msgData = parsed.data;
                        aiContent = parsed.content || 'Here is what you asked for.';
                    }
                }
            } catch (e) {
                // Not JSON, treat as text
            }

            const aiMsg = {
                id: Date.now() + 1,
                role: 'ai',
                content: aiContent,
                type: msgType,
                data: msgData
            };

            setMessages(prev => [...prev, aiMsg]);
            setOrbState('idle');
        } catch (err) {
            console.error(err);
            const errorMsg = { id: Date.now() + 1, role: 'ai', content: "Connection interrupted." };
            setMessages(prev => [...prev, errorMsg]);
            setOrbState('error');
            setTimeout(() => setOrbState('idle'), 3000);
        }
    };

    // We only show the last 2 messages effectively in 3D to key it clean
    // The previous history is "dissolved"
    const relevantMessages = messages.slice(-2);

    return (
        <div className="orb-chat-container" style={{ width: '100%', height: '100%', position: 'relative', background: '#050505', borderRadius: '16px', overflow: 'hidden' }}>
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <color attach="background" args={['#050505']} />

                {/* HDRI for Chrome Reflections */}
                <Environment preset="city" />

                <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />

                <AmbientOrb state={orbState} />
                <SanskritRing />
                <Sparkles count={50} scale={4} size={2} speed={0.4} opacity={0.5} />

                <Suspense fallback={null}>
                    {relevantMessages.map((msg, index) => {
                        const isLast = index === relevantMessages.length - 1;
                        const isUser = msg.role === 'user';

                        let pos = [0, 0, 0];
                        if (isUser) pos = [0, -2.5, 2];
                        else pos = [0, 2.8, 0];

                        if (!isLast) {
                            pos = isUser ? [0, -3.5, -2] : [0, 4, -2];
                        }

                        // Generative UI Handling
                        if (msg.type === 'budget') {
                            return (
                                <Html key={msg.id} position={pos} transform>
                                    <div style={{ width: '500px' }}>
                                        <BudgetChart data={msg.data} />
                                    </div>
                                </Html>
                            );
                        }

                        if (msg.type === 'schedule') {
                            return (
                                <Html key={msg.id} position={pos} transform>
                                    <SchedulerWidget
                                        data={msg.data}
                                        onSchedule={(val) => console.log('Scheduled:', val)}
                                    />
                                </Html>
                            );
                        }

                        return (
                            <FloatingMessage
                                key={msg.id}
                                content={msg.content}
                                position={pos}
                                role={msg.role}
                                isLatest={isLast}
                            />
                        );
                    })}
                </Suspense>

                <Rig />
            </Canvas>

            {/* UI Overlay */}
            <div className="orb-ui-overlay" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                <form className="chat-input-area" onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: '30px', padding: '5px 15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask the Orb..."
                        className="chat-input"
                        style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '10px', outline: 'none' }}
                    />
                    <button type="submit" className="chat-send-btn" disabled={!inputValue.trim()} style={{ background: 'transparent', border: 'none', color: inputValue.trim() ? '#00BFFF' : '#555', cursor: 'pointer', fontSize: '1.2rem', display: 'flex' }}>
                        <FaPaperPlane />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OrbChatInterface;
