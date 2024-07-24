import React from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/Profile.css';

const Profile = () => {
  const location = useLocation();
  const user = location.state?.user;

  if (!user) {
    return <div className="profile-container"><p>No user data available.</p></div>;
  }

  return (
    <div className="container">
      <h1>User Profile</h1>
      <div className="profile-details">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Age:</strong> {user.age}</p>
        <p><strong>Gender:</strong> {user.gender}</p>
        <p><strong>Height:</strong> {user.height} feet</p>
        <p><strong>Mobile:</strong> {user.mobile}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>City:</strong> {user.city}</p>
        <p><strong>Date of Birth:</strong> {new Date(user.dob).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default Profile;
