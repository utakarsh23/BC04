import React, { createContext, useState, useContext, useEffect } from 'react';
import { bookingAPI } from '../services/api';
import { getSocket } from '../services/socket';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    // Load notifications from localStorage on mount
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('userEmail') || '';
  });

  const fetchNotifications = async () => {
    if (!userEmail) return;
    try {
      const response = await bookingAPI.getBookings(userEmail);
      const confirmedBookings = response.data
        .filter(b => b.status === 'Confirmed' && !isNotificationRead(b._id))
        .map(b => ({
          id: b._id,
          message: `Your booking with ${b.expertId?.name} has been confirmed!`,
          type: 'success',
          read: false,
          timestamp: new Date(b.updatedAt)
        }));
      setNotifications(prev => [...prev, ...confirmedBookings]);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const isNotificationRead = (id) => {
    const readNotifs = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    return readNotifs.includes(id);
  };

  useEffect(() => {
    if (userEmail) {
      fetchNotifications();
    }

    const socket = getSocket();
    
    socket.on('bookingStatusUpdated', (updatedBooking) => {
      if (updatedBooking.email === userEmail && updatedBooking.status === 'Confirmed') {
        addNotification({
          id: updatedBooking._id,
          message: `Your booking with ${updatedBooking.expertId?.name} has been confirmed!`,
          type: 'success',
          read: false,
          timestamp: new Date()
        });
      }
    });

    return () => {
      socket.off('bookingStatusUpdated');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  const addNotification = (notif) => {
    setNotifications(prev => {
      const updated = [notif, ...prev];
      // Persist to localStorage
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const markAsRead = (id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      // Persist to localStorage
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
    const readNotifs = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    localStorage.setItem('readNotifications', JSON.stringify([...readNotifs, id]));
  };

  const markAllAsRead = () => {
    const ids = notifications.map(n => n.id);
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      // Persist to localStorage
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
    localStorage.setItem('readNotifications', JSON.stringify(ids));
  };

  const saveUserEmail = (email) => {
    setUserEmail(email);
    localStorage.setItem('userEmail', email);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification,
      saveUserEmail,
      userEmail
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
