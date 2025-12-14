import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { 
  MdDownload, MdDateRange, MdAttachMoney, MdPerson
} from 'react-icons/md';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// Import Custom Components
import Loading from '../../../components/common/Loading';
import ServerDown from '../../common/ServerDown';
import Unauthorized from '../../common/Unauthorized'; 

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ReportsAnalytics = () => {
  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const COLORS = ['#4F46E5', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

  // --- 1. JWT Retrieval and Auth Config ---
  const { authConfig, isUserValid } = useMemo(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return { authConfig: {}, isUserValid: false };
    
    const userData = JSON.parse(userStr);
    
    const authToken = userData.token || userData.jwtToken || 
                      localStorage.getItem("adminToken") || localStorage.getItem("jwtToken"); 

    const config = {
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : undefined,
      },
    };
    
    return { 
        authConfig: config, 
        isUserValid: !!authToken && userData?.role === 'admin' 
    };
  }, []);

  // --- 2. Fetch Data (Query - SECURED) ---
  const fetchReports = async () => {
    if (!isUserValid) throw new Error("Unauthorized");
    
    const res = await axios.get(`${API_URL}/api/admin/analytics`, authConfig);
    return res.data.data;
  };

  const { data: reportData, isLoading, isError, error } = useQuery({
    queryKey: ['reportsAnalytics'],
    queryFn: fetchReports,
    enabled: isUserValid, 
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, 
    retry: 1
  });

  // Safe Destructuring with Defaults to prevent crashes
  const { 
    earningsData = [], 
    subjectData = [], 
    topTutors = [], 
    transactions = [] 
  } = reportData || {};

  // --- 3. Filter Logic ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (!startDate && !endDate) return true;
      
      const txnDate = new Date(t.date);
      const start = startDate ? new Date(startDate) : new Date('2000-01-01');
      const end = endDate ? new Date(endDate) : new Date('2099-12-31');
      
      // Reset time to start/end of day for accurate comparison
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999); 
      
      return txnDate >= start && txnDate <= end;
    });
  }, [transactions, startDate, endDate]);


  // --- 4. CSV Download Function ---
  const downloadCSV = () => {
    if (filteredTransactions.length === 0) {
      alert("No data to export!");
      return;
    }
    
    const headers = ["Transaction ID,Date,Student Name,Tutor Name,Amount,Status"];
    const rows = filteredTransactions.map(t => 
      `${t.id},${t.date},${t.student},${t.tutor},${t.amount},${t.status}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Render States ---
  if (isLoading) return <Loading />;
  
  if (isError || !isUserValid) {
    if (!isUserValid || error?.response?.status === 401 || error?.response?.status === 403 || error?.message === "Unauthorized") {
      return <Unauthorized />;
    }
    return <ServerDown />;
  }

  return (
    <div className="space-y-6 animate-fade-in-up p-4 md:p-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Financial Reports</h2>
          <p className="text-sm text-gray-500">Overview of platform earnings and payouts</p>
        </div>
        <button 
          onClick={downloadCSV}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
        >
          <MdDownload size={18} /> Export CSV
        </button>
      </div>

      {/* --- ANALYTICS SECTION (CHARTS) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Monthly Revenue */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-w-0">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <MdAttachMoney className="text-indigo-500" /> Monthly Revenue           </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={earningsData.length > 0 ? earningsData : [{name: 'No Data', amount: 0}]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#F3F4F6'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Classes (Pie) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-w-0">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Popular Subjects </h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectData.length > 0 ? subjectData : [{name: 'No Data', value: 1}]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
               <span className="text-2xl font-bold text-gray-800">Top</span>
               <span className="text-xs text-gray-500">Subjects</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Top Tutors List */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MdPerson className="text-purple-500" /> Top Performers
            </h3>
            <div className="space-y-4">
              {topTutors.length > 0 ? (
                topTutors.map((tutor, index) => {
                  const isFakeOrEmpty = !tutor.img || tutor.img.includes('pravatar.cc');
                  
                  const avatarSrc = isFakeOrEmpty
                    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=random&color=fff`
                    : tutor.img;

                  return (
                    <div key={tutor.id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors">
                      <span className="font-bold text-gray-300 text-lg">0{index + 1}</span>
                      
                      <img 
                        src={avatarSrc} 
                        alt={tutor.name} 
                        className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=random&color=fff`;
                        }}
                      />

                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800">{tutor.name}</p>
                        <p className="text-xs text-gray-500">{tutor.students} Active Students</p>
                      </div>
                      <span className="text-sm font-bold text-indigo-600">{tutor.earnings}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-400 text-sm">No data available</p>
              )}
            </div>
          </div>

         {/* --- TRANSACTIONS TABLE SECTION --- */}
         <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-lg font-bold text-gray-800">Transaction History</h3>
              
              {/* Date Filter */}
              <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                <MdDateRange className="text-gray-400 ml-2" />
                <input 
                  type="date" 
                  className="bg-transparent text-xs text-gray-600 outline-none"
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span className="text-gray-400">-</span>
                <input 
                  type="date" 
                  className="bg-transparent text-xs text-gray-600 outline-none"
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Tutor</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((txn, idx) => (
                      <tr key={txn.id || idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-mono text-gray-500">{txn.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{txn.date}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{txn.student}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{txn.tutor}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-800 text-right">
                          {txn.amount ? txn.amount.toLocaleString() : 0} BDT
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`
                            px-2.5 py-1 rounded-full text-xs font-bold
                            ${txn.status === 'Success' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'}
                          `}>
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-gray-400">
                        No transactions found in this range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;