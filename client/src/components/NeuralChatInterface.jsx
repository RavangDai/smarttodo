import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import BudgetChart from './BudgetChart';
import SchedulerWidget from './SchedulerWidget';
import './ChatPanel.css';

// --- Neural Network Animation Hook ---
const useNeuralNetwork = (canvasRef) => {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            if (canvas.parentElement) {
                canvas.width = canvas.parentElement.offsetWidth;
                canvas.height = canvas.parentElement.offsetHeight;
            }
        };
        window.addEventListener('resize', resize);
        resize();

        class Neuron {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(253, 151, 31, 0.6)'; // Monokai Orange
                ctx.fill();
            }
        }

        const neurons = Array.from({ length: 60 }, () => new Neuron());

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear instead of fill for transparency

            neurons.forEach((neuron, i) => {
                neuron.update();
                neuron.draw();
                neurons.slice(i + 1).forEach(other => {
                    const dx = neuron.x - other.x;
                    const dy = neuron.y - other.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.moveTo(neuron.x, neuron.y);
                        ctx.lineTo(other.x, other.y);
                        // Monokai Orange Line
                        ctx.strokeStyle = `rgba(253, 151, 31, ${0.15 * (1 - distance / 120)})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                });
            });
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);
};

const NeuralChatInterface = ({ tasks, user }) => {
    const canvasRef = useRef(null);
    useNeuralNetwork(canvasRef);


    const [messages, setMessages] = useState([
        { id: 1, role: 'ai', content: `Welcome to the organic intelligence layer. I'm KaryaAI, a living system that grows with your cognitive patterns.` }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);
    const speechRecognitionRef = useRef(null);

    // --- Voice Logic ---
    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false; // Stop after one sentence/command
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (transcript) {
                    // Send immediately as voice command
                    sendMessage(`[ACTION: VOICE] ${transcript}`, `"${transcript}"`);
                }
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            speechRecognitionRef.current = recognition;
        }

        return () => {
            if (speechRecognitionRef.current) {
                speechRecognitionRef.current.abort();
            }
            window.speechSynthesis.cancel();
        };
    }, []);

    const toggleVoiceMode = () => {
        if (isVoiceMode) {
            // Turn off
            setIsVoiceMode(false);
            if (speechRecognitionRef.current) speechRecognitionRef.current.stop();
            window.speechSynthesis.cancel();
        } else {
            // Turn on
            setIsVoiceMode(true);
            // Auto start listening
            if (speechRecognitionRef.current) speechRecognitionRef.current.start();
        }
    };

    const speakResponse = (text) => {
        if (!isVoiceMode) return;

        window.speechSynthesis.cancel(); // Stop current
        const utterance = new SpeechSynthesisUtterance(text);
        // Try to select a nice voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.rate = 1.1;
        utterance.pitch = 1.0;

        // When finished, listen again? For now, we rely on user trigger to avoid loops
        utterance.onend = () => {
            // Optional: automatically listen for reply? 
        };

        window.speechSynthesis.speak(utterance);
    };

    // --- Scrolling ---
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isTyping, isVoiceMode]);

    const sendMessage = async (content, displayedContent = null) => {
        if (!content.trim()) return;

        // Optimistic UI
        const userMsg = {
            id: Date.now(),
            role: 'user',
            content: displayedContent || content
        };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));

            const res = await axios.post('/api/ai/chat', {
                message: content,
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
                        aiContent = parsed.content || 'Synapse formed.';
                    }
                }
            } catch (e) { }

            const aiMsg = {
                id: Date.now() + 1,
                role: 'ai',
                content: aiContent,
                type: msgType,
                data: msgData
            };
            setMessages(prev => [...prev, aiMsg]);

            // TTS Trigger
            speakResponse(aiContent);

        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', content: "Neural impulse interrupted." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        sendMessage(inputValue);
    };

    const handleRegenerate = () => {
        sendMessage('[ACTION: REGENERATE]', '↻ Regenerate response');
    };

    // --- Attachment Logic ---
    const handleAttachClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // In a real app, we'd upload here. For now, simulate usage.
        const fileInfo = `[ACTION: ATTACH] Filename: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`;
        sendMessage(fileInfo, `📎 Attached: ${file.name}`);
    };

    return (
        <div className={`spatial-container ${isVoiceMode ? 'voice-mode' : ''}`}>
            {/* Neural Canvas Layer */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
            </div>

            {/* Voice Mode Overlay */}
            <AnimatePresence>
                {isVoiceMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="voice-mode-overlay"
                    >
                        <div className="voice-visualizer">
                            <div className={`voice-ring ${isListening ? 'listening' : 'speaking'}`}></div>
                            <div className="voice-status">
                                {isListening ? "Listening..." : "Processing..."}
                            </div>
                        </div>
                        <div className="voice-transcript-preview">
                            <AnimatePresence>
                                {messages.slice(-1).map(msg => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="audio-msg"
                                    >
                                        {msg.content}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        <button onClick={toggleVoiceMode} className="exit-voice-btn">Exit Voice Mode</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="top-bar">
                <div className="session-info">
                    <div className="logo-neural session-title" style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
                        <span>Karya</span>
                        <span style={{ color: 'var(--accent-orange)' }}>AI</span>
                    </div>
                    <div className="session-meta">Organic Intelligence Layer</div>
                </div>
                <div className="neural-stats actions-cluster">
                    <div className="action-btn">
                        <span style={{ opacity: 0.7 }}>Synapses</span>
                        <span style={{ color: 'var(--accent-orange)' }}>4.2M</span>
                    </div>
                    <div className="action-btn">
                        <div className="pulse-ring" style={{ width: '6px', height: '6px', background: 'var(--accent-blue)', borderRadius: '50%' }}></div>
                        <span style={{ color: 'var(--accent-blue)' }}>98%</span>
                    </div>
                </div>
            </div>

            {/* Chat Flow (Hidden in Voice Mode via CSS or minimized) */}
            <div className="chat-canvas" ref={scrollRef}>
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className={`message-block ${msg.role === 'ai' ? 'ai' : 'user'}`}
                        >
                            <div className="message-header">
                                <div className="avatar-frame">
                                    {msg.role === 'ai' ? '✨' : '👤'}
                                </div>
                                <div className="sender-data">
                                    <span className="sender-name">{msg.role === 'ai' ? 'KaryaAI' : 'You'}</span>
                                    <span className="message-timestamp">
                                        {msg.role === 'ai' ? 'Spatial Reasoning' : 'Direct Intent'} • Now
                                    </span>
                                </div>
                            </div>

                            <div className="message-content">
                                {msg.type === 'budget' ? (
                                    <div className="py-2 w-full"><BudgetChart data={msg.data} /></div>
                                ) : msg.type === 'schedule' ? (
                                    <div className="py-2 pointer-events-auto">
                                        <SchedulerWidget data={msg.data} onSchedule={() => { }} />
                                    </div>
                                ) : (
                                    <div className="markdown-content">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                table: ({ node, ...props }) => <div className="markdown-table-wrapper"><table {...props} /></div>
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                )}

                                {msg.role === 'ai' && (
                                    <div className="message-actions">
                                        <button onClick={handleRegenerate} className="message-action" title="Regenerate Response">
                                            ↻ Regenerate
                                        </button>
                                        <button className="message-action" title="Copy">
                                            ⎘ Copy
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="thinking-block"
                    >
                        <div className="thinking-content">
                            <div className="thinking-dots">
                                <div className="thinking-dot"></div>
                                <div className="thinking-dot"></div>
                                <div className="thinking-dot"></div>
                            </div>
                            <span className="thinking-text">Resolving spatial context...</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="input-area">
                <form className="input-container" onSubmit={handleSend}>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden />

                    <div className="input-controls" style={{ marginLeft: 0, marginRight: '10px' }}>
                        <button type="button" className="input-btn" onClick={handleAttachClick} title="Attach Context">
                            📎
                        </button>
                    </div>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Input command or spatial query..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <div className="input-controls">
                        <button
                            type="button"
                            className={`input-btn ${isVoiceMode ? 'active-voice' : ''}`}
                            onClick={toggleVoiceMode}
                            title="Voice Mode"
                        >
                            {isVoiceMode ? '🔊' : '🎙️'}
                        </button>
                        <button type="submit" className="input-btn send-btn" disabled={!inputValue.trim()}>
                            ⚡
                        </button>
                    </div>
                </form>
                <div className="input-meta">
                    <span>Active Model: Gemini 1.5 Pro</span>
                    <span className="shortcut">Return ⏎</span>
                </div>
            </div>
        </div>
    );
};

export default NeuralChatInterface;
