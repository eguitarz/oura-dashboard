import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  text-align: center;
`;

const Title = styled.h1`
  margin-bottom: 2rem;
  color: #2c3e50;
`;

const LoginButton = styled.a`
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
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-top: 1rem;
  padding: 10px;
  border-radius: 4px;
  background-color: #f8d7da;
`;

const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    const error = searchParams.get('error');
    if (error === 'auth_failed') {
      setError('Authentication failed. Please try again.');
    }
  }, [isAuthenticated, navigate, searchParams]);

  return (
    <LoginContainer>
      <Title>Welcome to Oura Dashboard</Title>
      <LoginButton href="/auth/oura">
        Login with Oura
      </LoginButton>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </LoginContainer>
  );
};

export default Login; 