//backend\routes.js DOSYAMMM

const express = require('express');
const router = express.Router();
const { db } = require('./db');
const tmdb = require('./tmdb');
const {
    generateToken,
    hashPassword,
    comparePassword,
    authenticateToken,
    optionalAuth,
    validatePassword,
    validateEmail,
    validateUsername
} = require('./auth');

// ==================== AUTH ROUTES ====================

// Register
router.post('/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.valid) {
            return res.status(400).json({ success: false, message: usernameValidation.message });
        }

        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
            return res.status(400).json({ success: false, message: emailValidation.message });
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ success: false, message: passwordValidation.message });
        }

        // Check if user already exists
        const existingUserByEmail = await db.getUserByEmail(email);
        if (existingUserByEmail) {
            return res.status(400).json({ success: false, message: 'Bu email zaten kullanımda' });
        }

        const existingUserByUsername = await db.getUserByUsername(username);
        if (existingUserByUsername) {
            return res.status(400).json({ success: false, message: 'Bu kullanıcı adı zaten kullanımda' });
        }

        // Hash password and create user
        const hashedPassword = await hashPassword(password);
        const newUser = await db.createUser(username, email, hashedPassword);

        // Generate token
        const token = generateToken(newUser.id);

        res.status(201).json({
            success: true,
            message: 'Kullanıcı başarıyla oluşturuldu',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('❌ Register Error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
});

// Login
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await db.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Geçersiz email veya şifre' });
        }

        // Check password
        const validPassword = await comparePassword(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Geçersiz email veya şifre' });
        }

        // Generate token
        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Giriş başarılı',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('❌ Login Error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
});

// Get current user
router.get('/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await db.getUserById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error('❌ Get User Error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
});

// ==================== MOVIE ROUTES ====================

// Get popular movies
router.get('/movies/popular', optionalAuth, async (req, res) => {
    try {
        const page = req.query.page || 1;
        const tmdbData = await tmdb.getPopularMovies(page);

        // Add poster URLs without storing each movie (reduce DB load)
        const movies = tmdbData.results.map(movie => ({
            ...movie,
            poster_url: tmdb.getPosterUrl(movie.poster_path),
            backdrop_url: tmdb.getBackdropUrl(movie.backdrop_path)
        }));

        res.json({
            success: true,
            data: {
                ...tmdbData,
                results: movies
            }
        });

    } catch (error) {
        console.error('❌ Popular Movies Error:', error);
        res.status(500).json({ success: false, message: 'Filmler yüklenemedi' });
    }
});




