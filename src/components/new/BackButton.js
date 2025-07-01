import React from 'react';
import { ArrowLeft } from 'lucide-react';

function BackButton({ navigate }) {
  return (
    <div className="mb-6">
      <button
        onClick={() => navigate('/haberler')}
        className="flex items-center gap-2 text-textPrimary hover:text-textHeading transition-colors"
      >
        <ArrowLeft size={20} />
        Haberlere Dön
      </button>
    </div>
  );
}

export default BackButton;
