import React, { useState } from 'react';
import VerticalTimeline from './VerticalTimeline';
import ChatPanel from './ChatPanel';
import './ContextPanel.css';
import { FaStream, FaComments } from 'react-icons/fa';

const ContextPanel = ({ tasks, onAutoSchedule }) => {
    const [activeTab, setActiveTab] = useState('timeline');

    return (
        <aside className="context-panel">
            <div className="panel-header-tabs">
                <button
                    className={`panel-tab ${activeTab === 'timeline' ? 'active' : ''}`}
                    onClick={() => setActiveTab('timeline')}
                >
                    <FaStream size={12} /> Timeline
                </button>
                <button
                    className={`panel-tab ${activeTab === 'chat' ? 'active' : ''}`}
                    onClick={() => setActiveTab('chat')}
                >
                    <FaComments size={12} /> Chat
                </button>
            </div>

            <div className="panel-content">
                {activeTab === 'timeline' ? (
                    <VerticalTimeline
                        tasks={tasks}
                        onAutoSchedule={onAutoSchedule}
                    />
                ) : (
                    <ChatPanel tasks={tasks} user={{ name: 'User' }} />
                )}
            </div>
        </aside>
    );
};

export default ContextPanel;
