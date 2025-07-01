import React from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';

function LoadingState() {
  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="animate-pulse">
          <div className="h-8 bg-primary rounded mb-4"></div>
          <div className="h-64 bg-primary rounded mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-primary rounded w-3/4"></div>
            <div className="h-4 bg-primary rounded w-1/2"></div>
            <div className="h-4 bg-primary rounded w-5/6"></div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default LoadingState;
