import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Briefcase, Clock, CheckCircle, DollarSign, ArrowUpRight, MoreHorizontal, Bell, Zap, TrendingUp
} from 'lucide-react';

// --- Custom Components ---
import Loading from '../../../components/common/Loading';
import ServerDown from '../../common/ServerDown';
import Unauthorized from '../../common/Unauthorized';

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL;

const DashboardHome = () => {
  const navigate = useNavigate();
  
  // --- 1. User Authentication Check ---
  const { user, userId, authToken } = useMemo(() => {
    const userStr = localStorage.getItem("user") || localStorage.getItem("userInfo");
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?._id || user?.id;
    const authToken = user?.token || user?.jwtToken || localStorage.getItem("jwtToken");

    return { user, userId, authToken };
  }, []);

  // Configure Axios with Authorization Header
  const authConfig = useMemo(() => ({
    headers: {
      Authorization: authToken ? `Bearer ${authToken}` : undefined,
    },
  }), [authToken]);

  // --- 2. Data Fetching (TanStack Query) ---
  const { 
    data: responseData, 
    isLoading, 
    isError, 
    error,
  } = useQuery({
    queryKey: ['tutorDashboardStats', userId],
    queryFn: async () => {
      if (!userId || !authToken) return null;
      // FIX: The URL is now correct, relying only on the Auth Header for user ID.
      const response = await axios.get(`${API_URL}/api/tutor/dashboard-stats`, authConfig);
      return response.data;
    },
    enabled: !!userId && !!authToken, 
    retry: 1,
  });

  // --- 3. Data Processing (Memoized) ---
  const { stats, revenueData, recentApplications, userName } = useMemo(() => {
    if (!responseData?.success || !responseData?.data) {
      return {
        stats: { totalApplied: 0, pendingReview: 0, activeTuitions: 0, totalEarnings: 0 },
        revenueData: [{ name: 'No Data', income: 0 }], 
        recentApplications: [],
        userName: user?.name || 'Tutor'
      };
    }

    const { data } = responseData;
    
    const totalEarnings = data.stats.totalEarnings || 0; 

    return {
      stats: {
          ...data.stats, 
          totalEarnings: totalEarnings
      },
      // Mapping 'amount' to 'income' for recharts component consistency
      revenueData: data.revenueData?.length > 0 ? data.revenueData.map(d => ({ ...d, income: d.amount })) : [{ name: 'No Data', income: 0 }], 
      recentApplications: data.recentApplications || [],
      userName: data.userName || user?.name || "Tutor"
    };
  }, [responseData, user]);

  // --- 4. Helpers ---
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Shortlisted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'Hired': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };
  
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // --- 5. Conditional Rendering ---

  if (!userId || !authToken) return <Unauthorized />;
  if (isLoading) return <Loading />;

  if (isError) {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("user");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("jwtToken");
      navigate('/login');
      return <Unauthorized />;
    }
    return <ServerDown />;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8 pt-24 md:pt-32 pb-12">
      
      {/* --- WELCOME BANNER --- */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-600 rounded-2xl p-6 lg:p-10 text-white shadow-xl relative overflow-hidden mb-8">
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
              <p className="text-emerald-100 text-sm md:text-lg opacity-90 max-w-xl">
                You have <span className="font-bold text-yellow-300">{stats.pendingReview}</span> applications pending review. Keep applying to grow your reach.
              </p>
            </div>
            <button className="hidden md:flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition text-sm font-medium">
              <Bell size={18} /> Notifications
            </button>
          </div>
          
          <div className="mt-8 flex gap-4">
             <Link to="/tutor-dashboard/browse-tuitions" className="bg-white text-emerald-700 px-6 py-2.5 rounded-lg font-bold shadow-md hover:shadow-lg hover:bg-gray-50 transition-all flex items-center gap-2">
                Apply Now <Zap size={18} />
             </Link>
             <Link to="/tutor-dashboard/profile" className="px-6 py-2.5 rounded-lg font-medium text-white border border-white/30 hover:bg-white/10 transition-all">
                Edit Profile
             </Link>
          </div>
        </div>
        {/* Decorative background element */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
           <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFFFFF" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,70.6,32.3C59,43.1,47.1,51.8,34.8,58.3C22.5,64.8,9.8,69.1,-1.8,72.2C-13.4,75.3,-23.9,77.2,-34.7,73.1C-45.5,69,-56.6,58.9,-65.4,47.1C-74.2,35.3,-80.7,21.8,-82.1,7.6C-83.5,-6.6,-79.8,-21.5,-71.4,-33.5C-63,-45.5,-49.9,-54.6,-36.8,-62.3C-23.7,-70,-10.6,-76.3,3.2,-81.8L17,-87.3L17,0L3.2,0L-10.6,0L-23.7,0L-36.8,0L-49.9,0L-63,0L-71.4,0L-82.1,0L-80.7,0L-65.4,0L-34.7,0L-1.8,0L22.5,0L34.8,0L70.6,0L95.8,0Z" transform="translate(100 100)" />
           </svg>
        </div>
      </div>

      {/* --- STATISTICS CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Applied</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.totalApplied}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Briefcase size={22} />
            </div>
          </div>
          <Link to="/tutor-dashboard/my-applications" className="text-xs text-blue-600 font-medium mt-4 flex items-center gap-1 hover:underline">
             <ArrowUpRight size={14} /> View Application History
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending Review</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.pendingReview}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <Clock size={22} />
            </div>
          </div>
          <p className="text-xs text-amber-600 font-medium mt-4">Immediate attention required</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Tuitions</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.activeTuitions}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle size={22} />
            </div>
          </div>
          <Link to="/tutor-dashboard/my-students" className="text-xs text-emerald-600 font-medium mt-4 flex items-center gap-1 hover:underline">
             Currently Teaching
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Earnings</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">৳ {stats.totalEarnings.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <DollarSign size={22} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">Lifetime payout value</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* --- RECENT APPLICATIONS TABLE --- */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Recent Applications</h3>
            <Link to="/tutor-dashboard/my-applications" className="text-sm text-emerald-600 font-medium hover:underline">
              View All
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-3 pl-2 min-w-[150px]">Subject / Title</th>
                  <th className="pb-3">Date Applied</th>
                  <th className="pb-3">Salary</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentApplications.length > 0 ? (
                  recentApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 pl-2">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-1 max-w-[200px]" title={app.tuitionTitle}>
                          {app.tuitionTitle || app.subject || "Tuition #" + app._id.slice(-4)}
                        </p>
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {timeAgo(app.createdAt)}
                      </td>
                      <td className="py-4 text-sm font-medium text-gray-800">
                        ৳ {app.expectedSalary || 'Negotiable'}
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-2">
                         <Link to="/tutor-dashboard/my-applications" className="text-gray-400 hover:text-emerald-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                          <MoreHorizontal size={20} />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-400">
                      No recent applications found. <Link to="/tutor-dashboard/browse-tuitions" className="text-emerald-500 font-semibold hover:underline">Apply now</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- REVENUE CHART --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-600"/> Monthly Income
          </h3>
          <p className="text-sm text-gray-500 mb-6">Paid bookings over the last 6 months</p>
          
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9CA3AF', fontSize: 12}} 
                  dy={10}
                />
                <YAxis 
                  tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9CA3AF', fontSize: 12}} 
                />
                <Tooltip 
                  cursor={{fill: '#F3FFEE'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                  formatter={(value) => [`৳ ${value.toLocaleString()}`, 'Income']}
                />
                <Bar 
                  dataKey="income" 
                  fill="#10B981" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
             <p className="text-xs text-gray-400">Total Lifetime Earnings</p>
             <p className="text-xl font-bold text-gray-800 mt-1">৳ {stats.totalEarnings.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;