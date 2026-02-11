import React, { useEffect, useRef } from 'react';

const ParticleBackground = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const createParticle = () => {
            if (!containerRef.current) return;

            const particle = document.createElement('div');
            particle.className = 'particle';

            const size = Math.random() * 4 + 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            // Random horizontal position
            particle.style.left = Math.random() * 100 + '%';
            // Start from bottom
            particle.style.bottom = '-10px';
            particle.style.position = 'absolute'; // Ensure absolute positioning

            const duration = Math.random() * 10 + 15;
            particle.style.animationDuration = duration + 's';

            // Randomize color slightly
            const isOrange = Math.random() > 0.3;
            // particle.style.background = isOrange 
            //     ? 'radial-gradient(circle, rgba(255, 107, 53, 0.8) 0%, rgba(255, 107, 53, 0.4) 40%, transparent 70%)'
            //     : 'radial-gradient(circle, rgba(45, 212, 191, 0.6) 0%, rgba(45, 212, 191, 0.3) 40%, transparent 70%)';
            // Actually, keep it simple and consistent with CSS class, or just set random start offset

            containerRef.current.appendChild(particle);

            setTimeout(() => {
                if (particle.parentNode) particle.parentNode.removeChild(particle);
            }, duration * 1000);
        };

        // Create particles continuously
        const interval = setInterval(createParticle, 2000);

        // Initial burst
        for (let i = 0; i < 15; i++) {
            setTimeout(createParticle, i * 300);
        }

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div className="grid-overlay" />
            <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0" />
        </>
    );
};

export default ParticleBackground;
