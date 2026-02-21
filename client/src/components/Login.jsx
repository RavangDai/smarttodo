import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import InteractiveAvatar from './InteractiveAvatar';
import LoginBackground3D from './LoginBackground3D';
import './Login.css';

const Login = ({ onLogin, onRegister, onNavigatePricing, error, isLoading }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Server wake-up state
    const [serverReady, setServerReady] = useState(false);
    const [serverStatus, setServerStatus] = useState('connecting');
    const pendingSubmitRef = useRef(null);

    // Interaction State
    const [avatarMode, setAvatarMode] = useState('idle'); // 'idle', 'email', 'password'
    const [terminalText, setTerminalText] = useState('');
    const [targetText, setTargetText] = useState("System optimized. Ready for input.");

    // Simple, robust typing effect
    useEffect(() => {
        let currentText = '';
        let currentIndex = 0;

        const typeChar = () => {
            if (currentIndex < targetText.length) {
                currentText += targetText[currentIndex];
                setTerminalText(currentText);
                currentIndex++;
                setTimeout(typeChar, 30 + Math.random() * 20); // Slight random variation for realism
            }
        };

        setTerminalText(''); // Clear on new target
        const timeoutId = setTimeout(typeChar, 100); // Start after slight delay

        return () => clearTimeout(timeoutId);
    }, [targetText]);

    // Update text based on mode
    useEffect(() => {
        switch (avatarMode) {
            case 'email':
                setTargetText("Monitoring identity input...");
                break;
            case 'password':
                setTargetText("Privacy protocols engaged. Visual sensors disabled.");
                break;
            default:
                setTargetText("System optimized. Scanning for user interaction.");
        }
    }, [avatarMode]);

    // ─── SERVER PRE-WARM & KEEP-ALIVE ───
    useEffect(() => {
        let retries = 0;
        const maxRetries = 10;
        let retryTimeout;
        let alive = true;

        const pingServer = async () => {
            try {
                setServerStatus('connecting');
                await axios.get('/ping');
                if (alive) {
                    setServerReady(true);
                    setServerStatus('online');
                }
            } catch {
                if (alive && retries < maxRetries) {
                    retries++;
                    setServerStatus('retrying');
                    retryTimeout = setTimeout(pingServer, 3000);
                } else if (alive) {
                    setServerStatus('failed');
                }
            }
        };

        pingServer();

        // Keep-alive: ping every 4 minutes to prevent Render from sleeping
        const keepAlive = setInterval(() => {
            axios.get('/ping').catch(() => { });
        }, 4 * 60 * 1000);

        return () => {
            alive = false;
            clearTimeout(retryTimeout);
            clearInterval(keepAlive);
        };
    }, []);

    // Auto-submit when server becomes ready and a submit was pending
    useEffect(() => {
        if (serverReady && pendingSubmitRef.current) {
            const { submitEmail, submitPassword, submitIsRegistering } = pendingSubmitRef.current;
            pendingSubmitRef.current = null;
            if (submitIsRegistering) {
                onRegister(submitEmail, submitPassword);
            } else {
                onLogin(submitEmail, submitPassword);
            }
        }
    }, [serverReady]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!serverReady) {
            // Queue the submit and wait for server to be ready
            pendingSubmitRef.current = {
                submitEmail: email,
                submitPassword: password,
                submitIsRegistering: isRegistering,
            };
            setServerStatus('waking');
            return;
        }
        if (isRegistering) {
            onRegister(email, password);
        } else {
            onLogin(email, password);
        }
    };

    return (
        <div className="cyber-login-container">
            <div className="cyber-grid-bg" />
            <LoginBackground3D />

            {/* Server wake-up overlay */}
            {(serverStatus === 'waking' || (pendingSubmitRef.current && !serverReady)) && (
                <div className="server-wake-overlay">
                    <div className="wake-content">
                        <div className="wake-spinner" />
                        <p className="wake-status-text">Waking up the server&hellip;</p>
                        <p className="wake-sub-text">Free-tier servers sleep after inactivity. This takes 15–30 s.</p>
                    </div>
                </div>
            )}


            <div className="cyber-split">
                {/* LEFT PANEL */}
                <div className="cyber-panel-left hidden lg:flex">
                    <div className="flex flex-col items-center">
                        <h1 className="cyber-logo text-6xl">KaryaAI</h1>
                        <p className="cyber-tagline">INTELLIGENT SIMPLICITY</p>

                        <div className="my-12">
                            <InteractiveAvatar mode={avatarMode} />
                        </div>

                        <div className="cyber-terminal">
                            <div className="cyber-terminal-header">
                                <span>SYSTEM STATUS</span>
                                <span>•••</span>
                            </div>
                            <p className="cyber-terminal-text h-12">
                                &gt; {terminalText}<span className="cursor-blink" />
                            </p>
                        </div>
                    </div>
                </div>

                {/* DIVIDER */}
                <div className="cyber-divider hidden lg:block" />

                {/* RIGHT PANEL */}
                <div className="cyber-panel-right">
                    <div className="corner-bracket" />

                    <div className="cyber-form-container">
                        <div className="cyber-heading-row">
                            <h2 className="cyber-heading">
                                {isRegistering ? 'Initialize' : 'Welcome back'}
                            </h2>
                            <span className={`server-status-badge ${serverStatus}`}>
                                <span className="status-dot" />
                                {serverStatus === 'online' ? 'Server Online' : serverStatus === 'connecting' || serverStatus === 'retrying' ? 'Connecting…' : serverStatus === 'waking' ? 'Waking…' : 'Offline'}
                            </span>
                        </div>
                        <p className="cyber-subheading">
                            {isRegistering ? 'Begin system sequence.' : 'Sign in to continue to your tasks.'}
                        </p>

                        {error && (
                            <div className="mb-6 p-3 bg-red-900/20 border border-red-900/50 text-red-400 text-sm rounded font-mono">
                                &gt; ERROR: {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="cyber-input-group">
                                <label className="cyber-label">EMAIL COORDINATES</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onFocus={() => setAvatarMode('email')}
                                    onBlur={() => setAvatarMode('idle')}
                                    placeholder="Enter connection ID"
                                    className="cyber-input"
                                    required
                                />
                            </div>

                            <div className="cyber-input-group">
                                <label className="cyber-label">PASSCODE</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        onFocus={() => setAvatarMode('password')}
                                        onBlur={() => setAvatarMode('idle')}
                                        placeholder="Enter secure key"
                                        className="cyber-input pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors text-xs uppercase"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading} className="cyber-btn">
                                {isLoading ? 'PROCESSING...' : (isRegistering ? 'INITIALIZE SYSTEM' : 'SIGN IN')}
                                <ArrowRight size={18} />
                            </button>
                        </form>

                        <div className="mt-8 flex justify-between items-center text-sm font-mono">
                            <span className="text-gray-600">New to KaryaAI?</span>
                            <button
                                onClick={() => setIsRegistering(!isRegistering)}
                                className="cyber-link uppercase tracking-wider"
                            >
                                {isRegistering ? 'Log In' : 'Create Account'}
                            </button>
                        </div>

                        <div className="mt-4 flex justify-center text-sm font-mono border-t border-white/10 pt-4">
                            <button
                                type="button"
                                onClick={onNavigatePricing}
                                className="cyber-link uppercase tracking-wider text-xs"
                                style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                            >
                                View Subscription Plans
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
