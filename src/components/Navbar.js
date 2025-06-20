import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { signInWithGoogle, logoutUser } from '../services/authService';
import { auth } from '../services/firebase';
import { LogIn } from "lucide-react";

function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  // Kategori listesi - istediğin gibi değiştirebilirsin 💯
  const categories = [
    "Teknoloji", "Yemek", "Spor", "Ekonomi", "Siyaset", 
    "Sağlık", "Bilim", "Kültür", "Sanat", "Eğitim"
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowCategories(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowCategories(false);
    }, 300); // 300ms delay before hiding the menu
  };

  const handleSignIn = useCallback(async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign-in failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  const handleSignOut = useCallback(async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      await logoutUser();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  const handleImageError = (e) => {
    console.error("Image failed to load:", e);
    console.log("Image URL that failed:", currentUser?.photoURL);
    setImageError(true);
  };

  return (
    <header className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="/imgs/logo.png"
            alt="Logo"
            className="h-10 w-auto"
          />
          <h1 className="text-2xl font-bold text-opacity-100 text-shadow text-[#ecf9fb]">hızlı haber</h1>
        </Link>

        <nav className="flex space-x-3 items-center">
          <Link to="/haberler" className="text-sm text-opacity-100 hover:text-opacity-80 font-medium">
            Son Haberler
          </Link>
          <div 
            className="relative group"
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Link to="/about" className="text-sm text-opacity-100 hover:text-opacity-80 font-medium">
              Haberler
            </Link>
            
            {/* Kategoriler dropdown menüsü 🔥 */}
            {showCategories && (
              <div 
                className="absolute top-full left-0 mt-0.5 bg-gray-800/95 backdrop-blur-sm shadow-xl rounded-lg py-3 px-4 z-20 border border-gray-700 w-[320px] h-auto overflow-auto"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <h3 className="font-bold text-gray-200 mb-2 text-sm border-b border-gray-700 pb-1">KATEGORİLER 📚</h3>
                
                <div className="flex flex-wrap gap-2">
                  {categories.map((category, index) => (
                    <Link 
                      key={index}
                      to={`/kategori/${category.toLowerCase()}`}
                      className="bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs rounded-full px-3 py-1.5 transition-all"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link to="/about" className="text-sm text-opacity-100 hover:text-opacity-80 font-medium">
            Bir Haber ara
          </Link>
        </nav>

        <div>
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {currentUser.photoURL && !imageError ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Profile"
                    className="w-8 h-8 rounded-full mr-3"
                    onError={handleImageError}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 mr-3 flex items-center justify-center text-gray-600">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span className="text-sm font-medium text-opacity-100">
                  {currentUser.displayName || currentUser.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1 px-3 rounded shadow-md"
              >
                Çıkış Yap
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={handleSignIn}
                className="flex items-center gap-2 bg-secondary text-black rounded-lg shadow-sm px-[10px] py-[6px] text-lg hover:bg-secondaryHover font-bold"
              >
                <LogIn size={28} strokeWidth={2.5} />
                Giriş yap
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


export default Navbar;
