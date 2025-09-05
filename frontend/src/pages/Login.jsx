//frontend\src\pages\Login.jsx dosyamm

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Film } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [formLoading, setFormLoading] = useState(false);
    const { login, isAuthenticated, initialized, loading } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (initialized && isAuthenticated) {
            console.log('🔄 User already authenticated, redirecting...');
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, initialized, navigate, location]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            toast.error('Lütfen tüm alanları doldurun');
            return;
        }

        setFormLoading(true);
        try {
            console.log('🔐 Submitting login form...');
            const result = await login(formData);

            if (result.success) {
                toast.success('Giriş başarılı!');
                navigate('/', { replace: true });
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
        } finally {
            setFormLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                            <Film className="text-black" size={32} />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold">Giriş Yap</h2>
                    <p className="mt-2 text-dark-600">
                        Hesabınıza giriş yaparak film takip deneyiminize devam edin
                    </p>
                </div>

                {/* Login Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="form-label">Email Adresi</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="text-dark-500" size={18} />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="form-input pl-10"
                                    placeholder="email@ornek.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="form-label">Şifre</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="text-dark-500" size={18} />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="form-input pl-10"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div>
                        <button
                            type="submit"
                            disabled={formLoading}
                            className={`w-full btn-primary py-3 text-lg font-semibold ${formLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {formLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="loading-spinner w-5 h-5"></div>
                                    <span>Giriş yapılıyor...</span>
                                </div>
                            ) : (
                                'Giriş Yap'
                            )}
                        </button>
                    </div>

                    {/* Register Link */}
                    <div className="text-center">
                        <p className="text-dark-600">
                            Hesabınız yok mu?{' '}
                            <Link to="/register" className="text-white hover:text-gray-300 font-medium transition-colors">
                                Kayıt olun
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
