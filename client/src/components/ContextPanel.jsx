import React, { useState } from 'react';
import VerticalTimeline from './VerticalTimeline';
// import ChatPanel from './ChatPanel'; // Will refactor this later, simple placeholder for now or keep existing
import { Waves, MessageSquare } from 'lucide-react';


// Placeholder for ChatPanel to avoid breaking if not refactored yet, or I can import the old one.
// The old one is likely using CSS too. I'll just import it for now and maybe wrap it.
import ChatPanel from './ChatPanel';

const ContextPanel = ({ tasks, onAutoSchedule }) => {
    const [activeTab, setActiveTab] = useState('timeline');

    return (
        <aside className="h-full flex flex-col bg-transparent">
            {/* Tabs */}
            <div className="flex items-center p-2 gap-1 border-b border-white/5">
                <button
                    onClick={() => setActiveTab('timeline')}
                    className={`
                        flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all
                        ${activeTab === 'timeline'
                            ? 'bg-white/10 text-white shadow-sm'
                            : 'text-secondary hover:text-white hover:bg-white/5'
                        }
                    `}
                >
                    <Waves size={14} /> Timeline
                </button>
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`
                        flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all
                        ${activeTab === 'chat'
                            ? 'bg-white/10 text-white shadow-sm'
                            : 'text-secondary hover:text-white hover:bg-white/5'
                        }
                    `}
                >
                    <MessageSquare size={14} /> Chat
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'timeline' ? (
                    <div className="h-full overflow-y-auto custom-scrollbar p-4">
                        <VerticalTimeline
                            tasks={tasks}
                            onAutoSchedule={onAutoSchedule}
                        />
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        <ChatPanel tasks={tasks} user={{ name: 'User' }} />
                    </div>
                )}
            </div>
        </aside>
    );
};

export default ContextPanel;
