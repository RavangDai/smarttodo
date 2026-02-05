export const generateSchedule = (tasks) => {
    // 1. Filter Tasks: Only active, unscheduled (no dueTime), or past overdue
    const unscheduledTasks = tasks.filter(t => {
        if (t.isCompleted) return false;
        // If it has a dueDate AND a dueTime, and it's today, it's ALREADY scheduled.
        if (t.dueDate && t.dueDate.includes('T')) {
            const date = new Date(t.dueDate);
            const today = new Date();
            // Check if it's today
            if (date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear()) {
                return false;
            }
        }
        return true;
    });

    // 2. Sort by Priority
    const priorityScore = { high: 3, medium: 2, low: 1 };
    unscheduledTasks.sort((a, b) => priorityScore[b.priority || 'medium'] - priorityScore[a.priority || 'medium']);

    // 3. Find Slots (9 AM to 5 PM)
    const startHour = 9;
    const endHour = 17;
    const updates = [];

    // Check existing slots for TODAY
    const existingSlots = new Set(
        tasks
            .filter(t => {
                if (!t.dueDate || !t.dueDate.includes('T')) return false;
                const d = new Date(t.dueDate);
                const today = new Date();
                return d.getDate() === today.getDate() &&
                    d.getMonth() === today.getMonth() &&
                    d.getFullYear() === today.getFullYear();
            })
            .map(t => new Date(t.dueDate).getHours())
    );

    let currentHour = startHour;

    unscheduledTasks.forEach(task => {
        // Find next free hour
        while (existingSlots.has(currentHour) && currentHour < endHour) {
            currentHour++;
        }

        if (currentHour <= endHour) {
            // Construct new Date object for today with assigned hour
            const newDate = new Date();
            newDate.setHours(currentHour, 0, 0, 0);

            updates.push({
                ...task,
                dueTime: `${String(currentHour).padStart(2, '0')}:00`,
                dueDate: newDate.toISOString()
            });
            existingSlots.add(currentHour);
        }
    });

    return updates;
};
