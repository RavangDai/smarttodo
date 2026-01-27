import React, { useEffect, useState } from 'react';

const ProgressRing = ({ completed, total }) => {
    const radius = 60;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    const percentage = total === 0 ? 0 : (completed / total) * 100;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Color Logic: Red -> Yellow -> Green
    let color = '#ef4444'; // Red
    let message = "Let's start!";

    if (percentage > 0 && percentage <= 33) {
        color = '#ef4444'; // Red
        message = "warming up...";
    } else if (percentage > 33 && percentage <= 66) {
        color = '#f59e0b'; // Orange/Yellow
        message = "Halfway there!";
    } else if (percentage > 66 && percentage < 100) {
        color = '#10b981'; // Green
        message = "Almost done!";
    } else if (percentage === 100) {
        color = '#10b981'; // Green
        message = "All done! 🚀";
    }

    // Animation state
    const [offset, setOffset] = useState(circumference);
    useEffect(() => {
        setOffset(strokeDashoffset);
    }, [strokeDashoffset, circumference]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem 0' }}>
            <div style={{ position: 'relative', width: radius * 2, height: radius * 2 }}>
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
                >
                    {/* Background Circle */}
                    <circle
                        stroke="#e2e8f0"
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
                        style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 0.5s ease-in-out, stroke 0.5s ease' }}
                        strokeLinecap="round"
                        fill="transparent"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                </svg>
                <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--text-main)',
                    fontWeight: '600',
                    fontSize: '1.2rem'
                }}>
                    {completed}/{total}
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '400' }}>TASKS</div>
                </div>
            </div>
            <div style={{ marginTop: '1rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: color, fontWeight: '500' }}>
                {message}
            </div>
        </div>
    );
};

export default ProgressRing;
