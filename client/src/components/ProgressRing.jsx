import React, { useEffect, useState, useRef } from 'react';

const ProgressRing = ({ completed, total }) => {
    const radius = 65;
    const stroke = 7;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    const percentage = total === 0 ? 0 : (completed / total) * 100;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Enhanced color logic with gradients
    let color = '#EF4444'; // Red
    let glowColor = 'rgba(239, 68, 68, 0.3)';
    let message = "Let's start!";

    if (percentage > 0 && percentage <= 33) {
        color = '#EF4444';
        glowColor = 'rgba(239, 68, 68, 0.25)';
        message = "warming up...";
    } else if (percentage > 33 && percentage <= 66) {
        color = '#F59E0B';
        glowColor = 'rgba(245, 158, 11, 0.25)';
        message = "Halfway there!";
    } else if (percentage > 66 && percentage < 100) {
        color = '#10B981';
        glowColor = 'rgba(16, 185, 129, 0.25)';
        message = "Almost done!";
    } else if (percentage === 100) {
        color = '#10B981';
        glowColor = 'rgba(16, 185, 129, 0.35)';
        message = "All done! 🚀";
    }

    // Animation states
    const [offset, setOffset] = useState(circumference);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setOffset(strokeDashoffset);
        }, 100);
        return () => clearTimeout(timer);
    }, [strokeDashoffset]);

    // Pulse animation for empty state
    const shouldPulse = total === 0 || percentage === 0;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '2.5rem 0',
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.5s ease-out'
        }}>
            <div style={{
                position: 'relative',
                width: radius * 2,
                height: radius * 2,
                animation: shouldPulse ? 'ringPulse 3s ease-in-out infinite' : 'none'
            }}>
                {/* Glow Effect */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: (normalizedRadius * 2) + 20,
                    height: (normalizedRadius * 2) + 20,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                    transform: 'translate(-50%, -50%)',
                    opacity: percentage > 0 ? 0.8 : 0.3,
                    transition: 'all 0.5s ease',
                    filter: 'blur(8px)'
                }} />

                <svg
                    height={radius * 2}
                    width={radius * 2}
                    style={{
                        transform: 'rotate(-90deg)',
                        overflow: 'visible',
                        position: 'relative',
                        zIndex: 2
                    }}
                >
                    {/* Background Circle */}
                    <circle
                        stroke="var(--border-soft)"
                        strokeWidth={stroke}
                        fill="transparent"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    {/* Progress Circle */}
                    <circle
                        stroke={color}
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{
                            strokeDashoffset: offset,
                            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease',
                            filter: percentage > 0 ? `drop-shadow(0 0 6px ${glowColor})` : 'none'
                        }}
                        strokeLinecap="round"
                        fill="transparent"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                </svg>

                {/* Center Content */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--text-main)',
                    zIndex: 3
                }}>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        letterSpacing: '-0.02em',
                        lineHeight: '1'
                    }}>
                        {completed}/{total}
                    </div>
                    <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-light)',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginTop: '4px'
                    }}>
                        TASKS
                    </div>
                </div>
            </div>

            {/* Message */}
            <div style={{
                marginTop: '1.25rem',
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '1.1rem',
                fontWeight: '500',
                color: color,
                transition: 'color 0.4s ease',
                textShadow: percentage === 100 ? `0 0 20px ${glowColor}` : 'none'
            }}>
                {message}
            </div>

            {/* Add keyframe animation via style tag */}
            <style>{`
                @keyframes ringPulse {
                    0%, 100% { 
                        transform: scale(1);
                        opacity: 0.9;
                    }
                    50% { 
                        transform: scale(1.02);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProgressRing;
