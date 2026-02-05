import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaRobot } from 'react-icons/fa';
import './ChatPanel.css';

const ChatPanel = ({ tasks, user }) => {
    const [messages, setMessages] = useState([
        { id: 1, role: 'ai', content: `Hello ${user?.name || 'Chief'}! I'm ready to help you plan.` }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = { id: Date.now(), role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            // Prepare history for API (exclude ID, just role/content)
            const history = messages.map(m => ({ role: m.role, content: m.content }));

            const res = await axios.post('/api/ai/chat', {
                message: userMsg.content,
                history: history,
                tasks: tasks, // Send current tasks for context
                userContext: { currentTime: new Date().toLocaleTimeString() }
            }, { headers: { 'x-auth-token': localStorage.getItem('token') } });

            const aiMsg = { id: Date.now() + 1, role: 'ai', content: res.data.reply };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', content: "I'm having trouble connecting to my brain. Try again?" }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="chat-panel">
            <div className="chat-messages">
                {messages.map((msg) => (
                    <div key={msg.id} className={`chat-bubble ${msg.role}`}>
                        {msg.role === 'ai' && <div className="chat-avatar"><FaRobot /></div>}
                        <div className="bubble-content">
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="chat-bubble ai typing">
                        <div className="chat-avatar"><FaRobot /></div>
                        <div className="typing-dots">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSend}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask KaryaAI..."
                    className="chat-input"
                />
                <button type="submit" className="chat-send-btn" disabled={!inputValue.trim() || isTyping}>
                    <FaPaperPlane />
                </button>
            </form>
        </div>
    );
};

export default ChatPanel;
