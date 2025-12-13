import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import {
  MdDashboard,
  MdPeople,
  MdBook,
  MdAssignment,
  MdSettings,
  MdAccountCircle,
  MdMenu,
  MdClose,
  MdNotifications,
  MdLogout,
  MdChevronRight,
  MdBarChart,
  MdReceipt
} from 'react-icons/md';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // --- 1. Fetch Logged-in Admin Data ---
  const fetchAdminProfile = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser?.email) return null;

    try {
      const res = await axios.get(`${API_URL}/api/users/profile?email=${storedUser.email}`);
      return res.data.data;
    } catch (error) {
      console.error("Failed to fetch admin profile", error);
      return storedUser; // Fallback to local storage data
    }
  };

  const { data: adminData } = useQuery({
    queryKey: ['adminProfile'], // Matches key in AdminProfile.jsx for sync
    queryFn: fetchAdminProfile,
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
    retry: false
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const adminMenuItems = [
    {
      path: '/admin/dashboard',
      name: 'Dashboard',
      icon: <MdDashboard size={22} />,
      exact: true
    },
    {
      path: '/admin/users',
      name: 'User Management',
      icon: <MdPeople size={22} />,
    },
    {
      path: '/admin/tuitions',
      name: 'Tuitions',
      icon: <MdBook size={22} />,
    },
    {
      path: '/admin/applications',
      name: 'Applications',
      icon: <MdAssignment size={22} />,
    },
    {
      path: '/admin/reports',
      name: 'Analytics',
      icon: <MdBarChart size={22} />,
    },
    {
      path: '/admin/transactions',
      name: 'Transactions',
      icon: <MdReceipt size={22} />,
    },
    {
      path: '/admin/settings',
      name: 'Settings',
      icon: <MdSettings size={22} />,
    },
  ];

  // Dummy Notifications (Replace with API if needed)
  const notifications = [
    { id: 1, text: 'New tuition posted by John', time: '5m ago', read: false },
    { id: 2, text: 'Payment received $500', time: '1h ago', read: false },
    { id: 3, text: 'New tutor application', time: '2h ago', read: true }
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken'); // Legacy cleanup
    localStorage.removeItem('adminData');  // Legacy cleanup
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] font-sans text-gray-700">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          ${sidebarOpen ? 'w-72' : 'w-24'} 
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:relative top-0 left-0 h-full 
          bg-white z-50 
          transition-all duration-300 ease-in-out
          flex flex-col border-r border-gray-100 shadow-sm
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-6 h-20">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-white font-extrabold text-xl">A</span>
            </div>
            {sidebarOpen && (
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
                Admin<span className="text-indigo-600">Panel</span>
              </h1>
            )}
          </div>
          
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-200">
          {adminMenuItems.map((item, index) => (
            <div key={index}>
              <NavLink
                to={item.path}
                end={item.exact}
                className={({ isActive }) => `
                  relative flex items-center 
                  ${sidebarOpen ? 'px-4' : 'justify-center'} 
                  py-3.5 mb-1
                  rounded-2xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                onClick={() => setMobileMenuOpen(false)}
                title={!sidebarOpen ? item.name : ''}
              >
                <span className={`
                  ${sidebarOpen ? 'mr-3' : ''} 
                  transition-transform duration-200 group-hover:scale-110
                `}>
                  {item.icon}
                </span>
                
                {sidebarOpen && (
                  <span className="font-medium text-[15px]">{item.name}</span>
                )}
              </NavLink>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer / Toggle */}
        <div className="p-4 border-t border-gray-50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`
              w-full flex items-center p-3 rounded-xl 
              text-gray-400 hover:bg-gray-50 hover:text-gray-600 
              transition-all duration-200
              ${!sidebarOpen && 'justify-center'}
            `}
          >
            <MdChevronRight 
              size={24} 
              className={`transform transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : 'rotate-0'}`} 
            />
            {sidebarOpen && <span className="ml-3 font-medium text-sm">Collapse Sidebar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 shadow-sm border-b border-gray-100/50">
          <div className="flex items-center justify-between">
            
            {/* Left: Mobile Toggle & Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-xl"
              >
                <MdMenu size={24} />
              </button>
              
              <div className="hidden md:block">
                <h2 className="text-xl font-bold text-gray-800">
                  {adminMenuItems.find(item => location.pathname.startsWith(item.path))?.name || 'Dashboard'}
                </h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Welcome back, {adminData?.name?.split(' ')[0] || 'Admin'}!</p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
              
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2.5 rounded-xl text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors relative"
                >
                  <MdNotifications size={24} />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in-down origin-top-right">
                    <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                      <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">{unreadNotifications} New</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length > 0 ? notifications.map(notif => (
                        <div key={notif.id} className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0 ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                          <p className="text-sm text-gray-700 font-medium line-clamp-2">{notif.text}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                        </div>
                      )) : (
                        <div className="px-4 py-6 text-center text-gray-400 text-sm">No new notifications</div>
                      )}
                    </div>
                    <div className="border-t border-gray-50 p-2">
                      <button className="w-full py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-xl transition-colors">
                        Mark all as read
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border border-gray-100 hover:shadow-md hover:border-indigo-100 bg-white transition-all"
                >
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm border-2 border-white shadow-sm overflow-hidden">
                    {adminData?.image ? (
                      <img src={adminData.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span>{adminData?.name?.charAt(0) || 'A'}</span>
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-bold text-gray-700 leading-none">{adminData?.name || 'Admin User'}</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-1 uppercase">{adminData?.role || 'Admin'}</p>
                  </div>
                  <MdChevronRight size={18} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-90' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in-down origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-50 mb-2">
                      <p className="text-sm font-bold text-gray-800">Signed in as</p>
                      <p className="text-xs text-gray-500 truncate">{adminData?.email || 'admin@tuition.com'}</p>
                    </div>
                    
                    <button onClick={() => {navigate('/admin/profile'); setIsProfileOpen(false);}} className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-indigo-600 flex items-center gap-3 transition-colors">
                      <MdAccountCircle size={18} /> My Profile
                    </button>
                    <button onClick={() => {navigate('/admin/settings'); setIsProfileOpen(false);}} className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-indigo-600 flex items-center gap-3 transition-colors">
                      <MdSettings size={18} /> Settings
                    </button>
                    
                    <div className="border-t border-gray-50 mt-2 pt-2">
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium">
                        <MdLogout size={18} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {/* Content Container */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[calc(100vh-140px)]">
              <Outlet />
            </div>
          </div>
          
          {/* Footer */}
          <footer className="mt-16 px-8 py-10 bg-gradient-to-b from-pink-50 via-purple-50 to-indigo-50 text-gray-600 text-xs">
            <div className="flex flex-col items-center gap-6">

              {/* Credit */}
              <div className="text-center">
                <p className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 drop-shadow-sm">
                  Designed & Developed by S M Samiul Hasan
                </p>
                <p className="text-gray-500 mt-1">
                  © 2025 Tuition Platform — All Rights Reserved
                </p>
              </div>

              {/* Links */}
              <div className="flex gap-6">
                <a href="#" className="px-3 py-1 rounded-full bg-white/70 backdrop-blur hover:bg-white shadow-sm hover:shadow transition-all text-pink-500">Privacy</a>
                <a href="#" className="px-3 py-1 rounded-full bg-white/70 backdrop-blur hover:bg-white shadow-sm hover:shadow transition-all text-purple-500">Terms</a>
                <a href="#" className="px-3 py-1 rounded-full bg-white/70 backdrop-blur hover:bg-white shadow-sm hover:shadow transition-all text-indigo-500">Help</a>
              </div>
            </div>
          </footer>
        </main>

      </div>
    </div>
  );
};

export default AdminDashboardLayout;