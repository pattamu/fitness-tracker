import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Success.css';

const SuccessPage = () => {
  const location = useLocation();
  const { message } = location.state || { message: 'Operation successful!' };

  return (
    <div className="success-container">
      <h1>Success</h1>
      <p>{message}</p>
      <Link to="/login" className="login-link">Go to Login</Link>
    </div>
  );
};

export default SuccessPage;
