import React, { useState, useMemo, useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { 
  LayoutDashboard, Send, BookOpen, DollarSign, 
  Search, User, Star, LogOut, Menu, X, Bell 
} from 'lucide-react';

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Custom Hook for Authentication and Token Management
 */
const useAuth = (navigate) => {
  const { user, userId, token } = useMemo(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login");
      return { user: null, userId: null, token: null };
    }
    const parsedUser = JSON.parse(userStr);
    const id = parsedUser?._id || parsedUser?.id;
    
    return {
        user: parsedUser, 
        userId: id ? id.toString() : null,
        token: parsedUser?.token 
    };
  }, [navigate]);

  return { user, userId, token };
};

/**
 * Sets up Axios Interceptors for centralized auth and error handling.
 */
const useAxiosInterceptors = (token, navigate) => {
    useEffect(() => {
        // Request Interceptor: Add Authorization token to all outgoing requests
        const requestInterceptor = axios.interceptors.request.use(
          (config) => {
            if (token && !config.headers.Authorization) {
              config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
          },
          (error) => Promise.reject(error)
        );
    
        // Response Interceptor: Handle 401/403 (Unauthorized/Forbidden)
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    console.error("Authentication Error: Session Expired/Unauthorized.");
                    navigate("/login");
                } 
                return Promise.reject(error);
            }
        );
    
        return () => {
          axios.interceptors.request.eject(requestInterceptor);
          axios.interceptors.response.eject(responseInterceptor);
        };
      }, [token, navigate]);
}

/**
 * Sidebar Component
 */
const Sidebar = ({ menuItems, currentPath, onClose, onLogout }) => (
  <div className="h-full flex flex-col bg-white border-r border-gray-200">
    {/* Logo Section */}
    <div className="p-6 flex items-center gap-2 border-b border-gray-100">
      <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
        e
      </div>
      <h2 className="text-xl font-bold text-gray-800 tracking-tight">
        eTuition<span className="text-emerald-600">BD</span>
      </h2>
    </div>

    {/* Navigation Links */}
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      {menuItems.map((item) => {
        const isActive = currentPath === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`flex items-center justify-between gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive 
                ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} className={isActive ? 'text-emerald-600' : 'text-gray-400'} />
              {item.name}
            </div>
            {item.badge > 0 && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-200 text-emerald-800' : 'bg-red-500 text-white'}`}>
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>

    {/* Logout Button */}
    <div className="p-4 border-t border-gray-100">
      <button 
        onClick={onLogout}
        className="flex items-center gap-3 px-3 py-3 w-full text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        <LogOut size={20} />
        Logout
      </button>
    </div>
  </div>
);

const TutorDashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Authentication Check & Token Retrieval
  const { user, userId, token } = useAuth(navigate);
  
  // 2. Axios Interceptor Setup
  useAxiosInterceptors(token, navigate);

  // 3. Fetch Stats for Badges (TanStack Query)
  const { data: stats } = useQuery({
    queryKey: ['tutorLayoutStats'],
    queryFn: async () => {
      if (!userId || !token) return Promise.reject(new Error("Authentication missing."));
      
      const response = await axios.get(`${API_URL}/api/profile/dashboard-stats`);
      
      return response.data.data?.stats || {};
    },
    enabled: !!userId && !!token, 
    staleTime: 60000, 
    retry: 1
  });

  // 4. Dynamic Menu Configuration
  const menuItems = useMemo(() => [
    { path: '/tutor-dashboard', name: 'Dashboard Home', icon: LayoutDashboard },
    { 
      path: '/tutor-dashboard/my-applications', 
      name: 'My Applications', 
      icon: Send, 
      badge: stats?.pendingReview || 0 
    }, 
    { path: '/tutor-dashboard/ongoing-tuitions', name: 'Ongoing Tuitions', icon: BookOpen },
    { path: '/tutor-dashboard/revenue', name: 'Revenue History', icon: DollarSign },
    { path: '/tutor-dashboard/browse-tuitions', name: 'Browse Tuitions', icon: Search },
    { path: '/tutor-dashboard/profile', name: 'My Profile', icon: User },
    { path: '/tutor-dashboard/reviews', name: 'Reviews & Ratings', icon: Star },
  ], [stats]);

  // 5. Handlers
  const handleLogout = () => {
    Swal.fire({
      title: 'Sign Out?',
      text: "Are you sure you want to sign out?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Sign Out'
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear all relevant tokens/user data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('jwtToken');
        
        Swal.fire({
          icon: 'success',
          title: 'Signed Out',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          navigate('/login'); 
        });
      }
    });
  };

  const getPageTitle = () => {
    const activeItem = menuItems.find(item => item.path === location.pathname);
    return activeItem ? activeItem.name : 'Dashboard';
  };

  // 6. Render Guard
  if (!user) {
    return null; // Redirect handled by useAuth hook
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 fixed inset-y-0 left-0 z-50 bg-white shadow-sm">
        <Sidebar 
          menuItems={menuItems} 
          currentPath={location.pathname} 
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-white z-40 border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-600 rounded flex items-center justify-center text-white font-bold text-sm">e</div>
          <span className="font-bold text-gray-800">Tutor Panel</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-2xl flex flex-col"
            >
               <div className="flex justify-end p-4 border-b border-gray-100">
                  <button onClick={() => setSidebarOpen(false)} className="p-2 bg-gray-50 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
                    <X size={20} />
                  </button>
               </div>
               <div className="flex-1 overflow-hidden">
                 <Sidebar 
                    menuItems={menuItems} 
                    currentPath={location.pathname} 
                    onClose={() => setSidebarOpen(false)}
                    onLogout={handleLogout}
                 />
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 w-full min-h-screen p-4 lg:p-8 mt-14 lg:mt-0 transition-all">
         
         {/* Top Header (Desktop Only) */}
         <header className="hidden lg:flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              {getPageTitle()}
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-800">{user?.name || 'Instructor'}</p>
                <p className="text-xs text-emerald-600 font-medium">Verified Tutor</p>
              </div>
              <button className="p-2.5 bg-white rounded-full shadow-sm text-gray-500 hover:text-emerald-600 relative border border-gray-100 transition-all hover:shadow-md">
                <Bell size={20} />
                {stats?.pendingReview > 0 && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>
            </div>
         </header>

        {/* Content Outlet */}
        <Outlet />
      </main>
    </div>
  );
};

export default TutorDashboardLayout;