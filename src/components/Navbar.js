import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { signInWithGoogle, logoutUser } from '../services/authService';
import { auth } from '../services/firebase';
import { LogIn, Newspaper, Search, BookMarked, Cpu, Utensils, Trophy, BarChart2, Building, Heart, Atom, Globe, Palette, GraduationCap } from "lucide-react";
import { motion } from "motion/react";

function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  const categories = [
    {
      name: "Teknoloji",
      href: "/kategori/teknoloji",
      icon: <Cpu size={16} />,
      bgColor: "bg-blue-600",
    },
    {
      name: "Yemek", 
      href: "/kategori/yemek",
      icon: <Utensils size={16} />,
      bgColor: "bg-green-600",
    },
    {
      name: "Spor",
      href: "/kategori/spor", 
      icon: <Trophy size={16} />,
      bgColor: "bg-red-600",
    },
    {
      name: "Ekonomi",
      href: "/kategori/ekonomi",
      icon: <BarChart2 size={16} />,
      bgColor: "bg-amber-600", 
    },
    {
      name: "Siyaset",
      href: "/kategori/siyaset",
      icon: <Building size={16} />,
      bgColor: "bg-purple-600",
    },
    {
      name: "Sağlık", 
      href: "/kategori/saglik",
      icon: <Heart size={16} />,
      bgColor: "bg-pink-600",
    },
    {
      name: "Bilim",
      href: "/kategori/bilim",
      icon: <Atom size={16} />,
      bgColor: "bg-indigo-600",
    },
    {
      name: "Kültür",
      href: "/kategori/kultur", 
      icon: <Globe size={16} />,
      bgColor: "bg-orange-600",
    },
    {
      name: "Sanat",
      href: "/kategori/sanat",
      icon: <Palette size={16} />,
      bgColor: "bg-teal-600",
    },
    {
      name: "Eğitim",
      href: "/kategori/egitim",
      icon: <GraduationCap size={16} />,
      bgColor: "bg-cyan-600",
    }
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

  const aGroup = function(name, href, icon, delay = 0) {
    return (
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: delay, ease: "easeOut" }}
      >
        <Link to={href} className="flex items-center gap-1 text-sm text-opacity-100 hover:text-textHover hover:bg-blackSelectHover font-medium py-2 px-3 rounded-lg">
          {icon}
          {name}
        </Link>
      </motion.div>
    );
  };

  return (
    <motion.header 
      className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 relative z-10"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex justify-between items-center">
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/imgs/logo.png"
              alt="Logo"
              className="h-8 w-auto"
            />
            <h1 className="text-2xl font-bold text-opacity-100 text-shadow text-[#ecf9fb]">hızlı haber</h1>
          </Link>
        </motion.div>

        <nav className="flex space-x-3 items-center">
          {aGroup("Son Haberler", "/haberler", <BookMarked size={16} />, 0.3)}
          <motion.div 
            className="relative group"
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          >
            {aGroup("Haberler", "/about", <Newspaper size={16} />, 0)}
            
            {/* Kategoriler dropdown menüsü 🔥 */}
            {showCategories && (
              <motion.div 
                className="absolute top-full left-0 mt-0.5 bg-blackSelectBg backdrop-blur-sm shadow-xl rounded-lg py-3 px-4 z-20 border-2 border-blackSelectHover w-[320px] h-auto overflow-auto scrollbar-none origin-top-left"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{ 
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitScrollbar: { display: 'none' }
                }}
              >
                <div className="flex flex-wrap gap-2">
                  {categories.map((category, index) => (
                    <motion.div
                      key={index}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Link 
                        to={category.href}
                        className={`flex items-center gap-1.5 text-white hover:opacity-90 text-xs rounded-full px-3 py-1.5 transition-all duration-200 ${category.bgColor}`}
                      >
                        {category.icon}
                        {category.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
          {aGroup("Bir Haber ara", "/about", <Search size={16} />, 0.5)}
        </nav>

        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
        >
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
                className="flex items-center gap-2 bg-secondary text-black rounded-lg shadow-sm px-[10px] py-[6px] hover:bg-secondaryHover font-bold"
              >
                <LogIn size={18} strokeWidth={2} />
                Giriş yap
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.header>
  );
}

export default Navbar;