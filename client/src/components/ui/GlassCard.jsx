import React from 'react';

const GlassCard = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`
        bg-white/5 
        backdrop-blur-xl 
        border border-white/10 
        rounded-2xl 
        shadow-glass 
        p-6 
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
};

export default GlassCard;
