'use client';
import React, { useEffect, useState } from 'react';
import useServiceProviderStore from "@/store/serviceStore";

const AuthDebugger = () => {
  const {
    serviceProvider,
    token,
    isAuthenticated,
    isLoading,
    error,
    checkAuthStatus,
    loadServiceProvider,
    logout,
    clearError
  } = useServiceProviderStore();
  
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    console.log('🔍 Auth Debugger mounted');
    // Function to update debug information
    const updateDebugInfo = () => {
      const cookies = document.cookie;
      const tokenCookie = cookies.split(';').find(cookie => 
        cookie.trim().startsWith('service_provider_token=')
      );
      setDebugInfo({
        storeToken: token ? 'Present' : 'Missing',
        cookieToken: tokenCookie ? 'Present' : 'Missing',
        isAuthenticated: isAuthenticated ? 'Yes' : 'No',
        serviceProviderLoaded: serviceProvider ? 'Yes' : 'No',
        allCookies: cookies,
        timestamp: new Date().toLocaleTimeString()
      });
    };

    updateDebugInfo();

    // Update every 2 seconds to monitor changes;
    const interval = setInterval(updateDebugInfo, 2000);
    return () => clearInterval(interval);
  }, [token, isAuthenticated, serviceProvider]);

  const handleCheckAuth = () => {
    console.log('🔍 Manual auth check triggered');
    checkAuthStatus();
  };

  const handleLoadServiceProvider = async () => {
    console.log('🔄 Manual service provider load triggered');
    try {
      await loadServiceProvider();
      console.log('✅ Service provider loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load service provider:', error.message);
    }
  };

  const handleLogout = async () => {
    console.log('🚪 Manual logout triggered');
    await logout();
  };

  const handleClearError = () => {
    clearError();
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '200px',
      background: 'white',
      border: '2px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      maxWidth: '400px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      zIndex: 9999,
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>🔐 Auth Debug Panel</h3>
      {/* Current Status */}
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 5px 0', color: '#666' }}>Current Status:</h4>
        <div>Store Token: <span style={{ color: debugInfo.storeToken === 'Present' ? 'green' : 'red' }}>
          {debugInfo.storeToken}
        </span></div>
        <div>Cookie Token: <span style={{ color: debugInfo.cookieToken === 'Present' ? 'green' : 'red' }}>
          {debugInfo.cookieToken}
        </span></div>
        <div>Authenticated: <span style={{ color: debugInfo.isAuthenticated === 'Yes' ? 'green' : 'red' }}>
          {debugInfo.isAuthenticated}
        </span></div>
        <div>Service Provider: <span style={{ color: debugInfo.serviceProviderLoaded === 'Yes' ? 'green' : 'red' }}>
          {debugInfo.serviceProviderLoaded}
        </span></div>
        <div>Loading: <span style={{ color: isLoading ? 'orange' : 'gray' }}>
          {isLoading ? 'Yes' : 'No'}
        </span></div>
        <div style={{ fontSize: '10px', color: '#999' }}>Last Update: {debugInfo.timestamp}</div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          marginBottom: '15px', 
          padding: '8px', 
          background: '#ffebee', 
          border: '1px solid #f44336',
          borderRadius: '4px'
        }}>
          <h4 style={{ margin: '0 0 5px 0', color: '#d32f2f' }}>Error:</h4>
          <div style={{ color: '#d32f2f', fontSize: '11px' }}>{error}</div>
          <button 
            onClick={handleClearError}
            style={{
              marginTop: '5px',
              padding: '2px 6px',
              fontSize: '10px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Clear Error
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <button 
          onClick={handleCheckAuth}
          style={{
            padding: '5px 10px',
            fontSize: '11px',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          🔍 Check Auth Status
        </button>
        
        <button 
          onClick={handleLoadServiceProvider}
          disabled={isLoading}
          style={{
            padding: '5px 10px',
            fontSize: '11px',
            background: isLoading ? '#ccc' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          🔄 Load Service Provider
        </button>
        
        <button 
          onClick={handleLogout}
          style={{
            padding: '5px 10px',
            fontSize: '11px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* Cookie Details */}
      <details style={{ marginTop: '10px' }}>
        <summary style={{ cursor: 'pointer', color: '#666' }}>🍪 Cookie Details</summary>
        <div style={{ 
          marginTop: '5px', 
          padding: '5px', 
          background: '#f5f5f5', 
          borderRadius: '3px',
          fontSize: '10px',
          wordBreak: 'break-all'
        }}>
          {debugInfo.allCookies || 'No cookies found'}
        </div>
      </details>
    </div>
  );
};

export default AuthDebugger;