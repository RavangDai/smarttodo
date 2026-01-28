import React, { useState } from 'react';
import { FaListUl, FaChartBar, FaBullseye, FaCog, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = ({ onLogout }) => {
    const [isHovered, setIsHovered] = useState(false);

    const navItems = [
        { icon: <FaListUl />, label: 'Tasks', active: true },
        { icon: <FaChartBar />, label: 'Stats' },
        { icon: <FaBullseye />, label: 'Goals' },
        { icon: <FaCog />, label: 'Settings' },
    ];

    return (
        <aside
            className={`sidebar ${isHovered ? 'expanded' : 'collapsed'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            role="navigation"
            aria-label="Main navigation"
        >
            <div className="sidebar-logo">
                <img src="/logo.png" alt="SmartTodo Logo" className="sidebar-logo-img" />
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item, index) => (
                    <div
                        key={index}
                        className={`nav-item ${item.active ? 'active' : ''}`}
                        role="button"
                        tabIndex={0}
                        aria-current={item.active ? 'page' : undefined}
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <div className="nav-icon" aria-hidden="true">{item.icon}</div>
                        <span className="nav-label">{item.label}</span>
                    </div>
                ))}
            </nav>

            <div
                className="sidebar-footer"
                onClick={onLogout}
                role="button"
                tabIndex={0}
                aria-label="Logout"
            >
                <div className="nav-icon" aria-hidden="true"><FaSignOutAlt /></div>
                <span className="nav-label">Logout</span>
            </div>
        </aside>
    );
};

export default Sidebar;
