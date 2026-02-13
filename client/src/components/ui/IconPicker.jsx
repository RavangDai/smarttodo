import React from 'react';
import { motion } from 'framer-motion';
import ProjectIcon from './ProjectIcons';

const CATEGORIES = [
    { id: 'coding', label: 'Code' },
    { id: 'design', label: 'Design' },
    { id: 'writing', label: 'Writing' },
    { id: 'business', label: 'Business' },
    { id: 'personal', label: 'Personal' },
    { id: 'research', label: 'Research' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'other', label: 'Other' },
    { id: 'tech', label: 'Tech' },
    { id: 'creative', label: 'Creative' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'web', label: 'Web' },
];

const IconPicker = ({ selectedIcon, onChange }) => {
    return (
        <div className="grid grid-cols-6 gap-3">
            {CATEGORIES.map(({ id, label }) => {
                const isSelected = selectedIcon === id;

                return (
                    <motion.button
                        key={id}
                        type="button"
                        onClick={() => onChange(id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title={label}
                        className="relative group focus:outline-none"
                    >
                        {/* We use ProjectIcon to handle the visuals. 
                            If selected, we want the 'glow' variant.
                            If not, 'default' but with hover effects handled by parent or internal logic. */}
                        <ProjectIcon
                            category={id}
                            variant={isSelected ? 'glow' : 'default'}
                            size={22}
                            className={`w-full h-full transition-all duration-200 ${!isSelected && 'hover:bg-white/10'}`}
                        />
                    </motion.button>
                );
            })}
        </div>
    );
};

export default IconPicker;