router.get('/movies/most-reviewed', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;

        // VERİTABANINDAN AL - TMDB API ÇAĞRISI YAPMA
        const mostReviewed = await db.getMostReviewedMovies(limit);

        if (!mostReviewed || mostReviewed.length === 0) {
            return res.json({
                success: true,
                data: [],
                message: 'No reviewed movies found yet'
            });
        }

        const moviesWithUrls = mostReviewed.map(movie => ({
            ...movie,
            poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
            backdrop_url: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
            review_count: parseInt(movie.review_count) || 0,
            avg_user_rating: movie.avg_user_rating ? parseFloat(movie.avg_user_rating).toFixed(1) : null
        }));

        res.json({
            success: true,
            data: moviesWithUrls
        });

    } catch (error) {
        console.error('❌ Most Reviewed Movies Route Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get movie details
router.get('/movies/:id', optionalAuth, async (req, res) => {
    try {
        const movieId = req.params.id;

        // Get movie details from TMDB
        const movieDetails = await tmdb.getMovieDetails(movieId);
        const movieCredits = await tmdb.getMovieCredits(movieId);

        // Store in database
        const formattedMovie = tmdb.formatMovieForDB(movieDetails);
        await db.insertOrUpdateMovie(formattedMovie);

        // Get user-specific data if authenticated
        let userMovieData = null;
        if (req.userId) {
            userMovieData = await db.checkUserMovieStatus(req.userId, movieId);
        }

        // Get reviews
        const reviews = await db.getMovieReviews(movieId);

        res.json({
            success: true,
            data: {
                ...movieDetails,
                poster_url: tmdb.getPosterUrl(movieDetails.poster_path),
                backdrop_url: tmdb.getBackdropUrl(movieDetails.backdrop_path),
                credits: movieCredits,
                user_data: userMovieData,
                reviews
            }
        });

    } catch (error) {
        console.error('❌ Movie Details Error:', error);
        res.status(500).json({ success: false, message: 'Film detayları yüklenemedi' });
    }
});


//!!TENİ EKLENDİ, OLMUYOR AMA HALLEDİCEZ:
// Get user's reviews
router.get('/user/reviews', authenticateToken, async (req, res) => {
    try {
        const reviews = await db.getUserReviews(req.userId);

        // Add poster URLs
        const reviewsWithUrls = reviews.map(review => ({
            ...review,
            poster_url: tmdb.getPosterUrl(review.poster_path)
        }));

        res.json({
            success: true,
            data: reviewsWithUrls
        });

    } catch (error) {
        console.error('❌ Get User Reviews Error:', error);
        res.status(500).json({ success: false, message: 'Yorumlar yüklenemedi' });
    }
});

// Search movies
router.get('/movies/search/:query', async (req, res) => {
    try {
        const query = req.params.query;
        const page = req.query.page || 1;

        const searchResults = await tmdb.searchMovies(query, page);

        // Add poster URLs
        const movies = searchResults.results.map(movie => ({
            ...movie,
            poster_url: tmdb.getPosterUrl(movie.poster_path),
            backdrop_url: tmdb.getBackdropUrl(movie.backdrop_path)
        }));

        res.json({
            success: true,
            data: {
                ...searchResults,
                results: movies
            }
        });

    } catch (error) {
        console.error('❌ Search Movies Error:', error);
        res.status(500).json({ success: false, message: 'Arama başarısız' });
    }
});

// ==================== USER MOVIE ROUTES ====================

// Add movie to user list
router.post('/user/add-to-list', authenticateToken, async (req, res) => {
    try {
        const { movieId, listType } = req.body;

        if (!['watchlist', 'watched'].includes(listType)) {
            return res.status(400).json({ success: false, message: 'Geçersiz liste türü' });
        }

        // Get movie from TMDB and store in database
        const movieDetails = await tmdb.getMovieDetails(movieId);
        const formattedMovie = tmdb.formatMovieForDB(movieDetails);
        await db.insertOrUpdateMovie(formattedMovie);

        // Add to user list
        await db.addToUserList(req.userId, movieId, listType);

        res.json({
            success: true,
            message: `Film ${listType === 'watchlist' ? 'izlenecekler' : 'izlenenler'} listesine eklendi`
        });

    } catch (error) {
        console.error('❌ Add to List Error:', error);
        res.status(500).json({ success: false, message: 'Film listeye eklenemedi' });
    }
});

// Remove movie from user list
router.delete('/user/remove-from-list', authenticateToken, async (req, res) => {
    try {
        const { movieId, listType } = req.body;

        await db.removeFromUserList(req.userId, movieId, listType);

        res.json({
            success: true,
            message: `Film ${listType === 'watchlist' ? 'izlenecekler' : 'izlenenler'} listesinden çıkarıldı`
        });

    } catch (error) {
        console.error('❌ Remove from List Error:', error);
        res.status(500).json({ success: false, message: 'Film listeden çıkarılamadı' });
    }
});

// Get user's movie lists
router.get('/user/lists/:listType', authenticateToken, async (req, res) => {
    try {
        const { listType } = req.params;

        if (!['watchlist', 'watched'].includes(listType)) {
            return res.status(400).json({ success: false, message: 'Geçersiz liste türü' });
        }

        const movies = await db.getUserMovies(req.userId, listType);

        // Add poster URLs
        const moviesWithUrls = movies.map(movie => ({
            ...movie,
            poster_url: tmdb.getPosterUrl(movie.poster_path),
            backdrop_url: tmdb.getBackdropUrl(movie.backdrop_path)
        }));

        res.json({
            success: true,
            data: moviesWithUrls
        });

    } catch (error) {
        console.error('❌ Get User Lists Error:', error);
        res.status(500).json({ success: false, message: 'Listeler yüklenemedi' });
    }
});

// Rate movie
router.post('/user/rate', authenticateToken, async (req, res) => {
    try {
        const { movieId, rating } = req.body;

        if (!rating || rating < 1 || rating > 10) {
            return res.status(400).json({ success: false, message: 'Puan 1-10 arasında olmalıdır' });
        }

        // Get movie from TMDB and store in database
        const movieDetails = await tmdb.getMovieDetails(movieId);
        const formattedMovie = tmdb.formatMovieForDB(movieDetails);
        await db.insertOrUpdateMovie(formattedMovie);

        // Rate movie
        await db.rateMovie(req.userId, movieId, rating);

        res.json({
            success: true,
            message: 'Puan başarıyla verildi'
        });

    } catch (error) {
        console.error('❌ Rate Movie Error:', error);
        res.status(500).json({ success: false, message: 'Puan verilemedi' });
    }
});

// Review movie
// Routes.js - Review movie endpoint'ini değiştir:

// Review movie
router.post('/user/review', authenticateToken, async (req, res) => {
    try {
        const { movieId, reviewText } = req.body;

        if (!reviewText || reviewText.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Yorum boş olamaz' });
        }

        // Get movie from TMDB and store in database
        const movieDetails = await tmdb.getMovieDetails(movieId);
        const formattedMovie = tmdb.formatMovieForDB(movieDetails);
        await db.insertOrUpdateMovie(formattedMovie);

        // Add review
        const newReview = await db.reviewMovie(req.userId, movieId, reviewText.trim());

        // Get user info for response
        const user = await db.getUserById(req.userId);

        // Frontend'in beklediği format
        const reviewObj = {
            id: newReview.id,
            review_text: newReview.review_text,
            created_at: newReview.created_at || new Date().toISOString(),
            username: user.username,
            user_id: req.userId,
            rating: null // Eğer rating varsa buraya ekle
        };

        res.json({
            success: true,
            message: 'Yorum başarıyla eklendi',
            review: reviewObj
        });

    } catch (error) {
        console.error('❌ Review Movie Error:', error);
        res.status(500).json({ success: false, message: 'Yorum eklenemedi' });
    }
});

// ==================== USER REVIEWS UPDATE/DELETE ====================

// Update review
router.put('/user/review/:id', authenticateToken, async (req, res) => {
    try {
        const reviewId = req.params.id;
        const { reviewText } = req.body;

        if (!reviewText || reviewText.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Yorum boş olamaz' });
        }

        // Check if review belongs to user
        const review = await db.getReviewById(reviewId);
        if (!review || review.user_id !== req.userId) {
            return res.status(403).json({ success: false, message: 'Bu yorumu güncelleme yetkiniz yok' });
        }

        const updated = await db.updateReview(reviewId, reviewText.trim());

        res.json({
            success: true,
            message: 'Yorum güncellendi',
            data: updated
        });

    } catch (error) {
        console.error('❌ Update Review Error:', error);
        res.status(500).json({ success: false, message: 'Yorum güncellenemedi' });
    }
});

// Delete review
router.delete('/user/review/:id', authenticateToken, async (req, res) => {
    try {
        const reviewId = req.params.id;

        const review = await db.getReviewById(reviewId);
        if (!review || review.user_id !== req.userId) {
            return res.status(403).json({ success: false, message: 'Bu yorumu silme yetkiniz yok' });
        }

        await db.deleteReview(reviewId);

        res.json({
            success: true,
            message: 'Yorum silindi'
        });

    } catch (error) {
        console.error('❌ Delete Review Error:', error);
        res.status(500).json({ success: false, message: 'Yorum silinemedi' });
    }
});


// ==================== USER PROFILE ROUTES ====================

// Get user profile
router.get('/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await db.getUserById(req.userId);
        const watchlist = await db.getUserMovies(req.userId, 'watchlist');
        const watched = await db.getUserMovies(req.userId, 'watched');

        // Add poster URLs
        const watchlistWithUrls = watchlist.map(movie => ({
            ...movie,
            poster_url: tmdb.getPosterUrl(movie.poster_path)
        }));

        const watchedWithUrls = watched.map(movie => ({
            ...movie,
            poster_url: tmdb.getPosterUrl(movie.poster_path)
        }));

        res.json({
            success: true,
            data: {
                user,
                watchlist: watchlistWithUrls,
                watched: watchedWithUrls,
                stats: {
                    watchlist_count: watchlist.length,
                    watched_count: watched.length
                }
            }
        });

    } catch (error) {
        console.error('❌ Get Profile Error:', error);
        res.status(500).json({ success: false, message: 'Profil yüklenemedi' });
    }
});

