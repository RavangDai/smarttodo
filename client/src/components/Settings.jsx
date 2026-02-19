import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { FaTimes, FaMoon, FaSun, FaMagic, FaBell, FaCompress, FaVolumeUp, FaDownload, FaSignOutAlt, FaUser, FaSave, FaCheck } from 'react-icons/fa';
import axios from 'axios';

const Settings = ({ onClose, onLogout, user, onUpdateUser }) => {
    const { settings, updateSettings } = useSettings();
    const [isExporting, setIsExporting] = useState(false);

    // Profile State
    const [displayName, setDisplayName] = useState(user?.name || settings.name || '');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Sync local state if user prop updates
    React.useEffect(() => {
        if (user?.name) setDisplayName(user.name);
    }, [user]);

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/users/profile', { name: displayName }, {
                headers: { 'x-auth-token': token }
            });

            // Update context/global state
            updateSettings('name', displayName);
            if (onUpdateUser) onUpdateUser();

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (err) {
            console.error("Failed to update profile", err);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleExportData = () => {
        setIsExporting(true);
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
        setTimeout(() => setIsExporting(false), 800);
    };

    // Animation variants
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    const panelVariants = {
        hidden: { y: 50, opacity: 0, scale: 0.95 },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: { type: 'spring', damping: 25, stiffness: 300 }
        },
        exit: { y: 20, opacity: 0, scale: 0.95 }
    };

    const Toggle = ({ label, desc, value, onChange, icon: Icon }) => (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-secondary">
                    <Icon size={18} />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-white">{label}</h3>
                    <p className="text-xs text-secondary mt-0.5">{desc}</p>
                </div>
            </div>
            <button
                onClick={() => onChange(!value)}
                className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${value ? 'bg-primary' : 'bg-white/10'}`}
            >
                <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${value ? 'left-7' : 'left-1'}`}
                />
            </button>
        </div>
    );

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            onClick={onClose}
        >
            <motion.div
                className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                variants={panelVariants}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-space font-bold tracking-tight text-white">SETTINGS</h2>
                        <span className="text-xs text-secondary">Customize your experience</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-secondary hover:text-white transition-colors"
                    >
                        <FaTimes size={14} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">

                    {/* Profile Section */}
                    <div className="space-y-4">
                        <label className="text-xs font-space font-bold text-secondary uppercase tracking-wider">Profile</label>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-secondary mb-1.5 block">Display Name</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={e => setDisplayName(e.target.value)}
                                            placeholder="Your Name"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all pl-10"
                                        />
                                        <FaUser className="absolute left-3.5 top-3 text-secondary" size={12} />
                                    </div>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSavingProfile || displayName === user?.name}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${saveSuccess
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'
                                            }`}
                                    >
                                        {saveSuccess ? <FaCheck size={14} /> : <FaSave size={14} />}
                                        {saveSuccess ? 'Saved' : 'Save'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-secondary mb-1.5 block">Email</label>
                                <input
                                    type="email"
                                    value={settings.email}
                                    disabled
                                    className="w-full bg-white/5 border border-transparent rounded-lg px-4 py-2.5 text-sm text-secondary cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preferences Section */}
                    <div className="space-y-4">
                        <label className="text-xs font-space font-bold text-secondary uppercase tracking-wider">Preferences</label>
                        <div className="space-y-3">
                            <Toggle
                                label="Dark Mode"
                                desc="Brutalist dark theme"
                                value={settings.theme === 'dark'}
                                onChange={() => updateSettings('theme', settings.theme === 'dark' ? 'light' : 'dark')}
                                icon={settings.theme === 'dark' ? FaMoon : FaSun}
                            />
                            <Toggle
                                label="AI Suggestions"
                                desc="Smart task recommendations"
                                value={settings.aiSuggestions}
                                onChange={v => updateSettings('aiSuggestions', v)}
                                icon={FaMagic}
                            />
                            <Toggle
                                label="Notifications"
                                desc="Browser alerts for tasks"
                                value={settings.notifications}
                                onChange={v => updateSettings('notifications', v)}
                                icon={FaBell}
                            />
                            <Toggle
                                label="Compact View"
                                desc="Denser list layout"
                                value={settings.compactView}
                                onChange={v => updateSettings('compactView', v)}
                                icon={FaCompress}
                            />
                            <Toggle
                                label="Sound Effects"
                                desc="UI interaction sounds"
                                value={settings.soundEnabled}
                                onChange={v => updateSettings('soundEnabled', v)}
                                icon={FaVolumeUp}
                            />
                        </div>
                    </div>

                    {/* Data Section */}
                    <div className="space-y-4">
                        <label className="text-xs font-space font-bold text-secondary uppercase tracking-wider">Data & Privacy</label>
                        <button
                            onClick={handleExportData}
                            className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-colors">
                                    <FaDownload size={16} />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-sm font-medium text-white">Export Data</h3>
                                    <p className="text-xs text-secondary mt-0.5">Download your settings JSON</p>
                                </div>
                            </div>
                            <span className="text-xs text-blue-400 font-medium group-hover:underline">
                                {isExporting ? 'Exporting...' : 'Export'}
                            </span>
                        </button>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-4 border-t border-white/5">
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all text-sm font-medium"
                        >
                            <FaSignOutAlt size={14} />
                            Log Out
                        </button>
                    </div>

                </div>
            </motion.div>
        </motion.div>
    );
};

export default Settings;
