import React from 'react';
import HeroSection from '../../../components/partials/HeroSection';
import LatestTuitions from '../../../components/partials/LatestTuitions';
import LatestTutors from '../../../components/partials/LatestTutors';
import HowItWorks from '../../../components/partials/HowItWorks';
import WhyChooseUs from '../../../components/partials/WhyChooseUs';

const Home = () => {
    return (
        <>
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Latest Tuitions */}
      <LatestTuitions />

      {/* 3. Latest Tutors */}
      <LatestTutors />

      {/* 4. How It Works */}
      <HowItWorks/>

      {/* 5. Why Choose Us */}
      <WhyChooseUs />
    </>
    );
};

export default Home;