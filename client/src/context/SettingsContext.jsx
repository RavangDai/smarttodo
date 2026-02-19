import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    // Default settings
    const defaultSettings = {
        theme: 'dark',
        aiSuggestions: true,
        notifications: true,
        compactView: false,
        soundEnabled: true,
        name: '',
        email: ''
    };

    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('karyaSettings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    });

    // Apply side effects when settings change
    useEffect(() => {
        localStorage.setItem('karyaSettings', JSON.stringify(settings));

        // Apply Theme
        if (settings.theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Apply Compact View to Body (optional, can be used for global CSS overrides)
        if (settings.compactView) {
            document.body.classList.add('compact-view');
        } else {
            document.body.classList.remove('compact-view');
        }

    }, [settings]);

    // Construct the context value
    const updateSettings = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const importSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, importSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
