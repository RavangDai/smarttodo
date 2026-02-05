import { useState, useEffect, useRef, useCallback } from 'react';
import './InteractiveAvatar.css';

/**
 * Interactive Avatar Component
 * Reacts to user input and cursor movement with delightful animations
 */
const InteractiveAvatar = ({
    state = 'idle', // 'idle', 'looking-away', 'peeking', 'scanning', 'active', 'celebrating', 'confused', 'success', 'watching', 'whistling'
    email = '',
    mode = 'auth' // 'auth' | 'zen'
}) => {
    const [blinkState, setBlinkState] = useState(false);
    const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
    const [isTrackingMouse, setIsTrackingMouse] = useState(true);
    const [isWelcoming, setIsWelcoming] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const avatarRef = useRef(null);

    // Initial Welcome Animation
    useEffect(() => {
        if (mode === 'auth') {
            const timer = setTimeout(() => setIsWelcoming(false), 2000);
            return () => clearTimeout(timer);
        } else {
            setIsWelcoming(false);
        }
    }, [mode]);

    // Random blink effect
    useEffect(() => {
        const blink = () => {
            setBlinkState(true);
            setTimeout(() => setBlinkState(false), 150);
        };

        const interval = setInterval(() => {
            if (Math.random() > 0.7) blink();
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // Mouse tracking for eye movement when idle
    const handleMouseMove = useCallback((e) => {
        if (!isTrackingMouse || !avatarRef.current) return;

        const avatar = avatarRef.current;
        const rect = avatar.getBoundingClientRect();
        const avatarCenterX = rect.left + rect.width / 2;
        const avatarCenterY = rect.top + rect.height / 2;

        // Calculate direction from avatar to mouse
        const deltaX = e.clientX - avatarCenterX;
        const deltaY = e.clientY - avatarCenterY;

        // Normalize and limit eye movement range
        const maxMove = 8;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const normalizedX = distance > 0 ? (deltaX / distance) * Math.min(distance / 50, 1) * maxMove : 0;
        const normalizedY = distance > 0 ? (deltaY / distance) * Math.min(distance / 50, 1) * maxMove : 0;

        // Clamp values
        const clampedX = Math.max(-maxMove, Math.min(maxMove, normalizedX));
        const clampedY = Math.max(-maxMove, Math.min(maxMove, normalizedY));

        setEyePosition({ x: clampedX, y: clampedY });
    }, [isTrackingMouse]);

    // Set up mouse tracking logic
    useEffect(() => {
        // Track mouse in zen mode OR when idle/active/welcoming in auth mode
        const shouldTrack = mode === 'zen' || ['idle', 'active', 'welcome'].includes(state);
        setIsTrackingMouse(shouldTrack);

        if (shouldTrack) {
            window.addEventListener('mousemove', handleMouseMove);
            return () => window.removeEventListener('mousemove', handleMouseMove);
        }
    }, [state, handleMouseMove, mode]);

    // Eye direction logic based on State
    useEffect(() => {
        if (mode === 'zen') return;

        if (state === 'watching' && email.length > 0) {
            // Follow typing
            const progress = Math.min(email.length / 30, 1);
            setEyePosition({ x: 6 + (progress * 2), y: 0 });
        } else if (state === 'watching') {
            setEyePosition({ x: 6, y: 0 });
        } else if (state === 'looking-away') {
            setEyePosition({ x: 15, y: -5 }); // Hard look right/up
        } else if (state === 'peeking') {
            setEyePosition({ x: 8, y: 0 }); // Sly look
        } else if (state === 'scanning') {
            setEyePosition({ x: 0, y: 0 }); // Center
        }
        // For 'idle', 'active', etc., let mouse tracking handle it or default to 0,0
    }, [state, email, mode]);

    const finalState = isWelcoming ? 'welcome' : state;

    return (
        <div
            className={`interactive-avatar ${finalState} ${isHovered ? 'hover' : ''}`}
            ref={avatarRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ cursor: mode === 'zen' ? 'pointer' : 'default' }}
        >
            {/* Avatar Container */}
            <div className="avatar-character">
                {/* Floating Coffee Cup (Zen Mode) */}
                {mode === 'zen' && (
                    <div className="avatar-coffee">☕</div>
                )}

                {/* Glow Effect */}
                <div className="avatar-glow"></div>

                {/* Head */}
                <div className="avatar-head">
                    {/* Antenna */}
                    <div className="avatar-antenna">
                        <div className="antenna-stem"></div>
                        <div className="antenna-tip"></div>
                    </div>

                    {/* Ears */}
                    <div className="avatar-ear left"></div>
                    <div className="avatar-ear right"></div>

                    {/* Face */}
                    <div className="avatar-face">
                        {/* Eyebrows */}
                        <div className="avatar-eyebrows">
                            <div className={`avatar-eyebrow left ${finalState === 'confused' || finalState === 'sad' ? 'worried' : ''}`}></div>
                            <div className={`avatar-eyebrow right ${finalState === 'confused' || finalState === 'sad' ? 'worried' : ''}`}></div>
                        </div>

                        {/* Eyes */}
                        <div className="avatar-eyes">
                            {/* Searchlight - Disable during scan/success/lookaway */}
                            {finalState !== 'scanning' && finalState !== 'success' && finalState !== 'looking-away' && (
                                <div
                                    className="avatar-searchlight"
                                    style={{
                                        transform: `rotate(${Math.atan2(eyePosition.y, eyePosition.x) * (180 / Math.PI)}deg)`,
                                        opacity: Math.sqrt(eyePosition.x * eyePosition.x + eyePosition.y * eyePosition.y) / 10
                                    }}
                                ></div>
                            )}

                            <div className={`avatar-eye left ${blinkState ? 'blink' : ''} ${finalState === 'active' || finalState === 'success' ? 'happy' : ''} ${finalState === 'confused' ? 'question' : ''}`}>
                                <div
                                    className="avatar-pupil"
                                    style={{
                                        transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`
                                    }}
                                >
                                    {/* Text symbols */}
                                    {finalState === 'confused' && '?'}
                                    {finalState === 'active' && '^'}
                                    {mode === 'zen' && '-'}
                                    <div className="pupil-highlight"></div>
                                </div>
                            </div>
                            <div className={`avatar-eye right ${blinkState ? 'blink' : ''} ${finalState === 'active' || finalState === 'success' ? 'happy' : ''} ${finalState === 'confused' ? 'question' : ''}`}>
                                <div
                                    className="avatar-pupil"
                                    style={{
                                        transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`
                                    }}
                                >
                                    {finalState === 'confused' && '?'}
                                    {finalState === 'active' && '^'}
                                    {mode === 'zen' && '-'}
                                    <div className="pupil-highlight"></div>
                                </div>
                            </div>
                        </div>

                        {/* Cheeks */}
                        <div className="avatar-cheeks">
                            <div className={`avatar-cheek left ${finalState === 'celebrating' || finalState === 'success' ? 'blush' : ''}`}></div>
                            <div className={`avatar-cheek right ${finalState === 'celebrating' || finalState === 'success' ? 'blush' : ''}`}></div>
                        </div>

                        {/* Mouth */}
                        <div className={`avatar-mouth ${finalState}`}>
                            {finalState === 'whistling' && (
                                <div className="avatar-whistle-note">♪</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="avatar-body">
                    <div className="avatar-vents">
                        <span></span><span></span><span></span>
                    </div>

                    <div className="avatar-arm left">
                        <div className="arm-joint"></div>
                    </div>
                    <div className="avatar-arm right">
                        <div className="arm-joint"></div>
                    </div>
                </div>
            </div>

            {/* Reaction bubbles */}

        </div>
    );
};

export default InteractiveAvatar;
