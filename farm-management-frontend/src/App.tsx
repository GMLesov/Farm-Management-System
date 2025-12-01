import React from 'react';
import { AuthProvider } from './hooks/useAuth';
import NotificationsPanel from './components/NotificationsPanel';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <header style={{ 
          backgroundColor: '#fff', 
          padding: '16px 0', 
          borderBottom: '1px solid #ddd',
          marginBottom: '20px'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <h1 style={{ margin: 0, color: '#333' }}>🚜 Farm Management System</h1>
            <p style={{ margin: '4px 0 0 0', color: '#666' }}>Real-time Notifications Dashboard</p>
          </div>
        </header>
        
        <main>
          <NotificationsPanel farmId="example-farm-id" />
        </main>
        
        <footer style={{ 
          marginTop: '40px', 
          padding: '20px 0', 
          borderTop: '1px solid #ddd',
          textAlign: 'center',
          color: '#666'
        }}>
          <p style={{ margin: 0 }}>Farm Management System - Real-time Features Demo</p>
        </footer>
      </div>
    </AuthProvider>
  );
};

export default App;