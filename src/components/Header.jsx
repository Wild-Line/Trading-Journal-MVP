import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, BarChart3, TrendingUp, History } from 'lucide-react';

function Header() {
  const { logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-card/95 backdrop-blur-md border-b border-dark-border z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-1"></div>
          
          <nav className="flex space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive('/') 
                    ? 'bg-gradient-primary text-white shadow-lg transform scale-105' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-dark-surface/50'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/active-trades"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive('/active-trades') 
                    ? 'bg-gradient-primary text-white shadow-lg transform scale-105' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-dark-surface/50'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Active Trades</span>
              </Link>
              
              <Link
                to="/trade-history"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive('/trade-history') 
                    ? 'bg-gradient-primary text-white shadow-lg transform scale-105' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-dark-surface/50'
                }`}
              >
                <History className="h-4 w-4" />
                <span>Trade History</span>
              </Link>
            </nav>
          
          <div className="flex-1 flex justify-end">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-white hover:bg-gradient-accent transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
