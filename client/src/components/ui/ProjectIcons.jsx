import React from 'react';
import {
    Code2, PenTool, BookOpen, Briefcase, Heart, Search, Megaphone, Hexagon,
    Cpu, Music, Coffee, Globe
} from 'lucide-react';

// ── Color configs using HEX values for inline styles ──
// This bypasses Tailwind purging completely — colors are guaranteed to render.
const COLORS = {
    sky: {
        hex: '#38bdf8',       // sky-400
        hexLight: '#7dd3fc',  // sky-300
        hexDark: '#0284c7',   // sky-600
        rgb: '56, 189, 248',
    },
    pink: {
        hex: '#f472b6',       // pink-400
        hexLight: '#f9a8d4',  // pink-300
        hexDark: '#db2777',   // pink-600
        rgb: '244, 114, 182',
    },
    emerald: {
        hex: '#34d399',       // emerald-400
        hexLight: '#6ee7b7',  // emerald-300
        hexDark: '#059669',   // emerald-600
        rgb: '52, 211, 153',
    },
    slate: {
        hex: '#94a3b8',       // slate-400
        hexLight: '#cbd5e1',  // slate-300
        hexDark: '#475569',   // slate-600
        rgb: '148, 163, 184',
    },
    rose: {
        hex: '#fb7185',       // rose-400
        hexLight: '#fda4af',  // rose-300
        hexDark: '#e11d48',   // rose-600
        rgb: '251, 113, 133',
    },
    violet: {
        hex: '#a78bfa',       // violet-400
        hexLight: '#c4b5fd',  // violet-300
        hexDark: '#7c3aed',   // violet-600
        rgb: '167, 139, 250',
    },
    orange: {
        hex: '#fb923c',       // orange-400
        hexLight: '#fdba74',  // orange-300
        hexDark: '#ea580c',   // orange-600
        rgb: '251, 146, 60',
    },
    cyan: {
        hex: '#22d3ee',       // cyan-400
        hexLight: '#67e8f9',  // cyan-300
        hexDark: '#0891b2',   // cyan-600
        rgb: '34, 211, 238',
    },
    amber: {
        hex: '#fbbf24',       // amber-400
        hexLight: '#fcd34d',  // amber-300
        hexDark: '#d97706',   // amber-600
        rgb: '251, 191, 36',
    },
    indigo: {
        hex: '#818cf8',       // indigo-400
        hexLight: '#a5b4fc',  // indigo-300
        hexDark: '#4f46e5',   // indigo-600
        rgb: '129, 140, 248',
    },
    zinc: {
        hex: '#a1a1aa',       // zinc-400
        hexLight: '#d4d4d8',  // zinc-300
        hexDark: '#52525b',   // zinc-600
        rgb: '161, 161, 170',
    },
};

// ── Category → Icon + Color resolver ──
const resolveConfig = (category) => {
    const cat = category?.toLowerCase() || 'other';
    switch (cat) {
        case 'coding':
        case 'code':
        case 'dev': return { Icon: Code2, c: COLORS.sky };
        case 'design':
        case 'art': return { Icon: PenTool, c: COLORS.pink };
        case 'writing':
        case 'content': return { Icon: BookOpen, c: COLORS.emerald };
        case 'business':
        case 'work': return { Icon: Briefcase, c: COLORS.slate };
        case 'personal':
        case 'health': return { Icon: Heart, c: COLORS.rose };
        case 'research': return { Icon: Search, c: COLORS.violet };
        case 'marketing': return { Icon: Megaphone, c: COLORS.orange };
        case 'tech': return { Icon: Cpu, c: COLORS.cyan };
        case 'creative':
        case 'music': return { Icon: Music, c: COLORS.violet };
        case 'lifestyle':
        case 'coffee': return { Icon: Coffee, c: COLORS.amber };
        case 'web': return { Icon: Globe, c: COLORS.indigo };
        default: return { Icon: Hexagon, c: COLORS.zinc };
    }
};

// ── Exported helper for other components ──
export const getCategoryColors = (category) => resolveConfig(category).c;

const ProjectIcon = ({ category, className = '', size = 20, variant = 'default' }) => {
    const { Icon, c } = resolveConfig(category);

    // ─── GLASS: translucent icon for Hero / Preview ───
    if (variant === 'glass') {
        return (
            <div
                className={`relative flex items-center justify-center rounded-xl p-3 backdrop-blur-xl overflow-hidden ${className}`}
                style={{
                    backgroundColor: `rgba(${c.rgb}, 0.15)`,
                    border: `1px solid rgba(${c.rgb}, 0.35)`,
                    boxShadow: `0 0 20px -4px rgba(${c.rgb}, 0.5)`,
                }}
            >
                <Icon size={size} style={{ color: c.hex }} className="relative z-10" strokeWidth={1.5} />
            </div>
        );
    }

    // ─── CARD: inside project grid cards ───
    if (variant === 'card') {
        return (
            <div
                className={`relative flex items-center justify-center rounded-2xl p-3.5 ${className}`}
                style={{
                    backgroundColor: `rgba(${c.rgb}, 0.1)`,
                    border: `1px solid rgba(${c.rgb}, 0.2)`,
                    boxShadow: `0 0 18px -4px rgba(${c.rgb}, 0.4)`,
                }}
            >
                <Icon size={size} style={{ color: c.hex }} strokeWidth={2} />
            </div>
        );
    }

    // ─── GLOW: selected state in IconPicker ───
    if (variant === 'glow') {
        return (
            <div
                className={`relative flex items-center justify-center rounded-xl p-3 ${className}`}
                style={{
                    backgroundColor: `rgba(${c.rgb}, 0.12)`,
                    border: `1px solid rgba(${c.rgb}, 0.4)`,
                    boxShadow: `0 0 20px -4px rgba(${c.rgb}, 0.6)`,
                }}
            >
                <Icon size={size} style={{ color: c.hex }} strokeWidth={2.5} />
            </div>
        );
    }

    // ─── COLORFUL: bare icon, no container ───
    if (variant === 'colorful') {
        return <Icon size={size} style={{ color: c.hex }} className={className} strokeWidth={2} />;
    }

    // ─── DEFAULT: subtle muted container ───
    return (
        <div
            className={`flex items-center justify-center rounded-xl p-2.5 ${className}`}
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
        >
            <Icon size={size} style={{ color: c.hex, opacity: 0.7 }} strokeWidth={2} />
        </div>
    );
};

export default ProjectIcon;
