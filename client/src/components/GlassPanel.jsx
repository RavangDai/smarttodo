import React from 'react';
import { motion } from 'framer-motion';

const GlassPanel = ({ children, className = '', hoverEffect = false }) => {
    return (
        <motion.div
            className={`
                relative overflow-hidden rounded-2xl border border-white/10 
                bg-gradient-to-br from-white/5 to-white/0 
                backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]
                transition-all duration-300
                ${hoverEffect ? 'hover:bg-white/10 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:border-white/20' : ''}
                ${className}
            `}
        >
            {/* Light Leak/Refraction Layer */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Smooth Border Glow */}
            <div className="absolute inset-0 rounded-2xl border border-white/5 mix-blend-overlay pointer-events-none" />

            {children}
        </motion.div>
    );
};

export default GlassPanel;