// Update username
router.put('/user/username', authenticateToken, async (req, res) => {
    try {
        const { newUsername } = req.body;

        const validation = validateUsername(newUsername);
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.message });
        }

        // Check if username is taken
        const existingUser = await db.getUserByUsername(newUsername);
        if (existingUser && existingUser.id !== req.userId) {
            return res.status(400).json({ success: false, message: 'Bu kullanıcı adı zaten kullanımda' });
        }

        const updatedUser = await db.updateUsername(req.userId, newUsername);

        // 🔥 Güncelleme: user objesi döndürülüyor
        res.json({
            success: true,
            message: 'Kullanıcı adı güncellendi',
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                created_at: updatedUser.created_at
            }
        });

    } catch (error) {
        console.error('❌ Update Username Error:', error);
        res.status(500).json({ success: false, message: 'Kullanıcı adı güncellenemedi' });
    }
});


// Check movie status for user
router.get('/user/movie-status/:movieId', authenticateToken, async (req, res) => {
    try {
        const movieId = req.params.movieId;
        const status = await db.checkUserMovieStatus(req.userId, movieId);

        res.json({
            success: true,
            data: {
                in_watchlist: status?.lists?.includes('watchlist') || false,
                in_watched: status?.lists?.includes('watched') || false,
                rating: status?.rating || null,
                review: status?.review || null
            }
        });

    } catch (error) {
        console.error('❌ Movie Status Error:', error);
        res.status(500).json({ success: false, message: 'Film durumu alınamadı' });
    }
});

