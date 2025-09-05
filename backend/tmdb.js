const axios = require('axios');
require('dotenv').config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Debug TMDB 
console.log('TMDB Configuration:', {
    baseURL: TMDB_BASE_URL,
    apiKeyExists: !!TMDB_API_KEY,
    apiKeyLength: TMDB_API_KEY ? TMDB_API_KEY.length : 0
});

// Create axios instance for TMDB
const tmdbApi = axios.create({
    baseURL: TMDB_BASE_URL,
    timeout: 10000, // 10 second timeout
    params: {
        api_key: TMDB_API_KEY,
        language: 'tr-TR' // Türkçe dil desteği
    }
});

// Add request logging
tmdbApi.interceptors.request.use(
    (config) => {
        // Full URL'i logla
        const fullUrl = `${config.baseURL}${config.url}`;
        console.log(`🎬 TMDB Request: ${config.method?.toUpperCase()} ${fullUrl}`);
        console.log(`🎬 TMDB Params:`, config.params);
        return config;
    },
    (error) => {
        console.error('🚨 TMDB Request Error:', error);
        return Promise.reject(error);
    }
);

tmdbApi.interceptors.response.use(
    (response) => {
        const fullUrl = `${response.config.baseURL}${response.config.url}`;
        console.log(`✅ TMDB Response: ${fullUrl} - ${response.status}`);
        return response;
    },
    (error) => {
        const fullUrl = `${error.config?.baseURL}${error.config?.url}`;
        console.error(`❌ TMDB Response Error: ${fullUrl} - ${error.response?.status} - ${error.message}`);
        return Promise.reject(error);
    }
);

const tmdb = {
    // Get popular movies
    async getPopularMovies(page = 1) {
        try {
            const response = await tmdbApi.get('/movie/popular', {
                params: { page }
            });
            return response.data;
        } catch (error) {
            console.error('❌ TMDB Popular Movies Error:', error.message);
            throw new Error('Film verileri alınamadı');
        }
    },

    // Get movie details
    async getMovieDetails(movieId) {
        try {
            const response = await tmdbApi.get(`/movie/${movieId}`);
            return response.data;
        } catch (error) {
            console.error('❌ TMDB Movie Details Error:', error.message);
            throw new Error('Film detayları alınamadı');
        }
    },

    // Search movies
    async searchMovies(query, page = 1) {
        try {
            const response = await tmdbApi.get('/search/movie', {
                params: { query, page }
            });
            return response.data;
        } catch (error) {
            console.error('❌ TMDB Search Error:', error.message);
            throw new Error('Film arama başarısız');
        }
    },

    // Get movie credits (cast & crew)
    async getMovieCredits(movieId) {
        try {
            const response = await tmdbApi.get(`/movie/${movieId}/credits`);
            return response.data;
        } catch (error) {
            console.error('❌ TMDB Credits Error:', error.message);
            throw new Error('Film kadrosu alınamadı');
        }
    },

    // Get now playing movies
    async getNowPlayingMovies(page = 1) {
        try {
            console.log(`🎬 Fetching now playing movies: page ${page}`);
            const response = await tmdbApi.get('/movie/now_playing', {
                params: { page }
            });
            console.log(`✅ TMDB Now Playing successful: ${response.data.results.length} movies`);
            return response.data;
        } catch (error) {
            console.error('❌ TMDB Now Playing Error:', error.response?.status, error.response?.data, error.message);
            return {
                page: 1,
                results: [],
                total_pages: 0,
                total_results: 0
            };
        }
    },

    // Get top rated movies - doğru endpoint
    async getTopRatedMovies(page = 1) {
        try {
            console.log(`⭐ Fetching top rated movies: page ${page}`);
            // Doğru TMDB endpoint /movie/top_rated DEĞİL /movie/top-rated
            const response = await tmdbApi.get('/movie/top_rated', {
                params: { page }
            });
            console.log(`✅ TMDB Top Rated successful: ${response.data.results.length} movies`);
            return response.data;
        } catch (error) {
            console.error('❌ TMDB Top Rated Error:', error.response?.status, error.response?.data, error.message);
            return {
                page: 1,
                results: [],
                total_pages: 0,
                total_results: 0
            };
        }
    },

    // Get movie genres
    async getGenres() {
        try {
            console.log('🎭 Fetching movie genres');
            const response = await tmdbApi.get('/genre/movie/list');
            console.log(`✅ TMDB Genres successful: ${response.data.genres.length} genres`);
            return response.data;
        } catch (error) {
            console.error('❌ TMDB Genres Error:', error.response?.status, error.message);
            return { genres: [] };
        }
    },

    // Get movies by genre
    async getMoviesByGenre(genreId, page = 1) {
        try {
            console.log(`🎭 Fetching movies for genre ${genreId}, page ${page}`);
            const response = await tmdbApi.get('/discover/movie', {
                params: {
                    with_genres: genreId,
                    page,
                    sort_by: 'popularity.desc'
                }
            });
            console.log(`✅ TMDB Genre Movies successful: ${response.data.results.length} movies`);
            return response.data;
        } catch (error) {
            console.error('❌ TMDB Genre Movies Error:', error.response?.status, error.message);
            return {
                page: 1,
                results: [],
                total_pages: 0,
                total_results: 0
            };
        }
    },

    // Get movie videos (trailers, etc.)
    async getMovieVideos(movieId) {
        try {
            const response = await tmdbApi.get(`/movie/${movieId}/videos`);
            return response.data;
        } catch (error) {
            console.error('❌ TMDB Videos Error:', error.message);
            throw new Error('Film videoları alınamadı');
        }
    },

    // Format movie data for database
    formatMovieForDB(tmdbMovie) {
        return {
            id: tmdbMovie.id,
            title: tmdbMovie.title,
            overview: tmdbMovie.overview,
            poster_path: tmdbMovie.poster_path,
            backdrop_path: tmdbMovie.backdrop_path,
            release_date: tmdbMovie.release_date,
            vote_average: tmdbMovie.vote_average,
            genre_ids: tmdbMovie.genre_ids || []
        };
    },

    // Get full poster URL
    getPosterUrl(posterPath, size = 'w500') {
        if (!posterPath) return null;
        return `https://image.tmdb.org/t/p/${size}${posterPath}`;
    },

    // Get full backdrop URL
    getBackdropUrl(backdropPath, size = 'w1280') {
        if (!backdropPath) return null;
        return `https://image.tmdb.org/t/p/${size}${backdropPath}`;
    }
};

module.exports = tmdb;