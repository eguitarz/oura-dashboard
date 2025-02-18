import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwt_token'));
  const [ouraToken, setOuraToken] = useState(localStorage.getItem('oura_token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!jwtToken);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 Auth state initialized:', {
      hasJwtToken: !!jwtToken,
      hasOuraToken: !!ouraToken,
      isAuthenticated: !!jwtToken,
      timestamp: new Date().toISOString()
    });

    // Check for tokens in URL on callback
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const ouraAccessToken = params.get('oura_token');
    
    if (urlToken) {
      console.log('🎟️ JWT Token found in URL, storing in localStorage');
      localStorage.setItem('jwt_token', urlToken);
      setJwtToken(urlToken);
      setIsAuthenticated(true);
    }

    if (ouraAccessToken) {
      console.log('🎟️ Oura Token found in URL, storing in localStorage');
      localStorage.setItem('oura_token', ouraAccessToken);
      setOuraToken(ouraAccessToken);
    }
    
    if (urlToken || ouraAccessToken) {
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log('✅ Authentication successful');
    }
    
    setLoading(false);
  }, []);

  const logout = () => {
    console.log('👋 Logging out user');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('oura_token');
    setJwtToken(null);
    setOuraToken(null);
    setIsAuthenticated(false);
    console.log('✅ Logout successful');
  };

  console.log('🔐 Current auth state:', {
    isAuthenticated,
    hasJwtToken: !!jwtToken,
    hasOuraToken: !!ouraToken,
    isLoading: loading,
    timestamp: new Date().toISOString()
  });

  return (
    <AuthContext.Provider value={{ 
      jwtToken, 
      ouraToken, 
      isAuthenticated, 
      loading, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 