// Get movie genres
router.get('/genres', async (req, res) => {
    try {
        const genresData = await tmdb.getGenres();

        res.json({
            success: true,
            data: genresData.genres
        });

    } catch (error) {
        console.error('❌ Genres Error:', error);
        res.json({
            success: true,
            data: []
        });
    }
});

// Get movies by genre
router.get('/movies/genre/:genreId', async (req, res) => {
    try {
        const genreId = req.params.genreId;
        const page = req.query.page || 1;

        const tmdbData = await tmdb.getMoviesByGenre(genreId, page);

        // Store movies in database and add URLs
        const movies = [];
        for (const movie of tmdbData.results) {
            const formattedMovie = tmdb.formatMovieForDB(movie);
            await db.insertOrUpdateMovie(formattedMovie);

            movies.push({
                ...movie,
                poster_url: tmdb.getPosterUrl(movie.poster_path),
                backdrop_url: tmdb.getBackdropUrl(movie.backdrop_path)
            });
        }

        res.json({
            success: true,
            data: {
                ...tmdbData,
                results: movies
            }
        });

    } catch (error) {
        console.error('❌ Genre Movies Error:', error);
        res.json({
            success: true,
            data: {
                page: 1,
                results: [],
                total_pages: 0,
                total_results: 0
            }
        });
    }
});

