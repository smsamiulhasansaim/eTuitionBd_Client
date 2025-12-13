import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Lock, Phone, Eye, EyeOff, 
  ArrowRight, GraduationCap, Briefcase 
} from 'lucide-react';
import Swal from 'sweetalert2';

// Firebase Imports
import { auth, googleProvider } from '../../firebase/functions/firebase.config'; 
import { signInWithPopup } from 'firebase/auth';

// Custom Components
import Loading from '../../components/common/Loading';

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL;

// --- Assets ---
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Register = () => {
  // --- Local State ---
  const [role, setRole] = useState('student'); 
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // --- 1. Prevent Access if Logged In ---
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) window.location.href = '/';
  }, []);

  // --- 2. Success Handler (Centralized) ---
  const handleRegisterSuccess = (data) => {
    // Save all necessary auth data
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('userId', data._id);
    localStorage.setItem('token', data.token);
    
    // Save identifiers for specific pages
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('userName', data.name);
    localStorage.setItem('userRole', data.role);

    Swal.fire({
      icon: 'success',
      title: 'Account Created!',
      text: `Welcome to eTuitionBD, ${data.name}!`,
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      // Redirect based on role
      window.location.href = data.role === 'admin' ? '/' : '/';
    });
  };

  // --- 3. Mutations (TanStack Query) ---

  // A. Email Registration Mutation
  const registerMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(`${API_URL}/api/auth/register`, payload);
      return response.data;
    },
    onSuccess: (data) => handleRegisterSuccess(data),
    onError: (error) => {
      const msg = error.response?.data?.message || "Registration failed. Please try again.";
      // Set specific field error if applicable
      if (msg.toLowerCase().includes('email')) {
        setFormErrors(prev => ({ ...prev, email: msg }));
      }
      Swal.fire('Error', msg, 'error');
    }
  });

  // B. Google Registration Mutation
  const googleRegisterMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(`${API_URL}/api/auth/google`, payload);
      return response.data;
    },
    onSuccess: (data) => handleRegisterSuccess(data),
    onError: (error) => {
      console.error("Google Auth Error:", error);
      Swal.fire('Error', 'Google Sign-in failed on server.', 'error');
    }
  });

  // --- 4. Validation Logic ---
  const validateForm = () => {
    let newErrors = {};
    const bdPhoneRegex = /^01[3-9]\d{8}$/; 

    if (!formData.name.trim()) newErrors.name = "Full Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!bdPhoneRegex.test(formData.phone)) {
      newErrors.phone = "Invalid BD Phone (e.g., 017xxxxxxxx)";
    }

    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- 5. Handlers ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" });
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    registerMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: role 
    });
  };

  const handleGoogleRegister = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      googleRegisterMutation.mutate({
        name: user.displayName,
        email: user.email,
        googleId: user.uid,
        role: role
      });
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Google Popup closed or failed.', 'error');
    }
  };

  const isLoading = registerMutation.isPending || googleRegisterMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-white py-12 px-4">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
      >
        <div className="p-8 md:p-10">
          
          {/* --- PAGE TITLE --- */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-500 mt-2">Join eTuitionBD to start your journey</p>
          </div>

          {/* --- ROLE SELECTION --- */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div 
              onClick={() => setRole('student')}
              className={`cursor-pointer rounded-xl p-4 border-2 flex flex-col items-center justify-center transition-all ${
                role === 'student' 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                  : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
              }`}
            >
              <GraduationCap size={28} className="mb-2" />
              <span className="font-bold">I am a Student</span>
            </div>

            <div 
              onClick={() => setRole('tutor')}
              className={`cursor-pointer rounded-xl p-4 border-2 flex flex-col items-center justify-center transition-all ${
                role === 'tutor' 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                  : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
              }`}
            >
              <Briefcase size={28} className="mb-2" />
              <span className="font-bold">I am a Tutor</span>
            </div>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            
            {/* FULL NAME */}
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" name="name" placeholder="Full Name"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-gray-50 ${formErrors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'}`}
                  value={formData.name} onChange={handleChange}
                />
              </div>
              {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
            </div>

            {/* EMAIL */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" name="email" placeholder="Email Address"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-gray-50 ${formErrors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'}`}
                  value={formData.email} onChange={handleChange}
                />
              </div>
              {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
            </div>

            {/* PHONE NUMBER */}
            <div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="tel" name="phone" placeholder="Phone Number (e.g. 017...)"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-gray-50 ${formErrors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'}`}
                  value={formData.phone} onChange={handleChange}
                />
              </div>
              {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
            </div>

            {/* PASSWORDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} name="password" placeholder="Password"
                    className={`w-full pl-10 pr-8 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-gray-50 ${formErrors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'}`}
                    value={formData.password} onChange={handleChange}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-gray-50 ${formErrors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'}`}
                    value={formData.confirmPassword} onChange={handleChange}
                  />
                </div>
                {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>}
              </div>
            </div>

            {/* REGISTER BUTTON */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 mt-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Create Account <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-sm text-gray-400 font-medium">OR</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {/* GOOGLE REGISTER BUTTON */}
          <button 
            type="button"
            onClick={handleGoogleRegister}
            disabled={isLoading}
            className="w-full py-3 border border-gray-200 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <span className="text-sm">Connecting...</span>
            ) : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </button>

          {/* LOGIN LINK */}
          <div className="mt-8 text-center text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-emerald-600 font-bold hover:underline">
              Login
            </a>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default Register;