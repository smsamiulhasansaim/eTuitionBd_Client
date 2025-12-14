import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  Star, Clock, CheckCircle, XCircle, CreditCard, ShieldCheck, X, AlertTriangle, GraduationCap, Hourglass
} from 'lucide-react';

import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

import Loading from '../../../components/common/Loading';
import ServerDown from '../../common/ServerDown';
import Unauthorized from '../../common/Unauthorized';

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL;
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const getStatusBadge = (status) => {
    switch (status) {
        case 'Shortlisted':
            return { text: 'Shortlisted', className: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle };
        case 'Pending':
            return { text: 'Application Pending', className: 'bg-amber-100 text-amber-700 border-amber-200', icon: Hourglass };
        case 'Rejected':
            return { text: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200', icon: XCircle };
        default:
            return { text: status, className: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock };
    }
};

/**
 * CheckoutForm Component - Handles Stripe payment and hiring backend synchronization.
 */
const CheckoutForm = ({ selectedTutor, closePaymentModal, authConfig, user }) => { 
  const stripe = useStripe();
  const elements = useElements();
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Helper to extract the correct tutor ID from aggregated data
  const getTutorId = (rawTutorId) => {
      return typeof rawTutorId === 'object' && rawTutorId !== null ? rawTutorId._id || rawTutorId.$oid : rawTutorId;
  }

  const bookingMutation = useMutation({
    mutationFn: async ({ paymentIntentId }) => {
      const finalTutorId = getTutorId(selectedTutor.tutorId);
      
      // Trigger Backend Booking/Hiring API
      await axios.patch(`${API_URL}/api/applications/hire-success/${selectedTutor._id}`, {
          transactionId: paymentIntentId 
      }, authConfig);

      return true;
    },
    onSuccess: () => {
      setProcessing(false);
      queryClient.invalidateQueries(['shortlistedTutors']); 
      
      Swal.fire({
        icon: 'success',
        title: 'Hiring Successful!',
        text: `You have successfully hired ${selectedTutor.tutorName}`,
        confirmButtonColor: '#10B981'
      }).then(closePaymentModal);
    },
    onError: (err) => {
      console.error("Booking Error:", err);
      setError(err.response?.data?.message || "Payment succeeded, but system update failed. Please contact support.");
      setProcessing(false);
    }
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) return;
    
    const salary = parseInt(selectedTutor.expectedSalary) || 0;
    if (salary <= 0) {
        setError("Invalid salary amount for payment.");
        setProcessing(false);
        return;
    }

    try {
      // 1. Create Payment Intent
      const { data: intentData } = await axios.post(`${API_URL}/api/payment/create-payment-intent`, {
        price: salary
      }, authConfig);

      if (!intentData.clientSecret) throw new Error("Failed to initialize payment.");

      // 2. Confirm Card Payment
      const result = await stripe.confirmCardPayment(intentData.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user?.name || "Student", 
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
        setProcessing(false);
      } else if (result.paymentIntent.status === "succeeded") {
        // 3. Trigger Backend Update (Hiring & Booking Creation)
        bookingMutation.mutate({ paymentIntentId: result.paymentIntent.id });
      }
    } catch (err) {
      setError(err.message || "Something went wrong during payment processing.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <CardElement options={{
            style: {
              base: { fontSize: '16px', color: '#1f2937', '::placeholder': { color: '#9ca3af' } },
              invalid: { color: '#ef4444' },
            },
        }}/>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
          <XCircle size={16} /> {error}
        </div>
      )}
      
      <button 
        type="submit" 
        disabled={!stripe || processing} 
        className={`w-full font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2
          ${(processing)
            ? "bg-gray-400 cursor-not-allowed text-gray-100" 
            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
          }`}
      >
        {processing ? "Processing..." : `Pay ৳${selectedTutor.expectedSalary} & Hire`}
      </button>
    </form>
  );
};

/**
 * Main Component: AppliedTutors
 */
