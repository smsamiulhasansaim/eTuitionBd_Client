import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, NavLink, useNavigate } from 'react-router-dom'; 
import { 
  Menu, X, ChevronDown, LayoutDashboard, User, LogOut, LogIn
} from 'lucide-react';

const Header = () => {
  // --- State Management ---
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const navigate = useNavigate();

  // --- 1. User Authentication Check (Optimized) ---
  // Using useMemo to read from localStorage once or when relevant dependencies change
  // Note: For real-time auth state updates (e.g. login/logout in other tabs), 
  // a Context or Redux store is preferred in production. 
  // Here we stick to the provided pattern but clean it up.
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // --- 2. Handlers ---
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Ensure token is also cleared
    setUser(null);
    setIsProfileDropdownOpen(false);
    navigate('/login'); 
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  // Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- 3. Navigation Configuration ---
  const navLinks = useMemo(() => [
    { name: 'Home', path: '/' },
    ...(user ? [
      { name: 'Tuitions', path: '/all-tuitions' }, // Standardized path casing
      { name: 'Tutors', path: '/all-tutors' }
    ] : []),
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ], [user]);

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'tutor': return '/tutor-dashboard';
      case 'student': return '/student-dashboard';
      default: return '/dashboard';
    }
  };

  const defaultAvatar = "#";

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md py-3' 
          : 'bg-white/90 backdrop-blur-sm py-5 border-b border-gray-100'
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        
        {/* --- LEFT: Logo --- */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
            e
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            eTuition<span className="text-emerald-600">BD</span>
          </h1>
        </Link>

        {/* --- CENTER: Desktop Navigation --- */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `font-medium transition-colors relative group ${
                  isActive ? 'text-emerald-600' : 'text-gray-600 hover:text-emerald-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.name}
                  <span 
                    className={`absolute -bottom-1 left-0 h-0.5 bg-emerald-600 transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  ></span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* --- RIGHT: Auth Actions --- */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-6">
              <Link 
                to={getDashboardLink()}
                className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium transition-colors py-2"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>

              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <img
                    src={user.photoURL || defaultAvatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-emerald-100 object-cover shadow-sm"
                  />
                  <div className="text-left hidden xl:block">
                     <p className="text-sm font-semibold text-gray-700">{user.name?.split(' ')[0]}</p>
                     <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden p-1 z-50"
                    >
                      <Link 
                        to={`${getDashboardLink()}/settings`} 
                        onClick={closeMenus}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors"
                      >
                        <User size={16} /> Profile Settings
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-5 py-2 text-emerald-600 font-semibold hover:bg-emerald-50 rounded-full transition-colors border border-transparent hover:border-emerald-100">
                Login
              </Link>
              <Link to="/register" className="px-5 py-2 bg-emerald-600 text-white font-semibold rounded-full shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-xl transition-all active:scale-95">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* --- MOBILE: Hamburger Menu --- */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-700 hover:text-emerald-600 transition-colors p-2"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 shadow-xl overflow-hidden"
          >
            <div className="px-4 py-6 space-y-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={closeMenus}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl font-medium transition-all ${
                      isActive 
                        ? 'text-emerald-700 bg-emerald-50 shadow-sm' 
                        : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              <div className="border-t border-gray-100 my-4 pt-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-4 mb-4">
                        <img src={user.photoURL || defaultAvatar} alt="User" className="w-12 h-12 rounded-full border-2 border-emerald-100 shadow-sm"/>
                        <div>
                            <p className="font-bold text-gray-800">{user.name}</p>
                            <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">{user.role}</p>
                        </div>
                    </div>
                    <Link to={getDashboardLink()} onClick={closeMenus} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors">
                      <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    <Link to={`${getDashboardLink()}/settings`} onClick={closeMenus} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors">
                      <User size={20} /> Profile Settings
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left font-medium">
                      <LogOut size={20} /> Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 px-4">
                    <Link to="/login" onClick={closeMenus} className="flex items-center justify-center gap-2 w-full px-5 py-3 text-emerald-600 font-bold border-2 border-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors">
                      <LogIn size={18}/> Login
                    </Link>
                    <Link to="/register" onClick={closeMenus} className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:bg-emerald-700 transition-colors">
                      Register Now
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;