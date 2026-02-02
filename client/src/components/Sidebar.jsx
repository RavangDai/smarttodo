import React from 'react';
import { FaInbox, FaCalendarDay, FaCalendarAlt, FaProjectDiagram, FaChartPie, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = ({ onLogout, currentView, onNavigate }) => {
    const navItems = [
        { icon: <FaInbox size={16} />, label: 'Inbox', id: 'Tasks' },
        { icon: <FaCalendarDay size={16} />, label: 'Today', id: 'Tasks' },
        { icon: <FaCalendarAlt size={16} />, label: 'Upcoming', id: 'Goals' },
        { icon: <FaProjectDiagram size={16} />, label: 'Projects', id: 'Stats' },
        { icon: <FaChartPie size={16} />, label: 'Analytics', id: 'Settings' },
    ];

    return (
        <aside className="sidebar-new" role="navigation" aria-label="Main navigation">
            {/* Logo */}
            <div className="sidebar-brand">
                <img src="/logo.png" alt="SmartTodo" className="sidebar-brand-logo" />
                <span className="sidebar-brand-text">SmartTodo</span>
            </div>

            {/* Navigation */}
            <nav className="sidebar-navigation">
                {navItems.map((item, index) => (
                    <div
                        key={index}
                        className={`sidebar-nav-item ${currentView === item.id ? 'active' : ''}`}
                        onClick={() => onNavigate(item.id)}
                        role="button"
                        tabIndex={0}
                    >
                        <span className="sidebar-nav-icon">{item.icon}</span>
                        <span className="sidebar-nav-label">{item.label}</span>
                    </div>
                ))}
            </nav>

            {/* Logout */}
            <div className="sidebar-logout" onClick={onLogout} role="button" tabIndex={0}>
                <FaSignOutAlt size={16} />
                <span>Logout</span>
            </div>
        </aside>
    );
};

export default Sidebar;
