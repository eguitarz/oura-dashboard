import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import Card from './common/Card';
import Button from './common/Button';
import { PageContainer, Container, Flex } from './common/Layout';

const LoginCard = styled(Card)`
  max-width: 400px;
  width: 100%;
`;

const Logo = styled.div`
  margin-bottom: 24px;
  text-align: center;

  img {
    height: 48px;
  }
`;

const Title = styled.h1`
  color: #2c3e50;
  font-size: 24px;
  margin-bottom: 24px;
  text-align: center;
`;

const Description = styled.p`
  color: #6c757d;
  text-align: center;
  margin-bottom: 32px;
  line-height: 1.5;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-top: 16px;
  padding: 12px;
  border-radius: 8px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  text-align: center;
`;

const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('🔄 Login component mounted:', {
      isAuthenticated,
      timestamp: new Date().toISOString()
    });

    if (isAuthenticated) {
      console.log('✅ User is authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }

    const error = searchParams.get('error');
    if (error === 'auth_failed') {
      console.error('❌ Authentication error:', error);
      setError('Authentication failed. Please try again.');
    }
  }, [isAuthenticated, navigate, searchParams]);

  const handleLogin = () => {
    console.log('🔐 Starting OAuth login flow');
    setIsLoading(true);
    window.location.href = 'http://localhost:5001/auth/oura';
  };

  return (
    <PageContainer>
      <Container>
        <Flex direction="column" align="center" justify="center" style={{ minHeight: '80vh' }}>
          <LoginCard>
            <Logo>
              <img src="/logo.svg" alt="Oura Dashboard" />
            </Logo>
            <Title>Welcome to Oura Dashboard</Title>
            <Description>
              Connect your Oura Ring to visualize and analyze your health data.
              Track sleep, activity, and readiness scores all in one place.
            </Description>
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? 'Connecting...' : 'Connect with Oura Ring'}
            </Button>
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </LoginCard>
        </Flex>
      </Container>
    </PageContainer>
  );
};

export default Login; 