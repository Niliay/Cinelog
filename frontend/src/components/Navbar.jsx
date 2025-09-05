//frontend\src\components\Navbar.jsx dosyamm

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, User, LogOut, Menu, X, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [extraMenuOpen, setExtraMenuOpen] = useState(false); // 🆕 Hakkımızda menüsü için
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
        navigate('/');
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <nav className="bg-dark-200 border-b border-dark-300 sticky top-0 z-50 backdrop-filter backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center space-x-2 text-3xl font-bold text-white hover:text-gray-300 transition-colors"
                        onClick={closeMobileMenu}
                    >
                        <Film size={28} />
                        <span>Cinelog</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link
                            to="/"
                            className="flex items-center space-x-1 text-dark-700 hover:text-white transition-colors"
                        >
                            <Home size={18} />
                            <span>Anasayfa</span>
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/profile"
                                    className="flex items-center space-x-1 text-dark-700 hover:text-white transition-colors"
                                >
                                    <User size={18} />
                                    <span>{user?.username}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 text-dark-700 hover:text-red-400 transition-colors"
                                >
                                    <LogOut size={18} />
                                    <span>Çıkış</span>
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-dark-700 hover:text-white transition-colors"
                                >
                                    Giriş Yap
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn-primary"
                                >
                                    Kayıt Ol
                                </Link>
                            </div>
                        )}

                        {/* 🆕 Ekstra Menü (Hakkımızda, Gizlilik, Kullanım) */}
                        <div className="relative">
                            <button
                                onClick={() => setExtraMenuOpen(!extraMenuOpen)}
                                className="p-2 text-dark-700 hover:text-white transition-colors"
                            >
                                <Menu size={22} />
                            </button>
                            {extraMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-dark-300 text-white rounded-lg shadow-lg py-2 z-50">
                                    <Link
                                        to="/about"
                                        className="block px-4 py-2 hover:bg-dark-400 transition"
                                        onClick={() => setExtraMenuOpen(false)}
                                    >
                                        Hakkımızda
                                    </Link>
                                    <Link
                                        to="/privacy"
                                        className="block px-4 py-2 hover:bg-dark-400 transition"
                                        onClick={() => setExtraMenuOpen(false)}
                                    >
                                        Gizlilik Politikası
                                    </Link>
                                    <Link
                                        to="/terms"
                                        className="block px-4 py-2 hover:bg-dark-400 transition"
                                        onClick={() => setExtraMenuOpen(false)}
                                    >
                                        Kullanım Şartları
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2 text-dark-700 hover:text-white transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-dark-300 animate-slide-in">
                        <div className="flex flex-col space-y-4">
                            <Link
                                to="/"
                                className="flex items-center space-x-2 text-dark-700 hover:text-white transition-colors"
                                onClick={closeMobileMenu}
                            >
                                <Home size={18} />
                                <span>Anasayfa</span>
                            </Link>

                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/profile"
                                        className="flex items-center space-x-2 text-dark-700 hover:text-white transition-colors"
                                        onClick={closeMobileMenu}
                                    >
                                        <User size={18} />
                                        <span>{user?.username}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 text-dark-700 hover:text-red-400 transition-colors text-left"
                                    >
                                        <LogOut size={18} />
                                        <span>Çıkış</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="block text-dark-700 hover:text-white transition-colors"
                                        onClick={closeMobileMenu}
                                    >
                                        Giriş Yap
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="btn-primary inline-block text-center"
                                        onClick={closeMobileMenu}
                                    >
                                        Kayıt Ol
                                    </Link>
                                </>
                            )}

                            {/* 🆕 Mobile versiyonda da ekstra menü */}
                            <div className="border-t border-dark-300 pt-4">
                                <Link
                                    to="/about"
                                    className="block px-2 py-2 text-dark-700 hover:text-white transition"
                                    onClick={closeMobileMenu}
                                >
                                    Hakkımızda
                                </Link>
                                <Link
                                    to="/privacy"
                                    className="block px-2 py-2 text-dark-700 hover:text-white transition"
                                    onClick={closeMobileMenu}
                                >
                                    Gizlilik Politikası
                                </Link>
                                <Link
                                    to="/terms"
                                    className="block px-2 py-2 text-dark-700 hover:text-white transition"
                                    onClick={closeMobileMenu}
                                >
                                    Kullanım Şartları
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
