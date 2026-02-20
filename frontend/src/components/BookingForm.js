import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';

function BookingForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { addNotification, saveUserEmail } = useNotifications();
  const bookingData = location.state || {};

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const bookingPayload = {
        expertId: bookingData.expertId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: bookingData.date,
        timeSlot: bookingData.timeSlot,
        notes: formData.notes
      };

      const response = await bookingAPI.createBooking(bookingPayload);
      const createdBooking = response.data;

      // Save to localStorage for persistence
      const existingBookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
      const bookingWithDetails = {
        ...createdBooking,
        expertId: {
          _id: bookingData.expertId,
          name: bookingData.expertName,
          category: bookingData.expertCategory || 'Expert'
        }
      };
      existingBookings.push(bookingWithDetails);
      localStorage.setItem('myBookings', JSON.stringify(existingBookings));

      // Save user email
      saveUserEmail(formData.email);

      // Add notification
      addNotification({
        id: `booking-${Date.now()}`,
        message: `Booked a slot with ${bookingData.expertName} on ${new Date(bookingData.date).toLocaleDateString()}. View Booking`,
        type: 'success',
        read: false,
        timestamp: new Date()
      });

      setSuccess(true);
      setLoading(false);

      setTimeout(() => {
        navigate('/my-bookings', { state: { email: formData.email } });
      }, 2000);
    } catch (err) {
      setLoading(false);
      setErrorMessage(
        err.response?.data?.error || 'Failed to create booking. Please try again.'
      );
    }
  };

  if (!bookingData.expertId) {
    return (
      <div className="max-w-7xl mx-auto px-5 py-6">
        <div className="text-center py-12 text-lg text-red-500">
          No booking data found. Please select a time slot first.
        </div>
        <div className="text-center">
          <button 
            onClick={() => navigate('/')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Go to Experts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 py-6">
      <button 
        onClick={() => navigate(-1)}
        className={`mb-6 px-6 py-3 rounded-lg font-medium transition-all border-2 ${
          darkMode 
            ? 'bg-gray-800 text-purple-400 border-purple-500 hover:bg-purple-500 hover:text-white' 
            : 'bg-white text-purple-600 border-purple-600 hover:bg-purple-600 hover:text-white'
        } hover:-translate-x-1`}
      >
        ← Back
      </button>

      <div className={`max-w-2xl mx-auto rounded-2xl p-8 shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Book a Session
        </h2>

        {success && (
          <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-4 rounded-lg mb-6 border border-green-200 dark:border-green-800">
            Booking successful! Redirecting to your bookings...
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6 border border-red-200 dark:border-red-800">
            {errorMessage}
          </div>
        )}

        <div className={`mb-6 p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <strong className={darkMode ? 'text-white' : 'text-gray-900'}>Expert:</strong> {bookingData.expertName}
          </p>
          <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <strong className={darkMode ? 'text-white' : 'text-gray-900'}>Date:</strong> {new Date(bookingData.date).toLocaleDateString()}
          </p>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
            <strong className={darkMode ? 'text-white' : 'text-gray-900'}>Time:</strong> {bookingData.timeSlot}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={success}
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-4 ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500/20'
                  : darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20' 
                  : 'bg-white border-gray-200 text-gray-800 focus:border-purple-600 focus:ring-purple-600/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {errors.name && <div className="mt-2 text-sm text-red-500">{errors.name}</div>}
          </div>

          <div className="mb-6">
            <label className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={success}
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-4 ${
                errors.email
                  ? 'border-red-500 focus:ring-red-500/20'
                  : darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20' 
                  : 'bg-white border-gray-200 text-gray-800 focus:border-purple-600 focus:ring-purple-600/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {errors.email && <div className="mt-2 text-sm text-red-500">{errors.email}</div>}
          </div>

          <div className="mb-6">
            <label className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="1234567890"
              disabled={success}
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-4 ${
                errors.phone
                  ? 'border-red-500 focus:ring-red-500/20'
                  : darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20' 
                  : 'bg-white border-gray-200 text-gray-800 focus:border-purple-600 focus:ring-purple-600/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {errors.phone && <div className="mt-2 text-sm text-red-500">{errors.phone}</div>}
          </div>

          <div className="mb-6">
            <label className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              disabled={success}
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all resize-vertical focus:outline-none focus:ring-4 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20' 
                  : 'bg-white border-gray-200 text-gray-800 focus:border-purple-600 focus:ring-purple-600/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookingForm;
