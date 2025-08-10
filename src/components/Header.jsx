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
    <header className="fixed top-0 left-0 right-0 bg-dark-surface border-b border-dark-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-accent-blue" />
              <span className="text-xl font-bold text-text-primary">Trading Journal</span>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-accent-blue text-white' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-dark-bg'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/active-trades"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/active-trades') 
                    ? 'bg-accent-blue text-white' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-dark-bg'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Active Trades</span>
              </Link>
              
              <Link
                to="/trade-history"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/trade-history') 
                    ? 'bg-accent-blue text-white' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-dark-bg'
                }`}
              >
                <History className="h-4 w-4" />
                <span>Trade History</span>
              </Link>
            </nav>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-dark-bg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
