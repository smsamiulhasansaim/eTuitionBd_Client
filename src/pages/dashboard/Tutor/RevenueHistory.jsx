import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  DollarSign, TrendingUp, Download, Calendar, 
  CreditCard, Filter, FileText 
} from 'lucide-react';

import Loading from '../../../components/common/Loading';
import ServerDown from '../../common/ServerDown';
import Unauthorized from '../../common/Unauthorized';

const API_URL = import.meta.env.VITE_API_URL;

const RevenueHistory = () => {
  const navigate = useNavigate();

  // --- User and Token Retrieval ---
  const { user, authToken } = useMemo(() => {
    const userStr = localStorage.getItem('user') || localStorage.getItem('userInfo');
    const user = userStr ? JSON.parse(userStr) : null;
    
    const token = user?.token || user?.jwtToken || localStorage.getItem('jwtToken') || localStorage.getItem('token');
    
    if (!user?._id || !token) {
      return { user: null, authToken: null };
    }
    
    return { user, authToken: token };
  }, []);
  
  // Data Fetching with Authentication
  const { 
    data: revenueData, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['revenueStats', user?._id],
    queryFn: async () => {
      if (!user?._id || !authToken) {
         throw new Error("Authentication context missing."); 
      }
      
      const response = await axios.get(
        `${API_URL}/api/revenue/${user._id}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`, 
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    },
    enabled: !!user?._id && !!authToken,
    retry: 1,
    onError: (err) => {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('user');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  });


  // Data Processing
  const { stats, chartData, transactions } = useMemo(() => {
    if (!revenueData?.success) {
      return {
        stats: { totalEarnings: 0, thisMonthEarnings: 0, pendingAmount: 0 },
        chartData: [],
        transactions: []
      };
    }

    const { totalEarnings, thisMonthEarnings, pendingAmount, chartData, transactions } = revenueData.data;
    
    return {
      stats: { 
        totalEarnings: totalEarnings || 0, 
        thisMonthEarnings: thisMonthEarnings || 0, 
        pendingAmount: pendingAmount || 0 
      },
      chartData: chartData.map(d => ({ name: d.name, income: d.income || 0 })) || [],
      transactions: transactions || []
    };
  }, [revenueData]);

  const getStatusBadge = (status) => {
    return status === 'Paid' 
      ? <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">Success</span>
      : <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-700">Processing</span>;
  };

  if (!user || !authToken) return <Unauthorized />;
  if (isLoading) return <Loading />;

  if (isError) {
    const status = error.response?.status;
    if (status === 401 || status === 403) return <Unauthorized />;
    return <ServerDown />;
  }

  return (
    <div className="space-y-6 animate-fade-in-up p-4 md:p-8 pt-24 md:pt-32 pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <DollarSign className="text-emerald-600" /> Revenue & Earnings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of your financial performance.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-50 hover:text-emerald-700 transition-all shadow-sm">
          <Download size={18} /> Export Report
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-xl text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-emerald-100 text-sm font-medium mb-1">Total Lifetime Earnings</p>
            <h3 className="text-3xl font-bold">৳ {stats.totalEarnings.toLocaleString()}</h3>
          </div>
          <div className="absolute right-4 bottom-4 opacity-20 bg-white p-2 rounded-full">
            <TrendingUp size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Earnings (This Month)</p>
              <h3 className="text-3xl font-bold text-gray-800">৳ {stats.thisMonthEarnings.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Calendar size={24} />
            </div>
          </div>
          <p className="text-xs text-green-600 font-medium mt-3 flex items-center gap-1">
            Running Month
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Pending / Due</p>
              <h3 className="text-3xl font-bold text-gray-800">৳ {stats.pendingAmount.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <CreditCard size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">From incomplete payments</p>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Income Growth (Last 6 Months)</h3>
        <div className="h-[300px] w-full">
          {chartData.length > 0 && chartData.some(d => d.income > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis 
                   tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`} // Format Y axis ticks
                   axisLine={false} 
                   tickLine={false} 
                   tick={{fill: '#9CA3AF', fontSize: 12}} 
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                  formatter={(value) => [`৳ ${value.toLocaleString()}`, 'Income']}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex items-center justify-center h-full text-gray-400">
               No income data available for chart.
             </div>
          )}
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
          <button className="text-gray-400 hover:text-gray-600">
            <Filter size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Trx Info</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.length === 0 ? (
                 <tr>
                   <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                     No recent transactions found.
                   </td>
                 </tr>
              ) : (
                transactions.map((trx) => (
                  <tr key={trx._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-xs font-mono text-gray-500">{trx.transactionId || 'N/A'}</p>
                      <p className="text-xs text-gray-400">{trx.subject}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-800">{trx.studentName}</p>
                      <p className="text-xs text-gray-500">{trx.subject}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(trx.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">৳ {trx.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">{getStatusBadge(trx.paymentStatus)}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-2 rounded-lg transition-colors" title="Download Invoice">
                        <FileText size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RevenueHistory;