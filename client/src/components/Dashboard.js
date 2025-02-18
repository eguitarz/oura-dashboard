import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  padding: 20px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const LogoutButton = styled.button`
  padding: 8px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #c82333;
  }
`;

const Dashboard = () => {
  const { isAuthenticated, loading, logout } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardContainer>
      <Header>
        <h1>Dashboard</h1>
        <LogoutButton onClick={logout}>
          Logout
        </LogoutButton>
      </Header>
      <p>Your Oura ring data will be displayed here</p>
    </DashboardContainer>
  );
};

export default Dashboard; 