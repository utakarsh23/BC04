import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

function ReviewSection({ reviews = [], expertId }) {
  const { darkMode } = useTheme();
  const [showAll, setShowAll] = useState(false);

  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const displayedReviews = showAll ? safeReviews : safeReviews.slice(0, 3);

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star} 
            className={`${star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'} text-lg`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (!safeReviews || safeReviews.length === 0) {
    return (
      <div className={`rounded-2xl p-8 shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Reviews
        </h3>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          No reviews yet. Be the first to review!
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-8 shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Reviews ({safeReviews.length})
      </h3>
      
      <div className="space-y-4">
        {displayedReviews.map((review) => (
          <div 
            key={review._id} 
            className={`p-6 rounded-xl border-2 ${
              darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                darkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'
              }`}>
                {review.userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {review.userName}
                    </h4>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  {renderStars(review.rating)}
                </div>
                <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {review.comment}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {safeReviews.length > 3 && (
        <button 
          onClick={() => setShowAll(!showAll)}
          className={`mt-6 w-full py-3 rounded-lg font-medium transition-all ${
            darkMode 
              ? 'bg-gray-700 text-purple-400 hover:bg-gray-600' 
              : 'bg-gray-100 text-purple-600 hover:bg-gray-200'
          }`}
        >
          {showAll ? 'Show Less' : `Show All ${safeReviews.length} Reviews`}
        </button>
      )}
    </div>
  );
}

export default ReviewSection;
