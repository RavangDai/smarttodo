import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const FlowMeter = ({ tasks = [] }) => {
    // ─── METRICS ───
    // 1. Completion Rate (0-100)
    // 2. "Balance" (Distribution of high/med/low tasks)
    // 3. "Momentum" (Recent completions? mocked for now)

    const [score, setScore] = useState(0);
    const [label, setLabel] = useState('Calibrating...');

    useEffect(() => {
        if (tasks.length === 0) {
            setScore(100);
            setLabel('Zen Mode');
            return;
        }

        const total = tasks.length;
        const completed = tasks.filter(t => t.isCompleted).length;
        const pending = total - completed;
        const highPriorityPending = tasks.filter(t => !t.isCompleted && t.priority === 'high').length;

        // Formula: Base progress + Penalty for overwhelming high priority
        let rawScore = (completed / total) * 100;

        // Adjust for "Overwhelmed" state
        if (highPriorityPending > 3) {
            rawScore -= 10;
        }

        // Clamp
        const finalScore = Math.min(100, Math.max(0, rawScore));
        setScore(finalScore);

        // Labels
        if (finalScore >= 80) setLabel('Flow State');
        else if (finalScore >= 50) setLabel('Balanced');
        else if (finalScore >= 30) setLabel('Gaining Momentum');
        else setLabel('Initiating...');
    }, [tasks]);

    // ─── SVG CONFIG ───
    const width = 120;
    const height = 60; // Semi-circle
    const radius = 50;
    const stroke = 6;
    const circumference = Math.PI * radius; // Half circle (PI * r)
    const arcLength = (score / 100) * circumference;

    const getColor = (s) => {
        if (s >= 80) return '#10B981'; // Emerald
        if (s >= 50) return '#FF6B35'; // Primary
        return '#F59E0B'; // Amber
    };

    const color = getColor(score);

    return (
        <div className="flex items-center gap-3 group cursor-help">
            {/* METER GRAPHIC */}
            <div className="relative w-[60px] h-[30px] flex items-end justify-center overflow-hidden">
                <svg width={width} height={width} className="absolute top-0 transform -rotate-180">
                    <defs>
                        <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                    </defs>

                    {/* Track */}
                    <path
                        d="M10,60 A50,50 0 0,1 110,60"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={stroke}
                        strokeLinecap="round"
                    />

                    {/* Fill */}
                    <motion.path
                        d="M10,60 A50,50 0 0,1 110,60"
                        fill="none"
                        stroke={`url(#meterGradient)`}
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference}
                        animate={{ strokeDashoffset: circumference - arcLength }}
                        transition={{ duration: 1.5, ease: [0.2, 0.8, 0.2, 1] }}
                        style={{ filter: 'drop-shadow(0 0 4px rgba(255,107,53,0.3))' }}
                    />
                </svg>

                {/* Score Text */}
                <div className="absolute bottom-0 text-[10px] font-mono font-bold text-white/80">
                    {Math.round(score)}%
                </div>
            </div>

            {/* TEXT INFO */}
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-secondary font-semibold">Daily Energy</span>
                <motion.span
                    key={label}
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-white font-medium text-xs text-gradient"
                >
                    {label}
                </motion.span>
            </div>
        </div>
    );
};

export default FlowMeter;
