import React, { useState, useMemo, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  BookOpen, MapPin, DollarSign, Calendar, Clock, 
  FileText, Send, AlertCircle, Layers 
} from 'lucide-react';

// --- Custom Components ---
import ServerDown from '../../common/ServerDown';

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL;

const PostTuition = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- 1. Form State ---
  const initialFormState = {
    subject: '',
    class: '',
    semester: '',
    medium: 'Bangla Medium',
    salary: '',
    daysPerWeek: '',
    genderPreference: 'Any',
    location: '',
    time: '',
    requirements: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- 2. User Authentication Check & Token Retrieval ---
  const { user, authConfig, isUserValid } = useMemo(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return { user: null, authConfig: {}, isUserValid: false };
    }

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

  // Redirect if not logged in
  useEffect(() => {
    if (!isUserValid) {
      const timer = setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [isUserValid, navigate]);

  // --- 3. Mutation for Form Submission ---
  const mutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(`${API_URL}/api/tuitions/create`, payload, authConfig);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myTuitions']);
      setFormData(initialFormState);

      Swal.fire({
        title: 'Success!',
        text: 'Your tuition post has been submitted and is Pending Review.',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'View My Tuitions',
        cancelButtonText: 'Post Another',
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/dashboard/my-tuitions');
        }
      });
    },
    onError: (error) => {
      const status = error.response?.status;
      let errorMessage = error.response?.data?.message || "Something went wrong.";

      if (status === 401 || status === 403) {
        errorMessage = "Session expired or unauthorized. Please log in again.";
        localStorage.removeItem('user');
        navigate('/login');
      }

      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: errorMessage,
        confirmButtonColor: '#EF4444'
      });
    }
  });

  // --- 4. Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isUserValid) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Required',
        text: 'You must be logged in to post a tuition.',
      });
      return;
    }

    const payload = {
      ...formData,
      studentName: user.name, 
      studentEmail: user.email, 
      status: 'pending'
    };

    mutation.mutate(payload);
  };

  // --- 5. Helper Logic ---
  const isDiplomaStudent = formData.class.includes("Diploma");

  // --- 6. Render Logic (Auth Guards & Server Check) ---
  if (!isUserValid) return null; 
  
  if (mutation.error?.response?.status >= 500) return <ServerDown />;

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8 pt-24 md:pt-32 pb-12">
      
      <div className="max-w-4xl mx-auto">
        
        {/* --- PAGE HEADER --- */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Post a New Tuition</h1>
          <p className="text-gray-500 mt-2">
            Fill in the details below to find the perfect tutor. Your post will be reviewed by our admins.
          </p>
        </div>

        {/* --- FORM CONTAINER --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Form Header Strip */}
          <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center gap-2 text-emerald-700">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">Please provide accurate information to get the best tutors.</span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            
            {/* --- SECTION 1: ACADEMIC DETAILS --- */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-emerald-500 pl-3">
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Class Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Class / Grade *</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select 
                      name="class" 
                      required
                      value={formData.class}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white"
                    >
                      <option value="">Select Class</option>
                      <option value="Class 1">Class 1</option>
                      <option value="Class 5">Class 5</option>
                      <option value="Class 8">Class 8</option>
                      <option value="SSC / Class 9-10">SSC / Class 9-10</option>
                      <option value="HSC / Class 11-12">HSC / Class 11-12</option>
                      <option value="English Medium">English Medium</option>
                      <option value="Diploma in Engineering">Diploma in Engineering</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Semester Input (For Diploma) */}
                {isDiplomaStudent && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-medium text-gray-700">Semester *</label>
                    <div className="relative">
                      <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <select 
                        name="semester" 
                        required={isDiplomaStudent}
                        value={formData.semester}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white"
                      >
                        <option value="">Select Semester</option>
                        <option value="1st Semester">1st Semester</option>
                        <option value="2nd Semester">2nd Semester</option>
                        <option value="3rd Semester">3rd Semester</option>
                        <option value="4th Semester">4th Semester</option>
                        <option value="5th Semester">5th Semester</option>
                        <option value="6th Semester">6th Semester</option>
                        <option value="7th Semester">7th Semester</option>
                        <option value="8th Semester">8th Semester</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {/* Medium Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Medium *</label>
                  <div className="relative">
                    <select 
                      name="medium" 
                      required
                      value={formData.medium}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white"
                    >
                      <option value="Bangla Medium">Bangla Medium</option>
                      <option value="English Medium">English Medium</option>
                      <option value="English Version">English Version</option>
                      <option value="Madrasa">Madrasa</option>
                    </select>
                  </div>
                </div>

                {/* Subjects Input */}
                <div className={`space-y-2 ${isDiplomaStudent ? '' : 'md:col-span-2'}`}>
                  <label className="text-sm font-medium text-gray-700">Subjects *</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      name="subject"
                      required
                      placeholder="e.g. Math, Physics, Chemistry (All Subjects)"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* --- SECTION 2: SCHEDULE & SALARY --- */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-emerald-500 pl-3 mt-4">
                Schedule & Budget
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Days Per Week */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Days per Week *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select 
                      name="daysPerWeek" 
                      required
                      value={formData.daysPerWeek}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white"
                    >
                      <option value="">Select Days</option>
                      <option value="3 Days/Week">3 Days/Week</option>
                      <option value="4 Days/Week">4 Days/Week</option>
                      <option value="5 Days/Week">5 Days/Week</option>
                      <option value="6 Days/Week">6 Days/Week</option>
                    </select>
                  </div>
                </div>

                {/* Salary */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Salary Budget (BDT) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="number" 
                      name="salary"
                      required
                      placeholder="e.g. 5000"
                      value={formData.salary}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    />
                  </div>
                </div>

                 {/* Preferred Time */}
                 <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Preferred Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      name="time"
                      placeholder="e.g. 4:00 PM - 6:00 PM"
                      value={formData.time}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Tutor Gender Preference */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tutor Gender Preference</label>
                  <div className="relative">
                    <select 
                      name="genderPreference" 
                      value={formData.genderPreference}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white"
                    >
                      <option value="Any">Any Gender</option>
                      <option value="Male">Male Only</option>
                      <option value="Female">Female Only</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* --- SECTION 3: LOCATION & EXTRA --- */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-emerald-500 pl-3 mt-4">
                Location & Requirements
              </h3>
              
              <div className="space-y-6">
                {/* Location Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Detailed Address / Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <textarea 
                      name="location"
                      required
                      rows="2"
                      placeholder="e.g. House 12, Road 5, Sector 10, Uttara, Dhaka"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Requirements Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Additional Requirements</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <textarea 
                      name="requirements"
                      rows="3"
                      placeholder="e.g. Need a tutor from BUET/DU, must be friendly with kids..."
                      value={formData.requirements}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* --- SUBMIT BUTTON --- */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={mutation.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? (
                  <>
                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                     Processing...
                  </>
                ) : (
                  <>
                    <Send size={20} /> Post Tuition Now
                  </>
                )}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default PostTuition;