import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Sparkles, CreditCard, X, ShieldCheck } from 'lucide-react';
import InteractiveAvatar from './InteractiveAvatar';
import './Pricing.css';

const Pricing = ({ onBack }) => {
    const [avatarMode, setAvatarMode] = useState('idle');

    const handlePlanHover = (planName) => {
        setAvatarMode(`plan-${planName}`);
    };

    const handlePlanLeave = () => {
        setAvatarMode('idle');
    };

    // --- Payment Modal State ---
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Simulated Checkout
    const handleCheckout = (plan) => {
        if (plan.price === 'Free') return; // Basic plan logic could route elsewhere
        setSelectedPlan(plan);
        setPaymentSuccess(false);
        setIsProcessing(false);
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        setIsProcessing(true);
        // Simulate network request
        setTimeout(() => {
            setIsProcessing(false);
            setPaymentSuccess(true);
        }, 1500);
    };

    const closePaymentModal = () => {
        setSelectedPlan(null);
        setPaymentSuccess(false);
        setIsProcessing(false);
    };

    const commonFeatures = [
        "Unlimited Projects",
        "Advanced AI Auto-Scheduling",
        "Custom Smart Contexts",
        "Full History Access",
        "Priority Support",
        "Team Collaboration"
    ];

    const plans = [
        {
            name: "Basic",
            price: "Free",
            description: "Core features for personal productivity.",
            features: commonFeatures,
            buttonText: "Get Started",
            highlighted: false
        },
        {
            name: "Pro",
            price: "$1",
            period: "/month",
            description: "Advanced capabilities for power users.",
            features: commonFeatures,
            buttonText: "Upgrade to Pro",
            highlighted: true
        },
        {
            name: "Enterprise",
            price: "$5",
            period: "/month",
            description: "Complete solution for distributed teams.",
            features: commonFeatures,
            buttonText: "Contact Sales",
            highlighted: false
        }
    ];

    return (
        <div className="cyber-pricing-container">
            <div className="cyber-grid-bg" />

            {/* Header / Navigation */}
            <div className="pricing-nav">
                <button onClick={onBack} className="cyber-back-btn">
                    <ArrowLeft size={18} className="mr-2" />
                    <span>BACK TO SYSTEMS</span>
                </button>
            </div>

            <div className="pricing-content">
                <div className="pricing-header">
                    <h1 className="cyber-logo text-5xl mb-2">Upgrade Access</h1>
                    <p className="cyber-tagline text-lg mb-8">UNLOCK TRUE INTELLIGENCE</p>

                    <div className="pricing-avatar-container mb-12 flex justify-center transform scale-75 origin-top">
                        <InteractiveAvatar mode={avatarMode} />
                    </div>
                </div>

                <div className="pricing-cards-container">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`pricing-card ${plan.highlighted ? 'highlighted' : ''}`}
                            onMouseEnter={() => handlePlanHover(plan.name.toLowerCase())}
                            onMouseLeave={handlePlanLeave}
                        >
                            {plan.highlighted && (
                                <div className="pricing-badge">
                                    <Sparkles size={14} className="mr-1" />
                                    MOST POPULAR
                                </div>
                            )}

                            <h3 className="plan-name">{plan.name}</h3>
                            <div className="plan-price-container">
                                <span className="plan-price">{plan.price}</span>
                                {plan.period && <span className="plan-period">{plan.period}</span>}
                            </div>
                            <p className="plan-description">{plan.description}</p>

                            <ul className="plan-features">
                                {plan.features.map((feature, fIndex) => (
                                    <li key={fIndex}>
                                        <Check size={16} className="feature-icon" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`plan-action-btn ${plan.highlighted ? 'primary' : 'secondary'}`}
                                onClick={() => handleCheckout(plan)}
                            >
                                {plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- PAYMENT MODAL OVERLAY --- */}
            {selectedPlan && (
                <div className="payment-modal-overlay">
                    <div className="payment-modal-container">
                        <button className="payment-close-btn" onClick={closePaymentModal}>
                            <X size={16} />
                        </button>

                        {!paymentSuccess ? (
                            <>
                                <div className="payment-modal-header">
                                    <h2>Checkout</h2>
                                    <p>Subscribe to {selectedPlan.name} Plan - {selectedPlan.price}{selectedPlan.period}</p>
                                </div>

                                <form className="payment-form" onSubmit={handlePaymentSubmit}>
                                    <div>
                                        <label className="payment-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="payment-input"
                                            placeholder="you@karya.ai"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="payment-label">Card Information</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="payment-input pl-10"
                                                placeholder="0000 0000 0000 0000"
                                                maxLength="19"
                                                required
                                            />
                                            <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                        </div>
                                    </div>

                                    <div className="form-group-row">
                                        <div>
                                            <label className="payment-label">Expiry Date</label>
                                            <input
                                                type="text"
                                                className="payment-input"
                                                placeholder="MM/YY"
                                                maxLength="5"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="payment-label">CVC</label>
                                            <input
                                                type="text"
                                                className="payment-input"
                                                placeholder="123"
                                                maxLength="4"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="payment-label">Name on Card</label>
                                        <input
                                            type="text"
                                            className="payment-input"
                                            placeholder="Karya User"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="payment-submit-btn"
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? 'Processing Securely...' : `Pay ${selectedPlan.price}`}
                                    </button>

                                    <p className="text-center text-xs text-gray-500 mt-2 flex justify-center items-center gap-1 font-mono uppercase tracking-widest mt-4">
                                        <ShieldCheck size={12} /> Secure encrypted transaction
                                    </p>
                                </form>
                            </>
                        ) : (
                            <div className="payment-success-state">
                                <div className="success-icon-container">
                                    <Check size={40} />
                                </div>
                                <h2 className="success-title">Payment Successful</h2>
                                <p className="success-message">Your account has been upgraded to {selectedPlan.name}. Welcome to the next level.</p>
                                <button className="plan-action-btn primary" onClick={closePaymentModal}>
                                    Return to Dashboard
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pricing;
