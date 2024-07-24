import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Signup1 from './pages/Signup1';
import Login from './pages/Login';
import SuccessPage from './pages/SuccessPage';
import ErrorPage from './pages/ErrorPage';
import Reports from './components/Reports';
import Profile from './components/Profile';

function App() {
  const error = { status: 404, message: 'Page not found' }; // Example error object
  const success = { status: 201, message: 'Signup successful! Please log in.' }; // Example error object
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup1 />} />
        <Route path="/login" element={<Login />} />
        <Route path="/error" element={<ErrorPage error={error} />} />
        <Route path="/success" element={<SuccessPage error={success} />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;
