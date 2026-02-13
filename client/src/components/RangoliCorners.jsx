import React from 'react';

const RangoliCorners = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
            {/* Top Left */}
            <div className="absolute top-0 left-0 w-32 h-32 opacity-40">
                <svg viewBox="0 0 100 100" className="w-full h-full text-orange-500 fill-current">
                    <path d="M0,0 L100,0 L0,100 Z" fill="url(#cornerGradient)" />
                    <circle cx="20" cy="20" r="2" fill="#fff" />
                    <circle cx="35" cy="10" r="2" fill="#fff" />
                    <circle cx="10" cy="35" r="2" fill="#fff" />
                    <path d="M10,10 Q50,10 50,50" fill="none" stroke="#FF9F1C" strokeWidth="1" />
                </svg>
            </div>

            {/* Top Right */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-40 transform scale-x-[-1]">
                <svg viewBox="0 0 100 100" className="w-full h-full text-orange-500 fill-current">
                    <path d="M0,0 L100,0 L0,100 Z" fill="url(#cornerGradient)" />
                    <circle cx="20" cy="20" r="2" fill="#fff" />
                    <circle cx="35" cy="10" r="2" fill="#fff" />
                    <circle cx="10" cy="35" r="2" fill="#fff" />
                    <path d="M10,10 Q50,10 50,50" fill="none" stroke="#FF9F1C" strokeWidth="1" />
                </svg>
            </div>

            {/* Bottom Left */}
            <div className="absolute bottom-0 left-0 w-32 h-32 opacity-40 transform scale-y-[-1]">
                <svg viewBox="0 0 100 100" className="w-full h-full text-orange-500 fill-current">
                    <path d="M0,0 L100,0 L0,100 Z" fill="url(#cornerGradient)" />
                    <circle cx="20" cy="20" r="2" fill="#fff" />
                    <circle cx="35" cy="10" r="2" fill="#fff" />
                    <circle cx="10" cy="35" r="2" fill="#fff" />
                    <path d="M10,10 Q50,10 50,50" fill="none" stroke="#FF9F1C" strokeWidth="1" />
                </svg>
            </div>

            {/* Bottom Right */}
            <div className="absolute bottom-0 right-0 w-32 h-32 opacity-40 transform scale-[-1]">
                <svg viewBox="0 0 100 100" className="w-full h-full text-orange-500 fill-current">
                    <defs>
                        <linearGradient id="cornerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d="M0,0 L100,0 L0,100 Z" fill="url(#cornerGradient)" />
                    <circle cx="20" cy="20" r="2" fill="#fff" />
                    <circle cx="35" cy="10" r="2" fill="#fff" />
                    <circle cx="10" cy="35" r="2" fill="#fff" />
                    <path d="M10,10 Q50,10 50,50" fill="none" stroke="#FF9F1C" strokeWidth="1" />
                </svg>
            </div>
        </div>
    );
};

export default RangoliCorners;
