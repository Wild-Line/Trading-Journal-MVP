import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ActiveTrades from './components/ActiveTrades';
import TradeHistory from './components/TradeHistory';
import Login from './components/Login';
import Signup from './components/Signup';

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/" />;
}

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-dark-bg">
      {currentUser && <Header />}
      <main className={currentUser ? "pt-16" : ""}>
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/active-trades" element={
            <ProtectedRoute>
              <ActiveTrades />
            </ProtectedRoute>
          } />
          <Route path="/trade-history" element={
            <ProtectedRoute>
              <TradeHistory />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
