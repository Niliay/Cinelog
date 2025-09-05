import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, Plus, Check, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userAPI } from '../api';

const MovieCard = ({ movie, showUserActions = true, userStatus: propUserStatus }) => {
    const { isAuthenticated } = useAuth();
    const toast = useToast();
    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userStatus, setUserStatus] = useState(propUserStatus || {
        in_watchlist: false,
        in_watched: false,
        rating: null
    });

    // GEÇİCİ OLARAK USER STATUS CHECK'İNİ DEVRE DIŞI BIRAKIYORUZ
    // SONSUZ DÖNGÜ SORUNU YÜZÜNDEN
    /*
    React.useEffect(() => {
      if (isAuthenticated && movie.id && !propUserStatus && showUserActions) {
        getUserMovieStatus();
      }
    }, [isAuthenticated, movie.id, propUserStatus, showUserActions]);
    */

    const getUserMovieStatus = async () => {
        try {
            const response = await userAPI.getMovieStatus(movie.id);
            if (response.data.success) {
                setUserStatus(response.data.data);
            }
        } catch (error) {
            // Silent fail - user status is not critical
        }
    };

    const handleAddToList = async (listType) => {
        if (!isAuthenticated) {
            toast.info('Giriş yapmalısınız');
            return;
        }

        setIsLoading(true);
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
            setIsLoading(false);
        }
    };

    const handleRemoveFromList = async (listType) => {
        setIsLoading(true);
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
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).getFullYear();
    };

    const formatRating = (rating) => {
        if (!rating || rating === null || rating === undefined) return 'N/A';
        const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
        return isNaN(numRating) ? 'N/A' : numRating.toFixed(1);
    };

    return (
        <div
            className="movie-card relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Movie Poster */}
            <div className="relative overflow-hidden">
                <img
                    src={movie.poster_url || movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder-movie.jpg'}
                    alt={movie.title}
                    className="movie-poster"
                    loading="lazy"
                />

                {/* Hover Overlay */}
                <div className={`movie-overlay ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    {/* Movie Info */}
                    <div className="text-white">
                        <h3 className="font-semibold text-lg mb-1 text-shadow">{movie.title}</h3>
                        <div className="flex items-center space-x-3 text-sm text-dark-800 mb-2">
                            {movie.release_date && (
                                <div className="flex items-center space-x-1">
                                    <Calendar size={14} />
                                    <span>{formatDate(movie.release_date)}</span>
                                </div>
                            )}
                            {movie.vote_average > 0 && (
                                <div className="flex items-center space-x-1">
                                    <Star size={14} className="text-yellow-400" />
                                    <span>{formatRating(movie.vote_average)}</span>
                                </div>
                            )}
                        </div>

                        {/* User Rating */}
                        {userStatus.rating && (
                            <div className="flex items-center space-x-1 mb-2">
                                <Star size={14} className="text-primary fill-current" />
                                <span className="text-primary font-medium">{userStatus.rating}/10</span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {showUserActions && (
                            <div className="flex space-x-2">
                                {/* Watchlist Button */}
                                <button
                                    onClick={() => userStatus.in_watchlist ? handleRemoveFromList('watchlist') : handleAddToList('watchlist')}
                                    disabled={isLoading}
                                    className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${userStatus.in_watchlist
                                            ? 'bg-white text-black'
                                            : 'bg-dark-400 text-dark-700 hover:bg-dark-300'
                                        }`}
                                    title={userStatus.in_watchlist ? 'İzleneceklerden çıkar' : 'İzleneceklere ekle'}
                                >
                                    {userStatus.in_watchlist ? <Check size={12} /> : <Plus size={12} />}
                                    <span>İzlenecek</span>
                                </button>

                                {/* Watched Button */}
                                <button
                                    onClick={() => userStatus.in_watched ? handleRemoveFromList('watched') : handleAddToList('watched')}
                                    disabled={isLoading}
                                    className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${userStatus.in_watched
                                            ? 'bg-gray-600 text-white'
                                            : 'bg-dark-400 text-dark-700 hover:bg-dark-300'
                                        }`}
                                    title={userStatus.in_watched ? 'İzlenenlerden çıkar' : 'İzlenenlere ekle'}
                                >
                                    {userStatus.in_watched ? <Check size={12} /> : <Eye size={12} />}
                                    <span>İzlendi</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Click to detail link */}
                <Link
                    to={`/movie/${movie.id}`}
                    className="absolute inset-0 z-10"
                    title={`${movie.title} detaylarını görüntüle`}
                />
            </div>

            {/* Movie Title (always visible) */}
            <div className="p-3">
                <h3 className="font-medium text-sm text-dark-800 truncate">
                    {movie.title}
                </h3>
                {movie.release_date && (
                    <p className="text-xs text-dark-500 mt-1">
                        {formatDate(movie.release_date)}
                    </p>
                )}
            </div>
        </div>
    );
};

export default MovieCard;