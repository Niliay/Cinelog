import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Star, Calendar, Clock, Plus, Check, Eye,
    MessageSquare, Send, Edit, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { moviesAPI, userAPI } from '../api';
import { X } from 'lucide-react';

const StarRating = ({ rating, onRate, readonly = false }) => {
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleStarClick = (starRating) => {
        if (!readonly && onRate) {
            onRate(starRating);
        }
    };

    return (
        <div className="flex space-x-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                    key={star}
                    className={`star ${star <= (hoveredRating || rating) ? 'active' : ''
                        } ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
                    onMouseEnter={() => !readonly && setHoveredRating(star)}
                    onMouseLeave={() => !readonly && setHoveredRating(0)}
                    onClick={() => handleStarClick(star)}
                    disabled={readonly}
                >
                    <Star size={16} />
                </button>
            ))}
        </div>
    );
};

const MovieDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const toast = useToast();

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userStatus, setUserStatus] = useState({
        in_watchlist: false,
        in_watched: false,
        rating: null,
        review: null // review artık {id, review_text, rating, created_at} objesi olacak
    });
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState('');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);


    // Yeni state'lerrrrr!!!!!
    const [editReviewModalOpen, setEditReviewModalOpen] = useState(false);
    const [editReviewText, setEditReviewText] = useState('');

    // Yeni state'lerrrrr2
    const [deleteReviewModalOpen, setDeleteReviewModalOpen] = useState(false);

    useEffect(() => {
        loadMovieDetails();
    }, [id]);

    const loadMovieDetails = async () => {
        try {
            setLoading(true);
            const response = await moviesAPI.getDetails(id);

            if (response.data.success) {
                const movieData = response.data.data;
                setMovie(movieData);
                setUserStatus(movieData.user_data || {
                    in_watchlist: false,
                    in_watched: false,
                    rating: null,
                    review: null
                });
                setReviews(movieData.reviews || []);
            }
        } catch (error) {
            console.error('Movie details error:', error);
            toast.error('Film detayları yüklenemedi');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Yorum Güncelleme
    const handleEditReview = () => {
        if (!userStatus.review) return;
        setEditReviewText(userStatus.review.review_text);
        setEditReviewModalOpen(true);
    };

    const handleEditReviewSubmit = async () => {
        if (!editReviewText.trim()) {
            toast.error('Yorum boş olamaz');
            return;
        }

        try {
            const res = await userAPI.updateReview(userStatus.review.id, editReviewText.trim());
            if (res.data.success) {
                setUserStatus(prev => ({
                    ...prev,
                    review: { ...prev.review, review_text: editReviewText.trim() }
                }));

                setReviews(prev => prev.map(r =>
                    r.id === userStatus.review.id ? { ...r, review_text: editReviewText.trim() } : r
                ));

                setEditReviewModalOpen(false);
                toast.success('Yorum güncellendi');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Yorum güncellenemedi');
        }
    };


    // 🔹 Yorum Silme
    // Yorum silme fonksiyonunu güncelle:
    const handleDeleteReview = () => {
        setDeleteReviewModalOpen(true);
    };

    const confirmDeleteReview = async () => {
        if (!userStatus.review) return;

        try {
            const res = await userAPI.deleteReview(userStatus.review.id);
            if (res.data.success) {
                setUserStatus(prev => ({ ...prev, review: null }));
                setReviews(prev => prev.filter(r => r.id !== userStatus.review.id));
                setDeleteReviewModalOpen(false);
                toast.success('Yorum silindi');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Yorum silinemedi');
        }
    };


    const handleAddToList = async (listType) => {
        if (!isAuthenticated) {
            toast.info('Giriş yapmalısınız');
            navigate('/login');
            return;
        }

        setActionLoading(true);
        try {
            const response = await userAPI.addToList(movie.id, listType);
            if (response.data.success) {
                setUserStatus(prev => ({
                    ...prev,
                    [`in_${listType}`]: true
                }));
                toast.success(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Bir hata oluştu');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveFromList = async (listType) => {
        setActionLoading(true);
        try {
            const response = await userAPI.removeFromList(movie.id, listType);
            if (response.data.success) {
                setUserStatus(prev => ({
                    ...prev,
                    [`in_${listType}`]: false
                }));
                toast.success(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Bir hata oluştu');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRating = async (rating) => {
        if (!isAuthenticated) {
            toast.info('Giriş yapmalısınız');
            navigate('/login');
            return;
        }

        try {
            const response = await userAPI.rateMovie(movie.id, rating);
            if (response.data.success) {
                setUserStatus(prev => ({
                    ...prev,
                    rating
                }));
                toast.success('Puan verildi');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Puan verilemedi');
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.info('Giriş yapmalısınız');
            navigate('/login');
            return;
        }

        if (!newReview.trim()) {
            toast.error('Yorum boş olamaz');
            return;
        }

        try {
            const response = await userAPI.reviewMovie(movie.id, newReview.trim());
            if (response.data.success) {
                const newReviewObj = response.data.review; // backend’den gelen objeyi kullan

                setUserStatus(prev => ({
                    ...prev,
                    review: newReviewObj
                }));

                setReviews(prev => [newReviewObj, ...prev]);
                setNewReview('');
                setShowReviewForm(false);
                toast.success('Yorum eklendi');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Yorum eklenemedi');
        }
    };


    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatRuntime = (minutes) => {
        if (!minutes) return '';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}s ${mins}dk`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="text-center py-12">
                <div className="text-dark-500 text-lg">Film bulunamadı</div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-dark-600 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                <span>Geri</span>
            </button>

            {/* Movie Header */}
            <div className="relative mb-8">
                {/* Backdrop */}
                {movie.backdrop_url && (
                    <div
                        className="absolute inset-0 rounded-lg opacity-20"
                        style={{
                            backgroundImage: `url(${movie.backdrop_url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(8px)'
                        }}
                    />
                )}

                <div className="relative bg-dark-200 rounded-lg p-6">
                    <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
                        {/* Poster */}
                        <div className="flex-shrink-0">
                            <img
                                src={movie.poster_url || '/placeholder-movie.jpg'}
                                alt={movie.title}
                                className="w-64 mx-auto md:mx-0 rounded-lg shadow-lg"
                            />
                        </div>

                        {/* Movie Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{movie.title}</h1>

                            {movie.tagline && (
                                <p className="text-dark-600 italic mb-4">{movie.tagline}</p>
                            )}

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center space-x-4 text-dark-600 mb-4">
                                {movie.release_date && (
                                    <div className="flex items-center space-x-1">
                                        <Calendar size={16} />
                                        <span>{formatDate(movie.release_date)}</span>
                                    </div>
                                )}

                                {movie.runtime && (
                                    <div className="flex items-center space-x-1">
                                        <Clock size={16} />
                                        <span>{formatRuntime(movie.runtime)}</span>
                                    </div>
                                )}

                                {movie.vote_average > 0 && (
                                    <div className="flex items-center space-x-1">
                                        <Star size={16} className="text-yellow-400" />
                                        <span>{movie.vote_average.toFixed(1)}/10</span>
                                    </div>
                                )}
                            </div>

                            {/* Genres */}
                            {movie.genres && movie.genres.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {movie.genres.map((genre) => (
                                        <span
                                            key={genre.id}
                                            className="px-3 py-1 bg-dark-300 text-dark-700 rounded-full text-sm"
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Overview */}
                            {movie.overview && (
                                <p className="text-dark-700 leading-relaxed mb-6">
                                    {movie.overview}
                                </p>
                            )}

                            {/* User Actions */}
                            {isAuthenticated && (
                                <div className="space-y-4">
                                    {/* List Actions */}
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => userStatus.in_watchlist ? handleRemoveFromList('watchlist') : handleAddToList('watchlist')}
                                            disabled={actionLoading}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded font-medium transition-colors ${userStatus.in_watchlist
                                                ? 'bg-white text-black'
                                                : 'bg-dark-300 text-dark-700 hover:bg-dark-400'
                                                }`}
                                        >
                                            {userStatus.in_watchlist ? <Check size={18} /> : <Plus size={18} />}
                                            <span>{userStatus.in_watchlist ? 'İzleneceklerde' : 'İzleneceklere Ekle'}</span>
                                        </button>

                                        <button
                                            onClick={() => userStatus.in_watched ? handleRemoveFromList('watched') : handleAddToList('watched')}
                                            disabled={actionLoading}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded font-medium transition-colors ${userStatus.in_watched
                                                ? 'bg-gray-600 text-white'
                                                : 'bg-dark-300 text-dark-700 hover:bg-dark-400'
                                                }`}
                                        >
                                            {userStatus.in_watched ? <Check size={18} /> : <Eye size={18} />}
                                            <span>{userStatus.in_watched ? 'İzlendi' : 'İzlendi Olarak İşaretle'}</span>
                                        </button>
                                    </div>

                                    {/* Rating */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Puanınız</h3>
                                        <div className="flex items-center space-x-3">
                                            <StarRating
                                                rating={userStatus.rating || 0}
                                                onRate={handleRating}
                                            />
                                            {userStatus.rating && (
                                                <span className="text-primary font-medium">
                                                    {userStatus.rating}/10
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cast */}
            {movie.credits?.cast && movie.credits.cast.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Oyuncular</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {movie.credits.cast.slice(0, 12).map((person) => (
                            <div key={person.id} className="text-center">
                                <img
                                    src={person.profile_path
                                        ? `https://image.tmdb.org/t/p/w200${person.profile_path}`
                                        : '/placeholder-person.jpg'
                                    }
                                    alt={person.name}
                                    className="w-full aspect-square object-cover rounded-lg mb-2"
                                />
                                <h4 className="text-sm font-medium truncate">{person.name}</h4>
                                <p className="text-xs text-dark-600 truncate">{person.character}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Reviews Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold flex items-center space-x-2">
                        <MessageSquare className="text-primary" size={24} />
                        <span>Yorumlar ({reviews.length})</span>
                    </h2>

                    {isAuthenticated && !userStatus.review && (
                        <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="btn-primary flex items-center space-x-2"
                        >
                            <Edit size={18} />
                            <span>Yorum Yaz</span>
                        </button>
                    )}
                </div>

                {/* Review Form */}
                {showReviewForm && (
                    <form onSubmit={handleReviewSubmit} className="card mb-6">
                        <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-medium">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={newReview}
                                    onChange={(e) => setNewReview(e.target.value)}
                                    placeholder={`${movie.title} hakkında düşüncelerinizi yazın...`}
                                    className="form-input min-h-[100px] resize-none"
                                    rows="4"
                                />
                                <div className="flex justify-end space-x-2 mt-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowReviewForm(false);
                                            setNewReview('');
                                        }}
                                        className="btn-secondary"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newReview.trim()}
                                        className="btn-primary flex items-center space-x-2"
                                    >
                                        <Send size={16} />
                                        <span>Gönder</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}

                {/* User's Review */}
                {userStatus.review && (
                    <div className="card mb-6 border-primary border relative">
                        <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-medium">{user?.username?.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="font-medium">{user?.username}</span>
                                    <span className="text-primary text-sm">(Siz)</span>
                                    {userStatus.rating && (
                                        <div className="flex items-center space-x-1">
                                            <Star size={14} className="text-yellow-400 fill-current" />
                                            <span className="text-sm">{userStatus.rating}/10</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-dark-700">{userStatus.review?.review_text}</p>

                            </div>

                            {/* Güncelle ve Sil Butonları */}
                            <div className="absolute top-2 right-2 flex space-x-1">
                                <button onClick={handleEditReview} className="btn-secondary flex items-center space-x-1 px-2 py-1 text-sm">
                                    <Edit size={14} />
                                    <span>Güncelle</span>
                                </button>
                                <button onClick={handleDeleteReview} className="btn-danger flex items-center space-x-1 px-2 py-1 text-sm">
                                    <Trash2 size={14} />
                                    <span>Sil</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Review Modal */}
                {editReviewModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-dark-200 p-6 rounded-lg w-full max-w-md relative">
                            <button
                                className="absolute top-3 right-3 text-dark-600 hover:text-white"
                                onClick={() => setEditReviewModalOpen(false)}
                            >
                                <X size={20} />
                            </button>
                            <h3 className="text-xl font-semibold mb-4">Yorumu Güncelle</h3>
                            <textarea
                                className="form-input w-full min-h-[120px] resize-none mb-4"
                                value={editReviewText}
                                onChange={(e) => setEditReviewText(e.target.value)}
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => setEditReviewModalOpen(false)}
                                    className="btn-secondary"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleEditReviewSubmit}
                                    className="btn-primary"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Review Modal */}
                {deleteReviewModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-dark-200 p-6 rounded-lg w-full max-w-md relative">
                            <button
                                className="absolute top-3 right-3 text-dark-600 hover:text-white"
                                onClick={() => setDeleteReviewModalOpen(false)}
                            >
                                <X size={20} />
                            </button>
                            <h3 className="text-xl font-semibold mb-4 text-red-400">Yorumu Sil</h3>
                            <p className="text-dark-700 mb-6">
                                Bu yorumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                            </p>
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => setDeleteReviewModalOpen(false)}
                                    className="btn-secondary"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={confirmDeleteReview}
                                    className="btn-danger"
                                >
                                    Sil
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Other Reviews */}
                {reviews.length > 0 ? (
                    <div className="space-y-4">
                        {reviews.map((review, index) => {
                            // Güvenlik kontrolü ekle
                            if (!review || typeof review !== 'object') {
                                return null;
                            }

                            return (
                                <div key={review.id || index} className="card">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-10 h-10 bg-dark-300 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-dark-700 font-medium">
                                                {review.username ? review.username.charAt(0).toUpperCase() : 'A'}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className="font-medium">{review.username || 'Anonim Kullanıcı'}</span>
                                                {review.rating && (
                                                    <div className="flex items-center space-x-1">
                                                        <Star size={14} className="text-yellow-400 fill-current" />
                                                        <span className="text-sm">{review.rating}/10</span>
                                                    </div>
                                                )}
                                                {review.created_at && (
                                                    <span className="text-dark-600 text-sm">
                                                        {formatDate(review.created_at)}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-dark-700">{review.review_text || 'Yorum metni bulunamadı'}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    !userStatus.review && (
                        <div className="text-center py-8 card">
                            <div className="text-dark-500 mb-2">Henüz yorum yok</div>
                            <p className="text-dark-600">
                                Bu film hakkında ilk yorumu siz yazın!
                            </p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default MovieDetail;