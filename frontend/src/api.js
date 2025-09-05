import axios from 'axios';

// Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Storage helper (sessionStorage + in-memory fallback)
let authStorage = {};

const storage = {
    setItem: (key, value) => {
        try { sessionStorage.setItem(key, value); authStorage[key] = value; }
        catch { authStorage[key] = value; }
    },
    getItem: (key) => {
        try { return sessionStorage.getItem(key) || authStorage[key]; }
        catch { return authStorage[key]; }
    },
    removeItem: (key) => {
        try { sessionStorage.removeItem(key); } catch { }
        delete authStorage[key];
    }
};

// Auth helper
export const auth = {
    setToken: (token) => storage.setItem('cinelog_token', token),
    getToken: () => storage.getItem('cinelog_token'),
    setUser: (user) => storage.setItem('cinelog_user', JSON.stringify(user)),
    getUser: () => { const user = storage.getItem('cinelog_user'); return user ? JSON.parse(user) : null; },
    clearAuth: () => { storage.removeItem('cinelog_token'); storage.removeItem('cinelog_user'); }
};

// Axios interceptors
api.interceptors.request.use(
    (config) => {
        const token = auth.getToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            auth.clearAuth();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getCurrentUser: () => api.get('/auth/me'),
    logout: () => { auth.clearAuth(); }
};

// Movies API
export const moviesAPI = {
    getPopular: (page = 1) => api.get(`/movies/popular?page=${page}`),
    getDetails: (movieId) => api.get(`/movies/${movieId}`),
    search: (query, page = 1) => api.get(`/movies/search/${query}?page=${page}`),
    getGenres: () => api.get('/genres'),
    getByGenre: (genreId, page = 1) => api.get(`/movies/genre/${genreId}?page=${page}`),

    // YENİ: En çok yorum alan filmler
    getMostReviewed: (limit = 8) => api.get(`/movies/most-reviewed?limit=${limit}`)
};

// User API
export const userAPI = {
    getProfile: () => api.get('/user/profile'),
    updateUsername: (newUsername) => api.put('/user/username', { newUsername }),
    addToList: (movieId, listType) => api.post('/user/add-to-list', { movieId, listType }),
    removeFromList: (movieId, listType) => api.delete('/user/remove-from-list', { data: { movieId, listType } }),
    getLists: (listType) => api.get(`/user/lists/${listType}`),
    rateMovie: (movieId, rating) => api.post('/user/rate', { movieId, rating }),
    reviewMovie: (movieId, reviewText) => api.post('/user/review', { movieId, reviewText }),
    getMovieStatus: (movieId) => api.get(`/user/movie-status/${movieId}`),

    // eni eklenen fonksiyonlar yorum guncelleme içinnnn
    // Review güncelleme
    updateReview: (reviewId, reviewText) => api.put(`/user/review/${reviewId}`, { reviewText }),

    // Review silme
    deleteReview: (reviewId) => api.delete(`/user/review/${reviewId}`),

    // Movie durumunu kontrol etme
    getMovieStatus: (movieId) => api.get(`/user/movie-status/${movieId}`),

    //YENİ OLANNN
    getUserReviews: () => api.get('/user/reviews'),  // axiosInstance yerine api
};

export default api;
