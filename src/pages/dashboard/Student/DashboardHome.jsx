import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, Users, CreditCard, BookOpen, 
  Clock, CheckCircle, TrendingUp, Bell, 
  ChevronRight, MoreHorizontal, FileText, DollarSign 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- Custom Components ---
import Loading from '../../../components/common/Loading';
import ServerDown from '../../common/ServerDown';
import Unauthorized from '../../common/Unauthorized';

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL;

const StudentDashboardHome = () => {
  const navigate = useNavigate();
  
  // --- 1. User Authentication Check ---
  const user = useMemo(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login");
      return null;
    }
    return JSON.parse(userStr);
  }, [navigate]);

  // --- 2. Data Fetching (Parallel Queries) ---

  // Query A: Fetch My Tuitions (For Stats & Recent Posts)
  const { 
    data: tuitions = [], 
    isLoading: loadingTuitions, 
    isError: errorTuitions,
    error: errObjTuitions
  } = useQuery({
    queryKey: ['myTuitions', user?.email],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/tuitions/my-tuitions?email=${user.email}`);
      return res.data.data || [];
    },
    enabled: !!user?.email, // Only run if user exists
  });

  // Query B: Fetch Payments (For Total Spent & Chart)
  const { 
    data: payments = [], 
    isLoading: loadingPayments,
    isError: errorPayments,
    error: errObjPayments
  } = useQuery({
    queryKey: ['myPayments', user?.email],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/payment/my-payments?email=${user.email}`);
      return res.data.data || [];
    },
    enabled: !!user?.email,
  });

  // Query C: Fetch Applications (For Notifications/Pending)
  const { 
    data: applications = [], 
    isLoading: loadingApps,
    isError: errorApps,
    error: errObjApps
  } = useQuery({
    queryKey: ['myApplications', user?.email],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/applications/student-view?email=${user.email}`);
      return res.data.data || [];
    },
    enabled: !!user?.email,
  });

  // --- 3. Data Processing (Memoized for Performance) ---
  
  const dashboardData = useMemo(() => {
    if (loadingTuitions || loadingPayments || loadingApps) return null;

    // A. Calculate Stats
    const pendingPosts = tuitions.filter(t => t.status === 'pending').length;
    const approvedPosts = tuitions.filter(t => t.status === 'approved').length;
    const totalSpent = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const pendingAppsCount = applications.length; // Assuming API returns filtered shortlisted apps

    // B. Process Chart Data (Last 6 Months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthIdx = d.getMonth();
      const year = d.getFullYear();
      
      // Sum payments for this specific month/year
      const monthlyTotal = payments
        .filter(p => {
          const pDate = new Date(p.date);
          return pDate.getMonth() === monthIdx && pDate.getFullYear() === year;
        })
        .reduce((sum, p) => sum + p.amount, 0);

      chartData.push({
        name: monthNames[monthIdx],
        spent: monthlyTotal
      });
    }

    // C. Generate Activity Feed (Merge & Sort)
    const feed = [
      ...tuitions.map(t => ({
        type: 'post',
        text: `You posted tuition for "${t.subject}"`,
        time: t.createdAt,
        icon: FileText,
        color: 'text-blue-500',
        bg: 'bg-blue-100'
      })),
      ...payments.map(p => ({
        type: 'payment',
        text: `Payment of ৳${p.amount} successful for ${p.tutorName}`,
        time: p.date,
        icon: DollarSign,
        color: 'text-orange-500',
        bg: 'bg-orange-100'
      })),
      ...applications.map(a => ({
        type: 'application',
        text: `Tutor "${a.tutorName}" is shortlisted`,
        time: a.createdAt,
        icon: Users,
        color: 'text-purple-500',
        bg: 'bg-purple-100'
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

    return {
      stats: { totalPosted: tuitions.length, pending: pendingPosts, approved: approvedPosts, totalSpent },
      recentPosts: tuitions.slice(0, 5),
      chartData,
      activityFeed: feed,
      pendingAppsCount
    };
  }, [tuitions, payments, applications, loadingTuitions, loadingPayments, loadingApps]);


  // --- 4. Helper Functions ---
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
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
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // --- 5. Conditional Rendering ---

  if (loadingTuitions || loadingPayments || loadingApps) {
    return <Loading />;
  }

  // Handle Errors (Check if any query failed)
  if (errorTuitions || errorPayments || errorApps) {
    const status = errObjTuitions?.response?.status || errObjPayments?.response?.status || errObjApps?.response?.status;
    if (status === 401 || status === 403) return <Unauthorized />;
    return <ServerDown />;
  }

  const { stats, recentPosts, chartData, activityFeed, pendingAppsCount } = dashboardData;

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8 pt-24 md:pt-32 pb-12">
      
      {/* 1. WELCOME CARD */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 md:p-10 text-white shadow-xl mb-8 relative overflow-hidden"
      >
        <div className="relative z-10">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Hi, {user?.name || "Student"}! 👋</h1>
          <p className="text-emerald-100 text-sm md:text-lg mb-6 max-w-2xl">
            "Education is the most powerful weapon which you can use to change the world."
          </p>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-medium">
            <Clock size={16} />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 md:w-64 h-40 md:h-64 bg-white/10 rounded-full blur-3xl"></div>
      </motion.div>

      {/* 2. STATISTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          { label: 'Total Posted', value: String(stats.totalPosted).padStart(2, '0'), icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Posts', value: String(stats.pending).padStart(2, '0'), icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Active/Approved', value: String(stats.approved).padStart(2, '0'), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Spent', value: `৳${(stats.totalSpent / 1000).toFixed(1)}k`, icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-xs md:text-sm font-medium">{stat.label}</p>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} md:size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* 3. SPENDING CHART */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-600"/> Monthly Spending
            </h3>
          </div>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#059669' }}
                />
                <Area type="monotone" dataKey="spent" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSpent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 4. QUICK ACTIONS */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3 flex-1">
            <button 
              onClick={() => navigate('/dashboard/post-tuition')}
              className="w-full flex items-center gap-3 p-3 md:p-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors group"
            >
              <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                <PlusCircle size={20} />
              </div>
              <span className="font-semibold text-sm md:text-base">Post New Tuition</span>
            </button>

            <button 
              onClick={() => navigate('/dashboard/applied-tutors')}
              className="w-full flex items-center gap-3 p-3 md:p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors group"
            >
               <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <span className="font-semibold text-sm md:text-base">View Applicants</span>
              {pendingAppsCount > 0 && (
                <span className="ml-auto bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
                  {pendingAppsCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => navigate('/dashboard/payment-history')}
              className="w-full flex items-center gap-3 p-3 md:p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-colors group"
            >
               <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                <CreditCard size={20} />
              </div>
              <span className="font-semibold text-sm md:text-base">Payment History</span>
            </button>

             <button 
               onClick={() => navigate('/dashboard/my-tuitions')}
               className="w-full flex items-center gap-3 p-3 md:p-4 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl transition-colors group"
            >
               <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                <BookOpen size={20} />
              </div>
              <span className="font-semibold text-sm md:text-base">My Tuitions</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* 5. SHORTLISTED TUTORS ALERT */}
      {pendingAppsCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 md:p-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-start md:items-center gap-4">
            <div className="p-3 bg-white rounded-full text-orange-500 shadow-sm animate-pulse shrink-0">
              <Bell size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-lg">{pendingAppsCount} Tutors Shortlisted!</h4>
              <p className="text-sm text-gray-600">You have {pendingAppsCount} tutors waiting for your review or hire.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/dashboard/applied-tutors')}
            className="w-full md:w-auto px-6 py-3 md:py-2 bg-white text-orange-600 font-semibold rounded-lg shadow-sm border border-orange-100 hover:bg-orange-50 transition-colors whitespace-nowrap text-center"
          >
            View Now
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 6. RECENT POSTS TABLE */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Recent Tuition Posts</h3>
            <button 
              onClick={() => navigate('/dashboard/my-tuitions')}
              className="text-emerald-600 text-sm font-medium hover:underline"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Subject & Class</th>
                  <th className="px-6 py-4 font-semibold">Salary</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentPosts.length > 0 ? (
                  recentPosts.map((post) => (
                    <tr key={post._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">{post.subject}</p>
                        <p className="text-xs text-gray-500">{post.class}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">৳{post.salary}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{new Date(post.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(post.status)}`}>
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-full transition-colors">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-400">
                      No tuition posts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 7. ACTIVITY FEED */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
           <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
          
          <div className="space-y-6">
            {activityFeed.length > 0 ? (
              activityFeed.map((activity, index) => (
                <div key={index} className="flex gap-4 relative">
                  {/* Connector Line */}
                  {index !== activityFeed.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-[-24px] w-0.5 bg-gray-100"></div>
                  )}
                  
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.bg} ${activity.color}`}>
                    <activity.icon size={18} />
                  </div>
                  <div>
                    <p className="text-gray-800 text-sm font-medium leading-tight mb-1">
                      {activity.text}
                    </p>
                    <p className="text-xs text-gray-400">{timeAgo(activity.time)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center">No recent activity.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboardHome;