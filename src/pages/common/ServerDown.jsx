import React, { useState, useEffect } from 'react';
import { Server, Wifi, Coffee, AlertCircle, Zap, Heart } from 'lucide-react';

export default function ServerDown() {
  const [rotation, setRotation] = useState(0);
  const [coffeeCount, setCoffeeCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [bugs, setBugs] = useState([]);
  const [serverMood, setServerMood] = useState('😴');

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Progress bar effect
  useEffect(() => {
    if (isWakingUp && progress < 100) {
      const timer = setTimeout(() => {
        setProgress(prev => Math.min(prev + 1, 100));
      }, 100);
      return () => clearTimeout(timer);
    }
    if (progress === 100) {
      setTimeout(() => {
        setServerMood('😊');
      }, 500);
    }
  }, [isWakingUp, progress]);

  // Bug game spawner
  useEffect(() => {
    if (coffeeCount >= 3) {
      const interval = setInterval(() => {
        if (bugs.length < 5) {
          const newBug = {
            id: Date.now(),
            x: Math.random() * 80 + 10,
            y: Math.random() * 60 + 10
          };
          setBugs(prev => [...prev, newBug]);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [coffeeCount, bugs.length]);

  const handleCoffeeClick = () => {
    const newCount = coffeeCount + 1;
    setCoffeeCount(newCount);
    
    if (newCount === 3) {
      setServerMood('😊');
    } else if (newCount === 5) {
      setServerMood('😄');
      setIsWakingUp(true);
    } else if (newCount === 10) {
      setServerMood('🤩');
    }
  };

  const handleBugClick = (bugId) => {
    setBugs(prev => prev.filter(bug => bug.id !== bugId));
    setGameScore(prev => prev + 10);
    setProgress(prev => Math.min(prev + 5, 100));
  };

  const getProgressMessage = () => {
    if (progress < 25) return 'সার্ভার চোখ কচলাচ্ছে...';
    if (progress < 50) return 'সার্ভার উঠে বসছে...';
    if (progress < 75) return 'সার্ভার কফি পান করছে...';
    if (progress < 100) return 'সার্ভার প্রায় তৈরি...';
    return 'সার্ভার সম্পূর্ণ জেগে গেছে! 🎉';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Bug Game Elements */}
      {bugs.map(bug => (
        <button
          key={bug.id}
          onClick={() => handleBugClick(bug.id)}
          className="absolute w-8 h-8 text-2xl animate-bounce cursor-pointer hover:scale-125 transition-transform"
          style={{ left: `${bug.x}%`, top: `${bug.y}%` }}
        >
          🐛
        </button>
      ))}

      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center relative overflow-hidden">
        
        {/* Floating particles */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-10 left-10 w-3 h-3 bg-yellow-300 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-20 right-20 w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-20 left-20 w-4 h-4 bg-green-300 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        </div>

        {/* Game Score */}
        {coffeeCount >= 3 && (
          <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
            <Zap className="inline-block mr-1" size={16} />
            স্কোর: {gameScore}
          </div>
        )}

        {/* Main Icon with Mood */}
        <div className="relative inline-block mb-6">
          <Server 
            size={120} 
            className={`mx-auto transition-colors duration-500 ${progress === 100 ? 'text-green-500' : 'text-red-500'}`}
            style={{ transform: `rotate(${rotation}deg)` }}
          />
          <Wifi 
            size={40} 
            className={`absolute -top-2 -right-2 transition-colors duration-500 ${progress === 100 ? 'text-green-500' : 'text-gray-400'} animate-pulse`}
          />
          <AlertCircle 
            size={40} 
            className={`absolute -bottom-2 -left-2 text-yellow-500 ${progress < 100 ? 'animate-ping' : ''}`}
          />
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-5xl">
            {serverMood}
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          {progress === 100 ? 'ইয়ে! 🎉' : 'ওহ না! 😱'}
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
          {progress === 100 ? 'সার্ভার জেগে গেছে!' : 'সার্ভার ঘুমিয়ে গেছে 😴'}
        </h2>

        {/* Funny Message */}
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6 mb-6">
          <p className="text-lg text-gray-700 mb-3">
            আমাদের সার্ভার একটু বেশি কাজ করে ফেলেছে। 
          </p>
          <p className="text-lg text-gray-700 mb-3">
            এখন সে কফি ☕ খেয়ে বিরতি নিচ্ছে!
          </p>
          {coffeeCount >= 3 && (
            <p className="text-sm text-purple-600 font-bold animate-pulse">
              🐛 বাগ দেখলে ক্লিক করে মেরে ফেলুন!
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {isWakingUp && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">
                {getProgressMessage()}
              </span>
              <span className="text-sm font-bold text-purple-600">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out flex items-center justify-end pr-2"
                style={{ width: `${progress}%` }}
              >
                {progress > 10 && (
                  <Heart className="text-white animate-pulse" size={16} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Interactive Coffee Button */}
        <div className="mb-8">
          <button
            onClick={handleCoffeeClick}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-all transform hover:scale-110 active:scale-95 shadow-lg"
          >
            <Coffee className="inline-block mr-2" size={24} />
            সার্ভারকে কফি দাও
          </button>
          {coffeeCount > 0 && (
            <p className="mt-4 text-lg text-purple-600 font-semibold animate-pulse">
              ☕ কফি দিয়েছেন: {coffeeCount} কাপ
              {coffeeCount >= 3 && " 😊 সার্ভার একটু সতেজ!"}
              {coffeeCount >= 5 && " 🚀 সার্ভার জাগছে!"}
              {coffeeCount >= 10 && " 💪 সার্ভার সুপারচার্জড!"}
            </p>
          )}
        </div>

        {/* Status Messages */}
        <div className="space-y-3 text-left bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${progress === 100 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-gray-700">
              স্ট্যাটাস: {progress === 100 ? 'অনলাইন 🎉' : 'অফলাইন'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700">টিম: সমস্যা সমাধানে ব্যস্ত</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700">কফি: {coffeeCount}/10 কাপ</span>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-8 pt-6 border-t-2 border-gray-200">
          <p className="text-gray-600 text-sm">
            {progress === 100 ? 'ধন্যবাদ! শীঘ্রই আবার চালু হবে! 🎊' : 'ধৈর্য ধরুন! আমরা শীঘ্রই ফিরে আসছি 🚀'}
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Error Code: 503 | Service Temporarily Unavailable
          </p>
        </div>
      </div>
    </div>
  );
}