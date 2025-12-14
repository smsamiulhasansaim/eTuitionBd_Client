import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  Search, Download, CreditCard, Calendar, 
  CheckCircle, FileText, ArrowUpRight, Filter 
} from 'lucide-react';

// --- Custom Components ---
import Loading from '../../../components/common/Loading';
import ServerDown from '../../common/ServerDown';
import Unauthorized from '../../common/Unauthorized';

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL;

const PaymentHistory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

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

  // --- Handle Redirect if not logged in ---
  if (!isUserValid) {
    navigate("/login");
    return null;
  }
  
  // --- 2. Data Fetching (TanStack Query) ---
  const { 
    data: payments = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['paymentHistory', user?.email],
    queryFn: async () => {
      if (!isUserValid) return [];
      
      const studentEmail = user.email;
      
      // Assuming backend needs email as query parameter for specificity
      const response = await axios.get(`${API_URL}/api/payment/my-payments?email=${studentEmail}`, authConfig);
      return response.data.data;
    },
    enabled: isUserValid, 
    retry: 1
  });

  // --- 3. Optimized Filtering & Calculations (useMemo) ---
  
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => 
      payment.tutorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.tuitionTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [payments, searchTerm]);

  const totalSpent = useMemo(() => {
    return payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [payments]);

  // --- 4. Helpers ---
  const formatDate = (isoDate) => {
    if (!isoDate) return "N/A";
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  const formatTime = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit"
    });
  };

  const handleDownloadInvoice = (transactionId) => {
    Swal.fire({
      icon: 'info',
      title: 'Invoice Generation',
      text: `Invoice for ${transactionId?.substring(0, 8) || 'N/A'}... is being generated. This feature is coming soon!`,
      confirmButtonColor: '#10B981',
    });
  };

  // --- 5. Conditional Rendering ---

  if (isLoading) return <Loading />;

  if (isError) {
    const status = error.response?.status;
    if (status === 401 || status === 403) return <Unauthorized />;
    return <ServerDown />;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8 pt-24 md:pt-32 pb-12">
      
      {/* --- HEADER & SUMMARY --- */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 max-w-7xl mx-auto">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">Payment History</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track all your tuition fee payments and download invoices.
          </p>
        </div>

        {/* Total Spent Card */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-4 min-w-[250px]"
        >
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Total Spent</p>
            <h3 className="text-2xl font-bold text-gray-800">৳{totalSpent.toLocaleString()}</h3>
          </div>
        </motion.div>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="max-w-7xl mx-auto bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by Tutor, ID or Subject..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
          />
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 font-medium rounded-lg hover:bg-gray-200 transition-colors w-full md:w-auto justify-center">
          <Filter size={18} /> Filter
        </button>
      </div>

      {/* --- TRANSACTIONS TABLE --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 font-semibold">Transaction ID</th>
                <th className="px-6 py-4 font-semibold">Tutor & Subject</th>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors group">
                    
                    {/* Transaction ID */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-mono text-gray-600 text-sm font-medium">
                        {item.transactionId ? item.transactionId.substring(0, 14) + "..." : "N/A"}
                        <ArrowUpRight size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </td>

                    {/* Tutor & Subject */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <img 
                          src={`https://ui-avatars.com/api/?name=${item.tutorName}&background=random&color=fff`} 
                          alt={item.tutorName} 
                          className="w-9 h-9 rounded-full object-cover shadow-sm" 
                        />
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{item.tutorName}</p>
                          <p className="text-xs text-gray-500">{item.tuitionTitle || item.subject || "Tuition"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar size={14} className="text-gray-400"/>
                        {formatDate(item.date)}
                        <span className="text-gray-400 text-xs ml-1">
                          {formatTime(item.date)}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">৳{item.amount}</div>
                      <div className="text-xs text-gray-400">via Card/Stripe</div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <CheckCircle size={12} /> {item.paymentStatus || "Paid"}
                      </span>
                    </td>

                    {/* Action (Invoice) */}
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDownloadInvoice(item.transactionId)}
                        className="text-gray-400 hover:text-emerald-600 transition-colors p-2 hover:bg-emerald-50 rounded-lg" 
                        title="Download Invoice"
                      >
                        <Download size={18} />
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    <FileText size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No transactions found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentHistory;