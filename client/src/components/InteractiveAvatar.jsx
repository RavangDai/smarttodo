import { useState, useEffect, useRef, useCallback } from 'react';
import './InteractiveAvatar.css';

/**
 * Interactive Avatar Component
 * Reacts to user input and cursor movement with delightful animations
 */
const InteractiveAvatar = ({
    isTyping = false,
    isFocusedPassword = false,
    authResult = 'idle',
    email = '',
    isFocusedEmail = false,
    isPasswordVisible = false,
    mode = 'auth' // 'auth' | 'zen'
}) => {
    const [blinkState, setBlinkState] = useState(false);
    const [eyePosition, setEyePosition] = useState({ x: 3, y: 0 });
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

    // Set up mouse tracking
    useEffect(() => {
        // Track mouse in zen mode OR when idle in auth mode
        const shouldTrack = mode === 'zen' || (!isFocusedEmail && !isFocusedPassword && !isTyping && authResult === 'idle');
        setIsTrackingMouse(shouldTrack);

        if (shouldTrack) {
            window.addEventListener('mousemove', handleMouseMove);
            return () => window.removeEventListener('mousemove', handleMouseMove);
        }
    }, [isFocusedEmail, isFocusedPassword, isTyping, authResult, handleMouseMove, mode]);

    // Track email for eye movement when typing - look RIGHT towards the form panel
    useEffect(() => {
        if (mode === 'zen') return; // Skip in zen mode

        if (isFocusedEmail && email.length > 0) {
            // Eyes look RIGHT towards the email input and follow typing
            const progress = Math.min(email.length / 30, 1);
            setEyePosition({ x: 6 + (progress * 2), y: -2 + (progress * 1) });
        } else if (isFocusedEmail) {
            // Email focused but empty - look right at input start
            setEyePosition({ x: 6, y: -1 });
        } else if (isFocusedPassword) {
            // Password focused - eyes covered anyway
            setEyePosition({ x: 6, y: 2 });
        } else if (isTyping) {
            // Typing somewhere - look towards the right panel
            setEyePosition({ x: 5, y: 0 });
        }
        // Don't set position for idle - mouse tracking handles that
    }, [email, isFocusedEmail, isFocusedPassword, isTyping, mode]);

    // Determine avatar state
    const getAvatarState = () => {
        if (mode === 'zen') {
            if (isHovered) return 'active'; // Wave/Thumbs up on hover (reusing active state keyframes or new ones)
            return 'zen';
        }

        if (isWelcoming) return 'welcome';
        if (authResult === 'success') return 'active'; // Ready to work!
        if (authResult === 'error') return 'confused';
        if (isFocusedPassword) {
            if (isPasswordVisible) return 'peeking'; // Or watching?
            return 'whistling'; // Look up innocently
        }
        if (isTyping || isFocusedEmail) return 'watching';
        return 'idle';
    };

    const avatarState = getAvatarState();

    return (
        <div
            className={`interactive-avatar ${avatarState}`}
            ref={avatarRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ cursor: mode === 'zen' ? 'pointer' : 'default' }}
        >
            {/* Avatar Container */}
            <div className="avatar-character">
                {/* Floating Coffee Cup (Zen Mode) */}
                {avatarState === 'zen' && (
                    <div className="avatar-coffee">☕</div>
                )}

                {/* Glow Effect */}
                <div className="avatar-glow"></div>

                {/* Head */}
                <div className="avatar-head">
                    {/* Ears */}
                    <div className="avatar-ear left"></div>
                    <div className="avatar-ear right"></div>

                    {/* Face */}
                    <div className="avatar-face">
                        {/* Eyebrows */}
                        <div className="avatar-eyebrows">
                            <div className={`avatar-eyebrow left ${avatarState === 'sad' ? 'worried' : ''}`}></div>
                            <div className={`avatar-eyebrow right ${avatarState === 'sad' ? 'worried' : ''}`}></div>
                        </div>

                        {/* Eyes */}
                        <div className="avatar-eyes">
                            {avatarState === 'covering' ? (
                                <>
                                    {/* Hands covering eyes */}
                                    <div className="avatar-hand left"></div>
                                    <div className="avatar-hand right"></div>
                                </>
                            ) : (
                                <>
                                    {/* Searchlight beam - casts light in gaze direction */}
                                    <div
                                        className="avatar-searchlight"
                                        style={{
                                            transform: `rotate(${Math.atan2(eyePosition.y, eyePosition.x) * (180 / Math.PI)}deg)`,
                                            opacity: Math.sqrt(eyePosition.x * eyePosition.x + eyePosition.y * eyePosition.y) / 10
                                        }}
                                    ></div>

                                    <div className={`avatar-eye left ${blinkState ? 'blink' : ''} ${avatarState === 'active' ? 'happy' : ''} ${avatarState === 'confused' ? 'question' : ''}`}>
                                        <div
                                            className="avatar-pupil"
                                            style={{
                                                transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`
                                            }}
                                        >
                                            {avatarState === 'confused' && '?'}
                                            {avatarState === 'active' && '^'}
                                            {avatarState === 'zen' && '-'}
                                        </div>
                                    </div>
                                    <div className={`avatar-eye right ${blinkState ? 'blink' : ''} ${avatarState === 'active' ? 'happy' : ''} ${avatarState === 'confused' ? 'question' : ''}`}>
                                        <div
                                            className="avatar-pupil"
                                            style={{
                                                transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`
                                            }}
                                        >
                                            {avatarState === 'confused' && '?'}
                                            {avatarState === 'active' && '^'}
                                            {avatarState === 'zen' && '-'}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Cheeks */}
                        <div className="avatar-cheeks">
                            <div className={`avatar-cheek left ${avatarState === 'celebrating' ? 'blush' : ''}`}></div>
                            <div className={`avatar-cheek right ${avatarState === 'celebrating' ? 'blush' : ''}`}></div>
                        </div>

                        {/* Mouth */}
                        <div className={`avatar-mouth ${avatarState}`}>
                            {avatarState === 'whistling' && (
                                <div className="avatar-whistle-note">♪</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="avatar-body">
                    {/* Arms for covering animation */}
                    {avatarState !== 'covering' && (
                        <>
                            <div className="avatar-arm left"></div>
                            <div className="avatar-arm right"></div>
                        </>
                    )}
                </div>
            </div>

            {/* Reaction bubbles */}
            {avatarState === 'celebrating' && (
                <div className="avatar-confetti">
                    <span>🎉</span>
                    <span>⭐</span>
                    <span>🎊</span>
                </div>
            )}

            {avatarState === 'sad' && (
                <div className="avatar-sweat">💧</div>
            )}
        </div>
    );
};

export default InteractiveAvatar;
