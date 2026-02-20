import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { expertAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';

function ExpertListing() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await expertAPI.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchExperts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await expertAPI.getExperts({
        page: currentPage,
        limit: 9,
        search,
        category
      });
      setExperts(response.data.experts);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (err) {
      setError('Failed to load experts. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, currentPage]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleExpertClick = (id) => {
    navigate(`/experts/${id}`);
  };

  if (loading && experts.length === 0) {
    return <div className="text-center py-12 text-lg text-gray-600 dark:text-gray-400">Loading experts...</div>;
  }

  if (error && experts.length === 0) {
    return <div className="text-center py-12 text-lg text-red-500">{ error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-5 py-6">
      {/* Search Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          Find Your Expert
        </h1>
        <div className="flex gap-4 max-w-3xl mx-auto flex-wrap">
          <div className="relative flex-1 min-w-[300px]">
            <input
              type="text"
              placeholder="Search by name or expertise..."
              value={search}
              onChange={handleSearch}
              className={`w-full px-4 py-4 rounded-lg border-2 text-base shadow-lg transition-all focus:outline-none focus:ring-4 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500 focus:ring-purple-500/20' 
                  : 'bg-white border-gray-200 text-gray-800 focus:border-purple-600 focus:ring-purple-600/20'
              }`}
            />
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <select
              value={category}
              onChange={handleCategoryChange}
              className={`w-full px-4 py-4 rounded-lg border-2 text-base shadow-lg transition-all cursor-pointer appearance-none focus:outline-none focus:ring-4 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500 focus:ring-purple-500/20' 
                  : 'bg-white border-gray-200 text-gray-800 focus:border-purple-600 focus:ring-purple-600/20'
              }`}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      ) : experts.length === 0 ? (
        <div className="text-center py-12 text-lg text-gray-600 dark:text-gray-400">No experts found</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {experts.map((expert) => (
              <div
                key={expert._id}
                onClick={() => handleExpertClick(expert._id)}
                className={`rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-2 ${
                  darkMode 
                    ? 'bg-gray-800 hover:shadow-purple-500/20' 
                    : 'bg-white hover:shadow-purple-600/20'
                }`}
              >
                <img
                  src={expert.imageUrl || 'https://via.placeholder.com/80'}
                  alt={expert.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4 shadow-md"
                />
                <div className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {expert.name}
                </div>
                <div className="text-purple-600 dark:text-purple-400 text-sm font-medium mb-3">
                  {expert.category}
                </div>
                <div className={`flex justify-around mt-4 pt-4 border-t text-sm ${darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'}`}>
                  <span>{expert.experience} years exp</span>
                  <span className="text-yellow-500 font-semibold">★ {expert.rating}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-8 mt-12">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-6 py-3 border-2 rounded-lg font-semibold transition-all ${
                currentPage === 1
                  ? 'opacity-40 cursor-not-allowed'
                  : darkMode
                  ? 'border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white hover:-translate-y-0.5'
                  : 'border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white hover:-translate-y-0.5'
              } ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              Previous
            </button>
            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-6 py-3 border-2 rounded-lg font-semibold transition-all ${
                currentPage === totalPages
                  ? 'opacity-40 cursor-not-allowed'
                  : darkMode
                  ? 'border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white hover:-translate-y-0.5'
                  : 'border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white hover:-translate-y-0.5'
              } ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ExpertListing;
