import React from 'react';
import { motion } from 'framer-motion';

export const PrimaryButton = ({ children, className = '', ...props }) => {
    return (
        <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`
        bg-gradient-to-br from-primary to-[#FF8C42] 
        text-white font-semibold 
        rounded-xl 
        px-6 py-3 
        shadow-[0_4px_12px_rgba(255,107,53,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] 
        hover:shadow-[0_6px_20px_rgba(255,107,53,0.4)] 
        transition-all duration-200 ease-out 
        flex items-center gap-2 justify-center
        ${className}
      `}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export const SecondaryButton = ({ children, className = '', ...props }) => {
    return (
        <motion.button
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            whileTap={{ scale: 0.98 }}
            className={`
        bg-transparent 
        border-[1.5px] border-white/15 
        text-white/90 
        rounded-xl 
        px-6 py-3 
        hover:border-white/30 
        transition-all duration-200 ease-out 
        flex items-center gap-2 justify-center
        ${className}
      `}
            {...props}
        >
            {children}
        </motion.button>
    );
};
