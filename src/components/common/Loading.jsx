import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Coffee, BookOpen, Lightbulb } from 'lucide-react';

const funnyMessages = [
  "অঙ্কের 'x' এর মান খোঁজা হচ্ছে...",
  "না পড়ে কীভাবে পাস করা যায় তার ফর্মুলা বের করা হচ্ছে...",
  "কড়া টিচারকে শান্ত করা হচ্ছে...",
  "আপনার ব্রেইনের জন্য আরও RAM ডাউনলোড করা হচ্ছে...",
  "যেই টিচার হোমওয়ার্ক দেয় না তাকে খোঁজা হচ্ছে...",
  "সার্ভারকে এক কাপ চা খাওয়ানো হচ্ছে...",
  "ডেভেলপারের কারেন্ট চলে গেছে, জেনারেটর চালানো হচ্ছে...",
  "দাঁড়ান, আপনি কি গতকালের পড়া কমপ্লিট করেছেন?",
];

const icons = [Brain, Coffee, BookOpen, Lightbulb];

const Loading = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % funnyMessages.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const CurrentIcon = icons[index % icons.length];

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white text-center px-4">
      
      {/* --- Bouncing Icon Animation --- */}
      <motion.div
        key={index}
        initial={{ y: 0, rotate: 0 }}
        animate={{ 
          y: [-10, 10, -10],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ 
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity
        }}
        className="mb-8 p-6 bg-emerald-50 rounded-full text-emerald-600"
      >
        <CurrentIcon size={48} />
      </motion.div>

      {/* --- Changing Funny Text (Bengali) --- */}
      <div className="h-16 flex items-center justify-center"> {/* Height fixed to prevent layout jump */}
        <AnimatePresence mode='wait'>
          <motion.h2
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-xl md:text-2xl font-bold text-gray-700 font-bengali" // Add a bangla font class if needed
          >
            {funnyMessages[index]}
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* --- Progress Bar --- */}
      <div className="mt-8 w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.5, 
            ease: "linear" 
          }}
          className="w-full h-full bg-emerald-500 rounded-full opacity-50"
        />
      </div>

      <p className="mt-4 text-xs text-gray-400 font-mono">
        দয়া করে অপেক্ষা করুন...
      </p>

    </div>
  );
};

export default Loading;