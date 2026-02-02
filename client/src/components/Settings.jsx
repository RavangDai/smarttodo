import React, { useState, useEffect } from 'react';

const Settings = ({ onClose, onLogout }) => {
    const [settings, setSettings] = useState({
        name: '',
        email: '',
        theme: 'light',
        notifications: true,
        aiSuggestions: true,
        compactView: false
    });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Load settings on mount
    useEffect(() => {
        const saved = localStorage.getItem('karyaSettings');
        if (saved) {
            const parsed = JSON.parse(saved);
            setSettings(prev => ({ ...prev, ...parsed }));
            // Apply dark mode immediately
            if (parsed.theme === 'dark') {
                document.body.classList.add('dark-mode');
            }
        }
        // Get email from token if available
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.user?.email) {
                    setSettings(prev => ({ ...prev, email: payload.user.email }));
                }
            } catch (e) { }
        }
    }, []);

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        setIsSaving(true);
        localStorage.setItem('karyaSettings', JSON.stringify(settings));
        setTimeout(() => {
            setIsSaving(false);
            setMessage('Settings saved');
            setTimeout(() => setMessage(''), 2000);
        }, 300);
    };

    const handleExportData = () => {
        const data = {
            settings,
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'karya-settings.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-panel" onClick={e => e.stopPropagation()}>
                <header className="settings-header">
                    <h2>SETTINGS</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </header>

                <div className="settings-content">
                    {/* Profile Section */}
                    <section className="settings-section">
                        <h3 className="section-label">PROFILE</h3>
                        <div className="setting-row">
                            <label>Display Name</label>
                            <input
                                type="text"
                                className="setting-input"
                                value={settings.name}
                                onChange={e => handleChange('name', e.target.value)}
                                placeholder="Your name"
                            />
                        </div>
                        <div className="setting-row">
                            <label>Email</label>
                            <input
                                type="email"
                                className="setting-input"
                                value={settings.email}
                                disabled
                                style={{ opacity: 0.6 }}
                            />
                        </div>
                    </section>

                    {/* Preferences Section */}
                    <section className="settings-section">
                        <h3 className="section-label">PREFERENCES</h3>

                        <div className="setting-row toggle-row">
                            <div>
                                <label>Dark Mode</label>
                                <span className="setting-desc">Brutalist dark theme</span>
                            </div>
                            <button
                                className={`toggle-btn ${settings.theme === 'dark' ? 'active' : ''}`}
                                onClick={() => {
                                    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
                                    handleChange('theme', newTheme);
                                    document.body.classList.toggle('dark-mode', newTheme === 'dark');
                                }}
                            >
                                {settings.theme === 'dark' ? 'ON' : 'OFF'}
                            </button>
                        </div>

                        <div className="setting-row toggle-row">
                            <div>
                                <label>AI Suggestions</label>
                                <span className="setting-desc">Show AI-powered task recommendations</span>
                            </div>
                            <button
                                className={`toggle-btn ${settings.aiSuggestions ? 'active' : ''}`}
                                onClick={() => handleChange('aiSuggestions', !settings.aiSuggestions)}
                            >
                                {settings.aiSuggestions ? 'ON' : 'OFF'}
                            </button>
                        </div>

                        <div className="setting-row toggle-row">
                            <div>
                                <label>Notifications</label>
                                <span className="setting-desc">Browser notifications for reminders</span>
                            </div>
                            <button
                                className={`toggle-btn ${settings.notifications ? 'active' : ''}`}
                                onClick={() => handleChange('notifications', !settings.notifications)}
                            >
                                {settings.notifications ? 'ON' : 'OFF'}
                            </button>
                        </div>

                        <div className="setting-row toggle-row">
                            <div>
                                <label>Compact View</label>
                                <span className="setting-desc">Denser task list layout</span>
                            </div>
                            <button
                                className={`toggle-btn ${settings.compactView ? 'active' : ''}`}
                                onClick={() => handleChange('compactView', !settings.compactView)}
                            >
                                {settings.compactView ? 'ON' : 'OFF'}
                            </button>
                        </div>
                    </section>

                    {/* Data Section */}
                    <section className="settings-section">
                        <h3 className="section-label">DATA</h3>
                        <div className="setting-row">
                            <button className="btn-secondary" onClick={handleExportData}>
                                EXPORT SETTINGS
                            </button>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section className="settings-section danger-zone">
                        <h3 className="section-label">ACCOUNT</h3>
                        <div className="setting-row">
                            <button className="btn-danger" onClick={onLogout}>
                                LOGOUT
                            </button>
                        </div>
                    </section>
                </div>

                <footer className="settings-footer">
                    {message && <span className="save-message">{message}</span>}
                    <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default Settings;
