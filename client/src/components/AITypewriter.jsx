import React, { useState, useEffect } from 'react';

const aiSuggestions = [
    "When to tackle each task based on your patterns.",
    "Break complex projects into manageable steps.",
    "Prioritize what matters most today.",
    "Schedule tasks at your peak productivity hours.",
    "Focus on one thing at a time.",
    "The best time to start is now."
];

const AITypewriter = () => {
    const [displayText, setDisplayText] = useState('');
    const [suggestionIndex, setSuggestionIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentSuggestion = aiSuggestions[suggestionIndex];

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                // Typing
                if (displayText.length < currentSuggestion.length) {
                    setDisplayText(currentSuggestion.slice(0, displayText.length + 1));
                } else {
                    // Pause at end, then start deleting
                    setTimeout(() => setIsDeleting(true), 2000);
                }
            } else {
                // Deleting
                if (displayText.length > 0) {
                    setDisplayText(displayText.slice(0, -1));
                } else {
                    // Move to next suggestion
                    setIsDeleting(false);
                    setSuggestionIndex((prev) => (prev + 1) % aiSuggestions.length);
                }
            }
        }, isDeleting ? 30 : 50);

        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, suggestionIndex]);

    return (
        <div className="ai-callout">
            <span className="ai-prefix">AI SUGGESTS</span>
            <p>
                <span className="typewriter-text">{displayText}</span>
                <span className="cursor" />
            </p>
        </div>
    );
};

export default AITypewriter;
