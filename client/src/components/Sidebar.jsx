import React, { useState } from 'react';
import {
    Inbox, Calendar, PieChart, Settings,
    ChevronLeft, ChevronRight, Layers,
    LogOut,
    CheckSquare
} from 'lucide-react';
import CustomIcon from './ui/CustomIcon';

// Note: We are now using Tailwind, so Sidebar.css is no longer needed for layout, 
// but we might keep it empty or remove the import if we are sure.
// import './Sidebar.css'; 

const Sidebar = ({ activeView, onNavigate, onLogout, onOpenSettings }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const mainNavItems = [
        { id: 'tasks', label: 'Tasks', icon: CheckSquare, color: 'text-primary' },
        { id: 'projects', label: 'Projects', icon: Layers, color: 'text-blue-400' },
        { id: 'insights', label: 'Insights', icon: PieChart, color: 'text-purple-400' },
    ];

    return (
        <aside
            className={`
                h-screen sticky top-0 left-0
                bg-black/40 backdrop-blur-xl border-r border-white/5
                transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]
                flex flex-col
                ${isCollapsed ? 'w-20' : 'w-64'}
                relative z-50
            `}
        >
            {/* ── HEADER ── */}
            <div className={`
                h-20 flex items-center 
                ${isCollapsed ? 'justify-center' : 'px-6 gap-3'}
                border-b border-white/5
            `}>
                <div className="relative group cursor-pointer">
                    {/* Logo Placeholder with Glow */}
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                        <img src="/karyalogo.png" alt="Karya Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(253,151,31,0.5)] transition-transform group-hover:scale-110" />
                    </div>
                </div>

                {!isCollapsed && (
                    <span className="font-display font-bold text-xl tracking-tight text-white animate-fade-in">
                        Karya<span className="text-primary">AI</span>
                    </span>
                )}
            </div>

            {/* ── NAVIGATION ── */}
            <nav className="flex-1 py-8 px-3 flex flex-col gap-2">
                {mainNavItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`
                            w-full flex items-center gap-3 p-3 rounded-xl
                            transition-all duration-200 group
                            ${activeView === item.id
                                ? 'bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(255,107,53,0.1)]'
                                : 'text-secondary hover:bg-white/5 hover:text-white'
                            }
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                        title={isCollapsed ? item.label : ''}
                    >
                        <CustomIcon
                            icon={item.icon}
                            size={20}
                            color={activeView === item.id ? item.color : 'text-current'}
                            glow={activeView === item.id}
                        />

                        {!isCollapsed && (
                            <span className="font-medium text-[15px] animate-fade-in">
                                {item.label}
                            </span>
                        )}

                        {/* Active Indicator Line */}
                        {activeView === item.id && !isCollapsed && (
                            <div className="ml-auto w-1 h-1 rounded-full bg-primary shadow-[0_0_10px_currentColor]" />
                        )}
                    </button>
                ))}
            </nav>

            {/* ── FOOTER ACTIONS ── */}
            <div className="p-3 border-t border-white/5 flex flex-col gap-1">
                <button
                    onClick={onOpenSettings}
                    className={`
                        w-full flex items-center gap-3 p-3 rounded-xl
                        text-secondary hover:bg-white/5 hover:text-white
                        transition-colors group
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title="Settings"
                >
                    <CustomIcon icon={Settings} size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                    {!isCollapsed && <span className="font-medium text-[15px]">Settings</span>}
                </button>

                <button
                    onClick={onLogout}
                    className={`
                        w-full flex items-center gap-3 p-3 rounded-xl
                        text-secondary hover:bg-red-500/10 hover:text-red-400
                        transition-colors group
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title="Logout"
                >
                    <CustomIcon icon={LogOut} size={20} color="group-hover:text-red-400" />
                    {!isCollapsed && <span className="font-medium text-[15px]">Logout</span>}
                </button>
            </div>

            {/* ── COLLAPSE TOGGLE ── */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="
                    absolute -right-3 top-24
                    w-6 h-6 rounded-full
                    bg-surface border border-white/10
                    flex items-center justify-center
                    text-secondary hover:text-white hover:bg-primary hover:border-primary
                    transition-all shadow-lg
                    z-50
                "
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
        </aside>
    );
};

export default Sidebar;
