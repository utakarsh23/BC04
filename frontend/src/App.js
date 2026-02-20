import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ExpertListing from './components/ExpertListing';
import ExpertDetail from './components/ExpertDetail';
import BookingForm from './components/BookingForm';
import MyBookings from './components/MyBookings';
import { initSocket } from './services/socket';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  useEffect(() => {
    initSocket();
  }, []);

  return (
    <ThemeProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<ExpertListing />} />
              <Route path="/experts/:id" element={<ExpertDetail />} />
              <Route path="/booking" element={<BookingForm />} />
              <Route path="/my-bookings" element={<MyBookings />} />
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
