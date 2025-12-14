import React, { useState, useMemo } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { 
  LayoutDashboard, List, PlusCircle, Users, 
  BookOpen, CreditCard, Settings, LogOut, Menu, X, Bell 
} from 'lucide-react';

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Sidebar Component
 */
const Sidebar = ({ menuItems, currentPath, onClose, onLogout }) => (
  <div className="h-full flex flex-col bg-white border-r border-gray-200">
    {/* Logo Header */}
    <div className="p-6 flex items-center gap-2 border-b border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 tracking-tight">
        eTuition<span className="text-emerald-600">BD</span>
      </h2>
    </div>

    {/* Navigation Links */}
    <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
      {menuItems.map((item) => {
        const isActive = currentPath === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`flex items-center justify-between gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive 
                ? 'bg-emerald-50 text-emerald-700 shadow-sm border-l-4 border-emerald-600' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} className={isActive ? 'text-emerald-600' : 'text-gray-400'} />
              {item.name}
            </div>
            {/* Dynamic Notification Badge */}
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

const StudentDashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // --- 1. User Authentication Check & Setup ---
  const { user, authConfig, isUserValid } = useMemo(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      return { user: null, authConfig: {}, isUserValid: false };
    }
    
    const userData = JSON.parse(userStr);
    const authToken = userData.token || userData.jwtToken || localStorage.getItem("jwtToken"); 

    const config = {
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : undefined,
      },
    };

    return { 
        user: userData, 
        authConfig: config, 
        isUserValid: !!userData.email && !!authToken
    };
  }, []);

  // --- 2. Fetch Notifications/Stats (TanStack Query) ---
  const { data: appStats, isError: isAppStatsError, error: appStatsError } = useQuery({
    queryKey: ['studentAppStats', user?.email],
    queryFn: async () => {
      if (!isUserValid) return { shortlistedCount: 0 };
      
      const response = await axios.get(`${API_URL}/api/applications/student-view?email=${user.email}`, authConfig);
      
      const shortlisted = response.data.data.filter(app => app.status === 'Shortlisted').length;
      return { shortlistedCount: shortlisted };
    },
    enabled: isUserValid,
    staleTime: 60000, 
    retry: 1
  });

  // --- 3. Handle Unauthorized Access & Errors ---
  if (!user) {
    navigate('/login');
    return null;
  }
  
  if (isAppStatsError) {
    const status = appStatsError.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      Swal.fire({ icon: 'error', title: 'Session Expired', text: 'Please log in again.' }).then(() => {
        navigate('/login');
      });
      return null;
    }
  }


  // --- 4. Menu Configuration ---
  const menuItems = useMemo(() => [
    { path: '/student-dashboard', name: 'Dashboard Home', icon: LayoutDashboard },
    { path: '/student-dashboard/my-tuitions', name: 'My Tuitions', icon: List },
    { path: '/student-dashboard/post-tuition', name: 'Post New Tuition', icon: PlusCircle },
    { 
      path: '/student-dashboard/applied-tutors', 
      name: 'Applied Tutors', 
      icon: Users, 
      badge: appStats?.shortlistedCount || 0 
    },
    { path: '/student-dashboard/ongoing-tuitions', name: 'Ongoing Tuitions', icon: BookOpen },
    { path: '/student-dashboard/payment-history', name: 'Payment History', icon: CreditCard },
    { path: '/student-dashboard/settings', name: 'Profile Settings', icon: Settings },
  ], [appStats]);

  // --- 5. Handlers ---
  const handleLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: "Are you sure you want to end your session?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Logout'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        Swal.fire({
          icon: 'success',
          title: 'Logged Out',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          navigate('/'); 
        });
      }
    });
  };

  const getPageTitle = () => {
    const activeItem = menuItems.find(item => item.path === location.pathname);
    return activeItem ? activeItem.name : 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* --- 1. Desktop Sidebar --- */}
      <aside className="hidden lg:block w-64 fixed inset-y-0 left-0 z-50 bg-white shadow-sm">
        <Sidebar 
          menuItems={menuItems} 
          currentPath={location.pathname} 
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />
      </aside>

      {/* --- 2. Mobile Header --- */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-white z-40 border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white font-bold">e</div>
          <span className="font-bold text-gray-800">Student Panel</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu size={24} />
        </button>
      </div>

      {/* --- 3. Mobile Sidebar Drawer --- */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-2xl flex flex-col"
            >
               <div className="flex justify-end p-4 border-b border-gray-100">
                  <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-red-500 transition-colors">
                    <X size={24} />
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

      {/* --- 4. Main Content Area --- */}
      <main className="flex-1 lg:ml-64 w-full min-h-screen">
        
        {/* Top Header (Desktop View) */}
        <header className="hidden lg:flex justify-between items-center px-8 py-5 bg-white/50 backdrop-blur-sm sticky top-0 z-30 border-b border-gray-100">
           <h1 className="text-xl font-bold text-gray-800">{getPageTitle()}</h1>
           <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800">{user?.name || 'Student'}</p>
                <p className="text-xs text-gray-500">Student Account</p>
              </div>
              <button className="p-2 bg-white rounded-full shadow-sm border border-gray-100 relative hover:text-emerald-600 transition-colors">
                <Bell size={20} />
                {appStats?.shortlistedCount > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>
           </div>
        </header>

        {/* Dynamic Page Content */}
        <Outlet />
      </main>

    </div>
  );
};

export default StudentDashboardLayout;