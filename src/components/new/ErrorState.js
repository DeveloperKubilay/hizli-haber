import React from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';

function ErrorState({ error, navigate }) {
  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-6 text-center">
        <h1 className="text-2xl font-bold text-textHeading mb-4">Hata</h1>
        <p className="text-textPrimary mb-6">{error}</p>
        <button
          onClick={() => navigate('/haberler')}
          className="bg-secondary hover:bg-secondaryHover text-white px-6 py-2 rounded-lg transition-colors"
        >
          Haberlere Dön
        </button>
      </div>
      <Footer />
    </>
  );
}

export default ErrorState;
