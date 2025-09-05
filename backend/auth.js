//backend\auth.js DOSYAM:
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Geçersiz token');
    }
};

// Hash password
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Erişim engellendi. Token gerekli.'
        });
    }

    try {
        const decoded = verifyToken(token);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Geçersiz veya süresi dolmuş token'
        });
    }
};

// Optional authentication middleware (doesn't require token)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = verifyToken(token);
            req.userId = decoded.userId;
        } catch (error) {
            // Token geçersiz ama zorunlu değil, devam et
            req.userId = null;
        }
    } else {
        req.userId = null;
    }

    next();
};

// Validate password strength
const validatePassword = (password) => {
    if (password.length < 6) {
        return { valid: false, message: 'Şifre en az 6 karakter olmalıdır' };
    }
    return { valid: true };
};

// Validate email format
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Geçersiz email formatı' };
    }
    return { valid: true };
};

// Validate username
const validateUsername = (username) => {
    if (username.length < 3) {
        return { valid: false, message: 'Kullanıcı adı en az 3 karakter olmalıdır' };
    }
    if (username.length > 20) {
        return { valid: false, message: 'Kullanıcı adı en fazla 20 karakter olabilir' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { valid: false, message: 'Kullanıcı adı sadece harf, rakam ve _ içerebilir' };
    }
    return { valid: true };
};

module.exports = {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword,
    authenticateToken,
    optionalAuth,
    validatePassword,
    validateEmail,
    validateUsername
};