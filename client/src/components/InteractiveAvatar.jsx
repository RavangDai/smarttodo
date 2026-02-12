import { useState, useEffect, useRef } from 'react';
import './InteractiveAvatar.css';

const InteractiveAvatar = ({ mode = 'idle' }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [eyePos, setEyePos] = useState({ x: 0, y: 0 });
    const [headRot, setHeadRot] = useState({ x: 0, y: 0 });
    const [isBlinking, setIsBlinking] = useState(false);

    // Refs for smoothing
    const requestRef = useRef();
    const targetEyePos = useRef({ x: 0, y: 0 });
    const currentEyePos = useRef({ x: 0, y: 0 });
    const targetHeadRot = useRef({ x: 0, y: 0 });
    const currentHeadRot = useRef({ x: 0, y: 0 });

    // Track Mouse
    useEffect(() => {
        const handleMouseMove = (e) => {
            // Normalize mouse position (-1 to 1) based on window center
            const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
            const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
            setMousePos({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Animation Loop for Smoothing
    useEffect(() => {
        const animate = () => {
            // Determine Target Positions based on Mode
            if (mode === 'email') {
                // Look down at input
                targetEyePos.current = { x: 0, y: 12 };
                targetHeadRot.current = { x: 15, y: 0 };
            } else if (mode === 'password') {
                // Look away / Squint (Handled via CSS class, but reset position)
                targetEyePos.current = { x: 0, y: 0 };
                targetHeadRot.current = { x: -5, y: 0 };
            } else {
                // Idle: Follow Mouse
                // Restrict eye movement range
                targetEyePos.current = { x: mousePos.x * 12, y: mousePos.y * 8 };
                // Restrict head rotation
                targetHeadRot.current = { x: mousePos.y * 10, y: mousePos.x * 15 };
            }

            // Smooth Interpolation (Lerp)
            currentEyePos.current.x += (targetEyePos.current.x - currentEyePos.current.x) * 0.1;
            currentEyePos.current.y += (targetEyePos.current.y - currentEyePos.current.y) * 0.1;

            currentHeadRot.current.x += (targetHeadRot.current.x - currentHeadRot.current.x) * 0.05;
            currentHeadRot.current.y += (targetHeadRot.current.y - currentHeadRot.current.y) * 0.05;

            setEyePos({ ...currentEyePos.current });
            setHeadRot({ ...currentHeadRot.current });

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [mode, mousePos]);

    // Random Blinking
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            if (mode !== 'password') { // Don't blink if eyes are closed/squinting for privacy
                setIsBlinking(true);
                setTimeout(() => setIsBlinking(false), 150);
            }
        }, 4000 + Math.random() * 2000); // 4-6 seconds random
        return () => clearInterval(blinkInterval);
    }, [mode]);

    return (
        <div className="interactive-avatar perspective-[1000px]">
            <div
                className="robot-root"
                style={{
                    transform: `rotateX(${-headRot.x}deg) rotateY(${headRot.y}deg)` // Invert X for natural feel
                }}
            >
                {/* Head */}
                <div className="robot-head">
                    <div className="robot-face-screen">
                        {/* Eyes */}
                        {mode === 'password' ? (
                            // Privacy Eyes (Squint line)
                            <div className="flex gap-4">
                                <div className="w-8 h-1 bg-amber-500 rounded-full shadow-[0_0_10px_orange]"></div>
                                <div className="w-8 h-1 bg-amber-500 rounded-full shadow-[0_0_10px_orange]"></div>
                            </div>
                        ) : (
                            // Normal Eyes
                            <>
                                <div
                                    className={`robot-eye left ${isBlinking ? 'scale-y-[0.1]' : ''}`}
                                    style={{ transform: `translate(${eyePos.x}px, ${eyePos.y}px)` }}
                                ></div>
                                <div
                                    className={`robot-eye right ${isBlinking ? 'scale-y-[0.1]' : ''}`}
                                    style={{ transform: `translate(${eyePos.x}px, ${eyePos.y}px)` }}
                                ></div>
                            </>
                        )}
                    </div>
                </div>

                {/* Arms with slight parallax or sway */}
                <div
                    className="robot-arm left absolute transition-transform duration-300"
                    style={{ transform: `translateY(${headRot.y * 0.5}px) rotate(${10 + headRot.y * 0.2}deg)` }}
                ></div>
                <div
                    className="robot-arm right absolute transition-transform duration-300"
                    style={{ transform: `translateY(${-headRot.y * 0.5}px) rotate(${-10 + headRot.y * 0.2}deg)` }}
                ></div>

                {/* Body */}
                <div className="robot-body">
                    <div className="robot-chest-logo">
                        <img src="/karyalogo.png" alt="K" className="w-full h-full object-contain opacity-90" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InteractiveAvatar;
