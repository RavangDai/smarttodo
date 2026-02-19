import { useState, useEffect, useRef } from 'react';
import './InteractiveAvatar.css';

const InteractiveAvatar = ({ mode = 'idle' }) => {
    const [isBlinking, setIsBlinking] = useState(false);

    // Refs for state to avoid re-renders
    const mousePosRef = useRef({ x: 0, y: 0 });
    const requestRef = useRef();

    // Position tracking
    const targetEyePos = useRef({ x: 0, y: 0 });
    const currentEyePos = useRef({ x: 0, y: 0 });
    const targetHeadRot = useRef({ x: 0, y: 0 });
    const currentHeadRot = useRef({ x: 0, y: 0 });

    // DOM Refs
    const containerRef = useRef(null);
    const headRef = useRef(null);
    const eyeLeftRef = useRef(null);
    const eyeRightRef = useRef(null);
    const armLeftRef = useRef(null);
    const armRightRef = useRef(null);

    // Track Mouse
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const avatarCenterX = rect.left + rect.width / 2;
            const avatarCenterY = rect.top + rect.height / 2;

            const dx = e.clientX - avatarCenterX;
            const dy = e.clientY - avatarCenterY;

            // Increase sensitivity slightly by dividing by a smaller value than full window
            // Make the movement feel more lively
            const maxDistX = Math.min(window.innerWidth / 2, 800);
            const maxDistY = Math.min(window.innerHeight / 2, 600);

            let x = dx / maxDistX;
            let y = dy / maxDistY;

            // Soft clamp to keep it feeling natural without a hard stop
            x = Math.max(-1.5, Math.min(1.5, x));
            y = Math.max(-1.5, Math.min(1.5, y));

            mousePosRef.current = { x, y };
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Animation Loop for Smoothing
    useEffect(() => {
        const animate = () => {
            // Determine Target Positions based on Mode
            if (mode === 'email') {
                targetEyePos.current = { x: 0, y: 12 };
                targetHeadRot.current = { x: 15, y: 0 };
            } else if (mode === 'password') {
                targetEyePos.current = { x: 0, y: 0 };
                targetHeadRot.current = { x: -5, y: 0 };
            } else {
                // More dynamic range mapping
                targetEyePos.current = {
                    x: mousePosRef.current.x * 14,
                    y: mousePosRef.current.y * 10
                };
                targetHeadRot.current = {
                    x: mousePosRef.current.y * 12,
                    y: mousePosRef.current.x * 20
                };
            }

            // Smooth Interpolation (Lerp)
            // Faster lerp for eyes (they dart quickly)
            currentEyePos.current.x += (targetEyePos.current.x - currentEyePos.current.x) * 0.25;
            currentEyePos.current.y += (targetEyePos.current.y - currentEyePos.current.y) * 0.25;

            // Slower lerp for head (it has mass)
            currentHeadRot.current.x += (targetHeadRot.current.x - currentHeadRot.current.x) * 0.1;
            currentHeadRot.current.y += (targetHeadRot.current.y - currentHeadRot.current.y) * 0.1;

            // Apply direct DOM updates
            if (headRef.current) {
                headRef.current.style.transform = `rotateX(${-currentHeadRot.current.x}deg) rotateY(${currentHeadRot.current.y}deg)`;
            }
            if (eyeLeftRef.current) {
                eyeLeftRef.current.style.transform = `translate(${currentEyePos.current.x}px, ${currentEyePos.current.y}px)`;
            }
            if (eyeRightRef.current) {
                eyeRightRef.current.style.transform = `translate(${currentEyePos.current.x}px, ${currentEyePos.current.y}px)`;
            }
            if (armLeftRef.current) {
                armLeftRef.current.style.transform = `translateY(${currentHeadRot.current.y * 0.5}px) rotate(${10 + currentHeadRot.current.y * 0.2}deg)`;
            }
            if (armRightRef.current) {
                armRightRef.current.style.transform = `translateY(${-currentHeadRot.current.y * 0.5}px) rotate(${-10 + currentHeadRot.current.y * 0.2}deg)`;
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [mode]);

    // Random Blinking
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            if (mode !== 'password') {
                setIsBlinking(true);
                setTimeout(() => setIsBlinking(false), 150);
            }
        }, 4000 + Math.random() * 2000);
        return () => clearInterval(blinkInterval);
    }, [mode]);

    return (
        <div ref={containerRef} className="interactive-avatar perspective-[1000px]">
            <div
                ref={headRef}
                className="robot-root"
                style={{
                    transform: `rotateX(0deg) rotateY(0deg)` // Initial state
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
                                    ref={eyeLeftRef}
                                    className={`robot-eye left ${isBlinking ? 'scale-y-[0.1]' : ''}`}
                                ></div>
                                <div
                                    ref={eyeRightRef}
                                    className={`robot-eye right ${isBlinking ? 'scale-y-[0.1]' : ''}`}
                                ></div>
                            </>
                        )}
                    </div>
                </div>

                {/* Arms with slight parallax or sway */}
                <div
                    ref={armLeftRef}
                    className="robot-arm left absolute"
                ></div>
                <div
                    ref={armRightRef}
                    className="robot-arm right absolute"
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
