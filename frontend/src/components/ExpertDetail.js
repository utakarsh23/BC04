import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { expertAPI } from '../services/api';
import { getSocket } from '../services/socket';
import { useTheme } from '../context/ThemeContext';
import BookingModal from './BookingModal';
import ReviewSection from './ReviewSection';

function ExpertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const fetchExpert = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await expertAPI.getExpertById(id);
      setExpert(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load expert details. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpert();
    
    const socket = getSocket();
    
    socket.on('slotBooked', (data) => {
      if (data.expertId === id) {
        updateSlotStatus(data.date, data.timeSlot, true);
      }
    });

    return () => {
      socket.off('slotBooked');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateSlotStatus = (date, timeSlot, isBooked) => {
    setExpert((prevExpert) => {
      if (!prevExpert) return prevExpert;
      
      const updatedAvailability = prevExpert.availability.map((dateSlot) => {
        if (dateSlot.date === date) {
          return {
            ...dateSlot,
            slots: dateSlot.slots.map((slot) => {
              if (slot.time === timeSlot) {
                return { ...slot, isBooked };
              }
              return slot;
            })
          };
        }
        return dateSlot;
      });

      return { ...prevExpert, availability: updatedAvailability };
    });
  };

  const handleBookingSelect = (date, timeSlot) => {
    setShowBookingModal(false);
    navigate('/booking', {
      state: {
        expertId: expert._id,
        expertName: expert.name,
        expertCategory: expert.category,
        date,
        timeSlot
      }
    });
  };

  if (loading) {
    return <div className="text-center py-12 text-lg text-gray-600 dark:text-gray-400">Loading expert details...</div>;
  }

  if (error || !expert) {
    return <div className="text-center py-12 text-lg text-red-500">{error || 'Expert not found'}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-5 py-6">
      <button 
        onClick={() => navigate('/')}
        className={`mb-6 px-6 py-3 rounded-lg font-medium transition-all border-2 ${darkMode ? 'bg-gray-800 text-purple-400 border-purple-500 hover:bg-purple-500 hover:text-white' : 'bg-white text-purple-600 border-purple-600 hover:bg-purple-600 hover:text-white'} hover:-translate-x-1`}
      >
        ← Back to Experts
      </button>

      <div className="mt-8">
        <div className={`rounded-2xl p-8 mb-8 shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex gap-8 flex-wrap md:flex-nowrap">
            <img
              src={expert.imageUrl || 'https://via.placeholder.com/120'}
              alt={expert.name}
              className="w-36 h-36 rounded-full object-cover shadow-lg"
            />
            <div className="flex-1">
              <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {expert.name}
              </h2>
              <p className="inline-block bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                {expert.category}
              </p>
              <div className="flex gap-8 my-4">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  <strong className={darkMode ? 'text-white' : 'text-gray-800'}>Experience:</strong> {expert.experience} years
                </span>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  <strong className={darkMode ? 'text-white' : 'text-gray-800'}>Rating:</strong> ★ {expert.rating}
                </span>
              </div>
              {expert.bio && <p className={`mt-4 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{expert.bio}</p>}
              
              <button 
                onClick={() => setShowBookingModal(true)}
                className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Book a Session
              </button>
            </div>
          </div>
        </div>

        <ReviewSection reviews={expert.reviews || []} expertId={expert._id} />
      </div>

      {showBookingModal && (
        <BookingModal
          expert={expert}
          onClose={() => setShowBookingModal(false)}
          onBookingSelect={handleBookingSelect}
        />
      )}
    </div>
  );
}

export default ExpertDetail;
