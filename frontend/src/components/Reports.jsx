import React, { useState } from 'react';
import axiosInstance from '../axiosInstance';
import '../styles/Reports.css';

const Reports = () => {
  const [reportType, setReportType] = useState(null);
  const [reportData, setReportData] = useState([]);

  const fetchReport = (type) => {
    axiosInstance.get(`http://localhost:5000/api/reports/${type}`)
      .then(response => {
        setReportData(response.data);
        setReportType(type);
      })
      .catch(error => {
        console.error(`Error fetching ${type} report:`, error);
      });
  };

  const renderReportTable = () => {
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
    <div className="reports-container">
      <h1>Reports</h1>
      <div className="button-group">
        <button onClick={() => fetchReport('attendance')}>Attendance Report</button>
        <button onClick={() => fetchReport('subscription')}>Subscription Report</button>
        <button onClick={() => fetchReport('totalSubscription')}>Total Subscription Report</button>
      </div>
      <div className="report-content">
        {renderReportTable()}
      </div>
    </div>
  );
};

export default Reports;
