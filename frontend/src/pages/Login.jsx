import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Form.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/users/login', { email, password })
      .then(response => {
        if (response.status === 200) {
          const token = response.data.token;
          localStorage.setItem('token', token); // Store the token in local storage
          navigate('/');
        }
      })
      .then(axios.post('http://localhost:5000/api/attendance/mark'))
      .catch(error => {
        const errorStatus = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || error.response.data?.error || "Internal Server Error";
        navigate('/error', { state: { error: { status: errorStatus, message: errorMessage } } });
      });
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <div className="password-container">
            <input
              type={passwordVisible ? 'text' : 'password'}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <i
              className={`fas ${passwordVisible ? 'fa-eye-slash' : 'fa-eye'} password-icon`}
              onClick={togglePasswordVisibility}
            ></i>
          </div>
        </div>
        <button type="submit">Login</button>
        <p>
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
