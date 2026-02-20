import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { getSocket } from '../services/socket';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';

function MyBookings() {
  const location = useLocation();
  const { darkMode } = useTheme();
  const { addNotification } = useNotifications();
  const [email, setEmail] = useState(location.state?.email || localStorage.getItem('userEmail') || '');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ phone: '', notes: '', timeSlot: '' });
  const [availableSlots] = useState([
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00'
  ]);

  useEffect(() => {
    // Auto-load bookings if email exists
    const emailToLoad = location.state?.email || localStorage.getItem('userEmail');
    if (emailToLoad) {
      setEmail(emailToLoad);
      fetchBookings(emailToLoad);
    }

    const socket = getSocket();

    socket.on('bookingStatusUpdated', (updatedBooking) => {
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === updatedBooking._id ? updatedBooking : booking
        )
      );
    });

    return () => {
      socket.off('bookingStatusUpdated');
    };
  }, [location.state]);

  const fetchBookings = async (emailToSearch) => {
    if (!emailToSearch.trim()) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      // Get bookings from API
      const response = await bookingAPI.getBookings({ email: emailToSearch });
      const apiBookings = response.data;

      // Get bookings from localStorage
      const localBookings = JSON.parse(localStorage.getItem('myBookings') || '[]')
        .filter(booking => booking.email === emailToSearch);

      // Merge bookings (prioritize API data, add local-only bookings)
      const apiBookingIds = new Set(apiBookings.map(b => b._id));
      const uniqueLocalBookings = localBookings.filter(b => !apiBookingIds.has(b._id));
      
      const allBookings = [...apiBookings, ...uniqueLocalBookings]
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

      setBookings(allBookings);
      setLoading(false);
    } catch (err) {
      // If API fails, still show localStorage bookings
      const localBookings = JSON.parse(localStorage.getItem('myBookings') || '[]')
        .filter(booking => booking.email === emailToSearch)
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      
      if (localBookings.length > 0) {
        setBookings(localBookings);
        setError('Showing cached bookings. Unable to fetch latest from server.');
      } else {
        setError('Failed to load bookings. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBookings(email);
  };

  const startEdit = (booking) => {
    setEditingId(booking._id);
    setEditForm({
      phone: booking.phone,
      notes: booking.notes || '',
      timeSlot: booking.timeSlot
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ phone: '', notes: '', timeSlot: '' });
  };

  const saveEdit = async (bookingId) => {
    try {
      const booking = bookings.find(b => b._id === bookingId);
      const timeChanged = booking && booking.timeSlot !== editForm.timeSlot;
      
      const response = await bookingAPI.updateBooking(bookingId, editForm);
      const updatedBooking = response.data;
      
      // Update state
      setBookings(bookings.map(b => b._id === bookingId ? updatedBooking : b));
      
      // Update localStorage
      const localBookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
      const updatedLocalBookings = localBookings.map(b => 
        b._id === bookingId ? { ...b, phone: editForm.phone, notes: editForm.notes, timeSlot: editForm.timeSlot } : b
      );
      localStorage.setItem('myBookings', JSON.stringify(updatedLocalBookings));
      
      // Add notification if time was changed
      if (timeChanged) {
        addNotification({
          id: `booking-update-${Date.now()}`,
          message: `Booking time updated to ${editForm.timeSlot} for ${booking.expertId?.name || 'expert'}. View Booking`,
          type: 'success',
          read: false,
          timestamp: new Date()
        });
      }
      
      setEditingId(null);
      setEditForm({ phone: '', notes: '', timeSlot: '' });
    } catch (err) {
      alert('Failed to update booking. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 py-6">
      <h2 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
        My Bookings
      </h2>

      <div className="mb-12">
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative flex gap-4 flex-wrap sm:flex-nowrap">
            <input
              type="email"
              placeholder="Enter your email to view bookings..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`flex-1 px-4 py-4 rounded-lg border-2 text-base shadow-lg transition-all focus:outline-none focus:ring-4 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500 focus:ring-purple-500/20' 
                  : 'bg-white border-gray-200 text-gray-800 focus:border-purple-600 focus:ring-purple-600/20'
              }`}
            />
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="text-center text-red-500 mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-lg text-gray-600 dark:text-gray-400">Loading bookings...</div>
      ) : searched && bookings.length === 0 ? (
        <div className="text-center py-12 text-lg text-gray-600 dark:text-gray-400">No bookings found for this email</div>
      ) : (
        <div className="grid gap-6 max-w-4xl mx-auto">
          {bookings.map((booking) => (
            <div 
              key={booking._id} 
              className={`rounded-2xl p-6 shadow-lg transition-shadow ${
                darkMode ? 'bg-gray-800 hover:shadow-2xl' : 'bg-white hover:shadow-xl'
              }`}
            >
              <div className={`flex flex-wrap gap-4 justify-between items-start pb-4 mb-4 border-b-2 ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div>
                  <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {booking.expertId?.name || 'Unknown Expert'}
                  </h3>
                  <span className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {booking.expertId?.category || 'N/A'}
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    booking.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : booking.status === 'approved'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {booking.status}
                  </span>
                  {editingId !== booking._id && (
                    <button
                      onClick={() => startEdit(booking)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all border-2 ${
                        darkMode 
                          ? 'bg-gray-700 text-purple-400 border-purple-500 hover:bg-purple-500 hover:text-white' 
                          : 'bg-white text-purple-600 border-purple-600 hover:bg-purple-600 hover:text-white'
                      } hover:-translate-y-0.5`}
                      title="Edit time, phone, and notes"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">Date</span>
                  <p className={`mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {new Date(booking.date).toLocaleDateString()}
                  </p>
                </div>

                {editingId === booking._id ? (
                  <div>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">Time</span>
                    <select
                      value={editForm.timeSlot}
                      onChange={(e) => setEditForm({ ...editForm, timeSlot: e.target.value })}
                      className={`mt-1 w-full px-3 py-2 rounded-lg border-2 transition-all focus:outline-none focus:ring-4 ${
                        darkMode 
                          ? 'bg-gray-700 border-purple-500 text-white focus:ring-purple-500/20' 
                          : 'bg-white border-purple-600 text-gray-800 focus:ring-purple-600/20'
                      }`}
                    >
                      {availableSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">Time</span>
                    <p className={`mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{booking.timeSlot}</p>
                  </div>
                )}

                <div>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">Name</span>
                  <p className={`mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{booking.name}</p>
                </div>

                {editingId === booking._id ? (
                  <div>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">Phone</span>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className={`mt-1 w-full px-3 py-2 rounded-lg border-2 transition-all focus:outline-none focus:ring-4 ${
                        darkMode 
                          ? 'bg-gray-700 border-purple-500 text-white focus:ring-purple-500/20' 
                          : 'bg-white border-purple-600 text-gray-800 focus:ring-purple-600/20'
                      }`}
                    />
                  </div>
                ) : (
                  <div>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">Phone</span>
                    <p className={`mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{booking.phone}</p>
                  </div>
                )}

                <div>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">Booked On</span>
                  <p className={`mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {editingId === booking._id ? (
                <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <label className="text-purple-600 dark:text-purple-400 font-semibold text-sm">Notes</label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows="3"
                    placeholder="Add notes..."
                    className={`mt-2 w-full px-4 py-3 rounded-lg border-2 transition-all resize-vertical focus:outline-none focus:ring-4 ${
                      darkMode 
                        ? 'bg-gray-700 border-purple-500 text-white focus:ring-purple-500/20' 
                        : 'bg-white border-purple-600 text-gray-800 focus:ring-purple-600/20'
                    }`}
                  />
                  <div className="flex gap-3 mt-4">
                    <button 
                      onClick={() => saveEdit(booking._id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                      Save
                    </button>
                    <button 
                      onClick={cancelEdit}
                      className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all border-2 ${
                        darkMode 
                          ? 'bg-gray-700 text-red-400 border-red-500 hover:bg-red-500 hover:text-white' 
                          : 'bg-white text-red-600 border-red-600 hover:bg-red-600 hover:text-white'
                      } hover:-translate-y-0.5`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                booking.notes && (
                  <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">Notes</span>
                    <p className={`mt-2 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {booking.notes}
                    </p>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
