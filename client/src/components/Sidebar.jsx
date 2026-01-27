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
        >
            <div className="sidebar-logo">
                <div className="logo-icon">S</div>
                <span className="logo-text">Smart Todo.</span>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item, index) => (
                    <div key={index} className={`nav-item ${item.active ? 'active' : ''}`}>
                        <div className="nav-icon">{item.icon}</div>
                        <span className="nav-label">{item.label}</span>
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer" onClick={onLogout}>
                <div className="nav-icon"><FaSignOutAlt /></div>
                <span className="nav-label">Logout</span>
            </div>
        </aside>
    );
};

export default Sidebar;
