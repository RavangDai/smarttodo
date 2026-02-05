import React from 'react';

const AIChip = ({ size = 24, className = '', color = 'currentColor' }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Chip Body */}
            <rect x="4" y="4" width="16" height="16" rx="4" stroke={color} strokeWidth="2" fill="none" />

            {/* AI Text */}
            <text
                x="12"
                y="15"
                fill={color}
                fontSize="8"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
                style={{ letterSpacing: '-1px' }}
            >
                AI
            </text>

            {/* Pins/Legs */}
            <path d="M4 9H2" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <path d="M4 15H2" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <path d="M20 9H22" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <path d="M20 15H22" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <path d="M9 4V2" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <path d="M15 4V2" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <path d="M9 20V22" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <path d="M15 20V22" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
};

export default AIChip;
