import React from 'react';
import { Flame, Zap, BarChart3, Waves } from 'lucide-react';

const PriorityIcon = ({ priority, size = 16, className = '' }) => {
    const getConfig = () => {
        switch (priority?.toLowerCase()) {
            case 'critical':
                return {
                    icon: Zap,
                    color: 'text-cyan-400',
                    bg: 'bg-cyan-400/10'
                };
            case 'high':
                return {
                    icon: Flame,
                    color: 'text-red-500',
                    bg: 'bg-red-500/10'
                };
            case 'medium':
                return {
                    icon: BarChart3,
                    color: 'text-orange-400',
                    bg: 'bg-orange-400/10'
                };
            case 'low':
            default:
                return {
                    icon: Waves,
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-400/10'
                };
        }
    };

    const { icon: Icon, color, bg } = getConfig();

    return (
        <div className={`p-1.5 rounded-md ${bg} ${className}`} title={`Priority: ${priority}`}>
            <Icon size={size} className={`${color}`} />
        </div>
    );
};

export default PriorityIcon;
