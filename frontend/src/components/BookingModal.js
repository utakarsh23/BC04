import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

function BookingModal({ expert, onClose, onBookingSelect }) {
  const { darkMode } = useTheme();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  const availableDates = expert.availability || [];
  
  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot('');
  };

  const handleSlotSelect = (slot) => {
    if (!slot.isBooked) {
      setSelectedSlot(slot.time);
    }
  };

  const handleConfirm = () => {
    if (selectedDate && selectedSlot) {
      onBookingSelect(selectedDate, selectedSlot);
    }
  };

  const selectedDateSlots = availableDates.find(d => d.date === selectedDate)?.slots || [];

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className={`relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-8 ${
          darkMode ? 'bg-gray-800/95' : 'bg-white/95'
        } backdrop-blur-md`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          ✕
        </button>
        
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Book a Session
        </h2>
        <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          with {expert.name}
        </p>

        <div className="mb-8">
          <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            1. Select Date
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {availableDates.slice(0, 14).map((dateSlot) => (
              <button
                key={dateSlot.date}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  selectedDate === dateSlot.date
                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                    : darkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => handleDateSelect(dateSlot.date)}
              >
                {getDayName(dateSlot.date)}
              </button>
            ))}
          </div>
        </div>

        {selectedDate && (
          <div className="mb-8">
            <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              2. Select Time Slot
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {selectedDateSlots.map((slot) => (
                <button
                  key={slot.time}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    slot.isBooked
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-600 cursor-not-allowed line-through'
                      : selectedSlot === slot.time
                      ? 'bg-purple-600 text-white shadow-lg scale-105'
                      : darkMode
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => handleSlotSelect(slot)}
                  disabled={slot.isBooked}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedDate && selectedSlot && (
          <button 
            onClick={handleConfirm}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Continue to Booking
          </button>
        )}
      </div>
    </div>
  );
}

export default BookingModal;
