import React, { Suspense, lazy, useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store, RootState } from './store';
import ErrorBoundary from './components/ErrorBoundary';
import socketClient from './socket/client';

// Lazy load components for code splitting
const FarmManagementDashboard = lazy(() => import('./components/FarmManagementDashboard'));
const Login = lazy(() => import('./components/Login'));
const WorkerLogin = lazy(() => import('./components/WorkerLogin'));
const FarmRegistration = lazy(() => import('./components/FarmRegistration'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const SelectFarm = lazy(() => import('./components/SelectFarm'));
const WorkerMobileDashboard = lazy(() => import('./components/dashboards/WorkerMobileDashboard'));

// Loading component
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
    }}
  >
    <CircularProgress size={60} sx={{ color: '#2e7d32' }} />
  </Box>
);

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Green for agriculture theme
    },
    secondary: {
      main: '#f57c00', // Orange accent
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
});

// Socket connection component
function SocketManager() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && user?.uid && !socketClient.isConnected()) {
      console.log('🔌 Initializing Socket.io connection...');
      socketClient.connect(user.uid);
    }

    return () => {
      // Don't disconnect on unmount to maintain connection
    };
  }, [isAuthenticated, user]);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <SocketManager />
            <Suspense fallback={<LoadingFallback />}>
              <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
                <Routes>
                  <Route path="/worker-mobile" element={<WorkerMobileDashboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/worker-login" element={<WorkerLogin />} />
                  <Route path="/register" element={<FarmRegistration />} />
                  <Route
                    path="/select-farm"
                    element={
                      <ProtectedRoute>
                        <SelectFarm />
                      </ProtectedRoute>
                    }
                  />
              {/* Dashboard and section routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <FarmManagementDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/overview"
                element={
                  <ProtectedRoute>
                    <FarmManagementDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <FarmManagementDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/animals"
                element={
                  <ProtectedRoute>
                    <FarmManagementDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/crops"
                element={
                  <ProtectedRoute>
                    <FarmManagementDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/irrigation"
                element={
                  <ProtectedRoute>
                    <FarmManagementDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/financial"
                element={
                  <ProtectedRoute>
                    <FarmManagementDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather"
                element={
                  <ProtectedRoute>
                    <FarmManagementDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workers"
                element={
                  <ProtectedRoute>
                    <FarmManagementDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rota"
                element={
                  <ProtectedRoute>
                    <FarmManagementDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <FarmManagementDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/equipment"
                element={
                  <ProtectedRoute>
                    <FarmManagementDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <FarmManagementDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute>
                    <FarmManagementDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/animal-health"
                element={
                  <ProtectedRoute>
                    <FarmManagementDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/crop-planning"
                element={
                  <ProtectedRoute>
                    <FarmManagementDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <FarmManagementDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <FarmManagementDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <FarmManagementDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <FarmManagementDashboard />
                  </ProtectedRoute>
                }
              />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Box>
            </Suspense>
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
