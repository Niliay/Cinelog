import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Star, Plus, Eye, Grid, Film, Search, X, MessageSquare, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { moviesAPI } from '../api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';


const sliderImages = [
    '/images/slider/film1.png',
    '/images/slider/film2.png',
    '/images/slider/film3.png',
    '/images/slider/film4.png',
    '/images/slider/film5.png',
    '/images/slider/film6.png',
    '/images/slider/film7.png'
];

// En çok yorum alan filmler için özel kart bileşeni
const MostReviewedCard = ({ movie, onClick }) => (
    <div
        className="bg-dark-200 rounded-lg overflow-hidden hover:bg-dark-300 transition-all duration-300 cursor-pointer group h-80 flex flex-col"
        onClick={() => onClick(movie.id)}
    >
        <div className="relative flex-shrink-0">
            <img
                src={movie.poster_url || '/placeholder-movie.jpg'}
                alt={movie.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Yorum sayısı badge'i */}
            <div className="absolute top-2 right-2 bg-primary bg-opacity-90 rounded-full px-2 py-1">
                <div className="flex items-center space-x-1 text-xs text-white">
                    <MessageSquare size={12} />
                    <span className="font-medium">{movie.review_count}</span>
                </div>
            </div>
            {/* Rating badge */}
            {movie.avg_user_rating && movie.avg_user_rating > 0 && (
                <div className="absolute top-2 left-2 bg-dark-100 bg-opacity-90 rounded px-2 py-1">
                    <div className="flex items-center space-x-1 text-xs">
                        <Star size={12} className="text-yellow-400 fill-current" />
                        <span className="text-white font-medium">{movie.avg_user_rating}</span>
                    </div>
                </div>
            )}
        </div>

        {/* Alt kısım - sabit boyut */}
        <div className="p-3 flex-1 flex flex-col justify-between">
            <div>
                <h3 className="font-medium text-white text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
                    {movie.title}
                </h3>
            </div>

            <div className="flex items-center justify-between text-xs text-dark-600">
                <span>
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Tarih yok'}
                </span>
                <div className="flex items-center space-x-1">
                    <MessageSquare size={10} />
                    <span>{movie.review_count} yorum</span>
                </div>
            </div>
        </div>
    </div>
);

const Home = () => {
    const [popularMovies, setPopularMovies] = useState([]);
    const [popularPage, setPopularPage] = useState(1);
    const [popularTotalPages, setPopularTotalPages] = useState(1);

    const [genreMovies, setGenreMovies] = useState([]);
    const [genrePage, setGenrePage] = useState(1);
    const [genreTotalPages, setGenreTotalPages] = useState(1);

    // Yeni state: En çok yorum alan filmler
    const [mostReviewedMovies, setMostReviewedMovies] = useState([]);
    const [mostReviewedLoading, setMostReviewedLoading] = useState(false);

    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('popular');
    const [selectedGenre, setSelectedGenre] = useState(null);

    // Arama için state'ler
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const toast = useToast();
    const { isAuthenticated } = useAuth();
    const hasLoaded = useRef(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Slider state
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (!hasLoaded.current) {
            hasLoaded.current = true;
            loadGenres();
            loadMostReviewedMovies(); // En çok yorum alanları yükle
        }
    }, []);

    useEffect(() => {
        if (genres.length > 0) {
            const tab = searchParams.get('tab') || 'popular';
            const genreId = searchParams.get('genreId');
            const page = Number(searchParams.get('page')) || 1;

            setActiveTab(tab);

            if (tab === 'genre' && genreId) {
                const selected = genres.find((g) => g.id === Number(genreId));
                if (selected) {
                    setSelectedGenre(selected);
                    setGenrePage(page);
                    loadGenreMovies(selected.id, page);
                }
            } else {
                setPopularPage(page);
                loadPopularMovies(page);
            }
        }
    }, [searchParams, genres]);

    // Slider interval
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // En çok yorum alan filmleri yükle
    const loadMostReviewedMovies = async () => {
        setMostReviewedLoading(true);
        try {
            const response = await moviesAPI.getMostReviewed(8);
            if (response.data.success) {
                setMostReviewedMovies(response.data.data);
            }
        } catch (error) {
            console.error('Most reviewed movies error:', error);
            // Sessiz hata - kullanıcıya gösterme, sadece boş liste bırak
        } finally {
            setMostReviewedLoading(false);
        }
    };

    // Scroll fonksiyonu
    const scrollMostReviewed = (direction) => {
        const container = document.getElementById('most-reviewed-container');
        if (!container) return;

        const scrollAmount = 200; // Kart genişliği + gap
        const maxScrollLeft = container.scrollWidth - container.clientWidth;

        if (direction === 'left') {
            if (container.scrollLeft <= 0) {
                // En başta ise en sona git
                container.scrollLeft = maxScrollLeft;
            } else {
                container.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth'
                });
            }
        } else {
            if (container.scrollLeft >= maxScrollLeft) {
                // En sonda ise en başa git
                container.scrollLeft = 0;
            } else {
                container.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            }
        }
    };



    // Arama fonksiyonu
    const handleSearch = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        try {
            const response = await moviesAPI.search(query);
            if (response.data.success) {
                setSearchResults(response.data.data.results.slice(0, 8));
                setShowSearchResults(true);
            }
        } catch (error) {
            console.error('Arama hatası:', error);
            toast.error('Arama yapılamadı');
        } finally {
            setIsSearching(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
    };

    const loadGenres = async () => {
        setLoading(true);
        try {
            const res = await moviesAPI.getGenres();
            if (res.data.success) setGenres(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Kategoriler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const loadPopularMovies = async (page = 1) => {
        setLoading(true);
        try {
            const res = await moviesAPI.getPopular(page);
            if (res.data.success) {
                setPopularMovies(res.data.data.results);
                setPopularTotalPages(res.data.data.total_pages);
            }
        } catch (err) {
            console.error(err);
            toast.error('Popüler filmler yüklenemedi');
        } finally {
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const loadGenreMovies = async (genreId, page = 1) => {
        setLoading(true);
        try {
            const res = await moviesAPI.getByGenre(genreId, page);
            if (res.data.success) {
                setGenreMovies(res.data.data.results);
                setGenreTotalPages(res.data.data.total_pages);
            }
        } catch (err) {
            console.error(err);
            toast.error('Kategori filmleri yüklenemedi');
        } finally {
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSelectedGenre(null);
        setPopularPage(1);
        setSearchParams({ tab, page: 1 });
    };

    const handleGenreSelect = (genre) => {
        setSelectedGenre(genre);
        setActiveTab('genre');
        setGenrePage(1);
        setSearchParams({ tab: 'genre', genreId: genre.id, page: 1 });
        loadGenreMovies(genre.id, 1);
    };

    const handlePopularPageChange = (newPage) => {
        setPopularPage(newPage);
        setSearchParams({ tab: 'popular', page: newPage });
        loadPopularMovies(newPage);
    };

    const handleGenrePageChange = (newPage) => {
        setGenrePage(newPage);
        setSearchParams({ tab: 'genre', genreId: selectedGenre.id, page: newPage });
        loadGenreMovies(selectedGenre.id, newPage);
    };

    const getCurrentMovies = () => (activeTab === 'genre' ? genreMovies : popularMovies);

    if (loading && !genres.length) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    const currentMovies = getCurrentMovies();
    const currentPage = activeTab === 'genre' ? genrePage : popularPage;
    const totalPages = activeTab === 'genre' ? genreTotalPages : popularTotalPages;

    return (
        <div className="animate-fade-in">
            {/* Hero Slider */}
            <div className="hero relative rounded-xl mb-8 overflow-hidden h-96 md:h-[500px]">
                <img
                    src={sliderImages[currentSlide]}
                    alt="Cinelog Hero"
                    className="w-full h-full object-cover brightness-50 transition-opacity duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg animate-fade-in mb-3">
                        Cinelog
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 mb-6 drop-shadow-md animate-fade-in delay-100">
                        Film severler için sosyal ağ.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn-primary px-6 py-2 text-lg font-semibold animate-fade-in delay-200"
                    >
                        Hemen Keşfet
                    </button>
                </div>
            </div>

            {/* Arama Kutusu */}
            <div className="relative mb-12">
                <div className="relative max-w-2xl mx-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-600" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Film ara..."
                            className="w-full pl-10 pr-10 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-dark-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-600 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {/* Arama Sonuçları */}
                    {showSearchResults && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-200 border border-dark-300 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                            {isSearching ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="loading-spinner"></div>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="p-2">
                                    {searchResults.map((movie) => (
                                        <button
                                            key={movie.id}
                                            onClick={() => {
                                                navigate(`/movie/${movie.id}`);
                                                setShowSearchResults(false);
                                                setSearchQuery('');
                                            }}
                                            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-300 transition-colors text-left"
                                        >
                                            <img
                                                src={movie.poster_url || '/placeholder-movie.jpg'}
                                                alt={movie.title}
                                                className="w-12 h-18 object-cover rounded flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-white truncate">{movie.title}</h4>
                                                <p className="text-sm text-dark-600 truncate">
                                                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Tarih yok'}
                                                </p>
                                                {movie.vote_average > 0 && (
                                                    <div className="flex items-center space-x-1 mt-1">
                                                        <span className="text-yellow-400">★</span>
                                                        <span className="text-sm text-dark-700">
                                                            {movie.vote_average.toFixed(1)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-dark-600">
                                    "{searchQuery}" için sonuç bulunamadı
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* En Çok Yorum Alan Filmler - YENİ BÖLÜM */}
            {mostReviewedMovies.length > 0 && (
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-semibold flex items-center space-x-2">
                            <TrendingUp className="text-primary" size={24} />
                            <span>En Çok Yorum Alanlar</span>
                            <div className="flex items-center space-x-1 text-sm text-dark-600">
                                <MessageSquare size={16} />
                                <span>Topluluk Favorileri</span>
                            </div>
                        </h2>

                        {/* Scroll Butonları */}
                        <div className="flex space-x-2">
                            <button
                                onClick={() => scrollMostReviewed('left')}
                                className="p-2 bg-dark-300 hover:bg-dark-400 rounded-full transition-colors"
                                aria-label="Sola kaydır"
                            >
                                <ChevronLeft size={20} className="text-white" />
                            </button>
                            <button
                                onClick={() => scrollMostReviewed('right')}
                                className="p-2 bg-dark-300 hover:bg-dark-400 rounded-full transition-colors"
                                aria-label="Sağa kaydır"
                            >
                                <ChevronRight size={20} className="text-white" />
                            </button>
                        </div>
                    </div>

                    {mostReviewedLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="loading-spinner"></div>
                        </div>
                    ) : (
                        <div
                            id="most-reviewed-container"
                            className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none'
                            }}
                        >
                            {mostReviewedMovies.map((movie) => (
                                <div key={movie.id} className="flex-shrink-0 w-48">
                                    <MostReviewedCard
                                        movie={movie}
                                        onClick={(movieId) => navigate(`/movie/${movieId}`)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Kategoriler */}
            {genres.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center space-x-2">
                        <Grid className="text-white" size={24} />
                        <span>Kategoriler</span>
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {genres.slice(0, 12).map((genre) => (
                            <button
                                key={genre.id}
                                onClick={() => handleGenreSelect(genre)}
                                className={`px-4 py-2 rounded-2xl font-medium transition-all text-sm md:text-base ${selectedGenre?.id === genre.id
                                    ? 'bg-white text-black shadow-md transform scale-105'
                                    : 'bg-dark-300 text-dark-700 hover:bg-dark-400 hover:text-white'
                                    }`}
                            >
                                {genre.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Film Listesi */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-2">
                    {activeTab === 'genre' ? (
                        <>
                            <Film className="text-white" size={24} />
                            <span>{selectedGenre?.name} Filmleri</span>
                        </>
                    ) : (
                        <>
                            <Star className="text-white" size={24} />
                            <span>Popüler Filmler</span>
                        </>
                    )}
                </h2>

                {currentMovies.length > 0 ? (
                    <div className="movie-grid">
                        {currentMovies.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} showUserActions={false} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400 text-lg">
                        {loading ? 'Filmler yükleniyor...' : 'Film bulunamadı'}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-6 space-x-2">
                        <button
                            onClick={() =>
                                currentPage > 1 &&
                                (activeTab === 'genre'
                                    ? handleGenrePageChange(currentPage - 1)
                                    : handlePopularPageChange(currentPage - 1))
                            }
                            className="px-4 py-2 rounded bg-dark-300 text-dark-600 hover:bg-dark-400 hover:text-white disabled:opacity-50"
                            disabled={currentPage === 1}
                        >
                            Önceki
                        </button>

                        {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                            const pageNum = index + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() =>
                                        activeTab === 'genre'
                                            ? handleGenrePageChange(pageNum)
                                            : handlePopularPageChange(pageNum)
                                    }
                                    className={`px-4 py-2 rounded ${pageNum === currentPage
                                        ? 'bg-red-500 text-white shadow-lg'
                                        : 'bg-dark-200 text-dark-600 hover:bg-dark-300 hover:text-white'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() =>
                                currentPage < totalPages &&
                                (activeTab === 'genre'
                                    ? handleGenrePageChange(currentPage + 1)
                                    : handlePopularPageChange(currentPage + 1))
                            }
                            className="px-4 py-2 rounded bg-dark-300 text-dark-600 hover:bg-dark-400 hover:text-white disabled:opacity-50"
                            disabled={currentPage === totalPages}
                        >
                            Sonraki
                        </button>
                    </div>
                )}
            </div>

            {/* Özellikler Bölümü */}
            <div className="mt-16 grid md:grid-cols-3 gap-8">
                <div className="card text-center animate-scale-in">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="text-black" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Puan Verin</h3>
                    <p className="text-dark-600">İzlediğiniz filmlere 1-10 arası puan vererek deneyiminizi kaydedin</p>
                </div>

                <div className="card text-center animate-scale-in" style={{ animationDelay: '0.1s' }}>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="text-black" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Listeler Oluşturun</h3>
                    <p className="text-dark-600">İzlenecekler ve izlenenler listelerinizi düzenleyin</p>
                </div>

                <div className="card text-center animate-scale-in" style={{ animationDelay: '0.2s' }}>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <Eye className="text-black" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Yorumlar Yazın</h3>
                    <p className="text-dark-600">Düşüncelerinizi paylaşın ve diğer kullanıcıların yorumlarını okuyun</p>
                </div>
            </div>
        </div>
    );
};

export default Home;