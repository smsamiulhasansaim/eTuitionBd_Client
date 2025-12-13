import React, { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { Users, CheckCircle, MapPin, Trophy, Target, Eye, Shield, Clock, BookOpen } from 'lucide-react';

// --- Animated Counter Component ---
const Counter = ({ value, suffix = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 3000 });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest) + suffix;
      }
    });
  }, [springValue, suffix]);

  return <span ref={ref} className="font-bold text-4xl text-emerald-600" />;
};

const About = () => {
  return (
    <div className="bg-white min-h-screen pt-24 pb-12">
      
      {/* 1 & 2. Hero / Intro Section */}
      <section className="container mx-auto px-4 md:px-8 mb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Bangladesh’s Most Trusted <br />
            <span className="text-emerald-600">Tuition Platform</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We connect students with verified tutors across the country. Whether you need help with academic studies, admission tests, or skill development, eTuitionBD is here to ensure quality education at your doorstep.
          </p>
        </motion.div>
      </section>

      {/* 3. Statistics / Counter Section */}
      <section className="bg-emerald-50 py-16 mb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            
            {/* Stat 1 */}
            <div className="space-y-2">
              <div className="flex justify-center text-emerald-600 mb-2"><Users size={32}/></div>
              <Counter value={10000} suffix="+" />
              <p className="text-gray-600 font-medium">Total Students</p>
            </div>

            {/* Stat 2 */}
            <div className="space-y-2">
              <div className="flex justify-center text-emerald-600 mb-2"><CheckCircle size={32}/></div>
              <Counter value={2500} suffix="+" />
              <p className="text-gray-600 font-medium">Verified Tutors</p>
            </div>

            {/* Stat 3 */}
            <div className="space-y-2">
              <div className="flex justify-center text-emerald-600 mb-2"><Trophy size={32}/></div>
              <Counter value={8000} suffix="+" />
              <p className="text-gray-600 font-medium">Successful Hires</p>
            </div>

            {/* Stat 4 */}
            <div className="space-y-2">
              <div className="flex justify-center text-emerald-600 mb-2"><MapPin size={32}/></div>
              <Counter value={64} suffix="" />
              <p className="text-gray-600 font-medium">Districts Covered</p>
            </div>

          </div>
        </div>
      </section>

      {/* 4 & 5. Mission & Vision Section */}
      <section className="container mx-auto px-4 md:px-8 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Mission */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-emerald-200 transition-colors"
          >
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6">
              <Target size={32} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To make quality education accessible to every corner of Bangladesh. We aim to bridge the gap between eager learners and skilled educators through a transparent, safe, and efficient digital platform.
            </p>
          </motion.div>

          {/* Vision */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-emerald-200 transition-colors"
          >
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
              <Eye size={32} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              A Bangladesh where every student finds the perfect mentor to unlock their potential, and every capable teacher finds a platform to share their knowledge and earn respectfully.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 6. Why Choose Us (Compact) */}
      <section className="bg-gray-900 py-16 mb-20 text-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose eTuitionBD?</h2>
            <p className="text-gray-400">We prioritize security and quality above all else.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-gray-800 rounded-xl hover:bg-gray-750 transition-colors">
              <Shield className="text-emerald-500 mb-4" size={40} />
              <h3 className="text-xl font-semibold mb-2">Verified Tutors</h3>
              <p className="text-sm text-gray-400">Every tutor undergoes a strict background check.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-gray-800 rounded-xl hover:bg-gray-750 transition-colors">
              <Clock className="text-emerald-500 mb-4" size={40} />
              <h3 className="text-xl font-semibold mb-2">Fast Service</h3>
              <p className="text-sm text-gray-400">Post a tuition and get responses within 24 hours.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-gray-800 rounded-xl hover:bg-gray-750 transition-colors">
              <BookOpen className="text-emerald-500 mb-4" size={40} />
              <h3 className="text-xl font-semibold mb-2">All Subjects</h3>
              <p className="text-sm text-gray-400">From Class 1 to University level, we cover it all.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Team Section */}
      <section className="container mx-auto px-4 md:px-8 mb-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">Meet Our Team</h2>
          <p className="text-gray-500 mt-2">The people working behind the scenes</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Team Member 1 */}
          <TeamCard 
            img="https://i.ibb.co.com/fYrBgW2B/S-M-Samiul-hasan.jpg"
            name="S M Samiul Hasan"
            role="Founder & CEO"
          />
          {/* Team Member 2 */}
          <TeamCard 
            img="https://i.ibb.co.com/twtrH4X3/employee.png"
            name="Sarah Ahmed"
            role="Head of Operations"
          />
          {/* Team Member 3 */}
          <TeamCard 
            img="https://i.ibb.co.com/twtrH4X3/employee.png"
            name="Rahim Uddin"
            role="Senior Developer"
          />
           {/* Team Member 4 */}
           <TeamCard 
            img="https://i.ibb.co.com/twtrH4X3/employee.png"
            name="Nusrat Jahan"
            role="HR Manager"
          />
        </div>
      </section>

    </div>
  );
};

// Helper Component for Team Cards
const TeamCard = ({ img, name, role }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
    className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 group"
  >
    <div className="h-64 overflow-hidden">
      <img 
        src={img} 
        alt={name} 
        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" 
      />
    </div>
    <div className="p-4 text-center">
      <h3 className="font-bold text-lg text-gray-800">{name}</h3>
      <p className="text-emerald-600 text-sm font-medium">{role}</p>
    </div>
  </motion.div>
);

export default About;