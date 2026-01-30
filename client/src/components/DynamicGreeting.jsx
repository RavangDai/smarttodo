import React from 'react';

const DynamicGreeting = ({ userName = "there", highPriorityCount = 0, completionRate = 0, totalTasks = 0 }) => {
    const hour = new Date().getHours();

    // Determine time of day
    const getTimeOfDay = () => {
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    };

    const timeOfDay = getTimeOfDay();

    // Dynamic greeting based on time and context
    const getGreeting = () => {
        const greetings = {
            morning: {
                base: `Good Morning, ${userName}`,
                context: highPriorityCount > 0
                    ? `You have ${highPriorityCount} high-priority task${highPriorityCount > 1 ? 's' : ''} to tackle.`
                    : totalTasks > 0
                        ? `Ready to conquer your ${totalTasks} task${totalTasks > 1 ? 's' : ''}?`
                        : "What will you accomplish today?"
            },
            afternoon: {
                base: `Good Afternoon, ${userName}`,
                context: completionRate >= 50
                    ? `Great progress! You're ${completionRate}% through your goals.`
                    : highPriorityCount > 0
                        ? `${highPriorityCount} priority task${highPriorityCount > 1 ? 's' : ''} still need attention.`
                        : "Keep the momentum going!"
            },
            evening: {
                base: `Good Evening, ${userName}`,
                context: completionRate >= 80
                    ? `Amazing! You crushed ${completionRate}% of your goals today! 🎉`
                    : completionRate >= 50
                        ? `Solid day! ${completionRate}% complete.`
                        : "Winding down? There's still time to make progress."
            },
            night: {
                base: `Working Late, ${userName}?`,
                context: completionRate >= 80
                    ? `You've achieved ${completionRate}% today. Time to rest!`
                    : "Don't forget to take breaks."
            }
        };

        return greetings[timeOfDay];
    };

    const greeting = getGreeting();

    // Get motivational emoji based on performance
    const getEmoji = () => {
        if (completionRate >= 80) return '🔥';
        if (completionRate >= 50) return '💪';
        if (highPriorityCount > 2) return '⚡';
        return '✨';
    };

    return (
        <div className="dynamic-greeting">
            <h2 className="greeting-title">
                {greeting.base} <span className="greeting-emoji">{getEmoji()}</span>
            </h2>
            <p className="greeting-context">
                {greeting.context}
            </p>
        </div>
    );
};

export default DynamicGreeting;
