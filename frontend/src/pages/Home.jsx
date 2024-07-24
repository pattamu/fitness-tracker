import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import '../styles/Home.css';

const Home = () => {
  const [user, setUser] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [activeSection, setActiveSection] = useState('profile');
  const [reportType, setReportType] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    // Fetch user details
    axiosInstance.get('http://localhost:5000/api/users/profile')
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        console.error('Error fetching user details:', error);
      });

    // Fetch workouts
    axiosInstance.get('http://localhost:5000/api/workouts/csv')
      .then(response => {
        const workoutsData = response.data;
        // Convert the workouts object to an array
        const workoutsArray = Object.values(workoutsData);
        setWorkouts(workoutsArray);
      })
      .catch(error => {
        console.error('Error fetching workouts:', error);
      });
  }, []);

  const fetchReport = (type) => {
    setLoadingReport(true);
    axiosInstance.get(`http://localhost:5000/api/reports/${type}`)
      .then(response => {
        console.log("att==>", response.data)
        setReportData(response.data);
        setReportType(type);
        setLoadingReport(false);
      })
      .catch(error => {
        console.error(`Error fetching ${type} report:`, error);
        setLoadingReport(false);
      });
  };

  const renderProfile = () => {
    if (!user) return <p>Loading profile...</p>;

    return (
      <div className="profile-details">
        <h2>Profile Details</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Age:</strong> {user.age}</p>
        <p><strong>Gender:</strong> {user.gender}</p>
        <p><strong>Height:</strong> {user.height}</p>
        <p><strong>Mobile:</strong> {user.mobile}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>City:</strong> {user.city}</p>
        <p><strong>Date of Birth:</strong> {new Date(user.dob).toLocaleDateString()}</p>
      </div>
    );
  };

  const renderWorkouts = () => {
    if (workouts.length === 0) return <p>Loading workouts...</p>;

    return (
      <div className="workouts-details">
        <h2>Available Workouts</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Muscle</th>
              <th>Equipment</th>
              <th>Difficulty</th>
              <th>Subscription</th>
            </tr>
          </thead>
          <tbody>
            {workouts.map((workout) => (
              <tr key={workout.id}>
                <td>{workout.name}</td>
                <td>{workout.type}</td>
                <td>{workout.muscle}</td>
                <td>{workout.equipment}</td>
                <td>{workout.difficulty}</td>
                <td>{workout.subscription}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderReports = () => {
    const renderTable = () => {
      if (reportData.length === 0) return <p>No data available</p>;

      if (reportType === 'attendance') {
        return (
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((record) => (
                <tr key={record.userId + record.date}>
                  <td>{record.userId}</td>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }

      if (reportType === 'subscription') {
        return (
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Subscription Plan</th>
                <th>Start Date</th>
                <th>End Date</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((record) => (
                <tr key={record.userId + record.startDate}>
                  <td>{record.userId}</td>
                  <td>{record.plan}</td>
                  <td>{new Date(record.startDate).toLocaleDateString()}</td>
                  <td>{new Date(record.endDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }

      if (reportType === 'totalSubscription') {
        return (
          <table>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Total Subscriptions</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((record) => (
                <tr key={record.plan}>
                  <td>{record.plan}</td>
                  <td>{record.totalSubscriptions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }

      return null;
    };

    return (
      <div className="reports-details">
        <h2>Reports</h2>
        <div className="button-group">
          <button onClick={() => fetchReport('attendance')}>Attendance Report</button>
          <button onClick={() => fetchReport('subscription')}>Subscription Report</button>
          <button onClick={() => fetchReport('totalSubscription')}>Total Subscription Report</button>
        </div>
        <div className="report-content">
          {loadingReport ? <p>Loading report...</p> : renderTable()}
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <nav>
        <ul>
          {user && <li className="welcome-text">Welcome, {user.name}!!!</li>}
          <li>
            <button onClick={() => setActiveSection('profile')}>Profile</button>
          </li>
          <li>
            <button onClick={() => setActiveSection('workouts')}>Workouts</button>
          </li>
          <li>
            <button onClick={() => setActiveSection('reports')}>Reports</button>
          </li>
          <li>
            <button onClick={() => {/* Handle logout */ }}>Logout</button>
          </li>
        </ul>
      </nav>
      <div className="content">
        {activeSection === 'profile' && renderProfile()}
        {activeSection === 'workouts' && renderWorkouts()}
        {activeSection === 'reports' && renderReports()}
      </div>
    </div>
  );
};

export default Home;
