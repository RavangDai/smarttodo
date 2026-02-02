import React, { useState, useEffect, useRef } from 'react';

const CommandPalette = ({ onClose, onAction }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);

    const commands = [
        { id: 'new-task', label: 'New Task', shortcut: '⇧N', action: 'focus-input' },
        { id: 'search', label: 'Search Tasks', shortcut: '/', action: 'focus-search' },
        { id: 'dark-mode', label: 'Toggle Dark Mode', shortcut: 'D', action: 'toggle-theme' },
        { id: 'insights', label: 'Go to Insights', shortcut: 'I', action: 'view-insights' },
        { id: 'tasks', label: 'Go to Tasks', shortcut: 'T', action: 'view-tasks' },
        { id: 'settings', label: 'Open Settings', shortcut: 'S', action: 'open-settings' },
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'Enter' && filteredCommands.length > 0) {
            onAction(filteredCommands[0].action);
            onClose();
        }
    };

    const handleSelect = (action) => {
        onAction(action);
        onClose();
    };

    return (
        <div className="palette-overlay" onClick={onClose}>
            <div className="palette-panel" onClick={e => e.stopPropagation()}>
                <input
                    ref={inputRef}
                    type="text"
                    className="palette-input"
                    placeholder="Type a command..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <div className="palette-list">
                    {filteredCommands.map(cmd => (
                        <button
                            key={cmd.id}
                            className="palette-item"
                            onClick={() => handleSelect(cmd.action)}
                        >
                            <span className="item-label">{cmd.label}</span>
                            <span className="item-shortcut">{cmd.shortcut}</span>
                        </button>
                    ))}
                    {filteredCommands.length === 0 && (
                        <div className="palette-empty">No commands found</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
