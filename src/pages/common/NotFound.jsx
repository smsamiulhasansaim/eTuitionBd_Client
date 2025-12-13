import React, { useState, useEffect } from 'react';
import { Search, Home, MapPin, Compass, Ghost, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isSearching, setIsSearching] = useState(false);
  const [searchAttempts, setSearchAttempts] = useState(0);
  const [ghostVisible, setGhostVisible] = useState(true);

  useEffect(() => {
    const moveGhost = setInterval(() => {
      setPosition({
        x: Math.random() * 20 - 10,
        y: Math.random() * 20 - 10
      });
    }, 2000);
    return () => clearInterval(moveGhost);
  }, []);

  useEffect(() => {
    const ghostInterval = setInterval(() => {
      setGhostVisible(prev => !prev);
    }, 3000);
    return () => clearInterval(ghostInterval);
  }, []);

  const handleSearch = () => {
    setIsSearching(true);
    setSearchAttempts(prev => prev + 1);
    setTimeout(() => setIsSearching(false), 2000);
  };

  const getSearchMessage = () => {
    if (searchAttempts === 0) return "খুঁজে দেখুন...";
    if (searchAttempts === 1) return "এখনও খুঁজছি... 🔍";
    if (searchAttempts === 2) return "কিছু পাচ্ছি না... 😅";
    if (searchAttempts === 3) return "আসলেই নেই! 🤷‍♂️";
    return "হাল ছাড়ুন! 😂";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-8xl opacity-10 animate-pulse">4</div>
        <div className="absolute top-20 right-20 text-8xl opacity-10 animate-pulse" style={{animationDelay: '0.5s'}}>0</div>
        <div className="absolute bottom-20 left-1/4 text-8xl opacity-10 animate-pulse" style={{animationDelay: '1s'}}>4</div>
        
        {/* Moving Stars */}
        <div className="absolute top-1/4 left-1/3 text-yellow-300 text-2xl animate-bounce">⭐</div>
        <div className="absolute top-1/3 right-1/4 text-yellow-300 text-xl animate-bounce" style={{animationDelay: '0.7s'}}>✨</div>
        <div className="absolute bottom-1/3 left-1/2 text-yellow-300 text-3xl animate-bounce" style={{animationDelay: '1.4s'}}>💫</div>
      </div>

      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center relative">
        
        {/* Animated Ghost/Character */}
        <div 
          className="relative inline-block mb-8 transition-all duration-500"
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px)`,
            opacity: ghostVisible ? 1 : 0.3
          }}
        >
          <div className="text-9xl animate-bounce">
            👻
          </div>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap">
            আমি হারিয়ে গেছি!
          </div>
        </div>

        {/* 404 Error */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4 animate-pulse">
            404
          </h1>
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              ওহ! পেজ খুঁজে পাওয়া যায়নি! 🤔
            </h2>
            <p className="text-lg text-gray-600">
              আপনি যে পেজটি খুঁজছেন সেটি হারিয়ে গেছে!
            </p>
          </div>
        </div>

        {/* Funny Messages */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-8">
          <div className="space-y-3">
            <p className="text-gray-700 flex items-center justify-center">
              <MapPin className="mr-2 text-red-500" size={20} />
              <span>এই পেজ অন্য কোন মহাবিশ্বে চলে গেছে 🌌</span>
            </p>
            <p className="text-gray-700 flex items-center justify-center">
              <Ghost className="mr-2 text-purple-500" size={20} />
              <span>অথবা ভূত হয়ে গেছে! 👻</span>
            </p>
            <p className="text-gray-700 flex items-center justify-center">
              <Compass className="mr-2 text-blue-500" size={20} />
              <span>হয়তো URL টা ভুল লিখেছেন? 🤷</span>
            </p>
          </div>
        </div>



        {/* Suggestions Box */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center">
            <span className="mr-2">💡</span>
            এখন কি করবেন?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">✅</span>
              <span className="text-gray-700">URL চেক করুন</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">✅</span>
              <span className="text-gray-700">হোমপেজে ফিরে যান</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">✅</span>
              <span className="text-gray-700">সার্চ করুন</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">✅</span>
              <span className="text-gray-700">চা খান ☕</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center">
            <Home className="mr-2" size={20} />
            হোমপেজে যান
          </button>
          <button className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center">
            <ArrowLeft className="mr-2" size={20} />
            পেছনে ফিরুন
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t-2 border-gray-200">
          <p className="text-gray-500 text-sm mb-2">
            চিন্তা করবেন না, সবাই মাঝে মাঝে হারিয়ে যায়! 🗺️
          </p>
          <p className="text-gray-400 text-xs">
            Error Code: 404 | Page Not Found
          </p>
        </div>
      </div>
    </div>
  );
}