import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Error.css';

const ErrorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {status, message} = location.state.error || {status: 500, message: "Internal error"}

  const [dogImage, setDogImage] = useState('');

  useEffect(() => {
    axios.get('https://dog.ceo/api/breeds/image/random')
      .then(response => {
        setDogImage(response.data.message);
      })
      .catch(err => {
        console.error('Error fetching dog image:', err);
      });
  }, []);

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="error-container">
      <h1>Error {status}</h1>
      <p>{message}</p>
      {dogImage && <img src={dogImage} alt="Random Dog" style={{ maxWidth: '100%', borderRadius: '8px' }} />}
      <button className="home-button" onClick={goHome}>Go to Home</button>
    </div>
  );
};

export default ErrorPage;
