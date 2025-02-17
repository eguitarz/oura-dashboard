import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';

// Placeholder components - these will be implemented in separate files
const Login = () => (
  <div>
    <h1>Welcome to Oura Dashboard</h1>
    <a href="/auth/oura" className="login-button">
      Login with Oura
    </a>
  </div>
);

const Dashboard = () => (
  <div>
    <h1>Dashboard</h1>
    <p>Your Oura ring data will be displayed here</p>
  </div>
);

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;

  .login-button {
    display: inline-block;
    padding: 12px 24px;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 600;
    transition: background-color 0.2s;

    &:hover {
      background-color: #0056b3;
    }
  }
`;

function App() {
  return (
    <AppContainer>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AppContainer>
  );
}

export default App; 