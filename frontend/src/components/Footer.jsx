import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Github, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-dark-200 border-t border-dark-300 mt-16">
            <div className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="flex items-center space-x-2 mb-4">
                            <Film size={24} className="text-white" />
                            <span className="text-xl font-bold text-white">Cinelog</span>
                        </div>
                        <p className="text-dark-600 text-sm">
                            Film severler için sosyal ağ. Filmlerinizi takip edin, puanlayın ve keşfedin.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Hızlı Erişim</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/" className="text-dark-600 hover:text-white transition-colors">
                                    Anasayfa
                                </Link>
                            </li>
                            <li>
                                <Link to="/profile" className="text-dark-600 hover:text-white transition-colors">
                                    Profilim
                                </Link>
                            </li>
                            <li>
                                <Link to="/" className="text-dark-600 hover:text-white transition-colors">
                                    Popüler Filmler
                                </Link>
                            </li>

                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Kategoriler</h3>
                        <ul className="space-y-2 text-sm">
                            <li><span className="text-dark-600">Aksiyon</span></li>
                            <li><span className="text-dark-600">Komedi</span></li>
                            <li><span className="text-dark-600">Dram</span></li>
                            <li><span className="text-dark-600">Bilim Kurgu</span></li>
                        </ul>
                    </div>

                    {/* About */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Hakkında</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/about" className="text-dark-600 hover:text-white transition-colors">
                                    Hakkımızda
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-dark-600 hover:text-white transition-colors">
                                    Gizlilik Politikası
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-dark-600 hover:text-white transition-colors">
                                    Kullanım Şartları
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="https://github.com/kullaniciAdi/cinelog"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-dark-600 hover:text-white transition-colors flex items-center space-x-1"
                                >

                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-dark-300 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="text-dark-600 text-sm mb-4 md:mb-0">
                        © 2024 Cinelog. Tüm hakları saklıdır.
                    </div>

                    <div className="flex items-center space-x-1 text-dark-600 text-sm">
                        <span>Made with</span>
                        <Heart size={14} className="text-red-500 fill-current" />
                        <span>by film lovers</span>
                    </div>
                </div>

                {/* TMDB Attribution */}

            </div>
        </footer>
    );
};

export default Footer;
