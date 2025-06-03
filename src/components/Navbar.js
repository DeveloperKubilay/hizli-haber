import React from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function Navbar({ currentUser }) {
  const handleSignOut = () => {
    signOut(auth).catch((error) => {
      console.error("Error signing out:", error);
    });
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/">
            <h1 className="text-2xl font-bold text-gray-900">My Blog</h1>
          </Link>
          
          <div>
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {currentUser.photoURL && (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full mr-2"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {currentUser.displayName || currentUser.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1 px-3 rounded"
                >
                  Çıkış Yap
                </button>
              </div>
            ) : (
              <div className="signin-wrapper">
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
