import React from 'react';
import { FaBell, FaCloudSun } from 'react-icons/fa';
import './FocusBar.css';

const FocusBar = ({ user, taskCount }) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="focus-bar">
            <div className="focus-left">
                <h2 className="focus-greeting">{getGreeting()}, {user?.name || 'Bibek'}.</h2>
                <p className="focus-status">{taskCount} tasks remaining today.</p>
            </div>

            <div className="focus-right">
                <div className="weather-widget">
                    <FaCloudSun size={16} />
                    <span>72°F</span>
                </div>

                <div className="focus-actions">
                    <button className="icon-btn" aria-label="Notifications">
                        <FaBell size={16} />
                    </button>

                    <div className="user-profile-mini">
                        {user?.name ? user.name[0].toUpperCase() : 'B'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FocusBar;
