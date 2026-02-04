import React, { useState } from 'react';
import {
    FaInbox, FaCalendarDay, FaChartPie, FaCog,
    FaChevronLeft, FaChevronRight, FaLayerGroup,
    FaSignOutAlt
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ activeView, onNavigate, onLogout, onOpenSettings }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const mainNavItems = [
        { id: 'tasks', label: 'Tasks', icon: <FaInbox /> },
        { id: 'projects', label: 'Projects', icon: <FaLayerGroup /> },
        { id: 'insights', label: 'Insights', icon: <FaChartPie /> },
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="brand-icon">⚡</div>
                <span className="brand-text">KaryaAI</span>
            </div>

            <nav className="sidebar-nav">
                {mainNavItems.map(item => (
                    <div
                        key={item.id}
                        className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                        onClick={() => onNavigate(item.id)}
                        title={isCollapsed ? item.label : ''}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </div>
                ))}
            </nav>

            <div className="sidebar-bottom-actions">
                <div
                    className="nav-item"
                    onClick={onOpenSettings}
                    title={isCollapsed ? 'Settings' : ''}
                >
                    <span className="nav-icon"><FaCog /></span>
                    <span className="nav-label">Settings</span>
                </div>

                <div
                    className="nav-item logout"
                    onClick={onLogout}
                    title={isCollapsed ? 'Logout' : ''}
                >
                    <span className="nav-icon"><FaSignOutAlt /></span>
                    <span className="nav-label">Logout</span>
                </div>
            </div>

            <div className="sidebar-footer">
                <button
                    className="collapse-btn"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? "Expand" : "Collapse"}
                >
                    {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
