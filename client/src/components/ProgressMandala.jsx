import React, { useEffect, useState } from 'react';

/**
 * ProgressMandala - A geometric mandala that fills based on progress
 * Creates a sacred geometry pattern that completes as subtasks are done
 */
const ProgressMandala = ({ completed, total, isComplete = false }) => {
    const [dissolving, setDissolving] = useState(false);

    // Calculate progress (0 to 1)
    const progress = total > 0 ? completed / total : 0;

    // Trigger dissolve animation when complete
    useEffect(() => {
        if (isComplete && progress === 1) {
            const timer = setTimeout(() => setDissolving(true), 500);
            return () => clearTimeout(timer);
        }
        setDissolving(false);
    }, [isComplete, progress]);

    // Generate mandala petals
    const petalCount = Math.max(total, 6); // Minimum 6 petals for visual appeal
    const filledPetals = Math.round(progress * petalCount);

    // Create petal paths
    const petals = [];
    const centerX = 20;
    const centerY = 20;
    const outerRadius = 16;
    const innerRadius = 6;

    for (let i = 0; i < petalCount; i++) {
        const angle = (i * 360 / petalCount) - 90; // Start from top
        const nextAngle = ((i + 1) * 360 / petalCount) - 90;

        const angleRad = (angle * Math.PI) / 180;
        const nextAngleRad = (nextAngle * Math.PI) / 180;
        const midAngle = (angle + nextAngle) / 2;
        const midAngleRad = (midAngle * Math.PI) / 180;

        // Petal shape: inner point, curve out, outer point, curve back
        const innerX = centerX + innerRadius * Math.cos(angleRad);
        const innerY = centerY + innerRadius * Math.sin(angleRad);
        const outerX = centerX + outerRadius * Math.cos(midAngleRad);
        const outerY = centerY + outerRadius * Math.sin(midAngleRad);
        const innerX2 = centerX + innerRadius * Math.cos(nextAngleRad);
        const innerY2 = centerY + innerRadius * Math.sin(nextAngleRad);

        // Control points for curves
        const cp1x = centerX + (outerRadius * 0.7) * Math.cos(angleRad);
        const cp1y = centerY + (outerRadius * 0.7) * Math.sin(angleRad);
        const cp2x = centerX + (outerRadius * 0.7) * Math.cos(nextAngleRad);
        const cp2y = centerY + (outerRadius * 0.7) * Math.sin(nextAngleRad);

        const path = `M ${innerX} ${innerY} Q ${cp1x} ${cp1y} ${outerX} ${outerY} Q ${cp2x} ${cp2y} ${innerX2} ${innerY2} Z`;

        const isFilled = i < filledPetals;

        petals.push(
            <path
                key={i}
                d={path}
                className={`mandala-petal ${isFilled ? 'filled' : ''}`}
                style={{
                    animationDelay: `${i * 50}ms`,
                    opacity: isFilled ? 1 : 0.2
                }}
            />
        );
    }

    return (
        <div className={`progress-mandala ${dissolving ? 'dissolving' : ''} ${progress === 1 ? 'complete' : ''}`}>
            <svg viewBox="0 0 40 40" width="28" height="28">
                {/* Background circle */}
                <circle
                    cx="20"
                    cy="20"
                    r="18"
                    className="mandala-bg"
                />

                {/* Petals */}
                <g className="mandala-petals">
                    {petals}
                </g>

                {/* Center circle */}
                <circle
                    cx="20"
                    cy="20"
                    r="5"
                    className={`mandala-center ${progress === 1 ? 'complete' : ''}`}
                />

                {/* Inner decorative ring */}
                <circle
                    cx="20"
                    cy="20"
                    r="3"
                    className="mandala-inner"
                />
            </svg>

            {/* Progress text */}
            {total > 0 && (
                <span className="mandala-text">
                    {completed}/{total}
                </span>
            )}
        </div>
    );
};

export default ProgressMandala;
