import React from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { 
  MdAttachMoney, MdPeople, MdSchool, MdClass, MdTrendingUp, 
  MdPending, MdMoreVert, MdCheckCircle
} from 'react-icons/md';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

// Import Custom Components
import Loading from '../../../components/common/Loading';
import ServerDown from '../../common/ServerDown';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper Component
const StatsCard = ({ title, count, icon, color, trend }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">{count}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
    </div>
    <div className="mt-4 flex items-center text-xs">
      <span className="text-green-500 font-bold flex items-center gap-1">
        <MdTrendingUp /> {trend}
      </span>
      <span className="text-gray-400 ml-2">Currently</span>
    </div>
  </div>
);

const DashboardHome = () => {

  // --- 1. Get Auth Config ---
  const { authConfig } = useMemo(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return { authConfig: {} };
    
    const userData = JSON.parse(userStr);
    const authToken = userData.token || userData.jwtToken || localStorage.getItem("adminToken") || localStorage.getItem("jwtToken"); 

    const config = {
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : undefined,
      },
    };
    return { authConfig: config };
  }, []);


  // --- 2. Fetch Dashboard Data (SECURED) ---
  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/dashboard-stats`, authConfig);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  };

  const { data: dashboardData, isLoading, isError, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: fetchDashboardData,
    enabled: !!authConfig.headers?.Authorization,
    refetchOnWindowFocus: false, 
    staleTime: 1000 * 60 * 5, 
    retry: false,
  });

  // --- 3. State Handling ---
  if (isLoading) return <Loading />;
  
  if (isError) {
    const status = error.response?.status;
    
    if (status === 401 || status === 403) {
      return (
        <div className="text-center py-20">
          <h2 className="text-xl font-bold text-red-600">Session Error</h2>
          <p className="text-gray-600 mt-2">Authentication failed. Please log in again.</p>
        </div>
      );
    }
    
    return <ServerDown />;
  }

  // --- 4. Destructuring with Fallbacks ---
  const { 
    totalEarnings = 0, 
    todaysEarnings = 0, 
    totalPending = 0, 
    stats = {
      totalUsers: 0,
      activeStudents: 0,
      verifiedTutors: 0,
      totalTuitions: 0
    }, 
    earningsData = [], 
    userGrowthData = [], 
    recentPayments = [] 
  } = dashboardData || {};

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
          <p className="text-gray-500 mt-1">Here is what's happening with your platform today.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 font-medium shadow-sm">
          Date: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* 2. Earnings Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Total Earnings Card */}
        <div className="lg:col-span-2 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
          
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <MdAttachMoney size={32} className="text-white" />
              </div>
              <span className="bg-green-400/20 text-green-100 text-xs font-bold px-2 py-1 rounded-lg border border-green-400/30">
                Live Data
              </span>
            </div>
            
            <div className="mt-6">
              <p className="text-indigo-100 text-sm font-medium mb-1">Total Platform Earnings</p>
              <h2 className="text-4xl font-extrabold tracking-tight">
                ৳ {totalEarnings.toLocaleString()}
              </h2>
            </div>
          </div>
        </div>

        {/* Today's Earnings & Quick Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Today's Earnings</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">৳ {todaysEarnings.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <MdTrendingUp size={24} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending Payments</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">৳ {totalPending.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              <MdPending size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Platform Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Users" 
          count={stats.totalUsers} 
          icon={<MdPeople size={24} />} 
          color="bg-blue-50 text-blue-600" 
          trend="Active"
        />
        <StatsCard 
          title="Active Students" 
          count={stats.activeStudents} 
          icon={<MdSchool size={24} />} 
          color="bg-pink-50 text-pink-600" 
          trend="Live"
        />
        <StatsCard 
          title="Verified Tutors" 
          count={stats.verifiedTutors} 
          icon={<MdClass size={24} />} 
          color="bg-purple-50 text-purple-600" 
          trend="Verified"
        />
        <StatsCard 
          title="Total Tuitions" 
          count={stats.totalTuitions} 
          icon={<MdCheckCircle size={24} />} 
          color="bg-teal-50 text-teal-600" 
          trend="Posted"
        />
      </div>

      {/* 4. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Chart (Last 7 Days) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Earnings Overview (Last 7 Days)</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsData}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  itemStyle={{ color: '#4F46E5', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="earnings" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">User Growth</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MdMoreVert size={20} />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#9CA3AF'}} 
                  dy={10} 
                  interval="preserveStart"
                />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                <Tooltip 
                    cursor={{fill: '#F3F4F6'}}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="students" name="Students" fill="#818CF8" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="tutors" name="Tutors" fill="#C084FC" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
              </div>

      {/* 5. Recent Payments Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
          <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800 hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs text-gray-500 font-semibold bg-gray-50/50 uppercase tracking-wider">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment, index) => (
                  <tr key={payment.id || index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{payment.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                          {payment.user?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm text-gray-800 font-medium">{payment.user}</span>
                      </div>
                      <div className="text-xs text-gray-400 pl-11">{payment.type}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">{payment.amount}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{payment.date}</td>
                    <td className="px-6 py-4">
                      <span className={`
                        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                        ${payment.status === 'Success' ? 'bg-green-50 text-green-600' : 
                          'bg-orange-50 text-orange-600'}
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          payment.status === 'Success' ? 'bg-green-500' : 
                          'bg-orange-500'
                        }`}></span>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-400">No recent transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default DashboardHome;