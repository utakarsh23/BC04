import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

function Navbar() {
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-800'} text-white shadow-lg`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Expert Booking</h1>
        <nav className="flex items-center gap-6">
          <Link 
            to="/" 
            className={`hover:opacity-80 transition-opacity ${
              location.pathname === '/' ? 'font-bold border-b-2 border-white pb-1' : ''
            }`}
          >
            Experts
          </Link>
          <Link 
            to="/my-bookings"
            className={`hover:opacity-80 transition-opacity ${
              location.pathname === '/my-bookings' ? 'font-bold border-b-2 border-white pb-1' : ''
            }`}
          >
            My Bookings
          </Link>
          <NotificationBell />
          <button 
            className="p-2 hover:scale-110 transition-transform" 
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
              </svg>
            )}
          </button>
        </nav>
      </div>
    </div>
  );
}

export default Navbar;
