import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [modalMessage, setModalMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/login', {
                username,
                password
            });
            
            console.log('Login response:', response.data);
            
            if (response.data && response.data.user) {
                onLogin(response.data.user);
            } else {
                setError('Invalid response from server');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Invalid credentials');
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            setModalMessage('Password reset instructions have been sent to your email.');
            setTimeout(() => {
                setShowModal(false);
                setModalMessage('');
                setForgotEmail('');
            }, 3000);
        } catch (error) {
            setModalMessage('Error processing your request. Please try again.');
        }
    };

    return (
        <div className="auth-login-form-container">
            <form onSubmit={handleSubmit} className="auth-login-form">
                {error && (
                    <div className="auth-error-message">
                        {error}
                    </div>
                )}
                <div className="auth-form-group">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="auth-form-input"
                    />
                </div>
                <div className="auth-form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="auth-form-input"
                    />
                </div>
                <button type="submit" className="auth-login-button">Login</button>
                <div className="auth-forgot-password">
                    <button 
                        type="button" 
                        onClick={() => setShowModal(true)}
                        className="auth-forgot-password-link"
                    >
                        Forgot Password?
                    </button>
                </div>
            </form>

            {showModal && (
                <div className="auth-modal-overlay">
                    <div className="auth-modal">
                        <h2>Forgot Password</h2>
                        <button 
                            className="auth-modal-close"
                            onClick={() => {
                                setShowModal(false);
                                setModalMessage('');
                                setForgotEmail('');
                            }}
                        >
                            ×
                        </button>
                        {modalMessage ? (
                            <p className="auth-modal-message">{modalMessage}</p>
                        ) : (
                            <form onSubmit={handleForgotPassword} className="auth-forgot-password-form">
                                <p>Enter your email address to reset your password.</p>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    required
                                    className="auth-form-input"
                                />
                                <button type="submit" className="auth-submit-button">
                                    Submit
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;