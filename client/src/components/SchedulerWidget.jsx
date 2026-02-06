import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaCheck } from 'react-icons/fa';

const SchedulerWidget = ({ data, onSchedule }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    // Mock dates - usually would come from data or be generated
    const dates = [
        { day: 'Mon', date: '12', available: true },
        { day: 'Tue', date: '13', available: true },
        { day: 'Wed', date: '14', available: false }, // Busy
        { day: 'Thu', date: '15', available: true },
        { day: 'Fri', date: '16', available: true },
    ];

    const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];

    const handleConfirm = () => {
        if (selectedDate && selectedTime) {
            if (onSchedule) onSchedule({ date: selectedDate, time: selectedTime });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/90 backdrop-blur-lg border border-gray-700 rounded-xl p-4 w-72 shadow-2xl overflow-hidden"
        >
            <div className="flex items-center gap-2 mb-4 text-blue-400">
                <FaCalendarAlt />
                <h3 className="text-lg font-semibold text-white">Schedule Meeting</h3>
            </div>

            {/* Date Selection */}
            <div className="flex justify-between mb-4">
                {dates.map((d, i) => (
                    <button
                        key={i}
                        disabled={!d.available}
                        onClick={() => setSelectedDate(d.date)}
                        className={`flex flex-col items-center justify-center w-10 h-12 rounded-lg transition-all ${!d.available ? 'opacity-30 cursor-not-allowed' : 'hover:bg-blue-500/20'
                            } ${selectedDate === d.date ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                    >
                        <span className="text-xs">{d.day}</span>
                        <span className="font-bold">{d.date}</span>
                    </button>
                ))}
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                {times.map((t) => (
                    <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`py-1 px-2 rounded-md text-sm transition-colors flex items-center justify-center gap-1 ${selectedTime === t ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        <FaClock size={10} />
                        {t}
                    </button>
                ))}
            </div>

            {/* Confirm Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirm}
                disabled={!selectedDate || !selectedTime}
                className={`w-full py-2 rounded-lg font-bold flex items-center justify-center gap-2 ${selectedDate && selectedTime
                        ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
            >
                <FaCheck />
                Confirm
            </motion.button>

        </motion.div>
    );
};

export default SchedulerWidget;
