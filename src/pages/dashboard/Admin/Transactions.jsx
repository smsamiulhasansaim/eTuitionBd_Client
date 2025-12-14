import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { 
  MdSearch, MdDownload, MdFilterList, MdReceipt,
  MdCheckCircle, MdCancel, MdPending, MdClose, MdDateRange
} from 'react-icons/md';

// Import Custom Components
import Loading from '../../../components/common/Loading';
import ServerDown from '../../common/ServerDown';
import Unauthorized from '../../common/Unauthorized';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Transactions = () => {
  // Local UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); 
  const [viewReceipt, setViewReceipt] = useState(null); 

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


  // --- 2. Fetch Transactions (Query - SECURED) ---
  const fetchTransactions = async () => {
    if (!isUserValid) throw new Error("Unauthorized");
    
    const res = await axios.get(`${API_URL}/api/admin/transactions`, authConfig);
    return res.data.data;
  };

  const { data: transactions = [], isLoading, isError, error } = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
    enabled: isUserValid, 
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2, 
    retry: 1
  });

  // --- 3. Filter Logic ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      const matchesSearch = 
        (txn.id && txn.id.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (txn.user && txn.user.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "All" || txn.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchTerm, statusFilter]);

  // --- 4. Export CSV Function ---
  const downloadCSV = () => {
    if (filteredTransactions.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ["Transaction ID,Date,User,Type,Method,Amount,Status,Reference"];
    const rows = filteredTransactions.map(t => 
      `${t.id},${t.date},${t.user},${t.type},${t.method},${t.amount},${t.status},${t.ref}`
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

  // Helper for Status Styles
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Success': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Failed': return 'bg-red-100 text-red-700 border-red-200';
      case 'Refunded': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // --- Render States ---
  if (isLoading) return <Loading />;

  if (isError || !isUserValid) {
    if (!isUserValid || error?.response?.status === 401 || error?.response?.status === 403 || error?.message === "Unauthorized") {
      return <Unauthorized />;
    }
    return <ServerDown />;
  }

  // --- Main UI ---
  return (
    <div className="space-y-6 animate-fade-in-up p-4 md:p-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Transaction History</h2>
          <p className="text-sm text-gray-500">Manage and track all financial activities</p>
        </div>
        <button 
          onClick={downloadCSV}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
        >
          <MdDownload size={18} /> Export Report
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by ID or User Name..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <MdFilterList className="text-gray-400 mr-1 hidden md:block" />
          {['All', 'Success', 'Pending', 'Failed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`
                px-3 py-1.5 text-xs font-bold rounded-lg border transition-all whitespace-nowrap
                ${statusFilter === status 
                  ? 'bg-gray-800 text-white border-gray-800 shadow-md' 
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}
              `}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Type / Method</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((txn, index) => (
                  <tr key={txn.id || index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono font-bold text-indigo-600">{txn.id}</td>
                    
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MdDateRange className="text-gray-400" size={14} /> {txn.date}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{txn.user}</td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-700">{txn.type}</span>
                        <span className="text-[10px] text-gray-400">{txn.method}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-sm font-bold text-gray-800 text-right">
                      {txn.amount ? txn.amount.toLocaleString() : 0} BDT
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${getStatusBadge(txn.status)}`}>
                        {txn.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setViewReceipt(txn)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View Receipt"
                      >
                        <MdReceipt size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                       <MdSearch size={40} className="text-gray-200" />
                       <p>No transactions found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Receipt Modal */}
      {viewReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setViewReceipt(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-scale-up overflow-hidden" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <MdReceipt className="text-indigo-600" /> Transaction Receipt
              </h3>
              <button onClick={() => setViewReceipt(null)} className="text-gray-400 hover:text-gray-600">
                <MdClose size={22} />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-6 space-y-4">
              <div className="text-center mb-6">
                 <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Amount</p>
                 <h2 className="text-3xl font-extrabold text-indigo-600">
                   ৳{viewReceipt.amount ? viewReceipt.amount.toLocaleString() : 0} 
                 </h2>
                 <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mt-2 ${getStatusBadge(viewReceipt.status)}`}>
                   {viewReceipt.status === 'Success' && <MdCheckCircle />}
                   {viewReceipt.status === 'Pending' && <MdPending />}
                   {viewReceipt.status === 'Failed' && <MdCancel />}
                   {viewReceipt.status}
                 </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-mono font-medium text-gray-800">{viewReceipt.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Date & Time</span>
                  <span className="font-medium text-gray-800">{viewReceipt.date}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">User Name</span>
                  <span className="font-medium text-gray-800">{viewReceipt.user}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="font-medium text-gray-800">{viewReceipt.method}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Reference No</span>
                  <span className="font-mono font-medium text-gray-800">{viewReceipt.ref}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 flex justify-center">
              <button 
                className="text-sm font-bold text-indigo-600 hover:underline"
                onClick={() => alert("Printing feature coming soon!")}
              >
                Download PDF Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Transactions;