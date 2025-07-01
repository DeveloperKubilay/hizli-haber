import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signInWithGoogle, logoutUser } from '../services/authService';
import { auth } from '../services/firebase';
// eslint-disable-next-line no-unused-vars
import { LogIn, Newspaper, Search, BookMarked, User, Bookmark, LogOut, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { CATEGORY_ICONS, NAVBAR_CATEGORIES } from '../services/categories';

function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const timeoutRef = useRef(null);
  const userTimeoutRef = useRef(null);
  const location = useLocation();

  // Artık kategoriler tamamen dinamik - categories.js'den geliyor!
  const categories = NAVBAR_CATEGORIES;

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
      if (userTimeoutRef.current) {
        clearTimeout(userTimeoutRef.current);
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

  // User dropdown handlers
  const handleUserMouseEnter = () => {
    if (userTimeoutRef.current) {
      clearTimeout(userTimeoutRef.current);
    }
    setShowUserDropdown(true);
  };

  const handleUserMouseLeave = () => {
    userTimeoutRef.current = setTimeout(() => {
      setShowUserDropdown(false);
    }, 300);
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
    const isActive = location.pathname === href;
    const baseClasses = "flex items-center gap-2 md:gap-3 text-sm md:text-base text-opacity-100 font-medium py-2 md:py-3 px-4 md:px-6 rounded-lg transition-all duration-200";
    const activeClasses = isActive 
      ? "bg-secondaryBG text-textHeading hover:bg-selectBox hover:text-white" 
      : "hover:text-white hover:bg-blackSelectHover";
    
    return (
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: delay, ease: "easeOut" }}
      >
        <Link to={href} className={`${baseClasses} ${activeClasses}`}>
          {React.cloneElement(icon, { size: window.innerWidth >= 768 ? 20 : 18 })}
          {name}
        </Link>
      </motion.div>
    );
  };

  return (
    <motion.header 
      className="max-w-7xl mx-auto py-4 md:py-6 px-4 sm:px-6 lg:px-8 relative z-10"
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
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/imgs/logo.png"
              alt="Logo"
              className="h-10 md:h-12 w-auto" // 🔥 Responsive logo boyutu
            />
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-opacity-100 text-shadow text-[#ecf9fb]">hızlı haber</h1>
          </Link>
        </motion.div>

        <nav className="flex space-x-2 md:space-x-4 items-center">
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
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            >
              <Link to="/haberler" className="flex items-center gap-2 md:gap-3 text-sm md:text-base text-opacity-100 font-medium py-2 md:py-3 px-4 md:px-6 rounded-lg transition-all duration-200 hover:text-white hover:bg-blackSelectHover">
                <Newspaper size={window.innerWidth >= 768 ? 20 : 18} />
                Haberler
              </Link>
            </motion.div>
            
            {/* Kategoriler dropdown menüsü 🔥 */}
            {showCategories && (
              <motion.div 
                className="absolute top-full left-0 mt-0.5 bg-blackSelectBg backdrop-blur-sm shadow-xl rounded-lg py-4 px-5 z-20 border-2 border-blackSelectHover w-[320px] md:w-[400px] h-auto overflow-auto scrollbar-none origin-top-left" // 🔥 Responsive boyut
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
                        className={`flex items-center gap-1.5 text-white hover:opacity-90 text-xs md:text-sm rounded-full px-3 md:px-4 py-1.5 md:py-2 transition-all duration-200 ${category.bgColor}`}
                      >
                        {CATEGORY_ICONS[category.name]}
                        {category.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
          {aGroup("Bir Haber ara", "/haberler?focus=search", <Search size={16} />, 0.5)}
        </nav>

        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
        >
          {currentUser ? (
            <div className="relative">
              <motion.div
                ref={userDropdownRef}
                onMouseEnter={handleUserMouseEnter}
                onMouseLeave={handleUserMouseLeave}
                className="flex items-center space-x-3 md:space-x-4 cursor-pointer"
              >
                <div className="flex items-center">
                  {currentUser.photoURL && !imageError ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Profile"
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full mr-3"
                      onError={handleImageError}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center text-gray-600 text-sm md:text-base">
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="text-sm md:text-base font-medium text-opacity-100 hidden sm:block">
                    {currentUser.displayName || currentUser.email}
                  </span>
                </div>
                <ChevronDown size={16} className="text-textPrimary" />
              </motion.div>

              {/* User Dropdown Menu */}
              {showUserDropdown && (
                <motion.div
                  className="absolute top-full right-0 mt-2 bg-blackSelectBg backdrop-blur-sm shadow-xl rounded-lg py-2 px-2 z-20 border-2 border-blackSelectHover w-[200px] origin-top-right"
                  onMouseEnter={handleUserMouseEnter}
                  onMouseLeave={handleUserMouseLeave}
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="space-y-1">
                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Link
                        to="/kaydettigim-haberler"
                        className="flex items-center gap-3 text-white hover:bg-blackSelectHover rounded-lg px-3 py-2 transition-colors"
                      >
                        <Bookmark size={24} />
                        <span className="text-sm font-medium">Kaydettiğim Haberler</span>
                      </Link>
                    </motion.div>
                    
                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 text-white hover:bg-red-600 rounded-lg px-3 py-2 transition-colors w-full text-left"
                      >
                        <LogOut size={20} />
                        <span className="text-sm font-medium">Çıkış Yap</span>
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div>
              <button
                onClick={handleSignIn}
                className="flex items-center gap-2 bg-secondary text-black rounded-lg shadow-sm px-4 md:px-6 py-2 md:py-3 hover:bg-secondaryHover font-bold text-sm md:text-base"
              >
                <LogIn size={window.innerWidth >= 768 ? 20 : 18} strokeWidth={2} />
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