import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import BudgetChart from './BudgetChart';
import SchedulerWidget from './SchedulerWidget';
import './ChatPanel.css';

const SpatialChatInterface = ({ tasks, user }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'ai',
            content: `Hello! I'm KaryaAI, your spatial intelligence assistant. I'm designed with a professional-grade interface that emphasizes clarity, precision, and sophisticated interaction patterns. How may I assist you today?`,
            timestamp: new Date().toLocaleTimeString()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = {
            id: Date.now(),
            role: 'user',
            content: inputValue,
            timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const res = await axios.post('/api/ai/chat', {
                message: userMsg.content,
                history: history,
                tasks: tasks,
                userContext: { currentTime: new Date().toLocaleTimeString() }
            }, { headers: { 'x-auth-token': localStorage.getItem('token') } });

            let aiContent = res.data.reply;
            let msgType = 'text';
            let msgData = null;

            try {
                if (aiContent.trim().startsWith('{') && aiContent.includes('"type"')) {
                    const parsed = JSON.parse(aiContent);
                    if (parsed.type && parsed.data) {
                        msgType = parsed.type;
                        msgData = parsed.data;
                        aiContent = parsed.content || 'Processed.';
                    }
                }
            } catch (e) { }

            const aiMsg = {
                id: Date.now() + 1,
                role: 'ai',
                content: aiContent,
                type: msgType,
                data: msgData,
                timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', content: "Connection interrupted.", timestamp: new Date().toLocaleTimeString() }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="spatial-container">
            <div className="ambient-bg"></div>
            <div className="noise-overlay"></div>

            {/* Top Bar */}
            <div className="top-bar">
                <div className="session-info">
                    <div className="session-title">Conversation</div>
                    <div className="session-meta">Session ID: {user?.username?.substring(0, 4).toUpperCase() || 'USER'}-{Math.floor(Math.random() * 1000)} • Active</div>
                </div>
                <div className="actions-cluster">
                    <button className="action-btn">
                        <span>📎</span> Attach
                    </button>
                    <button className="action-btn">
                        <span>⋯</span>
                    </button>
                </div>
            </div>

            {/* Chat Canvas */}
            <div className="chat-canvas" ref={scrollRef}>
                <AnimatePresence mode="popLayout">
                    {messages.map((msg, i) => (
                        <motion.div
                            layout
                            key={msg.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
                            className={`message-block ${msg.role === 'ai' ? 'ai' : 'user'}`}
                        >
                            <div className="message-header">
                                <div className="avatar-frame">{msg.role === 'ai' ? '⚡' : '👤'}</div>
                                <div className="sender-data">
                                    <div className="sender-name">{msg.role === 'ai' ? 'KaryaAI Assistant' : 'You'}</div>
                                    <div className="message-timestamp">{msg.timestamp}</div>
                                </div>
                                {msg.role === 'ai' && (
                                    <div className="confidence-indicator">
                                        <div className="confidence-bar active"></div>
                                        <div className="confidence-bar active"></div>
                                        <div className="confidence-bar active"></div>
                                        <div className="confidence-bar"></div>
                                    </div>
                                )}
                            </div>

                            <div className="message-content">
                                {msg.type === 'budget' ? (
                                    <div className="visual-frame w-full">
                                        <BudgetChart data={msg.data} />
                                    </div>
                                ) : msg.type === 'schedule' ? (
                                    <div className="visual-frame pointer-events-auto">
                                        <SchedulerWidget data={msg.data} onSchedule={() => { }} />
                                    </div>
                                ) : (
                                    msg.content
                                )}
                            </div>

                            <div className="message-actions">
                                <button className="message-action">{msg.role === 'user' ? 'Edit' : 'Copy'}</button>
                                <button className="message-action">{msg.role === 'user' ? 'Delete' : 'Regenerate'}</button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="thinking-block"
                    >
                        <div className="message-header">
                            <div className="avatar-frame">⚡</div>
                            <div className="sender-data">
                                <div className="sender-name">KaryaAI Assistant</div>
                                <div className="message-timestamp">Now</div>
                            </div>
                        </div>
                        <div className="thinking-content">
                            <span className="thinking-text">Processing your request</span>
                            <div className="thinking-dots">
                                <div className="thinking-dot"></div>
                                <div className="thinking-dot"></div>
                                <div className="thinking-dot"></div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="input-area">
                <form className="input-container" onSubmit={handleSend}>
                    <input
                        className="input-field"
                        placeholder="Type your message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <div className="input-controls">
                        <button type="button" className="input-btn">📎</button>
                        <button type="button" className="input-btn">🎤</button>
                        <button type="submit" className="input-btn send-btn" disabled={!inputValue.trim()}>↑</button>
                    </div>
                </form>
                <div className="input-meta">
                    <span>Press <span className="shortcut">Enter</span> to send</span>
                    <span>AI Model: GPT-4 • Response time: ~1.2s</span>
                </div>
            </div>
        </div>
    );
};

export default SpatialChatInterface;
