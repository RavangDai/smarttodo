import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import confetti from 'canvas-confetti';

const Checkbox = ({ checked, onChange, priority = 'medium', className = '' }) => {

    const handleClick = (e) => {
        e.stopPropagation();
        onChange(!checked);

        if (!checked) {
            // Trigger confetti from the click position if possible, or just center
            // Simple particle burst
            const rect = e.target.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;

            confetti({
                particleCount: 20,
                spread: 40,
                origin: { x, y },
                colors: ['#FF6B35', '#4ade80'],
                disableForReducedMotion: true,
                shapes: ['circle']
            });
        }
    };

    const getBorderColor = () => {
        if (checked) return 'border-primary bg-primary';
        switch (priority) {
            case 'high': return 'border-red-500/50 group-hover:border-red-500';
            case 'medium': return 'border-orange-500/50 group-hover:border-orange-500';
            case 'low': return 'border-green-500/50 group-hover:border-green-500';
            default: return 'border-white/20 group-hover:border-white/40';
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`
        group relative w-6 h-6 rounded-lg 
        border-2 cursor-pointer
        transition-all duration-300 ease-elastic
        flex items-center justify-center
        ${getBorderColor()}
        ${checked ? 'scale-105 shadow-[0_0_15px_rgba(255,107,53,0.4)]' : 'bg-transparent hover:bg-white/5'}
        ${className}
      `}
        >
            <AnimatePresence>
                {checked && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                        <Check size={14} className="text-white stroke-[3]" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hover preview */}
            {!checked && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-30 transition-opacity">
                    <Check size={14} className="text-current" />
                </div>
            )}
        </div>
    );
};

export default Checkbox;
