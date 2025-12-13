import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, Eye, EyeOff, AlertTriangle, Key } from 'lucide-react';

export default function Unauthorized() {
  const [shakeKey, setShakeKey] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [lockRotation, setLockRotation] = useState(0);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLockRotation(prev => {
        const newRotation = prev + 2;
        return newRotation >= 20 ? -20 : newRotation;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleTryAccess = () => {
    setAttempts(prev => prev + 1);
    setShakeKey(true);
    setShowAlert(true);
    setTimeout(() => setShakeKey(false), 500);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const getDeniedMessage = () => {
    const messages = [
      "দুঃখিত! এই এলাকা নিষিদ্ধ! 🚫",
      "অ্যাক্সেস ডিনাইড! আবার চেষ্ট করবেন না! 😤",
      "এই পেজ আপনার জন্য নয়! 🙅‍♂️",
      "ফিরে যান! এখানে কিছু নেই! 👮",
      "সিরিয়াসলি? আবার? 🤦‍♂️"
    ];
    return messages[Math.min(attempts, messages.length - 1)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-bounce">🔒</div>
        <div className="absolute top-40 right-20 text-5xl opacity-20 animate-bounce" style={{animationDelay: '0.5s'}}>🚫</div>
        <div className="absolute bottom-20 left-1/4 text-7xl opacity-20 animate-bounce" style={{animationDelay: '1s'}}>⛔</div>
        <div className="absolute bottom-40 right-1/3 text-5xl opacity-20 animate-bounce" style={{animationDelay: '1.5s'}}>🔐</div>
      </div>

      {/* Alert Toast */}
      {showAlert && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-bounce">
          <div className="flex items-center space-x-3">
            <AlertTriangle size={24} />
            <span className="font-bold">অ্যাক্সেস ডিনাইড!</span>
          </div>
        </div>
      )}

      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center relative">
        
        {/* Main Lock Icon */}
        <div className={`relative inline-block mb-6 ${shakeKey ? 'animate-bounce' : ''}`}>
          <div 
            className="relative"
            style={{ transform: `rotate(${lockRotation}deg)` }}
          >
            <Lock 
              size={120} 
              className="text-red-600 mx-auto"
            />
            <ShieldAlert 
              size={40} 
              className="absolute -top-2 -right-2 text-orange-500 animate-pulse"
            />
          </div>
        </div>

        {/* Error Code */}
        <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 mb-6">
          <h1 className="text-6xl md:text-8xl font-bold text-red-600 mb-2">
            401
          </h1>
          <p className="text-xl text-red-700 font-semibold">
            Unauthorized Access
          </p>
        </div>

        {/* Main Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          {getDeniedMessage()}
        </h2>

        <p className="text-lg text-gray-600 mb-6">
          এই পেজ দেখার অনুমতি আপনার নেই। 
        </p>

        {/* Funny Messages Box */}
        <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl p-6 mb-8">
          <div className="space-y-3 text-left">
            <p className="text-gray-700 flex items-start">
              <span className="mr-2">🔑</span>
              <span>আপনার কাছে সঠিক পারমিশন নেই</span>
            </p>
            <p className="text-gray-700 flex items-start">
              <span className="mr-2">👮</span>
              <span>অ্যাডমিন হলে লগইন করুন</span>
            </p>
            <p className="text-gray-700 flex items-start">
              <span className="mr-2">🚪</span>
              <span>নয়তো ফিরে যান যেখান থেকে এসেছেন</span>
            </p>
          </div>
        </div>

        {/* Fake Password Input (for fun) */}
        <div className="mb-6">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              placeholder="পাসওয়ার্ড লিখুন (কাজ হবে না 😏)"
              className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-gray-700"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Try Access Button */}
        <button
          onClick={handleTryAccess}
          className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg mb-6"
        >
          <Key className="inline-block mr-2" size={24} />
          অ্যাক্সেস চেষ্টা করুন
        </button>

        {/* Attempt Counter */}
        {attempts > 0 && (
          <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-semibold">
              ⚠️ ব্যর্থ প্রচেষ্টা: {attempts} বার
              {attempts >= 3 && " (দয়া করে থামুন! 😅)"}
              {attempts >= 5 && " (এখনও চেষ্টা করছেন? 🤦)"}
              {attempts >= 10 && " (আপনি হাল ছাড়েন না তাই না? 😂)"}
            </p>
          </div>
        )}

        {/* Status Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-red-50 rounded-xl p-4">
            <div className="text-3xl mb-2">🚫</div>
            <div className="text-sm text-gray-600">অ্যাক্সেস</div>
            <div className="text-lg font-bold text-red-600">ডিনাইড</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4">
            <div className="text-3xl mb-2">👤</div>
            <div className="text-sm text-gray-600">ইউজার স্ট্যাটাস</div>
            <div className="text-lg font-bold text-orange-600">অনুমোদিত নয়</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-sm text-gray-600">সময়</div>
            <div className="text-lg font-bold text-yellow-600">এখনই</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all">
            ← হোমপেজে ফিরুন
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all">
            লগইন করুন
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t-2 border-gray-200">
          <p className="text-gray-500 text-sm">
            যদি মনে করেন এটি একটি ভুল, অ্যাডমিনের সাথে যোগাযোগ করুন
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Error Code: 401 | Unauthorized Access Attempt
          </p>
        </div>
      </div>
    </div>
  );
}