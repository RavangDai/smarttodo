import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Layers, Search } from 'lucide-react';

const EmptyState = ({ type = 'tasks', searchQuery = '' }) => {
    // Content variants based on context
    const content = {
        tasks: {
            icon: Sparkles,
            title: "Let's architect your day.",
            subtitle: "Your future wins are waiting. Start by adding a task above."
        },
        search: {
            icon: Search,
            title: "No matches found.",
            subtitle: `We couldn't find anything for "${searchQuery}". Try a different term.`
        },
        projects: {
            icon: Layers,
            title: "Build something great.",
            subtitle: "Projects help you organize big goals. Create one to get started."
        }
    };

    const { icon: Icon, title, subtitle } = content[type] || content.tasks;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex flex-col items-center justify-center h-[60vh] text-center p-8"
        >
            {/* Soft Floating Illustration */}
            <motion.div
                animate={{ y: [0, -12, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative mb-8 group cursor-default"
            >
                {/* Glow Background */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-700" />

                {/* Floating Card */}
                <div className="relative z-10 w-24 h-24 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.2)] group-hover:shadow-[0_8px_32px_rgba(255,107,53,0.15)] transition-all duration-500">
                    <Icon size={32} className="text-white/80 group-hover:text-primary transition-colors duration-500" strokeWidth={1.5} />
                </div>

                {/* Decorative Elements */}
                <motion.div
                    animate={{ y: [0, 8, 0], x: [0, 4, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -right-4 -top-4 w-12 h-12 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center backdrop-blur-sm z-0"
                >
                    <div className="w-2 h-2 rounded-full bg-primary/40" />
                </motion.div>

                <motion.div
                    animate={{ y: [0, -6, 0], x: [0, -4, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute -left-3 -bottom-2 w-8 h-8 bg-white/5 border border-white/5 rounded-lg backdrop-blur-sm z-20"
                />
            </motion.div>

            {/* Motivational Copy */}
            <h3 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 mb-3 tracking-tight">
                {title}
            </h3>
            <p className="text-secondary text-base max-w-sm mx-auto leading-relaxed font-light">
                {subtitle}
            </p>
        </motion.div>
    );
};

export default EmptyState;
