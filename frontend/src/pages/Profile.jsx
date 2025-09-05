import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    User,
    Calendar,
    Edit,
    Eye,
    Clock,
    Star,
    MessageSquare  // Bu satırı ekle
} from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { userAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [watchedMovies, setWatchedMovies] = useState([]);
    const [watchlistMovies, setWatchlistMovies] = useState([]);
    const [userReviews, setUserReviews] = useState([]); // Bu satırı ekle
    const [stats, setStats] = useState({
        watched_count: 0,
        watchlist_count: 0
    });
    const [loading, setLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(true); // Bu satırı ekle
    const [editingUsername, setEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [activeTab, setActiveTab] = useState('watched');

    const { user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        loadProfile();
        loadUserReviews(); // Bu satırı ekle
    }, []);

    // Bu fonksiyonu ekle
    const loadUserReviews = async () => {
        try {
            setReviewsLoading(true);
            const response = await userAPI.getUserReviews();
            if (response.data.success) {
                setUserReviews(response.data.data);
            }
        } catch (error) {
            toast.error('Yorumlar yüklenemedi');
            console.error('Load reviews error:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    const loadProfile = async () => {
        try {
            const response = await userAPI.getProfile();
            if (response.data.success) {
                const { user, watchlist, watched, stats } = response.data.data;
                setUserData(user);
                setWatchlistMovies(watchlist);
                setWatchedMovies(watched);
                setStats(stats);
                setNewUsername(user.username);
            }
        } catch (error) {
            toast.error('Profil yüklenirken hata oluştu');
            console.error('Profile load error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUsernameUpdate = async () => {
        if (!newUsername.trim()) {
            toast.error('Kullanıcı adı boş olamaz');
            return;
        }

        if (newUsername === userData.username) {
            setEditingUsername(false);
            return;
        }

        try {
            const response = await userAPI.updateUsername(newUsername.trim());
            if (response.data.success) {
                setUserData(prev => ({
                    ...prev,
                    username: newUsername.trim()
                }));
                setEditingUsername(false);
                toast.success('Kullanıcı adı güncellendi');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Güncelleme başarısız');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCurrentMovies = () => {
        return activeTab === 'watched' ? watchedMovies : watchlistMovies;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="text-center py-12">
                <div className="text-dark-500 text-lg">Profil yüklenemedi</div>
            </div>
        );
    }

    const currentMovies = getCurrentMovies();

    return (
        <div className="animate-fade-in">
            {/* Profile Header */}
            <div className="card mb-8">
                <div className="flex items-start space-x-6">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                        <User className="text-black" size={40} />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            {editingUsername ? (
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        className="form-input text-lg font-bold"
                                        onKeyPress={(e) => e.key === 'Enter' && handleUsernameUpdate()}
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleUsernameUpdate}
                                        className="btn-primary px-3 py-1 text-sm"
                                    >
                                        Kaydet
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingUsername(false);
                                            setNewUsername(userData.username);
                                        }}
                                        className="btn-secondary px-3 py-1 text-sm"
                                    >
                                        İptal
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-2xl font-bold">{userData.username}</h1>
                                    <button
                                        onClick={() => setEditingUsername(true)}
                                        className="text-dark-600 hover:text-primary transition-colors"
                                        title="Kullanıcı adını düzenle"
                                    >
                                        <Edit size={18} />
                                    </button>
                                </>
                            )}
                        </div>

                        <p className="text-dark-600 mb-3">{userData.email}</p>

                        <div className="flex items-center space-x-1 text-sm text-dark-600">
                            <Calendar size={16} />
                            <span>Üyelik: {formatDate(userData.created_at)}</span>
                        </div>
                    </div>
                </div>

                {/* Stats - Buraya yorum sayısını ekle */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-dark-300">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">{stats.watched_count}</div>
                        <div className="text-dark-600 text-sm">İzlenen Film</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-400">{stats.watchlist_count}</div>
                        <div className="text-dark-600 text-sm">İzlenecek Film</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{userReviews.length}</div>
                        <div className="text-dark-600 text-sm">Yorum</div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation - Reviews tab'ini ekle */}
            <div className="flex justify-center mb-8">
                <div className="bg-dark-200 rounded-lg p-1 inline-flex">
                    <button
                        onClick={() => setActiveTab('watched')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'watched'
                                ? 'bg-white text-black'
                                : 'text-dark-600 hover:text-white'
                            }`}
                    >
                        <Eye size={18} />
                        <span>İzlenenler ({stats.watched_count})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('watchlist')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'watchlist'
                                ? 'bg-white text-black'
                                : 'text-dark-600 hover:text-white'
                            }`}
                    >
                        <Clock size={18} />
                        <span>İzlenecekler ({stats.watchlist_count})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'reviews'
                                ? 'bg-white text-black'
                                : 'text-dark-600 hover:text-white'
                            }`}
                    >
                        <MessageSquare size={18} />
                        <span>Yorumlar ({userReviews.length})</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div>
                {activeTab === 'reviews' ? (
                    /* Yorumlar Tab'i */
                    <div className="card">
                        {reviewsLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="loading-spinner"></div>
                            </div>
                        ) : userReviews.length > 0 ? (
                            <div className="space-y-4">
                                {userReviews.map((review) => (
                                    <div key={review.id} className="bg-dark-300 p-4 rounded-lg">
                                        <div className="flex space-x-4">
                                            <img
                                                src={review.poster_url || '/placeholder-movie.jpg'}
                                                alt={review.movie_title}
                                                className="w-16 h-24 object-cover rounded cursor-pointer hover:scale-105 transition-transform"
                                                onClick={() => navigate(`/movie/${review.movie_id}`)}
                                            />

                                            <div className="flex-1">
                                                <button
                                                    onClick={() => navigate(`/movie/${review.movie_id}`)}
                                                    className="text-lg font-semibold text-white hover:text-primary transition-colors mb-1 block text-left"
                                                >
                                                    {review.movie_title}
                                                </button>

                                                <div className="flex items-center space-x-4 mb-3 text-sm text-dark-600">
                                                    <span>
                                                        {new Date(review.created_at).toLocaleDateString('tr-TR')}
                                                    </span>
                                                    {review.rating && (
                                                        <div className="flex items-center space-x-1">
                                                            <Star size={14} className="text-yellow-400 fill-current" />
                                                            <span>{review.rating}/10</span>
                                                        </div>
                                                    )}
                                                    {review.updated_at !== review.created_at && (
                                                        <span className="text-primary text-xs">(Düzenlendi)</span>
                                                    )}
                                                </div>

                                                <p className="text-dark-700 leading-relaxed mb-3">
                                                    {review.review_text}
                                                </p>

                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => navigate(`/movie/${review.movie_id}`)}
                                                        className="text-primary hover:text-white text-sm transition-colors"
                                                    >
                                                        Filme Git →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-dark-500">
                                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                                <p className="text-lg mb-2">Henüz yorum yapmamışsınız</p>
                                <p className="text-dark-600">
                                    Filmler hakkında düşüncelerinizi paylaşmaya başlayın!
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Film Listeleri */
                    currentMovies.length > 0 ? (
                        <div className="movie-grid">
                            {currentMovies.map((movie) => (
                                <div key={movie.id} className="relative">
                                    <MovieCard
                                        movie={movie}
                                        showUserActions={false}
                                    />

                                    {activeTab === 'watched' && movie.rating && (
                                        <div className="absolute top-2 right-2 bg-dark-100 bg-opacity-90 rounded px-2 py-1">
                                            <div className="flex items-center space-x-1 text-xs">
                                                <Star size={12} className="text-yellow-400" />
                                                <span className="text-white font-medium">{movie.rating}</span>
                                            </div>
                                        </div>
                                    )}

                                    {movie.added_at && (
                                        <div className="absolute bottom-2 left-2 bg-dark-100 bg-opacity-90 rounded px-2 py-1">
                                            <span className="text-xs text-dark-700">
                                                {formatDate(movie.added_at)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 card">
                            <div className="text-dark-500 text-lg mb-2">
                                {activeTab === 'watched' ? 'Henüz hiç film izlememişsiniz' : 'İzlenecek film listeniz boş'}
                            </div>
                            <p className="text-dark-600 mb-4">
                                {activeTab === 'watched'
                                    ? 'İzlediğiniz filmleri işaretleyerek takip etmeye başlayın'
                                    : 'İzlemek istediğiniz filmleri listeye ekleyerek organize olun'}
                            </p>
                            <Link to="/" className="btn-primary">
                                Filmleri Keşfet
                            </Link>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default Profile;