import axios from 'axios';

const API_URL = process.env.BACKEND_URL || 'http://localhost:9066/api';

console.log('API URL:', API_URL);
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const expertAPI = {
    getExperts: (params) => api.get('/experts/get/v1', { params }),
    getCategories: () => api.get('/experts/categories/v1'),
    getExpertById: (id) => api.get(`/experts/${id}/v1`)
};

export const bookingAPI = {
    createBooking: (data) => api.post('/bookings/create/v1', data),
    getBookings: (params) => api.get('/bookings/get/v1', { params }),
    updateBookingStatus: (id, status) => api.patch(`/bookings/${id}/status/v1`, { status }),
    updateBooking: (id, data) => api.patch(`/bookings/${id}/v1`, data)
};

export default api;
