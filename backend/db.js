//backend\db.js DOSYAM

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Test database connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Database connection error:', err);
});

// Helper function to execute queries
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('📊 Query executed', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('❌ Database query error:', error);
        throw error;
    }
};

// Database helper functions
const db = {
    // User operations
    async createUser(username, email, passwordHash) {
        const text = 'INSERT INTO users(username, email, password_hash) VALUES($1, $2, $3) RETURNING id, username, email, created_at';
        const values = [username, email, passwordHash];
        const result = await query(text, values);
        return result.rows[0];
    },

    async getUserByEmail(email) {
        const text = 'SELECT * FROM users WHERE email = $1';
        const result = await query(text, [email]);
        return result.rows[0];
    },

    async getUserByUsername(username) {
        const text = 'SELECT * FROM users WHERE username = $1';
        const result = await query(text, [username]);
        return result.rows[0];
    },

    async getUserById(id) {
        const text = 'SELECT id, username, email, created_at FROM users WHERE id = $1';
        const result = await query(text, [id]);
        return result.rows[0];
    },

    async updateUsername(userId, newUsername) {
        const text = 'UPDATE users SET username = $1 WHERE id = $2 RETURNING username';
        const result = await query(text, [newUsername, userId]);
        return result.rows[0];
    },

    // Movie operations
    async insertOrUpdateMovie(movieData) {
        const text = `
      INSERT INTO movies (id, title, overview, poster_path, backdrop_path, release_date, vote_average, genre_ids)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        overview = EXCLUDED.overview,
        poster_path = EXCLUDED.poster_path,
        backdrop_path = EXCLUDED.backdrop_path,
        release_date = EXCLUDED.release_date,
        vote_average = EXCLUDED.vote_average,
        genre_ids = EXCLUDED.genre_ids
      RETURNING *`;

        const values = [
            movieData.id,
            movieData.title,
            movieData.overview,
            movieData.poster_path,
            movieData.backdrop_path,
            movieData.release_date,
            movieData.vote_average,
            movieData.genre_ids
        ];

        const result = await query(text, values);
        return result.rows[0];
    },

    async getMovie(movieId) {
        const text = 'SELECT * FROM movies WHERE id = $1';
        const result = await query(text, [movieId]);
        return result.rows[0];
    },

    // User movie list operations
    async addToUserList(userId, movieId, listType) {
        const text = `
      INSERT INTO user_movies (user_id, movie_id, list_type)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, movie_id, list_type) DO NOTHING
      RETURNING *`;
        const result = await query(text, [userId, movieId, listType]);
        return result.rows[0];
    },

    async removeFromUserList(userId, movieId, listType) {
        const text = 'DELETE FROM user_movies WHERE user_id = $1 AND movie_id = $2 AND list_type = $3';
        await query(text, [userId, movieId, listType]);
    },

    async getUserMovies(userId, listType) {
        const text = `
      SELECT m.*, um.added_at, ur.rating, urev.review_text
      FROM user_movies um
      JOIN movies m ON um.movie_id = m.id
      LEFT JOIN user_ratings ur ON ur.user_id = um.user_id AND ur.movie_id = m.id
      LEFT JOIN user_reviews urev ON urev.user_id = um.user_id AND urev.movie_id = m.id
      WHERE um.user_id = $1 AND um.list_type = $2
      ORDER BY um.added_at DESC`;
        const result = await query(text, [userId, listType]);
        return result.rows;
    },

    async checkUserMovieStatus(userId, movieId) {
        const text = `
        SELECT 
            ARRAY_AGG(DISTINCT list_type) as lists,
            (SELECT rating FROM user_ratings WHERE user_id = $1 AND movie_id = $2) as rating,
            (SELECT json_build_object(
                'id', id,
                'review_text', review_text,
                'created_at', created_at
            ) FROM user_reviews WHERE user_id = $1 AND movie_id = $2) as review
        FROM user_movies 
        WHERE user_id = $1 AND movie_id = $2`;
        const result = await query(text, [userId, movieId]);

        const row = result.rows[0];
        if (!row || !row.lists) {
            return {
                lists: [],
                rating: null,
                review: null
            };
        }

        return {
            lists: row.lists || [],
            rating: row.rating,
            review: row.review
        };
    },
    // Rating operations
    async rateMovie(userId, movieId, rating) {
        const text = `
      INSERT INTO user_ratings (user_id, movie_id, rating)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, movie_id) 
      DO UPDATE SET rating = EXCLUDED.rating, updated_at = CURRENT_TIMESTAMP
      RETURNING *`;
        const result = await query(text, [userId, movieId, rating]);
        return result.rows[0];
    },

    // Review operations
    async reviewMovie(userId, movieId, reviewText) {
        const text = `
      INSERT INTO user_reviews (user_id, movie_id, review_text)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, movie_id) 
      DO UPDATE SET review_text = EXCLUDED.review_text, updated_at = CURRENT_TIMESTAMP
      RETURNING *`;
        const result = await query(text, [userId, movieId, reviewText]);
        return result.rows[0];
    },

    async getReviewById(reviewId) {
        const text = 'SELECT * FROM user_reviews WHERE id = $1';
        const result = await query(text, [reviewId]);
        return result.rows[0];
    },

    //!!BU DA YENİ EKLENDİ
    // User's all reviews
    async getUserReviews(userId) {
        const text = `
        SELECT 
            ur.id,
            ur.review_text,
            ur.created_at,
            ur.updated_at,
            m.id as movie_id,
            m.title as movie_title,
            m.poster_path,
            m.release_date,
            urt.rating
        FROM user_reviews ur
        JOIN movies m ON ur.movie_id = m.id
        LEFT JOIN user_ratings urt ON urt.user_id = ur.user_id AND urt.movie_id = ur.movie_id
        WHERE ur.user_id = $1
        ORDER BY ur.created_at DESC`;
        const result = await query(text, [userId]);
        return result.rows;
    },

    async updateReview(reviewId, reviewText) {
        const text = `
      UPDATE user_reviews
      SET review_text = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *`;
        const result = await query(text, [reviewText, reviewId]);
        return result.rows[0];
    },

    async deleteReview(reviewId) {
        const text = 'DELETE FROM user_reviews WHERE id = $1';
        await query(text, [reviewId]);
        return true;
    },




    async getMovieReviews(movieId) {
        const text = `
      SELECT ur.review_text, ur.created_at, u.username, urt.rating
      FROM user_reviews ur
      JOIN users u ON ur.user_id = u.id
      LEFT JOIN user_ratings urt ON urt.user_id = ur.user_id AND urt.movie_id = ur.movie_id
      WHERE ur.movie_id = $1
      ORDER BY ur.created_at DESC`;
        const result = await query(text, [movieId]);
        return result.rows;
    },

    async getMostReviewedMovies(limit = 10) {
        try {
            console.log(`🔍 Getting most reviewed movies with limit: ${limit}`);

            const text = `
        SELECT 
            m.id,
            m.title,
            m.overview,
            m.poster_path,
            m.backdrop_path,
            m.release_date,
            m.vote_average,
            COUNT(ur.id)::int AS review_count,
            COALESCE(AVG(urt.rating)::numeric(3,1), 0) AS avg_user_rating
        FROM movies m
        INNER JOIN user_reviews ur ON m.id = ur.movie_id
        LEFT JOIN user_ratings urt ON m.id = urt.movie_id
        GROUP BY m.id, m.title, m.overview, m.poster_path, m.backdrop_path, m.release_date, m.vote_average
        ORDER BY review_count DESC, avg_user_rating DESC
        LIMIT $1;
        `;

            const result = await query(text, [limit]);
            console.log(`✅ Found ${result.rows.length} most reviewed movies`);

            return result.rows;

        } catch (error) {
            console.error('❌ getMostReviewedMovies Error:', error);
            console.error('Error details:', error.message);
            return [];
        }
    }



};





module.exports = { pool, query, db };