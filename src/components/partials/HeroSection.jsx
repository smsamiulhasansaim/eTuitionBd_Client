import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';

const HeroSection = () => {
  // Simulation of User State 
  const isLoggedIn = true; 

  // Framer Motion Variants for Staggered Animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    },
  };

  return (
    <section className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      
      <div className="absolute inset-0 w-full h-full z-0">
        {/* High-quality education related image */}
        <img 
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
          alt="Education Background" 
          className="w-full h-full object-cover"
        />
        {/* Dark Blue-Green Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/70 to-emerald-900/80"></div>
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto px-4 z-10 relative text-center">
        
        {/* 5. FRAMER MOTION ANIMATION WRAPPER */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          
          {/* Optional Badge */}
          <motion.span 
            variants={itemVariants}
            className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm font-semibold mb-6 backdrop-blur-sm"
          >
            🚀 Bangladesh’s #1 Tuition Platform
          </motion.span>

          {/* 1. LARGE TITLE / HEADING  */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight"
          >
            Find Your Perfect <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Tutor in Minutes
            </span>
          </motion.h1>

          {/* 2. SUB-TITLE / PARAGRAPH  */}
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Post tuition jobs for free, receive applications from verified tutors, 
            hire the best match, and pay securely — all in one unified platform designed for your success.
          </motion.p>

          {/* 3. TWO BIG CTA BUTTONS  */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            {/* Button 1: Post a Tuition */}
            <a 
              href={isLoggedIn ? "/student-dashboard/post-tuition" : "/login"}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2"
            >
              Post a Tuition
              <ArrowRight size={20} />
            </a>

            {/* Button 2: Browse Tutors */}
            <a 
              href="/all-tutors"
              className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-gray-300 hover:border-white text-white hover:bg-white hover:text-gray-900 text-lg font-bold rounded-full transition-all flex items-center justify-center gap-2"
            >
              <Search size={20} />
              Browse Tutors
            </a>
          </motion.div>

          {/* Stat Count (Optional Polish) */}
          <motion.div 
            variants={itemVariants}
            className="mt-16 pt-8 border-t border-gray-700/50 flex flex-wrap justify-center gap-8 md:gap-16 text-gray-400"
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl md:text-3xl font-bold text-white">50k+</span>
              <span className="text-sm">Verified Tutors</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl md:text-3xl font-bold text-white">12k+</span>
              <span className="text-sm">Happy Students</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl md:text-3xl font-bold text-white">4.8/5</span>
              <span className="text-sm">Average Rating</span>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;