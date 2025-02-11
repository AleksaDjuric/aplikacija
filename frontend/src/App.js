import './App.css';
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import Racks from './pages/Racks';
import Monitoring from './pages/Monitoring';
import Settings from './pages/Settings';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [menuActive, setMenuActive] = useState(false);
    const [userGroup, setUserGroup] = useState(null);

    const handleLogin = (userData) => {
        setIsAuthenticated(true);
        setUserGroup(userData.user_group);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUserGroup(null);
    };

    const toggleMenu = () => {
        setMenuActive(!menuActive);
    };

    // Navigation items based on user role
    const getNavigationItems = () => {
        const items = [
            { path: '/dashboard', label: 'Dashboard' },
            { path: '/racks', label: 'Racks' },
            { path: '/monitoring', label: 'Monitoring' },
        ];

        if (userGroup === 'admin') {
            items.push({ path: '/settings', label: 'Settings' });
        }

        return items;
    };

    return (
        <Router>
            <div id="root">
                {!isAuthenticated ? (
                    <div style={{ backgroundColor: 'black', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div className="login-container">
                        <h1 style={{ 
                            background: 'linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(245,0,229,1) 41%, rgba(0,212,255,1) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: '0', 
                            padding: '20px',
                            width: '100%'
                        }}>
                            Welcome
                        </h1>
                            <Login onLogin={handleLogin} />
                        </div>
                    </div>
                ) : (
                    <div className="container">
                        <div className="hamburger" onClick={toggleMenu}>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                        
                        <nav className={`mobile ${menuActive ? 'active' : ''}`}>
                            <button className="close-button" onClick={toggleMenu}>×</button>
                            <ul>
                                {getNavigationItems().map((item) => (
                                    <li key={item.path}>
                                        <Link to={item.path} onClick={toggleMenu}>
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                                <li>
                                    <button onClick={() => { handleLogout(); toggleMenu(); }}>
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </nav>
                        
                        <nav className="desktop">
                            <ul>
                                {getNavigationItems().map((item) => (
                                    <li key={item.path}>
                                        <Link to={item.path}>{item.label}</Link>
                                    </li>
                                ))}
                                <li>
                                    <button className="logout-button" onClick={handleLogout}>
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </nav>

                        <div className="content" style={{ padding: '20px', flexGrow: 1 }}>
                            <Routes>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/racks" element={<Racks />} />
                                <Route path="/monitoring" element={<Monitoring />} />
                                <Route 
                                    path="/settings" 
                                    element={
                                        userGroup === 'admin' 
                                            ? <Settings />
                                            : <Navigate to="/dashboard" replace />
                                    } 
                                />
                                <Route path="*" element={<Navigate to="/dashboard" />} />
                            </Routes>
                        </div>
                    </div>
                )}
            </div>
        </Router>
    );
};

export default App;