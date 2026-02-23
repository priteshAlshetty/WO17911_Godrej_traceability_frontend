import React, { useState } from 'react';
import './CSS/login.css';
import Logo from '../../src/assets/goderej_and_multiquadrant_logo.jpeg';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Hardcoded validation
    if (email === 'admin@mq.com' && password === 'admin') {
      window.location.href = '/api';
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Login Form */}
        <div className="login-left">
          <img src={Logo} alt="Company Logo" className='Logo' />
          <form className='Form' onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button type="submit" className="login-btn">LOGIN</button>
          </form>
          <div className="login-options">
            <span className="forgot-password">Forgot your password?</span>
          </div>
        </div>

        {/* Right Side - Welcome Section */}
        <div className="login-right">
          <h2 style={{ alignContent: 'left', fontFamily: 'sans-serif', fontWeight: '700', fontSize: '2rem' , color:'whitesmoke'}}>
            Godrej & Boyce
          </h2>
          <br />
          <h2 style={{ fontFamily: 'sans-serif', fontWeight: '700', fontSize: '1.5rem' , color:'whitesmoke'}}>
         Traceability 
          </h2>
          <br />
          <h1>Welcome Back!</h1>
          <p>Please Login with your Credentials</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
