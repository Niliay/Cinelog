import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Film } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const { register, isAuthenticated } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            console.log('User authenticated, redirecting...');
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
            toast.error('Lütfen tüm alanları doldurun');
            return false;
        }

        if (formData.username.length < 3) {
            toast.error('Kullanıcı adı en az 3 karakter olmalıdır');
            return false;
        }

        if (formData.password.length < 6) {
            toast.error('Şifre en az 6 karakter olmalıdır');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Şifreler eşleşmiyor');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Geçersiz email formatı');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            console.log('📝 Submitting register form...');
            const result = await register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            if (result.success) {
                toast.success('Kayıt başarılı!');
                navigate('/', { replace: true });
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    // Hiç loading check yapmıyoruz - direkt render
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
                    <h2 className="text-3xl font-bold">Kayıt Ol</h2>
                    <p className="mt-2 text-dark-600">
                        Film takip serüveninize başlamak için hesap oluşturun
                    </p>
                </div>

                {/* Register Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Username Field */}
                        <div>
                            <label htmlFor="username" className="form-label">
                                Kullanıcı Adı
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="text-dark-500" size={18} />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="form-input pl-10"
                                    placeholder="kullaniciadi"
                                    value={formData.username}
                                    onChange={handleChange}
                                    autoComplete="username"
                                />
                            </div>
                            <p className="text-xs text-dark-600 mt-1">
                                3-20 karakter, sadece harf, rakam ve _ kullanabilirsiniz
                            </p>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="form-label">
                                Email Adresi
                            </label>
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

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="form-label">
                                Şifre
                            </label>
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
                                    autoComplete="new-password"
                                />
                            </div>
                            <p className="text-xs text-dark-600 mt-1">
                                En az 6 karakter
                            </p>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="form-label">
                                Şifre Tekrar
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="text-dark-500" size={18} />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="form-input pl-10"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full btn-primary py-3 text-lg font-semibold ${loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="loading-spinner w-5 h-5"></div>
                                    <span>Kayıt yapılıyor...</span>
                                </div>
                            ) : (
                                'Kayıt Ol'
                            )}
                        </button>
                    </div>

                    {/* Login Link */}
                    <div className="text-center">
                        <p className="text-dark-600">
                            Zaten hesabınız var mı?{' '}
                            <Link
                                to="/login"
                                className="text-white hover:text-gray-300 font-medium transition-colors"
                            >
                                Giriş yapın
                            </Link>
                        </p>
                    </div>
                </form>

                {/* Terms */}
                <div className="text-center">
                    <p className="text-xs text-dark-600">
                        Kayıt olarak{' '}
                        <a href="#" className="text-primary hover:underline">Kullanım Şartları</a>
                        {' '}ve{' '}
                        <a href="#" className="text-primary hover:underline">Gizlilik Politikası</a>
                        'nı kabul etmiş olursunuz.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;