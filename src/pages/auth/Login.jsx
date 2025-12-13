import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, ArrowRight } from 'lucide-react';
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

const Login = () => {
  // --- Local State ---
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  // --- 1. Prevent Access if Logged In ---
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      window.location.href = '/dashboard';
    }
  }, []);

  // --- 2. Login Logic Helper ---
  const handleLoginSuccess = (userData) => {
    // 1. Save Core User Data
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token); // JWT
    
    // 2. Save Specific Identifiers (Useful for Profile/API calls)
    if(userData._id) localStorage.setItem('userId', userData._id);
    if(userData.email) localStorage.setItem('userEmail', userData.email);
    if(userData.name) localStorage.setItem('userName', userData.name);
    if(userData.role) localStorage.setItem('userRole', userData.role);

    // 3. UI Feedback
    Swal.fire({
      icon: 'success',
      title: `Welcome back, ${userData.name}!`,
      text: 'Redirecting to your dashboard...',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      // 4. Redirect based on Role
      if (userData.role === 'admin') {
        window.location.href = '/dashboard/admin';
      } else if (userData.role === 'tutor') {
        window.location.href = '/tutor-dashboard'; // Assuming separate route
      } else {
        window.location.href = '/student-dashboard';
      }
    });
  };

  // --- 3. Mutation: Email Login ---
  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
      return response.data;
    },
    onSuccess: (data) => handleLoginSuccess(data),
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.response?.data?.message || 'Invalid email or password.',
        confirmButtonColor: '#EF4444'
      });
    }
  });

  // --- 4. Mutation: Google Login ---
  const googleLoginMutation = useMutation({
    mutationFn: async (googlePayload) => {
      const response = await axios.post(`${API_URL}/api/auth/google`, googlePayload);
      return response.data;
    },
    onSuccess: (data) => handleLoginSuccess(data),
    onError: (error) => {
      console.error("Google Auth Backend Error:", error);
      Swal.fire('Error', 'Google Login failed on server.', 'error');
    }
  });

  // --- 5. Handlers ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailLogin = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const handleGoogleLogin = async () => {
    try {
      // Step A: Firebase Popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Extract details safely
      const userEmail = user.email || user.providerData[0]?.email;
      const userName = user.displayName || user.providerData[0]?.displayName;

      if (!userEmail) throw new Error("No email found from Google.");

      // Step B: Send to Backend via Mutation
      googleLoginMutation.mutate({
        name: userName || "Google User",
        email: userEmail,
        googleId: user.uid,
        role: "student" // Default role, backend can override if user exists
      });

    } catch (err) {
      console.error("Firebase Error:", err);
      Swal.fire('Error', 'Google Sign-In was cancelled or failed.', 'error');
    }
  };

  const isLoading = loginMutation.isPending || googleLoginMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-white px-4">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
      >
        <div className="p-8 md:p-10">
          
          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <LogIn size={24} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Login to manage your tuition journey</p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-5">
            
            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-gray-50 focus:bg-white"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              <div className="flex justify-end mt-2">
                <a href="/forgot-password" className="text-sm text-emerald-600 hover:underline font-medium">
                  Forgot Password?
                </a>
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Login <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-sm text-gray-400 font-medium">OR</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {/* GOOGLE LOGIN */}
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 border border-gray-200 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
          >
            {googleLoginMutation.isPending ? (
               <span className="text-sm">Connecting...</span>
            ) : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </button>

          {/* REGISTER LINK */}
          <div className="mt-8 text-center text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-emerald-600 font-bold hover:underline">
              Register
            </a>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default Login;