import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import BudgetChart from './BudgetChart';
import SchedulerWidget from './SchedulerWidget';
import './ChatPanel.css';

const KineticChatInterface = ({ tasks, user }) => {
    const [messages, setMessages] = useState([
        { id: 1, role: 'ai', content: `Neural link established. I exist in holographic space, processing your productivity in multiple dimensions simultaneously.` }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = { id: Date.now(), role: 'user', content: inputValue };
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
                        aiContent = parsed.content || 'Processing request...';
                    }
                }
            } catch (e) {
                // Ignore JSON parse error, treat as text
            }

            const aiMsg = {
                id: Date.now() + 1,
                role: 'ai',
                content: aiContent,
                type: msgType,
                data: msgData
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error(err);
            const errorMsg = { id: Date.now() + 1, role: 'ai', content: "Neural link interrupted. Retrying..." };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const getTimestamp = () => {
        const now = new Date();
        return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    };

    return (
        <div className="holographic-container">
            <div className="holo-grid"></div>
            <div className="scan-lines"></div>

            <div className="data-stream">
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        className="data-particle"
                        style={{
                            left: `${5 + i * 10}%`,
                            animationDelay: `${i * 0.5}s`
                        }}
                    />
                ))}
            </div>
            {/* Background Ambient Mesh */}
            <div className="absolute inset-0 bg-[#1E1E1E]">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-yellow-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="holo-interface-layer">
                <div className="holo-header">
                    <div className="holo-logo">KARYA_AI</div>
                    <div className="system-stats">
                        <div className="stat">
                            <span class="stat-label">NEURAL_LINK</span>
                            <span class="stat-value">ACTIVE</span>
                        </div>
                        <div className="stat">
                            <span class="stat-label">RAM_USAGE</span>
                            <span class="stat-value">24TB</span>
                        </div>
                    </div>
                </div>

                <div className="chat-space">
                    <div ref={scrollRef} className="chat-layers">
                        <AnimatePresence>
                            {messages.map((msg) => (
                                <div key={msg.id} className={`message-layer ${msg.role === 'ai' ? 'ai' : 'user'}`}>
                                    <div className="holo-card">
                                        <div className="message-header">
                                            <div className="avatar-holo">
                                                {msg.role === 'ai' ? '⚡' : '👤'}
                                            </div>
                                            <div className="sender-info">
                                                <div className="sender-name">
                                                    {msg.role === 'ai' ? 'KaryaAI System' : 'User'}
                                                </div>
                                                <div className="timestamp">{getTimestamp()}</div>
                                            </div>
                                        </div>
                                        <div className="message-content">
                                            {msg.type === 'budget' ? (
                                                <div className="w-[450px] max-w-full py-2">
                                                    <BudgetChart data={msg.data} />
                                                </div>
                                            ) : msg.type === 'schedule' ? (
                                                <div className="py-2 pointer-events-auto">
                                                    <SchedulerWidget
                                                        data={msg.data}
                                                        onSchedule={(val) => console.log('Scheduled:', val)}
                                                    />
                                                </div>
                                            ) : (
                                                <p>{msg.content}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </AnimatePresence>
                        {isTyping && (
                            <div className="message-layer ai">
                                <div className="holo-card">
                                    <div className="message-header">
                                        <div className="avatar-holo">⚡</div>
                                        <div className="sender-info">
                                            <div className="sender-name">KaryaAI System</div>
                                        </div>
                                    </div>
                                    <div className="message-content animate-pulse">
                                        Processing neural inputs...
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="input-terminal">
                    <form className="terminal-frame" onSubmit={handleSend}>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Enter neural command..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <button type="submit" className="terminal-btn" disabled={!inputValue.trim()}>
                                <span>⚡</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default KineticChatInterface;