// Get now playing movies  
router.get('/movies/now-playing', optionalAuth, async (req, res) => {
    try {
        const page = req.query.page || 1;
        const tmdbData = await tmdb.getNowPlayingMovies(page);

        // Store movies in database and add URLs
        const movies = [];
        for (const movie of tmdbData.results) {
            const formattedMovie = tmdb.formatMovieForDB(movie);
            await db.insertOrUpdateMovie(formattedMovie);

            movies.push({
                ...movie,
                poster_url: tmdb.getPosterUrl(movie.poster_path),
                backdrop_url: tmdb.getBackdropUrl(movie.backdrop_path)
            });
        }

        res.json({
            success: true,
            data: {
                ...tmdbData,
                results: movies
            }
        });

    } catch (error) {
        console.error('❌ Now Playing Movies Error:', error);
        res.json({
            success: true,
            data: {
                page: 1,
                results: [],
                total_pages: 0,
                total_results: 0
            }
        });
    }
});

// Get top rated movies
router.get('/movies/top-rated', optionalAuth, async (req, res) => {
    try {
        const page = req.query.page || 1;
        const tmdbData = await tmdb.getTopRatedMovies(page);

        // Add poster URLs without heavy DB operations
        const movies = tmdbData.results.map(movie => ({
            ...movie,
            poster_url: tmdb.getPosterUrl(movie.poster_path),
            backdrop_url: tmdb.getBackdropUrl(movie.backdrop_path)
        }));

        res.json({
            success: true,
            data: {
                ...tmdbData,
                results: movies
            }
        });

    } catch (error) {
        console.error('❌ Top Rated Movies Error:', error);
        res.json({
            success: true,
            data: {
                page: 1,
                results: [],
                total_pages: 0,
                total_results: 0
            }
        });
    }
});

// ==================== GENRE ROUTES ====================

// Get trending movies
router.get('/movies/trending', async (req, res) => {
    try {
        const timeWindow = req.query.time_window || 'week';
        console.log(`📊 Fetching trending movies for ${timeWindow}`);

        const tmdbData = await tmdb.getTrendingMovies(timeWindow);
        console.log(`📊 TMDB returned ${tmdbData.results.length} trending movies`);

        // Add poster URLs  
        const movies = tmdbData.results.map(movie => ({
            ...movie,
            poster_url: tmdb.getPosterUrl(movie.poster_path),
            backdrop_url: tmdb.getBackdropUrl(movie.backdrop_path)
        }));

        res.json({
            success: true,
            data: {
                ...tmdbData,
                results: movies
            }
        });

    } catch (error) {
        console.error('❌ Trending Movies Route Error:', error);

        // Return graceful fallback
        res.json({
            success: true,
            data: {
                page: 1,
                results: [],
                total_pages: 0,
                total_results: 0
            },
            message: 'Trending movies temporarily unavailable'
        });
    }
});

// ==================== HEALTH CHECK ====================

router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'CineLog API çalışıyor',
        timestamp: new Date().toISOString()
    });
});


// DEBUG: Test endpoint for database connection
router.get('/debug/database', async (req, res) => {
    try {
        console.log('🔍 Debug: Testing database connection...');

        // Test 1: Basic query
        const testQuery = await db.query('SELECT NOW() as current_time');
        console.log('✅ Database connection OK:', testQuery.rows[0]);

        // Test 2: Check tables
        const tableCheck = await db.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('📊 Available tables:', tableCheck.rows.map(r => r.table_name));

        // Test 3: Check data counts
        const userCount = await db.query('SELECT COUNT(*) as count FROM users');
        const movieCount = await db.query('SELECT COUNT(*) as count FROM movies');
        const reviewCount = await db.query('SELECT COUNT(*) as count FROM user_reviews');

        console.log('📈 Data counts:', {
            users: userCount.rows[0].count,
            movies: movieCount.rows[0].count,
            reviews: reviewCount.rows[0].count
        });

        res.json({
            success: true,
            data: {
                database_connection: 'OK',
                current_time: testQuery.rows[0].current_time,
                tables: tableCheck.rows.map(r => r.table_name),
                counts: {
                    users: parseInt(userCount.rows[0].count),
                    movies: parseInt(movieCount.rows[0].count),
                    reviews: parseInt(reviewCount.rows[0].count)
                }
            }
        });

    } catch (error) {
        console.error('❌ Debug endpoint error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

module.exports = router;