const AppliedTutors = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedTutor, setSelectedTutor] = useState(null); 
  const [rejectId, setRejectId] = useState(null); 
  const [rejectReason, setRejectReason] = useState(""); 

  const { user, authConfig, isUserValid } = useMemo(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return { user: null, authConfig: {}, isUserValid: false };

    const userData = JSON.parse(userStr);
    const authToken = userData.token || userData.jwtToken || localStorage.getItem('jwtToken'); 
    
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
  
  if (!isUserValid) {
    return <Unauthorized />; 
  }

  const fetchApplicationsAndTuitions = async () => {
    // Helper to robustly get tuition ID
    const getTuitionId = (rawTId) => {
        return typeof rawTId === 'object' && rawTId !== null ? rawTId._id || rawTId.$oid : rawTId;
    };

    const appRes = await axios.get(`${API_URL}/api/applications/student-view`, authConfig);
    const visibleApplications = appRes.data.data; 

    const mergedData = await Promise.all(visibleApplications.map(async (app) => {
      try {
        const tId = getTuitionId(app.tuitionId);
        const tuitionRes = await axios.get(`${API_URL}/api/tuitions/id/${tId}`, authConfig);
        
        return {
          ...app,
          tuitionData: tuitionRes.data.data 
        };
      } catch (err) {
        console.warn(`Could not fetch tuition details for Application ID ${app._id}.`, err);
        return { ...app, tuitionData: null };
      }
    }));

    return mergedData.filter(app => app.tuitionData !== null);
  };
  
  const { 
    data: applicants = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['shortlistedTutors'],
    queryFn: fetchApplicationsAndTuitions,
    retry: 1,
    onError: (err) => {
       if(err.response?.status === 401 || err.response?.status === 403) navigate('/login');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      await axios.patch(`${API_URL}/api/applications/reject-student/${rejectId}`, { 
        reason: rejectReason 
      }, authConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shortlistedTutors']);
      setRejectId(null);
      setRejectReason("");
      Swal.fire({
        icon: 'success',
        title: 'Rejected',
        text: 'The application has been rejected.',
        timer: 2000,
        showConfirmButton: false
      });
    },
    onError: () => {
      Swal.fire('Error', 'Failed to reject application', 'error');
    }
  });

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      Swal.fire('Warning', 'Please enter a reason for rejection.', 'warning');
      return;
    }
    rejectMutation.mutate();
  };

  const closePaymentModal = () => {
    setSelectedTutor(null);
  };

  // --- Render States ---
  if (isLoading) return <Loading />;
  
  if (isError) {
    const status = error.response?.status;
    if (status === 401 || status === 403) return <Unauthorized />;
    return <ServerDown />;
  }

  // --- Render Component ---
  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8 pt-24 md:pt-32 pb-12">
      <div className="mb-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">Tutor Applications</h1>
        <p className="text-gray-500 mt-1">
          Review applied tutors. This list includes both pending and shortlisted applicants.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {applicants.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {applicants.map((tutor) => {
                const badge = getStatusBadge(tutor.status);
                const StatusIcon = badge.icon;
                const isShortlisted = tutor.status === 'Shortlisted';

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={tutor._id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                  >
                    <div className="p-6 flex items-start gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold border-4 border-emerald-50">
                          {tutor.tutorName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white" title="Verified">
                          <ShieldCheck size={12} />
                        </div>
                      </div>
                      <div className='flex-1'>
                        <h3 className="font-bold text-lg text-gray-800 leading-tight">
                          {tutor.tutorName}
                        </h3>
                        <div className="flex items-center gap-1 text-yellow-500 text-xs mt-1 font-bold">
                          <Star size={12} fill="currentColor" /> 4.8 
                          <span className="text-gray-400 font-normal ml-1">(Rating)</span>
                        </div>
                        <div className="mt-2 inline-block bg-emerald-50 px-2 py-1 rounded text-xs text-emerald-700 font-medium">
                          {tutor.experience || "Exp: N/A"}
                        </div>
                      </div>
                      <div className='flex-shrink-0'>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badge.className} border`}>
                            <StatusIcon size={12} />
                            {badge.text}
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-4 space-y-3 flex-1">
                      <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Applying For</p>
                        <p className="font-semibold text-gray-800 text-sm line-clamp-1">{tutor.tuitionTitle}</p>
                        {tutor.tuitionData && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                              {tutor.tuitionData.subject}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded">
                              {tutor.tuitionData.class}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
                              {tutor.tuitionData.location}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500 italic relative pl-3 border-l-2 border-gray-200">
                        "{tutor.message?.substring(0, 80)}..."
                      </div>

                      <div className="flex justify-between items-center text-sm pt-2">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Clock size={14} />
                          <span>{new Date(tutor.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-right">
                           <span className="block text-xs text-gray-400">Expecting</span>
                           <span className="text-emerald-600 font-bold text-lg">৳{tutor.expectedSalary}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 grid grid-cols-2 gap-3 border-t border-gray-100 bg-gray-50/50">
                        <button 
                            onClick={() => setRejectId(tutor._id)}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-100 text-red-600 font-semibold hover:bg-red-50 hover:border-red-200 transition-colors text-sm"
                        >
                            <XCircle size={16} /> Reject
                        </button>
                        <button 
                            onClick={() => setSelectedTutor(tutor)}
                            disabled={!isShortlisted} 
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-semibold transition-all text-sm
                                ${isShortlisted
                                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-95"
                                    : "bg-gray-400 cursor-not-allowed shadow-none"
                                }`}
                        >
                            <CheckCircle size={16} /> Hire Now
                        </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <GraduationCap className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700">No Active Applications</h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-2">
              No tutors have applied yet, or all applications have been finalized (Hired/Rejected).
            </p>
          </div>
        )}
      </div>

      {/* MODAL 1: REJECT */}
      <AnimatePresence>
        {rejectId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setRejectId(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md relative z-10 shadow-xl"
            >
              <div className="flex items-center gap-2 text-red-600 mb-4">
                <AlertTriangle size={24}/>
                <h3 className="text-lg font-bold">Reject Application</h3>
              </div>
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none mb-4"
                rows="4"
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-3">
                <button onClick={() => setRejectId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600">Cancel</button>
                <button 
                  onClick={handleRejectSubmit} 
                  disabled={rejectMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: PAYMENT GATEWAY */}
      <AnimatePresence>
        {selectedTutor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closePaymentModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden relative z-10 shadow-2xl"
            >
              <div className="bg-gray-900 text-white p-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-gray-800 rounded-lg">
                      <CreditCard className="text-emerald-400" size={20} />
                   </div>
                   <div>
                     <span className="font-bold text-lg block">Secure Checkout</span>
                     <span className="text-xs text-gray-400">Powered by Stripe</span>
                   </div>
                </div>
                <button onClick={closePaymentModal} className="text-gray-400 hover:text-white transition-colors"><X size={18}/></button>
              </div>

              <div className="p-6">
                <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-emerald-600 font-bold text-lg shadow-sm">
                      {selectedTutor.tutorName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase font-bold">Hiring Tutor</p>
                      <p className="font-bold text-gray-800 text-lg leading-none">{selectedTutor.tutorName}</p>
                      <p className="text-xs text-gray-500 mt-1 truncate max-w-[180px]">{selectedTutor.tuitionTitle}</p>
                    </div>
                </div>

                <Elements stripe={stripePromise}>
                  <CheckoutForm 
                    selectedTutor={selectedTutor} 
                    closePaymentModal={closePaymentModal}
                    authConfig={authConfig} 
                    user={user} 
                  />
                </Elements>

                <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-500"/> 
                  Your payment information is encrypted & secure.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AppliedTutors;