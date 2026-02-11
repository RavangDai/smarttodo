import React from 'react';
import { motion } from 'framer-motion';
import { Code, PenTool, BookOpen, Briefcase, Heart, Search, Megaphone, Box, Cpu, Music, Coffee, Globe } from 'lucide-react';

const ICONS = [
    { id: 'code', icon: Code, label: 'Code' },
    { id: 'design', icon: PenTool, label: 'Design' },
    { id: 'writing', icon: BookOpen, label: 'Writing' },
    { id: 'business', icon: Briefcase, label: 'Business' },
    { id: 'personal', icon: Heart, label: 'Personal' },
    { id: 'research', icon: Search, label: 'Research' },
    { id: 'marketing', icon: Megaphone, label: 'Marketing' },
    { id: 'other', icon: Box, label: 'Other' },
    { id: 'tech', icon: Cpu, label: 'Tech' },
    { id: 'creative', icon: Music, label: 'Creative' },
    { id: 'lifestyle', icon: Coffee, label: 'Lifestyle' },
    { id: 'web', icon: Globe, label: 'Web' },
];

const IconPicker = ({ selectedIcon, onChange }) => {
    return (
        <div className="grid grid-cols-6 gap-2">
            {ICONS.map(({ id, icon: Icon, label }) => (
                <motion.button
                    key={id}
                    type="button"
                    onClick={() => onChange(id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                        p-3 rounded-xl flex items-center justify-center transition-all duration-300
                        ${selectedIcon === id
                            ? 'bg-primary text-white shadow-[0_0_15px_rgba(255,107,53,0.4)] border border-primary/50'
                            : 'bg-white/5 text-secondary hover:text-white hover:bg-white/10 border border-transparent'
                        }
                    `}
                    title={label}
                >
                    <Icon size={20} />
                </motion.button>
            ))}
        </div>
    );
};

export default IconPicker;
