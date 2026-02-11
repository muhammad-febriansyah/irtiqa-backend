import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';
import {
    Navbar as ResizableNavbar,
    MobileNav,
    MobileNavHeader,
    MobileNavToggle,
    MobileNavMenu
} from '@/components/ui/resizable-navbar';
import { ShimmerButton } from '@/components/ui/shimmer-button';

import { SharedData } from '@/types';

export default function Navbar() {
    const { siteSettings, auth } = usePage<SharedData>().props;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isInfoDropdownOpen, setIsInfoDropdownOpen] = useState(false);
    const [isMulaiDropdownOpen, setIsMulaiDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const { url } = usePage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Format WA Link
    const waNumber = siteSettings.contact_phone?.replace(/[^0-9]/g, '');
    const waLink = `https://wa.me/${waNumber}`;

    // Detect active section based on scroll position (only on homepage)
    useEffect(() => {
        // Only run scroll detection on homepage
        if (url !== '/') {
            setActiveSection('');
            return;
        }

        const handleScroll = () => {
            const sections = ['layanan', 'tentang'];
            const scrollPosition = window.scrollY + 150;

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(`#${section}`);
                        return;
                    }
                }
            }

            // If no section is active, set home as active
            if (window.scrollY < 150) {
                setActiveSection('/');
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check on mount

        return () => window.removeEventListener('scroll', handleScroll);
    }, [url]);

    const isActive = (href: string) => {
        // For exact page routes (like /tentang-kami)
        if (href.startsWith('/') && !href.startsWith('/#')) {
            return url === href;
        }

        // For homepage sections (like #layanan)
        if (href.startsWith('#')) {
            // Only active if we're on homepage and section matches
            return url === '/' && activeSection === href;
        }

        // For home link
        if (href === '/') {
            // Active only if on homepage AND (no section or top of page)
            return url === '/' && (activeSection === '/' || !activeSection || window.scrollY < 150);
        }

        return false;
    };

    // Check if any profile dropdown item is active
    const isProfileActive = () => {
        const profilePages = ['/tentang-kami', '/kebijakan-privasi', '/syarat-ketentuan'];
        return profilePages.includes(url);
    };

    // Check if any informasi dropdown item is active
    const isInformasiActive = () => {
        const infoPages = ['/cara-kerja', '/faq', '/artikel'];
        return infoPages.includes(url) || url.startsWith('/artikel');
    };

    const profilDropdownItems = [
        { name: 'Tentang Kami', link: '/tentang-kami' },
        { name: 'Kebijakan Privasi', link: '/kebijakan-privasi' },
        { name: 'Syarat & Ketentuan', link: '/syarat-ketentuan' },
    ];

    const informasiDropdownItems = [
        { name: 'Cara Kerja', link: '/cara-kerja' },
        { name: 'FAQ', link: '/faq' },
        { name: 'Artikel', link: '/artikel' },
    ];

    // Get dashboard URL based on user role
    const getDashboardUrl = () => {
        if (!auth.user) return '/';

        const roles = auth.user.roles as Array<{ name: string }>;
        if (roles && roles.length > 0) {
            const roleNames = roles.map(r => r.name);

            if (roleNames.includes('admin')) {
                return '/admin/dashboard';
            }
            if (roleNames.includes('consultant')) {
                return '/consultant/dashboard';
            }
            if (roleNames.includes('kyai')) {
                return '/kyai/dashboard';
            }
        }

        return '/dashboard';
    };

    // Get user avatar URL
    const getAvatarUrl = () => {
        if (auth.user?.avatar) {
            return auth.user.avatar.startsWith('http')
                ? auth.user.avatar
                : `/storage/${auth.user.avatar}`;
        }
        // Default avatar using UI Avatars
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user?.name || 'User')}&color=7F9CF5&background=EBF4FF`;
    };

    return (
        <ResizableNavbar>
            {/* Desktop Logo - Hidden on mobile & tablet */}
            <Link href="/" className="hidden lg:flex items-center">
                <img
                    src={siteSettings.logo || '/logo.svg'}
                    alt="IRTIQA"
                    className="h-20 object-cover"
                />
            </Link>

            {/* Desktop Navigation - Only show on large screens */}
            <div className="hidden lg:flex items-center space-x-6">
                {/* Home */}
                <a
                    href="/"
                    className={`text-sm font-medium transition-colors relative ${isActive('/')
                        ? 'text-primary'
                        : 'text-neutral-600 hover:text-primary'
                        }`}
                >
                    Home
                    {isActive('/') && (
                        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                </a>

                {/* Dropdown Profil */}
                <div
                    className="relative group"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                >
                    <button
                        className={`flex items-center gap-1 text-sm font-medium transition-colors relative ${isProfileActive()
                            ? 'text-primary'
                            : 'text-neutral-600 hover:text-primary'
                            }`}
                    >
                        Profil
                        <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                        />
                        {isProfileActive() && (
                            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                        )}
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 pt-2">
                            <div className="w-56 bg-white rounded-xl shadow-lg border border-neutral-100 py-2 z-50">
                                {profilDropdownItems.map((item, idx) => (
                                    <a
                                        key={idx}
                                        href={item.link}
                                        className={`block px-4 py-2.5 text-sm transition-colors ${isActive(item.link)
                                            ? 'text-primary bg-primary/5 font-medium'
                                            : 'text-neutral-600 hover:text-primary hover:bg-primary/5'
                                            }`}
                                    >
                                        {item.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Layanan */}
                <Link
                    href="/layanan"
                    className={`text-sm font-medium transition-colors relative ${isActive('/layanan')
                        ? 'text-primary'
                        : 'text-neutral-600 hover:text-primary'
                        }`}
                >
                    Layanan
                    {isActive('/layanan') && (
                        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                </Link>

                {/* Konsultan */}
                <Link
                    href="/konsultan"
                    className={`text-sm font-medium transition-colors relative ${isActive('/konsultan')
                        ? 'text-primary'
                        : 'text-neutral-600 hover:text-primary'
                        }`}
                >
                    Konsultan
                    {isActive('/konsultan') && (
                        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                </Link>

                {/* Dropdown Informasi */}
                <div
                    className="relative group"
                    onMouseEnter={() => setIsInfoDropdownOpen(true)}
                    onMouseLeave={() => setIsInfoDropdownOpen(false)}
                >
                    <button
                        className={`flex items-center gap-1 text-sm font-medium transition-colors relative ${isInformasiActive()
                            ? 'text-primary'
                            : 'text-neutral-600 hover:text-primary'
                            }`}
                    >
                        Informasi
                        <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${isInfoDropdownOpen ? 'rotate-180' : ''}`}
                        />
                        {isInformasiActive() && (
                            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                        )}
                    </button>

                    {isInfoDropdownOpen && (
                        <div className="absolute top-full left-0 pt-2">
                            <div className="w-56 bg-white rounded-xl shadow-lg border border-neutral-100 py-2 z-50">
                                {informasiDropdownItems.map((item, idx) => (
                                    <a
                                        key={idx}
                                        href={item.link}
                                        className={`block px-4 py-2.5 text-sm transition-colors ${isActive(item.link)
                                            ? 'text-primary bg-primary/5 font-medium'
                                            : 'text-neutral-600 hover:text-primary hover:bg-primary/5'
                                            }`}
                                    >
                                        {item.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Kontak */}
                <Link
                    href="/kontak"
                    className={`text-sm font-medium transition-colors relative ${isActive('/kontak')
                        ? 'text-primary'
                        : 'text-neutral-600 hover:text-primary'
                        }`}
                >
                    Kontak
                    {isActive('/kontak') && (
                        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                </Link>
            </div>

            {/* Desktop Buttons - Only show on large screens */}
            <div className="hidden lg:flex items-center gap-3">
                {auth.user ? (
                    /* User Avatar Dropdown */
                    <div
                        className="relative"
                        onMouseEnter={() => setIsUserDropdownOpen(true)}
                        onMouseLeave={() => setIsUserDropdownOpen(false)}
                    >
                        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <img
                                src={getAvatarUrl()}
                                alt={auth.user.name}
                                className="w-10 h-10 rounded-full border-2 border-primary/20"
                            />
                            <ChevronDown
                                size={16}
                                className={`text-neutral-600 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {isUserDropdownOpen && (
                            <div className="absolute top-full right-0 pt-2 z-50">
                                <div className="w-64 bg-white rounded-xl shadow-lg border border-neutral-100 py-2">
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-neutral-100">
                                        <p className="text-sm font-bold text-neutral-900">{auth.user.name}</p>
                                        <p className="text-xs text-neutral-500">{auth.user.email}</p>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        <a
                                            href={getDashboardUrl()}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-600 hover:text-primary hover:bg-primary/5 transition-colors"
                                        >
                                            <LayoutDashboard size={16} />
                                            Dashboard
                                        </a>
                                        <button
                                            onClick={() => router.post('/logout')}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                                        >
                                            <LogOut size={16} />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Login & Register Buttons */
                    <>
                        <button
                            onClick={() => router.visit('/login')}
                            className="px-6 py-2 rounded-full text-sm font-bold bg-transparent text-neutral-700 border border-neutral-200 hover:bg-neutral-50 hover:-translate-y-0.5 transition duration-300 cursor-pointer"
                        >
                            Masuk
                        </button>
                        <a href={waLink} target="_blank" rel="noopener noreferrer">
                            <ShimmerButton
                                className="px-6 py-2.5 text-sm font-bold"
                                background="linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)"
                                shimmerColor="#ffffff"
                                shimmerSize="0.1em"
                                borderRadius="100px"
                            >
                                Daftar Mitra
                            </ShimmerButton>
                        </a>
                    </>
                )}
            </div>

            {/* Mobile & Tablet Navigation */}
            <MobileNav>
                <MobileNavHeader>
                    <Link href="/">
                        <img
                            src={siteSettings.logo || '/logo.svg'}
                            alt="IRTIQA"
                            className="h-12 object-cover"
                        />
                    </Link>
                    <MobileNavToggle
                        isOpen={isMenuOpen}
                        setIsOpen={setIsMenuOpen}
                    />
                </MobileNavHeader>

                {/* Custom Mobile Menu with Grouping */}
                {isMenuOpen && (
                    <div className="absolute top-full left-0 right-0 mt-4 mx-4 p-6 bg-white rounded-2xl shadow-xl border border-neutral-100 max-h-[calc(100vh-140px)] overflow-y-auto">
                        {/* Main Navigation */}
                        <div className="space-y-1 mb-4">
                            <a
                                href="/"
                                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${isActive('/')
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-neutral-700 hover:bg-neutral-50'
                                    }`}
                            >
                                Home
                            </a>
                            <a
                                href="/layanan"
                                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${isActive('/layanan')
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-neutral-700 hover:bg-neutral-50'
                                    }`}
                            >
                                Layanan
                            </a>
                            <a
                                href="/konsultan"
                                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${isActive('/konsultan')
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-neutral-700 hover:bg-neutral-50'
                                    }`}
                            >
                                Konsultan
                            </a>
                            <a
                                href="/artikel"
                                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${url.startsWith('/artikel')
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-neutral-700 hover:bg-neutral-50'
                                    }`}
                            >
                                Artikel
                            </a>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-neutral-200 my-4" />

                        {/* Profil Section */}
                        <div className="mb-4">
                            <p className="px-4 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                Profil
                            </p>
                            <div className="space-y-1">
                                {profilDropdownItems.map((item, idx) => (
                                    <a
                                        key={idx}
                                        href={item.link}
                                        className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(item.link)
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-neutral-600 hover:bg-neutral-50'
                                            }`}
                                    >
                                        {item.name}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Informasi Section */}
                        <div className="mb-4">
                            <p className="px-4 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                Informasi
                            </p>
                            <div className="space-y-1">
                                {informasiDropdownItems.map((item, idx) => (
                                    <a
                                        key={idx}
                                        href={item.link}
                                        className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(item.link)
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-neutral-600 hover:bg-neutral-50'
                                            }`}
                                    >
                                        {item.name}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-neutral-200 my-4" />

                        {/* User Section / Auth Buttons */}
                        {auth.user ? (
                            <div className="space-y-2 pt-2">
                                {/* User Info */}
                                <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 rounded-lg">
                                    <img
                                        src={getAvatarUrl()}
                                        alt={auth.user.name}
                                        className="w-12 h-12 rounded-full border-2 border-primary/20"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-neutral-900 truncate">{auth.user.name}</p>
                                        <p className="text-xs text-neutral-500 truncate">{auth.user.email}</p>
                                    </div>
                                </div>

                                {/* User Menu */}
                                <a
                                    href={getDashboardUrl()}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-base font-semibold text-neutral-700 bg-neutral-50 hover:bg-neutral-100 transition-colors"
                                >
                                    <LayoutDashboard size={18} />
                                    Dashboard
                                </a>
                                <button
                                    onClick={() => router.post('/logout')}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-base font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2 pt-2">
                                <button
                                    onClick={() => router.visit('/login')}
                                    className="block w-full text-center px-4 py-3 rounded-lg text-base font-semibold text-neutral-700 bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer"
                                >
                                    Masuk
                                </button>
                                <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-center px-4 py-3 rounded-lg text-base font-semibold text-white bg-primary hover:bg-primary/90 transition-colors shadow-sm"
                                >
                                    Daftar Sebagai Mitra
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </MobileNav>
        </ResizableNavbar>
    );
}
