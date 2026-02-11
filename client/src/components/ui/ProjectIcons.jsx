import React from 'react';
import {
    Code2, PenTool, BookOpen, Briefcase, Heart, Search, Megaphone, Hexagon
} from 'lucide-react';

const ProjectIcon = ({ category, className = '', size = 20 }) => {
    const getIcon = () => {
        switch (category?.toLowerCase()) {
            case 'coding':
            case 'code':
            case 'development':
                return {
                    icon: Code2,
                    gradient: 'from-cyan-400 to-purple-500',
                    bg: 'bg-cyan-500/10'
                };
            case 'design':
            case 'art':
                return {
                    icon: PenTool,
                    gradient: 'from-orange-400 to-pink-500',
                    bg: 'bg-orange-500/10'
                };
            case 'writing':
                return {
                    icon: BookOpen,
                    gradient: 'from-emerald-400 to-cyan-500',
                    bg: 'bg-emerald-500/10'
                };
            case 'business':
            case 'work':
                return {
                    icon: Briefcase,
                    gradient: 'from-blue-400 to-indigo-500',
                    bg: 'bg-blue-500/10'
                };
            case 'personal':
            case 'health':
                return {
                    icon: Heart,
                    gradient: 'from-red-400 to-rose-500',
                    bg: 'bg-red-500/10'
                };
            case 'research':
                return {
                    icon: Search,
                    gradient: 'from-violet-400 to-fuchsia-500',
                    bg: 'bg-violet-500/10'
                };
            case 'marketing':
                return {
                    icon: Megaphone,
                    gradient: 'from-yellow-400 to-orange-500', // Changed to standard Tailwind colors
                    bg: 'bg-yellow-500/10'
                };
            default:
                return {
                    icon: Hexagon,
                    gradient: 'from-gray-400 to-gray-500',
                    bg: 'bg-gray-500/10'
                };
        }
    };

    const { icon: Icon, gradient, bg } = getIcon();

    return (
        <div className={`
      relative flex items-center justify-center 
      rounded-lg p-2 
      ${bg} 
      group-hover:bg-opacity-20 transition-all 
      ${className}
    `}>
            <Icon
                size={size}
                className={`bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}
                strokeWidth={2.5}
                // Lucide doesn't support gradient text directly on SVG stroke easily without a mask or ID.
                // For now, we use a solid color fallback or detailed SVG if needed.
                // Actually, let's just color the stroke.
                color="currentColor"
                style={{ stroke: "url(#gradient-" + category + ")" }}
            />

            {/* 
         To actually support gradient strokes in SVGs, we need a defs block. 
         Accessing the ID might be tricky. 
         Alternative: Use the 'text-transparent bg-clip-text' on a wrapper? No, that affects fill (usually text).
         For stroke, we need generic colors. Let's stick to solid vibrant colors for now 
         OR inject a localized SVG def.
      */}
            <svg width="0" height="0">
                <linearGradient id={"gradient-" + category} x1="100%" y1="100%" x2="0%" y2="0%">
                    <stop stopColor="currentColor" offset="0%" />
                    <stop stopColor="currentColor" offset="100%" />
                    {/* simplified, real gradient needs distinct colors */}
                </linearGradient>
            </svg>
            {/* 
         Let's retry: just use the specific colored classes for the stroke itself 
         by passing className with text-color.
      */}
        </div>
    );
};

// Simplified version for reliability
const SimpleProjectIcon = ({ category, className = '', size = 20 }) => {
    const getColors = () => {
        switch (category?.toLowerCase()) {
            case 'coding': return 'text-cyan-400';
            case 'design': return 'text-orange-400';
            case 'writing': return 'text-emerald-400';
            case 'business': return 'text-blue-400';
            case 'personal': return 'text-red-400';
            case 'research': return 'text-violet-400';
            case 'marketing': return 'text-yellow-400';
            default: return 'text-gray-400';
        }
    };

    const getIcon = () => {
        switch (category?.toLowerCase()) {
            case 'coding': return Code2;
            case 'design': return PenTool;
            case 'writing': return BookOpen;
            case 'business': return Briefcase;
            case 'personal': return Heart;
            case 'research': return Search;
            case 'marketing': return Megaphone;
            default: return Hexagon;
        }
    };

    const Icon = getIcon();
    const colorClass = getColors();

    return (
        <div className={`p-2 rounded-lg bg-white/5 ${className}`}>
            <Icon size={size} className={`${colorClass} drop-shadow-md`} />
        </div>
    );
}

export default SimpleProjectIcon;
