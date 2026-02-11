import React from 'react';

const CustomIcon = ({
    icon: Icon,
    color = 'text-primary',
    size = 24,
    className = '',
    glow = false
}) => {
    if (!Icon) return null;

    return (
        <div className={`relative flex items-center justify-center group ${className}`}>
            {/* Glow Effect */}
            {glow && (
                <div className={`
          absolute inset-0 
          bg-current opacity-20 blur-md rounded-full 
          scale-0 transition-transform duration-300 
          group-hover:scale-150
          ${color}
        `} />
            )}

            {/* Icon with Duotone-ish feel via drop-shadow */}
            <Icon
                size={size}
                className={`
          relative z-10 
          drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]
          transition-all duration-300
          group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(255,107,53,0.5)]
          ${color}
        `}
                strokeWidth={2}
            />

            {/* Subtle inner detail/highlight could be added here with SVG overlay if needed, 
          but Lucide is line-based. We use CSS filters for depth. */}
        </div>
    );
};

export default CustomIcon;
