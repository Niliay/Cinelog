//frontend\src\context\AuthContext.jsx dosyamm
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, authAPI } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = auth.getToken();
                const savedUser = auth.getUser();

                if (token && savedUser) setUser(savedUser);
            } catch (error) {
                auth.clearAuth();
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        initializeAuth();
    }, []);

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);
            if (response.data.success) {
                const { token, user } = response.data;
                auth.setToken(token);
                auth.setUser(user);
                setUser(user);
                return { success: true, user };
            }
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Giriş başarısız' };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            if (response.data.success) {
                const { token, user } = response.data;
                auth.setToken(token);
                auth.setUser(user);
                setUser(user);
                return { success: true };
            }
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Kayıt başarısız' };
        }
    };

    const logout = () => {
        auth.clearAuth();
        setUser(null);
    };

    const value = {
        user,
        setUser,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
