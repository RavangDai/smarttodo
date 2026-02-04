import React from 'react';
import VerticalTimeline from './VerticalTimeline';
import './ContextPanel.css';

const ContextPanel = ({ tasks }) => {
    return (
        <aside className="context-panel">
            <VerticalTimeline tasks={tasks} />
        </aside>
    );
};

export default ContextPanel;
