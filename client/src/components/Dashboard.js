import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import { PageContainer, Container } from './common/Layout';
import HeartRate from './HeartRate';

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
    <PageContainer>
      <Container>
        <Header>
          <h1>Dashboard</h1>
          <LogoutButton onClick={logout}>
            Logout
          </LogoutButton>
        </Header>
        <HeartRate />
      </Container>
    </PageContainer>
  );
};

export default Dashboard; 